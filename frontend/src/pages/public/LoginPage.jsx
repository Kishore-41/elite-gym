import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaLock, FaSignInAlt, FaArrowLeft, FaUserGraduate, FaDumbbell, 
  FaExclamationCircle, FaUserCheck, FaTimes, FaArrowRight, FaIdCard 
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail.trim() || !formData.password) {
      setError('Please enter both your username/email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const userData = await login(formData.usernameOrEmail, formData.password);

      // Determine redirect path based on role
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (userData.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userData.role === 'ROLE_TRAINER') {
        navigate('/trainer/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 140px)',
      padding: '2.5rem 1.5rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.1))',
            color: '#F59E0B',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
          }}>
            <FaLock />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#F3F4F6' }}>
            Member & Staff Login
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
            Enter credentials to access Elite Athletic Club portal
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <FaExclamationCircle />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#D1D5DB' }}>
              Username or Email
            </label>
            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="e.g. member@elitegym.in or alex_fit"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: '#0A0A0E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                outline: 'none',
                fontSize: '0.9rem',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#D1D5DB' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: '#0A0A0E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                outline: 'none',
                fontSize: '0.9rem',
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <><FaSignInAlt /> Log In to Portal</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#F59E0B',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '0.9rem',
              }}
            >
              Sign up here
            </button>
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#9CA3AF', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaArrowLeft size={11} /> Back to Homepage
          </Link>
        </div>
      </motion.div>

      {/* Role-Selection Signup Modal */}
      {showRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#13131A',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              color: '#F3F4F6',
            }}
          >
            <button
              onClick={() => setShowRoleModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <FaTimes size={18} />
            </button>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#F3F4F6' }}>
              Select Registration Type
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Choose whether you are enrolling as a club member or applying as a certified coach.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Option 1: Member / Student Registration */}
              <div
                onClick={() => {
                  setShowRoleModal(false);
                  navigate('/membership-plans');
                }}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}
                >
                  <FaUserGraduate />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#F3F4F6' }}>
                    Member / Student Registration
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                    Browse membership plans, pools, spa & start training
                  </div>
                </div>
                <FaArrowRight color="#F59E0B" />
              </div>

              {/* Option 2: Trainer Application */}
              <div
                onClick={() => {
                  setShowRoleModal(false);
                  navigate('/trainer-register');
                }}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(0, 229, 255, 0.06)',
                  border: '1px solid rgba(0, 229, 255, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: 'rgba(0, 229, 255, 0.15)',
                    color: '#00E5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}
                >
                  <FaDumbbell />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#F3F4F6' }}>
                    Trainer Application / Registration
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                    Apply with CSCS / NASM / Olympic credentials
                  </div>
                </div>
                <FaArrowRight color="#00E5FF" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
