import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserShield, FaUsers, FaUserTie, FaIdCard, FaCalendarCheck,
  FaFileInvoiceDollar, FaExclamationCircle, FaArrowRight, FaCreditCard,
  FaCheckCircle, FaHourglassHalf, FaTimesCircle
} from 'react-icons/fa';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.5rem',
};

const fmtINR = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n || 0);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getAdminStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load administrator statistics.');
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Unable to retrieve administrative metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <Loader text="Loading administrative intelligence center..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ ...CARD_BASE, maxWidth: '600px', margin: '0 auto', color: '#ef4444' }}>
          <FaExclamationCircle size={36} style={{ marginBottom: '1rem' }} />
          <h3>Error Loading Dashboard</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem' }}>{error}</p>
          <button onClick={loadStats} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      {/* Admin Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          ...CARD_BASE,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(14, 19, 31, 0.85) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            flexShrink: 0,
          }}>
            <FaUserShield />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Admin Operations Center
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
              Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.fullName || user?.username || 'Administrator'}</strong> · Super Administrator Access
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/memberships" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FaIdCard /> Plans & Members
          </Link>
          <Link to="/admin/payments" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FaFileInvoiceDollar /> Financial Ledger
          </Link>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Total Students */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Total Members
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {stats?.totalStudentsCount || 0}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 107, 0, 0.12)',
              color: 'var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaUsers />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Subscriptions:</span>
            <strong style={{ color: 'var(--accent-green)' }}>{stats?.activeMembershipsCount || 0}</strong>
          </div>
        </motion.div>

        {/* Total Trainers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Trainers on Staff
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.35rem' }}>
                {stats?.totalTrainersCount || 0}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(0, 229, 255, 0.12)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaUserTie />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Staff Status:</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>Active Coaching</strong>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Gross Revenue
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22c55e', marginTop: '0.35rem' }}>
                {fmtINR(stats?.totalRevenue)}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.12)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaCreditCard />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Settled Payments</span>
            <strong style={{ color: '#22c55e' }}>Audited</strong>
          </div>
        </motion.div>

        {/* Open Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Pending Grievances
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: (stats?.openComplaintsCount || 0) > 0 ? '#ef4444' : '#22c55e', marginTop: '0.35rem' }}>
                {stats?.openComplaintsCount || 0}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: (stats?.openComplaintsCount || 0) > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: (stats?.openComplaintsCount || 0) > 0 ? '#ef4444' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaExclamationCircle />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            <Link to="/admin/complaints" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Triage complaints <FaArrowRight size={10} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Two Column Layout: Recent Payments & Recent Grievances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Payments Section */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaFileInvoiceDollar style={{ color: 'var(--accent-orange)' }} /> Recent Financial Transactions
            </h3>
            <Link to="/admin/payments" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600 }}>
              Full Ledger
            </Link>
          </div>

          {stats?.recentPayments && stats.recentPayments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentPayments.map((p) => (
                <div key={p.paymentId} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {p.invoiceNumber} · {p.planName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: p.status === 'SUCCESS' ? '#22c55e' : '#f59e0b' }}>
                      {fmtINR(p.amount)}
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: p.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: p.status === 'SUCCESS' ? '#22c55e' : '#f59e0b',
                      fontWeight: 700,
                    }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No recent payments recorded.
            </div>
          )}
        </div>

        {/* Recent Complaints Triage Section */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaExclamationCircle style={{ color: '#ef4444' }} /> Member Support Tickets
            </h3>
            <Link to="/admin/complaints" style={{ fontSize: '0.8rem', color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
              Manage All
            </Link>
          </div>

          {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentComplaints.map((c) => (
                <div key={c.complaintId} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ minWidth: 0, paddingRight: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.subject}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      From: {c.studentName} · {c.category}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      background: c.status === 'RESOLVED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.status === 'RESOLVED' ? '#22c55e' : '#ef4444',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <FaCheckCircle size={28} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
              <div>No grievances requiring urgent triage.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
