import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'border-b-2 border-white' : '';
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-4 md:px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-white rounded-full p-1 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-tight">Family Care</span>
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-blue-200 hover:border-blue-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isMenuOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/departments" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/departments')}`}>Departments</Link>
        <Link to="/doctors" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/doctors')}`}>Doctors</Link>
        {user?.role === 'patient' && (
          <>
            <Link to="/book-appointment" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/book-appointment')}`}>Book Appointment</Link>
            <Link to="/dashboard" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/dashboard')}`}>Dashboard</Link>
          </>
        )}
        {user?.role === 'doctor' && (
          <>
            <Link to="/doctor/dashboard" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/doctor/dashboard')}`}>My Appointments</Link>
            <Link to="/doctor/dashboard" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/doctor/dashboard')}`}>Doctor Panel</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" className={`hover:text-blue-200 transition duration-200 px-2 py-1 ${isActive('/admin/dashboard')}`}>Admin Panel</Link>
          </>
        )}
      </div>

      {/* User Actions */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-blue-700 rounded-full px-3 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{user.name} <span className="text-blue-200 text-sm">({user.role})</span></span>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md transition duration-200 flex items-center gap-1 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:bg-blue-700 px-4 py-1.5 rounded-md transition duration-200">Login</Link>
            <Link to="/register" className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-1.5 rounded-md transition duration-200 shadow-md font-medium">Register</Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-blue-700 shadow-lg md:hidden z-50 border-t border-blue-600">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link to="/departments" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Departments</Link>
            <Link to="/doctors" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Doctors</Link>
            {user?.role === 'patient' && (
              <>
                <Link to="/book-appointment" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Book Appointment</Link>
                <Link to="/dashboard" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              </>
            )}
            {user?.role === 'doctor' && (
              <>
                <Link to="/doctor/dashboard" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>My Appointments</Link>
                <Link to="/doctor/dashboard" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Doctor Panel</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                <Link to="/admin/doctors" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Manage Doctors</Link>
                <Link to="/admin/departments" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Manage Departments</Link>
              </>
            )}
            <div className="border-t border-blue-600 my-2"></div>
            {user ? (
              <>
                <div className="py-2 px-2">{user.name} ({user.role})</div>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 py-2 px-2 rounded text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 hover:bg-blue-600 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="py-2 bg-white text-blue-700 hover:bg-blue-50 px-2 rounded" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
