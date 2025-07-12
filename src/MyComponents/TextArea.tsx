import React from 'react';
import styles from '../styles/components.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, error, required, placeholder, ...props }) => (
  <div className={styles.textFieldContainer}>
    <label>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
    <textarea
      className={`${styles.textField} ${styles.textArea} ${error ? styles.error : ''}`}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      {...props}
    />
    {error && <div className={styles.errorMessage}>{error}</div>}
  </div>
);

export default TextArea; 