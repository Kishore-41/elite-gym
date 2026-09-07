import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaExclamationCircle, FaCheckCircle, FaClock, FaTimesCircle,
  FaFilter, FaComments, FaCheck, FaTimes, FaShieldAlt,
  FaTools, FaBuilding, FaUserTie, FaCreditCard, FaQuestionCircle,
  FaReply, FaUser
} from 'react-icons/fa';
import { complaintService } from '../../services/complaintService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const CATEGORY_MAP = {
  FACILITY_MAINTENANCE: { label: 'Facility Maintenance', Icon: FaBuilding, color: '#3b82f6' },
  EQUIPMENT_ISSUE: { label: 'Equipment Issue', Icon: FaTools, color: '#f59e0b' },
  STAFF_BEHAVIOR: { label: 'Staff Behavior', Icon: FaUserTie, color: '#ec4899' },
  TRAINER_MISCONDUCT: { label: 'Trainer Misconduct', Icon: FaUserTie, color: '#ef4444' },
  BILLING_ISSUE: { label: 'Billing Issue', Icon: FaCreditCard, color: '#a855f7' },
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
  SUBMITTED: { label: 'Submitted', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', Icon: FaClock },
  IN_REVIEW: { label: 'In Review', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', Icon: FaClock },
  OPEN: { label: 'Open', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', Icon: FaClock },
  IN_PROGRESS: { label: 'In Progress', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', Icon: FaClock },
  RESOLVED: { label: 'Resolved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', Icon: FaCheckCircle },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', Icon: FaTimesCircle },
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

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Response Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: 'IN_PROGRESS',
    adminResponse: '',
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getAllComplaints(
        statusFilter === 'ALL' ? undefined : statusFilter,
        categoryFilter === 'ALL' ? undefined : categoryFilter
      );
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
      setError(err.response?.data?.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleOpenRespond = (ticket) => {
    setSelectedTicket(ticket);
    setResponseForm({
      status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
      adminResponse: ticket.adminResponse || '',
    });
  };

  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');
      const res = await complaintService.respondToComplaint(selectedTicket.id, responseForm);
      setSuccessMsg(res.message || 'Ticket status and response updated successfully.');
      setSelectedTicket(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update complaint:', err);
      setError(err.response?.data?.message || 'Failed to update ticket response.');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === 'OPEN').length;
    const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    return { total, open, inProgress, resolved };
  }, [complaints]);

  if (loading && complaints.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Loader text="Loading all member complaints..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaShieldAlt style={{ color: 'var(--accent-orange)' }} /> Grievance Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
          Review, investigate, and resolve student support tickets, facility issues, and member grievances.
        </p>
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

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tickets</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>{stats.total}</div>
        </div>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Open / Pending</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#f59e0b' }}>{stats.open}</div>
        </div>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#00e5ff' }}>{stats.inProgress}</div>
        </div>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Resolved / Closed</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#22c55e' }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ ...CARD_BASE, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>All Member Complaints</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><FaFilter size={11} /> Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: '#161b22',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.85rem',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  background: '#161b22',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.85rem',
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="FACILITY_MAINTENANCE">Facility Maintenance</option>
                <option value="EQUIPMENT_ISSUE">Equipment Issue</option>
                <option value="STAFF_BEHAVIOR">Staff Behavior</option>
                <option value="TRAINER_MISCONDUCT">Trainer Misconduct</option>
                <option value="BILLING_ISSUE">Billing Issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description="No grievance tickets match the selected filters."
            icon={<FaCheckCircle size={40} />}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>ID & Member</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category & Priority</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Subject & Description</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const cat = CATEGORY_MAP[c.category] || CATEGORY_MAP.OTHER;
                  const prio = PRIORITY_MAP[c.priority] || PRIORITY_MAP.MEDIUM;
                  const stat = STATUS_MAP[c.status] || STATUS_MAP.OPEN;
                  const CatIcon = cat.Icon;
                  const StatIcon = stat.Icon;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          #{c.id} - {c.studentName || 'Student #' + c.studentId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.studentEmail || ''}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: cat.color,
                            fontWeight: 600,
                          }}>
                            <CatIcon size={10} /> {cat.label}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--radius-full)',
                            background: prio.bg,
                            color: prio.color,
                            fontWeight: 600,
                          }}>
                            {prio.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                          {c.subject}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.description}
                        </div>
                        {c.adminResponse && (
                          <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.3rem', fontStyle: 'italic' }}>
                            Response: {c.adminResponse}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {fmtDateTime(c.createdAt)}
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
                          background: stat.bg,
                          color: stat.color,
                        }}>
                          <StatIcon size={10} /> {stat.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenRespond(c)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <FaReply /> Respond
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Respond Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={`Respond to Ticket #${selectedTicket.id}`}
        >
          <form onSubmit={handleRespondSubmit} style={{ padding: '0.5rem 0' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedTicket.isAnonymous ? (
                    <span style={{ color: '#FF8800', fontWeight: 800, background: 'rgba(255, 107, 0, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                      Zero-Leak Anonymous Member ({selectedTicket.submitterName || 'ANON'})
                    </span>
                  ) : (
                    <span>
                      Member: <strong>{selectedTicket.submitterName || selectedTicket.studentName || 'Member'}</strong> ({selectedTicket.submitterEmail || selectedTicket.studentEmail || 'Protected'})
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', background: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                  Target: {selectedTicket.targetAudience || 'OWNER_ONLY'}
                </span>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {selectedTicket.subject}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                {selectedTicket.description}
              </div>

              {selectedTicket.attachmentUrls && selectedTicket.attachmentUrls.length > 0 && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.25rem' }}>Supporting Evidence:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedTicket.attachmentUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.75rem', color: '#FF8800', background: 'rgba(255,107,0,0.1)', padding: '2px 8px', borderRadius: '6px', textDecoration: 'none' }}
                      >
                        Evidence #{i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Update Status *
              </label>
              <select
                value={responseForm.status}
                onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
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
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved (Dispatches Resolution Email)</option>
                <option value="REJECTED">Rejected</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Admin Response / Resolution Notes
              </label>
              <textarea
                value={responseForm.adminResponse}
                onChange={(e) => setResponseForm({ ...responseForm, adminResponse: e.target.value })}
                placeholder="Provide resolution details or update note for the member..."
                rows={4}
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
                onClick={() => setSelectedTicket(null)}
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
                <FaCheck /> Save Response
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageComplaints;
