const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#3b82f6',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
  },
  icon: {
    type: String,
    default: '⭐'
  },
  frequency: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6], // 0=Sunday, 6=Saturday
    validate: {
      validator: function(arr) {
        return arr.every(day => day >= 0 && day <= 6);
      },
      message: 'Frequency must contain valid day numbers (0-6)'
    }
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    time: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for current streak
habitSchema.virtual('currentStreak').get(function() {
  return this._currentStreak || 0;
});

// Method to calculate streak
habitSchema.methods.calculateStreak = async function() {
  const Checkmark = mongoose.model('Checkmark');
  const checkmarks = await Checkmark.find({ 
    habitId: this._id,
    completed: true 
  }).sort({ date: -1 });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < checkmarks.length; i++) {
    const checkDate = new Date(checkmarks[i].date);
    checkDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  this._currentStreak = streak;
  return streak;
};

module.exports = mongoose.model('Habit', habitSchema);