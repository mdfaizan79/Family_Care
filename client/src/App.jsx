import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Departments from './pages/Departments.jsx';
import Doctors from './pages/Doctors.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import Navbar from './components/Navbar.jsx';
import PatientProfile from './pages/PatientProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminDoctors from './pages/AdminDoctors.jsx';
import AdminDepartments from './pages/AdminDepartments.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import EmailVerification from './pages/EmailVerification.jsx';
import OTPVerification from './pages/OTPVerification.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  return (
    <NotificationProvider>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/doctors" element={<Doctors />} />
        
        {/* Auth related routes */}
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Patient routes */}
        <Route 
          path="/book-appointment" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookAppointment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientProfile />
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor routes */}
        <Route 
          path="/doctor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/appointments" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/doctors" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDoctors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/departments" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDepartments />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;
