const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Habit = require('./models/Habit');
const Checkmark = require('./models/Checkmark');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker';

// Sample habits
const sampleHabits = [
  {
    name: 'Morning Exercise',
    description: 'Do at least 30 minutes of exercise',
    color: '#10b981',
    icon: '💪',
    frequency: [1, 2, 3, 4, 5] // Monday to Friday
  },
  {
    name: 'Read Books',
    description: 'Read for at least 20 minutes',
    color: '#3b82f6',
    icon: '📚',
    frequency: [0, 1, 2, 3, 4, 5, 6] // Every day
  },
  {
    name: 'Meditation',
    description: 'Meditate for 10 minutes',
    color: '#8b5cf6',
    icon: '🧘',
    frequency: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    name: 'Drink Water',
    description: 'Drink at least 8 glasses of water',
    color: '#06b6d4',
    icon: '💧',
    frequency: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    name: 'Learning Code',
    description: 'Practice coding for at least 1 hour',
    color: '#f59e0b',
    icon: '💻',
    frequency: [1, 2, 3, 4, 5]
  }
];

// Function to create checkmarks for the last 30 days
const createCheckmarks = async (habitId, completionRate = 0.7) => {
  const checkmarks = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Randomly decide if habit was completed based on completion rate
    if (Math.random() < completionRate) {
      checkmarks.push({
        habitId,
        date,
        completed: true
      });
    }
  }
  
  return checkmarks;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Habit.deleteMany({});
    await Checkmark.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create habits
    const createdHabits = await Habit.insertMany(sampleHabits);
    console.log(`✅ Created ${createdHabits.length} habits`);

    // Create checkmarks for each habit
    let totalCheckmarks = 0;
    for (const habit of createdHabits) {
      const completionRate = Math.random() * 0.4 + 0.5; // 50-90%
      const checkmarks = await createCheckmarks(habit._id, completionRate);
      
      if (checkmarks.length > 0) {
        await Checkmark.insertMany(checkmarks);
        totalCheckmarks += checkmarks.length;
      }
    }
    
    console.log(`✅ Created ${totalCheckmarks} checkmarks`);
    console.log('🎉 Database seeded successfully!');

    // Display statistics
    console.log('\n📊 Statistics:');
    for (const habit of createdHabits) {
      const checkmarkCount = await Checkmark.countDocuments({ 
        habitId: habit._id,
        completed: true 
      });
      console.log(`   ${habit.icon} ${habit.name}: ${checkmarkCount} completions`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();