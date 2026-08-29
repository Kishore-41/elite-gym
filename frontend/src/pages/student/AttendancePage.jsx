import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarCheck, FaClock, FaFire, FaCheckCircle, FaTimesCircle,
  FaExclamationCircle, FaSignInAlt, FaSignOutAlt, FaHistory, FaCalendarAlt,
  FaFilter, FaInfoCircle, FaCheck, FaTimes, FaUserCheck
} from 'react-icons/fa';
import { attendanceService } from '../../services/attendanceService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Present',
    badgeVariant: 'success',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    Icon: FaCheckCircle,
  },
  LATE: {
    label: 'Late',
    badgeVariant: 'warning',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    Icon: FaExclamationCircle,
  },
  ABSENT: {
    label: 'Absent',
    badgeVariant: 'danger',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    Icon: FaTimesCircle,
  },
};

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.25rem',
};

const fmtTime = (t) => {
  if (!t) return '—';
  const parts = String(t).split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const mins = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${mins} ${ampm}`;
  }
  return String(t);
};

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(d);
  }
};

const AttendancePage = () => {
  const [history, setHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check-in modal
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [historyRes, todayRes, statsRes] = await Promise.all([
        attendanceService.getMyAttendance(),
        attendanceService.getMyToday(),
        attendanceService.getMyStats(),
      ]);

      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setTodayRecord(todayRes.data || null);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      setError(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickCheckIn = async (notes = '') => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await attendanceService.checkIn({ notes });
      setSuccessMsg(res.message || 'Check-in successful! Have a great workout!');
      setIsCheckInModalOpen(false);
      setCheckInNotes('');
      await loadData();
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await attendanceService.checkOut();
      setSuccessMsg(res.message || 'Check-out successful! Great job today!');
      await loadData();
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err.response?.data?.message || 'Check-out failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (selectedStatusFilter === 'ALL') return history;
    return history.filter((rec) => rec.status === selectedStatusFilter);
  }, [history, selectedStatusFilter]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Loader text="Loading your attendance records..." />
      </div>
    );
  }

  const isCheckedInToday = Boolean(todayRecord && todayRecord.checkInTime);
  const isCheckedOutToday = Boolean(todayRecord && todayRecord.checkOutTime);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaCalendarCheck style={{ color: 'var(--accent-orange)' }} /> Attendance Tracking
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Track your daily gym visits, session durations, and maintain your workout streak.
          </p>
        </div>

        <div>
          {!isCheckedInToday ? (
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="btn btn-primary"
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <FaSignInAlt /> Check In Today
            </button>
          ) : !isCheckedOutToday ? (
            <button
              onClick={handleCheckOut}
              className="btn"
              disabled={actionLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                cursor: 'pointer',
              }}
            >
              <FaSignOutAlt /> Check Out
            </button>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-full)',
              color: '#22c55e',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <FaCheckCircle /> Completed Today
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <FaTimesCircle /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <FaCheckCircle /> {successMsg}
        </div>
      )}

      {/* Today's Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...CARD_BASE,
          marginBottom: '2rem',
          background: isCheckedInToday
            ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.1), rgba(0, 229, 255, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          borderColor: isCheckedInToday ? 'rgba(255, 107, 0, 0.3)' : 'var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          padding: '1.5rem 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: isCheckedInToday ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: isCheckedInToday ? 'var(--accent-orange)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}>
            <FaClock />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Today's Status ({fmtDate(new Date().toISOString().slice(0, 10))})
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {!isCheckedInToday ? (
                <span style={{ color: 'var(--text-secondary)' }}>Not Checked In Yet</span>
              ) : isCheckedOutToday ? (
                <span style={{ color: '#22c55e' }}>Session Completed</span>
              ) : (
                <span style={{ color: 'var(--accent-orange)' }}>Active Gym Session</span>
              )}
            </div>
            {todayRecord && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>In: <strong>{fmtTime(todayRecord.checkInTime)}</strong></span>
                {todayRecord.checkOutTime && <span>Out: <strong>{fmtTime(todayRecord.checkOutTime)}</strong></span>}
                {todayRecord.durationMinutes > 0 && <span>Duration: <strong>{todayRecord.durationMinutes} mins</strong></span>}
                {todayRecord.status && (
                  <span style={{
                    color: STATUS_CONFIG[todayRecord.status]?.color || '#fff',
                    fontWeight: 600
                  }}>
                    [{STATUS_CONFIG[todayRecord.status]?.label || todayRecord.status}]
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          {!isCheckedInToday && (
            <button
              onClick={() => handleQuickCheckIn()}
              className="btn btn-primary"
              disabled={actionLoading}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <FaSignInAlt /> Quick Check In
            </button>
          )}
          {isCheckedInToday && !isCheckedOutToday && (
            <button
              onClick={handleCheckOut}
              className="btn"
              disabled={actionLoading}
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              <FaSignOutAlt /> Check Out
            </button>
          )}
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Streak Card */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Streak</span>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
              <FaFire />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
            {stats?.currentStreak || 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>days</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Consecutive workout days
          </div>
        </div>

        {/* Total Sessions */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Sessions</span>
            <div style={{ color: 'var(--accent-orange)', fontSize: '1.2rem' }}>
              <FaCalendarAlt />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.totalDays || history.length} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>visits</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Lifetime attendance records
          </div>
        </div>

        {/* Present Rate */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Attendance Rate</span>
            <div style={{ color: '#22c55e', fontSize: '1.2rem' }}>
              <FaCheckCircle />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>
            {stats?.presentRate !== undefined ? `${stats.presentRate}%` : '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Present / on-time consistency
          </div>
        </div>

        {/* Present vs Late */}
        <div style={CARD_BASE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status Breakdown</span>
            <div style={{ color: '#00e5ff', fontSize: '1.2rem' }}>
              <FaUserCheck />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats?.presentCount ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On-time</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats?.lateCount ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Late (&gt;9am)</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444' }}>{stats?.absentCount ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Absent</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Log Section */}
      <div style={{ ...CARD_BASE, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaHistory style={{ color: 'var(--accent-orange)' }} /> Attendance History
          </h2>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaFilter size={11} /> Filter:
            </span>
            {['ALL', 'PRESENT', 'LATE', 'ABSENT'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setSelectedStatusFilter(statusKey)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedStatusFilter === statusKey ? '1px solid var(--accent-orange)' : '1px solid var(--border-glass)',
                  background: selectedStatusFilter === statusKey ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedStatusFilter === statusKey ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  fontWeight: selectedStatusFilter === statusKey ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {statusKey === 'ALL' ? 'All Records' : STATUS_CONFIG[statusKey]?.label || statusKey}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description={selectedStatusFilter === 'ALL' ? 'You have not logged any gym sessions yet. Start today!' : `No records found with status ${selectedStatusFilter}.`}
            icon={<FaCalendarCheck size={40} />}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Check In</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Check Out</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Notes / Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((rec) => {
                  const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.PRESENT;
                  const Icon = cfg.Icon;
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        {fmtDate(rec.date)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {fmtTime(rec.checkInTime)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {fmtTime(rec.checkOutTime)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {rec.durationMinutes > 0 ? (
                          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                            {rec.durationMinutes} mins
                          </span>
                        ) : rec.checkOutTime ? (
                          '< 1 min'
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>In progress</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                        }}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {rec.markedByAdminName ? (
                          <span title={`Marked by admin: ${rec.markedByAdminName}`} style={{ color: 'var(--accent-green)' }}>
                            Admin: {rec.markedByAdminName}
                          </span>
                        ) : rec.notes ? (
                          rec.notes
                        ) : (
                          'Self Check-in'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-In Modal */}
      {isCheckInModalOpen && (
        <Modal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          title="Gym Check-In"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Logging your attendance for today (<strong>{fmtDate(new Date().toISOString().slice(0, 10))}</strong>). Check-ins after 9:00 AM are automatically marked as Late.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Session Notes (Optional)
              </label>
              <textarea
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                placeholder="e.g., Leg day workout, Morning cardio session..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(false)}
                className="btn btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleQuickCheckIn(checkInNotes)}
                className="btn btn-primary"
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaCheck /> Confirm Check-In
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendancePage;
