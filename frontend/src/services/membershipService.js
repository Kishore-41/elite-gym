import api from './api';

export const membershipService = {
  // Public
  getActivePlans: async () => {
    const response = await api.get('/public/membership-plans');
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await api.get(`/public/membership-plans/${id}`);
    return response.data;
  },

  // Student
  getActiveMembership: async () => {
    const response = await api.get('/student/membership');
    return response.data;
  },

  getAllStudentMemberships: async () => {
    const response = await api.get('/student/memberships');
    return response.data;
  },

  purchaseMembership: async (planId, startDate = null) => {
    const response = await api.post('/student/memberships', { planId, startDate });
    return response.data;
  },

  // Admin
  getAllPlans: async () => {
    const response = await api.get('/admin/membership-plans');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/admin/membership-plans', planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await api.put(`/admin/membership-plans/${id}`, planData);
    return response.data;
  },

  togglePlanStatus: async (id, active) => {
    const response = await api.patch(`/admin/membership-plans/${id}/status?active=${active}`);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/admin/membership-plans/${id}`);
    return response.data;
  },

  getAllStudentMembershipsAdmin: async (status = null) => {
    const url = status ? `/admin/memberships?status=${status}` : '/admin/memberships';
    const response = await api.get(url);
    return response.data;
  },

  updateMembershipStatusAdmin: async (id, status) => {
    const response = await api.patch(`/admin/memberships/${id}/status`, { status });
    return response.data;
  },
};
