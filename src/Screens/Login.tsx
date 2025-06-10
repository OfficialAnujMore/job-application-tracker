import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth} from '../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/auth.module.css';
import componentStyles from '../styles/components.module.css';
import { motion } from 'framer-motion';
import CustomButton from '../Components/CustomButton';
import Loader from '../Components/Loader';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={styles.formContainer}>
        <h1>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue tracking your job applications</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
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

          <CustomButton type="submit" fullWidth>
            Login
          </CustomButton>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login; 