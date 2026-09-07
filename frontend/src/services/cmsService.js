import api from './api';

export const cmsService = {
  // Facilities CMS
  getAllFacilities: async () => {
    const res = await api.get('/admin/cms/facilities');
    return res.data;
  },

  createFacility: async (data) => {
    const res = await api.post('/admin/cms/facilities', data);
    return res.data;
  },

  updateFacility: async (id, data) => {
    const res = await api.put(`/admin/cms/facilities/${id}`, data);
    return res.data;
  },

  toggleFacilityStatus: async (id, active) => {
    const res = await api.patch(`/admin/cms/facilities/${id}/toggle-status`, null, {
      params: active !== undefined ? { active } : {},
    });
    return res.data;
  },

  updateFacilityCapacity: async (id, capacity) => {
    const res = await api.patch(`/admin/cms/facilities/${id}/capacity`, null, {
      params: { capacity },
    });
    return res.data;
  },

  deleteFacility: async (id) => {
    const res = await api.delete(`/admin/cms/facilities/${id}`);
    return res.data;
  },

  // Achievements CMS
  getAllAchievements: async () => {
    const res = await api.get('/admin/cms/achievements');
    return res.data;
  },

  createAchievement: async (data) => {
    const res = await api.post('/admin/cms/achievements', data);
    return res.data;
  },

  updateAchievement: async (id, data) => {
    const res = await api.put(`/admin/cms/achievements/${id}`, data);
    return res.data;
  },

  deleteAchievement: async (id) => {
    const res = await api.delete(`/admin/cms/achievements/${id}`);
    return res.data;
  },

  // Testimonials CMS
  getAllTestimonials: async () => {
    const res = await api.get('/admin/cms/testimonials');
    return res.data;
  },

  createTestimonial: async (data) => {
    const res = await api.post('/admin/cms/testimonials', data);
    return res.data;
  },

  approveTestimonial: async (id, approved = true) => {
    const res = await api.put(`/admin/cms/testimonials/${id}/approve`, null, {
      params: { approved },
    });
    return res.data;
  },

  deleteTestimonial: async (id) => {
    const res = await api.delete(`/admin/cms/testimonials/${id}`);
    return res.data;
  },

  // Schedules CMS
  getAllSchedules: async () => {
    const res = await api.get('/admin/cms/schedules');
    return res.data;
  },

  createSchedule: async (data) => {
    const res = await api.post('/admin/cms/schedules', data);
    return res.data;
  },

  updateSchedule: async (id, data) => {
    const res = await api.put(`/admin/cms/schedules/${id}`, data);
    return res.data;
  },

  deleteSchedule: async (id) => {
    const res = await api.delete(`/admin/cms/schedules/${id}`);
    return res.data;
  },

  // FAQs CMS
  getAllFaqs: async () => {
    const res = await api.get('/admin/cms/faqs');
    return res.data;
  },

  createFaq: async (data) => {
    const res = await api.post('/admin/cms/faqs', data);
    return res.data;
  },

  updateFaq: async (id, data) => {
    const res = await api.put(`/admin/cms/faqs/${id}`, data);
    return res.data;
  },

  deleteFaq: async (id) => {
    const res = await api.delete(`/admin/cms/faqs/${id}`);
    return res.data;
  },
};
