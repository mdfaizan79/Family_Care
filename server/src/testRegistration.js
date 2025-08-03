require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testRegistration(testEmail) {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    console.log(`Testing registration with email: "${testEmail}"`);
    
    // Case insensitive search
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp('^' + testEmail + '$', 'i') } 
    });
    
    if (existingUser) {
      console.log('❌ Email already registered with exact match:', existingUser.email);
    } else {
      console.log('✅ Email is available for registration');
      
      // Let's check if any similar emails exist
      const similarUsers = await User.find({ 
        email: { $regex: new RegExp(testEmail.split('@')[0], 'i') } 
      });
      
      if (similarUsers.length > 0) {
        console.log('Similar emails found in database:');
        similarUsers.forEach(user => console.log(`- ${user.email}`));
      }
    }
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Check if email is provided as command line argument
const testEmail = process.argv[2];
if (!testEmail) {
  console.error('Please provide an email to test');
  console.log('Usage: node testRegistration.js test@example.com');
  process.exit(1);
}

testRegistration(testEmail);
