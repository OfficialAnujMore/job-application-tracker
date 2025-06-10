export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
] as const;

export const APPLICATION_STATUS = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Accepted' },
] as const;

export const SORT_FIELDS = {
  COMPANY_NAME: 'companyName',
  DATE_APPLIED: 'dateApplied',
  STATUS: 'status',
  JOB_TYPE: 'jobType',
} as const;

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type JobType = typeof JOB_TYPES[number]['value'];
export type ApplicationStatus = typeof APPLICATION_STATUS[number]['value'];
export type SortField = typeof SORT_FIELDS[keyof typeof SORT_FIELDS];
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS]; 