import React from 'react';
import Modal from './Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: isDestructive ? 'rgba(255, 23, 68, 0.15)' : 'rgba(255, 107, 0, 0.15)',
          color: isDestructive ? 'var(--accent-red)' : 'var(--accent-orange)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}>
          <FaExclamationTriangle />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDestructive ? 'btn btn-secondary' : 'btn btn-primary'}
            style={isDestructive ? { background: 'var(--accent-red)', color: '#fff', border: 'none' } : {}}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
