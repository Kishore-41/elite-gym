import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaDumbbell, FaUsers, FaInbox, FaClipboardList, FaCheckCircle,
  FaExclamationCircle, FaUserCheck, FaClock, FaArrowRight, FaPlus
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

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getTrainerStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load trainer statistics.');
      }
    } catch (err) {
      console.error('Failed to load trainer dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Unable to retrieve coach metrics.');
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
        <Loader text="Loading coach command center..." />
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

  const capacityPct = stats?.studentCapacity
    ? Math.min(100, Math.round(((stats?.activeStudentsCount || 0) / stats.studentCapacity) * 100))
    : 0;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      {/* Welcome Coach Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          ...CARD_BASE,
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(14, 19, 31, 0.85) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
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
            background: 'rgba(0, 229, 255, 0.15)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            flexShrink: 0,
          }}>
            <FaDumbbell />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Welcome, Coach {stats?.trainerName || user?.fullName || 'Trainer'}!
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
              Specialization: <strong style={{ color: 'var(--text-primary)' }}>{stats?.specialization || 'Strength & Conditioning'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/trainer/requests" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FaInbox /> Requests ({stats?.pendingRequestsCount || 0})
          </Link>
          <Link to="/trainer/workout-plans" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FaPlus /> Create Routine
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Active Students & Capacity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Assigned Students
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.35rem' }}>
                {stats?.activeStudentsCount || 0} / {stats?.studentCapacity || 20}
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
              <FaUsers />
            </div>
          </div>
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <span>Capacity Utilized</span>
              <span>{capacityPct}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${capacityPct}%`, background: 'var(--accent-cyan)', borderRadius: '999px' }} />
            </div>
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Pending Requests
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: (stats?.pendingRequestsCount || 0) > 0 ? '#f59e0b' : '#22c55e', marginTop: '0.35rem' }}>
                {stats?.pendingRequestsCount || 0}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: (stats?.pendingRequestsCount || 0) > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: (stats?.pendingRequestsCount || 0) > 0 ? '#f59e0b' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaInbox />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            <Link to="/trainer/requests" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Review inbox <FaArrowRight size={10} />
            </Link>
          </div>
        </motion.div>

        {/* Managed Workout Plans */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Active Workout Plans
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7', marginTop: '0.35rem' }}>
                {stats?.activeWorkoutPlansCount || 0}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaClipboardList />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            <Link to="/trainer/workout-plans" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Manage routines <FaArrowRight size={10} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Two Column Layout: Pending Requests & Student Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Pending Requests Section */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaInbox style={{ color: '#f59e0b' }} /> Pending Consultations & Bookings
            </h3>
            <Link to="/trainer/requests" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          {stats?.pendingRequests && stats.pendingRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.pendingRequests.slice(0, 4).map((r) => (
                <div key={r.requestId} style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.studentName}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {r.requestType?.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {r.notes || 'No notes attached.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <FaCheckCircle size={28} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
              <div>All student requests have been processed!</div>
            </div>
          )}
        </div>

        {/* Assigned Students Roster Overview */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUsers style={{ color: 'var(--accent-cyan)' }} /> Assigned Athletes
            </h3>
            <Link to="/trainer/students" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Full Roster
            </Link>
          </div>

          {stats?.students && stats.students.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.students.slice(0, 4).map((s) => (
                <div key={s.studentId} style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.studentName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Goal: <strong style={{ color: 'var(--text-primary)' }}>{s.fitnessGoal || 'General Fitness'}</strong>
                    </div>
                  </div>
                  <Link
                    to="/trainer/workout-plans"
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  >
                    Assign Plan
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div>No students currently assigned.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrainerDashboard;
