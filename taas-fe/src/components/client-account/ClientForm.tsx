import type { FormMode, IClientDetails } from '@/interfaces/ClientAccount';
import { useFormik } from 'formik';
import { z } from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import InputField from '../shared/inputField/InputField';
import TextareaField from '../shared/textareaField/TextareaField';

interface IClientFormProps {
  onBack: () => void;
  mode?: FormMode;
  initialData?: IClientDetails | null;
  onSubmit: (values: IClientDetails) => void;
}

// Zod schema for client form
const ClientFormSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required'),
  contactPersonName: z
    .string()
    .trim()
    .min(1, 'Contact person name is required'),
  contactEmail: z.string().trim().email('Enter a valid email'),
  // allow empty string
  organizationAddress: z.string().trim(),
  sectorType: z.string().trim().min(1, 'Industry is required'),
  // allow empty string; if non-empty, must be URL
  domainName: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || /^https?:\/\/.+/i.test(v),
      'Enter a valid URL (e.g., https://example.com)'
    ),
});

type IFormValues = z.infer<typeof ClientFormSchema>;

const validate = (values: IFormValues) => {
  const result = ClientFormSchema.safeParse(values);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};

export function ClientForm({
  onBack,
  mode = 'create',
  initialData,
  onSubmit,
}: IClientFormProps) {
  const formik = useFormik<IFormValues>({
    initialValues: {
      name: initialData?.name || '',
      contactPersonName: initialData?.contactPersonName || '',
      contactEmail: initialData?.contactEmail || '',
      organizationAddress: initialData?.organizationAddress || '',
      sectorType: initialData?.sectorType || '',
      domainName: initialData?.domainName || '',
    },
    validate,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        onSubmit(values as IClientDetails);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });

  return (
    <div className="pe-2 ps-1">
      <section className="flex gap-5 items-center justify-between">
        <div className="text-lg font-bold">
          {mode === 'edit' ? 'Edit Client' : 'Create New Client'}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          ×
        </button>
      </section>
      <section>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="w-full space-y-3"
        >
          <section>
            <InputField
              label="Organization Name*"
              name="name"
              type="text"
              placeholder="Enter Organization Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.name
                  ? (formik.errors.name as string | undefined)
                  : undefined
              }
            />

            <InputField
              label="Contact Person Name*"
              name="contactPersonName"
              type="text"
              placeholder="Enter Contact Person Name"
              value={formik.values.contactPersonName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.contactPersonName
                  ? (formik.errors.contactPersonName as string | undefined)
                  : undefined
              }
            />

            <InputField
              label="Contact Person's Email*"
              name="contactEmail"
              type="text"
              placeholder="Enter Contact Person's Email"
              value={formik.values.contactEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.contactEmail
                  ? (formik.errors.contactEmail as string | undefined)
                  : undefined
              }
            />

            <TextareaField
              label="Organization Address"
              name="organizationAddress"
              placeholder="Enter Address (street, city, state, postal code, country)"
              value={formik.values.organizationAddress ?? ''}
              onChange={formik.handleChange}
              error={formik.errors.organizationAddress}
              rows={3}
            />

            <InputField
              label="Industry or Business Sector*"
              name="sectorType"
              type="text"
              placeholder="Enter Industry"
              value={formik.values.sectorType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.sectorType
                  ? (formik.errors.sectorType as string | undefined)
                  : undefined
              }
            />

            <InputField
              label="Organization Website"
              name="domainName"
              type="text"
              placeholder="Enter Organization Website"
              value={formik.values.domainName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.domainName
                  ? (formik.errors.domainName as string | undefined)
                  : undefined
              }
            />
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
              disabled={!formik.isValid}
              className="text-sm w-full px-4 py-2"
            >
              {mode === 'edit' ? 'Update Client' : 'Create Client'}
            </PrimaryButton>
          </section>
        </form>
      </section>
    </div>
  );
}
