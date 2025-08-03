const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' },
  notes: String,
  feedbackSubmitted: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
