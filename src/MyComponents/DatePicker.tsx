import React from 'react';
import styles from '../styles/components.module.css';
import { strings } from '../locals';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, error, required, placeholder, ...props }) => (
  <div className={styles.textFieldContainer}>
    <label>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
    <input
      type="date"
      className={`${styles.textField} ${error ? styles.error : ''}`}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      {...props}
    />
    {error && <div className={styles.errorMessage}>{error}</div>}
  </div>
);

export default DatePicker; 