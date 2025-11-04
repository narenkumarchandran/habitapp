import React from 'react';
import './Habit.css';

const Habit = ({ habit, token, onHabitDeleted, onHabitEdited }) => {

  const handleToggle = async () => {
    try {
      const response = await fetch('/api/checkmarks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ habitId: habit._id, date: new Date() }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
      }
      // We can update the UI based on the response if needed
    } catch (error) {
      console.error('Error toggling habit:', error);
      alert('An error occurred while toggling the habit.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/habits/${habit._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        onHabitDeleted(habit._id);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('An error occurred while deleting the habit.');
    }
  };

  return (
    <li className="habit-item">
      <span className="habit-name">{habit.name}</span>
      <div className="habit-buttons">
        <button onClick={handleToggle}>Toggle</button>
        <button onClick={() => onHabitEdited(habit)}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </li>
  );
};

export default Habit;
