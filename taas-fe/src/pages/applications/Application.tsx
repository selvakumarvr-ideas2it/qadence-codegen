import { ApplicationCardDetailView } from '@/components/application/ApplicationCardDetailView';
import { ApplicationCardListView } from '@/components/application/ApplicationCardListView';
import { useAppContext } from '@/context/app/AppContext';
import useGetApplicationListByTenant from '@/hooks/useGetApplicationListByTenant';
import { useCallback, useMemo, useState } from 'react';

const Application = () => {
  const { state: appState } = useAppContext();
  const { selectedApplication } = appState;
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const tenantId = localStorage.getItem('tenant_id');
  const { data: applicationList, isLoading: isApplicationListLoading } =
    useGetApplicationListByTenant(tenantId || '');

  const handleSelectionChange = useCallback((id: string | null) => {
    setSelectedApplicationId(id);
  }, []);

  const validApplicationId = useMemo(() => {
    return selectedApplication &&
      selectedApplicationId !== selectedApplication.value
      ? null
      : selectedApplicationId;
  }, [selectedApplication, selectedApplicationId]);

  const selectedApplicationCount = useMemo(() => {
    if (!applicationList || !validApplicationId) return null;
    const app = applicationList.find((a) => a.id === validApplicationId);
    if (!app) return null;
    return {
      appName: app.appName,
      totalTestSuites: app.totalTestSuites,
      totalTestCases: app.totalTestCases,
      totalTestRuns: app.totalTestRuns,
    };
  }, [applicationList, validApplicationId]);

  return (
    <div className="flex w-full">
      <ApplicationCardListView
        applicationList={applicationList ?? []}
        isLoading={isApplicationListLoading}
        onSelectionChange={handleSelectionChange}
      />
      <ApplicationCardDetailView
        selectedApplicationId={validApplicationId}
        appName={selectedApplicationCount?.appName ?? ''}
        totalTestSuites={selectedApplicationCount?.totalTestSuites ?? 0}
        totalTestCases={selectedApplicationCount?.totalTestCases ?? 0}
        totalTestRuns={selectedApplicationCount?.totalTestRuns ?? 0}
      />
    </div>
  );
};

export default Application;
