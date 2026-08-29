import React from 'react';

const Badge = ({ status, variant }) => {
  let styleClass = 'badge-orange';
  let label = status;

  if (status === 'ACTIVE' || variant === 'green' || status === 'SUCCESS') {
    styleClass = 'badge-green';
  } else if (status === 'EXPIRED' || status === 'CANCELLED' || variant === 'red' || status === 'FAILED') {
    styleClass = 'badge-red';
  } else if (status === 'PENDING' || variant === 'cyan') {
    styleClass = 'badge-cyan';
  }

  return (
    <span
      className={`badge ${styleClass}`}
      style={styleClass === 'badge-red' ? {
        background: 'rgba(255, 23, 68, 0.15)',
        color: 'var(--accent-red)',
        border: '1px solid rgba(255, 23, 68, 0.3)',
      } : {}}
    >
      {label}
    </span>
  );
};

export default Badge;
