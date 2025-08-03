import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../api.jsx';
import { useLocation, Link } from 'react-router-dom';

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export default function Doctors() {
  const query = useQueryParams();
  const department = query.get('department');
  const [filter, setFilter] = useState('');
  
  const { data: departmentsData } = useQuery('departments', async () => {
    const res = await api.get('/departments');
    return res.data;
  });
  
  const { data, isLoading, error } = useQuery(['doctors', department], async () => {
    const res = await api.get('/doctors', { params: department ? { department } : {} });
    return res.data;
  });

  // Filter doctors by name or specialization
  const filteredDoctors = data?.filter(doc => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      doc.user?.name?.toLowerCase().includes(searchTerm) ||
      doc.specialization?.toLowerCase().includes(searchTerm)
    );
  });

  // Get department name if filtering by department
  const departmentName = departmentsData?.find(d => d._id === department)?.name;

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading doctors...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700">Failed to load doctors. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {departmentName ? `${departmentName} Doctors` : 'Our Medical Specialists'}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {departmentName 
              ? `Meet our expert doctors specializing in ${departmentName}` 
              : 'Our team of experienced doctors is dedicated to providing the highest quality healthcare services'}
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by name or specialization"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Department Filter Pill (if viewing all doctors) */}
        {!department && departmentsData && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link to="/doctors" className={`px-4 py-2 rounded-full text-sm font-medium ${!department ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                All Departments
              </Link>
              {departmentsData.map(dept => (
                <Link 
                  key={dept._id} 
                  to={`/doctors?department=${dept._id}`} 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${department === dept._id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {dept.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Back to all departments link (if viewing specific department) */}
        {department && (
          <div className="mb-8 flex justify-center">
            <Link to="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View All Doctors
            </Link>
          </div>
        )}
        
        {/* Doctors Grid */}
        {filteredDoctors?.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => (
              <div key={doc._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={doc.user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                      alt={doc.user?.name} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 shadow-sm" 
                    />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{doc.user?.name}</h2>
                      <div className="text-blue-600 font-medium">{doc.specialization}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span className="text-gray-700">{doc.qualifications}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">Experience: {doc.experience}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-700">Department: {doc.department?.name}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Availability</h3>
                    <div className="bg-blue-50 rounded-lg p-3">
                      {doc.availability?.map((a, i) => (
                        <div key={i} className="mb-1 last:mb-0">
                          <span className="font-medium text-blue-800">{a.day}:</span> 
                          <span className="text-blue-700">{a.timeSlots.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link 
                      to="/book-appointment" 
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition duration-300 shadow-md"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
