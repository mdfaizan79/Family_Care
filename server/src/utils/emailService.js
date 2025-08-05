const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
  // Debug mode
  debug: process.env.NODE_ENV === 'development'
});

/**
 * Send verification OTP to user after registration
 * @param {string} email - The recipient email address
 * @param {string} otp - The verification OTP code
 */
const sendVerificationEmail = async (email, otp) => {
  // Log OTP in development mode, but still send email
  if (process.env.NODE_ENV === 'development') {
    console.log(`Verification OTP for ${email}: ${otp}`);
    // We no longer return here, so emails will be sent in development too
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Hospital <noreply@hospital.com>',
      to: email,
      subject: 'Email Verification OTP - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Verify Your Email</h2>
          <p>Thank you for registering with our Hospital Management System. Please use the OTP code below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          <p>Please enter this code in the verification page of the application.</p>
          <p>If you did not create an account, you can safely ignore this email.</p>
          <p>This verification code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #6b7280; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Hospital Management System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email to user
 * @param {string} email - The recipient email address
 * @param {string} token - The reset token
 */
const sendPasswordResetEmail = async (email, token) => {
  // Log password reset link in development mode, but still send email
  if (process.env.NODE_ENV === 'development') {
    // Ensure we're using the correct CLIENT_URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
    console.log(`Password Reset Link: ${clientUrl}/reset-password/${token}`);
    // We no longer return here, so emails will be sent in development too
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Hospital <noreply@hospital.com>',
      to: email,
      subject: 'Password Reset - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password/${token}" 
               style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
          <p>This reset link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #6b7280; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Hospital Management System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send appointment confirmation email to patients
 * @param {string} email - The recipient email address
 * @param {Object} appointment - Appointment details
 */
const sendAppointmentConfirmationEmail = async (email, appointment) => {
  // In development, you might just want to log instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log(`Appointment Confirmation for: ${email}`, appointment);
    return;
  }

  try {
    const { doctor, date, timeSlot, department } = appointment;
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Hospital <noreply@hospital.com>',
      to: email,
      subject: 'Appointment Confirmation - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Appointment Confirmed</h2>
          <p>Your appointment has been successfully booked with the following details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Doctor:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${doctor.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Department:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${department.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Date:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Time:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${timeSlot}</td>
            </tr>
          </table>
          
          <p>Please arrive 15 minutes before your scheduled appointment time.</p>
          <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Appointment
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #6b7280; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Hospital Management System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending appointment confirmation email:', err);
    throw new Error('Failed to send appointment confirmation email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmationEmail
};
