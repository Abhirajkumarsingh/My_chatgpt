import axios from 'axios';

// Vite env var or default
// Cast import.meta to any to avoid TypeScript error 'Property env does not exist on type ImportMeta'
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

// Interceptor to add JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;