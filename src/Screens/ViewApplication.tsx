import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import { JobApplication } from '../types';
import { JOB_TYPES, APPLICATION_STATUS } from '../constants';
import Button from '../MyComponents/Button';
import { faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/viewApplication.module.css';
import { strings } from '../locals';

const ViewApplication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async (applicationId: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'applications', applicationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as JobApplication;
        // Check if the application belongs to the current user
        const currentUser = auth.currentUser;
        if (currentUser && data.userId === currentUser.uid) {
          setApplication({ ...data, id: docSnap.id });
        } else {
          setError('Application not found or access denied');
          navigate('/home');
        }
      } else {
        setError('Application not found');
        navigate('/home');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      fetchApplication(id);
    }
  }, [id, fetchApplication]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return styles.applied;
      case 'application-pending':
        return styles.applicationPending;
      case 'interviewing':
        return styles.interviewing;
      case 'rejected':
        return styles.rejected;
      case 'accepted':
        return styles.accepted;
      default:
        return styles.applicationPending;
    }
  };

  const getJobTypeLabel = (jobType: string) => {
    return JOB_TYPES.find(type => type.value === jobType)?.label || jobType;
  };

  const getStatusLabel = (status: string) => {
    return APPLICATION_STATUS.find(s => s.value === status)?.label || status;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{strings.viewApplication.loadingApplication}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <Button onClick={() => navigate('/home')} variant="secondary">
          {strings.viewApplication.backToHome}
        </Button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{strings.viewApplication.applicationNotFound}</div>
        <Button onClick={() => navigate('/home')} variant="secondary">
          {strings.viewApplication.backToHome}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          onClick={() => navigate('/home')}
          variant="secondary"
          icon={faArrowLeft}
        >
          {strings.viewApplication.backToHome}
        </Button>
        <div className={styles.actions}>
          <Button
            onClick={() => navigate(`/application/${application.id}`)}
            icon={faEdit}
          >
            {strings.dashboard.table.actions.edit}
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <h1 className={styles.companyName}>{application.companyName}</h1>
          <h2 className={styles.jobTitle}>{application.jobTitle}</h2>
          <div className={styles.statusBadge}>
            <span 
              className={`${styles.status} ${getStatusColor(application.status)}`}
              data-status={application.status}
            >
              {getStatusLabel(application.status)}
            </span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h3>Job Information</h3>
            <div className={styles.detailItem}>
              <label>Job Type:</label>
              <span>{getJobTypeLabel(application.jobType)}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Location:</label>
              <span>{application.location}</span>
            </div>
            <div className={styles.detailItem}>
              <label>Date Applied:</label>
              <span>{new Date(application.dateApplied).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.detailCard}>
            <h3>Links</h3>
            {application.jobUrl && (
              <div className={styles.detailItem}>
                <label>Job URL:</label>
                <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  View Job Posting
                </a>
              </div>
            )}
            {application.meetingUrl && (
              <div className={styles.detailItem}>
                <label>Meeting URL:</label>
                <a href={application.meetingUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  Join Meeting
                </a>
              </div>
            )}
            {application.otherUrls && application.otherUrls.length > 0 && (
              <div className={styles.detailItem}>
                <label>Other URLs:</label>
                <div className={styles.urlList}>
                  {application.otherUrls.map((urlItem, index) => (
                    <a
                      key={index}
                      href={urlItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {urlItem.name || `URL ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {application.jobDescription && (
          <div className={styles.section}>
            <h3>Job Description</h3>
            <div className={styles.jobDescription}>
              {application.jobDescription.split('\n').map((line, index, array) => (
                <React.Fragment key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {application.notes && (
          <div className={styles.section}>
            <h3>Notes</h3>
            <div className={styles.notes}>
              {application.notes.split('\n').map((line, index, array) => (
                <React.Fragment key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <label>Created:</label>
            <span>{new Date(application.createdAt).toLocaleString()}</span>
          </div>
          <div className={styles.metadataItem}>
            <label>Last Updated:</label>
            <span>{new Date(application.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplication; 