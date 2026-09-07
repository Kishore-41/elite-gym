import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaShieldAlt } from 'react-icons/fa';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: '90%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          let bg = 'rgba(19, 19, 26, 0.95)';
          let borderColor = 'rgba(255, 255, 255, 0.12)';
          let icon = <FaInfoCircle color="var(--accent-cyan)" size={18} />;
          let barColor = 'var(--accent-cyan)';

          if (t.type === 'success') {
            borderColor = 'rgba(0, 230, 118, 0.4)';
            icon = <FaCheckCircle color="var(--accent-green)" size={18} />;
            barColor = 'var(--accent-green)';
          } else if (t.type === 'error') {
            borderColor = 'rgba(239, 68, 68, 0.5)';
            icon = <FaExclamationCircle color="#EF4444" size={18} />;
            barColor = '#EF4444';
          } else if (t.type === 'warning') {
            borderColor = 'rgba(245, 158, 11, 0.5)';
            icon = <FaShieldAlt color="var(--accent-orange)" size={18} />;
            barColor = 'var(--accent-orange)';
          }

          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                background: bg,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#F3F4F6',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'slideIn 0.25s ease-out forwards',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: barColor,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '0.9rem', lineHeight: '1.4', fontWeight: 500 }}>
                  {t.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.2s',
                }}
              >
                <FaTimes size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('SUCCESS:', msg),
      error: (msg) => console.error('ERROR:', msg),
      info: (msg) => console.log('INFO:', msg),
      warning: (msg) => console.warn('WARN:', msg),
    };
  }
  return context;
};
