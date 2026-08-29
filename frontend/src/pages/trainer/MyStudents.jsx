import React, { useState, useEffect } from 'react';
import { FaUsers, FaEnvelope, FaPhone, FaHeartbeat, FaRulerVertical, FaWeightHanging } from 'react-icons/fa';
import { trainerService } from '../../services/trainerService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await trainerService.getAssignedStudents();
      if (res.success) setStudents(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load assigned students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1150px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
          <FaUsers /> My Roster
        </span>
        <h1 style={{ fontSize: '2rem' }}>Assigned Students ({students.length})</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          All students currently assigned to you for personal training.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading student roster..." />
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadStudents} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No assigned students yet"
          message="Your roster is empty. Approve trainer assignment requests from students to start building your client list."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {students.map((s, idx) => (
            <div
              key={s.studentId}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.3), rgba(255, 107, 0, 0.1))',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-orange)',
                }}>
                  {s.firstName?.charAt(0) || '?'}{s.lastName?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{s.fullName}</h3>
                  {s.fitnessGoal && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', margin: '0.15rem 0 0 0' }}>
                      Goal: {s.fitnessGoal}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaEnvelope style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{s.email}</span>
                </div>
                {s.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaPhone style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{s.phone}</span>
                  </div>
                )}
                {s.heightCm && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaRulerVertical style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{s.heightCm} cm</span>
                  </div>
                )}
                {s.weightKg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaWeightHanging style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{s.weightKg} kg</span>
                  </div>
                )}
                {s.bloodGroup && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaHeartbeat style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Blood: {s.bloodGroup}</span>
                  </div>
                )}
              </div>

              {(s.medicalNotes || s.emergencyContact) && (
                <div style={{
                  marginTop: '0.25rem', padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)', fontSize: '0.8rem',
                }}>
                  {s.medicalNotes && (
                    <div style={{ marginBottom: s.emergencyContact ? '0.35rem' : 0 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Medical: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.medicalNotes}</span>
                    </div>
                  )}
                  {s.emergencyContact && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Emergency: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.emergencyContact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudents;
