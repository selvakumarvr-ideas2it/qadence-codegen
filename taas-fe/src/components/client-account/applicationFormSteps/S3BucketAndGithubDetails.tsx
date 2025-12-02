import { type FormikProps } from 'formik';
import InputField from '../../shared/inputField/InputField';
import type { IApplicationFormValues } from '../ApplicationForm';

type FormValuesProps = {
  formik: FormikProps<IApplicationFormValues>;
};

export default function S3BucketAndGithubDetails({ formik }: FormValuesProps) {
  const isOwnS3 = formik.values.databasePreference === 'bring_your_own_s3';

  const shouldShow = (name: keyof IApplicationFormValues) =>
    Boolean(formik.touched[name]) || formik.submitCount > 0;

  return (
    <div>
      <InputField
        label="S3 Bucket end point"
        name="S3BucketEndpoint"
        type="text"
        placeholder="Enter S3 Bucket end point"
        value={formik.values.S3BucketEndpoint ?? ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.S3BucketEndpoint
            ? (formik.errors.S3BucketEndpoint as string | undefined)
            : undefined
        }
        disabled={!isOwnS3}
      />

      <InputField
        label="S3 api key"
        name="S3APIkey"
        type="text"
        placeholder="Enter S3 api key"
        value={formik.values.S3APIkey ?? ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.S3APIkey
            ? (formik.errors.S3APIkey as string | undefined)
            : undefined
        }
        disabled={!isOwnS3}
      />

      <InputField
        label="Secret Key"
        name="SecretKey"
        type="text"
        placeholder="Enter Secret Key"
        value={formik.values.SecretKey ?? ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.SecretKey
            ? (formik.errors.SecretKey as string | undefined)
            : undefined
        }
        disabled={!isOwnS3}
      />

      <InputField
        label="Github repository url"
        name="githubRepositoryURL"
        type="text"
        placeholder="Enter Github repository url"
        value={formik.values.githubRepositoryURL}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          shouldShow('githubRepositoryURL')
            ? (formik.errors.githubRepositoryURL as string | undefined)
            : undefined
        }
      />

      <InputField
        label="Github username"
        name="githubUsername"
        type="text"
        placeholder="Enter Github username"
        value={formik.values.githubUsername}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          shouldShow('githubUsername')
            ? (formik.errors.githubUsername as string | undefined)
            : undefined
        }
      />

      <InputField
        label="Github pat token"
        name="githubPatToken"
        type="text"
        placeholder="Enter pat token"
        value={formik.values.githubPatToken}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          shouldShow('githubPatToken')
            ? (formik.errors.githubPatToken as string | undefined)
            : undefined
        }
      />
    </div>
  );
}
