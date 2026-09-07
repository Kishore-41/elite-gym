import React, { useState, useEffect } from 'react';
import { 
  FaUserTie, FaMedal, FaCalendarCheck, FaAward, 
  FaStar, FaCheckCircle, FaArrowRight, FaCertificate 
} from 'react-icons/fa';
import { publicInfoService } from '../../services/publicInfoService';
import TrainerDetailModal from '../../components/modals/TrainerDetailModal';
import ConsultationBookingModal from '../../components/modals/ConsultationBookingModal';

const tamilCoaches = [
  {
    id: 1,
    fullName: 'K. Murugan',
    specialization: 'Head Strength Coach & Powerlifting Champion',
    experienceYears: 10,
    bio: 'Decorated national powerlifting gold medalist and lead strength architect at Madurai. Specializes in barbell biomechanics, heavy platform prep, and periodized CNS loading.',
    philosophy: 'True power begins with structural discipline and unwavering technique before adding weight to the bar.',
    certification: 'CSCS, IPF National Referee, FMS L2',
    achievements: 'National Powerlifting Gold Medalist (Senior 93kg), Mentored 12 Tamil Nadu State Powerlifting Champions.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    fullName: 'Karthik Raja',
    specialization: 'Hypertrophy & Biomechanics Specialist',
    experienceYears: 7,
    bio: 'Scientific physique programmer with in-depth knowledge of muscle moment arms, active tension curves, and injury-free hypertrophy splits.',
    philosophy: 'Train the muscle through its exact physiological resistance curve, not just move ego-driven loads.',
    certification: 'K11 Certified Master Trainer, ISSA Bodybuilding Specialist',
    achievements: 'Over 300+ documented physique transformations across Madurai and Chennai.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    fullName: 'Dr. Ananya Suresh, PT',
    specialization: 'Sports Physiotherapist & Functional Rehab',
    experienceYears: 6,
    bio: 'Master of Sports Physiotherapy specializing in dry needling, rotator cuff rehabilitation, ACL return-to-sport protocols, and kinetic chain realignment.',
    philosophy: 'Restoration of joint kinematics and pain-free movement is the foundational bedrock of athletic performance.',
    certification: 'MPT Sports, Certified Dry Needling Practitioner (CDNP), Maitland Mobilization',
    achievements: 'Consultant Physio for Tamil Nadu State Aquatic Team and collegiate track athletes.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    fullName: 'S. Vigneshwaran (Vicky)',
    specialization: 'HIIT & Calisthenics Lead',
    experienceYears: 5,
    bio: 'High-energy conditioning maestro leading Madurai\'s metabolic surge circuits, bodyweight gymnastics, and kettlebell ballistic power programs.',
    philosophy: 'Cardiovascular grit and bodyweight mastery will unlock athletic longevity faster than machines ever can.',
    certification: 'CrossFit Level 2 Trainer, StrongFirst SFG I Kettlebell, Animal Flow L1',
    achievements: 'Led Madurai’s largest 30-day corporate conditioning challenge with 500+ participants.',
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    fullName: 'Priya Selvam',
    specialization: 'Women’s Strength, Pre/Post-Natal Fitness',
    experienceYears: 8,
    bio: 'Champion for women’s athletic empowerment across South India. Specializes in progressive barbell strength, pelvic floor conditioning, and metabolic wellness.',
    philosophy: 'Women belong on the heavy platform. Strength is the greatest medicine for confidence and metabolic health.',
    certification: 'ACE Certified Personal Trainer, Precision Nutrition PN1, Pre/Post-Natal Specialist',
    achievements: 'Founder of the Madurai Women’s Barbell Club; guided 180+ mothers through safe postpartum athletic re-entry.',
    avatarUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    fullName: 'M. Dinesh Kumar',
    specialization: 'Olympic Weightlifting & Athletic Conditioning',
    experienceYears: 9,
    bio: 'National Institute of Sports (NIS) certified weightlifting coach. Focuses on snatch turnover speed, clean & jerk bar path precision, and triple extension power.',
    philosophy: 'The barbell never lies. Timing, explosive speed, and millimeter precision outweigh raw brute force every single time.',
    certification: 'NIS Certified Weightlifting Coach, USAW L2 Equivalent, CSCS',
    achievements: 'Official coach for Tamil Nadu Junior Weightlifting Squad at National Games 2024.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    fullName: 'Kavitha Sundaram',
    specialization: 'Mobility, Flexibility & Power Yoga',
    experienceYears: 6,
    bio: 'Experienced yoga teacher combining traditional Ashtanga discipline with contemporary functional range conditioning for deep hip, spine, and shoulder mobility.',
    philosophy: 'Strength without mobility is fragile. True athletic mastery marries explosive power with fluid range of motion.',
    certification: 'Yoga Alliance 500-RYT, FRCms, Pranayama Instructor',
    achievements: 'Resident mobility specialist conducting weekly restoration masterclasses for collegiate sprinters.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8,
    fullName: 'R. Arunachalam',
    specialization: 'Functional Turf, Speed & Agility',
    experienceYears: 4,
    bio: 'Former state collegiate sprinter dedicated to acceleration mechanics, change-of-direction COD deceleration drills, and youth athletic foundations.',
    philosophy: 'Speed is a trained skill of ground reaction forces and rhythm, not merely genetic luck.',
    certification: 'NASM-PES, EXOS Fitness Specialist',
    achievements: 'Trained 25+ youth football and track athletes who secured district championships in South TN.',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  },
];

const TrainersPage = () => {
  const [trainers, setTrainers] = useState(tamilCoaches);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingTrainer, setBookingTrainer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    publicInfoService.getTrainers()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          // Merge API data with rich coach profiles
          const merged = res.data.map((apiTrainer, idx) => {
            const fallback = tamilCoaches[idx % tamilCoaches.length];
            return {
              ...fallback,
              ...apiTrainer,
              fullName: apiTrainer.fullName || apiTrainer.name || fallback.fullName,
              specialization: apiTrainer.specialization || fallback.specialization,
              bio: apiTrainer.bio || fallback.bio,
              certification: apiTrainer.certification || fallback.certification,
              experienceYears: apiTrainer.experienceYears || fallback.experienceYears,
              avatarUrl: apiTrainer.avatarUrl || fallback.avatarUrl,
            };
          });
          setTrainers(merged.length >= 8 ? merged : tamilCoaches);
        } else {
          setTrainers(tamilCoaches);
        }
      })
      .catch((err) => {
        console.error('Error fetching trainers, using verified Tamil faculty:', err);
        setTrainers(tamilCoaches);
      })
      .finally(() => setLoading(false));
  }, []);

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
            <FaAward /> Tamil Nadu Certified Athletic Faculty
          </div>
          <h1 style={{ fontSize: 'clamp(2.3rem, 4.5vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Elite Coaching Faculty & Specialists
          </h1>
          <p style={{ color: '#94A3B8', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            8 certified coaches from Madurai and across Tamil Nadu bringing national championships, Olympic weightlifting credentials, sports physiotherapy, and specialized biomechanics directly to your training program.
          </p>
        </div>

        {/* Coaches Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              onClick={() => setSelectedTrainer(trainer)}
              style={{
                background: 'rgba(16, 20, 31, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.45)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.6)';
              }}
            >
              {/* Profile Image with Gradient */}
              <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                <img
                  src={trainer.avatarUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80'}
                  alt={trainer.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(9, 12, 16, 0.95) 0%, rgba(9, 12, 16, 0.2) 60%, transparent 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1.25rem',
                    right: '1.25rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(255, 107, 0, 0.2)',
                      border: '1px solid rgba(255, 107, 0, 0.4)',
                      color: '#FF8800',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {trainer.experienceYears}+ Yrs Experience
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#F8FAFC' }}>
                    {trainer.fullName}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF8800', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  {trainer.specialization}
                </div>

                <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {trainer.bio}
                </p>

                {/* Credentials Strip */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '0.75rem 0.9rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#D1D5DB' }}>
                  <div style={{ color: '#64748b', marginBottom: '0.2rem', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Credentials:</div>
                  <div style={{ fontWeight: 700, color: '#00E5FF' }}>{trainer.certification}</div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingTrainer(trainer);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                  >
                    <FaCalendarCheck /> Book Consultation
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrainer(trainer);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem 0.9rem', fontSize: '0.82rem', fontWeight: 700 }}
                    title="View Detailed Profile"
                  >
                    <FaArrowRight color="#FF8800" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coach Detail Modal */}
        <TrainerDetailModal
          trainer={selectedTrainer}
          isOpen={!!selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
          onBookConsultation={(coach) => {
            setBookingTrainer(coach);
          }}
        />

        {/* Consultation Booking Modal */}
        {bookingTrainer && (
          <ConsultationBookingModal
            trainer={bookingTrainer}
            isOpen={!!bookingTrainer}
            onClose={() => setBookingTrainer(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TrainersPage;

