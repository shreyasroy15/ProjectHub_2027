import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed },
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'User', 'Admin'], default: 'User' },
  isActive: { type: Boolean, default: true },
  
  // Legacy .NET Fields
  Name: { type: String },
  Email: { type: String },
  PasswordHash: { type: String },
  Role: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) this.Name = this.name;
  if (this.isModified('email') || this.isNew) this.Email = this.email;
  if (this.isModified('password') || this.isNew) this.PasswordHash = this.password;
  if (this.isModified('role') || this.isNew) this.Role = this.role;
  next();
});

export default mongoose.model('User', userSchema);
