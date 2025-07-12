import React, { InputHTMLAttributes, TextareaHTMLAttributes} from 'react';
import styles from '../styles/components.module.css';


interface CustomTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

interface CustomTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

// interface RichTextEditorProps {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   error?: string;
//   className?: string;
// }

const CustomTextField: React.FC<CustomTextFieldProps> = ({ 
  label, 
  error,
  className,
  ...props 
}) => {
  return (
    <div className={styles.textFieldContainer}>
      <label>{label}</label>
      <input 
        className={`${styles.textField} ${error ? styles.error : ''} ${className || ''}`}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ 
  label, 
  error,
  className,
  onPaste,
  ...props 
}) => {
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    // Get both HTML and plain text from clipboard
    const htmlData = e.clipboardData.getData('text/html');
    const plainData = e.clipboardData.getData('text/plain');
    
    let processedText = '';
    
    if (htmlData) {
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlData;
      
      // Convert bullet points and lists
      const lists = tempDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach(item => {
          processedText += '• ' + item.textContent + '\n';
        });
        processedText += '\n';
      });
      
      // Convert line breaks and paragraphs
      const paragraphs = tempDiv.querySelectorAll('p, br');
      paragraphs.forEach(p => {
        if (p.tagName === 'BR') {
          processedText += '\n';
        } else {
          processedText += p.textContent + '\n\n';
        }
      });
      
      // If no lists or paragraphs found, use the text content
      if (!processedText) {
        processedText = tempDiv.textContent || plainData;
      }
    } else {
      // Fallback to plain text
      processedText = plainData;
    }
    
    // Clean up extra line breaks
    processedText = processedText.replace(/\n\s*\n/g, '\n').trim();
    
    // Insert the processed text at cursor position
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentValue = target.value;
    const newValue = currentValue.substring(0, start) + processedText + currentValue.substring(end);
    
    // Update the textarea value
    target.value = newValue;
    
    // Trigger onChange event
    const event = {
      target: { value: newValue }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    if (props.onChange) {
      props.onChange(event);
    }
    
    // Set cursor position after the pasted text
    setTimeout(() => {
      target.setSelectionRange(start + processedText.length, start + processedText.length);
    }, 0);
  };

  return (
    <div className={styles.textFieldContainer}>
      <label>{label}</label>
      <textarea 
        className={`${styles.textField} ${styles.textArea} ${error ? styles.error : ''} ${className || ''}`}
        onPaste={handlePaste}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};



export default CustomTextField;
export { CustomTextArea }; 