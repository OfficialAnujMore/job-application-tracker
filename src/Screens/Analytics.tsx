import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import { JobApplication } from '../types';
import Header from '../MyComponents/Header';
import Splash from '../MyComponents/Splash';
import styles from '../styles/dashboard.module.css';

const Analytics: React.FC = () => {
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

  const getAnalytics = () => {
    const total = applications.length;
    const interviewing = applications.filter(app => app.status === 'interviewing').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const applied = applications.filter(app => app.status === 'applied').length;

    // Calculate success rate
    const successRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0';

    // Calculate average time to response (simplified)
    const applicationsWithDates = applications.filter(app => app.dateApplied);
    const avgResponseTime = applicationsWithDates.length > 0 
      ? applicationsWithDates.reduce((acc, app) => {
          const appliedDate = new Date(app.dateApplied);
          const updatedDate = new Date(app.updatedAt);
          return acc + (updatedDate.getTime() - appliedDate.getTime());
        }, 0) / applicationsWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Get top companies
    const companyCounts = applications.reduce((acc, app) => {
      acc[app.companyName] = (acc[app.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCompanies = Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Get job type distribution
    const jobTypeCounts = applications.reduce((acc, app) => {
      acc[app.jobType] = (acc[app.jobType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      interviewing,
      rejected,
      accepted,
      applied,
      successRate,
      avgResponseTime: Math.round(avgResponseTime),
      topCompanies,
      jobTypeCounts
    };
  };

  if (loading) {
    return <Splash />;
  }

  const analytics = getAnalytics();

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '30px', color: '#333' }}>Analytics Dashboard</h1>
          
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Applications</h3>
              <p style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold', color: '#333' }}>{analytics.total}</p>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Success Rate</h3>
              <p style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold', color: '#28a745' }}>{analytics.successRate}%</p>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Avg Response Time</h3>
              <p style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold', color: '#007bff' }}>{analytics.avgResponseTime} days</p>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Active Applications</h3>
                              <p style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold', color: '#ffc107' }}>{analytics.interviewing + analytics.applied}</p>
            </div>
          </div>

          {/* Status Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Application Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Applied</span>
                  <span style={{ fontWeight: 'bold', color: '#007bff' }}>{analytics.applied}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Interviewing</span>
                  <span style={{ fontWeight: 'bold', color: '#ffc107' }}>{analytics.interviewing}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Rejected</span>
                  <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{analytics.rejected}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Accepted</span>
                  <span style={{ fontWeight: 'bold', color: '#28a745' }}>{analytics.accepted}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Job Type Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {Object.entries(analytics.jobTypeCounts).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    <span style={{ fontWeight: 'bold', color: '#007bff' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Companies */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Top Companies Applied To</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {analytics.topCompanies.map(([company, count], index) => (
                <div key={company} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>{company}</span>
                  <span style={{ fontWeight: 'bold', color: '#007bff' }}>{count} applications</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics; 