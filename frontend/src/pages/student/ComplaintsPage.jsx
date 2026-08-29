import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaExclamationCircle, FaPlus, FaCheckCircle, FaClock, FaTimesCircle,
  FaFilter, FaComments, FaCheck, FaTimes, FaShieldAlt, FaInfoCircle,
  FaTools, FaBuilding, FaUserTie, FaCreditCard, FaQuestionCircle
} from 'react-icons/fa';
import { complaintService } from '../../services/complaintService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const CATEGORY_MAP = {
  EQUIPMENT: { label: 'Equipment', Icon: FaTools, color: '#f59e0b' },
  FACILITY: { label: 'Facility', Icon: FaBuilding, color: '#3b82f6' },
  TRAINER: { label: 'Trainer', Icon: FaUserTie, color: '#00e5ff' },
  BILLING: { label: 'Billing', Icon: FaCreditCard, color: '#a855f7' },
  OTHER: { label: 'Other', Icon: FaQuestionCircle, color: '#9ca3af' },
};

const PRIORITY_MAP = {
  LOW: { label: 'Low', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)' },
  MEDIUM: { label: 'Medium', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  HIGH: { label: 'High', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  CRITICAL: { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

const STATUS_MAP = {
  OPEN: { label: 'Open', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', Icon: FaClock },
  IN_PROGRESS: { label: 'In Progress', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', Icon: FaClock },
  RESOLVED: { label: 'Resolved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', Icon: FaCheckCircle },
  CLOSED: { label: 'Closed', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', Icon: FaTimesCircle },
};

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.25rem',
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
};

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form State
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'EQUIPMENT',
    priority: 'MEDIUM',
  });

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getMyComplaints();
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Please fill in both subject and description.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');
      const res = await complaintService.createComplaint(form);
      setSuccessMsg(res.message || 'Support ticket submitted successfully!');
      setIsCreateModalOpen(false);
      setForm({ subject: '', description: '', category: 'EQUIPMENT', priority: 'MEDIUM' });
      await loadComplaints();
    } catch (err) {
      console.error('Failed to create complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
      return true;
    });
  }, [complaints, selectedStatus, selectedCategory]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    return { total, open, resolved };
  }, [complaints]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Loader text="Loading your support tickets..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaExclamationCircle style={{ color: 'var(--accent-orange)' }} /> Support & Grievances
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Raise issues regarding gym facilities, equipment, trainers, or billing directly to gym administrators.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
        >
          <FaPlus /> Raise New Ticket
        </button>
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

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tickets</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>{stats.total}</div>
        </div>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active / In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#f59e0b' }}>{stats.open}</div>
        </div>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Resolved Tickets</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#22c55e' }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Filter and Content */}
      <div style={{ ...CARD_BASE, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><FaFilter size={11} /> Status:</span>
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedStatus === st ? '1px solid var(--accent-orange)' : '1px solid var(--border-glass)',
                  background: selectedStatus === st ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedStatus === st ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'All' : STATUS_MAP[st]?.label || st}
              </button>
            ))}
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <EmptyState
            title="No support tickets found"
            description="You have not submitted any complaints matching this filter."
            icon={<FaExclamationCircle size={40} />}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredComplaints.map((c) => {
              const cat = CATEGORY_MAP[c.category] || CATEGORY_MAP.OTHER;
              const prio = PRIORITY_MAP[c.priority] || PRIORITY_MAP.MEDIUM;
              const stat = STATUS_MAP[c.status] || STATUS_MAP.OPEN;
              const CatIcon = cat.Icon;
              const StatIcon = stat.Icon;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: cat.color,
                        fontWeight: 600,
                      }}>
                        <CatIcon size={12} /> {cat.label}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: prio.bg,
                        color: prio.color,
                        fontWeight: 600,
                      }}>
                        {prio.label} Priority
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        background: stat.bg,
                        color: stat.color,
                        fontWeight: 600,
                      }}>
                        <StatIcon size={11} /> {stat.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {fmtDateTime(c.createdAt)}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {c.subject}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>

                  {c.adminResponse && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                    }}>
                      <strong style={{ color: '#22c55e' }}>Admin Response ({c.resolvedByAdminName || 'Staff'}):</strong> {c.adminResponse}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Submit Support Ticket"
        >
          <form onSubmit={handleCreateSubmit} style={{ padding: '0.5rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Subject *
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#161b22',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="FACILITY">Facility & Cleanliness</option>
                  <option value="TRAINER">Trainer / Staff</option>
                  <option value="BILLING">Billing & Payments</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#161b22',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide detailed information regarding the issue..."
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaCheck /> Submit Ticket
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Ticket Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket #${selectedComplaint.id}: ${selectedComplaint.subject}`}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.8rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: CATEGORY_MAP[selectedComplaint.category]?.color ? 'rgba(255, 255, 255, 0.05)' : '',
                color: CATEGORY_MAP[selectedComplaint.category]?.color || '#fff',
                fontWeight: 600,
              }}>
                Category: {CATEGORY_MAP[selectedComplaint.category]?.label || selectedComplaint.category}
              </span>
              <span style={{
                fontSize: '0.8rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: PRIORITY_MAP[selectedComplaint.priority]?.bg,
                color: PRIORITY_MAP[selectedComplaint.priority]?.color,
                fontWeight: 600,
              }}>
                Priority: {selectedComplaint.priority}
              </span>
              <span style={{
                fontSize: '0.8rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: STATUS_MAP[selectedComplaint.status]?.bg,
                color: STATUS_MAP[selectedComplaint.status]?.color,
                fontWeight: 600,
              }}>
                Status: {STATUS_MAP[selectedComplaint.status]?.label || selectedComplaint.status}
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Description</h4>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px' }}>
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.adminResponse ? (
              <div style={{ marginBottom: '1.25rem', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#22c55e', marginBottom: '0.35rem' }}>
                  Admin Resolution Notes ({selectedComplaint.resolvedByAdminName || 'Staff'})
                </h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {selectedComplaint.adminResponse}
                </p>
                {selectedComplaint.resolvedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Resolved on: {fmtDateTime(selectedComplaint.resolvedAt)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                Awaiting administrative review.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintsPage;
