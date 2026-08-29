import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-glass)',
      padding: '2rem 1.5rem',
      background: 'rgba(9, 12, 16, 0.95)',
      marginTop: 'auto',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem',
    }}>
      <div className="container">
        <p>© {new Date().getFullYear()} Elite Gym Management System. All rights reserved.</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Engineered with React, Spring Boot, MySQL & Spring Security.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
