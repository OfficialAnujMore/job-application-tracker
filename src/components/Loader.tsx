import React from 'react';
import { motion } from 'framer-motion';
import styles from '../Styles/components.module.css';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = true }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const containerClass = fullScreen ? styles.loaderContainer : styles.inlineLoader;

  return (
    <motion.div
      className={containerClass}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className={styles.loader}
        variants={spinnerVariants}
        animate="animate"
      />
    </motion.div>
  );
};

export default Loader; 