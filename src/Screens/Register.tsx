import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import styles from '../styles/auth.module.css';
import componentStyles from '../styles/components.module.css';
import TextInput from '../MyComponents/TextInput';
import { strings } from '../locals';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: `${firstName} ${lastName}`,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
              navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1>{strings.auth.register.title}</h1>
          <p className={styles.subtitle}>{strings.auth.register.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameFields}>
            <div className={styles.formGroup}>
              <TextInput
                label={strings.auth.register.firstNameLabel}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                placeholder={strings.auth.register.firstNamePlaceholder}
                className={componentStyles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <TextInput
                label={strings.auth.register.lastNameLabel}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                placeholder={strings.auth.register.lastNamePlaceholder}
                className={componentStyles.input}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <TextInput
              label={strings.auth.register.emailLabel}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={strings.auth.register.emailPlaceholder}
              className={componentStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <TextInput
              id="password"
              label={strings.auth.register.passwordLabel}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={strings.auth.register.passwordPlaceholder}
              className={componentStyles.input}
              showPasswordToggle
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton}>
            {strings.auth.register.submitButton}
          </button>
        </form>
        <p className={styles.footer}>
          {strings.auth.register.hasAccount}{' '}
          <Link to="/login" className={styles.link}>
            {strings.auth.register.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 