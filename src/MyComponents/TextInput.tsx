import React, { useState } from "react";
import styles from "../styles/components.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { strings } from '../locals';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPasswordToggle?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password" && showPasswordToggle;
  return (
    <div className={styles.textFieldContainer} style={{ position: "relative" }}>
      <label>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        className={`${styles.textField} ${error ? styles.error : ""}`}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        {...props}
        style={
          isPassword ? { paddingRight: "2.5rem", ...props.style } : props.style
        }
      />
      {isPassword && (
        <button
          type="button"
          className={styles.togglePassword}
          aria-label={showPassword ? strings.form.validation.hidePassword : strings.form.validation.showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={0}
          style={{
            position: "absolute",
            top: "70%",
            right: "1rem",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className={styles.icon}
          />
        </button>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default TextInput;
