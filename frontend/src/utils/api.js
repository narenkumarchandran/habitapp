import axios from 'axios';

const API = axios.create();

// Add a request interceptor to include the token in headers
API.interceptors.request.use(req => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth routes
export const registerUser = (userData) => API.post('/api/auth/register', userData);
export const loginUser = (userData) => API.post('/api/auth/login', userData);

// Habit routes
export const getHabits = () => API.get('/api/habits');
export const getHabit = (id) => API.get(`/api/habits/${id}`);
export const createHabit = (habitData) => API.post('/api/habits', habitData);
export const updateHabit = (id, habitData) => API.put(`/api/habits/${id}`, habitData);
export const deleteHabit = (id) => API.delete(`/api/habits/${id}`);

// Checkmark routes
export const getCheckmarksForHabit = (habitId, params) => API.get(`/api/checkmarks/habit/${habitId}`, { params });
export const getCheckmarksForDate = (date) => API.get(`/api/checkmarks/date/${date}`);
export const toggleCheckmark = (data) => API.post('/api/checkmarks/toggle', data);
export const createCheckmark = (data) => API.post('/api/checkmarks', data);
export const updateCheckmark = (id, data) => API.put(`/api/checkmarks/${id}`, data);
export const deleteCheckmark = (id) => API.delete(`/api/checkmarks/${id}`);
export const deleteCheckmarksForHabit = (habitId) => API.delete(`/api/checkmarks/habit/${habitId}`);

export default API;
