import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import { JobApplication } from '../types';
import { JOB_TYPES, APPLICATION_STATUS } from '../constants';
import Button from '../MyComponents/Button';
import Select from '../MyComponents/Select';
import TextInput from '../MyComponents/TextInput';
import TextArea from '../MyComponents/TextArea';
import DatePicker from '../MyComponents/DatePicker';
import UrlInput from '../MyComponents/UrlInput';
import { RichTextEditor } from '../MyComponents/CustomTextField';
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
    meetingUrl: '',
    otherUrls: [{ name: '', url: '' }],
    jobDescription: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async (applicationId: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'applications', applicationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFormData(docSnap.data() as JobApplication);
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
    if (isEditing && id) {
      fetchApplication(id);
    }
  }, [id, isEditing, navigate, fetchApplication]);

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

              navigate('/home');
    } catch (err) {
      console.error('Error saving application:', err);
      setError('Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtherUrlChange = (index: number, field: 'name' | 'url', value: string) => {
    const newOtherUrls = [...(formData.otherUrls || [{ name: '', url: '' }])];
    newOtherUrls[index] = { ...newOtherUrls[index], [field]: value };
    setFormData((prev) => ({ ...prev, otherUrls: newOtherUrls }));
  };

  const addOtherUrl = () => {
    setFormData((prev) => ({
      ...prev,
      otherUrls: [...(prev.otherUrls || []), { name: '', url: '' }],
    }));
  };

  const removeOtherUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherUrls: prev.otherUrls?.filter((_, i) => i !== index) || [{ name: '', url: '' }],
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1>{isEditing ? 'Edit Application' : 'Add New Application'}</h1>
          <p>{isEditing ? 'Update your job application details' : 'Track your new job application'}</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={`${styles.form} ${loading ? styles.loading : ''}`}>
          <div className={styles.formGrid}>
            <TextInput
              label="Company Name"
              value={formData.companyName || ''}
              onChange={e => handleInputChange('companyName', e.target.value)}
              required
            />
            <TextInput
              label="Job Title"
              value={formData.jobTitle || ''}
              onChange={e => handleInputChange('jobTitle', e.target.value)}
              required
            />
            <Select
              label="Job Type"
              options={JOB_TYPES}
              value={formData.jobType || 'full-time'}
              onChange={(value) => handleInputChange('jobType', value)}
              required
            />
            <TextInput
              label="Location"
              value={formData.location || ''}
              onChange={e => handleInputChange('location', e.target.value)}
              required
            />
            <DatePicker
              label="Date Applied"
              value={formData.dateApplied || ''}
              onChange={e => handleInputChange('dateApplied', e.target.value)}
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
            <UrlInput
              label="Job URL"
              value={formData.jobUrl || ''}
              onChange={e => handleInputChange('jobUrl', e.target.value)}
              placeholder="https://example.com/job-posting"
            />
            <UrlInput
              label="Meeting URL"
              value={formData.meetingUrl || ''}
              onChange={e => handleInputChange('meetingUrl', e.target.value)}
              placeholder="https://meet.example.com"
            />
            <div className={styles.otherUrls}>
              <label>Other URLs</label>
              {formData.otherUrls?.map((urlItem, index) => (
                <div key={index} className={styles.otherUrlInput}>
                  <div className={styles.urlFields}>
                    <TextInput
                      label={`URL Name ${index + 1}`}
                      value={urlItem.name}
                      onChange={e => handleOtherUrlChange(index, 'name', e.target.value)}
                      placeholder="e.g., Company Website, LinkedIn"
                    />
                    <UrlInput
                      label={`URL ${index + 1}`}
                      value={urlItem.url}
                      onChange={e => handleOtherUrlChange(index, 'url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="danger"
                      icon={faTimes}
                      onClick={() => removeOtherUrl(index)}
                      className={styles.removeButton}
                    />
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                icon={faPlus}
                onClick={addOtherUrl}
                className={styles.addButton}
              >
                Add Other URL
              </Button>
            </div>
            <div className={styles.textAreaSection}>
              <RichTextEditor
                label="Job Description"
                value={formData.jobDescription || ''}
                onChange={(value) => handleInputChange('jobDescription', value)}
                placeholder="Enter the job description"
              />
              <TextArea
                label="Notes"
                value={formData.notes || ''}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or comments"
              />
            </div>
            <div className={styles.buttons}>
              <Button type="submit" icon={faSave} isLoading={loading}>
                {isEditing ? 'Update Application' : 'Add Application'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={faCancel}
                onClick={() => navigate('/home')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm; 