import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaUserGraduate, FaCheckCircle, FaLock } from 'react-icons/fa';

const StudentHomePlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '700px' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(255, 107, 0, 0.15)',
          color: 'var(--accent-orange)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 107, 0, 0.3)',
        }}>
          <FaUserGraduate />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome, {user?.fullName || user?.username}!
        </h2>
        <p style={{ color: 'var(--accent-green)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FaCheckCircle /> Authenticated as ROLE_STUDENT
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Your student profile has been initialized with ID: <strong>#{user?.profileId || 'N/A'}</strong>.
          <br />
          Full Student Dashboard & Workouts will be enabled in upcoming phases.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          textAlign: 'left',
        }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Account Metadata
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Username:</strong> @{user?.username}</div>
            <div><strong>Profile ID:</strong> {user?.profileId}</div>
            <div><strong>Status:</strong> Active Member</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHomePlaceholder;
