import ClientAccountCardDetailView from '@/components/client-account/ClientAccountCardDetailView';
import ClientAccountCardList from '@/components/client-account/ClientAccountCardList';
import { ClientForm } from '@/components/client-account/ClientForm';
import { Modal } from '@/components/shared/modal/modal';
import ScrollPanel from '@/components/shared/scrollPanel/ScrollPanel';
import {
  ACTIVE_STATUS,
  DEFAULT_ADMIN_USER_ID,
  DEFAULT_DB_ANCHOR_TENANT_ID,
  DEFAULT_DB_MODE,
  DEFAULT_PARENT_TENANT_ID,
} from '@/constants/appConstant';
import { useCreateClientMutation } from '@/hooks/mutation/useCreateClientMutation';
import { useUpdateClientMutation } from '@/hooks/mutation/useUpdateClientMutation';
import useGetAllTenants from '@/hooks/useGetAllTenants';
import useGetApplicationsByTenant from '@/hooks/useGetApplicationsByTenant';
import { useToast } from '@/hooks/useToast';
import type { IClientDetails } from '@/interfaces/ClientAccount';
import { cn } from '@/utils/util';
import { useEffect, useState } from 'react';

const ClientAccount = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const {
    data: allTenant,
    isLoading: isAllTenantLoading,
    refetch: refetchAllTenants,
  } = useGetAllTenants();

  const [selectedTenantId, setSelectedTenantId] = useState<
    string | undefined
  >();
  const [SelectedName, setSelectedName] = useState<string>('');
  const [SelectedDomainName, setSelectedDomainName] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: clientDetail,
    isLoading: isClientDetailLoading,
    refetch: refetchApplicationsByTenant,
  } = useGetApplicationsByTenant(selectedTenantId || '');

  useEffect(() => {
    if (isAllTenantLoading || selectedTenantId) return;

    const firstTenant = Array.isArray(allTenant) ? allTenant[0] : undefined;
    if (!firstTenant) return;

    setSelectedTenantId(firstTenant.id);
    setSelectedName(firstTenant.name);
    setSelectedDomainName(firstTenant.domainName);
  }, [isAllTenantLoading, allTenant, selectedTenantId]);

  const selectedTenant: IClientDetails | undefined = (allTenant || []).find(
    (t) => t.id === selectedTenantId
  );

  const clientWithApps =
    selectedTenant && clientDetail
      ? { ...selectedTenant, applications: clientDetail }
      : null;

  const { onCreateClient, createClient } = useCreateClientMutation({
    onSuccess: async (created) => {
      setIsCreateOpen(false);
      setSelectedTenantId(created.id);
      setSelectedName(created.name);
      setSelectedDomainName(created.domainName);
      await refetchAllTenants();
      await refetchApplicationsByTenant();
      showSuccessToast('Client created successfully!');
    },
    onError: (err) => {
      const msg = err?.message?.trim()
        ? err.message
        : 'Failed to create client. Please try again.';
      showErrorToast(msg);
    },
  });

  const { onUpdateClient } = useUpdateClientMutation({
    onSuccess: async (updated) => {
      setIsEditOpen(false);
      setSelectedName(updated.name);
      setSelectedDomainName(updated.domainName);
      await refetchAllTenants();
      await refetchApplicationsByTenant();
      showSuccessToast('Client updated successfully!');
    },
    onError: (err) => {
      const msg = err?.message?.trim()
        ? err.message
        : 'Failed to update client';
      showErrorToast(msg);
    },
  });

  const handleClientSubmit = (values: IClientDetails) => {
    const makeExtId = (name: string) => {
      const prefix = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24);
      const rand = (
        crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
      )
        .replace(/-/g, '')
        .slice(0, 8);
      return `${prefix}-${rand}`;
    };

    onCreateClient({
      tenantDetails: {
        name: values.name,
        description: '',
        tenantExtId: makeExtId(values.name),
        contactPersonName: values.contactPersonName,
        contactEmail: values.contactEmail,
        organizationAddress: values.organizationAddress,
        sectorType: values.sectorType,
        domainName: values.domainName,
      },
      parentTenantId: DEFAULT_PARENT_TENANT_ID,
      defaultTenantAdmin: {
        userDetails: {
          id: DEFAULT_ADMIN_USER_ID,
          status: ACTIVE_STATUS,
        },
      },
      configuration: {
        databaseMode: DEFAULT_DB_MODE,
        dbAnchorTenantId: DEFAULT_DB_ANCHOR_TENANT_ID,
      },
    });
  };

  const editInitialData: IClientDetails | null = selectedTenant ?? null;

  const handleEditSubmit = (values: IClientDetails) => {
    if (!selectedTenantId) return;

    const payload: Partial<IClientDetails> = {
      version: values.version,
      tenantExtId: values.tenantExtId || selectedTenant?.tenantExtId || '',
      name: values.name,
      description: values.description,
      contactPersonName: values.contactPersonName,
      contactEmail: values.contactEmail,
      organizationAddress: values.organizationAddress,
      sectorType: values.sectorType,
      domainName: values.domainName,
    };

    onUpdateClient(selectedTenantId, payload);
  };

  return (
    <div className="flex w-full">
      <ClientAccountCardList
        allTenant={allTenant}
        isAllTenantLoading={isAllTenantLoading}
        selectedTenantId={selectedTenantId}
        onSelectTenant={(tenant) => {
          setSelectedTenantId(tenant.id);
          setSelectedName(tenant.name);
          setSelectedDomainName(tenant.domainName);
        }}
        onCreateNew={() => setIsCreateOpen(true)}
      />

      <ClientAccountCardDetailView
        tenantId={selectedTenantId}
        client={clientWithApps}
        isClientDetailLoading={isClientDetailLoading}
        onEditClient={() => setIsEditOpen(true)}
        name={SelectedName}
        domainName={SelectedDomainName}
        refetchApplicationsByTenant={refetchApplicationsByTenant}
      />

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        className={cn(`w-full max-w-xl max-h-[85vh] mx-4 !pe-2`)}
      >
        <ScrollPanel className="max-h-[80vh]">
          <ClientForm
            mode="create"
            onBack={() => setIsCreateOpen(false)}
            initialData={null}
            onSubmit={handleClientSubmit}
          />
          {createClient.isError ? (
            <div
              className="px-2 pb-3 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              Failed to create client. Please try again.
            </div>
          ) : null}
        </ScrollPanel>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        className={cn(`w-full max-w-xl max-h-[85vh] mx-4 !pe-2`)}
      >
        <ScrollPanel className="max-h-[80vh]">
          <ClientForm
            mode="edit"
            onBack={() => setIsEditOpen(false)}
            initialData={editInitialData}
            onSubmit={handleEditSubmit}
          />
        </ScrollPanel>
      </Modal>
    </div>
  );
};

export default ClientAccount;
