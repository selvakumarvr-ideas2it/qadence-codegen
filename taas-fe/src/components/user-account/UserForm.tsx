import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { ACTIVE_STATUS } from '@/constants/appConstant';
import { useCreateUserMutation } from '@/hooks/mutation/useCreateUserMutation';
import { useUpdateUserMutation } from '@/hooks/mutation/useUpdateUserMutation';
import useGetAllTenants from '@/hooks/useGetAllTenants';
import useGetApplicationSummaryByTenant from '@/hooks/useGetApplicationSummaryByTenant';
import useGetRolesByTenant from '@/hooks/useGetRolesByTenant';
import { useToast } from '@/hooks/useToast';
import type { FormMode, IClientDetails } from '@/interfaces/ClientAccount';
import type {
  IUpdateUserPayload,
  IUserDetails,
  UsersPayload,
} from '@/interfaces/User';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useFormik } from 'formik';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { z } from 'zod';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import InputField from '../shared/inputField/InputField';
import MultiSelect from '../shared/select/MultiSelect';
import Select, { type ISelectOption } from '../shared/select/Select';

interface IUserFormProps {
  onBack: () => void;
  mode?: FormMode;
  initialData?: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    client: string;
    application: string;
    role: string;
  } | null;
  userDetails?: IUserDetails | null;
  onSubmit: (values: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    client: string;
    application: string;
    role: string;
  }) => void;
  refetchUsers?: () => Promise<QueryObserverResult<UsersPayload, Error>>;
}

type FormValues = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  client: ISelectOption | null;
  role: ISelectOption | null;
  applications: ISelectOption[];
};

const makeSchema = (isEdit: boolean) =>
  z
    .object({
      userName: z.string().trim().min(1, 'User name is required'),
      email: z.string().trim().email('Enter a valid email'),
      // Password is required on create; optional on edit
      password: isEdit
        ? z.string().optional().or(z.literal(''))
        : z.string().min(1, 'Password is required'),
      confirmPassword: z.string().optional(),
      client: z
        .object({
          label: z.string(),
          value: z.union([z.string(), z.number()]),
        })
        .nullable()
        .refine((v) => !!v, 'Client is required'),
      role: z
        .object({
          label: z.string(),
          value: z.union([z.string(), z.number()]),
        })
        .nullable()
        .refine((v) => !!v, 'Role is required'),
      applications: z
        .array(
          z.object({
            label: z.string(),
            value: z.union([z.string(), z.number()]),
          })
        )
        .min(1, 'Select at least one application'),
    })
    // Only use confirmPassword to check equality; don't require it separately.
    .refine(
      (vals) => {
        if (!vals.password) return true; // allow blank on edit
        return vals.password === (vals.confirmPassword ?? '');
      },
      { path: ['password'], message: 'Passwords do not match' }
    );

export const UserForm = ({
  onBack,
  mode = 'create',
  initialData,
  userDetails,
  onSubmit,
  refetchUsers,
}: IUserFormProps) => {
  const isEdit = mode === 'edit';

  // fetch tenants
  const { data: tenants = [], isLoading: isTenantsLoading } =
    useGetAllTenants(true);

  const { success: toastSuccess, error: toastError } = useToast();

  // map to Select options
  const clientOptions = useMemo<ISelectOption[]>(
    () =>
      tenants.map((t: IClientDetails) => ({
        label: t.name,
        value: t.id,
      })),
    [tenants]
  );

  // Build initial values
  const initialValues: FormValues = useMemo(() => {
    if (isEdit && userDetails) {
      const clientOpt: ISelectOption | null = userDetails.tenantId
        ? { label: userDetails.tenantName || '', value: userDetails.tenantId }
        : null;
      const roleOpt: ISelectOption | null = userDetails.roleName
        ? { label: userDetails.roleName, value: userDetails.roleName }
        : null;
      const apps: ISelectOption[] =
        userDetails.applications?.map((a) => ({
          label: a.applicationName,
          value: a.applicationId,
        })) ?? [];
      return {
        userName: userDetails.userName,
        email: userDetails.email,
        password: '',
        confirmPassword: '',
        client: clientOpt,
        role: roleOpt,
        applications: apps,
      };
    }

    // create mode: hydrate from initialData if provided
    const clientFromInitial = initialData?.client
      ? { label: initialData.client, value: initialData.client }
      : null;
    const roleFromInitial = initialData?.role
      ? { label: initialData.role, value: initialData.role }
      : null;
    const appFromInitial = initialData?.application
      ? [{ label: initialData.application, value: initialData.application }]
      : [];

    return {
      userName: initialData?.userName ?? '',
      email: initialData?.email ?? '',
      password: initialData?.password ?? '',
      confirmPassword: initialData?.confirmPassword ?? '',
      client: clientFromInitial,
      role: roleFromInitial,
      applications: appFromInitial,
    };
  }, [isEdit, userDetails, initialData]);

  const schema = useMemo(() => makeSchema(isEdit), [isEdit]);

  const validate = (values: FormValues) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // build payloads for create/update
      if (isEdit && userDetails) {
        const applications = values.applications.map((opt) => ({
          applicationId: String(opt.value),
          applicationName: String(opt.label),
        }));

        const updateData: IUpdateUserPayload = {
          tenantId: userDetails.tenantId,
          userDetails: {
            email: values.email,
            userName: values.userName,
            roleName: String(values.role?.label ?? ''),
            clientName: String(
              values.client?.label ?? userDetails.tenantName ?? ''
            ),
            status: userDetails.status || ACTIVE_STATUS,
            applications,
            ...(values.password ? { password: values.password } : {}),
          },
        };
        onUpdateUser(userDetails.id, updateData);
      } else {
        const applications = values.applications.map((o) => ({
          applicationId: String(o.value),
          applicationName: String(o.label),
        }));

        const payload = {
          id: '',
          tenantId: String(values.client?.value ?? ''),
          userDetails: {
            id: '',
            tenantId: String(values.client?.value ?? ''),
            email: values.email,
            userName: values.userName,
            password: values.password,
            roleName: String(values.role?.label ?? ''),
            clientName: String(values.client?.label ?? ''),
            status: ACTIVE_STATUS,
            applications,
          },
        };
        onCreateUser(payload);
      }

      // still notify parent with raw form values if needed
      onSubmit({
        userName: values.userName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        client: String(values.client?.label ?? ''),
        application: String(values.applications[0]?.label ?? ''),
        role: String(values.role?.label ?? ''),
      });
    },
  });

  // Derive tenant id directly from the selected client (works on first render)
  const selectedTenantId = useMemo(
    () =>
      formik.values.client?.value ? String(formik.values.client.value) : '',
    [formik.values.client]
  );

  // fetch applications by selected tenant
  const { data: appSummary = [], isFetching: isAppsLoading } =
    useGetApplicationSummaryByTenant(selectedTenantId, !!selectedTenantId);

  // fetch the roles based on tenant
  const { data: rolesData, isLoading: isRolesLoading } =
    useGetRolesByTenant(selectedTenantId);

  const roleOptions = useMemo<ISelectOption[]>(
    () =>
      Array.isArray(rolesData)
        ? rolesData.map((role) => ({
            label: role.name,
            value: role.id,
          }))
        : [],
    [rolesData]
  );

  // Reset role when tenant changes
  useEffect(() => {
    if (formik.values.role) {
      formik.setFieldValue('role', null);
    }
  }, [selectedTenantId]);

  // map application options from fetched summary
  const applicationOptions = useMemo<ISelectOption[]>(
    () =>
      appSummary.map((a: { id: string; name: string }) => ({
        label: a.name,
        value: a.id,
      })),
    [appSummary]
  );

  // Clear selected apps only when tenant actually changes (skip initial mount)
  const prevTenantIdRef = useRef<string>(selectedTenantId);
  useEffect(() => {
    if (
      prevTenantIdRef.current &&
      prevTenantIdRef.current !== selectedTenantId
    ) {
      formik.setFieldValue('applications', []);
    }
    prevTenantIdRef.current = selectedTenantId;
  }, [selectedTenantId, formik]);

  // Hook for create user
  const { createUser, onCreateUser } = useCreateUserMutation({
    onSuccess: () => {
      toastSuccess('User created successfully');
    },
    onCloseModal: onBack,
    refetchAllUsers: refetchUsers,
  });

  // Hook for update user
  const { updateUser, onUpdateUser } = useUpdateUserMutation({
    onSuccess: () => {
      toastSuccess('User updated successfully');
    },
    onCloseModal: onBack,
    refetchAllUsers: refetchUsers,
  });

  useEffect(() => {
    if (createUser.isError && createUser.error) {
      toastError('Failed to create user', createUser.error.message);
    }
  }, [createUser.isError, createUser.error, toastError]);

  useEffect(() => {
    if (updateUser.isError && updateUser.error) {
      toastError('Failed to update user', updateUser.error.message);
    }
  }, [updateUser.isError, updateUser.error, toastError]);

  // removed obsolete effects for syncing and unconditional reset

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formik.handleSubmit(e);
  };

  return (
    <div className="pe-2 ps-1">
      <section className="flex gap-5 items-center justify-between">
        <div className="text-lg font-bold">
          {isEdit ? 'Edit User' : 'Create New User'}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close user form"
        >
          ×
        </button>
      </section>
      <section>
        <form noValidate onSubmit={handleSubmit} className="w-full space-y-3">
          <section>
            <InputField
              label={
                <>
                  User Name<span className="text-red-500 font-bold">*</span>
                </>
              }
              name="userName"
              type="text"
              placeholder="Enter User Name"
              value={formik.values.userName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.userName
                  ? (formik.errors.userName as string | undefined)
                  : undefined
              }
            />

            <InputField
              label={
                <>
                  Email ID<span className="text-red-500 font-bold">*</span>
                </>
              }
              name="email"
              type="text"
              placeholder="Enter Email ID"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.email
                  ? (formik.errors.email as string | undefined)
                  : undefined
              }
            />

            <InputField
              label={
                <>
                  Password<span className="text-red-500 font-bold">*</span>
                </>
              }
              name="password"
              type="password"
              togglePassword
              placeholder={
                isEdit
                  ? 'Enter new password (leave blank to keep current)'
                  : 'Enter Password'
              }
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              // show either required error (create) or mismatch error
              error={
                formik.touched.password
                  ? (formik.errors.password as string | undefined)
                  : undefined
              }
            />

            <InputField
              label={
                <>
                  Confirm Password
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
              name="confirmPassword"
              type="password"
              togglePassword
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              // per note: confirmPassword itself has no separate validation; no error shown here
            />

            <div className="flex flex-col gap-1 w-full mt-3">
              <label
                htmlFor={`client`}
                className="text-sm font-medium text-gray-900"
              >
                Client<span className="text-red-500 font-bold">*</span>
              </label>
              <Select
                wrapperClassName="w-full"
                placeholder={
                  isTenantsLoading ? 'Loading tenants...' : 'Choose Client'
                }
                options={clientOptions}
                value={formik.values.client}
                disabled={isTenantsLoading}
                onChange={(opt) => {
                  formik.setFieldValue('client', opt ?? null);
                }}
                onBlur={() => formik.setFieldTouched('client', true)}
                suffixIcon={(isOpen) => (
                  <DownChevronGray
                    className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
              />
              {formik.touched.client && formik.errors.client && (
                <p className="text-red-500 text-sm">
                  {formik.errors.client as string}
                </p>
              )}
            </div>

            <MultiSelect
              label={
                <>
                  Application
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
              placeholder={
                isAppsLoading ? 'Loading applications...' : 'Choose Application'
              }
              controlClassName="bg-white h-9 text-sm"
              options={applicationOptions}
              value={formik.values.applications}
              onChange={(opts) => {
                formik.setFieldValue('applications', opts);
              }}
              onBlur={() => formik.setFieldTouched('applications', true)}
              showSelectAll={true}
              selectAllLabel="All"
              showSearch={false}
              suffixIcon={(isOpen) => (
                <DownChevronGray
                  className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                />
              )}
            />
            {formik.touched.applications && formik.errors.applications && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.applications as string}
              </p>
            )}

            <div className="flex flex-col gap-1 w-full mt-3">
              <label
                htmlFor={`role`}
                className="text-sm font-medium text-gray-900"
              >
                Role<span className="text-red-500 font-bold">*</span>
              </label>
              <Select
                wrapperClassName="w-full"
                placeholder={
                  isRolesLoading
                    ? 'Loading roles...'
                    : !selectedTenantId
                      ? 'Select a client first'
                      : 'Choose Role'
                }
                options={roleOptions}
                value={formik.values.role}
                disabled={isRolesLoading || !selectedTenantId}
                onChange={(opt) => {
                  formik.setFieldValue('role', opt ?? null);
                }}
                onBlur={() => formik.setFieldTouched('role', true)}
                suffixIcon={(isOpen) => (
                  <DownChevronGray
                    className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
              />
              {formik.touched.role && formik.errors.role && (
                <p className="text-red-500 text-sm">
                  {formik.errors.role as string}
                </p>
              )}
            </div>
          </section>
          <section className="flex gap-5 pt-6 pb-5">
            <SecondaryButton
              className="text-sm border-gray-300 hover:bg-gray-50 w-full px-4 py-2"
              onClick={() => {
                formik.resetForm();
                onBack();
              }}
              type="button"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              className="text-sm w-full px-4 py-2"
              disabled={
                createUser.isPending || updateUser.isPending || !formik.isValid
              }
            >
              {isEdit ? 'Update User' : 'Create User'}
            </PrimaryButton>
          </section>
        </form>
      </section>
    </div>
  );
};
