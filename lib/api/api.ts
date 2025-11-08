// api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a common Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://development.my-masjid.com/api/',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth token or any custom headers here
    // config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return only the data part of the response
    return response.data;
  },
  (error) => {
    // Handle API errors here
    if (error.response) {
      console.error('API Error:', error.response.data);
      // You can show a toast/notification here
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
      return Promise.reject({ message: 'No response from server' });
    } else {
      console.error('Axios error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;