const express = require('express');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Appointments per day (admin)
router.get('/appointments-per-day', auth, requireRole('admin'), async (req, res) => {
  try {
    const data = await Appointment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

// Feedback stats (admin)
router.get('/feedback-stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json(avgRating[0] || { avg: 0, count: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feedback stats', error: err.message });
  }
});

// Doctor and department counts (admin)
router.get('/counts', auth, requireRole('admin'), async (req, res) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    const departmentCount = await Department.countDocuments();
    res.json({ doctorCount, departmentCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching counts', error: err.message });
  }
});

module.exports = router;
