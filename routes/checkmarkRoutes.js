const express = require('express');
const router = express.Router();
const Checkmark = require('../models/Checkmark');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth'); // <-- ADD THIS

// Protect all routes
router.use(auth); // <-- ADD THIS

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
    // Verify user owns the habit first
    await checkHabitOwnership(req.params.habitId, req.user.id);
    
    // ... rest of your existing logic ...
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
    if (error.message === 'Habit not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Not authorized') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET checkmarks for a specific date across all user's habits
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    // Get user's habits
    const userHabits = await Habit.find({ userId: req.user.id }).select('_id');
    const habitIds = userHabits.map(h => h._id);

    // Find checkmarks for those habits on that date
    const checkmarks = await Checkmark.find({ 
      date,
      habitId: { $in: habitIds } 
    })
      .populate('habitId', 'name color icon');
    
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
    
    // Verify user owns the habit
    await checkHabitOwnership(habitId, req.user.id);
    
    const checkmark = await Checkmark.toggle(habitId, date);
    res.json(checkmark);
  } catch (error) {
    if (error.message === 'Habit not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Not authorized') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

// ... (Apply the same `checkHabitOwnership` logic to all other routes)
// (e.g., POST, PUT, DELETE)

// POST create checkmark
router.post('/', async (req, res) => {
  try {
    const { habitId, date, completed, note } = req.body;
    
    // Verify user owns the habit
    await checkHabitOwnership(habitId, req.user.id);

    // ... rest of your logic
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const checkmark = new Checkmark({
      habitId,
      date: checkDate,
      completed: completed !== undefined ? completed : true,
      note
    });
    
    await checkmark.save();
    res.status(201).json(checkmark);
  } catch (error) {
    // ... error handling
  }
});

// PUT update checkmark
router.put('/:id', async (req, res) => {
  try {
    const checkmark = await Checkmark.findById(req.params.id);
    if (!checkmark) {
      return res.status(404).json({ error: 'Checkmark not found' });
    }

    // Verify ownership of the habit associated with this checkmark
    await checkHabitOwnership(checkmark.habitId, req.user.id);

    const updatedCheckmark = await Checkmark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCheckmark);
  } catch (error) {
    // ... error handling
  }
});

// DELETE checkmark
router.delete('/:id', async (req, res) => {
  try {
    const checkmark = await Checkmark.findById(req.params.id);
    if (!checkmark) {
      return res.status(404).json({ error: 'Checkmark not found' });
    }

    // Verify ownership
    await checkHabitOwnership(checkmark.habitId, req.user.id);
    
    await Checkmark.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Checkmark deleted successfully' });
  } catch (error) {
    // ... error handling
  }
});

// DELETE all checkmarks for a habit
router.delete('/habit/:habitId', async (req, res) => {
  try {
    // Verify ownership
    await checkHabitOwnership(req.params.habitId, req.user.id);

    const result = await Checkmark.deleteMany({ habitId: req.params.habitId });
    res.json({ 
      message: 'Checkmarks deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    // ... error handling
  }
});

module.exports = router;