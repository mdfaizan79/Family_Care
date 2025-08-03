const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  avatar: String,
  // Patient specific fields
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    treatment: String,
    diagnosedDate: Date
  }],
  // Doctor specific fields (now maintained in Doctor model)
  // Admin created these accounts
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For doctor accounts, refers to admin who created it
  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,
  verificationOTP: String,
  verificationOTPExpiry: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
