import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Set the token in the API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Remove the token from API headers
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user, token]);

  // Auto-login and validation on initial load
  useEffect(() => {
    const validateToken = async () => {
      try {
        setLoading(true);
        if (!token) {
          setLoading(false);
          return;
        }

        // Set the token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Validate the token by getting current user
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Token validation failed:', err);
        setError('Your session has expired. Please log in again.');
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    setError(null);
    setNeedsVerification(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setNeedsVerification(false);
  };

  const handleLoginError = (err) => {
    if (err.response) {
      const { status, data } = err.response;

      if (status === 403 && data.needsVerification) {
        setNeedsVerification(true);
        setError('Please verify your email before logging in.');
      } else {
        setError(data.message || 'An error occurred during login');
      }
    } else {
      setError('Network error. Please try again later.');
    }
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  // Clear verification state
  const clearNeedsVerification = () => {
    setNeedsVerification(false);
  };

  // Reset user password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to process password reset request' 
      };
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return { success: true, message: response.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to resend verification email' 
      };
    }
  };

  // Verify email with token
  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return { success: true, message: response.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Email verification failed' 
      };
    }
  };

  // Update user information
  const updateUserInfo = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      // Update the local user state with new information
      setUser(prev => ({
        ...prev,
        ...response.data
      }));
      
      return { success: true, user: response.data };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update user information' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      needsVerification,
      login,
      logout,
      handleLoginError,
      clearError,
      clearNeedsVerification,
      forgotPassword,
      resetPassword,
      resendVerificationEmail,
      verifyEmail,
      updateUserInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
}
