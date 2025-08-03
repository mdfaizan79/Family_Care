const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const nodemailer = require('nodemailer');
const Department = require('../models/Department');

// Configure nodemailer (uses .env)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendReminderEmail(to, subject, text) {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

// Run every hour
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // Find appointments in next 24h, not cancelled, not already reminded
  const appts = await Appointment.find({
    date: { $gte: now, $lte: in24h },
    status: 'booked',
    reminderSent: { $ne: true }
  }).populate('patient doctor department');
  for (const appt of appts) {
    if (!appt.patient?.email) continue;
    const subject = `Family Care: Appointment Reminder for ${appt.date.toDateString()}`;
    const text = `Dear ${appt.patient.name},\n\nThis is a reminder for your appointment:\nDoctor: ${appt.doctor?.user?.name}\nDepartment: ${appt.department?.name}\nDate: ${appt.date.toDateString()}\nTime: ${appt.timeSlot}\n\nPlease arrive on time.\n\n- Family Care Hospital`;
    try {
      await sendReminderEmail(appt.patient.email, subject, text);
      appt.reminderSent = true;
      await appt.save();
      console.log(`Reminder sent to ${appt.patient.email} for appointment ${appt._id}`);
    } catch (err) {
      console.error(`Failed to send reminder for appointment ${appt._id}:`, err.message);
    }
  }
});

module.exports = {};
