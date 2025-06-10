import { JobApplication } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateJobApplication = (data: Partial<JobApplication>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredFields: (keyof JobApplication)[] = [
    'companyName',
    'jobTitle',
    'jobType',
    'location',
    'status',
    'dateApplied'
  ];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push({
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      });
    }
  });

  // Company name validation
  if (data.companyName && data.companyName.length < 2) {
    errors.push({
      field: 'companyName',
      message: 'Company name must be at least 2 characters long'
    });
  }

  // Job title validation
  if (data.jobTitle && data.jobTitle.length < 2) {
    errors.push({
      field: 'jobTitle',
      message: 'Job title must be at least 2 characters long'
    });
  }

  // Job type validation
  const validJobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
  if (data.jobType && !validJobTypes.includes(data.jobType.toLowerCase())) {
    errors.push({
      field: 'jobType',
      message: 'Invalid job type'
    });
  }

  // Status validation
  const validStatuses = ['applied', 'interviewing', 'rejected', 'accepted'];
  if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
    errors.push({
      field: 'status',
      message: 'Invalid application status'
    });
  }

  // Date validation
  if (data.dateApplied) {
    const appliedDate = new Date(data.dateApplied);
    const now = new Date();
    if (appliedDate > now) {
      errors.push({
        field: 'dateApplied',
        message: 'Application date cannot be in the future'
      });
    }
  }

  // URL validation (if provided)
  if (data.jobUrl) {
    try {
      new URL(data.jobUrl);
    } catch {
      errors.push({
        field: 'jobUrl',
        message: 'Invalid job URL'
      });
    }
  }

  return errors;
}; 