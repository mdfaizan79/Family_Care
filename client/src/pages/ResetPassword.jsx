import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import api from '../api.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('validating'); // validating, valid, invalid, success
  const { token } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useNotification();

  // Validate token first
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        showError('Invalid password reset link. The token is missing.');
        return;
      }

      try {
        await api.post('/auth/validate-reset-token', { token });
        setStatus('valid');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'This password reset link is invalid or has expired.';
        setStatus('invalid');
        showError(errorMessage);
      }
    };

    validateToken();
  }, [token, showError]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.post('/auth/reset-password', { 
        token,
        password: data.password
      });
      setStatus('success');
      showSuccess('Password has been reset successfully!');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { resetSuccess: true } });
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Validating Token State */}
        {status === 'validating' && (
          <>
            <div className="flex justify-center mb-6">
              <FaSpinner className="animate-spin text-blue-600 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">Validating Link</h2>
            <p className="text-center text-gray-600">
              Please wait while we validate your password reset link...
            </p>
          </>
        )}

        {/* Invalid Token State */}
        {status === 'invalid' && (
          <>
            <div className="flex justify-center mb-6">
              <FaExclamationTriangle className="text-red-500 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Invalid Link</h2>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              This password reset link is invalid or has expired.
            </div>
            <div className="flex justify-center">
              <Link
                to="/forgot-password"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Request a New Link
              </Link>
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Password Reset Successful</h2>
            <p className="text-center text-gray-600 mb-6">
              Your password has been reset successfully. You can now use your new password to log in.
            </p>
            <p className="text-center text-gray-500 text-sm mb-6">
              You'll be redirected to the login page in a few seconds.
            </p>
            <div className="flex justify-center">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login Now
              </Link>
            </div>
          </>
        )}

        {/* Valid Token - Reset Form */}
        {status === 'valid' && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Reset Password</h2>
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-5">
                <label className="block mb-2 font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input 
                    type="password" 
                    {...register('password', { 
                      required: 'New password is required', 
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })} 
                    className="w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input 
                    type="password" 
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })} 
                    className="w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
