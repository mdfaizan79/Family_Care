const express = require('express');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all doctors (optionally filter by department)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.department ? { department: req.query.department } : {};
    const doctors = await Doctor.find(filter).populate('user').populate('department');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors', error: err.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user').populate('department');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctor', error: err.message });
  }
});

// Create doctor (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: 'Error creating doctor', error: err.message });
  }
});

// Update doctor (admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: 'Error updating doctor', error: err.message });
  }
});

// Delete doctor (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting doctor', error: err.message });
  }
});

module.exports = router;
