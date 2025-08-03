const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalHistory: [String],
  prescriptions: [
    {
      date: Date,
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      description: String,
      fileUrl: String, // For uploaded prescription files
    }
  ],
  labReports: [
    {
      date: Date,
      type: String,
      result: String,
      fileUrl: String, // For uploaded report files
    }
  ],
  documents: [
    {
      filename: String,
      fileUrl: String,
      uploadedAt: Date,
      description: String
    }
  ],
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
