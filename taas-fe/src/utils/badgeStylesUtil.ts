import {
  BADGE_STYLES_RUN_TYPE,
  BADGE_STYLES_STATUS,
} from '@/constants/appConstant';

type BadgeStatus = keyof typeof BADGE_STYLES_STATUS;

export const getBadgeStylesForRunType = (runType: string): string => {
  if (!runType) return '';

  const normalizedRunType = runType.trim().toLowerCase();

  return normalizedRunType === 'smoke'
    ? BADGE_STYLES_RUN_TYPE.smoke
    : normalizedRunType === 'regression'
      ? BADGE_STYLES_RUN_TYPE.regression
      : BADGE_STYLES_RUN_TYPE.others;
};

export const getBadgeStylesForStatus = (status: string): string => {
  const normalizedStatus = status.toLowerCase() as BadgeStatus;
  if (normalizedStatus in BADGE_STYLES_STATUS) {
    return BADGE_STYLES_STATUS[normalizedStatus];
  }
  return 'px-1.5 py-0 rounded-full border border-gray-400 bg-white font-medium';
};
