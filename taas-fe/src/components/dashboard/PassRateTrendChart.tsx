import LineChartIcon from '@/assets/icons/LineChart.svg?react';
import { RunStatus } from '@/constants/appConstant';
import { useAppContext } from '@/context/app/AppContext';
import type { ILineChartPassRate, IRunHistory } from '@/interfaces/Dashboard';
import { formatToShortMonthDay } from '@/utils/dateUtils';
import { calculatePercentage } from '@/utils/util';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface IPassRateTrendChartProps {
  passRateTrendData: IRunHistory[];
  className?: string;
  isPassRateDataLoading: boolean;
}

/**
 * Renders a line chart showing the pass rate trend for the last 10 runs.
 *
 * @command Render a responsive line chart with pass rate (%) over the last 10 runs.
 * @param data - Array of data points with date and passRate.
 * @param className - Optional CSS class for the container.
 * @returns The pass rate trend chart component.
 */
export function PassRateTrendChart({
  passRateTrendData,
  className,
  isPassRateDataLoading,
}: IPassRateTrendChartProps) {
  const {
    state: { selectedApplication },
  } = useAppContext();

  const getPassRateTrendData = (
    runs: IRunHistory[],
    selectedApplicationId?: string
  ): ILineChartPassRate[] => {
    const sortedRuns = [...runs]
      .filter(
        (run) =>
          run.applicationId === selectedApplicationId &&
          run.status === RunStatus.COMPLETED
      )
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      )
      .slice(-10);

    return sortedRuns
      .filter((run) => run.applicationId === selectedApplicationId)
      .map((run, index) => {
        const formattedDate = formatToShortMonthDay(run.startedAt);
        const passRate = calculatePercentage(
          run.passedTests + run.flakyTests,
          run.totalTests - run.skippedTests
        );
        return {
          date: formattedDate,
          xKey: `${formattedDate}-${index}`,
          passRate,
        };
      });
  };

  const passRateTrendList = useMemo(
    () =>
      getPassRateTrendData(
        passRateTrendData ?? [],
        selectedApplication?.value.toString()
      ),
    [passRateTrendData, selectedApplication]
  );
  return (
    <>
      {isPassRateDataLoading ? (
        <SkeletonLoader height="300px" width="100%" borderRadius="10px" />
      ) : (
        <div className={className}>
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            <span className="inline-flex items-center gap-2 text-xl">
              <LineChartIcon className="w-5 h-5" />
              Pass % Trend (Last 10 Runs)
            </span>
          </h3>
          <div className="h-58">
            {passRateTrendList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={passRateTrendList}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={true}
                  />

                  <XAxis
                    dataKey="xKey"
                    tickFormatter={(_, index) => passRateTrendList[index]?.date}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }} // gray x axis line
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={14}
                    tickLine={false}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }} // dark y axis line
                    tickFormatter={(value) => `${value}%`}
                    label={{
                      value: 'Pass %',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      style: {
                        textAnchor: 'middle',
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 14,
                        fontWeight: 500,
                      },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    labelFormatter={(label) => {
                      const cleanLabel = label.split('-')[0];
                      return `Date: ${cleanLabel}`;
                    }}
                    formatter={(value) => [`${value}%`, 'Pass Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="passRate"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{
                      fill: '#22c55e',
                      strokeWidth: 2,
                      r: 4,
                      stroke: 'hsl(var(--background))',
                    }}
                    activeDot={{
                      r: 6,
                      fill: '#22c55e',
                      stroke: 'hsl(var(--background))',
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full flex justify-center items-center h-full text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
