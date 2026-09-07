import api from './api';

export const amenityService = {
  // Book an amenity/facility slot
  bookAmenity: async (bookingData) => {
    const res = await api.post('/student/amenity-bookings', bookingData);
    return res.data;
  },

  // Get current student's bookings
  getMyBookings: async () => {
    const res = await api.get('/student/amenity-bookings');
    return res.data;
  },

  // Cancel an amenity booking
  cancelBooking: async (bookingId) => {
    const res = await api.patch(`/student/amenity-bookings/${bookingId}/cancel`);
    return res.data;
  },
};
