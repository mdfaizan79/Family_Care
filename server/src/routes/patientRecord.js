const express = require('express');
const PatientRecord = require('../models/PatientRecord');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all patient records (admin/doctor) or own record (patient)
router.get('/', auth, async (req, res) => {
  try {
    let records;
    if (req.user.role === 'admin' || req.user.role === 'doctor') {
      records = await PatientRecord.find().populate('patient').populate('prescriptions.doctor');
    } else {
      records = await PatientRecord.find({ patient: req.user.id }).populate('patient').populate('prescriptions.doctor');
    }
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching records', error: err.message });
  }
});

// Get single patient record by ID (admin/doctor/patient-owner)
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id).populate('patient').populate('prescriptions.doctor');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching record', error: err.message });
  }
});

// Create patient record (doctor/admin)
router.post('/', auth, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const record = new PatientRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: 'Error creating record', error: err.message });
  }
});

// Update patient record (doctor/admin)
router.put('/:id', auth, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const record = await PatientRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: 'Error updating record', error: err.message });
  }
});

module.exports = router;
