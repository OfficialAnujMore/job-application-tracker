import React from 'react';
import { JobType, ApplicationStatus } from '../constants';

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  location: string;
  dateApplied: string;
  status: ApplicationStatus;
  jobUrl?: string;
  meetingUrls: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface CustomTextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface KPIData {
  total: number;
  interviewing: number;
  rejected: number;
  accepted: number;
} 