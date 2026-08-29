import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaUserShield, FaCheckCircle } from 'react-icons/fa';

const AdminHomePlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '700px' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(0, 230, 118, 0.15)',
          color: 'var(--accent-green)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(0, 230, 118, 0.3)',
        }}>
          <FaUserShield />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome, Admin {user?.fullName || user?.username}!
        </h2>
        <p style={{ color: 'var(--accent-green)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FaCheckCircle /> Authenticated as ROLE_ADMIN
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Full Administrator analytics, members management, financial ledger, and grievances triage will be activated in upcoming phases.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          textAlign: 'left',
        }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Administrator Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Username:</strong> @{user?.username}</div>
            <div><strong>Access Level:</strong> Super Admin</div>
            <div><strong>Permissions:</strong> Full System Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePlaceholder;
