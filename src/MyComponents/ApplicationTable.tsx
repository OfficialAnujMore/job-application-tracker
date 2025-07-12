import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import { JobApplication } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBriefcase,
  faCalendar,
  faPen,
  faTrash,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/applicationTable.module.css';
import TextInput from './TextInput';
import DatePicker from './DatePicker';
import Select from './Select';

interface ApplicationTableProps {
  applications: JobApplication[];
}

type SortField = 'companyName' | 'dateApplied' | 'status' | 'jobType';
type SortOrder = 'asc' | 'desc';

const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('dateApplied');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'applications', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch = app.companyName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesJobType = !filterJobType || app.jobType === filterJobType;
        const dateInRange =
          (!startDate ||
            new Date(app.dateApplied) >= new Date(startDate)) &&
          (!endDate ||
            new Date(app.dateApplied) <= new Date(endDate));
        return matchesSearch && matchesJobType && dateInRange;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'dateApplied') {
          comparison = new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        } else {
          comparison = String(a[sortField]).localeCompare(String(b[sortField]));
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [applications, sortField, sortOrder, searchTerm, filterJobType, startDate, endDate]);

  const jobTypes = Array.from(new Set(applications.map((app) => app.jobType)));

  if (applications.length === 0) {
    return (
      <div className={styles.noData}>
        <p>No applications found.</p>
        <button
          className={styles.addButton}
          onClick={() => navigate('/application/new')}
        >
          Add Your First Application
        </button>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.filters}>
        <div className={styles.searchFilter}>
          <TextInput
            label="Search"
            placeholder="Search by company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.jobTypeFilter}>
          <Select
            label="Job Type"
            options={[{ value: '', label: 'All Job Types' }, ...jobTypes.map(type => ({ value: type, label: type }))]}
            value={filterJobType}
            onChange={value => setFilterJobType(value)}
            className={styles.select}
          />
        </div>
        <div className={styles.dateFilter}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
          <span>to</span>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('companyName')}>
              Company
            </th>
            <th>Job Title</th>
            <th onClick={() => handleSort('jobType')}>
              Type
            </th>
            <th>Location</th>
            <th onClick={() => handleSort('dateApplied')}>
              Date Applied
            </th>
            <th onClick={() => handleSort('status')}>
              Status
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedApplications.map((app) => (
            <tr 
              key={app.id} 
              className={styles.tableRow}
              onClick={() => navigate(`/view/${app.id}`)}
            >
              <td>{app.companyName}</td>
              <td>{app.jobTitle}</td>
              <td>{app.jobType}</td>
              <td>{app.location}</td>
              <td>{new Date(app.dateApplied).toLocaleDateString()}</td>
              <td>
                <span className={`${styles.status} ${styles[app.status]}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </td>
              <td className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/application/${app.id}`)}
                  className={styles.actionButton}
                  title="Edit"
                >
                  <FontAwesomeIcon icon={faPen} className={styles.icon} />
                </button>
                {deleteConfirm === app.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className={`${styles.actionButton} ${styles.confirmDelete}`}
                      title="Confirm Delete"
                    >
                      <FontAwesomeIcon icon={faCheck} className={styles.icon} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className={`${styles.actionButton} ${styles.cancelDelete}`}
                      title="Cancel"
                    >
                      <FontAwesomeIcon icon={faTimes} className={styles.icon} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(app.id)}
                    className={styles.actionButton}
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} className={styles.icon} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable; 