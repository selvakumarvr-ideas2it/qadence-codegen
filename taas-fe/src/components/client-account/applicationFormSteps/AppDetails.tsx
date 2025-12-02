import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { getIn, type FormikProps } from 'formik';
import InputField from '../../shared/inputField/InputField';
import MultiSelect from '../../shared/select/MultiSelect';
import Select, { type ISelectOption } from '../../shared/select/Select';
import TextareaField from '../../shared/textareaField/TextareaField';
import type { IApplicationFormValues } from '../ApplicationForm';

type FormValuesProps = {
  formik: FormikProps<IApplicationFormValues>;
};

export default function AppDetails({
  formik,
  mode,
}: FormValuesProps & { mode?: 'create' | 'edit' }) {
  const shouldShow = (name: string) =>
    Boolean(getIn(formik.touched, name)) || formik.submitCount > 0;

  return (
    <div>
      <InputField
        label="Application Name*"
        name="appName"
        type="text"
        placeholder="Enter Application Name"
        value={formik.values.appName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.appName
            ? (formik.errors.appName as string | undefined)
            : undefined
        }
      />

      <div className="flex flex-col gap-1 w-full mt-3">
        <label
          htmlFor={`applicationType`}
          className="text-sm font-medium text-gray-900"
        >
          Application Type *
        </label>
        <Select
          wrapperClassName="w-full"
          controlClassName={`bg-white h-9 ${
            formik.touched.applicationType && formik.errors.applicationType
              ? ' border-red-500'
              : ''
          }`}
          value={formik.values.applicationType}
          onChange={(option) => {
            formik.setFieldValue('applicationType', option ?? null);
            const isMobile = option?.value === 'Mobile';
            if (!isMobile && (formik.values.targetBrowsers?.length ?? 0) > 0) {
              formik.setFieldValue('targetBrowsers', []);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              formik.setFieldTouched('applicationType', true);
            }, 150);
          }}
          placeholder="Select application type"
          options={[
            { label: 'Web', value: 'Web' },
            { label: 'Mobile', value: 'Mobile' },
            { label: 'API', value: 'API' },
          ]}
          suffixIcon={(isOpen) => (
            <DownChevronGray
              className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        />
        {formik.touched.applicationType && formik.errors.applicationType && (
          <p className="text-red-500 text-sm">
            {formik.errors.applicationType as string}
          </p>
        )}
      </div>

      <TextareaField
        label="Application Description"
        name="appDescription"
        placeholder="Add Application Description"
        value={formik.values.appDescription ?? ''}
        onChange={formik.handleChange}
        error={undefined}
        rows={3}
      />

      <MultiSelect
        label="Environments for Testing"
        placeholder="Select environments for testing"
        controlClassName="bg-white h-9"
        options={[
          { label: 'Staging', value: 'Staging' },
          { label: 'QA', value: 'QA' },
          { label: 'UAT', value: 'UAT' },
          { label: 'Production', value: 'Production' },
          { label: 'Dev', value: 'Dev' },
        ]}
        value={formik.values.environments}
        onChange={(selectedOptions) => {
          const selectedKeys = new Set(
            (selectedOptions || []).map((o: ISelectOption) => String(o.value))
          );
          const prev = formik.values.environmentConfigByEnv || {};
          const next: IApplicationFormValues['environmentConfigByEnv'] = {};
          Object.keys(prev).forEach((k) => {
            if (selectedKeys.has(k)) {
              next[k] = prev[k];
            }
          });
          formik.setFieldValue('environments', selectedOptions);
          formik.setFieldValue('environmentConfigByEnv', next);
        }}
        showSelectAll={true}
        selectAllLabel="All"
        showSearch={false}
        suffixIcon={(isOpen) => (
          <DownChevronGray
            className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      />

      <div>
        <label
          className={`block text-sm font-medium mt-2 ${
            mode !== 'edit' && formik.values.applicationType?.value !== 'Mobile'
              ? 'text-gray-400'
              : 'text-gray-900'
          }`}
        >
          Target Browser*
        </label>
        <MultiSelect
          placeholder="Select target browsers"
          controlClassName="bg-white h-9"
          options={[
            { label: 'Chrome', value: 'Chrome' },
            { label: 'Firefox', value: 'Firefox' },
            { label: 'Edge', value: 'Edge' },
            { label: 'Safari', value: 'Safari' },
          ]}
          value={formik.values.targetBrowsers}
          onChange={(selectedOptions) => {
            formik.setFieldValue('targetBrowsers', selectedOptions || []);
          }}
          disabled={
            mode !== 'edit' && formik.values.applicationType?.value !== 'Mobile'
          }
          showSelectAll={true}
          selectAllLabel="All Browsers"
          showSearch={false}
          suffixIcon={(isOpen) => (
            <DownChevronGray
              className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        />

        {shouldShow('targetBrowsers') && formik.errors.targetBrowsers && (
          <p className="text-red-500 text-sm">
            {formik.errors.targetBrowsers as string}
          </p>
        )}
      </div>

      {/* EDIT: hide database preference in edit mode */}
      {mode !== 'edit' && (
        <div>
          <div className="mt-2">
            <label
              htmlFor={`applicationType`}
              className="text-sm font-medium text-gray-900"
            >
              Database preference*
            </label>
            <div className="flex gap-4 text-gray-600">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="databasePreference"
                  value="use_I2I_s3"
                  checked={formik.values.databasePreference === 'use_I2I_s3'}
                  onChange={() => {
                    formik.setFieldValue('databasePreference', 'use_I2I_s3');
                    formik.setFieldValue('S3BucketEndpoint', '');
                    formik.setFieldValue('S3APIkey', '');
                    formik.setFieldValue('SecretKey', '');
                  }}
                  className="form-radio accent-blue-600"
                />
                <span className="ml-2">Use our S3 bucket</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="databasePreference"
                  value="bring_your_own_s3"
                  checked={
                    formik.values.databasePreference === 'bring_your_own_s3'
                  }
                  onChange={() =>
                    formik.setFieldValue(
                      'databasePreference',
                      'bring_your_own_s3'
                    )
                  }
                  className="form-radio accent-blue-600"
                />
                <span className="ml-2">Bring your own S3 bucket</span>
              </label>
            </div>
          </div>
          {formik.touched.databasePreference &&
            formik.errors.databasePreference && (
              <p className="text-red-500 text-sm">
                {formik.errors.databasePreference as string}
              </p>
            )}
        </div>
      )}
    </div>
  );
}
