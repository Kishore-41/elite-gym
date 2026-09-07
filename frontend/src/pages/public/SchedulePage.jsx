import React, { useState, useEffect } from 'react';
import { FaClock, FaUserTie, FaUsers, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { publicInfoService } from '../../services/publicInfoService';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const days = [
    { id: 'ALL', label: 'Full Week' },
    { id: 'MONDAY', label: 'Monday' },
    { id: 'TUESDAY', label: 'Tuesday' },
    { id: 'WEDNESDAY', label: 'Wednesday' },
    { id: 'THURSDAY', label: 'Thursday' },
    { id: 'FRIDAY', label: 'Friday' },
    { id: 'SATURDAY', label: 'Saturday' },
    { id: 'SUNDAY', label: 'Sunday' },
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const day = selectedDay === 'ALL' ? null : selectedDay;
        const res = await publicInfoService.getSchedule(day);
        if (res?.data) {
          setSchedules(res.data);
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDay]);

  return (
    <div style={{ padding: '4rem 1.5rem', color: '#F3F4F6' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Weekly Performance Timetable
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
            Class Schedule & Booking
          </h1>
          <p style={{ color: '#9CA3AF', maxWidth: '600px', margin: '0.75rem auto 0', fontSize: '1rem' }}>
            Browse daily group sessions, Olympic lifting clinics, and high-intensity conditioning slots led by certified faculty.
          </p>

          {/* Day Filter Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            {days.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '30px',
                  border: selectedDay === d.id ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedDay === d.id ? 'rgba(245, 158, 11, 0.15)' : '#13131A',
                  color: selectedDay === d.id ? '#F59E0B' : '#9CA3AF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List / Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(schedules?.length > 0 ? schedules : [
            {
              id: 1,
              title: 'HIIT Blitz - Morning Surge',
              dayOfWeek: 'MONDAY',
              startTime: '07:00:00',
              endTime: '08:00:00',
              trainerName: 'Marcus Vance',
              room: 'Studio A - High Intensity',
              capacity: 20,
              bookedSlots: 8,
              remainingSlots: 12,
            },
            {
              id: 2,
              title: 'Olympic Weightlifting Tech & Pulls',
              dayOfWeek: 'MONDAY',
              startTime: '18:00:00',
              endTime: '19:30:00',
              trainerName: 'Marcus Vance',
              room: 'Main Platform Deck',
              capacity: 12,
              bookedSlots: 10,
              remainingSlots: 2,
            },
            {
              id: 3,
              title: 'Power Yoga & Mobility Flow',
              dayOfWeek: 'WEDNESDAY',
              startTime: '08:30:00',
              endTime: '09:30:00',
              trainerName: 'Elena Rostova',
              room: 'Studio B - Mind & Body',
              capacity: 25,
              bookedSlots: 14,
              remainingSlots: 11,
            },
            {
              id: 4,
              title: 'Aqua Strength & Interval Cadence',
              dayOfWeek: 'FRIDAY',
              startTime: '17:30:00',
              endTime: '18:30:00',
              trainerName: 'Elena Rostova',
              room: 'Aquatic Center - Lane 1-4',
              capacity: 16,
              bookedSlots: 9,
              remainingSlots: 7,
            },
          ]).map((slot) => {
            const isAlmostFull = (slot.remainingSlots ?? 10) <= 3;
            return (
              <div
                key={slot.id}
                style={{
                  background: '#13131A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Time & Day Column */}
                <div style={{ minWidth: '180px' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    {slot.dayOfWeek}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F3F4F6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaClock size={14} color="#9CA3AF" />
                    {slot.startTime?.substring(0, 5)} – {slot.endTime?.substring(0, 5)}
                  </div>
                </div>

                {/* Class & Location Column */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F3F4F6', marginBottom: '0.25rem' }}>
                    {slot.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#9CA3AF' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaUserTie color="#00E5FF" /> {slot.trainerName || 'Certified Specialist'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaMapMarkerAlt color="#EF4444" /> {slot.room || 'Studio A'}
                    </span>
                  </div>
                </div>

                {/* Spots & Action Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isAlmostFull ? '#EF4444' : '#00E676' }}>
                      {slot.remainingSlots} Spots Left
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Capacity: {slot.capacity}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
