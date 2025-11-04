import React, { useState, useEffect } from 'react';
import './HabitForm.css';

const HabitForm = ({ token, onHabitCreated, habitToEdit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const isEditing = !!habitToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description);
    }
  }, [isEditing, habitToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/api/habits/${habitToEdit._id}` : '/api/habits';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (response.ok) {
        onHabitCreated(data);
        setName('');
        setDescription('');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'editing' : 'creating'} habit:`, error);
      alert(`An error occurred while ${isEditing ? 'editing' : 'creating'} the habit.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <h3>{isEditing ? 'Edit Habit' : 'Create a New Habit'}</h3>
      <div>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit">{isEditing ? 'Save Changes' : 'Add Habit'}</button>
      {isEditing && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default HabitForm;
