import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaTimes, FaSwimmingPool, FaSpa, FaCheck } from 'react-icons/fa';

const UpgradePromptModal = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    navigate('/membership-plans');
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
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.25)',
          padding: '2.5rem 2rem',
          position: 'relative',
          color: '#F3F4F6',
          textAlign: 'center',
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

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
            border: '2px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#F59E0B',
          }}
        >
          <FaCrown size={28} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '0.75rem' }}>
          Exclusive to Pro & Elite Tiers
        </h2>

        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          {message || 'Olympic Swimming Pool, Nordic Sauna & Hydrotherapy Spa amenities are reserved for Pro and Elite tier memberships.'}
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            What you unlock with Pro / Elite:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#D1D5DB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCheck color="#00E676" size={12} /> Olympic 25m x 50m saline regulated pool access
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCheck color="#00E676" size={12} /> Cedar dry sauna, steam bath & 10°C cold plunge
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCheck color="#00E676" size={12} /> Dedicated trainer assignment & custom splits
            </div>
          </div>
        </div>

        <button
          onClick={handleUpgradeClick}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 800 }}
        >
          Explore Upgrade Tiers
        </button>
      </div>
    </div>
  );
};

export default UpgradePromptModal;
