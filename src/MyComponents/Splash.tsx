import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/splash.module.css';
import { strings } from '../locals';

const Splash: React.FC = () => {
  return (
    <div className={styles.splash}>
      <div className={styles.content}>
        <FontAwesomeIcon icon={faBriefcase} className={styles.icon} />
        <h1>Job Tracker</h1>
        <div className={styles.loader}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>
    </div>
  );
};

export default Splash; 