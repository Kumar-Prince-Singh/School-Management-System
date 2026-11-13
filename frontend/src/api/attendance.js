import api from './client';

export const getAttendanceApi = async (params = {}) => {
  const response = await api.get('/api/attendance', { params });
  return response.data;
};

export const submitAttendanceApi = async (data) => {
  const response = await api.post('/api/attendance', data);
  return response.data;
};

export const getAttendanceReportApi = async (params = {}) => {
  const response = await api.get('/api/attendance/report', { params });
  return response.data;
};
