import React from 'react';
import { JobApplication } from '../Types';
import styles from '../Styles/kpiCards.module.css';

interface KPICardsProps {
  applications: JobApplication[];
}

const KPICards: React.FC<KPICardsProps> = ({ applications }) => {
  const getKPIs = () => {
    const total = applications.length;
    const interviewing = applications.filter(
      (app) => app.status === 'interviewing'
    ).length;
    const rejected = applications.filter(
      (app) => app.status === 'rejected'
    ).length;
    const accepted = applications.filter(
      (app) => app.status === 'accepted'
    ).length;
    return { total, interviewing, rejected, accepted };
  };

  const kpis = getKPIs();

  return (
    <div className={styles.kpiContainer}>
      <div className={styles.kpiCard}>
        <h3>Total Applications</h3>
        <p>{kpis.total}</p>
      </div>
      <div className={styles.kpiCard}>
        <h3>Interview Stage</h3>
        <p>{kpis.interviewing}</p>
      </div>
      <div className={styles.kpiCard}>
        <h3>Rejections</h3>
        <p>{kpis.rejected}</p>
      </div>
      <div className={styles.kpiCard}>
        <h3>Offers</h3>
        <p>{kpis.accepted}</p>
      </div>
    </div>
  );
};

export default KPICards; 