import api from './client';

export const getHealthApi = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getReadyApi = async () => {
  const response = await api.get('/ready');
  return response.data;
};

