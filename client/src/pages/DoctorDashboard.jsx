import React, { useContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { format } from 'date-fns';
import { useNotification } from '../context/NotificationContext.jsx';
import Modal from '../components/Modal.jsx';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'cancelled', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error: showError } = useNotification();
  const [patientRecords, setPatientRecords] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);

  // Fetch appointments for the logged-in doctor
  const { data: appointments, isLoading, error } = useQuery('doctorAppointments', async () => {
    const res = await api.get('/appointments');
    return res.data;
  });
  
  // Fetch all patient records with their files
  const { data: allPatientRecords, isLoading: recordsLoading } = useQuery('patientRecords', async () => {
    const res = await api.get('/patient-files');
    return res.data;
  });
  
  // Process patient records into a map for easy lookup
  useEffect(() => {
    if (allPatientRecords) {
      const recordMap = {};
      allPatientRecords.forEach(record => {
        // Only add records with valid patient data
        if (record.patient && record.patient._id) {
          recordMap[record.patient._id] = record;
        }
      });
      console.log('Patient records map:', recordMap);
      setPatientRecords(recordMap);
    }
  }, [allPatientRecords]);
  
  // View patient file
  const viewPatientFile = (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };
  
  // Close file modal
  const closeFileModal = () => {
    setShowFileModal(false);
    setSelectedFile(null);
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments?.filter(appointment => {
    const today = new Date();
    const appointmentDate = new Date(appointment.date);
    
    // Filter by status first
    if (filter === 'upcoming' && (appointment.status !== 'booked' || appointmentDate < today)) {
      return false;
    }
    if (filter === 'past' && appointmentDate >= today) {
      return false;
    }
    if (filter === 'cancelled' && appointment.status !== 'cancelled') {
      return false;
    }
    if (filter === 'completed' && appointment.status !== 'completed') {
      return false;
    }
    
    // Then apply search term if exists
    if (searchTerm) {
      const patientName = appointment.patient?.name?.toLowerCase() || '';
      return patientName.includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      // Show success notification
      success(`Appointment status updated to ${newStatus}`);
      // Refresh the data
      window.location.reload();
    } catch (err) {
      console.error('Error updating appointment:', err);
      showError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Doctor Dashboard</h1>
        
        {user && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome, Dr. {user.name}</h2>
            <p className="text-gray-600">Here you can manage your appointments and patient schedule.</p>
          </div>
        )}
        
        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md ${filter === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-md ${filter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Cancelled
            </button>
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Appointments Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Appointments</h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              Error loading appointments: {error.message}
            </div>
          ) : filteredAppointments?.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-500">No appointments found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments?.map(appointment => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.patient?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{appointment.patient?.phone || 'No contact'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(appointment.date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.timeSlot}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.department?.name || 'General'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'booked' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.patient && patientRecords[appointment.patient._id]?.documents?.length > 0 ? (
                          <div className="flex flex-col space-y-1">
                            {patientRecords[appointment.patient._id].documents
                              .filter(doc => {
                                // Only show files uploaded by this patient (URL contains patient ID)
                                return doc.fileUrl.includes(appointment.patient._id);
                              })
                              .map((doc, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => viewPatientFile(doc)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-xs"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {doc.description || doc.filename}
                                </button>
                              ))
                            }
                            {patientRecords[appointment.patient._id].documents.filter(doc => doc.fileUrl.includes(appointment.patient._id)).length === 0 && (
                              <span className="text-gray-400 text-xs">No patient uploads</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.status === 'booked' && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                              className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-sm"
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                              className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {appointment.status !== 'booked' && (
                          <span className="text-gray-400">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Upcoming Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">
            {appointments?.filter(a => 
              a.status === 'booked' && new Date(a.date) >= new Date()
            ).length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Completed Appointments</h3>
          <p className="text-3xl font-bold text-green-600">
            {appointments?.filter(a => a.status === 'completed').length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Cancelled Appointments</h3>
          <p className="text-3xl font-bold text-red-600">
            {appointments?.filter(a => a.status === 'cancelled').length || 0}
          </p>
        </div>
      </div>
      
      {/* File Viewer Modal */}
      {showFileModal && selectedFile && (
        <Modal title={selectedFile.description || selectedFile.filename} onClose={closeFileModal}>
          <div className="p-4 max-h-96 overflow-auto">
            {/* Display file based on type */}
            {selectedFile.fileUrl && (
              selectedFile.fileUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                <img 
                  src={`http://localhost:8001${selectedFile.fileUrl}`} 
                  alt={selectedFile.description || 'Patient file'} 
                  className="max-w-full h-auto mx-auto"
                />
              ) : selectedFile.fileUrl.match(/\.(pdf)$/i) ? (
                <div className="flex flex-col items-center">
                  <p className="mb-2">PDF Document</p>
                  <a 
                    href={`http://localhost:8001${selectedFile.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Open PDF
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="mb-2">Document: {selectedFile.filename}</p>
                  <a 
                    href={`http://localhost:8001${selectedFile.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Download File
                  </a>
                </div>
              )
            )}
            {selectedFile.description && (
              <p className="mt-4 text-gray-700">
                <span className="font-medium">Description:</span> {selectedFile.description}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Uploaded: {selectedFile.uploadedAt ? format(new Date(selectedFile.uploadedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
