const mongoose = require('mongoose');

const EmergencyRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String,
  location: String,
  type: { type: String, enum: ['ambulance', 'emergency', 'other'], default: 'emergency' },
  status: { type: String, enum: ['pending', 'responded', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('EmergencyRequest', EmergencyRequestSchema);
