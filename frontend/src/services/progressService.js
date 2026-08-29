import api from './api';

export const progressService = {
  getMyProgress: async () => {
    const response = await api.get('/student/progress');
    return response.data;
  },

  getLatest: async () => {
    const response = await api.get('/student/progress/latest');
    return response.data;
  },

  getDetail: async (entryId) => {
    const response = await api.get(`/student/progress/${entryId}`);
    return response.data;
  },

  createEntry: async (payload) => {
    const response = await api.post('/student/progress', payload);
    return response.data;
  },

  updateEntry: async (entryId, payload) => {
    const response = await api.put(`/student/progress/${entryId}`, payload);
    return response.data;
  },

  deleteEntry: async (entryId) => {
    const response = await api.delete(`/student/progress/${entryId}`);
    return response.data;
  },
};
