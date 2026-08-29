import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaIdCard, FaCheckCircle, FaCalendarAlt, FaHistory, FaPlus, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const MyMembership = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [activeMembership, setActiveMembership] = useState(null);
  const [history, setHistory] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadMembershipData();
  }, []);

  // Pre-select plan if passed from public plans page
  useEffect(() => {
    if (location.state?.preselectPlanId) {
      setSelectedPlanId(location.state.preselectPlanId);
      setIsPurchaseModalOpen(true);
    }
  }, [location.state]);

  const loadMembershipData = async () => {
    try {
      setLoading(true);
      setError('');

      const [activeRes, historyRes, plansRes] = await Promise.all([
        membershipService.getActiveMembership(),
        membershipService.getAllStudentMemberships(),
        membershipService.getActivePlans(),
      ]);

      if (activeRes.success) setActiveMembership(activeRes.data);
      if (historyRes.success) setHistory(historyRes.data);
      if (plansRes.success) {
        setAvailablePlans(plansRes.data);
        if (plansRes.data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(plansRes.data[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load membership information.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setModalError('Please select a membership plan.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      const res = await membershipService.purchaseMembership(selectedPlanId);
      if (res.success) {
        setIsPurchaseModalOpen(false);
        await loadMembershipData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Subscription failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlanDetails = availablePlans.find((p) => String(p.id) === String(selectedPlanId));

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1050px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
            <FaIdCard /> Student Membership Hub
          </span>
          <h1 style={{ fontSize: '2rem' }}>My Membership & Subscription</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your active gym package, renewal schedule, and subscription history.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setIsPurchaseModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <FaPlus /> Subscribe / Renew Plan
        </button>
      </div>

      {loading ? (
        <Loader message="Loading membership details..." />
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadMembershipData} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Active Membership Showcase */}
          {activeMembership ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{
                border: '1px solid rgba(255, 107, 0, 0.3)',
                background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.06) 0%, rgba(14, 19, 31, 0.9) 100%)',
                padding: '2.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.85rem' }}>{activeMembership.planName}</h2>
                    <Badge status={activeMembership.status} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Plan Price: <strong style={{ color: 'var(--text-primary)' }}>${activeMembership.planPrice}</strong> for {activeMembership.durationMonths} {activeMembership.durationMonths === 1 ? 'Month' : 'Months'}
                  </p>
                </div>

                {/* Days Remaining Counter Widget */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-orange)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                    {activeMembership.daysRemaining}
                  </div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Days Remaining
                  </span>
                </div>
              </div>

              {/* Schedule Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</span>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    {activeMembership.startDate}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date</span>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem', color: 'var(--accent-orange)' }}>
                    {activeMembership.endDate}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Member Access</span>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem', color: 'var(--accent-green)' }}>
                    Unlimited Floor Access
                  </div>
                </div>
              </div>

              {/* Included Perks */}
              {activeMembership.planFeatures && activeMembership.planFeatures.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Active Plan Privileges
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
                    {activeMembership.planFeatures.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <FaCheck size={12} style={{ color: 'var(--accent-green)' }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <EmptyState
              title="No Active Membership"
              message="You do not have an active gym membership subscription. Browse our plans to start working out."
              action={
                <button onClick={() => setIsPurchaseModalOpen(true)} className="btn btn-primary">
                  <FaPlus /> Subscribe to a Plan
                </button>
              }
            />
          )}

          {/* Membership History Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <FaHistory style={{ color: 'var(--accent-orange)' }} />
              <h3 style={{ fontSize: '1.25rem' }}>Membership History</h3>
            </div>

            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No subscription history recorded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Start Date</th>
                      <th style={{ padding: '0.75rem 1rem' }}>End Date</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{item.planName}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{item.durationMonths} mo</td>
                        <td style={{ padding: '0.85rem 1rem' }}>${item.planPrice}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{item.startDate}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{item.endDate}</td>
                        <td style={{ padding: '0.85rem 1rem' }}><Badge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Subscribe / Renew Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Subscribe to Membership Plan"
        maxWidth="520px"
      >
        <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {modalError && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)',
              border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <FaExclamationTriangle />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Select Membership Tier
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#151a24',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              required
            >
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ${plan.price} ({plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'})
                </option>
              ))}
            </select>
          </div>

          {selectedPlanDetails && (
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{selectedPlanDetails.name}</span>
                <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>${selectedPlanDetails.price}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {selectedPlanDetails.description}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Included Features:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {selectedPlanDetails.features.map((f, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaCheck size={10} style={{ color: 'var(--accent-green)' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsPurchaseModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || availablePlans.length === 0}
            >
              {submitting ? 'Confirming Subscription...' : 'Confirm Subscription'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default MyMembership;
