import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserGraduate, FaIdCard, FaDumbbell, FaCalendarCheck, FaChartLine,
  FaCreditCard, FaExclamationCircle, FaFire, FaCheckCircle, FaTimesCircle,
  FaClock, FaUserTie, FaArrowRight, FaBell
} from 'react-icons/fa';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.5rem',
  transition: 'transform 0.2s ease, border-color 0.2s ease',
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getStudentStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load student statistics.');
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Unable to retrieve dashboard metrics.');
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
        <Loader text="Loading your fitness dashboard..." />
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
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          ...CARD_BASE,
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(14, 19, 31, 0.85) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.3)',
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
            background: 'rgba(255, 107, 0, 0.15)',
            color: 'var(--accent-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            flexShrink: 0,
          }}>
            <FaUserGraduate />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Welcome back, {stats?.studentName || user?.fullName || 'Athlete'}!
              </h1>
              <Badge status={stats?.membershipStatus || 'INACTIVE'} />
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
              {stats?.activePlanName
                ? `Current Plan: ${stats.activePlanName} · ${stats.daysRemaining || 0} days remaining`
                : 'No active membership subscription.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/attendance" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FaCalendarCheck /> Check In
          </Link>
          <Link to="/student/workouts" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <FaDumbbell /> View Routine
          </Link>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Attendance Streak */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Workout Streak
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-orange)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaFire /> {stats?.attendanceStreak || 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Days</span>
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
              <FaFire />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Attendance Rate:</span>
            <strong style={{ color: 'var(--accent-green)' }}>{stats?.attendanceRate || 0}%</strong>
          </div>
        </motion.div>

        {/* Today's Check-in Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Today's Session
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {stats?.todayCheckedIn ? (
                  <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaCheckCircle size={18} /> Checked In
                  </span>
                ) : (
                  <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaClock size={18} /> Not Checked In
                  </span>
                )}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: stats?.todayCheckedIn ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: stats?.todayCheckedIn ? '#22c55e' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaCalendarCheck />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Time on Floor:</span>
            <strong>{stats?.todayDurationMinutes ? `${stats.todayDurationMinutes} mins` : '—'}</strong>
          </div>
        </motion.div>

        {/* Active Workout Plan */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Routine
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.45rem', color: 'var(--text-primary)' }}>
                {stats?.activeWorkoutPlanTitle || 'Standard General Plan'}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.12)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              <FaDumbbell />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Exercises in Plan:</span>
            <strong style={{ color: '#06b6d4' }}>{stats?.todayExercisesCount || 0} Drills</strong>
          </div>
        </motion.div>

        {/* Body Metrics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={CARD_BASE}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Latest Weight
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {stats?.latestWeightKg ? `${stats.latestWeightKg} kg` : '—'}
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
              <FaChartLine />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Body Fat:</span>
            <strong>{stats?.latestBodyFatPct ? `${stats.latestBodyFatPct}%` : 'Not recorded'}</strong>
          </div>
        </motion.div>
      </div>

      {/* Two Columns: Trainer & Quick Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Personal Trainer Section */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <FaUserTie style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Assigned Personal Trainer</h3>
          </div>

          {stats?.assignedTrainerName ? (
            <div style={{
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  <FaUserTie />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{stats.assignedTrainerName}</h4>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Specialization: <strong style={{ color: 'var(--text-primary)' }}>{stats.assignedTrainerSpecialization || 'General Fitness'}</strong>
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                <Link to="/student/trainer-requests" className="btn btn-secondary" style={{ fontSize: '0.85rem', width: '100%', textAlign: 'center' }}>
                  Request Consultation / Change
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              textAlign: 'center',
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                You do not have a dedicated personal trainer assigned to your profile yet.
              </p>
              <Link to="/student/trainer-requests" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                Find & Request Trainer
              </Link>
            </div>
          )}
        </div>

        {/* Quick Access Grid */}
        <div style={CARD_BASE}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem' }}>Quick Actions & Portals</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link
              to="/student/membership"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <FaIdCard style={{ color: 'var(--accent-orange)' }} /> Membership
            </Link>

            <Link
              to="/student/payments"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <FaCreditCard style={{ color: '#22c55e' }} /> Payments
            </Link>

            <Link
              to="/student/progress"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <FaChartLine style={{ color: '#a855f7' }} /> Log Progress
            </Link>

            <Link
              to="/student/complaints"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <FaExclamationCircle style={{ color: '#f59e0b' }} /> Support / Grievances
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
