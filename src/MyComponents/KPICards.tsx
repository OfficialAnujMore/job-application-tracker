import React from 'react';
import { JobApplication } from '../types';
import styles from '../styles/kpiCards.module.css';
import { strings } from '../locals';

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
        <h3>{strings.dashboard.kpi.totalApplications}</h3>
        <p>{kpis.total}</p>
      </div>
      <div className={styles.kpiCard}>
        <h3>{strings.dashboard.kpi.interviewStage}</h3>
        <p>{kpis.interviewing}</p>
      </div>
      <div className={styles.kpiCard}>
        <h3>{strings.dashboard.kpi.rejections}</h3>
        <p>{kpis.rejected}</p>
      </div>
      <div className={styles.kpiCard}>
        <h3>{strings.dashboard.kpi.offers}</h3>
        <p>{kpis.accepted}</p>
      </div>
    </div>
  );
};

export default KPICards; 