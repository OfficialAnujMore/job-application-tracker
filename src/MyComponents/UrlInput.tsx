import React from 'react';
import styles from '../styles/components.module.css';
import { strings } from '../locals';

interface UrlInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const UrlInput: React.FC<UrlInputProps> = ({ label, value, onChange, error, required, placeholder, ...props }) => (
  <div className={styles.textFieldContainer}>
    <label>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
    <input
      type="url"
      className={`${styles.textField} ${error ? styles.error : ''}`}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder || strings.urlInput.placeholder}
      {...props}
    />
    {error && <div className={styles.errorMessage}>{error}</div>}
  </div>
);

export default UrlInput; 