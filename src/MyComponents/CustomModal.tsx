import React from 'react';
import styles from '../styles/components.module.css';
import { strings } from '../locals';

interface CustomModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {title && <h2 className={styles.modalTitle}>{title}</h2>}
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onCancel}>{cancelText || strings.form.validation.cancel}</button>
          <button className={styles.modalConfirm} onClick={onConfirm}>{confirmText || strings.form.validation.confirm}</button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal; 