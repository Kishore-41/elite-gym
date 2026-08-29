import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserShield, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const UnauthorizedPage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 140px)',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ color: 'var(--accent-red)', fontSize: '3.5rem', marginBottom: '1rem' }}>
        <FaUserShield />
      </div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>403 - Access Denied</h1>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        You do not have permission to view this section
      </h2>
      <p style={{ maxWidth: '480px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Your account ({user?.role || 'Guest'}) does not have the required security privileges to access this page.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <FaHome /> Return to Home
        </Link>
        {user && (
          <button onClick={logout} className="btn btn-secondary">
            <FaSignOutAlt /> Switch Account / Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
