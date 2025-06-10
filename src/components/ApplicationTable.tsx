import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../Config/firebase';
import { JobApplication } from '../Types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBriefcase,
  faCalendar,
  faSort,
  faSortUp,
  faSortDown,
  faPen,
  faTrash,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/applicationTable.module.css';

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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return faSort;
    return sortOrder === 'asc' ? faSortUp : faSortDown;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.filters}>
        <div className={styles.searchFilter}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.jobTypeFilter}>
          <FontAwesomeIcon icon={faBriefcase} className={styles.filterIcon} />
          <select
            value={filterJobType}
            onChange={(e) => setFilterJobType(e.target.value)}
            className={styles.select}
          >
            <option value="">All Job Types</option>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.dateFilter}>
          <div className={styles.dateInputGroup}>
            <FontAwesomeIcon icon={faCalendar} className={styles.calendarIcon} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <span>to</span>
          <div className={styles.dateInputGroup}>
            <FontAwesomeIcon icon={faCalendar} className={styles.calendarIcon} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
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
            <tr key={app.id}>
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
              <td className={styles.actions}>
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