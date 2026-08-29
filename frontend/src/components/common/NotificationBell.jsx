import React, { useEffect, useRef, useState } from 'react';
import { FaBell, FaCheckDouble, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TYPE_COLORS = {
  MEMBERSHIP: '#22c55e',
  PAYMENT: '#3b82f6',
  WORKOUT: '#06b6d4',
  ATTENDANCE: '#a855f7',
  COMPLAINT: '#f59e0b',
  SYSTEM: '#ef4444',
};

const TYPE_LABEL = {
  MEMBERSHIP: 'Membership',
  PAYMENT: 'Payment',
  WORKOUT: 'Workout',
  ATTENDANCE: 'Attendance',
  COMPLAINT: 'Complaint',
  SYSTEM: 'System',
};

const formatTime = (createdAt) => {
  if (!createdAt) return '';
  try {
    const d = new Date(createdAt);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  } catch {
    return '';
  }
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  const refreshData = async () => {
    if (!isAuthenticated) return;
    try {
      const [unreadRes, listRes] = await Promise.all([
        notificationService.countUnread(),
        notificationService.getMyNotifications(),
      ]);
      setUnreadCount(unreadRes?.data?.count ?? 0);
      setNotifications(listRes?.data ?? []);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleMarkAsRead = async (note) => {
    if (note.isRead) return;
    try {
      await notificationService.markAsRead(note.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const handleClick = (note) => {
    handleMarkAsRead(note);
    setOpen(false);
    if (note.actionLink) {
      navigate(note.actionLink);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={bellRef}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) refreshData();
        }}
        aria-label="Notifications"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '1px solid var(--border-glass)',
          background: 'rgba(255, 255, 255, 0.04)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
      >
        <FaBell size={16} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              borderRadius: '9px',
              background: 'var(--accent-orange)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px rgba(9,12,16,0.85)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            maxWidth: 'calc(100vw - 2rem)',
            background: 'rgba(14, 18, 24, 0.98)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={handleMarkAll}
                disabled={unreadCount === 0}
                title="Mark all as read"
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'transparent',
                  color: unreadCount === 0 ? 'var(--text-muted)' : 'var(--accent-cyan)',
                  cursor: unreadCount === 0 ? 'default' : 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <FaCheckDouble /> All read
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes size={12} />
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: '420px',
              overflowY: 'auto',
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                <FaBell
                  style={{
                    fontSize: '2rem',
                    opacity: 0.4,
                    marginBottom: '0.75rem',
                    display: 'block',
                    marginInline: 'auto',
                  }}
                />
                No notifications yet.
              </div>
            ) : (
              notifications.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleClick(note)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: note.actionLink ? 'pointer' : 'default',
                    background: note.isRead ? 'transparent' : 'rgba(249,115,22,0.06)',
                    display: 'flex',
                    gap: '0.75rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = note.isRead
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(249,115,22,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = note.isRead
                      ? 'transparent'
                      : 'rgba(249,115,22,0.06)';
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      minWidth: '8px',
                      height: '8px',
                      marginTop: '8px',
                      borderRadius: '50%',
                      background: TYPE_COLORS[note.type] || '#64748b',
                      boxShadow: note.isRead ? 'none' : `0 0 10px ${TYPE_COLORS[note.type] || '#64748b'}`,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.2rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          color: TYPE_COLORS[note.type] || '#64748b',
                          textTransform: 'uppercase',
                        }}
                      >
                        {TYPE_LABEL[note.type] || note.type}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {formatTime(note.createdAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: note.isRead ? 500 : 700,
                        color: 'var(--text-primary)',
                        marginBottom: '0.2rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {note.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {note.message}
                      {note.actionLink && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginLeft: '4px',
                            color: 'var(--accent-cyan)',
                            fontWeight: 500,
                          }}
                        >
                          View <FaExternalLinkAlt size={8} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
