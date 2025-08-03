import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// Types: 'success', 'error', 'info'
export default function Notification({ 
  type = 'info', 
  message, 
  title,
  onClose, 
  autoClose = true, 
  duration = 5000,
  confirmAction,
  confirmText = 'Confirm',
  cancelAction,
  cancelText = 'Cancel'
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300); // Allow animation to complete
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300); // Allow animation to complete
  };

  // Don't render anything if not visible
  if (!isVisible || !message) return null;

  // Determine styles based on type
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: <FaCheckCircle className="text-green-500" size={20} />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: <FaExclamationCircle className="text-red-500" size={20} />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: <FaInfoCircle className="text-blue-500" size={20} />,
    },
  }[type] || styles.info;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-md w-full shadow-lg rounded-lg border-l-4 ${styles.border} ${styles.bg} transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className="p-4 flex flex-col">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {styles.icon}
          </div>
          <div className="flex-1">
            {title && <p className={`text-sm font-bold mb-1 ${styles.text}`}>{title}</p>}
            <p className={`text-sm ${title ? '' : 'font-medium'} ${styles.text}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150`}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
        
        {/* Confirmation buttons */}
        {(confirmAction || cancelAction) && (
          <div className="flex justify-end space-x-2 mt-3">
            {cancelAction && (
              <button
                onClick={() => {
                  cancelAction();
                  handleClose();
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
              >
                {cancelText}
              </button>
            )}
            {confirmAction && (
              <button
                onClick={() => {
                  confirmAction();
                  handleClose();
                }}
                className={`px-3 py-1 ${type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded text-sm transition`}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
