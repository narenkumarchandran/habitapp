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
  },
  streak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to calculate streak
habitSchema.methods.calculateStreak = async function() {
  const Checkmark = mongoose.model('Checkmark');
  const checkmarks = await Checkmark.find({ 
    habitId: this._id,
    completed: true 
  }).sort({ date: -1 });

  let streak = 0;
  if (checkmarks.length === 0) {
    this.streak = 0;
    await this.save();
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const mostRecentCheckmarkDate = new Date(checkmarks[0].date);
  mostRecentCheckmarkDate.setHours(0, 0, 0, 0);

  if (mostRecentCheckmarkDate.getTime() !== today.getTime() && mostRecentCheckmarkDate.getTime() !== yesterday.getTime()) {
    this.streak = 0;
    await this.save();
    return 0;
  }

  streak = 1;
  let lastDate = mostRecentCheckmarkDate;

  for (let i = 1; i < checkmarks.length; i++) {
    const currentDate = new Date(checkmarks[i].date);
    currentDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(lastDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (currentDate.getTime() === expectedDate.getTime()) {
      streak++;
      lastDate = currentDate;
    } else {
      break;
    }
  }

  this.streak = streak;
  await this.save();
  return streak;
};

module.exports = mongoose.model('Habit', habitSchema);
