import React, { useState } from 'react';
import { useMutation } from 'react-query';
import api from '../api.jsx';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function RescheduleButton({ appt, onSuccess }) {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(appt.date?.slice(0,10));
  const [timeSlot, setTimeSlot] = useState(appt.timeSlot);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Generate available dates (next 14 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push({
        value: nextDate.toISOString().slice(0, 10),
        label: nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    
    return dates;
  };
  
  const availableDates = generateAvailableDates();
  
  const mutation = useMutation(
    ({ date, timeSlot }) => api.patch(`/appointments/${appt._id}/reschedule`, { date, timeSlot }),
    {
      onSuccess: () => {
        setSuccess('Appointment rescheduled!');
        setError(null);
        setTimeout(() => {
          setSuccess(null);
          setShow(false);
          if (onSuccess) onSuccess();
        }, 1500);
      },
      onError: err => setError(err.response?.data?.message || 'Failed to reschedule'),
    }
  );

  const handleSubmit = e => {
    e.preventDefault();
    setError(null);
    mutation.mutate({ date, timeSlot });
  };

  return (
    <>
      <button 
        onClick={() => setShow(v => !v)} 
        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
      >
        Reschedule
      </button>
      
      {show && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Reschedule Appointment</h3>
                <button 
                  onClick={() => setShow(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Current appointment info */}
              <div className="mb-6 bg-blue-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Current Appointment</h4>
                <div className="text-sm text-blue-700">
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {appt.timeSlot}
                  </div>
                </div>
              </div>
              
              {/* New date selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {availableDates.slice(0, 6).map(dateOption => (
                    <button
                      key={dateOption.value}
                      type="button"
                      onClick={() => setDate(dateOption.value)}
                      className={`px-3 py-2 text-sm text-center rounded-md ${date === dateOption.value 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                    >
                      {dateOption.label}
                    </button>
                  ))}
                </div>
                <input 
                  type="date" 
                  value={date} 
                  min={new Date().toISOString().slice(0,10)} 
                  onChange={e => setDate(e.target.value)} 
                  className="mt-2 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              {/* New time slot selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-3 py-2 text-sm text-center rounded-md ${timeSlot === slot 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Error and success messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShow(false)} 
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
