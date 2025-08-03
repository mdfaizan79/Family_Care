const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all appointments (admin) or user's appointments (patient/doctor)
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'admin') {
      appointments = await Appointment.find().populate('patient').populate('doctor').populate('department');
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      appointments = await Appointment.find({ doctor: doctor._id }).populate('patient').populate('doctor').populate('department');
    } else {
      appointments = await Appointment.find({ patient: req.user.id }).populate('patient').populate('doctor').populate('department');
    }
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
});

// Book appointment (patient)
router.post('/', auth, requireRole('patient'), async (req, res) => {
  try {
    const { doctor, department, date, timeSlot } = req.body;
    // Prevent booking in the past
    const now = new Date();
    const apptDate = new Date(date);
    if (apptDate < now.setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'Cannot book appointments in the past.' });
    }
    // Prevent double-booking (doctor, date, timeSlot, not cancelled)
    const conflict = await Appointment.findOne({
      doctor,
      date: apptDate,
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (conflict) {
      return res.status(400).json({ message: 'This time slot is already booked for the selected doctor.' });
    }
    const appointment = new Appointment({
      patient: req.user.id,
      doctor,
      department,
      date: apptDate,
      timeSlot
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: 'Error booking appointment', error: err.message });
  }
});

// Update appointment (admin/doctor)
router.put('/:id', auth, requireRole('admin', 'doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: 'Error updating appointment', error: err.message });
  }
});

// Cancel appointment (patient)
router.delete('/:id', auth, requireRole('patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patient.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(400).json({ message: 'Error cancelling appointment', error: err.message });
  }
});

// Reschedule appointment (patient)
router.patch('/:id/reschedule', auth, requireRole('patient'), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (appt.patient.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (appt.status !== 'booked') return res.status(400).json({ message: 'Only booked appointments can be rescheduled' });
    const now = new Date();
    if (new Date(appt.date) < now) return res.status(400).json({ message: 'Cannot reschedule past appointments' });
    const { date, timeSlot } = req.body;
    const newDate = new Date(date);
    if (newDate < now.setHours(0,0,0,0)) return res.status(400).json({ message: 'Cannot reschedule to a past date' });
    // Prevent conflict
    const conflict = await Appointment.findOne({
      _id: { $ne: appt._id },
      doctor: appt.doctor,
      date: newDate,
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (conflict) return res.status(400).json({ message: 'This time slot is already booked for the selected doctor.' });
    appt.date = newDate;
    appt.timeSlot = timeSlot;
    appt.reminderSent = false;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: 'Error rescheduling appointment', error: err.message });
  }
});

module.exports = router;
