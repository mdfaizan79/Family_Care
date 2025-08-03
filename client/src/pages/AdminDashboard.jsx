import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Manage hospital doctors, departments, and view system analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Doctors Management Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Manage Doctors</h2>
              <p className="text-gray-600 text-center mb-6">Add, edit or remove doctors and their profiles</p>
              <Link
                to="/admin/doctors"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition duration-300 shadow-md"
              >
                Go to Doctors
              </Link>
            </div>
          </div>

          {/* Departments Management Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Manage Departments</h2>
              <p className="text-gray-600 text-center mb-6">Create, update or delete hospital departments</p>
              <Link
                to="/admin/departments"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg transition duration-300 shadow-md"
              >
                Go to Departments
              </Link>
            </div>
          </div>

          {/* Dashboard Analytics Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Analytics</h2>
              <p className="text-gray-600 text-center mb-6">View hospital statistics and performance data</p>
              <Link
                to="/admin/analytics"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded-lg transition duration-300 shadow-md"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
