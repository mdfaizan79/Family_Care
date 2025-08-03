const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, requireRole } = require('../middleware/auth');
const PatientRecord = require('../models/PatientRecord');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/patient-docs'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload patient file (medical document)
router.post('/', auth, requireRole('patient'), upload.single('file'), async (req, res) => {
  try {
    const { description } = req.body;
    const fileUrl = `/uploads/patient-docs/${req.file.filename}`;
    // Add to PatientRecord.documents array
    let record = await PatientRecord.findOne({ patient: req.user.id });
    if (!record) {
      record = new PatientRecord({ patient: req.user.id, documents: [] });
    }
    record.documents = record.documents || [];
    record.documents.push({
      filename: req.file.originalname,
      fileUrl,
      uploadedAt: new Date(),
      description
    });
    await record.save();
    res.status(201).json({ message: 'File uploaded', fileUrl });
  } catch (err) {
    res.status(400).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
