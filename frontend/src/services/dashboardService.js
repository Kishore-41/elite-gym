import api from './api';

export const dashboardService = {
  getStudentStats: async () => {
    const response = await api.get('/student/dashboard/stats');
    return response.data;
  },

  getTrainerStats: async () => {
    const response = await api.get('/trainer/dashboard/stats');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
