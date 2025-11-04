import React, { useState } from 'react';
import './App.css';
import Auth from './components/Auth.jsx';
import HabitList from './components/HabitList.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const handleLogout = () => {
    handleSetToken(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Habit Tracker</h1>
      </header>
      <main>
        {token ? (
          <div>
            <button onClick={handleLogout}>Logout</button>
            <HabitList token={token} />
          </div>
        ) : (
          <Auth setToken={handleSetToken} />
        )}
      </main>
    </div>
  );
}

export default App;
