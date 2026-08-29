import api from './api';

export const complaintService = {
  // Student operations
  getMyComplaints: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/student/complaints', { params });
    return response.data;
  },

  getMyComplaintDetail: async (complaintId) => {
    const response = await api.get('/student/complaints/' + complaintId);
    return response.data;
  },

  createComplaint: async (payload) => {
    const response = await api.post('/student/complaints', payload);
    return response.data;
  },

  // Admin operations
  getAllComplaints: async (status, category) => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  getComplaintDetail: async (complaintId) => {
    const response = await api.get('/admin/complaints/' + complaintId);
    return response.data;
  },

  getStudentComplaints: async (studentId, status) => {
    const params = status ? { status } : {};
    const response = await api.get('/admin/students/' + studentId + '/complaints', { params });
    return response.data;
  },

  respondToComplaint: async (complaintId, payload) => {
    const response = await api.patch('/admin/complaints/' + complaintId + '/respond', payload);
    return response.data;
  },
};
