import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDumbbell, FaTicketAlt, FaShieldAlt, FaTrophy, FaUsers, FaWater, FaSpa, 
  FaHeartbeat, FaCheck, FaStar, FaArrowRight, FaCalendarCheck, FaClock 
} from 'react-icons/fa';
import { publicInfoService } from '../../services/publicInfoService';
import CheckoutModal from '../../components/modals/CheckoutModal';

const fmtINR = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n || 0);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const LandingPage = () => {
  const [plans, setPlans] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, facilitiesRes, achievementsRes, testimonialsRes] = await Promise.allSettled([
          publicInfoService.getPlans(),
          publicInfoService.getFacilities(),
          publicInfoService.getAchievements(),
          publicInfoService.getTestimonials(),
        ]);

        if (plansRes.status === 'fulfilled' && plansRes.value?.data && plansRes.value.data.length > 0) {
          setPlans(plansRes.value.data);
        } else {
          setPlans(fallbackPlans);
        }
        if (facilitiesRes.status === 'fulfilled' && facilitiesRes.value?.data) {
          setFacilities(facilitiesRes.value.data);
        }
        if (achievementsRes.status === 'fulfilled' && achievementsRes.value?.data) {
          setAchievements(achievementsRes.value.data);
        }
        if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value?.data) {
          setTestimonials(testimonialsRes.value.data);
        }
      } catch (err) {
        console.error('Error loading landing page data:', err);
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fallbackPlans = [
    {
      id: 1,
      name: 'Classic Fitness Deck',
      price: 1499,
      durationMonths: 1,
      description: 'Full strength & cardio floor access, biometric locker room, and comprehensive fitness assessment.',
      features: [
        'Full Strength Floor & Free Weights Access',
        'Functional Cardio Deck & Turf',
        'Biometric Keyless Locker Room & Showers',
        '1 Free Movement & Posture Assessment',
        'Mobile App Check-in & Workout Tracker',
      ],
    },
    {
      id: 2,
      name: 'Performance Pro',
      price: 2499,
      durationMonths: 1,
      description: 'Classic perks plus 25m Olympic pool access, unlimited group HIIT & Yoga, and 2 sauna sessions/month.',
      features: [
        'All Classic Fitness Deck Perks',
        '25m Olympic Heated Pool Access',
        'Unlimited Group HIIT & Power Yoga Classes',
        '2 Nordic Cedar Sauna & Steam Sessions / Month',
        '10% Pro-Shop & Smoothie Bar Discount',
      ],
    },
    {
      id: 3,
      name: 'Elite VIP Championship',
      price: 3999,
      durationMonths: 1,
      description: 'All-access VIP pass with unlimited hydrotherapy spa, ice plunge, monthly InBody scan, and guest passes.',
      features: [
        'Unrestricted All-Access Pass Across All Zones',
        'Unlimited Hydrotherapy Spa & 10°C Ice Plunge',
        'Monthly InBody 570 Body Composition Analysis',
        '2 Free Complimentary Guest Passes / Month',
        'VIP Private Lockers & Fresh Towel Service',
      ],
    },
  ];

  return (
    <div style={{ color: '#F3F4F6' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom, rgba(10, 10, 14, 0.4), #0A0A0E), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '6rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '900px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#F59E0B',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <FaTrophy size={14} /> Madurai Flagship • Official State Weightlifting & Athletic Partner
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}
          >
            THE PINNACLE OF <br />
            <span style={{ color: '#F59E0B' }}>ATHLETIC EXCELLENCE</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#D1D5DB',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
            }}
          >
            Welcome to Elite Athletic Club in Madurai. Featuring Olympic-grade competition platforms, 25m heated swimming pool, and Nordic cedar thermal recovery spa.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link
              to="/membership-plans"
              className="btn btn-primary"
              style={{ padding: '0.95rem 2rem', fontSize: '1rem', fontWeight: 800 }}
            >
              Explore Memberships <FaArrowRight size={14} />
            </Link>
            <Link
              to="/free-pass"
              className="btn btn-secondary"
              style={{
                padding: '0.95rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                border: '1px solid rgba(245, 158, 11, 0.4)',
                background: 'rgba(245, 158, 11, 0.08)',
                color: '#F59E0B',
              }}
            >
              <FaTicketAlt size={14} /> Claim 1-Day VIP Pass
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTER STRIP */}
      <section
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0D0D14',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#F59E0B' }}>5,000+</div>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                Athletes Transformed
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00E5FF' }}>25+</div>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                Certified CSCS Coaches
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00E676' }}>40,000</div>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                Sq. Ft. Madurai Campus
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#EF4444' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                Eleiko & Olympic Standards
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACILITIES HIGHLIGHT */}
      <section style={{ padding: '6rem 1.5rem', background: '#0A0A0E' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Madurai Campus Highlights
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem' }}>
              State-of-the-Art Facilities & Amenities
            </h2>
            <p style={{ color: '#9CA3AF', maxWidth: '600px', margin: '0.75rem auto 0' }}>
              Every zone is deliberately engineered to optimize peak strength, cardiovascular conditioning, and muscular recovery.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {(facilities?.length > 0 ? facilities : [
              {
                id: 1,
                name: 'Olympic Swimming Pool',
                category: 'SWIMMING_POOL',
                description: '25m x 50m competition pool with 8 regulated lanes maintained at 28°C with saline purification.',
                imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=800&q=80',
                operationalHours: '05:00 AM - 10:00 PM',
              },
              {
                id: 2,
                name: 'High-Performance Strength Deck',
                category: 'STRENGTH',
                description: 'World-class strength floor with Eleiko competition barbells, calibrated bumper plates, and 6 power racks.',
                imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                operationalHours: '05:00 AM - 10:30 PM',
              },
              {
                id: 3,
                name: 'Hydrotherapy Spa & Cedar Sauna',
                category: 'SPA_RECOVERY',
                description: 'Nordic cedar dry sauna, eucalyptus steam bath, 10°C cold plunge tub, and heated hydro-massage loungers.',
                imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                operationalHours: '06:00 AM - 10:00 PM',
              },
              {
                id: 4,
                name: 'Functional Cardio Deck',
                category: 'CARDIO',
                description: 'Woodway slat-belt treadmills, Concept2 SkiErgs/Rowers, and Rogue Echo assault bikes with live telemetry.',
                imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
                operationalHours: '05:00 AM - 10:30 PM',
              },
            ]).map((fac) => (
              <div
                key={fac.id}
                style={{
                  background: '#13131A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={fac.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'}
                    alt={fac.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(10, 10, 14, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#F59E0B',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    {fac.category}
                  </span>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#F3F4F6' }}>
                    {fac.name}
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                    {fac.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem', fontSize: '0.8rem', color: '#6B7280' }}>
                    <span><FaClock style={{ marginRight: '4px' }} /> {fac.operationalHours || '05:00 AM - 10:30 PM'}</span>
                    <Link to="/facilities" style={{ color: '#F59E0B', fontWeight: 600 }}>Details →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRICING & MEMBERSHIP TIERS (INR) */}
      <section style={{ padding: '6rem 1.5rem', background: '#0D0D14', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Transparent Pricing (INR)
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Select Your Madurai Club Membership
            </h2>
            <p style={{ color: '#9CA3AF', maxWidth: '600px', margin: '0.75rem auto 0' }}>
              Transparent INR pricing with UPI, Cards, and Net Banking checkout. No hidden onboarding fees.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              alignItems: 'stretch',
            }}
          >
            {(plans?.length > 0 ? plans : fallbackPlans).map((p, idx) => {
              const isPopular = idx === 1;
              return (
                <div
                  key={p.id}
                  style={{
                    background: isPopular ? 'linear-gradient(180deg, #1A1A24 0%, #13131A 100%)' : '#13131A',
                    border: isPopular ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: isPopular ? '0 10px 40px -10px rgba(245, 158, 11, 0.3)' : 'none',
                  }}
                >
                  {isPopular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#F59E0B',
                        color: '#000',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 14px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Most Popular Tier
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '0.5rem' }}>
                    {p.name}
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem', minHeight: '40px' }}>
                    {p.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: isPopular ? '#F59E0B' : '#F3F4F6' }}>
                      {fmtINR(p.price)}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                      / {p.durationMonths === 1 ? 'Month' : `${p.durationMonths} Months`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem', flex: 1 }}>
                    {p.features?.map((f, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#D1D5DB' }}>
                        <FaCheck color="#00E676" size={13} style={{ marginTop: '3px', flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedPlanForCheckout(p)}
                    className={isPopular ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    Select {p.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section style={{ padding: '6rem 1.5rem', background: '#0A0A0E' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Athlete Testimonials
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Madurai Member Transformations
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {(testimonials?.length > 0 ? testimonials : [
              {
                id: 1,
                memberName: 'Alexander Reed',
                roleOrPlan: 'Elite Tier Member • 2 Years',
                rating: 5,
                reviewText: 'Elite Athletic Club in Madurai completely redefined my perception of training. The Eleiko platforms, Olympic pool, and cold plunge are world-class.',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              },
              {
                id: 2,
                memberName: 'Priya Sundaram',
                roleOrPlan: 'Premium Tier Member • 8 Months',
                rating: 5,
                reviewText: 'The personal coaching and high-intensity HIIT classes helped me shatter personal records. The cedar sauna after morning sessions is pure bliss.',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              },
              {
                id: 3,
                memberName: 'Karthik Ramanathan',
                roleOrPlan: 'Elite Tier Member • 1 Year',
                rating: 5,
                reviewText: 'Cleanliness, atmosphere, equipment variety, and trainer professionalism are unmatched in Madurai. Easily the finest facility in South India.',
                avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
              },
            ]).map((t) => (
              <div
                key={t.id}
                style={{
                  background: '#13131A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.25rem', color: '#F59E0B', marginBottom: '1rem' }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <FaStar key={i} size={14} />
                    ))}
                  </div>
                  <p style={{ color: '#D1D5DB', fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                    "{t.reviewText}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={t.memberName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(245, 158, 11, 0.4)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#F3F4F6' }}>{t.memberName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{t.roleOrPlan}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION / GUEST PASS */}
      <section
        style={{
          padding: '5rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem' }}>
            Experience Elite Athletic Club For Free
          </h2>
          <p style={{ color: '#D1D5DB', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Claim your 1-Day Complimentary VIP Pass today. Unlock full access to the Madurai strength deck, Olympic pool, and sauna.
          </p>
          <Link
            to="/free-pass"
            className="btn btn-primary"
            style={{ padding: '0.95rem 2.2rem', fontSize: '1rem', fontWeight: 800 }}
          >
            <FaTicketAlt /> Generate My VIP Pass
          </Link>
        </div>
      </section>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          isOpen={!!selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
        />
      )}
    </div>
  );
};

export default LandingPage;
