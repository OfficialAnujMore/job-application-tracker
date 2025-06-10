import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/auth.module.css';
import componentStyles from '../styles/components.module.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>Start tracking your job applications today</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameFields}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={componentStyles.input}
                placeholder="Enter your first name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={componentStyles.input}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={componentStyles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordField}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={componentStyles.input}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon 
                  icon={showPassword ? faEyeSlash : faEye} 
                  className={styles.icon}
                />
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={componentStyles.button}>
            Register
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 