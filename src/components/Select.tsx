import React, { SelectHTMLAttributes } from 'react';
import styles from '../Styles/components.module.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: ReadonlyArray<Option>;
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className={styles.selectContainer}>
      <label>{label}</label>
      <select
        className={`${styles.select} ${className || ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select; 