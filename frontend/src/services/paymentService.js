import api from './api';

export const paymentService = {
  getMyPayments: async () => {
    const response = await api.get('/student/payments');
    return response.data;
  },

  getMyPaymentDetail: async (paymentId) => {
    const response = await api.get(`/student/payments/${paymentId}`);
    return response.data;
  },

  createPayment: async (payload) => {
    const response = await api.post('/student/payments', payload);
    return response.data;
  },

  getAllPayments: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },

  getPaymentsByStatus: async (status) => {
    const response = await api.get(`/admin/payments/status/${status}`);
    return response.data;
  },

  getPaymentsByStudent: async (studentId) => {
    const response = await api.get(`/admin/payments/student/${studentId}`);
    return response.data;
  },

  getPaymentDetail: async (paymentId) => {
    const response = await api.get(`/admin/payments/${paymentId}`);
    return response.data;
  },

  updatePaymentStatus: async (paymentId, payload) => {
    const response = await api.put(`/admin/payments/${paymentId}/status`, payload);
    return response.data;
  },
};
