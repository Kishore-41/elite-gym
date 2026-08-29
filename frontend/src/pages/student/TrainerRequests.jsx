import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHandshake, FaPaperPlane, FaFilter, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { trainerService } from '../../services/trainerService';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const TrainerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    trainerId: '',
    requestType: 'TRAINER_ASSIGNMENT',
    requestNotes: '',
  });
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [requestsRes, trainersRes] = await Promise.all([
        trainerService.getMyTrainerRequests(statusFilter || null),
        trainerService.getAvailableTrainers(),
      ]);
      if (requestsRes.success) setRequests(requestsRes.data);
      if (trainersRes.success) {
        setTrainers(trainersRes.data);
        if (trainersRes.data.length > 0 && !form.trainerId) {
          setForm((f) => ({ ...f, trainerId: trainersRes.data[0].id }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load trainer requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.trainerId) {
      setModalError('Please select a trainer.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      const res = await trainerService.createTrainerRequest(
        parseInt(form.trainerId, 10),
        form.requestType,
        form.requestNotes
      );
      if (res.success) {
        showToast('Your trainer request has been submitted.');
        setIsModalOpen(false);
        setForm({ trainerId: trainers[0]?.id || '', requestType: 'TRAINER_ASSIGNMENT', requestNotes: '' });
        await loadData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTrainer = trainers.find((t) => String(t.id) === String(form.trainerId));

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
            <FaHandshake /> Trainer Requests
          </span>
          <h1 style={{ fontSize: '2rem' }}>Request a Trainer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse available trainers and submit consultation or assignment requests.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <FaPlus /> New Request
        </button>
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

      {/* Available Trainers */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>🏋️ Available Trainers</h3>
        {trainers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No trainers available at the moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {trainers.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '1.25rem', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem' }}>{t.fullName}</h4>
                  <span className="badge badge-green">AVAILABLE</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', marginBottom: '0.35rem' }}>
                  {t.specialization} • {t.experienceYears} yrs exp.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {t.email}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Students: {t.currentStudentCount}/{t.maxStudentCapacity}</span>
                  <button
                    onClick={() => {
                      setForm({ ...form, trainerId: t.id });
                      setIsModalOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Request
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FaFilter /> Filter Status:
        </span>
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`badge ${statusFilter === st ? 'badge-orange' : 'badge-cyan'}`}
            style={{ cursor: 'pointer', border: 'none', padding: '0.4rem 0.85rem' }}
          >
            {st || 'ALL'}
          </button>
        ))}
      </div>

      {/* Request History */}
      {loading ? (
        <Loader message="Loading trainer requests..." />
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadData} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          message="Browse the trainers above and submit your first request."
        />
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>#</th>
                <th style={{ padding: '0.75rem 1rem' }}>Trainer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Your Notes</th>
                <th style={{ padding: '0.75rem 1rem' }}>Response</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>#{r.id}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{r.trainerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.trainerSpecialization}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                    <span className="badge badge-cyan">{r.requestType}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '200px' }}>
                    {r.requestNotes || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '200px' }}>
                    {r.responseNotes || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}><Badge status={r.status} /></td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Trainer Request" maxWidth="520px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {modalError && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)', border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <FaExclamationTriangle />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Select Trainer *
            </label>
            <select
              value={form.trainerId}
              onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: '#151a24', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none',
              }}
              required
            >
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} — {t.specialization} ({t.currentStudentCount}/{t.maxStudentCapacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Request Type *
            </label>
            <select
              value={form.requestType}
              onChange={(e) => setForm({ ...form, requestType: e.target.value })}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: '#151a24', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="TRAINER_ASSIGNMENT">Trainer Assignment (Regular Coach)</option>
              <option value="WORKOUT_CHANGE">Workout Plan Change</option>
              <option value="SLOT_BOOKING">Time Slot Booking</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Notes (optional)
            </label>
            <textarea
              value={form.requestNotes}
              onChange={(e) => setForm({ ...form, requestNotes: e.target.value })}
              rows={3}
              placeholder="Tell the trainer about your goals or availability..."
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          {selectedTrainer && (
            <div style={{
              padding: '1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', fontSize: '0.85rem',
            }}>
              <strong>{selectedTrainer.fullName}</strong> — {selectedTrainer.specialization}
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {selectedTrainer.bio || 'No bio provided.'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || trainers.length === 0} style={{ gap: '0.5rem' }}>
              <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainerRequests;
