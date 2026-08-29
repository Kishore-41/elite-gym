import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDumbbell, FaSignInAlt, FaSignOutAlt, FaUserGraduate, FaUserShield, FaUser, FaIdCard, FaLayerGroup, FaListAlt, FaCalendarAlt, FaUsers, FaClipboardList, FaChartLine, FaWallet, FaCalendarCheck, FaExclamationCircle, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (user.role === 'ROLE_TRAINER') return '/trainer/dashboard';
    return '/student/dashboard';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ROLE_ADMIN') {
      return <span className="badge badge-green"><FaUserShield size={10} /> ADMIN</span>;
    }
    if (user.role === 'ROLE_TRAINER') {
      return <span className="badge badge-cyan"><FaDumbbell size={10} /> TRAINER</span>;
    }
    return <span className="badge badge-orange"><FaUserGraduate size={10} /> STUDENT</span>;
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 2rem',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(9, 12, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-orange), #e05e00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <FaDumbbell size={20} />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            ELITE<span style={{ color: 'var(--accent-orange)' }}>GYM</span>
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s' }}>
          Home
        </Link>
        <Link to="/membership-plans" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s' }}>
          Plans
        </Link>

        {isAuthenticated && user?.role === 'ROLE_STUDENT' && (
          <>
            <Link to="/student/membership" style={{ color: 'var(--accent-orange)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaIdCard /> My Membership
            </Link>
            <Link to="/student/payments" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaWallet /> Payments
            </Link>
            <Link to="/student/attendance" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaCalendarCheck /> Attendance
            </Link>
            <Link to="/student/trainer-requests" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaListAlt /> Trainers
            </Link>
            <Link to="/student/workouts" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaCalendarAlt /> Workouts
            </Link>
            <Link to="/student/progress" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaChartLine /> Progress
            </Link>
            <Link to="/student/complaints" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaExclamationCircle /> Grievances
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'ROLE_TRAINER' && (
          <>
            <Link to="/trainer/requests" style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaClipboardList /> Requests
            </Link>
            <Link to="/trainer/workout-plans" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaDumbbell /> Plans
            </Link>
            <Link to="/trainer/students" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaUsers /> Students
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'ROLE_ADMIN' && (
          <>
            <Link to="/admin/memberships" style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FaLayerGroup /> Manage Memberships
            </Link>
            <Link to="/admin/payments" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaWallet /> Ledger
            </Link>
            <Link to="/admin/complaints" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <FaShieldAlt /> Grievances
            </Link>
          </>
        )}

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
            <NotificationBell />
            <Link
              to={getDashboardLink()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--bg-glass-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}>
                <FaUser />
              </div>
              <span>{user?.firstName || user?.username}</span>
              {getRoleBadge()}
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
              title="Logout"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <FaSignInAlt /> Sign In
            </Link>
            <Link to="/register/student" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Join Gym
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
