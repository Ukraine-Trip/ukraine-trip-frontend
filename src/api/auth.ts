import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const registerUser = (userData: any) => api.post('/auth/register', userData);

export const loginUser = (formData: FormData) => api.post('/auth/login', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});