import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import RescheduleButton from './RescheduleButton.jsx';
import PatientFileUpload from './PatientFileUpload.jsx';

function FeedbackForm({ appt, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { success, error: showError } = useNotification();
  const mutation = useMutation(
    (payload) => api.post('/feedback', payload),
    { 
      onSuccess: (data) => {
        success('Thank you for your feedback!');
        onSuccess(data);
      }, 
      onError: err => showError(err.response?.data?.message || 'Failed to submit feedback') 
    }
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      appointmentId: appt._id,
      doctor: appt.doctor?._id,
      department: appt.department?._id,
      rating,
      comment
    });
  };
  
  // Star rating component
  const StarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Share Your Experience</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">How was your experience?</label>
          <StarRating />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Share your thoughts about your appointment (optional)" 
            rows="3"
          />
        </div>
        
        {/* Error notifications are now handled by the notification system */}
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);
  
  // Fetch appointments
  const { data: appointments, isLoading, error } = useQuery('appointments', 
    async () => (await api.get('/appointments')).data
  );
  
  // Cancel appointment mutation
  const cancelMutation = useMutation(
    (id) => api.delete(`/appointments/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  // Filter appointments based on active tab
  const getFilteredAppointments = () => {
    if (!appointments) return [];
    
    const today = new Date();
    
    switch(activeTab) {
      case 'upcoming':
        return appointments.filter(appt => 
          appt.status === 'booked' && new Date(appt.date) >= today
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'past':
        return appointments.filter(appt => 
          appt.status === 'completed' || new Date(appt.date) < today
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'cancelled':
        return appointments.filter(appt => appt.status === 'cancelled')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      default:
        return appointments;
    }
  };
  
  const filteredAppointments = getFilteredAppointments();

  // Loading state
  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your appointments...</p>
      </div>
    </div>
  );
  
  // Error state
  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700">Failed to load appointments. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your appointments and medical documents</p>
        </div>
        
        {/* Medical Document Upload Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Medical Document</h2>
          <PatientFileUpload onUpload={() => queryClient.invalidateQueries('patientDocuments')} />
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Appointments</h2>
        </div>
        
        {/* Success Message */}
        {feedbackSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{feedbackSuccess}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${activeTab === 'upcoming' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`${activeTab === 'past' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`${activeTab === 'cancelled' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Cancelled
            </button>
          </nav>
        </div>
        
        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeTab} appointments</h3>
            <p className="text-gray-500">
              {activeTab === 'upcoming' 
                ? 'You don\'t have any upcoming appointments. Book a new appointment to get started.' 
                : activeTab === 'past' 
                  ? 'You don\'t have any past appointments.' 
                  : 'You don\'t have any cancelled appointments.'}
            </p>
            {activeTab === 'upcoming' && (
              <div className="mt-4">
                <a href="/book-appointment" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Book Appointment
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(appt => (
              <div key={appt._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{appt.doctor?.user?.name}</h3>
                        <p className="text-sm text-blue-600">{appt.doctor?.specialization}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appt.status === 'booked' 
                          ? 'bg-green-100 text-green-800' 
                          : appt.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Department: {appt.department?.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Date: {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Time: {appt.timeSlot}
                      </div>
                    </div>
                    
                    <div className="sm:text-right">
                      {appt.status === 'booked' && new Date(appt.date) >= new Date() && (
                        <div className="flex sm:justify-end gap-2 mt-2">
                          <button 
                            onClick={() => cancelMutation.mutate(appt._id)} 
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <RescheduleButton 
                            appt={appt} 
                            onSuccess={() => queryClient.invalidateQueries('appointments')} 
                          />
                        </div>
                      )}
                      {appt.status === 'completed' && !appt.feedbackSubmitted && (
                        <div className="text-sm text-blue-600 font-medium mb-2">
                          Please share your feedback
                        </div>
                      )}
                      {appt.status === 'completed' && appt.feedbackSubmitted && (
                        <div className="flex items-center justify-end text-green-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Feedback submitted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Feedback Form */}
                {appt.status === 'completed' && !appt.feedbackSubmitted && (
                  <FeedbackForm 
                    appt={appt} 
                    onSuccess={() => {
                      setFeedbackSuccess('Thank you for your feedback!');
                      setTimeout(() => setFeedbackSuccess(null), 3000);
                      queryClient.invalidateQueries('appointments');
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
