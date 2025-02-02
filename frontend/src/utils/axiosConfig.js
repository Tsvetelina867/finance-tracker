import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to attach the JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token being sent:', token);
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

export default axiosInstance;
