import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaArrowLeft, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const StudentRegisterPage = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    heightCm: '',
    weightKg: '',
    fitnessGoal: 'Muscle Hypertrophy',
    emergencyContact: '',
    bloodGroup: 'O+',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});

      const payload = {
        ...formData,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
      };

      await registerStudent(payload);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      }
      const errMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
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
      padding: '3rem 1.5rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '640px', padding: '2.5rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 107, 0, 0.05))',
            color: 'var(--accent-orange)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <FaUserGraduate />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Student Registration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create your member account to unlock workouts, tracking, and personal training
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)',
              border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <FaExclamationCircle />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Row 1: First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Alex"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${fieldErrors.firstName ? 'var(--accent-red)' : 'var(--border-glass)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
              {fieldErrors.firstName && <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{fieldErrors.firstName}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Smith"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${fieldErrors.lastName ? 'var(--accent-red)' : 'var(--border-glass)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
              {fieldErrors.lastName && <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{fieldErrors.lastName}</span>}
            </div>
          </div>

          {/* Row 2: Email & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${fieldErrors.email ? 'var(--accent-red)' : 'var(--border-glass)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
              {fieldErrors.email && <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{fieldErrors.email}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="alex_fit"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${fieldErrors.username ? 'var(--accent-red)' : 'var(--border-glass)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
              {fieldErrors.username && <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{fieldErrors.username}</span>}
            </div>
          </div>

          {/* Row 3: Password & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Password * (min 6 chars)
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
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${fieldErrors.password ? 'var(--accent-red)' : 'var(--border-glass)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
              {fieldErrors.password && <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{fieldErrors.password}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0199"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Physical Goals & Biometrics */}
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-orange)' }}>
              Physical Metrics & Fitness Goal
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="heightCm"
                  value={formData.heightCm}
                  onChange={handleChange}
                  placeholder="178.5"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weightKg"
                  value={formData.weightKg}
                  onChange={handleChange}
                  placeholder="74.0"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Primary Goal
                </label>
                <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#151a24',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="Muscle Hypertrophy">Muscle Hypertrophy</option>
                  <option value="Fat Loss & Toning">Fat Loss & Toning</option>
                  <option value="Strength & Power">Strength & Power</option>
                  <option value="Cardiovascular Endurance">Endurance</option>
                  <option value="General Health">General Health</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : <><FaCheck /> Complete Registration</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Sign In</Link>
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaArrowLeft size={11} /> Back to Homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegisterPage;
