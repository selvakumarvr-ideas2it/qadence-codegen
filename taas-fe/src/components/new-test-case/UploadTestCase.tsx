import sampleTemplateCsvText from '@/assets/csv/TestCases CSV formate.csv?raw';
import sampleTemplateUrl from '@/assets/csv/TestCases CSV formate.csv?url';
import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { SOURCE_TYPE, TOAST_TYPE } from '@/constants/appConstant';
import { useUploadTestCaseMutation } from '@/hooks/mutation/useUploadTestCaseMutation';
import useGetApplicationsByTenant from '@/hooks/useGetApplicationsByTenant';
import { useToast } from '@/hooks/useToast';
import type { IUploadTestCaseData } from '@/interfaces/UploadTestCase';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import FileUpload from '../shared/fileUpload/FileUpload';
import type { ISelectOption } from '../shared/select/Select';
import Select from '../shared/select/Select';

interface IUploadTestCaseProps {
  onBack: () => void;
  onTrackerIdSet?: (trackerId: string) => void;
}

type FormValues = {
  application: ISelectOption | null;
  environment: ISelectOption | null;
  file: File | null;
};

const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});

const csvHeadersFromText = (text: string): string[] => {
  const firstLine = (text || '').split(/\r?\n/)[0] || '';
  return firstLine.split(',').map((h) => h.trim());
};

const headersEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((h, i) => h === b[i]);

const UploadTestCaseSchema = z.object({
  application: SelectOptionSchema.nullable().refine((v) => v !== null, {
    message: 'Application is required',
  }),
  environment: SelectOptionSchema.nullable().refine((v) => v !== null, {
    message: 'Environment is required',
  }),
  file: z
    .custom<File | null>()
    .nullable()
    .refine((v) => v !== null, {
      message: 'File is required',
    }),
});

const validate = (values: FormValues) => {
  const result = UploadTestCaseSchema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};

export function UploadTestCase({
  onBack,
  onTrackerIdSet,
}: IUploadTestCaseProps) {
  const tenantId = localStorage.getItem('tenant_id') || '';
  const { uploadTestCase } = useUploadTestCaseMutation();
  const toast = useToast();

  const { data: apps, isLoading: isAppsLoading } =
    useGetApplicationsByTenant(tenantId);

  const [fileStatus, setFileStatus] = useState<{
    type: (typeof TOAST_TYPE)[keyof typeof TOAST_TYPE];
    message: string;
  } | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      application: null,
      environment: null,
      file: null,
    },
    validate,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      const data: IUploadTestCaseData = {
        id: '',
        tenantId: String(tenantId),
        applicationId: String(values.application?.value),
        environment: String(values.environment?.label),
        fileName: '',
        githubFilePath: '',
        repositoryUrl: '',
        commitId: '',
        commitMessage: '',
        fileType: '',
        message: '',
        status: '',
        sourceType: SOURCE_TYPE,
      };
      const file = values.file;
      if (!file) return;
      try {
        const res = await uploadTestCase.mutateAsync({
          file,
          data,
        });
        if (res?.success && res.data.testCaseTrackerId) {
          // Store the tracker ID from response
          const trackerIdFromResponse = res.data.testCaseTrackerId;

          // Notify parent to start polling
          if (onTrackerIdSet) {
            onTrackerIdSet(trackerIdFromResponse);
          }

          // Close modal - polling will continue in Sidebar
          onBack();
        }

        // Show API error toast when success is false
        toast.error(
          res?.message ||
            res?.error?.message ||
            'Upload failed. Please try again.'
        );
        return;
      } catch (err) {
        // Network/unknown error toast
        toast.error('Failed to upload test case. Please try again.');
        console.error(err);
      }
    },
  });

  const applicationOptions = useMemo<ISelectOption[]>(
    () =>
      apps?.length
        ? apps.map((a) => ({ label: String(a.appName), value: String(a.id) }))
        : [],
    [apps]
  );

  const environmentOptions = useMemo<ISelectOption[]>(() => {
    const selectedAppId = formik.values.application?.value;
    const selectedApp = apps?.find(
      (a) => String(a.id) === String(selectedAppId)
    );
    const envs = selectedApp?.environments ?? [];
    return envs.map((e) => ({ label: e.environmentType, value: e.id }));
  }, [apps, formik.values.application]);

  return (
    <div className="pe-2 ps-1">
      <section className="flex gap-5 items-center justify-between">
        <div className="text-lg font-bold">Upload a Test Case</div>
      </section>

      <section>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="w-full space-y-3"
        >
          <section>
            <div className="mt-3">
              <label
                htmlFor="application"
                className="font-inter font-semibold text-sm leading-5 block mb-1"
              >
                Select Application
                <span className="text-red-500 font-bold">*</span>
              </label>
              <Select
                options={applicationOptions}
                value={formik.values.application}
                onChange={(option) => {
                  formik.setFieldValue('application', option ?? null, true);
                  formik.setFieldError('application', undefined);
                }}
                onBlur={() => {
                  formik.setFieldTouched('application', true);
                }}
                controlClassName="bg-white h-9"
                placeholder={
                  isAppsLoading
                    ? 'Loading applications...'
                    : 'Choose an Application'
                }
                showSearch={false}
                allowClear={false}
                isAddNewForm={true}
                disabled={isAppsLoading}
              />
              {formik.touched.application && formik.errors.application && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.application}
                </p>
              )}
            </div>
            <div className="mt-3">
              <label
                htmlFor="application"
                className="font-inter font-semibold text-sm leading-5 block mb-1"
              >
                Environments for Testing
                <span className="text-red-500 font-bold">*</span>
              </label>
              <Select
                options={environmentOptions}
                value={formik.values.environment}
                onChange={(option) => {
                  formik.setFieldValue('environment', option ?? null, true);
                }}
                onBlur={() => {
                  formik.setFieldTouched('environment', true);
                }}
                controlClassName="bg-white h-9"
                placeholder={
                  isAppsLoading
                    ? 'Loading environments...'
                    : environmentOptions.length
                      ? 'Choose an Environment'
                      : formik.values.application
                        ? 'No environments found'
                        : 'Select an Application first'
                }
                showSearch={false}
                allowClear={false}
                isAddNewForm={false}
                disabled={isAppsLoading || !formik.values.application}
                suffixIcon={(isOpen) => (
                  <DownChevronGray
                    className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
              />
              {formik.touched.environment && formik.errors.environment && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.environment}
                </p>
              )}
            </div>
            <div className="mt-3">
              <label
                htmlFor="application"
                className="font-inter font-semibold text-sm leading-5 block mb-1"
              >
                Application Test Case
                <span className="text-red-500 font-bold">*</span>
              </label>
              <FileUpload
                value={formik.values.file}
                onChange={async (file) => {
                  // clear previous status
                  setFileStatus(null);

                  // If FileUpload rejected by type/size, It will pass null
                  if (!file) {
                    formik.setFieldValue('file', null, false);
                    return;
                  }
                  const isCsv =
                    file.type === 'text/csv' ||
                    file.name.toLowerCase().endsWith('.csv');
                  if (!isCsv) {
                    formik.setFieldValue('file', file, false);
                    setFileStatus({
                      type: 'error',
                      message: 'Only CSV format acceptable',
                    });
                    return;
                  }
                  try {
                    const text = await file.text();
                    const uploadedHeaders = csvHeadersFromText(text);
                    const expectedHeaders = csvHeadersFromText(
                      sampleTemplateCsvText
                    );

                    if (!headersEqual(uploadedHeaders, expectedHeaders)) {
                      formik.setFieldValue('file', file, false);
                      setFileStatus({
                        type: 'error',
                        message:
                          'Columns don’t match. Download the template and try again',
                      });
                      return;
                    }

                    formik.setFieldValue('file', file, false);
                    setFileStatus({
                      type: 'success',
                      message: 'Uploaded successfully',
                    });
                  } catch {
                    formik.setFieldValue('file', file, false);
                    setFileStatus({
                      type: 'error',
                      message: 'Unable to read the CSV file',
                    });
                  }
                }}
                onBlur={() => formik.setFieldTouched('file', true)}
                accept=".csv,text/csv"
                disabled={
                  isAppsLoading ||
                  !formik.values.application ||
                  !formik.values.environment
                }
                controlClassName="py-6"
                maxSizeMb={20}
                statusType={
                  fileStatus?.type === TOAST_TYPE.ERROR
                    ? 'error'
                    : fileStatus?.type === TOAST_TYPE.INFO
                      ? 'info'
                      : fileStatus?.type === TOAST_TYPE.SUCCESS
                        ? 'success'
                        : undefined
                }
                statusMessage={fileStatus?.message}
                fileNameMaxChars={40}
              />
            </div>
            <div className="mt-2 mb-4">
              <a
                href={sampleTemplateUrl}
                download="TestCases CSV formate.csv"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Download CSV Template
              </a>
            </div>
          </section>
          <section className="flex gap-5 pt-6 pb-5">
            <SecondaryButton
              className="text-sm border-gray-300 hover:bg-gray-50 w-full px-4 py-2"
              onClick={() => {
                formik.resetForm();
                onBack();
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={
                isAppsLoading ||
                !formik.values.application ||
                !formik.values.environment ||
                !formik.values.file ||
                fileStatus?.type !== 'success'
              }
              className="text-sm w-full px-4 py-2"
            >
              Create Automation Script
            </PrimaryButton>
          </section>
        </form>
      </section>
    </div>
  );
}
