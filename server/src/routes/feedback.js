const express = require('express');
const Feedback = require('../models/Feedback');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all feedback (admin) or for a doctor/department
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.department) filter.department = req.query.department;
    const feedbacks = await Feedback.find(filter).populate('patient').populate('doctor').populate('department');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feedback', error: err.message });
  }
});

// Submit feedback (patient)
router.post('/', auth, requireRole('patient'), async (req, res) => {
  try {
    const { appointmentId, doctor, department, rating, comment } = req.body;
    // Prevent duplicate feedback for same appointment
    const existing = await Feedback.findOne({ patient: req.user.id, doctor, department, appointment: appointmentId });
    if (existing) return res.status(400).json({ message: 'Feedback already submitted for this appointment.' });
    const feedback = new Feedback({ patient: req.user.id, doctor, department, rating, comment, appointment: appointmentId });
    await feedback.save();
    // Mark appointment as feedbackSubmitted
    if (appointmentId) {
      const Appointment = require('../models/Appointment');
      await Appointment.findByIdAndUpdate(appointmentId, { feedbackSubmitted: true });
    }
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting feedback', error: err.message });
  }
});

// Get all feedback by the logged-in patient
router.get('/mine', auth, requireRole('patient'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ patient: req.user.id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('department');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feedback', error: err.message });
  }
});

module.exports = router;
