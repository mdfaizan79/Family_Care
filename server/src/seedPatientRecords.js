require('dotenv').config();
const mongoose = require('mongoose');
const PatientRecord = require('./models/PatientRecord');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch((err) => console.error('MongoDB connection error:', err));

const seedPatientRecords = async () => {
  try {
    // Find patient user to link records to
    const patientUser = await User.findOne({ role: 'patient' });
    
    if (!patientUser) {
      console.log('No patient user found. Please seed users first.');
      process.exit(1);
    }
    
    // Check if record already exists
    const existingRecord = await PatientRecord.findOne({ patient: patientUser._id });
    
    if (existingRecord) {
      console.log('Patient record already exists. Adding sample documents...');
      
      // Add sample documents to existing record
      existingRecord.documents = [
        {
          filename: 'blood_test_results.pdf',
          fileUrl: '/uploads/patient-docs/sample-blood-test.pdf',
          uploadedAt: new Date(),
          description: 'Blood Test Results'
        },
        {
          filename: 'xray_scan.jpg',
          fileUrl: '/uploads/patient-docs/sample-xray.jpg',
          uploadedAt: new Date(),
          description: 'Chest X-Ray'
        },
        {
          filename: 'medical_history.docx',
          fileUrl: '/uploads/patient-docs/sample-medical-history.docx',
          uploadedAt: new Date(),
          description: 'Medical History'
        }
      ];
      
      await existingRecord.save();
      console.log('Added sample documents to existing patient record');
    } else {
      // Create new patient record with documents
      const newPatientRecord = new PatientRecord({
        patient: patientUser._id,
        medicalHistory: ['Allergies to penicillin', 'Asthma since childhood'],
        notes: 'Patient is generally healthy but requires regular check-ups.',
        documents: [
          {
            filename: 'blood_test_results.pdf',
            fileUrl: '/uploads/patient-docs/sample-blood-test.pdf',
            uploadedAt: new Date(),
            description: 'Blood Test Results'
          },
          {
            filename: 'xray_scan.jpg',
            fileUrl: '/uploads/patient-docs/sample-xray.jpg',
            uploadedAt: new Date(),
            description: 'Chest X-Ray'
          },
          {
            filename: 'medical_history.docx',
            fileUrl: '/uploads/patient-docs/sample-medical-history.docx',
            uploadedAt: new Date(),
            description: 'Medical History'
          }
        ]
      });
      
      await newPatientRecord.save();
      console.log('Created new patient record with sample documents');
    }
    
    console.log('Patient record seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding patient records:', error);
    process.exit(1);
  }
};

seedPatientRecords();
