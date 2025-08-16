import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api.jsx';
import { Link } from 'react-router-dom';
import CreateUserModal from '../components/CreateUserModal';
import { FaPlus, FaUserMd, FaEdit, FaTrash } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext.jsx';

export default function AdminDoctors() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const { success, error: showError } = useNotification();
  const [formData, setFormData] = useState({
    user: '',
    specialization: '',
    qualifications: '',
    experience: '',
    department: '',
    availability: [
      { day: 'Monday', timeSlots: ['9:00 AM - 12:00 PM'] }
    ]
  });
  const queryClient = useQueryClient();

  // Fetch doctors
  const { data: doctors, isLoading: loadingDoctors } = useQuery('doctors', async () => {
    const res = await api.get('/doctors');
    return res.data;
  });

  // Fetch departments for dropdown
  const { data: departments, isLoading: loadingDepartments } = useQuery('departments', async () => {
    const res = await api.get('/departments');
    return res.data;
  });

  // Fetch available users for doctor assignment
  const { data: users, isLoading: loadingUsers } = useQuery('availableUsers', async () => {
    try {
      const res = await api.get('/users/available-doctors');
      return res.data;
    } catch (err) {
      console.error('Error fetching available doctor users:', err);
      return [];
    }
  });

  // Create doctor mutation
  const createDoctorMutation = useMutation(
    (newDoctor) => api.post('/doctors', newDoctor),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('doctors');
        setShowAddModal(false);
        resetForm();
        success('Doctor profile created successfully!');
      },
      onError: (err) => {
        showError(err.response?.data?.message || 'Failed to create doctor profile. Please try again.');
      }
    }
  );

  // Update doctor mutation
  const updateDoctorMutation = useMutation(
    ({ id, data }) => api.put(`/doctors/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('doctors');
        setShowEditModal(false);
        setEditingDoctor(null);
        resetForm();
        success('Doctor profile updated successfully!!!');
      },
      onError: (err) => {
        showError(err.response?.data?.message || 'Failed to update doctor profile. Please try again.');
      }
    }
  );

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation(
    (id) => api.delete(`/doctors/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('doctors');
        success('Doctor profile deleted successfully!');
      },
      onError: (err) => {
        showError(err.response?.data?.message || 'Failed to delete doctor profile. Please try again.');
      }
    }
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      user: '',
      specialization: '',
      qualifications: '',
      experience: '',
      department: '',
      availability: [
      
        { day: 'Monday', timeSlots: ['9:00 AM - 12:00 PM'] }
      ]
    });
  };

  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle add availability time slot
  const handleAddTimeSlot = (dayIndex) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIndex] = {
      ...newAvailability[dayIndex],
      timeSlots: [...newAvailability[dayIndex].timeSlots, '']
    };
    setFormData({ ...formData, availability: newAvailability });
  };

  // Handle update time slot
  const handleTimeSlotChange = (dayIndex, slotIndex, value) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIndex].timeSlots[slotIndex] = value;
    setFormData({ ...formData, availability: newAvailability });
  };

  // Handle remove time slot
  const handleRemoveTimeSlot = (dayIndex, slotIndex) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIndex].timeSlots.splice(slotIndex, 1);
    setFormData({ ...formData, availability: newAvailability });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingDoctor) {
      updateDoctorMutation.mutate({ id: editingDoctor._id, data: formData });
    } else {
      createDoctorMutation.mutate(formData);
    }
  };

  // Set form data when editing
  useEffect(() => {
    if (editingDoctor) {
      setFormData({
        user: editingDoctor.user?._id || '',
        specialization: editingDoctor.specialization || '',
        qualifications: editingDoctor.qualifications || '',
        experience: editingDoctor.experience || '',
        department: editingDoctor.department?._id || '',
        availability: editingDoctor.availability || [
          { day: 'Monday', timeSlots: ['9:00 AM - 12:00 PM'] }
        ]
      });
    }
  }, [editingDoctor]);

  // Loading state
  if (loadingDoctors || loadingDepartments || loadingUsers) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="text-gray-600">Add, edit or remove doctors</p>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition">
              Back to Dashboard
            </Link>
            <div className="relative inline-block text-left">
              <div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Doctor Profile
                </button>
              </div>
            </div>
            <div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition flex items-center"
              >
                <FaUserMd className="mr-2" /> Create Doctor Account
              </button>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors && doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={doctor.user?.avatar || 'https://via.placeholder.com/40'} 
                            alt={doctor.user?.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.user?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{doctor.user?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.department?.name || 'Not assigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialization || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">{doctor.qualifications || 'No qualifications'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.experience || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingDoctor(doctor);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const confirmDelete = () => deleteDoctorMutation.mutate(doctor._id);
                          showError(
                            'Are you sure you want to delete this doctor profile?',
                            { 
                              title: 'Confirm Deletion',
                              confirmAction: confirmDelete,
                              confirmText: 'Delete',
                              duration: 0 // Don't auto-dismiss
                            }
                          );
                        }}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <FaTrash className="mr-1" size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No doctors found. Create your first doctor using the "Add New Doctor" button.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handle successful user creation */}
      <CreateUserModal 
        isOpen={showCreateUserModal} 
        onClose={() => setShowCreateUserModal(false)} 
        role="doctor"
        onSuccess={(data) => {
          setShowCreateUserModal(false);
          // Refresh available users for the doctor form
          queryClient.invalidateQueries('availableUsers');
          // Show a success message
          success(`${data.message} You can now add their doctor profile.`);
        }} 
      />

      {/* Add/Edit Doctor Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setEditingDoctor(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* User Information Section */}
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-700 mb-2">Doctor Information</h4>
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-blue-800 mb-2">
                        <span className="font-medium">Note:</span> Each doctor requires a user account with the role of "doctor". If you don't see any available users below, you'll need to
                        <Link to="/register" className="text-blue-600 font-medium hover:text-blue-800 mx-1">create new user accounts</Link>
                        first and assign them the "doctor" role.
                      </p>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Doctor User Account <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="user"
                      value={formData.user}
                      onChange={handleChange}
                      disabled={!!editingDoctor}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Select Doctor's User Account --</option>
                      {users && users.length > 0 ? (
                        users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No available doctor user accounts found</option>
                      )}
                    </select>
                    {editingDoctor ? (
                      <p className="mt-1 text-sm text-gray-500">User account cannot be changed after creation</p>
                    ) : users && users.length === 0 ? (
                      <p className="mt-1 text-sm text-red-500">No available doctor user accounts. Please create a user with the role "doctor" first.</p>
                    ) : null}
                  </div>
                  
                  {/* Department Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Select Department --</option>
                      {departments && departments.length > 0 ? (
                        departments.map(department => (
                          <option key={department._id} value={department._id}>
                            {department.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No departments found</option>
                      )}
                    </select>
                    {departments && departments.length === 0 && (
                      <p className="mt-1 text-sm text-red-500">
                        No departments available. <Link to="/admin/departments" className="text-blue-600 hover:underline">Create a department</Link> first.
                      </p>
                    )}
                  </div>
                  
                  {/* Specialization */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Cardiology, Neurology"
                      required
                    />
                  </div>
                  
                  {/* Qualifications */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualifications <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. MD, PhD, MBBS"
                      required
                    />
                  </div>
                  
                  {/* Experience */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 5+ years"
                      required
                    />
                  </div>
                  </div> {/* End of grid layout */}
                  
                  {/* Availability */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-800 mb-2">Availability Schedule</h4>
                    <p className="text-sm text-gray-600 mb-3">Set up the doctor's available time slots by day of the week.</p>
                    
                    <div className="space-y-3">
                      {formData.availability.map((daySchedule, dayIndex) => (
                        <div key={dayIndex} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <select
                                value={daySchedule.day}
                                onChange={(e) => {
                                  const newAvailability = [...formData.availability];
                                  newAvailability[dayIndex].day = e.target.value;
                                  setFormData({ ...formData, availability: newAvailability });
                                }}
                                className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0"
                              >
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                              </select>
                            </div>
                            
                            {formData.availability.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newAvailability = [...formData.availability];
                                  newAvailability.splice(dayIndex, 1);
                                  setFormData({ ...formData, availability: newAvailability });
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Remove day"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {daySchedule.timeSlots.map((timeSlot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center mb-2">
                              <input
                                type="text"
                                value={timeSlot}
                                onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, e.target.value)}
                                className="flex-1 py-1 px-2 border border-gray-300 rounded-md mr-2"
                                placeholder="e.g. 9:00 AM - 12:00 PM"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                                className="text-red-500 hover:text-red-700"
                                disabled={daySchedule.timeSlots.length === 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => handleAddTimeSlot(dayIndex)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add time slot
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          availability: [
                            ...formData.availability,
                            { day: 'Tuesday', timeSlots: ['9:00 AM - 12:00 PM'] }
                          ]
                        });
                      }}
                      className="mt-3 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition py-2 px-3 rounded-md flex items-center w-max"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Another Day
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      createDoctorMutation.isLoading || updateDoctorMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={createDoctorMutation.isLoading || updateDoctorMutation.isLoading}
                  >
                    {createDoctorMutation.isLoading || updateDoctorMutation.isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingDoctor(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
