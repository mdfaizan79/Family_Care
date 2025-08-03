import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import { useNotification } from '../context/NotificationContext.jsx';

export default function BookAppointment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotification();
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1); // 1: Department, 2: Doctor, 3: Date/Time

  // Fetch departments
  const { data: departments } = useQuery('departments', async () => (await api.get('/departments')).data);
  // Fetch doctors for selected department
  const { data: doctors } = useQuery(['doctors', department], async () => {
    if (!department) return [];
    return (await api.get('/doctors', { params: { department } })).data;
  }, { enabled: !!department });
  // Fetch selected doctor's availability
  const selectedDoctor = doctors?.find(d => d._id === doctor);

  // Book appointment mutation
  const mutation = useMutation(
    (payload) => api.post('/appointments', payload),
    {
      onSuccess: () => {
        success('Appointment booked successfully!');
        window.scrollTo(0, 0);
        setTimeout(() => navigate('/dashboard'), 2000);
        queryClient.invalidateQueries('appointments');
      },
      onError: (err) => {
        window.scrollTo(0, 0);
        if (err.response?.data?.message === 'Appointment already booked for this time slot') {
          showError('This time slot is already booked. Please choose another time slot.');
        } else if (err.response?.data?.message === 'Cannot book appointment in the past') {
          showError('Cannot book appointment in the past. Please choose a future date.');
        } else {
          showError(err.response?.data?.message || 'Failed to book appointment');
        }
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!department || !doctor || !date || !timeSlot) {
      showError('All fields are required');
      return;
    }
    mutation.mutate({ 
      doctor, 
      department, 
      date, 
      timeSlot,
      reason: reason.trim() || 'General checkup'
    });
  };
  
  const nextStep = () => {
    if (step === 1 && !department) {
      showError('Please select a department');
      return;
    }
    if (step === 2 && !doctor) {
      showError('Please select a doctor');
      return;
    }
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };

  // Generate next 14 days for date picker
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = addDays(new Date(), i);
    return {
      value: format(day, 'yyyy-MM-dd'),
      label: format(day, 'EEE, MMM d, yyyy')
    };
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Schedule a visit with our healthcare professionals in just a few steps
          </p>
        </div>
        
        {/* Progress indicator will be shown while loading */}
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-xs text-center w-24 text-gray-600">Select Department</div>
            <div className="text-xs text-center w-24 text-gray-600">Choose Doctor</div>
            <div className="text-xs text-center w-24 text-gray-600">Schedule Visit</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Department Selection */}
            {step === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select a Department</h2>
                
                {departments ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map(d => (
                      <div 
                        key={d._id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${department === d._id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                        onClick={() => { setDepartment(d._id); setDoctor(''); }}
                      >
                        <h3 className="font-medium text-gray-900">{d.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{d.description?.substring(0, 100)}{d.description?.length > 100 ? '...' : ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <button 
                    type="button" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={nextStep}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Doctor Selection */}
            {step === 2 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose a Doctor</h2>
                
                {doctors ? (
                  doctors.length > 0 ? (
                    <div className="space-y-4">
                      {doctors.map(doc => (
                        <div 
                          key={doc._id} 
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${doctor === doc._id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                          onClick={() => setDoctor(doc._id)}
                        >
                          <div className="flex items-center">
                            <img 
                              src={doc.user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                              alt={doc.user?.name} 
                              className="w-16 h-16 rounded-full object-cover border border-gray-200" 
                            />
                            <div className="ml-4">
                              <h3 className="font-medium text-gray-900">{doc.user?.name}</h3>
                              <p className="text-sm text-blue-600">{doc.specialization}</p>
                              <p className="text-xs text-gray-500 mt-1">{doc.qualifications}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No doctors available in this department. Please select another department.
                    </div>
                  )
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button 
                    type="button" 
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={nextStep}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Date and Time Selection */}
            {step === 3 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Your Visit</h2>
                
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {days.map((day) => (
                        <div 
                          key={day.value} 
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${date === day.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                          onClick={() => setDate(day.value)}
                        >
                          <div className="text-sm font-medium">{day.label.split(',')[0]}</div>
                          <div className="text-gray-600">{day.label.split(',')[1]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Time Slot Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                    {date ? (
                      selectedDoctor?.availability?.find(a => a.day === new Date(date).toLocaleDateString('en-US', { weekday: 'long' }))?.timeSlots?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {selectedDoctor?.availability?.find(a => a.day === new Date(date).toLocaleDateString('en-US', { weekday: 'long' }))?.timeSlots?.map((slot, i) => (
                            <div 
                              key={i} 
                              className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${timeSlot === slot ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                              onClick={() => setTimeSlot(slot)}
                            >
                              <div className="text-sm font-medium">{slot}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-amber-600 bg-amber-50 rounded-lg">
                          No time slots available for this date. Please select another date or doctor.
                        </div>
                      )
                    ) : (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        Please select a date first
                      </div>
                    )}
                  </div>
                  
                  {/* Reason for Visit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit (Optional)</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Briefly describe your symptoms or reason for the appointment"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button 
                    type="button" 
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                    disabled={mutation.isLoading || !date || !timeSlot}
                  >
                    {mutation.isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Confirm Appointment'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">If you need assistance with booking your appointment or have any questions, please contact our support team.</p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:+1234567890" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </a>
            <Link to="/contact" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
