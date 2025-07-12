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
  faTimes,
  faFileExcel,
  faUndo
} from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import styles from '../styles/applicationTable.module.css';
import TextInput from './TextInput';
import DatePicker from './DatePicker';
import Select from './Select';
import CustomModal from './CustomModal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  const resetFilters = () => {
    setSearchTerm('');
    setFilterJobType('');
    setStartDate('');
    setEndDate('');
  };

  const exportToExcel = () => {
    const dataToExport = filteredAndSortedApplications.map(app => ({
      'Company Name': app.companyName,
      'Job Title': app.jobTitle,
      'Job Type': app.jobType,
      'Location': app.location,
      'Date Applied': new Date(app.dateApplied).toLocaleDateString(),
      'Status': app.status.charAt(0).toUpperCase() + app.status.slice(1),
      'Job URL': app.jobUrl || '',
      'Meeting URL': app.meetingUrl || '',
      'Job Description': app.jobDescription || '',
      'Notes': app.notes || '',
      'Created At': new Date(app.createdAt).toLocaleDateString(),
      'Updated At': new Date(app.updatedAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Job Applications');
    
    const fileName = `job-applications-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
    setModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (pendingDeleteId) {
      await handleDelete(pendingDeleteId);
      setPendingDeleteId(null);
      setModalOpen(false);
    }
  };
  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
    setModalOpen(false);
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
        <div className={styles.actionButtons}>
          <button
            onClick={resetFilters}
            className={styles.resetButton}
            title="Reset Filters"
          >
            <FontAwesomeIcon icon={faUndo} className={styles.icon} />
            Reset
          </button>
          <button
            onClick={exportToExcel}
            className={styles.exportButton}
            title="Export to Excel"
          >
            <FontAwesomeIcon icon={faFileExcel} className={styles.icon} />
            Export
          </button>
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
                <button
                  onClick={() => handleDeleteRequest(app.id)}
                  className={styles.actionButton}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} className={styles.icon} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CustomModal
        isOpen={modalOpen}
        title="Delete Application?"
        message="Are you sure you want to delete this application? This action cannot be reverted."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default ApplicationTable; 