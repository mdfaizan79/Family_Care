require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/department'));
app.use('/api/doctors', require('./routes/doctor'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/patient-records', require('./routes/patientRecord'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/upload', require('./routes/upload'));
app.use('/uploads', require('express').static(require('path').join(__dirname, '../../uploads')));
app.use('/api/patient-upload', require('./routes/patientUpload'));
// Ensure /uploads/patient-docs is served
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/user'));

// Basic route
app.get('/', (req, res) => {
  res.send('Family Care Hospital Management System API');
});

// Start appointment reminder job
require('./utils/reminderJob');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
