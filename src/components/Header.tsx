import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Config/firebase';
import { UserProfile } from '../Types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faPlus,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import ProfileMenu from './ProfileMenu';
import styles from '../styles/header.module.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className={styles.headerSkeleton} />;
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate('/dashboard')}>
        <FontAwesomeIcon icon={faBriefcase} className={styles.logoIcon} />
        <span>Job Tracker</span>
      </div>
      <nav className={styles.nav}>
        <button
          className={styles.navButton}
          onClick={() => navigate('/dashboard')}
        >
          <FontAwesomeIcon icon={faChartLine} className={styles.buttonIcon} />
          <span>Dashboard</span>
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate('/application/new')}
        >
          <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
          <span>Add Application</span>
        </button>
      </nav>
      {user && <ProfileMenu user={user} />}
    </header>
  );
};

export default Header; 