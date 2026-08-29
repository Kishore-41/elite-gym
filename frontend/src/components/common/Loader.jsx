import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loader = ({ message = 'Loading...', inline = false }) => {
  if (inline) {
    return (
      <FaSpinner style={{
        display: 'inline-block',
        fontSize: '0.9rem',
        animation: 'spin 1s linear infinite',
        color: 'var(--accent-orange)',
      }} />
    );
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      color: 'var(--accent-orange)',
    }}>
      <FaSpinner style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
