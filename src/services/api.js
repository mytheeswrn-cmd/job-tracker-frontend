import axios from 'axios';

const api = axios.create({
  baseURL: 'http://job-tracker-production-7597.up.railway.app/api',
});

// Automatically attach the JWT token to every request, if one exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;