import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/splashScreen.module.css';
import { strings } from '../locals';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
              navigate(currentUser ? '/home' : '/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <svg
            className={styles.briefcase}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Job Tracker</h1>
        <div className={styles.loadingBar}>
          <div className={styles.progress} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 