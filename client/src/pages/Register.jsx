import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, needsVerification, resendVerificationEmail } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const { success: showSuccess, error: showError, info: showInfo } = useNotification();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      await api.post('/auth/register', data);
      setRegisteredEmail(data.email);
      const successMessage = 'Registration successful! Please check your email for the verification code.';
      showSuccess(successMessage);
      
      // Redirect to OTP verification page with email in state
      navigate('/verify-otp', { state: { email: data.email } });
      // We don't auto-login anymore since email verification is required
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to resend verification email
  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    setIsSubmitting(true);
    const result = await resendVerificationEmail(registeredEmail);
    
    if (result.success) {
      showInfo('Verification email has been resent. Please check your inbox.');
    } else {
      showError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      {registeredEmail ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Verification Required</h2>
          
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="mb-4">A verification link has been sent to <span className="font-semibold">{registeredEmail}</span>.</p>
            <p className="mb-4">Please check your email and click the link to verify your account.</p>
            <p>Didn't receive the email?</p>
          </div>
          
          <button
            onClick={handleResendVerification}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 mb-4"
          >
            {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
          </button>
          
          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-600 hover:underline">Return to Login</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Patient Registration</h2>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaUser />
              </div>
              <input 
                {...register('name', { required: 'Name is required' })} 
                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email Address</label>
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
                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaLock />
              </div>
              <input 
                type="password" 
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })} 
                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaPhone />
              </div>
              <input 
                {...register('phone', { required: 'Phone number is required' })} 
                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="+1 (123) 456-7890"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Date of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaCalendarAlt />
              </div>
              <input 
                type="date" 
                {...register('dateOfBirth', { required: 'Date of birth is required' })} 
                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block mb-1 font-medium">Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaMapMarkerAlt />
              </div>
              <textarea 
                {...register('address', { required: 'Address is required' })} 
                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" 
                placeholder="Your full address"
              />
            </div>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-green-400 font-medium"
          >
            {isSubmitting ? 'Registering...' : 'Register as Patient'}
          </button>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Login</Link>
          </div>
        </form>
      )}
    </div>
  );

}
