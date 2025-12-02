import Calendar from '@/assets/icons/Calendar.svg?react';
import Fail from '@/assets/icons/Fail.svg?react';
import InfoCircle from '@/assets/icons/InfoCircle.svg?react';
import { BugStatus } from '@/constants/appConstant';
import type { IFailureBugResult } from '@/interfaces/Bug';
import { getBadgeStylesForStatus } from '@/utils/badgeStylesUtil';
import { formatDateTimestamp } from '@/utils/dateUtils';
import { cn } from '@/utils/util';
import { useState } from 'react';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Card } from '../shared/card/Card';
import TextCollapse from '../shared/expandableText/TextCollapse';
import { Modal } from '../shared/modal/modal';

export function FailureCardView({
  failedBug,
  handleMarkAsBug,
  handleNotABug,
}: {
  failedBug: IFailureBugResult[];
  handleMarkAsBug: (bug: IFailureBugResult) => void;
  handleNotABug: (bug: IFailureBugResult) => void;
}) {
  const [openSelectedModal, setOpenSelectedModal] =
    useState<IFailureBugResult | null>(null);

  const handleInfoCircleClick = (bug: IFailureBugResult) => {
    setOpenSelectedModal(bug);
  };

  const closeModal = () => {
    setOpenSelectedModal(null);
  };

  return (
    <>
      {!failedBug || failedBug.length === 0 ? (
        <Card className={cn('hover:shadow-md')}>
          <div className="text-center py-8 text-gray-500">
            No failures found
          </div>
        </Card>
      ) : (
        <>
          {failedBug
            .filter(
              (bug) =>
                bug.bugStatus === BugStatus.NOT_REVIEWED ||
                bug.bugStatus === BugStatus.NOT_A_BUG
            )
            .map((bug) => {
              return (
                <div key={bug.id} className="group relative pe-2 pb-3">
                  <Card className={cn('hover:shadow-md')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center justify-start gap-3">
                          <Fail
                            className="w-5 h-5 my-auto text-red-600"
                            aria-label="Failure Icon"
                          />
                          <p className="text-lg font-semibold w-full">
                            {bug.name}
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
                          <p>
                            {formatDateTimestamp(bug.testCaseResult.startTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 mb-auto">
                        {bug.bugStatus === BugStatus.NOT_A_BUG ? (
                          <>
                            <div
                              className={cn(
                                'text-xs mt-1',
                                getBadgeStylesForStatus('PASSED')
                              )}
                            >
                              {'Not a Bug'}
                            </div>
                            <button
                              onClick={() => handleInfoCircleClick(bug)}
                              className="cursor-pointer hover:opacity-70 transition-opacity"
                              aria-label="View bug reason"
                            >
                              <InfoCircle className="w-4 h-4 my-auto" />
                            </button>
                          </>
                        ) : (
                          <>
                            <SecondaryButton
                              onClick={() => handleMarkAsBug(bug)}
                              className={cn(
                                'border-red-300 text-red-600 hover:bg-red-50 hover:text-black text-nowrap px-4 py-2'
                              )}
                            >
                              Mark as Bug
                            </SecondaryButton>
                            <SecondaryButton
                              onClick={() => handleNotABug(bug)}
                              className={cn(
                                'border-green-300 text-green-600 hover:bg-green-50 hover:text-black text-nowrap px-4 py-2'
                              )}
                            >
                              Not a Bug
                            </SecondaryButton>
                          </>
                        )}
                      </div>
                    </div>
                    <TextCollapse
                      message={bug.testCaseResult.errorMessage ?? ''}
                      containerClassName="my-1"
                    />
                  </Card>
                </div>
              );
            })}
          {failedBug.filter(
            (bug) =>
              bug.bugStatus === BugStatus.NOT_REVIEWED ||
              bug.bugStatus === BugStatus.NOT_A_BUG
          ).length === 0 && (
            <Card className={cn('hover:shadow-md')}>
              <div className="text-center py-8 text-gray-500">
                No failures found
              </div>
            </Card>
          )}
        </>
      )}

      {/* Bug Reason Modal */}
      <Modal
        isOpen={openSelectedModal !== null}
        onClose={closeModal}
        className="w-full max-w-lg mx-4"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Reason
            </h3>
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
              <p className="text-sm text-gray-900">{openSelectedModal?.name}</p>
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
