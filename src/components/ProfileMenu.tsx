import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { UserProfile } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/profileMenu.module.css';

interface ProfileMenuProps {
  user: UserProfile;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string | undefined | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className={styles.profileMenu} ref={menuRef}>
      <button
        className={styles.profileButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.avatar}>
          {getInitials(displayName)}
        </div>
        <span className={styles.name}>
          {displayName}
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {getInitials(displayName)}
            </div>
            <div className={styles.details}>
              <span className={styles.fullName}>
                {displayName}
              </span>
              <span className={styles.email}>{user.email}</span>
            </div>
          </div>
          <div className={styles.divider} />
          <button className={styles.signOutButton} onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOut} className={styles.icon} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu; 