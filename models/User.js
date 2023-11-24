const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'User'
  },
  dp: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);