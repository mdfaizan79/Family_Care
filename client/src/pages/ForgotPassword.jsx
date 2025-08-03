import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import api from '../api.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const { success: showSuccess, error: showError } = useNotification();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
      setEmail(data.email);
      showSuccess('Reset password link sent successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {success ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Check Your Email</h2>
            <p className="mb-6 text-gray-600">
              We've sent a password reset link to <span className="font-semibold">{email}</span>.
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Note:</strong> The password reset link will expire in 1 hour.
              </p>
              <p className="text-sm text-gray-600">
                If you don't see the email, check your spam folder.
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Return to Login
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="text-blue-600 hover:underline"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Forgot Password</h2>
            
            <p className="mb-6 text-gray-600">
              Enter your email address below and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input 
                    type="email" 
                    {...register('email', { 
                      required: 'Email address is required',
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
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="mt-6 text-center">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
