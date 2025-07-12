import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import { UserProfile } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faPlus,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import ProfileMenu from './ProfileMenu';
import styles from '../styles/header.module.css';
import { strings } from '../locals';

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
          } else {
            // Create a fallback user profile if the document doesn't exist
            const fallbackUser: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              createdAt: new Date().toISOString()
            };
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Create a fallback user profile on error
          const fallbackUser: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            createdAt: new Date().toISOString()
          };
          setUser(fallbackUser);
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
      <div className={styles.logo} onClick={() => navigate('/home')}>
        <FontAwesomeIcon icon={faBriefcase} className={styles.logoIcon} />
        <span>{strings.app.title}</span>
      </div>
      <nav className={styles.nav}>
        <button
          className={styles.navButton}
          onClick={() => navigate('/home')}
        >
          <FontAwesomeIcon icon={faChartLine} className={styles.buttonIcon} />
          <span>{strings.app.navigation.home}</span>
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate('/analytics')}
        >
          <FontAwesomeIcon icon={faChartLine} className={styles.buttonIcon} />
          <span>{strings.app.navigation.analytics}</span>
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate('/application/new')}
        >
          <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
          <span>{strings.app.navigation.addApplication}</span>
        </button>
      </nav>
      {user && <ProfileMenu user={user} />}
    </header>
  );
};

export default Header; 