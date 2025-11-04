import React, { useState, useEffect } from 'react';
import Habit from './Habit.jsx';
import HabitForm from './HabitForm.jsx';
import './HabitList.css';

const HabitList = ({ token }) => {
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await fetch('/api/habits', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setHabits(data);
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error fetching habits:', error);
        alert('An error occurred while fetching habits.');
      }
    };

    if (token) {
      fetchHabits();
    }
  }, [token]);

  const handleHabitCreated = (newHabit) => {
    setHabits([newHabit, ...habits]);
  };

  const handleHabitDeleted = (habitId) => {
    setHabits(habits.filter((habit) => habit._id !== habitId));
  };

  const handleHabitEdited = (editedHabit) => {
    setHabits(
      habits.map((habit) => (habit._id === editedHabit._id ? editedHabit : habit))
    );
    setEditingHabit(null);
  };

  return (
    <div className="habit-list-container">
      {editingHabit ? (
        <HabitForm
          token={token}
          onHabitCreated={handleHabitEdited} // The form can be used for editing as well
          habitToEdit={editingHabit}
          onCancel={() => setEditingHabit(null)}
        />
      ) : (
        <HabitForm token={token} onHabitCreated={handleHabitCreated} />
      )}
      <h3>Your Habits</h3>
      {habits.length > 0 ? (
        <ul className="habit-list">
          {habits.map((habit) => (
            <Habit
              key={habit._id}
              habit={habit}
              token={token}
              onHabitDeleted={handleHabitDeleted}
              onHabitEdited={() => setEditingHabit(habit)}
            />
          ))}
        </ul>
      ) : (
        <p>You haven't created any habits yet.</p>
      )}
    </div>
  );
};

export default HabitList;
