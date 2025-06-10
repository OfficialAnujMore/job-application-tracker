import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { JobApplication } from '../types';
import Header from '../components/Header';
import ApplicationTable from '../components/ApplicationTable';
import KPICards from '../components/KPICards';
import styles from '../styles/dashboard.module.css';

const Dashboard: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const q = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid)
      );

      const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
        const apps: JobApplication[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() } as JobApplication);
        });
        setApplications(apps);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <KPICards applications={applications} />
        <ApplicationTable applications={applications} />
      </main>
    </div>
  );
};

export default Dashboard; 