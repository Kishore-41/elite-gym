import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaDumbbell, FaSignInAlt, FaSignOutAlt, FaUserGraduate, FaUserShield, FaUser, 
  FaIdCard, FaLayerGroup, FaListAlt, FaCalendarAlt, FaUsers, FaClipboardList, 
  FaChartLine, FaWallet, FaCalendarCheck, FaExclamationCircle, FaShieldAlt,
  FaBars, FaTimes, FaTicketAlt, FaWater, FaSpa, FaClock
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 2rem',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(10, 10, 14, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)',
        }}>
          <FaDumbbell size={22} />
        </div>
        <div>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#F3F4F6' }}>
            ELITE<span style={{ color: '#F59E0B' }}>GYM</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.65rem', color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '-3px' }}>
            Commercial Athletic Club
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <div style={{ display: 'none', gap: '1.25rem', alignItems: 'center' }} className="nav-desktop">
        <style>{`
          @media (min-width: 1024px) {
            .nav-desktop { display: flex !important; }
            .nav-mobile-btn { display: none !important; }
          }
        `}</style>
        <Link to="/" style={{ color: isActive('/') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          Home
        </Link>
        <Link to="/facilities" style={{ color: isActive('/facilities') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/facilities') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          Facilities
        </Link>
        <Link to="/schedule" style={{ color: isActive('/schedule') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/schedule') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          Schedule
        </Link>
        <Link to="/trainers" style={{ color: isActive('/trainers') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/trainers') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          Trainers
        </Link>
        <Link to="/membership-plans" style={{ color: isActive('/membership-plans') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/membership-plans') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          Plans
        </Link>
        <Link to="/gallery" style={{ color: isActive('/gallery') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/gallery') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          Gallery
        </Link>
        <Link to="/about" style={{ color: isActive('/about') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/about') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          About
        </Link>
        <Link to="/faq" style={{ color: isActive('/faq') ? '#F59E0B' : '#9CA3AF', fontWeight: isActive('/faq') ? 600 : 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>
          FAQ
        </Link>
        <Link to="/free-pass" style={{ 
          color: '#F59E0B', 
          fontWeight: 700, 
          fontSize: '0.88rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.35rem',
          padding: '0.3rem 0.75rem',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '20px'
        }}>
          <FaTicketAlt size={12} /> Free Pass
        </Link>

        {/* Member / Role Shortcut Links */}
        {isAuthenticated && user?.role === 'ROLE_STUDENT' && (
          <Link to="/student/amenity-bookings" style={{ color: '#00E5FF', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FaSpa size={13} /> Book Amenity
          </Link>
        )}

        {isAuthenticated && user?.role === 'ROLE_TRAINER' && (
          <Link to="/trainer/requests" style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FaClipboardList /> Requests
          </Link>
        )}

        {isAuthenticated && user?.role === 'ROLE_ADMIN' && (
          <Link to="/admin/cms" style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FaLayerGroup /> CMS Portal
          </Link>
        )}

        {/* User Auth Info & CTA */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginLeft: '0.5rem' }}>
            <NotificationBell />
            <Link
              to={getDashboardLink()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-full)',
                color: '#F3F4F6',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}>
                <FaUser />
              </div>
              <span style={{ fontWeight: 600 }}>{user?.firstName || user?.username}</span>
              {getRoleBadge()}
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
              title="Logout"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              <FaSignInAlt /> Sign In
            </Link>
            <Link to="/membership-plans" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
              Join Club
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="nav-mobile-btn"
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#F3F4F6',
          padding: '8px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#0D0D14',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 999,
          }}
        >
          <Link onClick={() => setMobileMenuOpen(false)} to="/" style={{ color: '#F3F4F6', fontWeight: 600 }}>Home</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/facilities" style={{ color: '#9CA3AF' }}>Facilities & Amenities</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/schedule" style={{ color: '#9CA3AF' }}>Class Timetable</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/trainers" style={{ color: '#9CA3AF' }}>Certified Trainers</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/membership-plans" style={{ color: '#F59E0B', fontWeight: 600 }}>Membership Plans</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/free-pass" style={{ color: '#F59E0B' }}>Claim 1-Day Guest Pass</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/gallery" style={{ color: '#9CA3AF' }}>Media Gallery</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/about" style={{ color: '#9CA3AF' }}>About Club</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/faq" style={{ color: '#9CA3AF' }}>FAQ & Support</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/contact" style={{ color: '#9CA3AF' }}>Contact & Location</Link>

          {isAuthenticated ? (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link onClick={() => setMobileMenuOpen(false)} to={getDashboardLink()} style={{ color: '#00E5FF', fontWeight: 600 }}>
                Go to Dashboard ({user?.firstName})
              </Link>
              <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="btn btn-secondary">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.75rem' }}>
              <Link onClick={() => setMobileMenuOpen(false)} to="/login" className="btn btn-secondary" style={{ flex: 1 }}>Sign In</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/membership-plans" className="btn btn-primary" style={{ flex: 1 }}>Join Now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
