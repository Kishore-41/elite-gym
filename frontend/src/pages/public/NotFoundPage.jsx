import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
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
      <div style={{ color: 'var(--accent-orange)', fontSize: '3.5rem', marginBottom: '1rem' }}>
        <FaExclamationTriangle />
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ maxWidth: '400px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <FaHome /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
