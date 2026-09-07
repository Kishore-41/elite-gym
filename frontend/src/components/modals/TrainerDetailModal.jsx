import React, { useEffect } from 'react';
import { 
  FaTimes, FaCertificate, FaTrophy, FaCalendarCheck, 
  FaUserTie, FaCheckCircle, FaStar, FaLightbulb, FaGraduationCap 
} from 'react-icons/fa';

const TrainerDetailModal = ({ trainer, isOpen, onClose, onBookConsultation }) => {
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

  if (!isOpen || !trainer) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2500,
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
          maxWidth: '640px',
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

        {/* Coach Header Profile */}
        <div style={{ position: 'relative', height: '260px', width: '100%', overflow: 'hidden' }}>
          <img
            src={trainer.avatarUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80'}
            alt={trainer.fullName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #10141f 0%, rgba(16, 20, 31, 0.3) 60%, transparent 100%)',
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
                padding: '3px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.4rem',
              }}
            >
              {trainer.specialization}
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F8FAFC', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {trainer.fullName}
            </h2>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
              {trainer.experienceYears}+ Years Practical Coaching • Madurai Campus
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem 1.75rem 2rem 1.75rem' }}>
          {/* Biography & Philosophy */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF8800', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Biography & Coaching Philosophy
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.65 }}>
              {trainer.bio}
            </p>
            {trainer.philosophy && (
              <div style={{ marginTop: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid #FF8800', borderRadius: '4px', fontSize: '0.86rem', color: '#94A3B8', fontStyle: 'italic' }}>
                "{trainer.philosophy}"
              </div>
            )}
          </div>

          {/* Verified Certifications & Credentials */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaCertificate color="#00E5FF" /> Verified Accreditations & Certifications
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(trainer.certificationsList || (trainer.certification ? trainer.certification.split(',').map((s) => s.trim()) : ['CSCS Certified', 'CPR/AED Certified'])).map((cert, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    background: '#090c13',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#00E5FF',
                  }}
                >
                  <FaCheckCircle size={11} color="#00E676" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Athletic Achievements & Milestones */}
          <div
            style={{
              background: 'rgba(255, 107, 0, 0.06)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF8800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <FaTrophy size={13} /> Athletic Milestones & Transformations
            </h4>
            <p style={{ color: '#F8FAFC', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {trainer.achievements || 'Guided over 250+ student athletes through strength periodization, post-injury reconditioning, and competitive Tamil Nadu state tournaments.'}
            </p>
          </div>

          {/* Booking Action CTA */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                onClose();
                if (onBookConsultation) onBookConsultation(trainer);
              }}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.9rem', fontSize: '0.96rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <FaCalendarCheck /> Book Consultation with {trainer.fullName.split(' ')[0]}
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.9rem 1.5rem', fontSize: '0.92rem', fontWeight: 700 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailModal;
