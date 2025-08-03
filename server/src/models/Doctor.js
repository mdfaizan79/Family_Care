const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  qualifications: String,
  experience: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  availability: [{
    day: String, // e.g., Monday
    timeSlots: [String], // e.g., ['09:00-11:00', '14:00-16:00']
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
