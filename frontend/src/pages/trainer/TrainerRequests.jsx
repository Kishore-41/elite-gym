import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserCheck, FaInbox, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';
import { trainerService } from '../../services/trainerService';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const TrainerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Response modal
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseStatus, setResponseStatus] = useState('APPROVED');
  const [responseNotes, setResponseNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState('');

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 4000);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await trainerService.getTrainerRequests(statusFilter || null);
      if (res.success) setRequests(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load trainer requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const openResponse = (req) => {
    setSelectedRequest(req);
    setResponseStatus('APPROVED');
    setResponseNotes('');
    setModalError('');
    setIsResponseModalOpen(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      setModalError('');
      const res = await trainerService.respondToRequest(selectedRequest.id, responseStatus, responseNotes);
      if (res.success) {
        showToast(`Request #${selectedRequest.id} ${responseStatus.toLowerCase()} successfully.`);
        setIsResponseModalOpen(false);
        await loadRequests();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to respond to request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1150px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
          <FaInbox /> Trainer Request Inbox
        </span>
        <h1 style={{ fontSize: '2rem' }}>Student Requests</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review assignment and consultation requests from students.
        </p>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.3)',
          color: 'var(--accent-green)', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          ✓ {toastMessage}
        </div>
      )}
      {toastError && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 23, 68, 0.15)', border: '1px solid rgba(255, 23, 68, 0.3)',
          color: 'var(--accent-red)', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          ⚠ {toastError}
        </div>
      )}

      {/* Status Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FaFilter /> Filter:
        </span>
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`badge ${statusFilter === st ? 'badge-orange' : 'badge-cyan'}`}
            style={{ cursor: 'pointer', border: 'none', padding: '0.4rem 0.85rem' }}
          >
            {st || 'ALL'} {st === 'PENDING' && `(${requests.filter((r) => r.status === 'PENDING').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Loading trainer requests..." />
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadRequests} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests found"
          message={statusFilter ? `No requests with status '${statusFilter}'.` : 'No trainer requests at this time.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{r.studentName}</h3>
                  <Badge status={r.status} />
                  <span className="badge badge-cyan">{r.requestType}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {r.studentEmail} • Requested {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.requestNotes && (
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
                    fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Student Notes:</strong> {r.requestNotes}
                  </div>
                )}
                {r.responseNotes && (
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                    background: r.status === 'APPROVED' ? 'rgba(0, 230, 118, 0.06)' : 'rgba(255, 23, 68, 0.06)',
                    border: `1px solid ${r.status === 'APPROVED' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 23, 68, 0.2)'}`,
                    fontSize: '0.875rem', color: 'var(--text-secondary)',
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Your Response:</strong> {r.responseNotes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {r.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => openResponse(r)}
                      className="btn btn-primary"
                      style={{ gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      <FaUserCheck /> Respond
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={async () => {
                          try {
                            await trainerService.respondToRequest(r.id, 'APPROVED', '');
                            showToast(`Request #${r.id} approved.`);
                            await loadRequests();
                          } catch (e) { showToast(e.response?.data?.message || 'Failed', true); }
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        title="Quick Approve"
                      >
                        <FaCheck style={{ color: 'var(--accent-green)' }} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await trainerService.respondToRequest(r.id, 'REJECTED', '');
                            showToast(`Request #${r.id} rejected.`);
                            await loadRequests();
                          } catch (e) { showToast(e.response?.data?.message || 'Failed', true); }
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        title="Quick Reject"
                      >
                        <FaTimes style={{ color: 'var(--accent-red)' }} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className={`badge ${r.status === 'APPROVED' ? 'badge-green' : 'badge-red'}`}>
                    Resolved
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="Respond to Request"
        maxWidth="480px"
      >
        <form onSubmit={handleSubmitResponse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedRequest && (
            <div style={{
              padding: '1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', fontSize: '0.875rem',
            }}>
              <div><strong>{selectedRequest.studentName}</strong> • {selectedRequest.studentEmail}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Type: {selectedRequest.requestType} • Notes: {selectedRequest.requestNotes || '—'}
              </div>
            </div>
          )}

          {modalError && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)', border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)', fontSize: '0.875rem',
            }}>
              {modalError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Decision
            </label>
            <select
              value={responseStatus}
              onChange={(e) => setResponseStatus(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: '#151a24', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="APPROVED">✅ APPROVE</option>
              <option value="REJECTED">❌ REJECT</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Response Notes (optional)
            </label>
            <textarea
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              rows={3}
              placeholder="Provide context to the student about your decision..."
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResponseModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Submit Response'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainerRequests;
