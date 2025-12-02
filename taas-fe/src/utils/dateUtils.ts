import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

export const formatDateTimestamp = (dateString: string): string => {
  dayjs.extend(utc);
  return dayjs(dateString).local().format('MM/DD/YYYY, HH:mm:ss');
};

export const formatTimeDuration = (secs: number): string => {
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  if (mins > 0) {
    return `${mins}m ${seconds}s`;
  }

  return `${seconds}s`;
};

export const formatToShortMonthDay = (dateString: string): string => {
  return dayjs(dateString).format('MMM D');
};

export const formatToMonthDayYear = (dateString: string): string => {
  return dayjs(dateString).format('MM/DD/YYYY');
};
