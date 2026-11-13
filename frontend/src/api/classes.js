import api from './client';

export const getClassesApi = async (params = {}) => {
  const response = await api.get('/api/classes', { params });
  return response.data;
};

export const getClassApi = async (id) => {
  const response = await api.get(`/api/classes/${id}`);
  return response.data;
};

export const createClassApi = async (data) => {
  const response = await api.post('/api/classes', data);
  return response.data;
};

export const updateClassApi = async (id, data) => {
  const response = await api.put(`/api/classes/${id}`, data);
  return response.data;
};

export const deleteClassApi = async (id) => {
  const response = await api.delete(`/api/classes/${id}`);
  return response.data;
};

