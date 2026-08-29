import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaDumbbell, FaCheckCircle } from 'react-icons/fa';

const TrainerHomePlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '700px' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(0, 229, 255, 0.15)',
          color: 'var(--accent-cyan)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(0, 229, 255, 0.3)',
        }}>
          <FaDumbbell />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome, Coach {user?.fullName || user?.username}!
        </h2>
        <p style={{ color: 'var(--accent-green)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FaCheckCircle /> Authenticated as ROLE_TRAINER
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Your trainer profile is active with ID: <strong>#{user?.profileId || 'N/A'}</strong>.
          <br />
          Full Trainer Roster and Workout Plan Builder will be enabled in upcoming phases.
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
            <div><strong>Role:</strong> Certified Trainer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerHomePlaceholder;
