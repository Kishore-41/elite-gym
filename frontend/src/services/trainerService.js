import api from './api';

export const trainerService = {
  // Public - Get available trainers
  getAvailableTrainers: async () => {
    const response = await api.get('/public/trainers');
    return response.data;
  },

  // Student - Trainer Requests
  getMyTrainerRequests: async (status = null) => {
    const url = status ? `/student/trainer-requests?status=${status}` : '/student/trainer-requests';
    const response = await api.get(url);
    return response.data;
  },

  createTrainerRequest: async (trainerId, requestType, requestNotes = '') => {
    const response = await api.post('/student/trainer-requests', { trainerId, requestType, requestNotes });
    return response.data;
  },

  // Trainer - Requests
  getTrainerRequests: async (status = null) => {
    const url = status ? `/trainer/requests?status=${status}` : '/trainer/requests';
    const response = await api.get(url);
    return response.data;
  },

  respondToRequest: async (requestId, status, responseNotes = '') => {
    const response = await api.patch(`/trainer/requests/${requestId}`, { status, responseNotes });
    return response.data;
  },

  // Trainer - Assigned Students
  getAssignedStudents: async () => {
    const response = await api.get('/trainer/students');
    return response.data;
  },
};
