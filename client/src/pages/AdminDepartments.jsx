import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api.jsx';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext.jsx';

export default function AdminDepartments() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    services: [''],
    contactPerson: '',
    contactPhone: '',
  });
  const queryClient = useQueryClient();
  const { success, error, info } = useNotification();

  // Fetch departments
  const { data: departments, isLoading } = useQuery('departments', async () => {
    const res = await api.get('/departments');
    return res.data;
  });

  // Create department mutation
  const createDepartmentMutation = useMutation(
    (newDepartment) => api.post('/departments', newDepartment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments');
        setShowAddModal(false);
        resetForm();
        success('Department created successfully');
      },
      onError: (err) => {
        error(err.response?.data?.message || 'Failed to create department');
      }
    }
  );

  // Update department mutation
  const updateDepartmentMutation = useMutation(
    ({ id, data }) => api.put(`/departments/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments');
        setShowEditModal(false);
        setEditingDepartment(null);
        resetForm();
        success('Department updated successfully');
      },
      onError: (err) => {
        error(err.response?.data?.message || 'Failed to update department');
      }
    }
  );

  // Delete department mutation
  const deleteDepartmentMutation = useMutation(
    (id) => api.delete(`/departments/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments');
        success('Department deleted successfully');
      },
      onError: (err) => {
        error(err.response?.data?.message || 'Failed to delete department');
      }
    }
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      services: [''],
      contactPerson: '',
      contactPhone: '',
    });
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle service input change
  const handleServiceChange = (index, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = value;
    setFormData({ ...formData, services: updatedServices });
  };

  // Add new service input
  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  // Remove service input
  const handleRemoveService = (index) => {
    const updatedServices = [...formData.services];
    updatedServices.splice(index, 1);
    setFormData({ ...formData, services: updatedServices });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty services
    const filteredData = {
      ...formData,
      services: formData.services.filter(service => service.trim() !== '')
    };
    
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ id: editingDepartment._id, data: filteredData });
    } else {
      createDepartmentMutation.mutate(filteredData);
    }
  };

  // Set form data when editing
  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        name: editingDepartment.name || '',
        description: editingDepartment.description || '',
        services: editingDepartment.services && editingDepartment.services.length > 0 
          ? editingDepartment.services 
          : [''],
        contactPerson: editingDepartment.contactPerson || '',
        contactPhone: editingDepartment.contactPhone || '',
      });
    }
  }, [editingDepartment]);

  // Loading state
  if (isLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
            <p className="text-gray-600">Add, edit or remove hospital departments</p>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition">
              Back to Dashboard
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition"
            >
              Add New Department
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments && departments.length > 0 ? (
            departments.map((dept) => (
              <div key={dept._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{dept.name}</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingDepartment(dept);
                          setShowEditModal(true);
                        }}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this department?')) {
                            deleteDepartmentMutation.mutate(dept._id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{dept.description}</p>
                  
                  {dept.services && dept.services.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Services:</h3>
                      <div className="flex flex-wrap gap-2">
                        {dept.services.map((service, i) => (
                          <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100 pt-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{dept.contactPerson || 'No contact person'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{dept.contactPhone || 'No contact number'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
              <p className="mt-1 text-gray-500">Create your first department using the "Add New Department" button</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingDepartment ? 'Edit Department' : 'Add New Department'}
                  </h3>
                  
                  {/* Department Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    ></textarea>
                  </div>
                  
                  {/* Services */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services
                    </label>
                    <div className="space-y-2">
                      {formData.services.map((service, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => handleServiceChange(index, e.target.value)}
                            className="flex-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter a service"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            disabled={formData.services.length === 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="mt-2 text-sm text-green-600 hover:text-green-800"
                    >
                      + Add another service
                    </button>
                  </div>
                  
                  {/* Contact Person */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  {/* Contact Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      createDepartmentMutation.isLoading || updateDepartmentMutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={createDepartmentMutation.isLoading || updateDepartmentMutation.isLoading}
                  >
                    {createDepartmentMutation.isLoading || updateDepartmentMutation.isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingDepartment(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
