import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { getIn, type FormikProps } from 'formik';
import InputField from '../../shared/inputField/InputField';
import MultiSelect from '../../shared/select/MultiSelect';
import type { IApplicationFormValues } from '../ApplicationForm';

type FormValuesProps = {
  formik: FormikProps<IApplicationFormValues>;
};

export default function EnvironmentDetails({ formik }: FormValuesProps) {
  return (
    <div>
      {formik.values.environments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Please select environments in Step 1 to configure them here.
        </div>
      ) : (
        <div className="space-y-6">
          {formik.values.environments.map((env) => {
            const envKey = String(env.value);
            const envConfig: NonNullable<
              IApplicationFormValues['environmentConfigByEnv']
            >[string] = formik.values.environmentConfigByEnv?.[envKey] ?? {
              url: '',
              username: '',
              password: '',
            };

            return (
              <div key={envKey}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {env.label} Environment
                </h3>
                <InputField
                  label={`${env.label} URL`}
                  name={`environmentConfigByEnv.${envKey}.url`}
                  type="text"
                  placeholder={`Enter ${env.label} environment URL`}
                  value={envConfig.url}
                  onChange={(e) => {
                    formik.setFieldValue(
                      `environmentConfigByEnv.${envKey}.url`,
                      e.target.value
                    );
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    getIn(
                      formik.touched,
                      `environmentConfigByEnv.${envKey}.url`
                    )
                      ? (getIn(
                          formik.errors,
                          `environmentConfigByEnv.${envKey}.url`
                        ) as string | undefined)
                      : undefined
                  }
                />
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <InputField
                      label="Username"
                      name={`environmentConfigByEnv.${envKey}.username`}
                      type="text"
                      placeholder="Enter Username"
                      value={envConfig.username}
                      onChange={(e) => {
                        formik.setFieldValue(
                          `environmentConfigByEnv.${envKey}.username`,
                          e.target.value
                        );
                      }}
                      onBlur={formik.handleBlur}
                      error={
                        getIn(
                          formik.touched,
                          `environmentConfigByEnv.${envKey}.username`
                        )
                          ? (getIn(
                              formik.errors,
                              `environmentConfigByEnv.${envKey}.username`
                            ) as string | undefined)
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Password"
                      name={`environmentConfigByEnv.${envKey}.password`}
                      type="password"
                      placeholder="Enter Password"
                      value={envConfig.password}
                      onChange={(e) => {
                        formik.setFieldValue(
                          `environmentConfigByEnv.${envKey}.password`,
                          e.target.value
                        );
                      }}
                      onBlur={formik.handleBlur}
                      error={
                        getIn(
                          formik.touched,
                          `environmentConfigByEnv.${envKey}.password`
                        )
                          ? (getIn(
                              formik.errors,
                              `environmentConfigByEnv.${envKey}.password`
                            ) as string | undefined)
                          : undefined
                      }
                    />
                  </div>
                </div>
                <MultiSelect
                  label="Target Browser*"
                  placeholder="Select target browsers"
                  controlClassName="bg-white h-9"
                  options={[
                    { label: 'Chrome', value: 'Chrome' },
                    { label: 'Firefox', value: 'Firefox' },
                    { label: 'Edge', value: 'Edge' },
                    { label: 'Safari', value: 'Safari' },
                  ]}
                  value={formik.values.targetBrowsersEnv}
                  onChange={(selectedOptions) => {
                    formik.setFieldValue(
                      'targetBrowsersEnv',
                      selectedOptions || []
                    );
                  }}
                  onBlur={() => {
                    formik.setFieldTouched('targetBrowsersEnv', true);
                  }}
                  showSelectAll={true}
                  selectAllLabel="All Browsers"
                  showSearch={false}
                  suffixIcon={(isOpen) => (
                    <DownChevronGray
                      className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                />
                {getIn(formik.touched, 'targetBrowsersEnv') === true &&
                  formik.errors.targetBrowsersEnv && (
                    <p className="text-red-500 text-sm">
                      {formik.errors.targetBrowsersEnv as string}
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
