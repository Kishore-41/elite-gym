import React, { useState, useEffect } from 'react';
import { FaSwimmingPool, FaSpa, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaCrown, FaTrashAlt } from 'react-icons/fa';
import { amenityService } from '../../services/amenityService';
import { publicInfoService } from '../../services/publicInfoService';
import { useToast } from '../../context/ToastContext';
import UpgradePromptModal from '../../components/modals/UpgradePromptModal';

const StudentAmenityBookings = () => {
  const toast = useToast();
  const [facilities, setFacilities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  useEffect(() => {
    loadFacilities();
    loadMyBookings();
  }, []);

  const loadFacilities = async () => {
    try {
      const res = await publicInfoService.getFacilities();
      if (res?.data) {
        setFacilities(res.data);
        if (res.data.length > 0) {
          setSelectedFacilityId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading facilities:', err);
    }
  };

  const loadMyBookings = async () => {
    try {
      const res = await amenityService.getMyBookings();
      if (res?.data) {
        setMyBookings(res.data);
      }
    } catch (err) {
      console.error('Error loading my bookings:', err);
    }
  };

  const handleBookAmenity = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        facilityId: Number(selectedFacilityId),
        bookingDate,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      };

      const res = await amenityService.bookAmenity(payload);
      if (res?.data) {
        toast.success(`Booking confirmed for ${res.data.facilityName} on ${res.data.bookingDate}!`);
        loadMyBookings();
      }
    } catch (err) {
      console.error('Amenity booking error:', err);
      const data = err.response?.data;
      if (err.response?.status === 403 && data?.upgradeRequired) {
        setUpgradeMessage(data.message || 'Upgrade to Premium or Elite to access Pool & Spa amenities');
        setUpgradeModalOpen(true);
      } else {
        toast.error(data?.message || err.message || 'Could not complete amenity booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this amenity booking?')) return;
    try {
      await amenityService.cancelBooking(bookingId);
      toast.info('Amenity booking cancelled.');
      loadMyBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Could not cancel booking.');
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', color: '#F3F4F6' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Member Reserved Access
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '0.3rem' }}>
            Book Amenities & Aquatic/Spa Zones
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>
            Reserve time slots for Olympic swimming lanes, cedar sauna sessions, and dedicated deadlift platforms.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Reservation Form */}
          <div
            style={{
              background: '#13131A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '1.25rem' }}>
              Reserve a Facility Slot
            </h3>

            <form onSubmit={handleBookAmenity}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Select Facility / Amenity *
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    background: '#0A0A0E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                >
                  {facilities?.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                  Booking Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    background: '#0A0A0E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem',
                      background: '#0A0A0E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem',
                      background: '#0A0A0E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {loading ? 'Confirming Slot...' : 'Confirm Amenity Reservation'}
              </button>
            </form>
          </div>

          {/* Right Column: Active Bookings List */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '1.25rem' }}>
              Your Reserved Sessions ({myBookings?.length || 0})
            </h3>

            {myBookings?.length === 0 ? (
              <div
                style={{
                  background: '#13131A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  color: '#9CA3AF',
                }}
              >
                <FaCalendarAlt size={32} style={{ color: '#4B5563', marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, color: '#F3F4F6' }}>No active reservations</div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Use the reservation form to secure lane access or sauna slots.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myBookings?.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: '#13131A',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#F3F4F6', fontSize: '1rem' }}>{b.facilityName}</strong>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: b.status === 'CONFIRMED' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: b.status === 'CONFIRMED' ? '#00E676' : '#EF4444',
                          }}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#9CA3AF', display: 'flex', gap: '0.75rem' }}>
                        <span>📅 {b.bookingDate}</span>
                        <span>⏰ {b.startTime?.substring(0, 5)} – {b.endTime?.substring(0, 5)}</span>
                      </div>
                    </div>

                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <FaTrashAlt size={11} /> Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Prompt Modal */}
        <UpgradePromptModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          message={upgradeMessage}
        />
      </div>
    </div>
  );
};

export default StudentAmenityBookings;
