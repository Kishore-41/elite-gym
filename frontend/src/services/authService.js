import api from './api';

export const authService = {
  // Student Registration
  registerStudent: async (studentData) => {
    const response = await api.post('/auth/register/student', studentData);
    return response.data;
  },

  // Trainer Registration
  registerTrainer: async (trainerData) => {
    const response = await api.post('/auth/register/trainer', trainerData);
    return response.data;
  },

  // Login (All Roles)
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get Current Authenticated User
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('elite_gym_token');
      localStorage.removeItem('elite_gym_user');
    }
  },
};
