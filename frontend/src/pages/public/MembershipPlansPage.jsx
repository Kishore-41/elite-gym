import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, FaDumbbell, FaCrown, FaBolt, FaStar, 
  FaUserTie, FaPercent, FaShieldAlt, FaMagic 
} from 'react-icons/fa';
import { publicInfoService } from '../../services/publicInfoService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import CheckoutModal from '../../components/modals/CheckoutModal';

const fmtINR = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n || 0);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Realistic Indian Commercial Gym Subscription Economics
const clubTiers = [
  {
    id: 1,
    slug: 'classic',
    name: 'Classic Fitness Deck',
    tagline: 'Foundational Athletic Conditioning',
    description: 'Full strength & cardio floor access, biometric locker room, and comprehensive fitness assessment.',
    pricing: {
      1: 1499,
      3: 3899,
      6: 6999,
      12: 11999,
    },
    features: [
      'Full Strength Floor & Free Weights Access',
      'Functional Cardio Deck & Turf Track',
      'Biometric Keyless Locker Room & Showers',
      '1 Complimentary Biometric Movement Assessment',
      'Mobile App Check-in & Workout Tracker',
      'Standard Hydration Bar Access',
    ],
  },
  {
    id: 2,
    slug: 'performance',
    name: 'Performance Pro',
    tagline: 'Most Popular Choice for Serious Athletes',
    isPopular: true,
    description: 'Classic perks plus 25m Olympic pool access, unlimited group HIIT & Yoga, and 2 sauna sessions/month.',
    pricing: {
      1: 2499,
      3: 6499,
      6: 11999,
      12: 19999,
    },
    features: [
      'All Classic Fitness Deck Perks Included',
      '25m Olympic Regulated Swimming Pool Access',
      'Unlimited Group HIIT, Calisthenics & Power Yoga',
      '2 Nordic Cedar Sauna & Steam Sessions / Month',
      '10% Pro-Shop & Recovery Bar Discount',
      'Priority Locker Booking & Complimentary Towels',
    ],
  },
  {
    id: 3,
    slug: 'elite-vip',
    name: 'Elite VIP Championship',
    tagline: 'Unrestricted VIP Access & Thermal Recovery',
    description: 'All-access pass with unlimited hydrotherapy spa, ice plunge, monthly InBody scan, and guest passes.',
    pricing: {
      1: 3999,
      3: 9999,
      6: 17999,
      12: 28999,
    },
    features: [
      'Unrestricted All-Access Pass Across All Zones',
      'Unlimited Hydrotherapy Spa & 10°C Ice Plunge',
      'Monthly InBody 570 Body Composition Analysis',
      '2 Free Complimentary Guest Passes / Month',
      'VIP Dedicated Locker & Fresh Laundry Towel Service',
      'Quarterly Nutrition & Supplement Strategy Review',
    ],
  },
];

const durations = [
  { months: 1, label: '1 Month', badge: 'Standard Base' },
  { months: 3, label: '3 Months', badge: 'Save ~13%', discount: '~13% OFF' },
  { months: 6, label: '6 Months', badge: 'Save ~22%', discount: '~22% OFF' },
  { months: 12, label: '12 Months', badge: 'Save up to 40% vs Monthly', discount: 'Bulk Discount', isBest: true },
];

const MembershipPlansPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [hasTrainerAddon, setHasTrainerAddon] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  const getPlanIcon = (slug) => {
    if (slug === 'classic') return <FaDumbbell />;
    if (slug === 'performance') return <FaBolt />;
    return <FaCrown />;
  };

  return (
    <div style={{ padding: '4rem 1.5rem 6rem 1.5rem', minHeight: 'calc(100vh - 140px)', color: '#F8FAFC' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'inline-block', marginBottom: '1rem' }}
          >
            <span
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
              }}
            >
              <FaStar /> Madurai Commercial Subscription Engine (INR)
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(2.3rem, 4.5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.025em' }}
          >
            Choose Your <span style={{ color: '#FF8800' }}>Madurai Club Tier</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6 }}
          >
            Transparent commercial Indian pricing with UPI, Cards, and Net Banking. Choose quarterly or annual billing for substantial multi-month savings.
          </motion.p>
        </div>

        {/* CONTROLS: DURATION SWITCHER & PERSONAL TRAINER TOGGLE */}
        <div style={{ maxWidth: '880px', margin: '0 auto 3.5rem auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          {/* 1. Billing Duration Switcher */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              background: '#10141f',
              padding: '0.4rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              gap: '0.35rem',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '680px',
              boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.5)',
            }}
          >
            {durations.map((d) => {
              const isActive = selectedDuration === d.months;
              return (
                <button
                  key={d.months}
                  onClick={() => setSelectedDuration(d.months)}
                  style={{
                    flex: '1 1 120px',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 4px 15px rgba(255, 107, 0, 0.35)' : 'none',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#F8FAFC';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#94A3B8';
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{d.label}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(0, 0, 0, 0.25)' : (d.isBest ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)'),
                      color: isActive ? '#FFFFFF' : (d.isBest ? '#FF8800' : '#64748b'),
                    }}
                  >
                    {d.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. Personal Trainer Add-on Toggle Switch */}
          <div
            onClick={() => setHasTrainerAddon(!hasTrainerAddon)}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1.5rem',
              background: hasTrainerAddon ? 'rgba(255, 107, 0, 0.12)' : '#10141f',
              border: hasTrainerAddon ? '1.5px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '30px',
              transition: 'all 0.25s ease',
              boxShadow: hasTrainerAddon ? '0 0 20px rgba(255, 107, 0, 0.2)' : 'none',
            }}
          >
            {/* Custom Checkbox Toggle */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: hasTrainerAddon ? '2px solid #FF6B00' : '2px solid #64748b',
                background: hasTrainerAddon ? '#FF6B00' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              {hasTrainerAddon && <FaCheck />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FaUserTie color={hasTrainerAddon ? '#FF8800' : '#94A3B8'} size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: hasTrainerAddon ? '#F8FAFC' : '#cbd5e1' }}>
                Add Dedicated 1-on-1 Certified Personal Coach
              </span>
              <span
                style={{
                  background: hasTrainerAddon ? '#FF6B00' : 'rgba(255, 107, 0, 0.15)',
                  color: hasTrainerAddon ? '#FFFFFF' : '#FF8800',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                +₹800 / month
              </span>
            </div>
          </div>
        </div>

        {/* TIERS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.25rem',
            alignItems: 'stretch',
          }}
        >
          {clubTiers.map((tier, index) => {
            const basePrice = tier.pricing[selectedDuration];
            const trainerFee = hasTrainerAddon ? 800 * selectedDuration : 0;
            const totalPrice = basePrice + trainerFee;
            const effectiveMonthlyPrice = Math.round(totalPrice / selectedDuration);
            const isPopular = tier.isPopular;

            // Monthly baseline without discount for comparison
            const monthlyBaseEquivalent = tier.pricing[1] * selectedDuration + trainerFee;
            const savingsAmount = monthlyBaseEquivalent - totalPrice;

            return (
              <motion.div
                key={tier.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
                style={{
                  background: isPopular
                    ? 'linear-gradient(180deg, #182030 0%, #10141f 100%)'
                    : 'rgba(16, 20, 31, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isPopular ? '2px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '22px',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: isPopular
                    ? '0 20px 45px -10px rgba(255, 107, 0, 0.25), 0 0 30px rgba(255, 107, 0, 0.1)'
                    : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                  transition: 'border-color 0.3s ease, transform 0.3s ease',
                }}
              >
                {/* Most Popular Badge */}
                {isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-13px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      padding: '4px 16px',
                      borderRadius: '20px',
                      letterSpacing: '0.08em',
                      boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)',
                    }}
                  >
                    Most Popular Choice
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#F8FAFC' }}>
                        {tier.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: isPopular ? '#FF8800' : '#94A3B8', fontWeight: 600, marginTop: '0.15rem' }}>
                        {tier.tagline}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isPopular ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isPopular ? '#FF8800' : '#00E5FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.35rem',
                        flexShrink: 0,
                      }}
                    >
                      {getPlanIcon(tier.slug)}
                    </div>
                  </div>

                  <p style={{ color: '#94A3B8', fontSize: '0.88rem', minHeight: '44px', marginBottom: '1.5rem', lineHeight: 1.55 }}>
                    {tier.description}
                  </p>

                  {/* Price Block */}
                  <div
                    style={{
                      padding: '1.35rem 0',
                      marginBottom: '1.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 900, color: isPopular ? '#FF8800' : '#F8FAFC', letterSpacing: '-0.03em' }}>
                        {fmtINR(totalPrice)}
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '0.92rem', fontWeight: 600 }}>
                        / {selectedDuration === 1 ? 'Month' : `${selectedDuration} Months`}
                      </span>
                    </div>

                    {/* Effective breakdown & savings badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Effective ~<strong>{fmtINR(effectiveMonthlyPrice)}</strong>/month
                      </span>
                      {selectedDuration > 1 && savingsAmount > 0 && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'rgba(0, 230, 118, 0.12)',
                            color: '#00E676',
                            border: '1px solid rgba(0, 230, 118, 0.3)',
                          }}
                        >
                          Saves {fmtINR(savingsAmount)}
                        </span>
                      )}
                      {hasTrainerAddon && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'rgba(255, 107, 0, 0.15)',
                            color: '#FF8800',
                          }}
                        >
                          Coach Included
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Included Features / Value Perks */}
                  <div style={{ marginBottom: '2.25rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '1rem', fontWeight: 800 }}>
                      Tier Perks & Access Privileges:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#D1D5DB' }}>
                          <div style={{ color: '#00E676', marginTop: '3px', flexShrink: 0 }}>
                            <FaCheck size={12} />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {hasTrainerAddon && (
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#FF8800', fontWeight: 700 }}>
                          <div style={{ color: '#FF8800', marginTop: '3px', flexShrink: 0 }}>
                            <FaUserTie size={12} />
                          </div>
                          <span>Dedicated 1-on-1 Certified Personal Coach Included</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => {
                    setSelectedPlanForCheckout({
                      id: tier.id,
                      name: hasTrainerAddon ? `${tier.name} (+ Personal Coach)` : tier.name,
                      price: totalPrice,
                      durationMonths: selectedDuration,
                      description: tier.description,
                      hasTrainerAddon,
                    });
                  }}
                  className={isPopular ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontSize: '0.96rem',
                    fontWeight: 800,
                  }}
                >
                  Select {tier.name}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Guarantee Strip */}
        <div
          style={{
            marginTop: '4rem',
            padding: '1.5rem',
            background: 'rgba(16, 20, 31, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#94A3B8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaShieldAlt color="#00E676" size={18} />
            <span>Zero Hidden Onboarding Fees in Madurai</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaPercent color="#FF8800" size={16} />
            <span>Multi-Month Pro-Rated Upgrades Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaMagic color="#00E5FF" size={16} />
            <span>Instant Digital Access Pass with Biometric ID</span>
          </div>
        </div>

        {/* Checkout Modal */}
        {selectedPlanForCheckout && (
          <CheckoutModal
            plan={selectedPlanForCheckout}
            isOpen={!!selectedPlanForCheckout}
            onClose={() => setSelectedPlanForCheckout(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MembershipPlansPage;

