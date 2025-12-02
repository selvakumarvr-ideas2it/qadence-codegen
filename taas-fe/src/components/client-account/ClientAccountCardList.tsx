import BriefcaseIcon from '@/assets/icons/BriefcaseIcon.svg';
import type { IClientDetails } from '@/interfaces/ClientAccount';
import { getBadgeStylesForStatus } from '@/utils/badgeStylesUtil';
import { formatToMonthDayYear } from '@/utils/dateUtils';
import { cn } from '@/utils/util';
import { useEffect, useMemo, useState } from 'react';
import { SearchDropdown } from '../application/SearchDropdown';
import { SearchInput } from '../application/SearchInput';
import { IconButton } from '../shared/buttons/IconButton';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { Card } from '../shared/card/Card';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface ITenantListProps {
  allTenant?: IClientDetails[];
  isAllTenantLoading: boolean;
  selectedTenantId?: string;
  onSelectTenant: (tenant: {
    id: string;
    name: string;
    domainName: string;
  }) => void;
  onCreateNew?: () => void;
}

export default function ClientAccountCardList({
  allTenant,
  isAllTenantLoading,
  selectedTenantId,
  onSelectTenant,
  onCreateNew,
}: ITenantListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayedTenants, setDisplayedTenants] = useState<IClientDetails[]>(
    []
  );

  useEffect(() => {
    if (allTenant && allTenant.length > 0) {
      setDisplayedTenants(allTenant);
    }
  }, [allTenant]);

  useEffect(() => {
    if (!selectedTenantId && displayedTenants.length > 0) {
      const first = displayedTenants[0];
      onSelectTenant({
        id: first.id,
        name: first.name,
        domainName: first.domainName,
      });
    }
  }, [selectedTenantId, displayedTenants, onSelectTenant]);

  const filteredOptions = useMemo(() => {
    if (!allTenant?.length) return [];
    const s = searchTerm.toLowerCase();
    return allTenant.filter((t) => t.name.toLowerCase().includes(s));
  }, [allTenant, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    if (!value) {
      setDisplayedTenants(allTenant || []);
    } else {
      setDisplayedTenants(
        (allTenant || []).filter((t) =>
          t.domainName.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredOptions.length > 0) {
      const first = filteredOptions[0];
      setSearchTerm(first.name);
      setIsDropdownOpen(false);
      setDisplayedTenants((allTenant || []).filter((t) => t.id === first.id));
      onSelectTenant({
        id: first.id,
        name: first.name,
        domainName: first.domainName,
      });
    }
  };

  const handleTenantSelect = (opt: {
    label: string;
    value: string | number;
  }) => {
    setSearchTerm(opt.label);
    setIsDropdownOpen(false);
    const matched = (allTenant || []).find((t) => t.id === String(opt.value));
    setDisplayedTenants(matched ? [matched] : []);
    if (matched) {
      onSelectTenant({
        id: matched.id,
        name: matched.name,
        domainName: matched.domainName,
      });
    }
  };

  return (
    <div className="flex-[1] bg-[#F9FAFB] h-screen">
      <section className="flex items-center justify-between p-4 pe-6 pb-3">
        <div className="flex items-center gap-3">
          <IconButton icon={BriefcaseIcon} alt="RunHistoryIcon" />
          <div className="font-bold text-xl">Client Accounts</div>
        </div>
      </section>
      <section className="flex gap-2 px-4 pe-5">
        <div className="relative">
          <SearchInput
            className={cn(`w-full rounded-sm`)}
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            onFocus={() => setIsDropdownOpen(true)}
          />
          <SearchDropdown
            isOpen={isDropdownOpen && !!searchTerm}
            applicationList={filteredOptions.map((t) => ({
              label: t.name,
              value: t.id,
            }))}
            onSelect={handleTenantSelect}
          />
        </div>
        <div>
          <PrimaryButton
            className={cn(
              'flex items-center justify-center text-sm px-2 py-0.5 rounded-md text-nowrap cursor-pointer'
            )}
            onClick={onCreateNew}
          >
            <span className="opacity-80 text-lg pe-1">+</span>
            New Client Account
          </PrimaryButton>
        </div>
      </section>
      <section className="flex flex-col h-[calc(100vh-149px)] overflow-hidden pt-3 px-1">
        <ScrollPanel header={false}>
          {isAllTenantLoading ? (
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
          ) : displayedTenants?.length > 0 ? (
            displayedTenants.map((tenant) => (
              <Card
                key={tenant.id}
                className={cn('m-3 me-2 mt-0 px-3 py-2.5')}
                isSelected={selectedTenantId === tenant.id}
                onSelect={() =>
                  onSelectTenant({
                    id: tenant.id,
                    name: tenant.name,
                    domainName: tenant.domainName,
                  })
                }
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Created Date - {formatToMonthDayYear(tenant.createdAt)}
                    </div>
                    <span
                      className={cn(
                        'text-xs !px-2 !py-1 !bg-blue-50 !border-blue-700 text-blue-700',
                        getBadgeStylesForStatus(String(tenant.appCount))
                      )}
                    >
                      {tenant.appCount}&nbsp;Application
                    </span>
                  </div>
                  <div
                    className={`font-semibold mt-2 pb-1 ${selectedTenantId === tenant.id ? 'text-blue-600' : 'text-black'}`}
                  >
                    {tenant.name}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <CustomDashedBorderTextCard className="m-3 me-2 mt-0">
              <div className="text-gray-500">
                <div className="text-lg font-medium mb-2">No tenant found</div>
                <div className="text-sm">
                  {searchTerm
                    ? `No tenants match your search "${searchTerm}"`
                    : 'No tenants available at the moment'}
                </div>
              </div>
            </CustomDashedBorderTextCard>
          )}
        </ScrollPanel>
      </section>
    </div>
  );
}
