import React, { InputHTMLAttributes } from 'react';
import styles from '../styles/components.module.css';

interface CustomTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({ 
  label, 
  error,
  className,
  ...props 
}) => {
  return (
    <div className={styles.textFieldContainer}>
      <label>{label}</label>
      <input 
        className={`${styles.textField} ${error ? styles.error : ''} ${className || ''}`}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default CustomTextField; 