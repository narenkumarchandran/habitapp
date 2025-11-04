const mongoose = require('mongoose');

const checkmarkSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: [true, 'Habit ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  completed: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    maxlength: [200, 'Note cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Compound index to ensure one checkmark per habit per day
checkmarkSchema.index({ habitId: 1, date: 1 }, { unique: true });

// Static method to get checkmarks for a date range
checkmarkSchema.statics.getByDateRange = function(habitId, startDate, endDate) {
  return this.find({
    habitId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to toggle checkmark
checkmarkSchema.statics.toggle = async function(habitId, date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const existing = await this.findOne({ habitId, date: checkDate });

  if (existing) {
    existing.completed = !existing.completed;
    await existing.save();
    return existing;
  } else {
    return await this.create({
      habitId,
      date: checkDate,
      completed: true
    });
  }
};

module.exports = mongoose.model('Checkmark', checkmarkSchema);