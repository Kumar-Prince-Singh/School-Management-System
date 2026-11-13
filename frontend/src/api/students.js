import api from './client';

export const getStudentsApi = async (params = {}) => {
  const response = await api.get('/api/students', { params });
  return response.data;
};

export const getStudentApi = async (id) => {
  const response = await api.get(`/api/students/${id}`);
  return response.data;
};

export const createStudentApi = async (data) => {
  const response = await api.post('/api/students', data);
  return response.data;
};

export const updateStudentApi = async (id, data) => {
  const response = await api.put(`/api/students/${id}`, data);
  return response.data;
};

export const deleteStudentApi = async (id) => {
  const response = await api.delete(`/api/students/${id}`);
  return response.data;
};

