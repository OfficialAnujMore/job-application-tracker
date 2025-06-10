import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { auth, db } from '../Config/firebase';
import { JobApplication } from '../Types';
import { JOB_TYPES, APPLICATION_STATUS } from '../Constants';
import Button from '../Components/Button';
import Select from '../Components/Select';
import CustomTextField from '../Components/CustomTextField';
import { faPlus, faTimes, faSave, faTimes as faCancel } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/form.module.css';

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<JobApplication>>({
    companyName: '',
    jobTitle: '',
    jobType: 'full-time',
    location: '',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'applied',
    jobUrl: '',
    meetingUrls: [''],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'applications', applicationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFormData(docSnap.data() as JobApplication);
      } else {
        setError('Application not found');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      fetchApplication(id);
    }
  }, [id, isEditing, navigate]);

  const validateDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    
    // Set both dates to start of day for comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return selectedDate <= today;
  };

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    if (field === 'dateApplied') {
      const selectedDate = new Date(value);
      const today = new Date();
      
      // Set both dates to start of day for comparison
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        setError('Date applied cannot be in the future');
        return;
      }
    }
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDate(formData.dateApplied || '')) {
      setError('Date applied cannot be in the future');
      return;
    }

    if (!formData.companyName || !formData.jobTitle || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      const applicationData = {
        ...formData,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'applications', id), applicationData);
      } else {
        applicationData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'applications'), applicationData);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving application:', err);
      setError('Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingUrlChange = (index: number, value: string) => {
    const newMeetingUrls = [...(formData.meetingUrls || [''])];
    newMeetingUrls[index] = value;
    setFormData((prev) => ({ ...prev, meetingUrls: newMeetingUrls }));
  };

  const addMeetingUrl = () => {
    setFormData((prev) => ({
      ...prev,
      meetingUrls: [...(prev.meetingUrls || []), ''],
    }));
  };

  const removeMeetingUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      meetingUrls: prev.meetingUrls?.filter((_, i) => i !== index) || [''],
    }));
  };

  return (
    <div className={styles.container}>
      <h1>{isEditing ? 'Edit Application' : 'Add New Application'}</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={`${styles.form} ${loading ? styles.loading : ''}`}>
        <div className={styles.formGrid}>
          <CustomTextField
            label="Company Name"
            value={formData.companyName || ''}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            required
          />
          <CustomTextField
            label="Job Title"
            value={formData.jobTitle || ''}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            required
          />
          <Select
            label="Job Type"
            options={JOB_TYPES}
            value={formData.jobType || 'full-time'}
            onChange={(value) => handleInputChange('jobType', value)}
            required
          />
          <CustomTextField
            label="Location"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            required
          />
          <CustomTextField
            label="Date Applied"
            type="date"
            value={formData.dateApplied || ''}
            onChange={(e) => handleInputChange('dateApplied', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          <Select
            label="Status"
            options={APPLICATION_STATUS}
            value={formData.status || 'applied'}
            onChange={(value) => handleInputChange('status', value)}
            required
          />
          <CustomTextField
            label="Job URL"
            type="url"
            value={formData.jobUrl || ''}
            onChange={(e) => handleInputChange('jobUrl', e.target.value)}
            placeholder="https://example.com/job-posting"
          />
          <div className={styles.meetingUrls}>
            <label>Meeting URLs</label>
            {formData.meetingUrls?.map((url, index) => (
              <div key={index} className={styles.meetingUrlInput}>
                <CustomTextField
                  label={`Meeting URL ${index + 1}`}
                  type="url"
                  value={url}
                  onChange={(e) => handleMeetingUrlChange(index, e.target.value)}
                  placeholder="https://meet.example.com"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="danger"
                    icon={faTimes}
                    onClick={() => removeMeetingUrl(index)}
                    className={styles.removeButton}
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              icon={faPlus}
              onClick={addMeetingUrl}
              className={styles.addButton}
            >
              Add Meeting URL
            </Button>
          </div>
          <CustomTextField
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or comments"
          />
          <div className={styles.buttons}>
            <Button type="submit" icon={faSave} isLoading={loading}>
              {isEditing ? 'Update Application' : 'Add Application'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={faCancel}
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm; 