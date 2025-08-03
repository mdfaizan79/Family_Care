const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { auth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Update current user profile
router.patch('/me', auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error updating profile', error: err.message });
  }
});

// Get users available to be assigned as doctors (admin only)
router.get('/available-doctors', auth, requireRole('admin'), async (req, res) => {
  try {
    // Find all users
    const users = await User.find({}).select('-password');
    
    // Find existing doctors to exclude users already assigned
    const existingDoctors = await Doctor.find().select('user');
    const assignedUserIds = existingDoctors.map(doc => doc.user.toString());
    
    // Filter users to include only those not already assigned as doctors
    const availableUsers = users.filter(user => !assignedUserIds.includes(user._id.toString()));
    
    res.json(availableUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching available doctors', error: err.message });
  }
});

module.exports = router;
