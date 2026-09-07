import React, { useState, useEffect } from 'react';
import { 
  FaClock, FaUsers, FaSnowflake, FaParking, FaVideo, 
  FaKey, FaWifi, FaUserShield, FaArrowRight, FaFilter 
} from 'react-icons/fa';
import { publicInfoService } from '../../services/publicInfoService';
import FacilityDetailModal from '../../components/modals/FacilityDetailModal';

const defaultFacilities = [
  {
    id: 1,
    name: 'High-Performance Strength Deck',
    category: 'STRENGTH',
    categoryName: 'Strength & Power',
    description: 'World-class strength floor outfitted with Eleiko IPF-certified competition barbells, calibrated cast iron plates, 6 heavy-duty power cages, and acoustic shock-absorbent deadlift platforms.',
    rules: 'Mandatory collar clips on all barbell lifts. Re-rack all plates and dumbbells after set completion. Chalk permitted in designated platform bays only.',
    sanitationProtocol: 'Hourly disinfectant wiping of barbell knurling and benches. Dedicated chalk cleanup stations and sanitized microfiber towel stands.',
    capacity: 75,
    operationalHours: '05:00 AM - 10:30 PM',
    supervisionStatus: 'Head Coach K. Murugan & Duty Trainers on Floor',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    name: 'Endurance Conditioning & Turf Arena',
    category: 'CARDIO',
    categoryName: 'Cardio & Conditioning',
    description: 'Dynamic conditioning zone featuring Woodway curved slat-belt treadmills, Concept2 SkiErgs, Rogue Echo assault bikes, and a 30-meter high-density turf track for sled drives and agility drills.',
    rules: 'Wipe console and telemetry handles after use. 45-minute limit on cardio units during peak evening rush (06:00 PM – 08:30 PM).',
    sanitationProtocol: 'Continuous UV air purification running in cardio bay. Antimicrobial spray bottles and fresh wipes stationed at every treadmill bay.',
    capacity: 60,
    operationalHours: '05:00 AM - 10:30 PM',
    supervisionStatus: 'Active Conditioning Coaches on Floor',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    name: 'Olympic 50m Regulated Pool',
    category: 'SWIMMING_POOL',
    categoryName: 'Olympic Pool',
    description: '25m x 50m 8-lane competition swimming pool maintained at a constant 28°C. Engineered with automated touch-timing boards, underwater stroke analysis lighting, and saline purification without harsh chlorine odor.',
    rules: 'Pre-swim shower mandatory. Silicone swim cap and regulation swimwear required on deck. Observe fast, medium, and slow lane signs.',
    sanitationProtocol: 'Automated 24/7 saline electrolytic purification, multi-stage sand & UV sterilization, and pH balance monitoring checked every 3 hours.',
    capacity: 35,
    operationalHours: '05:30 AM - 09:30 PM',
    supervisionStatus: 'Certified FINA Lifeguards & Aquatic Coaches on Deck',
    imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    name: 'Hydrotherapy Spa & Cedar Sanctuary',
    category: 'SPA_RECOVERY',
    categoryName: 'Hydrotherapy Spa',
    description: 'Comprehensive muscular restoration center with Nordic cedar dry sauna, aromatherapy eucalyptus steam bath, 10°C cold plunge tub for rapid inflammation flushing, and heated marble loungers.',
    rules: 'Full-body towel required on wooden benches. Recommended maximum 12-minute session in cold plunge tub. Whispering zone policy strictly maintained.',
    sanitationProtocol: 'High-temperature thermal steam sterilization between shifts. Continuous filtration and ozone treatment of cold plunge waters.',
    capacity: 25,
    operationalHours: '06:00 AM - 10:00 PM',
    supervisionStatus: 'Spa Attendant & Wellness Concierge on Duty',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    name: 'Executive Locker Suites & Parking Complex',
    category: 'AMENITIES',
    categoryName: 'Amenities & Parking',
    description: 'Spacious ground and basement multi-tier parking facility with dedicated slots for 80+ cars and 200+ two-wheelers, EV charging ports, biometric keyless digital locker rooms, rain showers, and dry grooming vanity bars.',
    rules: 'Lockers are for session use only. Do not leave valuables overnight. Valid club RFID decal required for automated parking gate boom barrier access.',
    sanitationProtocol: 'Housekeeping round-the-clock attendants. Shower stalls and vanity mirrors disinfected every 60 minutes with medical-grade cleaners.',
    capacity: 120,
    operationalHours: '04:45 AM - 11:00 PM',
    supervisionStatus: '24/7 Security Personnel & Front Desk Concierge',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
  },
];

const amenityBadges = [
  { icon: <FaSnowflake size={11} color="#00E5FF" />, label: '100% Central Air-Conditioned' },
  { icon: <FaParking size={11} color="#F59E0B" />, label: 'Spacious Car & Two-Wheeler Parking' },
  { icon: <FaVideo size={11} color="#EF4444" />, label: '24/7 CCTV Surveillance & RFID Access' },
  { icon: <FaKey size={11} color="#00E676" />, label: 'Digital Keyless Lockers & Luxury Steam Showers' },
  { icon: <FaWifi size={11} color="#38BDF8" />, label: 'High-Speed WiFi & Hydration Bars' },
];

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState(defaultFacilities);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const cat = activeCategory === 'ALL' ? null : activeCategory;
        const res = await publicInfoService.getFacilities(cat);
        if (res?.data && res.data.length > 0) {
          // Merge API data with default details to ensure full richness
          const enriched = res.data.map((item) => {
            const match = defaultFacilities.find((d) => d.category === item.category);
            return {
              ...match,
              ...item,
              categoryName: match?.categoryName || item.category,
              supervisionStatus: match?.supervisionStatus || 'Supervised by Certified Staff',
              sanitationProtocol: match?.sanitationProtocol || match?.rules || item.rules,
            };
          });
          setFacilities(enriched);
        } else {
          // Fallback to local catalog filtered dynamically
          if (activeCategory === 'ALL') {
            setFacilities(defaultFacilities);
          } else {
            const filtered = defaultFacilities.filter((f) => f.category === activeCategory);
            setFacilities(filtered.length > 0 ? filtered : defaultFacilities);
          }
        }
      } catch (err) {
        console.error('Error fetching facilities, using verified catalog:', err);
        if (activeCategory === 'ALL') {
          setFacilities(defaultFacilities);
        } else {
          setFacilities(defaultFacilities.filter((f) => f.category === activeCategory));
        }
      }
    };

    fetchFacilities();
  }, [activeCategory]);

  const categories = [
    { id: 'ALL', label: 'All Zones' },
    { id: 'STRENGTH', label: 'Strength & Power' },
    { id: 'CARDIO', label: 'Cardio & Conditioning' },
    { id: 'SWIMMING_POOL', label: 'Olympic Pool' },
    { id: 'SPA_RECOVERY', label: 'Hydrotherapy Spa' },
    { id: 'AMENITIES', label: 'Amenities & Parking' },
  ];

  const displayedFacilities = activeCategory === 'ALL'
    ? facilities
    : facilities.filter((f) => f.category === activeCategory);

  return (
    <div style={{ padding: '4rem 1.5rem', color: '#F8FAFC', minHeight: '80vh' }}>
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
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '30px',
              color: '#FF8800',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            Madurai Flagship Infrastructure
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Olympic Facilities & World-Class Amenities
          </h1>
          <p style={{ color: '#94A3B8', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Spanning 40,000 sq. ft. along Bye Pass Road, every square foot is optimized with international-competition gear, precision climate control, and rapid recovery suites.
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
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
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
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facilities Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2.25rem',
          }}
        >
          {displayedFacilities.map((fac) => (
            <div
              key={fac.id}
              onClick={() => setSelectedFacility(fac)}
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
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
              {/* Card Image */}
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src={fac.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'}
                  alt={fac.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(9, 12, 16, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#FF8800',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 107, 0, 0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {fac.categoryName || fac.category}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.6rem' }}>
                  {fac.name}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                  {fac.description}
                </p>

                {/* Operating details strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                    color: '#cbd5e1',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaClock color="#FF8800" size={13} />
                    <span>{fac.operationalHours || '05:00 AM - 10:30 PM'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaUsers color="#00E5FF" size={13} />
                    <span>Cap: {fac.capacity} Athletes</span>
                  </div>
                </div>

                {/* Core Amenities & Infrastructure Badges (All 5 badges on every card) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                    Core Zone Infrastructure:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {amenityBadges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="amenity-chip"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFacility(fac);
                  }}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>Inspect Zone & Protocols</span>
                  <FaArrowRight size={12} color="#FF8800" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Inspection / Detail Modal */}
        <FacilityDetailModal
          facility={selectedFacility}
          isOpen={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      </div>
    </div>
  );
};

export default FacilitiesPage;

