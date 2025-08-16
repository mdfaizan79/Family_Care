require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedUsers() {
  try {
   
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create a department for the doctor
    let department = await Department.findOne({ name: 'Cardiology' });
    if (!department) {
      department = new Department({
        name: 'Cardiology',
        description: 'Heart-related treatments and diagnoses'
      });
      await department.save();
      console.log('Created Cardiology department');
    }
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    await admin.save();
    console.log('Created admin user');
    
    // Create doctor user
    const doctor = new User({
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: 'password123',
      role: 'doctor',
      isEmailVerified: true,
      isActive: true
    });
    const savedDoctor = await doctor.save();
    
    // Create doctor profile
    const doctorProfile = new Doctor({
      user: savedDoctor._id,
      department: department._id,
      specialization: 'Cardiologist',
      experience: 5,
      education: 'MD, Cardiology'
    });
    await doctorProfile.save();
    console.log('Created doctor user and profile');
    
    // Create patient user
    const patient = new User({
      name: 'Patient User',
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      isEmailVerified: true,
      isActive: true,
      phone: '1234567890',
      dateOfBirth: new Date(1990, 0, 1),
      address: '123 Main St, City, Country'
    });
    await patient.save();
    console.log('Created patient user');
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();
