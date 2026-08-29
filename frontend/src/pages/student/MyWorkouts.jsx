import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaCalendar, FaWeight, FaEye, FaTimes } from 'react-icons/fa';
import { workoutService } from '../../services/workoutService';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const MyWorkouts = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail view
  const [detailPlan, setDetailPlan] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDay, setActiveDay] = useState('MONDAY');

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await workoutService.getMyWorkoutPlans();
      if (res.success) setPlans(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load workout plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openDetail = async (planId) => {
    try {
      setLoadingDetail(true);
      const res = await workoutService.getWorkoutPlanDetail(planId);
      if (res.success) {
        setDetailPlan(res.data);
        const firstDay = res.data.exercises?.[0]?.dayOfWeek || 'MONDAY';
        setActiveDay(firstDay);
      }
    } catch (err) {
      setError(err.message || 'Failed to load workout plan.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getExercisesForDay = (plan, day) =>
    (plan?.exercises || [])
      .filter((ex) => ex.dayOfWeek === day)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1150px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
            <FaDumbbell /> My Workout Plans
          </span>
          <h1 style={{ fontSize: '2rem' }}>Your Assigned Training Programs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            View and follow the workout routines assigned to you by your trainer.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading workout plans..." />
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadPlans} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          title="No workout plans yet"
          message="Your trainer hasn't assigned any workout plans to you yet. Request a trainer assignment to get started."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{plan.title}</h3>
                  <Badge status={plan.difficulty} variant={plan.difficulty === 'BEGINNER' ? 'green' : plan.difficulty === 'ADVANCED' ? 'red' : 'cyan'} />
                </div>
                {plan.isActive ? <Badge status="ACTIVE" /> : <Badge status="EXPIRED" />}
              </div>

              {plan.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {plan.description}
                </p>
              )}

              {plan.targetGoal && (
                <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Goal: </span>
                  <strong>{plan.targetGoal}</strong>
                </div>
              )}

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                padding: '0.85rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FaCalendar style={{ color: 'var(--accent-orange)' }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Duration</div>
                    <div style={{ fontWeight: 600 }}>
                      {plan.startDate || '—'} → {plan.endDate || '—'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FaDumbbell style={{ color: 'var(--accent-orange)' }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Exercises</div>
                    <div style={{ fontWeight: 600 }}>{plan.exercises?.length || 0} total</div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned by: </span>
                <strong>{plan.trainerName}</strong>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                  {plan.trainerSpecialization}
                </span>
              </div>

              <button
                onClick={() => openDetail(plan.id)}
                className="btn btn-primary"
                style={{ gap: '0.4rem', marginTop: 'auto' }}
              >
                <FaEye /> View Full Program
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!detailPlan} onClose={() => setDetailPlan(null)} title={detailPlan?.title || 'Workout Plan'} maxWidth="850px">
        {loadingDetail ? (
          <Loader message="Loading plan details..." />
        ) : detailPlan && (
          <div>
            {detailPlan.description && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {detailPlan.description}
              </p>
            )}

            {/* Day Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              {DAYS.map((day) => {
                const count = getExercisesForDay(detailPlan, day).length;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: activeDay === day ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                      border: activeDay === day ? '1px solid rgba(255, 107, 0, 0.4)' : '1px solid transparent',
                      color: activeDay === day ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      fontWeight: activeDay === day ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {day.slice(0, 3)}
                    {count > 0 && (
                      <span style={{
                        marginLeft: '0.35rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        background: activeDay === day ? 'rgba(255, 107, 0, 0.25)' : 'rgba(255,255,255,0.06)',
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Exercises */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {getExercisesForDay(detailPlan, activeDay).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    🎉 Rest Day — No exercises scheduled for {activeDay}.
                  </div>
                ) : (
                  getExercisesForDay(detailPlan, activeDay).map((ex, idx) => (
                    <div key={ex.id || idx} className="glass-card" style={{
                      padding: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '1.25rem',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'rgba(255, 107, 0, 0.12)',
                        border: '1px solid rgba(255, 107, 0, 0.3)',
                        color: 'var(--accent-orange)', fontWeight: 700, fontSize: '1.1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{ex.exerciseName}</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Sets: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{ex.sets}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Reps: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{ex.reps}</strong>
                          </div>
                          {ex.targetWeightKg && (
                            <div>
                              <FaWeight style={{ color: 'var(--accent-orange)' }} />{' '}
                              <strong style={{ color: 'var(--text-primary)' }}>{ex.targetWeightKg} kg</strong>
                            </div>
                          )}
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Rest: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{ex.restSeconds}s</strong>
                          </div>
                        </div>
                        {ex.notes && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            💡 {ex.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyWorkouts;
