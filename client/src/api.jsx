import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Verify email using OTP code
 * @param {string} email - User's email address
 * @param {string} otp - The 6-digit OTP code
 * @returns {Promise} - API response
 */
export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to verify OTP. Please try again.'
    );
  }
};

export default api;
