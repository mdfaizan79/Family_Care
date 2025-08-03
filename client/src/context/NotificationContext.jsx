import React, { createContext, useState, useContext } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const notify = (message, options = {}) => {
    const id = Date.now();
    const { 
      type = 'info', 
      duration = 5000, 
      title,
      confirmAction,
      confirmText,
      cancelAction,
      cancelText 
    } = typeof options === 'string' ? { type: options } : options;
    
    setNotifications((prev) => [
      ...prev, 
      { 
        id, 
        message, 
        type, 
        duration, 
        title,
        confirmAction,
        confirmText,
        cancelAction,
        cancelText
      }
    ]);
    
    return id;
  };
  
  // Shorthand functions
  const success = (message, options = {}) => notify(message, { type: 'success', ...options });
  const error = (message, options = {}) => notify(message, { type: 'error', ...options });
  const info = (message, options = {}) => notify(message, { type: 'info', ...options });
  
  // Remove a notification
  const remove = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };
  
  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };
  
  const value = {
    notify,
    success,
    error,
    info,
    remove,
    clearAll
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => remove(notification.id)}
            autoClose={true}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
