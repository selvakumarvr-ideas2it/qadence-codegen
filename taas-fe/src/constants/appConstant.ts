export const RunType = {
  SMOKE: 'smoke',
  REGRESSION: 'regression',
  OTHERS: 'others',
} as const;

export const StatusType = {
  PASSED: 'passed',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ABORTED: 'aborted',
  SKIPPED: 'skipped',
  FLAKY: 'flaky',
  PENDING: 'pending',
  RUNNING: 'running',
  NOT_EXECUTED: 'not-executed',
  CONFORM_BUG: 'confirmed bug',
  IN_PROGRESS: 'in_progress',
} as const;

// Bug modal types and statuses
export const BugModalType = {
  MARK_AS_BUG: 'MARK_AS_BUG',
  NOT_A_BUG: 'NOT_A_BUG',
} as const;

export const BugStatus = {
  NOT_REVIEWED: 'NOT_REVIEWED',
  NOT_A_BUG: 'NOT_A_BUG',
  MARKED_AS_BUG: 'MARKED_AS_BUG',
} as const;

export const RunStatus = {
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  ABORTED: 'ABORTED',
  IN_PROGRESS: 'IN_PROGRESS',
} as const;

export const TestCaseStatus = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  FLAKY: 'FLAKY',
} as const;

// Color scheme constants for better maintainability
const BADGE_COLORS = {
  SUCCESS:
    'bg-green-50 text-green-900 border border-green-200 font-medium rounded-full px-1.5 py-0 capitalize',
  INFO: 'bg-blue-50 text-blue-900 border border-blue-200 font-medium rounded-4xl px-1.5 py-0 capitalize',
  SKIPPED:
    'bg-charcoal-100 text-charcoal-600 border border-charcoal-300 font-medium rounded-4xl px-1.5 py-0 capitalize',
  WARNING:
    'bg-yellow-50 text-yellow-900 border border-yellow-200 font-medium rounded-4xl px-1.5 py-0 capitalize',
  ERROR:
    'bg-red-50 text-red-900 border border-red-200 font-medium rounded-4xl px-1.5 py-0 capitalize',
  NEUTRAL:
    'bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-4xl px-1.5 py-0 capitalize',
  PRIMARY:
    'bg-purple-50 text-purple-900 border border-purple-200 font-medium rounded-4xl px-1.5 py-0 capitalize',
  INPROGRESS:
    'bg-blue-100 text-blue-800 border border-blue-300 font-medium rounded-full px-1.5 py-0 capitalize',
  FLAKY:
    'bg-golden-100 text-golden-600 border border-golden-300 font-medium rounded-full px-1.5 py-0 capitalize',
} as const;

export const BADGE_STYLES_RUN_TYPE = {
  [RunType.SMOKE]: BADGE_COLORS.SUCCESS,
  [RunType.REGRESSION]: BADGE_COLORS.INFO,
  [RunType.OTHERS]: BADGE_COLORS.PRIMARY,
} as const;

export const BADGE_STYLES_STATUS = {
  [StatusType.PASSED]: BADGE_COLORS.SUCCESS,
  [StatusType.COMPLETED]: BADGE_COLORS.SUCCESS,
  [StatusType.FAILED]: BADGE_COLORS.ERROR,
  [StatusType.ABORTED]: BADGE_COLORS.ERROR,
  [StatusType.SKIPPED]: BADGE_COLORS.SKIPPED,
  [StatusType.PENDING]: BADGE_COLORS.WARNING,
  [StatusType.RUNNING]: BADGE_COLORS.WARNING,
  [StatusType.NOT_EXECUTED]: BADGE_COLORS.NEUTRAL,
  [StatusType.CONFORM_BUG]: BADGE_COLORS.ERROR,
  [StatusType.IN_PROGRESS]: BADGE_COLORS.INPROGRESS,
  [StatusType.FLAKY]: BADGE_COLORS.FLAKY,
} as const;

// Constant values for creating a client
export const DEFAULT_PARENT_TENANT_ID = '11110001-0000-0000-0000-000000000000';

export const DEFAULT_ADMIN_USER_ID = '11111111-1111-1111-1111-111111111111';

export const DEFAULT_DB_MODE = 'ROW' as const;

export const DEFAULT_DB_ANCHOR_TENANT_ID =
  '11110001-0000-0000-0000-000000000000';

export const ACTIVE_STATUS = 'ACTIVE';

export const SOURCE_TYPE = 'FRONTEND';

export const SCOPE = {
  SINGLE: 'single',
  ALL: 'all',
} as const;

export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
  DISMISS: 'dismiss',
  DISMISS_ALL: 'dismissAll',
} as const;

export const PLACEMENT = {
  DOWN: 'down',
  UP: 'up',
} as const;

export const SCRIPT_STATUS = {
  SUCCESS: 'Success',
  FAILED: 'Failure',
} as const;
