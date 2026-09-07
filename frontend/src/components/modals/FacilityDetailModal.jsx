import React, { useEffect } from 'react';
import { 
  FaTimes, FaClock, FaUsers, FaShieldAlt, FaSnowflake, 
  FaParking, FaVideo, FaKey, FaWifi, FaUserShield, FaPumpSoap 
} from 'react-icons/fa';

const FacilityDetailModal = ({ facility, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !facility) return null;

  const coreAmenities = [
    { icon: <FaSnowflake color="#00E5FF" />, label: '100% Central Air-Conditioned' },
    { icon: <FaParking color="#F59E0B" />, label: 'Spacious Car & Two-Wheeler Parking' },
    { icon: <FaVideo color="#EF4444" />, label: '24/7 CCTV Surveillance & RFID Access' },
    { icon: <FaKey color="#00E676" />, label: 'Digital Keyless Lockers & Luxury Steam Showers' },
    { icon: <FaWifi color="#38BDF8" />, label: 'High-Speed WiFi & Hydration Bars' },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#10141f',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 107, 0, 0.12)',
          position: 'relative',
          color: '#F8FAFC',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#F8FAFC',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 0, 0.8)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.65)')}
        >
          <FaTimes size={16} />
        </button>

        {/* Hero Image */}
        <div style={{ position: 'relative', height: '280px', width: '100%', overflow: 'hidden' }}>
          <img
            src={facility.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85'}
            alt={facility.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #10141f 0%, rgba(16, 20, 31, 0.4) 60%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '1.5rem',
              right: '1.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(255, 107, 0, 0.2)',
                border: '1px solid rgba(255, 107, 0, 0.4)',
                color: '#FF8800',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              {facility.categoryName || facility.category || 'Athletic Facility'}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F8FAFC', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {facility.name}
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem 1.75rem 2rem 1.75rem' }}>
          {/* Key Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ padding: '0.85rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF8800', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <FaClock size={12} /> Operating Hours
              </div>
              <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                {facility.operationalHours || '05:00 AM - 10:30 PM'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00E5FF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <FaUsers size={12} /> Zone Capacity
              </div>
              <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                {facility.capacity || 50} Athletes Concurrently
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00E676', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <FaUserShield size={12} /> Supervision
              </div>
              <div style={{ fontWeight: 800, color: '#F8FAFC', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                {facility.supervisionStatus || 'Certified Coach on Deck'}
              </div>
            </div>
          </div>

          {/* Detailed Operational Description & Equipment Specs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Operational Overview & Equipment Specifications
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.65 }}>
              {facility.description}
            </p>
          </div>

          {/* Sanitation & Safety Protocol */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FF8800', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <FaPumpSoap size={15} /> Sanitation Protocol & Member Guidelines
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {facility.sanitationProtocol || facility.rules || 'Hospital-grade surface sanitization conducted every 2 hours. Mandatory sanitizing wipe-down before and after equipment use, clean indoor gym shoes required, and personal chalk usage in designated platform bays only.'}
            </p>
          </div>

          {/* Included Core Amenities with matching icons */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standard Zone Infrastructure & Included Amenities
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {coreAmenities.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.4rem 0.8rem',
                    background: '#090c13',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Action CTA */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800 }}
            >
              Close Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetailModal;
