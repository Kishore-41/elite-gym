import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({ title = 'No records found', message = 'There are no items to display at this time.', action = null }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3.5rem 1.5rem',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px dashed var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{
        fontSize: '2.5rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
      }}>
        <FaInbox />
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', marginBottom: action ? '1.5rem' : '0' }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
