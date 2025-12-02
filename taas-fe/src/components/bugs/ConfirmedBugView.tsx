import Bug from '@/assets/icons/Bug.svg?react';
import Calendar from '@/assets/icons/Calendar.svg?react';
import CreateTicket from '@/assets/icons/CreateTicket.svg?react';
import CreateTicketBlue from '@/assets/icons/CreateTicketBlue.svg?react';
import InfoCircle from '@/assets/icons/InfoCircle.svg?react';
import { BugStatus } from '@/constants/appConstant';
import { useBugStatusMutation } from '@/hooks/mutation/useBugStatusMutation';
import { useToast } from '@/hooks/useToast';
import type {
  IBugStatus,
  IConfirmedBugResult,
  IFailureBugResult,
} from '@/interfaces/Bug';
import { formatDateTimestamp } from '@/utils/dateUtils';
import { cn } from '@/utils/util';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useState } from 'react';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Card } from '../shared/card/Card';
import TextCollapse from '../shared/expandableText/TextCollapse';
import { Modal } from '../shared/modal/modal';

export function ConfirmedBugView({
  confirmedBug,
  refetchFailedBugs,
  refetchConfirmedBugs,
}: {
  confirmedBug: IConfirmedBugResult[];
  refetchFailedBugs: () => Promise<
    QueryObserverResult<IFailureBugResult[], Error>
  >;
  refetchConfirmedBugs: () => Promise<
    QueryObserverResult<IConfirmedBugResult[], Error>
  >;
}) {
  const toast = useToast();
  const [openSelectedModal, setOpenSelectedModal] =
    useState<IConfirmedBugResult | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set()
  );

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBugStatusSuccess = (data: IBugStatus) => {
    const redirectUrl = data?.redirectUrl?.trim?.() ?? '';
    if (redirectUrl) {
      window.location.assign(redirectUrl);
      return;
    }

    toast.success('Tickets created successfully.');
    handleDeselectAll();
  };

  const { markAsBug, onBugStatus } = useBugStatusMutation({
    refetchFailedBugs,
    refetchConfirmedBugs,
    onSuccess: handleBugStatusSuccess,
  });

  const buildBulkPayload = (bugs: IConfirmedBugResult[]) => {
    const confirmedBy = localStorage.getItem('user_id') ?? '';
    return bugs.map((bug) => ({
      id: bug.id,
      applicationId: bug.applicationId,
      applicationName: bug.applicationName,
      runCode: bug.runCode,
      errorMessage: bug.errorMessage ?? '',
      testRunName: bug.testRunName,
      testRunId: bug.testRunId,
      testSuiteId: bug.testSuiteId,
      testCaseId: bug.testCaseId,
      testCaseName: bug.testCaseName,
      testCaseResultId: bug.testCaseResultId,
      bugStatus: BugStatus.MARKED_AS_BUG,
      browser: bug.browser,
      bugReason: bug.bugReason ?? 'Bulk ticket creation',
      confirmedBy: bug.confirmedBy ?? confirmedBy,
      createTicket: true,
    }));
  };

  const handleBulkMove = () => {
    if (markAsBug.isPending || selectedIds.size === 0) {
      return;
    }

    const selectedBugs = confirmedBug.filter(
      (bug) => selectedIds.has(bug.id) && !bug.bugTicketKey
    );

    if (selectedBugs.length === 0) {
      toast.info('Only bugs without tickets can be moved.');
      return;
    }

    const payload = buildBulkPayload(selectedBugs);
    onBugStatus(payload);
  };

  const handleInfoCircleClick = (bug: IConfirmedBugResult) => {
    setOpenSelectedModal(bug);
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      next.add(id);
      return next;
    });
  };

  const isSelected = (id: string | number) => selectedIds.has(id);

  const closeModal = () => {
    setOpenSelectedModal(null);
  };

  return (
    <>
      {!confirmedBug || confirmedBug.length === 0 ? (
        <Card className={cn('hover:shadow-md')}>
          <div className="text-center py-8 text-gray-500">
            No confirmed Bug found
          </div>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>{selectedIds.size} Bugs Selected</div>
            <div className="flex items-center gap-2">
              <SecondaryButton
                onClick={handleDeselectAll}
                aria-label="Deselect all bugs"
                disabled={selectedIds.size === 0}
                className="px-4 py-2 text-sm border-gray-300 text-gray-950"
              >
                Deselect All
              </SecondaryButton>
              <PrimaryButton
                onClick={handleBulkMove}
                disabled={selectedIds.size === 0 || markAsBug.isPending}
                aria-label="Create tickets for selected bugs"
                className="px-4 py-2 text-sm border-gray-300 text-gray-950 flex items-center gap-2 disabled:opacity-60"
              >
                <CreateTicket className="w-5 h-5 my-auto" />
                {markAsBug.isPending ? 'Creating...' : 'Create a Ticket'}
              </PrimaryButton>
            </div>
          </div>
          {confirmedBug.map((bug) => {
            return (
              <Card
                key={bug.id}
                aria-selected={isSelected(bug.id)}
                isSelected={isSelected(bug.id)}
                className={cn('group relative hover:shadow-md me-2 mb-3')}
              >
                <div className="flex gap-3 w-full">
                  <div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-indigo-600 cursor-pointer mt-1.5"
                      aria-label="Select bug card"
                      checked={isSelected(bug.id)}
                      onChange={() => handleToggleSelect(bug.id)}
                      disabled={Boolean(bug.bugTicketKey)}
                    />
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center justify-start gap-3">
                          <Bug
                            className="w-5 h-5 my-auto text-red-600"
                            aria-label="Bug Icon"
                          />
                          <p className="text-lg font-semibold w-full flex items-center gap-2">
                            {bug.testCaseName}{' '}
                            <a
                              href={`https://ideas2it-taas.atlassian.net/browse/${bug.bugTicketKey}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {bug.bugTicketKey !== null ? (
                                <CreateTicketBlue className="w-5 h-5 my-auto" />
                              ) : (
                                ''
                              )}
                            </a>
                          </p>
                        </div>
                        <div className="flex items-center justify-start text-gray-500 gap-6 text-sm my-1">
                          <p>
                            Run ID: {bug.runCode} - {bug.testRunName}
                          </p>
                          <p>Suite: {bug.applicationName}</p>
                          <p>Browser: {bug.browser}</p>
                        </div>
                        <div className="flex items-center justify-start text-gray-500 gap-2 text-sm">
                          <Calendar
                            className="w-4 h-4 my-auto"
                            aria-label="Calendar Icon"
                          />
                          <p>{formatDateTimestamp(bug.startTime)}</p>
                        </div>
                      </div>
                      {bug.bugReason && (
                        <button
                          onClick={() => handleInfoCircleClick(bug)}
                          className="cursor-pointer hover:opacity-70 transition-opacity mb-auto"
                          aria-label="View bug reason"
                        >
                          <InfoCircle className="w-4 h-4 my-auto" />
                        </button>
                      )}
                    </div>
                    <TextCollapse
                      message={bug.errorMessage ?? ''}
                      containerClassName="my-2"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bug Reason Modal */}
      <Modal
        isOpen={openSelectedModal !== null}
        onClose={closeModal}
        className="w-full max-w-lg mx-4"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Reason</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Test Case:
              </h4>
              <p className="text-sm text-gray-900">
                {openSelectedModal?.testCaseName}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Reason:
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-sm text-gray-900">
                  {openSelectedModal?.bugReason || 'No bug reason provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <SecondaryButton onClick={closeModal} className="px-6 py-1.5">
              Close
            </SecondaryButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
