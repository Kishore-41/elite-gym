import api from './api';

export const workoutService = {
  // Trainer - Workout Plans CRUD
  getTrainerWorkoutPlans: async (templatesOnly = false) => {
    const url = templatesOnly ? '/trainer/workout-plans?templatesOnly=true' : '/trainer/workout-plans';
    const response = await api.get(url);
    return response.data;
  },

  getWorkoutPlanById: async (planId) => {
    const response = await api.get(`/trainer/workout-plans/${planId}`);
    return response.data;
  },

  createWorkoutPlan: async (planData) => {
    const response = await api.post('/trainer/workout-plans', planData);
    return response.data;
  },

  updateWorkoutPlan: async (planId, planData) => {
    const response = await api.put(`/trainer/workout-plans/${planId}`, planData);
    return response.data;
  },

  toggleWorkoutPlanStatus: async (planId, active) => {
    const response = await api.patch(`/trainer/workout-plans/${planId}/status?active=${active}`);
    return response.data;
  },

  assignPlanToStudent: async (planId, studentId) => {
    const response = await api.patch(`/trainer/workout-plans/${planId}/assign/${studentId}`);
    return response.data;
  },

  deleteWorkoutPlan: async (planId) => {
    const response = await api.delete(`/trainer/workout-plans/${planId}`);
    return response.data;
  },

  // Trainer - Workout Exercises CRUD
  getPlanExercises: async (planId) => {
    const response = await api.get(`/trainer/workout-plans/${planId}/exercises`);
    return response.data;
  },

  addExercise: async (planId, exerciseData) => {
    const response = await api.post(`/trainer/workout-plans/${planId}/exercises`, exerciseData);
    return response.data;
  },

  updateExercise: async (planId, exerciseId, exerciseData) => {
    const response = await api.put(`/trainer/workout-plans/${planId}/exercises/${exerciseId}`, exerciseData);
    return response.data;
  },

  removeExercise: async (planId, exerciseId) => {
    const response = await api.delete(`/trainer/workout-plans/${planId}/exercises/${exerciseId}`);
    return response.data;
  },

  // Student - Workout Plans (view only)
  getMyWorkoutPlans: async () => {
    const response = await api.get('/student/workout-plans');
    return response.data;
  },

  getWorkoutPlanDetail: async (planId) => {
    const response = await api.get(`/student/workout-plans/${planId}`);
    return response.data;
  },
};
