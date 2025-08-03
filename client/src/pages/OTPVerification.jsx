import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { verifyEmailOTP } from '../api.jsx';
import { FaEnvelope, FaKey, FaPaperPlane } from 'react-icons/fa';

export default function OTPVerification() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useNotification();
  const { login } = useContext(AuthContext);
  
  // Try to get email from location state or query parameters
  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await verifyEmailOTP(data.email, data.otp);
      
      success('Email verified successfully!');
      
      // If we have user data with token, automatically log the user in
      if (response.token) {
        await login(response.token);
        navigate('/dashboard');
      } else {
        // Otherwise redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      error(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resendOTP = async () => {
    if (!email) {
      error('Please enter your email first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      success('A new OTP has been sent to your email');
    } catch (err) {
      error('Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit OTP sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your email"
                  defaultValue={email}
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="text-gray-400" />
                </div>
                <input
                  id="otp"
                  type="text"
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter 6-digit OTP"
                  {...register("otp", { 
                    required: "OTP is required",
                    minLength: {
                      value: 6,
                      message: "OTP must be 6 digits"
                    },
                    maxLength: {
                      value: 6,
                      message: "OTP must be 6 digits"
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "OTP must contain only numbers"
                    }
                  })}
                />
              </div>
              {errors.otp && <p className="mt-2 text-sm text-red-600">{errors.otp.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={resendOTP}
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaPaperPlane className="mr-2" />
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
