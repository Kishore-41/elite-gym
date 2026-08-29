import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaDumbbell, FaCrown, FaStar, FaBolt } from 'react-icons/fa';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const MembershipPlansPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await membershipService.getActivePlans();
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load membership plans.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (index) => {
    if (index === 0) return <FaDumbbell />;
    if (index === 1) return <FaBolt />;
    return <FaCrown />;
  };

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/register/student', { state: { selectedPlanId: plan.id } });
    } else if (user?.role === 'ROLE_STUDENT') {
      navigate('/student/membership', { state: { preselectPlanId: plan.id } });
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'inline-block', marginBottom: '1rem' }}
          >
            <span className="badge badge-orange">
              <FaStar /> Flexible Pricing Options
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}
          >
            Choose Your <span style={{ color: 'var(--accent-orange)' }}>Membership Tier</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}
          >
            Transparent plans tailored to your athletic objectives. No hidden fees. Cancel or upgrade at any time.
          </motion.p>
        </div>

        {/* Content */}
        {loading ? (
          <Loader message="Fetching membership tiers..." />
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
            <p>{error}</p>
            <button onClick={fetchPlans} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <EmptyState title="No active plans found" message="Please check back later as new membership options are added." />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch',
          }}>
            {plans.map((plan, index) => {
              const isPopular = index === 1; // Highlight middle plan

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    borderColor: isPopular ? 'rgba(255, 107, 0, 0.4)' : 'var(--border-glass)',
                    boxShadow: isPopular ? '0 15px 35px -5px rgba(255, 107, 0, 0.15)' : 'var(--shadow-card)',
                    background: isPopular ? 'linear-gradient(180deg, rgba(255, 107, 0, 0.05) 0%, rgba(14, 19, 31, 0.85) 100%)' : 'var(--bg-card)',
                  }}
                >
                  {isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, var(--accent-orange), #e05e00)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.05em',
                      boxShadow: 'var(--shadow-glow)',
                    }}>
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.4rem' }}>{plan.name}</h3>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: isPopular ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isPopular ? 'var(--accent-orange)' : 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}>
                        {getPlanIcon(index)}
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px', marginBottom: '1.5rem' }}>
                      {plan.description}
                    </p>

                    {/* Price Block */}
                    <div style={{
                      padding: '1.25rem 0',
                      marginBottom: '1.5rem',
                      borderTop: '1px solid var(--border-glass)',
                      borderBottom: '1px solid var(--border-glass)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                          ${plan.price}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        Included Features
                      </h4>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {plan.features && plan.features.map((feature, fIdx) => (
                          <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--accent-green)', marginTop: '3px', flexShrink: 0 }}>
                              <FaCheck size={12} />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={isPopular ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {isAuthenticated && user?.role === 'ROLE_STUDENT'
                      ? 'Subscribe to this Plan'
                      : 'Get Started with ' + plan.name}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MembershipPlansPage;
