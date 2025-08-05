import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login, handleLoginError, error: authError, needsVerification, clearError, resendVerificationEmail } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { success: showSuccess, error: showError, info: showInfo } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle redirects based on query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verifySuccess = params.get('verified');
    const email = params.get('email');
    
    if (verifySuccess === 'true' && email) {
      setError(null);
      setVerificationEmail('');
      setValue('email', email);
      showSuccess('Email verified successfully! You can now log in.');
    }
    
    // Check if coming from reset password page
    if (location.state?.resetSuccess) {
      showSuccess('Password has been reset successfully! You can now log in with your new password.');
    }
    
    // Clear auth context errors when component mounts
    return () => clearError();
  }, [location, setValue, clearError, showSuccess]);
  
  // Show auth context errors
  useEffect(() => {
    if (authError) {
      setError(authError);
      showError(authError);
    }
  }, [authError, showError]);

  const onSubmit = async (data) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.token);
      
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      handleLoginError(err);
      if (err.response?.data?.needsVerification) {
        setVerificationEmail(data.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setIsSubmitting(true);
    const result = await resendVerificationEmail(verificationEmail);
    
    if (result.success) {
      setError('Verification email has been resent. Please check your inbox.');
      showInfo('Verification email has been resent. Please check your inbox.');
    } else {
      setError(result.message);
      showError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      {needsVerification && verificationEmail ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <div className="flex items-center justify-center mb-6 text-amber-500">
            <FaExclamationTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Email Verification Required</h2>
          
          <div className="bg-amber-50 p-4 rounded-md mb-6 border border-amber-200">
            <p className="mb-4">Your email <span className="font-semibold">{verificationEmail}</span> needs to be verified before you can log in.</p>
            <p>Please check your inbox for the verification link, or request a new one below.</p>
          </div>
          
          <button
            onClick={handleResendVerification}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 mb-4 font-medium"
          >
            {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
          </button>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              onClick={() => setVerificationEmail('')} 
              className="text-blue-600 hover:underline"
            >
              Try a different account
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-3 text-center text-blue-600">Login</h2>
          
          {/* User type badges */}
          <div className="flex justify-center mb-6 gap-2">
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient
            </div>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Doctor
            </div>
            <div className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Admin
            </div>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <FaEnvelope />
                </div>
                <input 
                  type="email" 
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })} 
                  className="w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <FaLock />
                </div>
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required' })} 
                  className="w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium mb-4"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Don't have an account?</p>
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register as Patient
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Welcome Back, Healthcare Professionals</h3>
              <p className="text-xs text-blue-600">Doctors and administrators can log in with their credentials above</p>
            </div>
            <p className="text-gray-500 text-sm">Only patients can self-register. Doctor accounts are created by administrators.</p>
          </div>
        </div>
      )}
    </div>
  );
}
