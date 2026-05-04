import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
});

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
