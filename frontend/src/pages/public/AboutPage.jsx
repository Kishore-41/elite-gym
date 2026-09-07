import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, FaMedal, FaShieldAlt, FaDumbbell, 
  FaWater, FaSpa, FaHeartbeat, FaHistory, FaBullseye, FaUsers, FaAward 
} from 'react-icons/fa';
import { publicInfoService } from '../../services/publicInfoService';

const AboutPage = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    publicInfoService.getAchievements()
      .then((res) => {
        if (res?.data && res.data.length > 0) setAchievements(res.data);
      })
      .catch((err) => console.error('Error fetching achievements:', err));
  }, []);

  return (
    <div style={{ padding: '4rem 1.5rem 6rem 1.5rem', color: '#F8FAFC' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
            <FaHistory /> Madurai Heritage & Founding Legacy
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
            Rooted in Madurai. <br />
            <span style={{ color: '#FF8800' }}>Engineered for Champions.</span>
          </h1>
          <p style={{ color: '#94A3B8', maxWidth: '720px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.65 }}>
            Bridging the gap between traditional commercial fitness clubs and world-class sports science centers in South India.
          </p>
        </div>

        {/* 1. FOUNDING STORY & MISSION HERO */}
        <div
          style={{
            background: 'linear-gradient(180deg, #131b2a 0%, #0d121c 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            marginBottom: '4rem',
            position: 'relative',
            boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'inline-block', color: '#FF8800', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                The Madurai Story • Est. 2018
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#F8FAFC', lineHeight: 1.25, marginBottom: '1.25rem' }}>
                Founded by R. Sundar Rajan Along Bye Pass Road
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                In 2018, former Tamil Nadu state powerlifter and veteran strength coach <strong>R. Sundar Rajan</strong> noticed that while Chennai and Bengaluru enjoyed access to certified Olympic weightlifting equipment and scientific athletic facilities, Tier-2 sports hubs like Madurai were restricted to crowded commercial gyms with generic machinery.
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.94rem', lineHeight: 1.7 }}>
                Driven by an unyielding mission to bring world-class, science-backed athletic infrastructure to the heart of South Tamil Nadu, he opened the doors of <strong>Elite Athletic Club</strong> along Bye Pass Road near Ponmeni.
              </p>
            </div>

            {/* Mission Card Box */}
            <div
              style={{
                background: 'rgba(16, 20, 31, 0.9)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                borderRadius: '18px',
                padding: '2rem',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 107, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FF8800', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                <FaBullseye size={18} /> Our Core Mission
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                Bridging the Gap Between Commercial Gyms & Elite Sports Performance
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.65 }}>
                We believe that every dedicated resident in Madurai—whether an everyday working professional, a mother regaining vitality, or a state sprint medalist—deserves international-grade Eleiko steel, saline Olympic pools, and certified sports physios without compromise.
              </p>
            </div>
          </div>
        </div>

        {/* 2. STATS & KEY MILESTONES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4.5rem',
          }}
        >
          <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#FF8800', letterSpacing: '-0.02em' }}>6,500+</div>
            <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem', marginTop: '0.35rem' }}>Active Members Transformed</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.4 }}>Documented sustainable fitness and wellness milestones across Madurai.</p>
          </div>

          <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#00E5FF', letterSpacing: '-0.02em' }}>40+</div>
            <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem', marginTop: '0.35rem' }}>State-Level Athletes</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.4 }}>Official training and conditioning home for competitive TN powerlifters & sprinters.</p>
          </div>

          <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#00E676', letterSpacing: '-0.02em' }}>2025</div>
            <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem', marginTop: '0.35rem' }}>Best Facility Award</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.4 }}>Named Best Commercial Athletic Facility in South Tamil Nadu.</p>
          </div>

          <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#F59E0B', letterSpacing: '-0.02em' }}>40,000</div>
            <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem', marginTop: '0.35rem' }}>Sq. Ft. Campus</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.4 }}>Madurai's largest integrated athletic and recovery campus.</p>
          </div>
        </div>

        {/* 3. THREE CORE PILLARS */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF8800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              The Architectural Standard
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '0.35rem' }}>
              Built Around Three Fundamental Pillars
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '2.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255, 107, 0, 0.15)', color: '#FF8800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FaDumbbell size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: '#F8FAFC' }}>
                Olympic-Grade Equipment
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.65 }}>
                We outfit exclusively with competition-certified Eleiko barbells, IPF-calibrated discs, Woodway curved slat treadmills, and Concept2 ergometers for accurate mechanical load.
              </p>
            </div>

            <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '2.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(0, 229, 255, 0.15)', color: '#00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FaWater size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: '#F8FAFC' }}>
                Regulated Saline Aquatics
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.65 }}>
                Our 8-lane 25m x 50m pool is saline filtered, UV sterilized, and maintained at an exact 28°C for ideal competitive swimming, low-impact joint de-loading, and interval endurance.
              </p>
            </div>

            <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '2.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(0, 230, 118, 0.15)', color: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FaSpa size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: '#F8FAFC' }}>
                Thermal Recovery Sanctuary
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.65 }}>
                Muscular restoration is not an afterthought. Authentic Finnish dry cedar saunas, eucalyptus steam rooms, and dedicated 10°C ice plunge baths accelerate recovery between hard sessions.
              </p>
            </div>
          </div>
        </div>

        {/* 4. HONORS & RECOGNITION */}
        <div style={{ background: '#10141f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', padding: '3rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF8800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Verified Honors & Accreditations
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, marginTop: '0.35rem' }}>
              State Recognition & Milestones
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {[
              {
                id: 1,
                title: 'Best Commercial Athletic Facility in South Tamil Nadu (2025)',
                organization: 'Tamil Nadu Fitness & Sports Guild',
                yearAwarded: 2025,
                description: 'Awarded for state-of-the-art training architecture, Olympic aquatic infrastructure, and exceptional member retention in Madurai.',
              },
              {
                id: 2,
                title: '6,500+ Active Members Transformed Milestone',
                organization: 'Excellence in Coaching & Community Health',
                yearAwarded: 2024,
                description: 'Milestone celebrated for successfully guiding over 6,500 Madurai members through documented body composition and performance goals.',
              },
              {
                id: 3,
                title: 'Official State Weightlifting Championship Training Home 2024',
                organization: 'TN State Athletic Commission',
                yearAwarded: 2024,
                description: 'Selected as the official training, warm-up, and recovery hub for over 40+ competitive state Olympic weightlifters and powerlifters.',
              },
            ].map((ach) => (
              <div
                key={ach.id}
                style={{
                  background: '#090c13',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ color: '#FF8800', marginTop: '4px', flexShrink: 0 }}>
                  <FaTrophy size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                    {ach.organization} • {ach.yearAwarded}
                  </div>
                  <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#F8FAFC', margin: '0.3rem 0 0.5rem' }}>
                    {ach.title}
                  </h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.55 }}>
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

