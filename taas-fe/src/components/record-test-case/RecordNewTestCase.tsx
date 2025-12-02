import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { useRecordNewTestCaseConfigMutation } from '@/hooks/mutation/useRecordNewTestCaseConfigMutation';
import { useRecordNewTestCaseMutation } from '@/hooks/mutation/useRecordNewTestCaseMutation';
import useGetApplicationsByTenant from '@/hooks/useGetApplicationsByTenant';
import type {
  IRecordNewTestCaseConfig,
  IRecordNewTestCaseRequest,
} from '@/interfaces/RecordNewTestCase';
import { cn } from '@/utils/util';
import { useFormik } from 'formik';
import { useEffect, useMemo } from 'react';
import z from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import InputField from '../shared/inputField/InputField';
import { Modal } from '../shared/modal/modal';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import Select, { type ISelectOption } from '../shared/select/Select';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface IRecordNewTestCaseProps {
  onClose: () => void;
  selectedApplication: DropdownOption;
  isApplicationsDataLoading: boolean;
}

type DropdownOption = { label: string; value: string | number } | null;
type RecordTestCaseFormValues = z.infer<typeof RecordTestCaseFormSchema>;
type FormValues = {
  applicationOptions: DropdownOption;
  environmentOptions: DropdownOption;
  url: string;
  testCaseName: string;
  testCaseDescription: string;
  browserOptions: DropdownOption;
};

const OptionSchema = z.object({
  label: z.string(),
  value: z.string().or(z.number()),
});

const RecordTestCaseFormSchema = z.object({
  applicationOptions: OptionSchema.nullable().refine((val) => val !== null, {
    message: 'Application is required',
  }),
  environmentOptions: OptionSchema.nullable().refine((val) => val !== null, {
    message: 'Environment is required',
  }),
  testCaseName: z.string().nonempty({ message: 'Test case name is required' }),
  testCaseDescription: z
    .string()
    .nonempty({ message: 'Test case description is required' }),
  browserOptions: OptionSchema.nullable().refine((val) => val !== null, {
    message: 'Browser is required',
  }),
});

export function RecordNewTestCase({
  onClose,
  isApplicationsDataLoading,
}: IRecordNewTestCaseProps) {
  const tenantId = localStorage.getItem('tenant_id') || '';
  const { data: recordTestCaseFormData, isLoading: isAppsLoading } =
    useGetApplicationsByTenant(tenantId);
  const { mutate: recordNewTestCaseConfig } =
    useRecordNewTestCaseConfigMutation();

  const { mutate: recordNewTestCase } = useRecordNewTestCaseMutation({
    onSuccess: (data) => {
      console.log('Record Test Case Success Demo:', data);
      const request: IRecordNewTestCaseConfig = {
        url: data.data.applicationUrl,
        browser: 'chrome',
        testCaseTrackerId: data.data.testCaseTrackerId,
        sourceType: 'FRONTEND',
      };
      recordNewTestCaseConfig(request);
      formik.resetForm();
      onClose();
    },
    onError: (error) => {
      console.error('Record Test Case Failed:', error);
    },
  });

  const validateRecordTestCaseForm = (values: RecordTestCaseFormValues) => {
    const result = RecordTestCaseFormSchema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
        key,
        val?.[0],
      ])
    );
  };
  const initialRecordTestCaseValues: FormValues = {
    applicationOptions: null,
    environmentOptions: null,
    url: '',
    testCaseName: '',
    testCaseDescription: '',
    browserOptions: null,
  };

  const handleSubmit = (values: FormValues) => {
    try {
      const buildPayload = (values: FormValues): IRecordNewTestCaseRequest => ({
        applicationId: String(values.applicationOptions?.value),
        applicationUrl: String(values.url),
        environment: String(values.environmentOptions?.label),
        browser: String(values.browserOptions?.label),
        testCaseName: values.testCaseDescription,
      });
      const payload = buildPayload(values);
      recordNewTestCase(payload); // your mutation
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: initialRecordTestCaseValues,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    validate: validateRecordTestCaseForm,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  const applicationOptions = useMemo<ISelectOption[]>(
    () =>
      recordTestCaseFormData?.length
        ? recordTestCaseFormData.map((a) => ({
            label: String(a.appName),
            value: String(a.id),
          }))
        : [],
    [recordTestCaseFormData]
  );

  const environmentType = useMemo<ISelectOption[]>(() => {
    const selectedAppId = formik.values.applicationOptions?.value;
    const selectedApp = recordTestCaseFormData?.find(
      (a) => String(a?.id) === String(selectedAppId)
    );
    const envs = selectedApp?.environments ?? [];
    return envs.map((e) => ({ label: e.environmentType, value: e.id }));
  }, [recordTestCaseFormData, formik.values.applicationOptions]);

  const { filteredEnvironments, browserOptions } = useMemo(() => {
    if (!formik.values.environmentOptions)
      return { filteredEnvironments: [], browserOptions: [] };
    const filtered =
      recordTestCaseFormData
        ?.flatMap((app) => app.environments || [])
        .filter((env) => environmentType.some((opt) => opt.value === env.id)) ||
      [];

    const browsers = filtered.map((env) => ({
      label: env.targetBrowser,
      value: env.targetBrowser,
    }));
    return { filteredEnvironments: filtered, browserOptions: browsers };
  }, [
    formik.values.environmentOptions,
    recordTestCaseFormData,
    environmentType,
  ]);

  useEffect(() => {
    if (formik.values.environmentOptions) {
      const urlDefaultValue = filteredEnvironments?.map((env) => env.url);
      formik.setFieldValue('url', urlDefaultValue);
    }
  }, [formik.values.environmentOptions, recordTestCaseFormData]);

  return (
    <div>
      {isApplicationsDataLoading ? (
        <Modal
          isOpen={true}
          onClose={onClose}
          className=" w-[512px] max-w-xl h-[450px] bg-white"
          isCloseButtonEnabled={true}
          children={
            <SkeletonLoader
              height="395px"
              width="100%"
              borderRadius="8px"
              className="mb-2"
            />
          }
        />
      ) : (
        <Modal
          isOpen={true}
          onClose={onClose}
          className=" w-[512px] max-w-xl bg-white"
          isCloseButtonEnabled={true}
        >
          <ScrollPanel className={cn(`max-h-[64vh] !pe-0`)}>
            <div className="pe-2 ml-1">
              <form onSubmit={formik.handleSubmit} aria-live="polite">
                <h2 className="font-inter font-bold text-lg leading-5 !mt-0">
                  Record New Test Case
                </h2>
                <div className="mt-3">
                  <label
                    htmlFor="applicationOptions"
                    className="font-inter font-semibold text-sm leading-5 block mb-2"
                  >
                    Application*
                  </label>
                  <Select
                    aria-label="Choose an Application"
                    options={applicationOptions}
                    value={formik.values.applicationOptions}
                    onChange={(option) => {
                      formik.setFieldValue(
                        'applicationOptions',
                        option ?? null,
                        true
                      );
                      formik.setFieldError('applicationOptions', undefined);
                    }}
                    onBlur={() => {
                      formik.setFieldTouched('applicationOptions', true);
                    }}
                    controlClassName="h-8 w-full"
                    placeholder={
                      isAppsLoading
                        ? 'Loading applications...'
                        : 'Choose an Application'
                    }
                    showSearch={false}
                    allowClear={false}
                    isAddNewForm={true}
                    disabled={isAppsLoading}
                    suffixIcon={(isOpen) => (
                      <DownChevronGray
                        className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  />
                </div>
                {formik.touched.applicationOptions &&
                  formik.errors.applicationOptions && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.applicationOptions}
                    </p>
                  )}
                <div className="mt-2">
                  <label
                    className="font-inter font-semibold text-sm leading-5 block mb-2"
                    htmlFor="url"
                  >
                    Environment*
                  </label>
                  <Select
                    value={formik.values.environmentOptions}
                    onChange={(option) =>
                      formik.setFieldValue('environmentOptions', option)
                    }
                    onBlur={() =>
                      formik.setFieldTouched('environmentOptions', true)
                    }
                    placeholder={
                      isAppsLoading
                        ? 'Loading environments...'
                        : environmentType.length
                          ? 'Choose an Environment'
                          : formik.values.applicationOptions
                            ? 'No environments found'
                            : 'Select an Application first'
                    }
                    showSearch={false}
                    allowClear={false}
                    isAddNewForm={true}
                    options={environmentType}
                    controlClassName="h-8 w-full"
                    disabled={
                      isAppsLoading || !formik.values.applicationOptions
                    }
                    suffixIcon={(isOpen) => (
                      <DownChevronGray
                        className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  />
                  {formik.touched.environmentOptions &&
                    formik.errors.environmentOptions && (
                      <p className="text-red-600 text-xs mt-1">
                        {formik.errors.environmentOptions}
                      </p>
                    )}
                </div>
                <InputField
                  type={'text'}
                  name="url"
                  label={
                    <div className="font-inter font-semibold text-sm leading-5 block mb-1">
                      URL*
                    </div>
                  }
                  value={formik.values.url}
                  autoComplete="off"
                  onBlur={() => formik.setFieldTouched('url', true)}
                  placeholder="Enter Url"
                  className="w-full h-8 border border-gray-200 rounded-md p-1 focus:outline-none focus:ring-0 focus:ring-black-500"
                  onChange={(e) => formik.setFieldValue('url', e.target.value)}
                  readOnly
                  disabled={isAppsLoading || !formik.values.environmentOptions}
                />
                <InputField
                  type={'text'}
                  name="testCaseName"
                  label={
                    <div className="font-inter font-semibold text-sm leading-5 block mb-1">
                      {' '}
                      Test Case Name*
                    </div>
                  }
                  onBlur={() => formik.setFieldTouched('testCaseName', true)}
                  value={formik.values.testCaseName}
                  placeholder="eg., User Login Flow, Product Search, Checkout Process"
                  className="w-full h-8 border border-gray-200 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) =>
                    formik.setFieldValue('testCaseName', e.target.value)
                  }
                />{' '}
                {formik.touched.testCaseName && formik.errors.testCaseName && (
                  <p className="text-red-600 text-xs mt-1">
                    {formik.errors.testCaseName}
                  </p>
                )}
                <InputField
                  type={'text'}
                  name="testCaseDescription"
                  label={
                    <div className="font-inter font-semibold text-sm leading-5 block mb-1">
                      {' '}
                      Test Case Description*
                    </div>
                  }
                  onBlur={() =>
                    formik.setFieldTouched('testCaseDescription', true)
                  }
                  value={formik.values.testCaseDescription}
                  placeholder="Enter test case description"
                  className="w-full h-8 border border-gray-200 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) =>
                    formik.setFieldValue('testCaseDescription', e.target.value)
                  }
                />{' '}
                {formik.touched.testCaseDescription &&
                  formik.errors.testCaseDescription && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.testCaseDescription}
                    </p>
                  )}
                <div>
                  <div className="mt-2">
                    <label
                      className="font-inter font-semibold text-sm leading-5 block mb-1"
                      htmlFor="browser"
                    >
                      Browser*
                    </label>
                    <Select
                      value={formik.values.browserOptions}
                      onChange={(option) =>
                        formik.setFieldValue('browserOptions', option)
                      }
                      onBlur={() =>
                        formik.setFieldTouched('browserOptions', true)
                      }
                      placeholder="Select browser"
                      showSearch={false}
                      allowClear={false}
                      isAddNewForm={true}
                      options={browserOptions}
                      controlClassName="h-8 w-full"
                      disabled={
                        isAppsLoading || !formik.values.environmentOptions
                      }
                      suffixIcon={(isOpen) => (
                        <DownChevronGray
                          className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    />
                    {formik.touched.browserOptions &&
                      formik.errors.browserOptions && (
                        <p className="text-red-600 text-xs mt-1">
                          {formik.errors.browserOptions}
                        </p>
                      )}
                  </div>
                </div>
                <div className=" mt-3 flex justify-end gap-3 w-full">
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      formik.resetForm();
                      onClose();
                    }}
                    className="border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 px-4 py-2 flex-1"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={
                      !(formik.isValid && formik.dirty) || formik.isSubmitting
                    }
                    className=" disabled:bg-gray-400 text-sm disabled:text-white disabled:cursor-not-allowed px-4 py-2 flex-1"
                  >
                    Proceed
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </ScrollPanel>
        </Modal>
      )}
    </div>
  );
}
