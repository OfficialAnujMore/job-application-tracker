import React, { ButtonHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from '../styles/components.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: IconDefinition;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  isLoading,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className={styles.loader} />
      ) : (
        <>
          {icon && <FontAwesomeIcon icon={icon} className={styles.buttonIcon} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button; 