import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes.
 * @param inputs - List of class values to combine.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Transforms an array of objects into an array of {label, value} pairs.
 *
 * @param data - The input array of objects
 * @param labelKey - The property to use for the label
 * @param valueKey - The property to use for the value
 * @returns Transformed array of {label, value} objects
 */
export function transformToLabelValue<T, K extends keyof T, V extends keyof T>(
  data: T[],
  labelKey: K,
  valueKey: V
): { label: string; value: T[V] }[] {
  return data.map((item) => ({
    label: String(item[labelKey]),
    value: item[valueKey],
  }));
}

/* ------------------------- Normalization Utilities ------------------------ */

const normalizeWithMap = (v: string, map: Record<string, string>) => {
  const key = v.toLowerCase();
  return map[key] ?? v.toUpperCase();
};

const APP_TYPE_MAP: Record<string, string> = {
  web: 'WEB',
  mobile: 'MOBILE',
  api: 'API',
};

const ENV_MAP: Record<string, string> = {
  dev: 'DEV',
  qa: 'QA',
  uat: 'UAT',
  staging: 'STAGING',
  production: 'PRODUCTION',
  prod: 'PRODUCTION',
};

const BROWSER_MAP: Record<string, string> = {
  chrome: 'CHROME',
  firefox: 'FIREFOX',
  edge: 'EDGE',
  safari: 'SAFARI',
};

export const normalizeAppType = (v: string) =>
  normalizeWithMap(v, APP_TYPE_MAP);
export const normalizeEnv = (v: string) => normalizeWithMap(v, ENV_MAP);
export const normalizeBrowser = (v: string) => normalizeWithMap(v, BROWSER_MAP);

export const mapS3Preference = (v: 'use_I2I_s3' | 'bring_your_own_s3') =>
  v === 'use_I2I_s3' ? 'IDEAS2IT_BUCKET' : 'CUSTOM';

export const makeExtId = (name: string) => {
  const prefix = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  const rand = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2))
    .replace(/-/g, '')
    .slice(0, 8);
  return `${prefix}-${rand}`;
};

export const calculatePercentage = (part: number, total: number): number =>
  total === 0 ? 0 : Math.round((part / total) * 100);
