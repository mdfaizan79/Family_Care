const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const PatientRecord = require('../models/PatientRecord');
const User = require('../models/User');

const router = express.Router();

// Get all patient records (for doctors and admins)
router.get('/', auth, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    // For doctors, only fetch their patients' records
    const patientRecords = await PatientRecord.find()
      .populate('patient', 'name email phone');
    
    // Log for debugging
    console.log(`Found ${patientRecords.length} patient records`);
    patientRecords.forEach(record => {
      console.log(`Patient ID: ${record.patient?._id}, Documents: ${record.documents?.length || 0}`);
    });
    
    res.json(patientRecords);
  } catch (err) {
    console.error('Error fetching patient records:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get patient record by patient ID
router.get('/:patientId', auth, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patientRecord = await PatientRecord.findOne({ patient: patientId })
      .populate('patient', 'name email phone');
    
    if (!patientRecord) {
      return res.status(404).json({ message: 'Patient record not found' });
    }
    
    res.json(patientRecord);
  } catch (err) {
    console.error('Error fetching patient record:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Serve the actual file
router.get('/file/:filename', auth, requireRole(['doctor', 'admin', 'patient']), (req, res) => {
  const { filename } = req.params;
  // Send the file from the uploads directory
  res.sendFile(filename, { root: 'uploads/patient-docs' });
});

module.exports = router;
