import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faEye, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/dashboard.module.css';
import { format } from 'date-fns';

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  type: string;
  location: string;
  dateApplied: string;
  status: string;
}

interface Props {
  applications: Application[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  sortConfig: {
    key: keyof Application;
    direction: 'ascending' | 'descending';
  } | null;
  onSort: (key: keyof Application) => void;
}

const ApplicationsTable: React.FC<Props> = ({
  applications,
  onEdit,
  onDelete,
  sortConfig,
  onSort,
}) => {
  const getSortIcon = (key: keyof Application) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className={styles.sortIndicator} />;
    }
    return (
      <FontAwesomeIcon
        icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
        className={styles.sortIndicator}
      />
    );
  };

  if (applications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No Applications Found</h3>
        <p>Start by adding your first job application!</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th onClick={() => onSort('company')}>
              Company {getSortIcon('company')}
            </th>
            <th onClick={() => onSort('jobTitle')}>
              Job Title {getSortIcon('jobTitle')}
            </th>
            <th onClick={() => onSort('type')}>
              Type {getSortIcon('type')}
            </th>
            <th onClick={() => onSort('location')}>
              Location {getSortIcon('location')}
            </th>
            <th onClick={() => onSort('dateApplied')}>
              Date Applied {getSortIcon('dateApplied')}
            </th>
            <th onClick={() => onSort('status')}>
              Status {getSortIcon('status')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.company}</td>
              <td>{app.jobTitle}</td>
              <td>{app.type}</td>
              <td>{app.location}</td>
              <td>{format(new Date(app.dateApplied), 'MMM dd, yyyy')}</td>
              <td>
                <span className={`${styles.status} ${styles[app.status.toLowerCase()]}`}>
                  {app.status}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.actionButton}
                    aria-label="View application details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    onClick={() => onEdit(app.id)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                    aria-label="Edit application"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    aria-label="Delete application"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsTable; 