import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaArrowLeft, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const TrainerRegisterPage = () => {
  const { registerTrainer } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    specialization: 'Strength & Conditioning',
    experienceYears: '3',
    certification: 'NASM-CPT / CSCS',
    bio: '',
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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password || !formData.specialization) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});

      const payload = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears, 10) || 1,
      };

      await registerTrainer(payload);
      navigate('/trainer/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      }
      const errMsg = err.response?.data?.message || err.message || 'Trainer registration failed. Please try again.';
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
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 229, 255, 0.05))',
            color: 'var(--accent-cyan)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: 'var(--shadow-cyan-glow)',
          }}>
            <FaDumbbell />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Trainer Registration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join our elite roster of certified trainers, design custom splits, and coach members
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
                placeholder="Marcus"
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
                placeholder="Vance"
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
                placeholder="marcus@elitegym.com"
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
                placeholder="coach_marcus"
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
                placeholder="+1 555-0255"
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

          {/* Trainer Qualifications */}
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
              Professional Credentials
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
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
                  <option value="Strength & Conditioning">Strength & Conditioning</option>
                  <option value="Bodybuilding & Hypertrophy">Bodybuilding & Hypertrophy</option>
                  <option value="CrossFit & Functional Fitness">CrossFit & Functional</option>
                  <option value="Weight Loss & HIIT">Weight Loss & HIIT</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  placeholder="3"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Certifications
                </label>
                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="e.g. CSCS, NASM, ACE"
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Professional Biography
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary of coaching philosophy and background..."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, var(--accent-cyan), #00b4d8)',
              color: '#090c10',
              fontWeight: 700,
            }}
            disabled={loading}
          >
            {loading ? 'Registering Trainer...' : <><FaCheck /> Register as Trainer</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Sign In</Link>
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

export default TrainerRegisterPage;
