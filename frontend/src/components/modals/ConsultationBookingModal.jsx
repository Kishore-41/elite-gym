import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUserTie, FaCalendarAlt, FaBullseye, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { publicInfoService } from '../../services/publicInfoService';

const ConsultationBookingModal = ({ trainer, isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [requestNotes, setRequestNotes] = useState('');
  const [requestType, setRequestType] = useState('SLOT_BOOKING');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !trainer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warning('Please sign in or register as a student to book a trainer consultation.');
      onClose();
      navigate('/login');
      return;
    }

    if (user?.role !== 'ROLE_STUDENT') {
      toast.error('Only registered student members can book personal trainer consultations.');
      return;
    }

    setLoading(true);
    try {
      await publicInfoService.bookTrainerConsultation({
        trainerId: trainer.id,
        requestType: requestType,
        requestNotes: requestNotes || 'Consultation request for performance and workout split.',
      });
      toast.success(`Consultation request sent to ${trainer.fullName || 'Trainer'}! Check your status under Trainers tab.`);
      onClose();
    } catch (err) {
      console.error('Consultation booking failed:', err);
      toast.error(err.response?.data?.message || 'Could not schedule consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#13131A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          position: 'relative',
          color: '#F3F4F6',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '6px',
          }}
        >
          <FaTimes size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#1F2937',
              border: '2px solid #F59E0B',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B',
            }}
          >
            {trainer.avatarUrl ? (
              <img src={trainer.avatarUrl} alt={trainer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <FaUserTie size={24} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>
              Book Coach Consultation
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F3F4F6' }}>
              {trainer.fullName}
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
              {trainer.specialization} • {trainer.experienceYears} Years Exp
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>
              Consultation Objective *
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
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
              <option value="SLOT_BOOKING">1-on-1 Fitness Assessment & Screening</option>
              <option value="TRAINER_ASSIGNMENT">Dedicated Monthly Coach Assignment</option>
              <option value="WORKOUT_CHANGE">Custom Routine & Periodization Adjustment</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>
              Goals & Preferred Availability Notes *
            </label>
            <textarea
              required
              rows={4}
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="e.g., Looking to improve my Olympic snatch technique and fix shoulder mobility. Available weekday mornings after 7:00 AM."
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                background: '#0A0A0E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                resize: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
          >
            {loading ? 'Submitting Request...' : 'Send Consultation Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBookingModal;
