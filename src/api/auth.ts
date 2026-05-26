import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const registerUser = (userData: any) => api.post('/auth/register', userData);

const buildFormPayload = (credentials: { username: string; password: string }) => {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  return params;
};

export const loginUser = (credentials: { username: string; password: string }) =>
  api.post('/auth/login', buildFormPayload(credentials), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
