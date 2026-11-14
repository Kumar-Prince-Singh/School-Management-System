import api from './client';

export const loginApi = async (username_or_email, password) => {
  const response = await api.post('/api/auth/login', {
    username_or_email,
    password,
  });
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const registerApi = async ({ username, email, full_name, password, role }) => {
  const response = await api.post('/api/auth/register', {
    username,
    email,
    full_name,
    password,
    role,
  });
  return response.data;
};

