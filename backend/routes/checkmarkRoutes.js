const express = require('express');
const router = express.Router();
const Checkmark = require('../models/Checkmark');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Helper function to verify habit ownership
const checkHabitOwnership = async (habitId, userId) => {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new Error('Habit not found');
  }
  if (habit.userId.toString() !== userId) {
    throw new Error('Not authorized');
  }
  return habit;
};

// GET checkmarks for a specific habit
router.get('/habit/:habitId', async (req, res) => {
  try {
    await checkHabitOwnership(req.params.habitId, req.user.id);
    const { startDate, endDate } = req.query;
    let query = { habitId: req.params.habitId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    const checkmarks = await Checkmark.find(query).sort({ date: -1 });
    res.json(checkmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle checkmark
router.post('/toggle', async (req, res) => {
  try {
    const { habitId, date } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ error: 'habitId and date are required' });
    }

    const habit = await checkHabitOwnership(habitId, req.user.id);
    const checkmarkDate = new Date(date);
    checkmarkDate.setHours(0, 0, 0, 0);

    let checkmark = await Checkmark.findOne({ habitId, date: checkmarkDate });

    if (checkmark) {
      checkmark.completed = !checkmark.completed;
    } else {
      checkmark = new Checkmark({ habitId, date: checkmarkDate, completed: true });
    }

    await checkmark.save();
    await habit.calculateStreak();
    
    res.json({ streak: habit.streak, checkmark });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
