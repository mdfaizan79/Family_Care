const express = require('express');
const EmergencyRequest = require('../models/EmergencyRequest');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Submit emergency request (open to all, patient or guest)
router.post('/', async (req, res) => {
  try {
    const reqBody = req.user ? { ...req.body, patient: req.user.id } : req.body;
    const emergency = new EmergencyRequest(reqBody);
    await emergency.save();
    res.status(201).json(emergency);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting emergency request', error: err.message });
  }
});

// Get all emergency requests (admin only)
router.get('/', auth, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
}, async (req, res) => {
  try {
    const emergencies = await EmergencyRequest.find().populate('patient');
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching emergencies', error: err.message });
  }
});

// Update emergency status (admin only)
router.put('/:id', auth, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
}, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(emergency);
  } catch (err) {
    res.status(400).json({ message: 'Error updating emergency request', error: err.message });
  }
});

module.exports = router;
