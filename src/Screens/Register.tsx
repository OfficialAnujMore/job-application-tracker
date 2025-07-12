import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/firebase';
import styles from '../styles/auth.module.css';
import componentStyles from '../styles/components.module.css';
import TextInput from '../MyComponents/TextInput';

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
              <TextInput
                label="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                placeholder="Enter your first name"
                className={componentStyles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <TextInput
                label="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                placeholder="Enter your last name"
                className={componentStyles.input}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className={componentStyles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <TextInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className={componentStyles.input}
              showPasswordToggle
            />
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