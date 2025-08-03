import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

export default function EmailVerification() {
  const { verifyEmail, error: authError, clearError } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const { token } = useParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const { success: showSuccess, error: showError } = useNotification();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus('error');
        showError('Invalid verification link. The token is missing.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        showSuccess('Email verified successfully!');
      } catch (err) {
        setStatus('error');
        const errorMessage = err.message || 'Verification failed. The link may have expired or is invalid.';
        showError(errorMessage);
      }
    };

    clearError();
    verifyUserEmail();
  }, [token, verifyEmail, clearError, showError, showSuccess]);

  useEffect(() => {
    if (authError) {
      setStatus('error');
      showError(authError);
    }
  }, [authError, showError]);

  // Redirect to login after successful verification
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate(`/login${email ? `?verified=true&email=${encodeURIComponent(email)}` : ''}`);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status, navigate, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <FaSpinner className="animate-spin text-blue-600 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-4">Verifying Your Email</h1>
            <p className="text-gray-600 text-center">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-4 text-green-600">Email Verified!</h1>
            <p className="text-gray-600 text-center mb-6">
              Your email address has been successfully verified. You can now log in to your account.
            </p>
            <p className="text-gray-500 text-center text-sm">
              Redirecting to login page in a few seconds...
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to={`/login${email ? `?verified=true&email=${encodeURIComponent(email)}` : ''}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login Now
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <FaExclamationTriangle className="text-red-500 text-5xl" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Verification Failed</h1>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              The email verification link is invalid or has expired. Please try again.
            </div>
            <div className="flex flex-col space-y-3 items-center">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Back to Login
              </Link>
              <Link
                to="/register"
                className="text-blue-600 hover:underline"
              >
                Register Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
