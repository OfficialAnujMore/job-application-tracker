import React, { InputHTMLAttributes, TextareaHTMLAttributes, useRef, useEffect, useState } from 'react';
import styles from '../styles/components.module.css';

interface CustomTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

interface CustomTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

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

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  error, 
  className 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        setIsBold(!isBold);
        break;
      case 'italic':
        execCommand('italic');
        setIsItalic(!isItalic);
        break;
      case 'underline':
        execCommand('underline');
        setIsUnderline(!isUnderline);
        break;
      case 'insertUnorderedList':
        execCommand('insertUnorderedList');
        break;
      case 'insertOrderedList':
        execCommand('insertOrderedList');
        break;
      case 'justifyLeft':
        execCommand('justifyLeft');
        break;
      case 'justifyCenter':
        execCommand('justifyCenter');
        break;
      case 'justifyRight':
        execCommand('justifyRight');
        break;
      case 'justifyFull':
        execCommand('justifyFull');
        break;
      case 'foreColor':
        const color = prompt('Enter text color (e.g., #ff0000 or red):', '#000000');
        if (color) execCommand('foreColor', color);
        break;
      case 'hiliteColor':
        const bgColor = prompt('Enter background color (e.g., #ffff00 or yellow):', '#ffffff');
        if (bgColor) execCommand('hiliteColor', bgColor);
        break;
      case 'fontSize':
        const size = prompt('Enter font size (1-7):', '3');
        if (size) execCommand('fontSize', size);
        break;
      case 'createLink':
        setShowLinkDialog(true);
        break;
      case 'unlink':
        execCommand('unlink');
        break;
      case 'removeFormat':
        execCommand('removeFormat');
        break;
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl && linkText) {
      const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      document.execCommand('insertHTML', false, link);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
      editorRef.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak', false);
    }
  };

  return (
    <div className={styles.textFieldContainer}>
      <label>{label}</label>
      <div className={styles.richTextEditor}>
        <div className={styles.toolbar}>
          {/* Text Formatting */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={`${styles.toolbarButton} ${isBold ? styles.active : ''}`}
              onClick={() => handleFormat('bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className={`${styles.toolbarButton} ${isItalic ? styles.active : ''}`}
              onClick={() => handleFormat('italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className={`${styles.toolbarButton} ${isUnderline ? styles.active : ''}`}
              onClick={() => handleFormat('underline')}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
          </div>

          <div className={styles.toolbarSeparator}></div>

          {/* Text Color & Highlighting */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('foreColor')}
              title="Text Color"
            >
              <span style={{ color: '#ff0000' }}>A</span>
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('hiliteColor')}
              title="Highlight Color"
            >
              <span style={{ backgroundColor: '#ffff00' }}>H</span>
            </button>
          </div>

          <div className={styles.toolbarSeparator}></div>

          {/* Lists */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('insertUnorderedList')}
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('insertOrderedList')}
              title="Numbered List"
            >
              1. List
            </button>
          </div>

          <div className={styles.toolbarSeparator}></div>

          {/* Alignment */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('justifyLeft')}
              title="Align Left"
            >
              ⬅
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('justifyCenter')}
              title="Align Center"
            >
              ↔
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('justifyRight')}
              title="Align Right"
            >
              ➡
            </button>
          </div>

          <div className={styles.toolbarSeparator}></div>

          {/* Links */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('createLink')}
              title="Insert Link"
            >
              🔗
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('unlink')}
              title="Remove Link"
            >
              🔗❌
            </button>
          </div>

          <div className={styles.toolbarSeparator}></div>

          {/* Font Size */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('fontSize')}
              title="Font Size"
            >
              A+
            </button>
          </div>

          <div className={styles.toolbarSeparator}></div>

          {/* Clear Formatting */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormat('removeFormat')}
              title="Clear Formatting"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className={styles.linkDialog}>
            <div className={styles.linkDialogContent}>
              <h4>Insert Link</h4>
              <input
                type="text"
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className={styles.linkInput}
              />
              <input
                type="url"
                placeholder="URL (https://example.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className={styles.linkInput}
              />
              <div className={styles.linkDialogButtons}>
                <button
                  type="button"
                  onClick={handleLinkSubmit}
                  className={styles.linkDialogButton}
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className={styles.linkDialogButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          ref={editorRef}
          className={`${styles.textField} ${styles.textArea} ${styles.richTextArea} ${error ? styles.error : ''} ${className || ''}`}
          contentEditable
          onPaste={handlePaste}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default CustomTextField;
export { CustomTextArea, RichTextEditor }; 