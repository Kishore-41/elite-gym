import api from './api';

export const attendanceService = {
  getMyAttendance: async () => {
    const response = await api.get('/student/attendance');
    return response.data;
  },

  getMyToday: async () => {
    const response = await api.get('/student/attendance/today');
    return response.data;
  },

  getMyStats: async () => {
    const response = await api.get('/student/attendance/stats');
    return response.data;
  },

  checkIn: async (payload = {}) => {
    const response = await api.post('/student/attendance/check-in', payload);
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/student/attendance/check-out');
    return response.data;
  },
};
