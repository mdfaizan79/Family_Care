const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Upload prescription/lab report (doctor/admin)
router.post('/', auth, requireRole('doctor', 'admin'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
