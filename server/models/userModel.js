const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  xp: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String
  },
  completedLessons: [{
    type: String
  }],
  preferences: {
    interests: {
      'Music Artists': {
        type: [String],
        default: []
      },
      'Movies/Series': {
        type: [String],
        default: []
      },
      'Comics & Anime': {
        type: [String],
        default: []
      },
      'Art Style': {
        type: [String],
        default: []
      },
      'Spending Habits': {
        type: [String],
        default: []
      },
      'Hobbies/Activities': {
        type: [String],
        default: []
      }
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  walletAddress: {
    type: String,
    trim: true
  },
  mintedNfts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  }]
}, {
  timestamps: true
});

// Virtual for progress
userSchema.virtual('progress').get(function() {
  // Calculate user progress
  // Implementation depends on your app structure
  return {
    completedLessons: this.completedLessons.length,
    totalXP: this.xp
  };
});

// Set toJSON option to include virtuals
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;