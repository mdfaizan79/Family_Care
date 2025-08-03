const express = require('express');
const Department = require('../models/Department');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching departments', error: err.message });
  }
});

// Create department (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ message: 'Error creating department', error: err.message });
  }
});

// Update department (admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(department);
  } catch (err) {
    res.status(400).json({ message: 'Error updating department', error: err.message });
  }
});

// Delete department (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting department', error: err.message });
  }
});

module.exports = router;
