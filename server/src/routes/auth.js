const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { auth, requireRole } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// Patient Registration - Public access
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, address } = req.body;
    
    console.log('Registration attempt with email:', email);
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Only allow patient registration through public endpoint
    const role = 'patient';
    
    // Convert email to lowercase for consistent comparison
    const emailLowercase = email.toLowerCase().trim();
    console.log('Checking for email (lowercase):', emailLowercase);
    
    // Use a safe way to escape the email for regex
    const escapedEmail = emailLowercase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    try {
      // First try direct match
      const directMatch = await User.findOne({ email: emailLowercase });
      
      if (directMatch) {
        console.log('Direct match found:', directMatch.email);
        return res.status(400).json({ message: 'Email already registered.' });
      }
      
      // Then try case-insensitive
      const existingUser = await User.findOne({ 
        email: { $regex: new RegExp('^' + escapedEmail + '$', 'i') } 
      });
      
      console.log('Regex search result:', existingUser ? `Found user with email: ${existingUser.email}` : 'No existing user');
      
      if (existingUser) {
        console.log('Email comparison:', emailLowercase, 'vs existing', existingUser.email);
        return res.status(400).json({ message: 'Email already registered.' });
      }
    } catch (dbError) {
      console.error('Error during email check:', dbError);
      // Continue with registration if there was an error in the query
      // This helps avoid false positives due to bad regex
    }
    
    // Generate 6-digit verification OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Also keep token for backward compatibility
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      address,
      verificationToken,
      verificationTokenExpiry,
      verificationOTP,
      verificationOTPExpiry
    });
    
    await user.save();
    
    // Send verification email
    await sendVerificationEmail(user.email, verificationOTP);
    
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// OTP Email Verification
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationOTPExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpiry = undefined;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    
    await user.save();
    
    return res.json({ 
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ message: 'Server error during verification' });
  }
});

// Legacy Email Verification (Link-based)
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token.' 
      });
    }
    
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Email verification failed.', error: err.message });
  }
});

// Resend verification email with OTP
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new 6-digit OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Keep token for backward compatibility
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.verificationOTP = verificationOTP;
    user.verificationOTPExpiry = verificationOTPExpiry;
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    
    await user.save();
    
    // Send verification email with OTP
    await sendVerificationEmail(user.email, verificationOTP);
    
    res.status(200).json({ message: 'Verification email with OTP sent successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend verification email', error: err.message });
  }
});

// Admin/Doctor Creation - Admin only
router.post('/create-user', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    // Only admins can create doctors
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({ message: 'You can only create doctor or admin accounts.' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });
    
    // Create the user with admin as creator
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      createdBy: req.user.id,
      isEmailVerified: true // Admin-created accounts don't need verification
    });
    
    await user.save();
    
    // If creating a doctor, create the doctor record as well
    if (role === 'doctor') {
      const { specialization, qualifications, experience, department } = req.body;
      
      const doctor = new Doctor({
        user: user._id,
        specialization,
        qualifications,
        experience,
        department
      });
      
      await doctor.save();
    }
    
    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Account creation failed.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    
    // Check if the user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
    }
    
    // Check if the user's email is verified for patients
    if (user.role === 'patient' && !user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in.',
        needsVerification: true
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
    
    // Get additional data based on role
    let additionalData = {};
    
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id }).populate('department');
      if (doctorProfile) {
        additionalData = {
          doctorId: doctorProfile._id,
          specialization: doctorProfile.specialization,
          department: doctorProfile.department ? doctorProfile.department.name : null,
          departmentId: doctorProfile.department ? doctorProfile.department._id : null,
        };
      }
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...additionalData
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // To prevent user enumeration, always return success
      return res.status(200).json({ message: 'If that email exists in our system, a password reset link has been sent.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetTokenExpiry;
    await user.save();
    
    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);
    
    res.status(200).json({ message: 'If that email exists in our system, a password reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process password reset request.', error: err.message });
  }
});

// Validate Reset Token
router.post('/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    
    res.status(200).json({ message: 'Token is valid.' });
  } catch (err) {
    res.status(500).json({ message: 'Token validation failed.', error: err.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed.', error: err.message });
  }
});

// Get Current User
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Get additional data based on role
    let additionalData = {};
    
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id }).populate('department');
      if (doctorProfile) {
        additionalData = {
          doctorId: doctorProfile._id,
          specialization: doctorProfile.specialization,
          department: doctorProfile.department ? doctorProfile.department.name : null,
          departmentId: doctorProfile.department ? doctorProfile.department._id : null,
        };
      }
    }
    
    res.json({ ...user.toObject(), ...additionalData });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user profile.', error: err.message });
  }
});

module.exports = router;
