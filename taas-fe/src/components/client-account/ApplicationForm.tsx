import { useCreateApplicationMutation } from '@/hooks/mutation/useCreateApplicationMutation';
import { useUpdateApplicationMutation } from '@/hooks/mutation/useUpdateApplicationMutation';
import { useToast } from '@/hooks/useToast';
import type {
  FormMode,
  IApplication,
  IApplicationCredentials,
  IApplicationData,
  IApplicationEnvironment,
} from '@/interfaces/ClientAccount';
import {
  cn,
  makeExtId,
  mapS3Preference,
  normalizeAppType,
  normalizeBrowser,
  normalizeEnv,
} from '@/utils/util';
import { setIn, useFormik, type FormikErrors } from 'formik';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { type ISelectOption } from '../shared/select/Select';
import AppDetails from './applicationFormSteps/AppDetails';
import EnvironmentDetails from './applicationFormSteps/EnvironmentDetails';
import S3BucketAndGithubDetails from './applicationFormSteps/S3BucketAndGithubDetails';

interface IApplicationFormProps {
  onBack: () => void;
  mode?: FormMode;
  initialData?: z.infer<typeof ApplicationFormSchema> | null;
  tenantId?: string;
  existingApplication?: IApplicationData | null;
  onSuccess?: () => void;
}

// Zod schema for application form
const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.any(),
});

const EnvConfigSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const ApplicationFormSchema = z
  .object({
    // Step 1 validations
    appName: z.string().trim().min(1, 'Application name is required'),
    applicationType: SelectOptionSchema.nullable().refine((v) => v !== null, {
      message: 'Application type is required',
    }),
    appDescription: z.string().trim().optional(),
    environments: z
      .array(SelectOptionSchema)
      .min(1, 'At least one environment must be selected'),
    targetBrowsers: z.array(SelectOptionSchema).optional(),
    targetBrowsersEnv: z
      .array(SelectOptionSchema)
      .min(1, 'At least one target browser must be selected'),
    databasePreference: z.enum(['use_I2I_s3', 'bring_your_own_s3'] as const, {
      message: 'Database preference is required',
    }),

    // Step 2 validations
    S3BucketEndpoint: z.string().optional(),
    S3APIkey: z.string().optional(),
    SecretKey: z.string().optional(),
    githubRepositoryURL: z.string().trim().min(1, 'Repository URL is required'),
    githubUsername: z.string().trim().min(1, 'Username is required'),
    githubPatToken: z.string().trim().min(1, 'PAT Token is required'),

    // Step 3 validations
    environmentConfigByEnv: z.record(z.string(), EnvConfigSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.databasePreference === 'bring_your_own_s3') {
      if (!data.S3BucketEndpoint) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'S3 Bucket Endpoint is required when using your own S3 bucket',
          path: ['S3BucketEndpoint'],
        });
      }
      if (!data.S3APIkey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'S3 API Key is required when using your own S3 bucket',
          path: ['S3APIkey'],
        });
      }
      if (!data.SecretKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Secret Key is required when using your own S3 bucket',
          path: ['SecretKey'],
        });
      }
    }

    // Field-specific GitHub validation
    const repo = data.githubRepositoryURL?.trim();
    const user = data.githubUsername?.trim();
    const pat = data.githubPatToken?.trim();
    const anyGitProvided = !!repo || !!user || !!pat;

    if (anyGitProvided) {
      if (!repo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Repository URL is required when providing GitHub information',
          path: ['githubRepositoryURL'],
        });
      }
      if (!user) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Username is required when providing GitHub information',
          path: ['githubUsername'],
        });
      }
      if (!pat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAT Token is required when providing GitHub information',
          path: ['githubPatToken'],
        });
      }
    }

    if (data.environments && data.environments.length > 0) {
      for (const env of data.environments) {
        const envKey = String(env.value);
        const cfg = data.environmentConfigByEnv?.[envKey];

        const url = cfg?.url?.trim();
        const username = cfg?.username?.trim();
        const password = cfg?.password?.trim();

        if (!url) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'URL is required',
            path: ['environmentConfigByEnv', envKey, 'url'],
          });
        }
        if (!username) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Username is required',
            path: ['environmentConfigByEnv', envKey, 'username'],
          });
        }
        if (!password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password is required',
            path: ['environmentConfigByEnv', envKey, 'password'],
          });
        }
      }
    }
  })

  // FIXED: Target browsers required only for Mobile - check normalized value
  .refine(
    (data) => {
      const applicationType = String(
        data.applicationType?.value ?? ''
      ).toLowerCase();
      const isMobile = applicationType === 'mobile';
      if (!isMobile) return true;
      return (data.targetBrowsers?.length || 0) > 0;
    },
    {
      message: 'At least one target browser must be selected for Mobile apps',
      path: ['targetBrowsers'],
    }
  );

export type IApplicationFormValues = z.infer<typeof ApplicationFormSchema>;

export function ApplicationForm({
  onBack,
  mode = 'create',
  initialData,
  tenantId,
  existingApplication,
  onSuccess,
}: IApplicationFormProps) {
  const toast = useToast();

  const afterSuccess = () => {
    onBack();
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  const onCreateSuccess = () => {
    toast.success('Application created successfully');
    afterSuccess();
  };

  const onUpdateSuccess = () => {
    toast.success('Application updated successfully');
    afterSuccess();
  };

  const { createApplication, onCreateApplication } =
    useCreateApplicationMutation({
      onSuccess: onCreateSuccess,
    });

  const { updateApplication, onUpdateApplication } =
    useUpdateApplicationMutation({
      onSuccess: onUpdateSuccess,
    });

  useEffect(() => {
    if (createApplication.isError) {
      toast.error('Failed to create application');
    }
  }, [createApplication.isError, toast]);

  useEffect(() => {
    if (updateApplication?.isError) {
      toast.error('Failed to update application');
    }
  }, [updateApplication?.isError, toast]);

  // EDIT: edit-only schema with the 5 fields
  const EditSchema = z.object({
    appName: z.string().trim().min(1, 'Application name is required'),
    applicationType: SelectOptionSchema.nullable().refine((v) => v !== null, {
      message: 'Application type is required',
    }),
    appDescription: z.string().trim().optional(),
    environments: z
      .array(SelectOptionSchema)
      .min(1, 'At least one environment must be selected'),
    targetBrowsers: z.array(SelectOptionSchema).optional(),
  });

  const activeSchema = mode === 'edit' ? EditSchema : ApplicationFormSchema;

  const mapFormToApplication = (
    values: z.infer<typeof ApplicationFormSchema>
  ): IApplication => {
    const applicationType = normalizeAppType(
      String(values.applicationType?.value ?? '')
    );

    // FIXED: Only get target browser for Mobile applications
    const isMobile = applicationType === 'MOBILE';
    const envBrowser = isMobile
      ? String(values.targetBrowsers?.[0]?.value ?? 'CHROME')
      : 'CHROME'; // Default for non-mobile apps

    // If editing, preserve id/externalId and retain existing environments.
    if (mode === 'edit' && existingApplication) {
      const selectedEnvKeys = new Set(
        (values.environments || []).map((e) => String(e.value).toUpperCase())
      );

      const environments: IApplicationEnvironment[] = (
        existingApplication.environments || []
      )
        .filter(
          (env) =>
            selectedEnvKeys.size === 0 ||
            selectedEnvKeys.has(String(env.environmentType).toUpperCase())
        )
        .map((env) => ({
          ...env,
          targetBrowser: normalizeBrowser(
            envBrowser || env.targetBrowser || 'CHROME'
          ),
        })) as unknown as IApplicationEnvironment[];

      return {
        id: existingApplication.id,
        tenantId: tenantId || existingApplication.tenantId || '',
        appName: values.appName,
        appDescription: values.appDescription || '',
        notes: '', // unchanged
        applicationExternalId: existingApplication.applicationExternalId,
        applicationType,
        mobileType: applicationType === 'MOBILE' ? 'ALL' : '',
        environments,
      };
    }

    // Create mode: build full payload from form
    const environments: IApplicationEnvironment[] = (
      values.environments || []
    ).map((env) => {
      const envKey = String(env.value);
      const cfg = values.environmentConfigByEnv?.[envKey] || {
        url: '',
        username: '',
        password: '',
      };

      const credentials: IApplicationCredentials = {
        id: '',
        tenantId: tenantId || '',
        username: cfg.username,
        password: cfg.password,
        role: 'INTERNAL_QA',
        environmentId: '',
        url: cfg.url,
      };

      return {
        id: '',
        tenantId: tenantId || '',
        environmentType: normalizeEnv(envKey),
        targetBrowser: normalizeBrowser(envBrowser),
        s3BucketPreference: mapS3Preference(values.databasePreference),
        s3BucketEndpoint: values.S3BucketEndpoint || '',
        s3ApiKey: values.S3APIkey || '',
        s3SecretKey: values.SecretKey || '',
        githubRepositoryUrl: values.githubRepositoryURL,
        githubUsername: values.githubUsername,
        githubPatToken: values.githubPatToken,
        applicationId: '',
        credentials,
        url: cfg.url,
      };
    });

    const payload: IApplication = {
      id: '',
      tenantId: tenantId || '',
      appName: values.appName,
      appDescription: values.appDescription || '',
      notes: '',
      applicationExternalId: makeExtId(values.appName),
      applicationType,
      mobileType: applicationType === 'MOBILE' ? 'ALL' : '',
      environments,
    };

    return payload;
  };

  const formik = useFormik<z.infer<typeof ApplicationFormSchema>>({
    initialValues: initialData || {
      appName: '',
      applicationType: null,
      appDescription: '',
      environments: [] as ISelectOption[],
      environmentConfigByEnv: {} as Record<
        string,
        { url: string; username: string; password: string }
      >,
      S3BucketEndpoint: '',
      S3APIkey: '',
      SecretKey: '',
      githubRepositoryURL: '',
      githubUsername: '',
      githubPatToken: '',
      targetBrowsers: [] as ISelectOption[],
      databasePreference: 'use_I2I_s3',
      targetBrowsersEnv: [] as ISelectOption[],
    },
    validate: (values) => {
      const result = activeSchema.safeParse(values);
      if (result.success) return {};

      let errors: FormikErrors<z.infer<typeof ApplicationFormSchema>> = {};

      for (const issue of result.error.issues) {
        const pathArr = (issue.path.length ? issue.path : []) as (
          | string
          | number
        )[];
        const pathStr = pathArr.reduce<string>((acc, seg) => {
          return typeof seg === 'number'
            ? `${acc}[${seg}]`
            : acc
              ? `${acc}.${seg}`
              : String(seg);
        }, '');
        errors = setIn(errors, pathStr, issue.message);
      }

      return errors;
    },
    validateOnMount: false,
    onSubmit: async (values) => {
      const payload = mapFormToApplication(values);
      if (mode === 'edit') {
        onUpdateApplication(payload);
        return;
      }
      onCreateApplication(payload);
    },
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="pe-2 ps-1">
      <section className="gap-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {mode === 'edit'
              ? 'Edit Application Details'
              : 'Create New Application'}
          </div>
          {mode !== 'edit' && (
            <div className="text-blue-600 text-xs">
              <p>
                Step {step} of {totalSteps}
              </p>
            </div>
          )}
        </div>
      </section>
      {mode !== 'edit' && (
        <section className="my-3">
          <div className="flex items-center">
            <div className="grid grid-cols-3 gap-2 w-full">
              <div
                className={`h-1.5 rounded ${step === 1 ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
              <div
                className={`h-1.5 rounded ${step === 2 ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
              <div
                className={`h-1.5 rounded ${step === 3 ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            </div>
          </div>
        </section>
      )}
      <section>
        <form onSubmit={formik.handleSubmit}>
          {mode === 'edit' ? (
            // EDIT: Only show Step 1 fields in edit
            <AppDetails formik={formik} mode="edit" />
          ) : (
            <>
              {step === 1 && <AppDetails formik={formik} mode="create" />}
              {step === 2 && <S3BucketAndGithubDetails formik={formik} />}
              {step === 3 && <EnvironmentDetails formik={formik} />}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 w-full gap-5">
            <SecondaryButton
              onClick={mode === 'edit' ? onBack : prevStep}
              disabled={mode !== 'edit' && step === 1}
              className={cn(`w-full border-gray-300 px-4 py-2`)}
            >
              Go Back
            </SecondaryButton>

            {mode === 'edit' ? (
              <PrimaryButton
                type="submit"
                disabled={
                  !formik.isValid || (updateApplication?.isPending ?? false)
                }
                className="w-full px-4 py-2"
              >
                {(updateApplication?.isPending ?? false)
                  ? 'Updating...'
                  : 'Update'}
              </PrimaryButton>
            ) : step < totalSteps ? (
              <PrimaryButton
                type="button"
                onClick={nextStep}
                className="w-full px-4 py-2"
              >
                Proceed
              </PrimaryButton>
            ) : (
              <PrimaryButton
                type="submit"
                disabled={!formik.isValid || createApplication.isPending}
                className="w-full px-4 py-2"
              >
                {createApplication.isPending ? 'Submitting...' : 'Submit'}
              </PrimaryButton>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
