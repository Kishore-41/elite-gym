import api from './api';

export const publicInfoService = {
  // Facilities
  getFacilities: async (category) => {
    const params = category ? { category } : {};
    const res = await api.get('/facilities', { params });
    return res.data;
  },

  getFacilityById: async (id) => {
    const res = await api.get(`/facilities/${id}`);
    return res.data;
  },

  // Class Schedules
  getSchedule: async (dayOfWeek) => {
    const params = dayOfWeek ? { dayOfWeek } : {};
    const res = await api.get('/schedule', { params });
    return res.data;
  },

  // Gym Achievements
  getAchievements: async () => {
    const res = await api.get('/achievements');
    return res.data;
  },

  // Testimonials
  getTestimonials: async () => {
    const res = await api.get('/testimonials');
    return res.data;
  },

  // FAQs
  getFaqs: async (category) => {
    const params = category ? { category } : {};
    const res = await api.get('/faq', { params });
    return res.data;
  },

  // Guest Pass
  generateGuestPass: async (guestData) => {
    const res = await api.post('/guest-pass', guestData);
    return res.data;
  },

  verifyGuestPass: async (passCode) => {
    const res = await api.get(`/guest-pass/${passCode}`);
    return res.data;
  },

  // Membership Plans
  getPlans: async () => {
    const res = await api.get('/plans');
    return res.data;
  },

  // Trainers Roster
  getTrainers: async () => {
    const res = await api.get('/trainers');
    return res.data;
  },

  // Book Consultation Slot (Student)
  bookTrainerConsultation: async (consultationData) => {
    const res = await api.post('/student/trainer-consultation', consultationData);
    return res.data;
  },
};
