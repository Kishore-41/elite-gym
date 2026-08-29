import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaUserShield, FaUserGraduate, FaChartLine, FaCheckCircle } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
        
        {/* Animated Hero Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'inline-block', marginBottom: '1.5rem' }}
        >
          <span className="badge badge-orange">
            <FaDumbbell /> Elite Gym Management System v1.0
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}
        >
          Elevate Your Fitness & Gym Operations with <span style={{ color: 'var(--accent-orange)' }}>Precision</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}
        >
          A unified, high-performance platform engineered for Students, Personal Trainers, and Gym Administrators.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}
        >
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Access Portal
          </Link>
          <a href="#features" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Explore Features
          </a>
        </motion.div>

        {/* Role Highlights Cards */}
        <div id="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card"
          >
            <div style={{ color: 'var(--accent-orange)', fontSize: '1.75rem', marginBottom: '1rem' }}>
              <FaUserGraduate />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Student Portal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Membership tracking, daily check-ins, custom weekly workout splits, trainer communication, and payments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card"
          >
            <div style={{ color: 'var(--accent-cyan)', fontSize: '1.75rem', marginBottom: '1rem' }}>
              <FaDumbbell />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Trainer Hub</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Student roster management, workout builder with custom sets/reps, capacity management, and approval workflows.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card"
          >
            <div style={{ color: 'var(--accent-green)', fontSize: '1.75rem', marginBottom: '1rem' }}>
              <FaUserShield />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Admin Control</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Real-time revenue analytics, membership catalog management, attendance logs, and student grievance resolution.
            </p>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default LandingPage;
