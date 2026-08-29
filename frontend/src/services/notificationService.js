import api from './api';

export const notificationService = {
  getMyNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getMyUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  countUnread: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  createNotification: async (payload) => {
    const response = await api.post('/admin/notifications', payload);
    return response.data;
  },

  getUserNotifications: async (userId) => {
    const response = await api.get(`/admin/notifications/user/${userId}`);
    return response.data;
  },
};
