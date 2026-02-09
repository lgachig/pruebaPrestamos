const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['ADMIN', 'STUDENT'], default: 'STUDENT' },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  active: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);