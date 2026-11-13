import api from './client';

export const getDashboardStatsApi = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getAttendanceChartApi = async () => {
  const response = await api.get('/api/dashboard/attendance-chart');
  return response.data;
};

export const getClassDistributionApi = async () => {
  const response = await api.get('/api/dashboard/class-distribution');
  return response.data;
};

export const getRecentActivityApi = async (limit = 10) => {
  const response = await api.get('/api/dashboard/recent-activity', { params: { limit } });
  return response.data;
};

export const getRecentAttendanceApi = async (limit = 8) => {
  const response = await api.get('/api/dashboard/recent-attendance', { params: { limit } });
  return response.data;
};

