import { Header } from '@/components/dashboard/Header';
import LastRunDetails from '@/components/dashboard/LastRunDetails';
import { PassRateTrendChart } from '@/components/dashboard/PassRateTrendChart';
import { useAppContext } from '@/context/app/AppContext';
import useGetAllTestRuns from '@/hooks/useGetAllTestRuns';
import useGetLastRunAndRegression from '@/hooks/useGetLastRunAndRegression';

/**
 * Dashboard component renders the main dashboard view.
 *
 * Command line explanation for this file:
 * - This file defines a React functional component for the dashboard page.
 * - It displays a list of recent test runs using the TestRunCard component for each run.
 * - It also shows a pass rate trend chart using the PassRateTrendChart component.
 * - The test run data and chart data are imported as mock data from DashboardService.
 * - Layout and styling are handled with Tailwind CSS utility classes.
 */
const Dashboard = () => {
  const { state: appState } = useAppContext();
  const applicationId = appState.selectedApplication?.value;

  const { data: passRateTrendData, isLoading: isPassRateDataLoading } =
    useGetAllTestRuns(applicationId);

  const {
    data: lastRunAndRegressionData,
    isLoading: isLastRunAndRegressionDataLoading,
  } = useGetLastRunAndRegression(applicationId);

  return (
    <div className="p-6 pb-4">
      <Header />
      <div className="space-y-5">
        <LastRunDetails
          lastRunAndRegressionData={lastRunAndRegressionData ?? null}
          isLastRunAndRegressionDataLoading={isLastRunAndRegressionDataLoading}
        />

        {/* Pass Rate Trend Chart */}
        <section className="bg-white rounded-lg border border-gray-300 shadow-card p-5">
          <PassRateTrendChart
            passRateTrendData={passRateTrendData || []}
            isPassRateDataLoading={isPassRateDataLoading}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
