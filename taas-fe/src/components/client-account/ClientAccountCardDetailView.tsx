import BrowserIcon from '@/assets/icons/BrowserIcon.svg?react';
import DownChevron from '@/assets/icons/DownChevron.svg?react';
import EditIcon from '@/assets/icons/EditIcon.svg?react';
import EyeCloseIcon from '@/assets/icons/EyeCloseIcon.svg?react';
import EyeIcon from '@/assets/icons/EyeIcon.svg?react';
import MicrosoftIcon from '@/assets/icons/MicrosoftIcon.svg?react';
import UpChevron from '@/assets/icons/UpChevron.svg?react';
import UserSettingsIconBlue from '@/assets/icons/UserSettingsIconBlue.svg?react';
import type {
  IApplicationData,
  IClientDetails,
} from '@/interfaces/ClientAccount';
import { cn } from '@/utils/util';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchDropdown } from '../application/SearchDropdown';
import { SearchInput } from '../application/SearchInput';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Card } from '../shared/card/Card';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import { Modal } from '../shared/modal/modal';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import type { ISelectOption } from '../shared/select/Select';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';
import type { IApplicationFormValues } from './ApplicationForm';
import { ApplicationForm } from './ApplicationForm';

type ClientWithApps = IClientDetails & { applications: IApplicationData[] };

interface IClientDetailViewProps {
  client: ClientWithApps | null;
  tenantId?: string;
  isClientDetailLoading: boolean;
  onEditClient?: () => void;
  name?: string;
  domainName?: string;
  refetchApplicationsByTenant?: () => Promise<
    QueryObserverResult<IApplicationData[], Error>
  >;
}

export default function ClientAccountCardDetailView({
  tenantId,
  client,
  isClientDetailLoading,
  onEditClient,
  name,
  domainName,
  refetchApplicationsByTenant,
}: IClientDetailViewProps) {
  const [showApps, setShowApps] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] =
    useState<boolean>(false);
  const [isEditApplicationModalOpen, setIsEditApplicationModalOpen] =
    useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] =
    useState<IApplicationData | null>(null);
  const navigate = useNavigate();

  // Filter applications based on search term
  const filteredApplications = useMemo<IApplicationData[]>(() => {
    if (!client?.applications || !searchTerm.trim()) {
      return client?.applications || [];
    }

    return client.applications.filter((app) =>
      app.appName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [client?.applications, searchTerm]);

  // Create dropdown options for search suggestions
  const searchOptions = useMemo(() => {
    if (!client?.applications || !searchTerm.trim()) {
      return [];
    }

    return client.applications
      .filter((app) =>
        app.appName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((app) => ({
        label: app.appName,
        value: app.id,
      }));
  }, [client?.applications, searchTerm]);

  const toggleEnvironment = (appId: string) => {
    setShowApps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const togglePassword = (key: string) => {
    setShowPassword((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
  };

  const handleApplicationSelect = (option: ISelectOption) => {
    setSearchTerm(option.label);
    setIsDropdownOpen(false);
  };

  const handleAddApplication = () => {
    setIsApplicationModalOpen(true);
  };

  const handleCloseApplicationModal = () => {
    setIsApplicationModalOpen(false);
  };

  const handleEditApplication = (application: IApplicationData) => {
    setSelectedApplication(application);
    setIsEditApplicationModalOpen(true);
  };

  const handleCloseEditApplicationModal = () => {
    setIsEditApplicationModalOpen(false);
  };

  const mapAppToInitial = (
    app: IApplicationData | null
  ): IApplicationFormValues | null => {
    if (!app) return null;
    const envs: ISelectOption[] = Array.from(
      new Set((app.environments || []).map((e) => e.environmentType))
    ).map((v) => ({ label: v, value: v }));
    const targetBrowsers: ISelectOption[] = Array.from(
      new Set((app.environments || []).map((e) => e.targetBrowser))
    ).map((v) => ({ label: v, value: v }));
    return {
      appName: app.appName,
      applicationType: {
        label: app.applicationType,
        value: app.applicationType,
      },
      appDescription: app.appDescription ?? '',
      environments: envs,
      targetBrowsers,
      targetBrowsersEnv: [] as ISelectOption[],
      databasePreference: 'use_I2I_s3' as const,
      S3BucketEndpoint: '',
      S3APIkey: '',
      SecretKey: '',
      githubRepositoryURL: '',
      githubUsername: '',
      githubPatToken: '',
      environmentConfigByEnv: {} as NonNullable<
        IApplicationFormValues['environmentConfigByEnv']
      >,
    };
  };

  return (
    <div className="flex-[2]">
      {!tenantId || !client || tenantId !== client.id ? (
        <CustomDashedBorderTextCard className="h-40 flex items-center justify-center">
          No Applications Found
        </CustomDashedBorderTextCard>
      ) : (
        <div className="p-6">
          <section className="flex items-center justify-between">
            <div className="flex gap-3 items-center justify-center">
              <div className="text-2xl font-bold">
                <a
                  href={domainName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {name}
                </a>
              </div>
              <SecondaryButton
                className={cn(`gap-2 py-1 px-2 border-gray-300 text-sm`)}
                onClick={onEditClient}
              >
                <EditIcon className="w-4 h-4" />
                Edit
              </SecondaryButton>
            </div>
            <div>
              <SecondaryButton
                className={cn(
                  `border-blue-600 text-sm text-blue-600 py-0.5 px-2`
                )}
                onClick={handleAddApplication}
              >
                <span className="opacity-80 text-lg pe-1">+</span>
                Add Application
              </SecondaryButton>
            </div>
          </section>
          <section className="mt-3 mb-1">
            <div className="relative w-1/3">
              <SearchInput
                className={cn(`w-full rounded-sm`)}
                value={searchTerm}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search for an Application"
              />
              <SearchDropdown
                isOpen={isDropdownOpen && !!searchTerm}
                applicationList={searchOptions}
                onSelect={handleApplicationSelect}
              />
            </div>
          </section>
          <section className="flex flex-col h-[calc(100vh-149px)] overflow-hidden">
            <ScrollPanel header={false}>
              {isClientDetailLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index} className="m-3 me-2 mt-0 px-3 py-2">
                    <SkeletonLoader
                      height="80px"
                      width="100%"
                      borderRadius="12px"
                      className="w-full"
                    />
                  </Card>
                ))
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((app) => {
                  const isExpanded = showApps.has(app.id);
                  return (
                    <div key={app.id}>
                      <Card className="my-3 !bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-lg text-gray-800 flex items-center gap-3">
                            {app.appName}
                            <EditIcon
                              className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800"
                              onClick={() => handleEditApplication(app)}
                            />
                          </div>
                          <div>
                            <SecondaryButton
                              onClick={() => navigate('/user-account')}
                              className={cn(
                                `py-1.5 px-2 border-neutral-200 text-sm text-blue-600 gap-1`
                              )}
                            >
                              <UserSettingsIconBlue />
                              <p>User Management</p>
                            </SecondaryButton>
                          </div>
                        </div>
                        <div className="flex items-center gap-14 my-2">
                          <div className="text-sm flex gap-1 items-center justify-start">
                            <MicrosoftIcon />
                            <p className="font-medium text-gray-600">
                              App Type:
                            </p>
                            <p className="capitalize">
                              {app.applicationType.toLowerCase()}
                            </p>
                          </div>
                          <div className="text-sm flex gap-1 items-center justify-start">
                            <BrowserIcon />
                            <p className="font-medium text-gray-600">
                              Target Browsers:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Array.from(
                                new Set(
                                  app.environments.map((e) => e.targetBrowser)
                                )
                              ).map((browser, idx) => (
                                <span
                                  key={idx}
                                  className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs capitalize"
                                >
                                  {browser.toLowerCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <SecondaryButton
                            onClick={() => toggleEnvironment(app.id)}
                            className={cn(
                              `flex items-center gap-2 border-none text-blue-600 py-1 px-3 text-sm`
                            )}
                          >
                            {isExpanded
                              ? 'Hide Environments'
                              : 'Show Environments'}
                            <span className="flex items-center h-4 w-4">
                              {isExpanded ? <UpChevron /> : <DownChevron />}
                            </span>
                          </SecondaryButton>
                        </div>

                        {/* Environment Card */}
                        {isExpanded && (
                          <>
                            {app.environments && app.environments.length > 0 ? (
                              app.environments.map((env, index) => {
                                const passwordKey = `${app.id}-${index}`;
                                const isShow = showPassword.has(passwordKey);
                                return (
                                  <Card
                                    key={index}
                                    className="my-3 bg-blue-50 border-blue-200"
                                  >
                                    <div>
                                      <h4 className="font-semibold text-lg text-gray-800 mb-3 capitalize ">
                                        {env.environmentType.toLowerCase()}
                                      </h4>
                                      <div className="grid grid-row-2 gap-4">
                                        <div>
                                          <p className="font-medium text-gray-500 text-sm">
                                            URL:
                                          </p>
                                          <p className="text-gray-800 break-all">
                                            {env.url}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-start">
                                          <div className="w-full">
                                            <p className="font-medium text-gray-500 text-sm">
                                              Username:
                                            </p>
                                            <p className="text-gray-800">
                                              {env.credentials?.username}
                                            </p>
                                          </div>
                                          <div className="w-full">
                                            <p className="font-medium text-gray-500 text-sm">
                                              Password:
                                            </p>
                                            <p className="text-sm text-gray-800 flex gap-3">
                                              {isShow
                                                ? env.credentials?.password
                                                : '*'.repeat(
                                                    env.credentials?.password
                                                      ?.length || 8
                                                  )}
                                              {isShow ? (
                                                <EyeCloseIcon
                                                  className={`w-4 h-4 cursor-pointer ${isShow ? 'mt-1' : ''}`}
                                                  onClick={() =>
                                                    togglePassword(passwordKey)
                                                  }
                                                />
                                              ) : (
                                                <EyeIcon
                                                  className={`w-4 h-4 cursor-pointer ${isShow ? 'mt-1' : ''}`}
                                                  onClick={() =>
                                                    togglePassword(passwordKey)
                                                  }
                                                />
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })
                            ) : (
                              <Card className="my-3 bg-gray-50 border-gray-200">
                                <div className="p-4">
                                  <p className="text-gray-500 text-center py-4">
                                    No environments configured for this
                                    application.
                                  </p>
                                </div>
                              </Card>
                            )}
                          </>
                        )}
                      </Card>
                    </div>
                  );
                })
              ) : searchTerm.trim() ? (
                <CustomDashedBorderTextCard className="h-40 flex items-center justify-center">
                  No applications found matching "{searchTerm}"
                </CustomDashedBorderTextCard>
              ) : (
                <CustomDashedBorderTextCard className="h-40 flex items-center justify-center">
                  No applications available
                </CustomDashedBorderTextCard>
              )}
            </ScrollPanel>
          </section>
        </div>
      )}

      {/* Application Form Modal */}
      <Modal
        isOpen={isApplicationModalOpen}
        onClose={handleCloseApplicationModal}
        className={cn(`w-full max-w-xl max-h-[85vh] mx-4 !pe-2 !pt-3`)}
      >
        <ScrollPanel className="max-h-[80vh]">
          <ApplicationForm
            onBack={handleCloseApplicationModal}
            mode="create"
            tenantId={tenantId}
            onSuccess={() => {
              void refetchApplicationsByTenant?.();
            }}
          />
        </ScrollPanel>
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        isOpen={isEditApplicationModalOpen}
        onClose={handleCloseEditApplicationModal}
        className={cn(`w-full max-w-xl max-h-[85vh] mx-4 !pe-2 !pt-3`)}
      >
        <ScrollPanel className="max-h-[80vh]">
          <ApplicationForm
            onBack={handleCloseEditApplicationModal}
            mode="edit"
            initialData={mapAppToInitial(selectedApplication)}
            tenantId={tenantId}
            existingApplication={selectedApplication}
            onSuccess={() => {
              void refetchApplicationsByTenant?.();
            }}
          />
        </ScrollPanel>
      </Modal>
    </div>
  );
}
