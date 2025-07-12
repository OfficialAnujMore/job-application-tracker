import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/firebase';
import styles from '../styles/auth.module.css';
import componentStyles from '../styles/components.module.css';
import TextInput from '../MyComponents/TextInput';
import { strings } from '../locals';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
              navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1>{strings.auth.login.title}</h1>
          <p className={styles.subtitle}>{strings.auth.login.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <TextInput
              label={strings.auth.login.emailLabel}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={strings.auth.login.emailPlaceholder}
              className={componentStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <TextInput
              id="password"
              label={strings.auth.login.passwordLabel}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={strings.auth.login.passwordPlaceholder}
              className={componentStyles.input}
              showPasswordToggle
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton}>
            {strings.auth.login.submitButton}
          </button>
        </form>
        <p className={styles.footer}>
          {strings.auth.login.noAccount}{' '}
          <Link to="/register" className={styles.link}>
            {strings.auth.login.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 