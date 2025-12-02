import Bug from '@/assets/icons/Bug.svg?react';
import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import DownloadIcon from '@/assets/icons/DownloadIcon.svg?react';
import Exclamation from '@/assets/icons/Exclamation.svg?react';
import { BugModalType, BugStatus } from '@/constants/appConstant';
import { useAppContext } from '@/context/app/AppContext';
import { AppReducerActions } from '@/context/app/AppReducer';
import { useBugStatusMutation } from '@/hooks/mutation/useBugStatusMutation';
import { useToast } from '@/hooks/useToast';
import type {
  IBugModalType,
  IConfirmedBugResult,
  IFailureBugResult,
} from '@/interfaces/Bug';
import type { IApplicationSummaryByTenant } from '@/interfaces/Dashboard';
import { cn, transformToLabelValue } from '@/utils/util';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { Card } from '../shared/card/Card';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import type { ISelectOption } from '../shared/select/Select';
import Select from '../shared/select/Select';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';
import TabView, { type TabConfig } from '../shared/tab/TabView';
import { BugStatusModal } from './BugStatusModal';
import { ConfirmedBugView } from './ConfirmedBugView';
import { FailureCardView } from './FailureCardView';

interface IBugListViewProps {
  applicationOptions: IApplicationSummaryByTenant[];
  failedBug: IFailureBugResult[];
  confirmedBug: IConfirmedBugResult[];
  isLoading: boolean;
  refetchFailedBugs: () => Promise<
    QueryObserverResult<IFailureBugResult[], Error>
  >;
  refetchConfirmedBugs: () => Promise<
    QueryObserverResult<IConfirmedBugResult[], Error>
  >;
}

interface IBugHeaderViewProps {
  applicationOptions: IApplicationSummaryByTenant[];
}

function BugHeaderView({ applicationOptions }: IBugHeaderViewProps) {
  const { state, dispatch } = useAppContext();

  // Handler for when the application is changed in the Select dropdown
  const handleApplicationChange = (value?: ISelectOption | null) => {
    dispatch({
      type: AppReducerActions.SET_SELECTED_APPLICATION,
      payload: value ?? null,
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-3xl">Failures</p>
        <p className="text-gray-500">Manage test failures and track bugs</p>
      </div>
      <div className="flex gap-3">
        <PrimaryButton className={cn('gap-3 px-3 py-1 text-sm')}>
          <DownloadIcon className="w-5 h-5" />
          Download Report
        </PrimaryButton>
        <div className="relative min-w-[145px] text-sm">
          <Select
            options={transformToLabelValue(applicationOptions, 'name', 'id')}
            value={state.selectedApplication}
            placeholder="Select an Application"
            onChange={handleApplicationChange}
            showSearch={false}
            allowClear={false}
            suffixIcon={(isOpen) => (
              <DownChevronGray
                className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

type BugTypes = 'FAILURES' | 'CONFIRMED';

const tabConfig: TabConfig<BugTypes>[] = [
  {
    key: 'FAILURES',
    label: 'Failures',
    icon: <Exclamation className="w-4 h-4" />,
    className: '',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed Bugs',
    icon: <Bug className="w-4 h-4" />,
    className: '',
  },
];

function SkeletonLoaderForBugs() {
  return (
    <>
      <Card className={cn('hover:shadow-md')}>
        <div className="p-6">
          <SkeletonLoader height="120px" width="100%" className="rounded" />
        </div>
      </Card>
    </>
  );
}

export function BugListView({
  applicationOptions = [],
  failedBug,
  confirmedBug,
  isLoading,
  refetchFailedBugs,
  refetchConfirmedBugs,
}: IBugListViewProps) {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<BugTypes>('FAILURES');
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  const [modalType, setModalType] = useState<IBugModalType | null>(null);
  const [selectedBug, setSelectedBug] = useState<IFailureBugResult | null>(
    null
  );

  const handleCloseModal = () => {
    setIsBugDialogOpen(false);
    setSelectedBug(null);
  };

  const bugStatusMutation = useBugStatusMutation({
    onCloseModal: handleCloseModal,
    refetchFailedBugs,
    refetchConfirmedBugs,
    onSuccess: (data) => {
      const url = data?.redirectUrl?.trim?.() ?? '';
      if (url) {
        window.location.assign(url);
        return;
      }

      // Show different toast messages based on the action type
      if (modalType === BugModalType.MARK_AS_BUG) {
        toast.success('Test case marked as bug successfully!');
      } else if (modalType === BugModalType.NOT_A_BUG) {
        toast.success('Test case marked as not a bug successfully!');
      }

      navigate('/bugs', { replace: true });
    },
  });

  // Filter failed bugs to only show those with bugStatus === NOT_REVIEWED or NOT_A_BUG
  const filteredFailedBugs = useMemo(() => {
    return (
      failedBug?.filter(
        (bug) =>
          bug.bugStatus === BugStatus.NOT_REVIEWED ||
          bug.bugStatus === BugStatus.NOT_A_BUG
      ) ?? []
    );
  }, [failedBug]);

  // Filter confirmed bugs based on selected application
  const filteredConfirmedBugs = useMemo(() => {
    if (!state.selectedApplication?.value) {
      return confirmedBug ?? [];
    }
    return (
      confirmedBug?.filter(
        (bug) => bug.applicationId === state.selectedApplication?.value
      ) ?? []
    );
  }, [confirmedBug, state.selectedApplication]);

  const bugsCount = useMemo(() => {
    return {
      FAILURES: filteredFailedBugs.length,
      CONFIRMED: filteredConfirmedBugs.length,
    };
  }, [filteredFailedBugs, filteredConfirmedBugs]);

  const handleMarkAsBug = (bug: IFailureBugResult) => {
    setSelectedBug(bug);
    setModalType(BugModalType.MARK_AS_BUG);
    setIsBugDialogOpen(true);
  };

  const handleNotABug = (bug: IFailureBugResult) => {
    setSelectedBug(bug);
    setModalType(BugModalType.NOT_A_BUG);
    setIsBugDialogOpen(true);
  };

  const buildBugPayload = (
    bug: IFailureBugResult,
    bugMessage: string,
    createTicket: boolean = false,
    isBulkMove: boolean = false
  ): Parameters<typeof bugStatusMutation.onBugStatus>[0] => {
    const confirmedBy = localStorage.getItem('user_id') ?? '';
    const trimmedMessage = bugMessage.trim();

    return [
      {
        id: isBulkMove ? bug.id : null,
        applicationId: bug.applicationId,
        applicationName: bug.applicationName,
        runCode: bug.runCode,
        errorMessage:
          bug.testCaseResult?.errorMessage ?? bug.errorMessage ?? '',
        testRunName: bug.testRunName,
        testRunId: bug.testCaseResult?.testRunId ?? bug.testRunId,
        testSuiteId: bug.testSuiteId,
        testCaseId: bug.testCaseResult?.testCaseId ?? bug.id,
        testCaseName: bug.name,
        testCaseResultId: bug.testCaseResult?.id ?? '',
        bugStatus:
          modalType === BugModalType.MARK_AS_BUG
            ? BugStatus.MARKED_AS_BUG
            : BugStatus.NOT_A_BUG,
        browser: bug.browser,
        bugReason: trimmedMessage,
        confirmedBy,
        createTicket,
      },
    ];
  };

  const handleSubmitBug = async (bugMessage: string, createTicket: boolean) => {
    if (!selectedBug || !bugMessage.trim()) return;

    try {
      const payload = buildBugPayload(selectedBug, bugMessage, createTicket);
      await bugStatusMutation.onBugStatus(payload);
    } catch (error) {
      console.error('Failed to mark as bug:', error);
    }
  };

  const handleSubmitNotABug = async (
    bugMessage: string,
    createTicket: boolean
  ) => {
    if (!selectedBug) return;

    try {
      const payload = buildBugPayload(selectedBug, bugMessage, createTicket);
      await bugStatusMutation.onBugStatus(payload);
    } catch (error) {
      console.error('Failed to mark as bug:', error);
    }
  };

  const handleModalSubmit = async (message: string, createTicket: boolean) => {
    if (modalType === BugModalType.MARK_AS_BUG) {
      await handleSubmitBug(message, createTicket);
    } else {
      await handleSubmitNotABug(message, createTicket);
    }
  };

  return (
    <div className="p-7 bg-gray-50 h-screen">
      <section>
        <BugHeaderView applicationOptions={applicationOptions} />
      </section>
      <section className="py-4">
        <TabView<BugTypes>
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showCounts={true}
          counts={bugsCount}
          variant="bug-list"
        />
      </section>
      <section>
        {isLoading ? (
          <SkeletonLoaderForBugs />
        ) : (
          <>
            {activeTab === 'FAILURES' ? (
              <ScrollPanel
                header={false}
                className={cn(`!pe-1 !h-[calc(100vh-170px)]`)}
              >
                <FailureCardView
                  failedBug={filteredFailedBugs}
                  handleMarkAsBug={handleMarkAsBug}
                  handleNotABug={handleNotABug}
                />
              </ScrollPanel>
            ) : (
              <ScrollPanel
                header={false}
                className={cn(`!pe-1 !h-[calc(100vh-170px)]`)}
              >
                <ConfirmedBugView
                  confirmedBug={filteredConfirmedBugs}
                  refetchFailedBugs={refetchFailedBugs}
                  refetchConfirmedBugs={refetchConfirmedBugs}
                />
              </ScrollPanel>
            )}
          </>
        )}
      </section>
      {modalType && (
        <BugStatusModal
          isOpen={isBugDialogOpen}
          onClose={handleCloseModal}
          modalType={modalType}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}
