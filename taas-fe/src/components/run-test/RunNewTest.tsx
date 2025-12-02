import { useNewRunMutation } from '@/hooks/mutation/useNewRunMutation';
import useGetSuiteByApplicationId from '@/hooks/useGetSuiteByApplicationId';
import type {
  IApplicationSummaryByTenant,
  IRunHistory,
} from '@/interfaces/Dashboard';
import type { INewRunFormRequest } from '@/interfaces/NewRun';
import { cn, transformToLabelValue } from '@/utils/util';

import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { RunStatus } from '@/constants/appConstant';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import z from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Modal } from '../shared/modal/modal';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import MultiSelect, { type ISelectOption } from '../shared/select/MultiSelect';
import Select from '../shared/select/Select';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface IRunNewTestProps {
  onClose: () => void;
  selectedApplication: DropdownOption;
  isApplicationsDataLoading: boolean;
}

type DropdownOption = { label: string; value: string | number } | null;
type RunFormValues = z.infer<typeof RunFormSchema>;
type FormValues = {
  application: DropdownOption;
  testSuites: (ISelectOption & { suiteId: string; suiteName: string })[];
  label: string;
  environmentType: DropdownOption;
  browserType: DropdownOption;
};

const OptionSchema = z.object({
  label: z.string(),
  value: z.string().or(z.number()),
});

const RunFormSchema = z.object({
  application: OptionSchema.nullable().refine((val) => val !== null, {
    message: 'Application is required',
  }),
  testSuites: z
    .array(OptionSchema)
    .min(1, 'At least one test suite is required'),
  environmentType: OptionSchema.nullable().refine((val) => val !== null, {
    message: 'Environment is required',
  }),
  browserType: OptionSchema.nullable().refine((val) => val !== null, {
    message: 'Browser is required',
  }),
});

export function RunNewTest({
  onClose,
  selectedApplication,
  isApplicationsDataLoading,
}: IRunNewTestProps) {
  const applicationOptions: IApplicationSummaryByTenant[] = [];
  const { data: applicationTestSuites } = useGetSuiteByApplicationId(
    selectedApplication ? String(selectedApplication.value) : ''
  );
  const navigate = useNavigate();

  const validateRunForm = (values: RunFormValues) => {
    const result = RunFormSchema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
        key,
        val?.[0],
      ])
    );
  };

  const queryClient = useQueryClient();

  const newRunMutation = useNewRunMutation({
    onSuccess: () => {
      const queryKey = QUERY_KEYS.getAllTestRuns(
        selectedApplication?.value ?? ''
      );
      queryClient.invalidateQueries({
        queryKey,
      });
      const pollInterval = setInterval(async () => {
        const runHistoryData =
          queryClient.getQueryData<IRunHistory[]>(queryKey);
        if (!runHistoryData) {
          clearInterval(pollInterval);
          return;
        }
        const hasInProgressRuns = runHistoryData.some(
          (run) => run.status === RunStatus.IN_PROGRESS
        );
        if (hasInProgressRuns) {
          await queryClient.refetchQueries({ queryKey, exact: true });
        } else {
          clearInterval(pollInterval);
        }
      }, 10000);
      navigate('./run-history');
    },
    onError: (err) => console.error('Failed to run new test', err),
  });

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      application: selectedApplication ?? null,
      testSuites: [],
      label: '',
      environmentType: null,
      browserType: null, // start with empty value
    },
    validateOnMount: true, // <-- validate immediately on load
    validateOnChange: true,
    validateOnBlur: true,
    validate: validateRunForm,
    onSubmit: async (values, { resetForm }) => {
      try {
        const testsuites = values.testSuites.reduce<
          {
            id: string;
            name: string;
            testcases: { id: string; name: string }[];
          }[]
        >((groupedSuites, selectedCase) => {
          const suiteId = String(selectedCase.suiteId); // normalize
          let suite = groupedSuites.find((suite) => suite.id === suiteId);

          if (!suite) {
            suite = {
              id: suiteId,
              name: selectedCase.suiteName,
              testcases: [],
            };
            groupedSuites.push(suite);
          }

          suite.testcases.push({
            id: String(selectedCase.value),
            name: selectedCase.label,
          });

          return groupedSuites;
        }, []);

        const payload: INewRunFormRequest = {
          applicationId: values.application?.value ?? null,
          triggerReason: values.label,
          testRequestPayload: {
            testsuites,
            environments: values.environmentType
              ? [values.environmentType.value]
              : [],
            browsers: values.browserType ? [values.browserType.value] : [],
          },
        };
        resetForm();
        onClose();
        newRunMutation.mutate(payload);
        navigate('./run-history');
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });

  const suiteOptions: ISelectOption[] = useMemo(() => {
    if (!applicationTestSuites) return [];

    return applicationTestSuites
      .filter((suite) => suite.testCases && suite.testCases.length > 0)
      .map((suite) => ({
        label: suite.name,
        value: suite.id,
        children:
          suite.testCases?.map((testCase) => ({
            suiteId: suite.id,
            suiteName: suite.name,
            label: testCase.name,
            value: testCase.id,
          })) ?? [],
      }));
  }, [applicationTestSuites]);

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
                  Run New Test
                </h2>
                <p className="font-inter font-normal text-sm leading-4 text-gray-600 mt-1">
                  Please select test cases to see execution summary.
                </p>
                <div className="mt-3">
                  <label
                    htmlFor="application"
                    className="font-inter font-semibold text-sm leading-5 block mb-1"
                  >
                    Application*
                  </label>
                  <Select
                    aria-label="Choose an Application"
                    options={transformToLabelValue(
                      applicationOptions,
                      'name',
                      'id'
                    )}
                    value={formik.values.application}
                    onChange={(option) =>
                      formik.setFieldValue('application', option)
                    }
                    controlClassName="h-8 w-full"
                    placeholder="Choose an Application"
                    showSearch={false}
                    allowClear={false}
                    isAddNewForm={true}
                    suffixIcon={(isOpen) => (
                      <DownChevronGray
                        className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  />
                </div>

                <div className="mt-3">
                  <label
                    className="font-inter font-semibold text-sm leading-5 block mb-1"
                    htmlFor="testSuites"
                  >
                    Test Suites and Test Cases*
                  </label>
                  <div className="mb-2">
                    <MultiSelect
                      showSearch={true}
                      options={suiteOptions}
                      value={formik.values.testSuites}
                      onChange={(options) =>
                        formik.setFieldValue('testSuites', options)
                      }
                      onBlur={() => formik.setFieldTouched('testSuites', true)}
                      placeholder="Search Test Suites and Test Cases"
                      allowClear
                      showSelectAll
                      isGroupCheckbox={true}
                      wrapperClassName="!mt-0"
                      controlClassName="h-8 w-full"
                      suffixIcon={(isOpen) => (
                        <DownChevronGray
                          className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    />
                    {formik.touched.testSuites &&
                      typeof formik.errors.testSuites === 'string' && (
                        <p className="text-red-600 text-xs mt-1">
                          {formik.errors.testSuites}
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <label
                    className="font-inter font-semibold text-sm leading-5 block mb-1"
                    htmlFor="label"
                  >
                    Label (Optional)
                  </label>
                  <input
                    id="label"
                    type="text"
                    autoComplete="off"
                    value={formik.values.label}
                    placeholder="eg., Smoke, Regression, Bug Fix"
                    className="w-full h-8 border border-gray-200 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) =>
                      formik.setFieldValue('label', e.target.value)
                    }
                  />
                </div>

                <div>
                  <div className="mt-2">
                    <label
                      className="font-inter font-semibold text-sm leading-5 block mb-1"
                      htmlFor="browser"
                    >
                      Browser*
                    </label>
                    <Select
                      value={formik.values.browserType}
                      onChange={(option) =>
                        formik.setFieldValue('browserType', option)
                      }
                      onBlur={() => formik.setFieldTouched('browserType', true)}
                      placeholder="Select browser"
                      options={[
                        { label: 'Firefox', value: 'firefox' },
                        { label: 'Webkit', value: 'webkit' },
                        { label: 'Chromium', value: 'chromium' },
                      ]}
                      controlClassName="h-8 w-full"
                      suffixIcon={(isOpen) => (
                        <DownChevronGray
                          className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    />
                    {formik.touched.browserType &&
                      formik.errors.browserType && (
                        <p className="text-red-600 text-xs mt-1">
                          {formik.errors.browserType}
                        </p>
                      )}
                  </div>
                  <div className="mt-2">
                    <label
                      className="font-inter font-semibold text-sm leading-5 block mb-1"
                      htmlFor="url"
                    >
                      Environment*
                    </label>
                    <Select
                      value={formik.values.environmentType}
                      onChange={(option) =>
                        formik.setFieldValue('environmentType', option)
                      }
                      onBlur={() =>
                        formik.setFieldTouched('environmentType', true)
                      }
                      placeholder="Select application type"
                      options={[
                        { label: 'Dev', value: 'dev' },
                        { label: 'QA', value: 'qa' },
                        { label: 'Staging', value: 'staging' },
                      ]}
                      controlClassName="h-8 w-full"
                      suffixIcon={(isOpen) => (
                        <DownChevronGray
                          className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    />
                    {formik.touched.environmentType &&
                      formik.errors.environmentType && (
                        <p className="text-red-600 text-xs mt-1">
                          {formik.errors.environmentType}
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
                    Run Test
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
