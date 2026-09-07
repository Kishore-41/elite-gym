import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaFire, FaUsers, FaDumbbell, FaWater, FaHeartbeat } from 'react-icons/fa';

const galleryMoments = [
  {
    id: 1,
    category: 'STRENGTH_LIFTING',
    categoryName: 'Strength & Lifting',
    title: 'Heavy Squat Spotting & PR Breakdown',
    eventTag: 'Friday Night PR Session • Oct 2025',
    description: 'Members rallying around each other on platform 3 as our competitive powerlifters hit personal records with immaculate form and vocal team support.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 2,
    category: 'CARDIO_TURF',
    categoryName: 'Cardio & Turf',
    title: 'High-Octane Battle Rope Wave Intervals',
    eventTag: 'Morning Turf Conditioning • Dec 2025',
    description: 'Relentless metabolic conditioning along the 30-meter sprint turf, alternating between heavy poly ropes and sled push bursts.',
    imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 3,
    category: 'STRENGTH_LIFTING',
    categoryName: 'Strength & Lifting',
    title: 'Olympic Platform Deadlift Syndicate',
    eventTag: 'State Qualifier Workshop • Nov 2025',
    description: 'Madurai athletes refining their pull biomechanics and grip stability using competition Eleiko bars and calibrated steel plates.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 4,
    category: 'COMMUNITY_TEAM',
    categoryName: 'Community & Team',
    title: 'Post-Workout Hydration & Strategy Session',
    eventTag: 'Saturday Morning Social • Nov 2025',
    description: 'Community members decompressing at the hydration lounge, celebrating milestone weight achievements and exchanging nutrition protocols.',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 5,
    category: 'STRENGTH_LIFTING',
    categoryName: 'Strength & Lifting',
    title: 'Women’s Barbell & Strength Collective',
    eventTag: 'Empower Strength Masterclass • Jan 2026',
    description: 'Led by Coach Priya Selvam, our dedicated women athletes master technical compound lifts and progressive overload fundamentals.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 6,
    category: 'CARDIO_TURF',
    categoryName: 'Cardio & Turf',
    title: 'Heavy Sled Drives & Agility Sprints',
    eventTag: 'Speed & Power Drills • Feb 2026',
    description: 'Explosive drive mechanics on the green turf track as sprinters build single-leg drive and cardiovascular anaerobic resilience.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 7,
    category: 'AQUATICS_RECOVERY',
    categoryName: 'Aquatics & Recovery',
    title: 'Sunrise Master Swimmers Interval Squad',
    eventTag: 'Competitive Swim Cohort • Jan 2026',
    description: 'Endurance swimmers cutting through the 28°C saline lanes during our morning 6:00 AM high-tempo interval workout.',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 8,
    category: 'AQUATICS_RECOVERY',
    categoryName: 'Aquatics & Recovery',
    title: 'Power Yoga Flow & Breathwork Harmony',
    eventTag: 'Pranayama & Mobility • Weekly Session',
    description: 'Coach Kavitha guiding members through spinal mobility, hip openers, and restorative breath control in our sunlit bamboo studio.',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 9,
    category: 'COMMUNITY_TEAM',
    categoryName: 'Community & Team',
    title: 'Movement Technique & Coaching Debrief',
    eventTag: 'Biomechanics Breakdown • Dec 2025',
    description: 'Coach Vicky and members analyzing bar trajectory and joint angles after an intense functional conditioning circuit.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=85',
  },
];

const filterCategories = [
  { id: 'ALL', label: 'All Moments' },
  { id: 'STRENGTH_LIFTING', label: 'Strength & Lifting' },
  { id: 'CARDIO_TURF', label: 'Cardio & Turf' },
  { id: 'COMMUNITY_TEAM', label: 'Community & Team' },
  { id: 'AQUATICS_RECOVERY', label: 'Aquatics & Recovery' },
];

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedMoment, setSelectedMoment] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedMoment(null);
    };
    if (selectedMoment) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMoment]);

  const filteredMoments = activeTab === 'ALL'
    ? galleryMoments
    : galleryMoments.filter((item) => item.category === activeTab);

  return (
    <div style={{ padding: '4rem 1.5rem 6rem 1.5rem', color: '#F8FAFC', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 1rem',
              background: 'rgba(255, 107, 0, 0.12)',
              border: '1px solid rgba(255, 107, 0, 0.35)',
              borderRadius: '30px',
              color: '#FF8800',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            <FaFire /> Authentic Madurai Athletic Life
          </div>
          <h1 style={{ fontSize: 'clamp(2.3rem, 4.5vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Club Community & Athletic Moments
          </h1>
          <p style={{ color: '#94A3B8', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Hardware only tells half the story. Witness the energy, camaraderie, high-intensity turf sweat, and recovery rituals that drive our athletes forward every single day.
          </p>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              justifyContent: 'center',
              marginTop: '2.5rem',
            }}
          >
            {filterCategories.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.6rem 1.35rem',
                    borderRadius: '30px',
                    border: isActive ? '1.5px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isActive ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 136, 0, 0.1) 100%)' : '#10141f',
                    color: isActive ? '#FF8800' : '#94A3B8',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(255, 107, 0, 0.25)' : 'none',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)';
                      e.currentTarget.style.color = '#F8FAFC';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Moments Masonry / Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredMoments.map((moment) => (
            <div
              key={moment.id}
              onClick={() => setSelectedMoment(moment)}
              style={{
                position: 'relative',
                height: '280px',
                borderRadius: '18px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.45)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 0, 0.18)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.6)';
              }}
            >
              <img
                src={moment.imageUrl}
                alt={moment.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              {/* Card Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(9, 12, 16, 0.95) 0%, rgba(9, 12, 16, 0.35) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#FF8800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {moment.categoryName}
                  </span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {moment.eventTag}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.3rem' }}>
                  {moment.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {moment.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Clean Lightbox Modal */}
        {selectedMoment && (
          <div
            onClick={() => setSelectedMoment(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 7, 12, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '840px',
                width: '100%',
                background: '#10141f',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 107, 0, 0.15)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMoment(null)}
                aria-label="Close Lightbox"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 0, 0.8)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)')}
              >
                <FaTimes size={16} />
              </button>

              <div style={{ maxHeight: '58vh', width: '100%', overflow: 'hidden', background: '#000' }}>
                <img
                  src={selectedMoment.imageUrl}
                  alt={selectedMoment.title}
                  style={{ width: '100%', height: '100%', maxHeight: '58vh', objectFit: 'contain' }}
                />
              </div>

              <div style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      background: 'rgba(255, 107, 0, 0.15)',
                      border: '1px solid rgba(255, 107, 0, 0.35)',
                      color: '#FF8800',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '16px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedMoment.categoryName}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#94A3B8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <FaCalendarAlt size={12} color="#00E5FF" />
                    {selectedMoment.eventTag}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                  {selectedMoment.title}
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: 1.6 }}>
                  {selectedMoment.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;

