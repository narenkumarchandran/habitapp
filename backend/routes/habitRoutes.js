const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Checkmark = require('../models/Checkmark');
const auth = require('../middleware/auth');

// Protect all routes in this file
router.use(auth);

// GET all habits for the logged-in user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    for (const habit of habits) {
      await habit.calculateStreak();
    }
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single habit
router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found or not authorized' });
    }
    
    await habit.calculateStreak(); 
    
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new habit
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon, frequency } = req.body;
    
    const newHabit = new Habit({
      name,
      description,
      color,
      icon,
      frequency,
      userId: req.user.id
    });
    
    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update a habit
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found or not authorized' });
    }
    
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found or not authorized' });
    }
    
    await Checkmark.deleteMany({ habitId: req.params.id });
    
    res.json({ message: 'Habit and associated checkmarks deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
