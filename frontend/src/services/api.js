import axios from 'axios';
const API_URL = 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json' // Default content type
  }
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default {
  // Auth endpoints
  login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return apiClient.post('/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Set content type for this request
      }
    });
  },
  signup(userData) {
    return apiClient.post('/user/register', userData);
  },

  // Transaction endpoints
  deposit(data) {
    const userId = localStorage.getItem('user_id'); // Get user_id from localStorage
    return apiClient.post('/deposits/deposit', { ...data, user_id: userId }); // Include user_id
  },
  withdraw(data) {
    const userId = localStorage.getItem('user_id'); // Get user_id from localStorage
    return apiClient.post('/withdraw', { ...data, user_id: userId }); // Include user_id
  },
  


}