import axios from 'axios';

const api = axios.create({
  baseURL: 'https://job-tracker-production-7597.up.railway.app/api',
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// BUG FIX: Add a response interceptor to handle 401 globally.
// Without this, an expired token causes every protected API call to silently
// fail. The user stays on the dashboard seeing no data with no explanation.
// Now any 401 from the backend automatically clears the token and redirects
// to login, which is the correct behaviour for an expired/invalid session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Use window.location so this works outside React component context too
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;