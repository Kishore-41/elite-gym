import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDumbbell, FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes,
  FaListOl, FaUserGraduate, FaClone
} from 'react-icons/fa';
import { workoutService } from '../../services/workoutService';
import { trainerService } from '../../services/trainerService';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const TrainerWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [templatesOnly, setTemplatesOnly] = useState(false);

  // Plan modal (Create/Edit)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({
    title: '', description: '', studentId: '', difficulty: 'INTERMEDIATE',
    targetGoal: '', startDate: '', endDate: '', isActive: true,
  });
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [planModalError, setPlanModalError] = useState('');

  // Plan detail modal
  const [detailPlan, setDetailPlan] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDay, setActiveDay] = useState('MONDAY');

  // Exercise modal
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    dayOfWeek: 'MONDAY', exerciseName: '', sets: 3, reps: '10',
    targetWeightKg: '', restSeconds: 60, notes: '', orderIndex: 0,
  });
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [exerciseModalError, setExerciseModalError] = useState('');

  // Assign modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignPlan, setAssignPlan] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [assignModalError, setAssignModalError] = useState('');

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState('');

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 4000);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [plansRes, studentsRes] = await Promise.all([
        workoutService.getTrainerWorkoutPlans(templatesOnly),
        trainerService.getAssignedStudents(),
      ]);
      if (plansRes.success) setPlans(plansRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load workout plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [templatesOnly]);

  // ============ Plan Operations ============
  const openCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm({
      title: '', description: '', studentId: '', difficulty: 'INTERMEDIATE',
      targetGoal: '', startDate: '', endDate: '', isActive: true,
    });
    setPlanModalError('');
    setIsPlanModalOpen(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      title: plan.title, description: plan.description || '',
      studentId: plan.studentId || '', difficulty: plan.difficulty,
      targetGoal: plan.targetGoal || '', startDate: plan.startDate || '',
      endDate: plan.endDate || '', isActive: plan.isActive,
    });
    setPlanModalError('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.title.trim()) {
      setPlanModalError('Title is required.');
      return;
    }
    try {
      setSubmittingPlan(true);
      setPlanModalError('');
      const payload = {
        ...planForm,
        studentId: planForm.studentId ? parseInt(planForm.studentId, 10) : null,
      };
      if (editingPlanId) {
        await workoutService.updateWorkoutPlan(editingPlanId, payload);
        showToast(`Plan '${planForm.title}' updated.`);
      } else {
        await workoutService.createWorkoutPlan(payload);
        showToast(`Plan '${planForm.title}' created.`);
      }
      setIsPlanModalOpen(false);
      await loadData();
    } catch (err) {
      setPlanModalError(err.response?.data?.message || err.message || 'Failed to save plan.');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      setDeleting(true);
      await workoutService.deleteWorkoutPlan(deletingPlan.id);
      showToast(`Plan '${deletingPlan.title}' deleted.`);
      setIsDeleteDialogOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Delete failed.', true);
      setIsDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
      setDeletingPlan(null);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      await workoutService.toggleWorkoutPlanStatus(plan.id, !plan.isActive);
      showToast(`Plan '${plan.title}' is now ${!plan.isActive ? 'Active' : 'Inactive'}.`);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Status update failed.', true);
    }
  };

  // ============ Plan Detail / Exercise Operations ============
  const openDetail = async (planId) => {
    try {
      setLoadingDetail(true);
      const res = await workoutService.getWorkoutPlanById(planId);
      if (res.success) {
        setDetailPlan(res.data);
        const firstDay = res.data.exercises?.[0]?.dayOfWeek || 'MONDAY';
        setActiveDay(firstDay);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load plan.', true);
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshDetail = async () => {
    if (!detailPlan) return;
    try {
      setLoadingDetail(true);
      const res = await workoutService.getWorkoutPlanById(detailPlan.id);
      if (res.success) setDetailPlan(res.data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getExercisesForDay = (day) =>
    (detailPlan?.exercises || [])
      .filter((ex) => ex.dayOfWeek === day)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const openAddExercise = () => {
    setEditingExerciseId(null);
    setExerciseForm({
      dayOfWeek: activeDay, exerciseName: '', sets: 3, reps: '10',
      targetWeightKg: '', restSeconds: 60, notes: '', orderIndex: getExercisesForDay(activeDay).length,
    });
    setExerciseModalError('');
    setIsExerciseModalOpen(true);
  };

  const openEditExercise = (ex) => {
    setEditingExerciseId(ex.id);
    setExerciseForm({
      dayOfWeek: ex.dayOfWeek, exerciseName: ex.exerciseName, sets: ex.sets, reps: ex.reps,
      targetWeightKg: ex.targetWeightKg || '', restSeconds: ex.restSeconds,
      notes: ex.notes || '', orderIndex: ex.orderIndex,
    });
    setExerciseModalError('');
    setIsExerciseModalOpen(true);
  };

  const handleSaveExercise = async (e) => {
    e.preventDefault();
    if (!exerciseForm.exerciseName.trim() || !exerciseForm.sets || !exerciseForm.reps) {
      setExerciseModalError('Exercise name, sets and reps are required.');
      return;
    }
    try {
      setSubmittingExercise(true);
      setExerciseModalError('');
      const payload = {
        ...exerciseForm,
        targetWeightKg: exerciseForm.targetWeightKg ? parseFloat(exerciseForm.targetWeightKg) : null,
        sets: parseInt(exerciseForm.sets, 10),
        restSeconds: parseInt(exerciseForm.restSeconds, 10),
        orderIndex: parseInt(exerciseForm.orderIndex, 10) || 0,
      };
      if (editingExerciseId) {
        await workoutService.updateExercise(detailPlan.id, editingExerciseId, payload);
        showToast('Exercise updated.');
      } else {
        await workoutService.addExercise(detailPlan.id, payload);
        showToast('Exercise added.');
      }
      setIsExerciseModalOpen(false);
      await refreshDetail();
    } catch (err) {
      setExerciseModalError(err.response?.data?.message || err.message || 'Failed to save exercise.');
    } finally {
      setSubmittingExercise(false);
    }
  };

  const handleRemoveExercise = async (exerciseId) => {
    try {
      await workoutService.removeExercise(detailPlan.id, exerciseId);
      showToast('Exercise removed.');
      await refreshDetail();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Remove failed.', true);
    }
  };

  // ============ Assign to Student ============
  const openAssign = (plan) => {
    setAssignPlan(plan);
    setAssignStudentId(plan.studentId || (students[0]?.studentId || ''));
    setAssignModalError('');
    setIsAssignModalOpen(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignStudentId) {
      setAssignModalError('Select a student.');
      return;
    }
    try {
      setSubmittingAssign(true);
      setAssignModalError('');
      await workoutService.assignPlanToStudent(assignPlan.id, parseInt(assignStudentId, 10));
      showToast(`Plan assigned to student.`);
      setIsAssignModalOpen(false);
      await loadData();
      if (detailPlan?.id === assignPlan.id) await refreshDetail();
    } catch (err) {
      setAssignModalError(err.response?.data?.message || err.message || 'Assign failed.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  // ============ RENDER ============
  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1250px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
            <FaDumbbell /> Workout Plans
          </span>
          <h1 style={{ fontSize: '2rem' }}>Program Builder</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Design workout routines, add exercises, and assign them to your students.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
            fontSize: '0.85rem', cursor: 'pointer',
          }}>
            <input type="checkbox" checked={templatesOnly} onChange={(e) => setTemplatesOnly(e.target.checked)}
                   style={{ accentColor: 'var(--accent-orange)' }} />
            Templates Only
          </label>
          <button onClick={openCreatePlan} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <FaPlus /> New Plan
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.3)',
          color: 'var(--accent-green)', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          ✓ {toastMessage}
        </div>
      )}
      {toastError && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 23, 68, 0.15)', border: '1px solid rgba(255, 23, 68, 0.3)',
          color: 'var(--accent-red)', marginBottom: '1.5rem', fontSize: '0.9rem',
        }}>
          ⚠ {toastError}
        </div>
      )}

      {loading ? (
        <Loader message="Loading workout plans..." />
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadData} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          title="No workout plans yet"
          message="Create your first workout plan or template to assign to students."
          action={
            <button onClick={openCreatePlan} className="btn btn-primary">
              <FaPlus /> Create Your First Plan
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{plan.title}</h3>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <Badge status={plan.difficulty} variant={plan.difficulty === 'BEGINNER' ? 'green' : plan.difficulty === 'ADVANCED' ? 'red' : 'cyan'} />
                    {plan.isTemplate ? <Badge status="TEMPLATE" variant="cyan" /> : <Badge status="ASSIGNED" variant="green" />}
                    {plan.isActive ? <Badge status="ACTIVE" variant="green" /> : <Badge status="INACTIVE" variant="red" />}
                  </div>
                </div>
              </div>

              {plan.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', minHeight: '2.5rem' }}>
                  {plan.description.length > 100 ? plan.description.slice(0, 100) + '...' : plan.description}
                </p>
              )}

              {plan.studentName && (
                <div style={{
                  fontSize: '0.8rem', marginBottom: '0.75rem', padding: '0.4rem 0.7rem',
                  borderRadius: 'var(--radius-sm)', background: 'rgba(0, 230, 118, 0.06)',
                  border: '1px solid rgba(0, 230, 118, 0.15)',
                }}>
                  <FaUserGraduate style={{ color: 'var(--accent-green)', marginRight: '0.35rem' }} />
                  Assigned to: <strong>{plan.studentName}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span><FaListOl style={{ marginRight: '0.25rem' }} />{plan.exercises?.length || 0} exercises</span>
                {plan.startDate && plan.endDate && <span>{plan.startDate} → {plan.endDate}</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: 'auto' }}>
                <button onClick={() => openDetail(plan.id)} className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', gap: '0.3rem' }}>
                  <FaEye /> View/Edit
                </button>
                <button onClick={() => openEditPlan(plan)} className="btn btn-secondary"
                        style={{ padding: '0.5rem 0.65rem', fontSize: '0.85rem' }} title="Edit Info">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(plan)} className="btn btn-secondary"
                        style={{ padding: '0.5rem 0.65rem', fontSize: '0.85rem' }} title={plan.isActive ? 'Deactivate' : 'Activate'}>
                  {plan.isActive ? <FaTimes style={{ color: 'var(--accent-red)' }} /> : <FaCheck style={{ color: 'var(--accent-green)' }} />}
                </button>
                <button onClick={() => openAssign(plan)} className="btn btn-secondary"
                        style={{ padding: '0.5rem 0.65rem', fontSize: '0.85rem' }} title="Assign to Student">
                  <FaClone />
                </button>
                <button onClick={() => { setDeletingPlan(plan); setIsDeleteDialogOpen(true); }}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 0.65rem', fontSize: '0.85rem', color: 'var(--accent-red)' }} title="Delete">
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ========= Plan Create/Edit Modal ========= */}
      <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)}
             title={editingPlanId ? 'Edit Workout Plan' : 'Create Workout Plan'} maxWidth="560px">
        <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {planModalError && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)', border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)', fontSize: '0.875rem',
            }}>
              {planModalError}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Title *
            </label>
            <input type="text" value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                   placeholder="e.g. Beginner Strength 4-Week"
                   style={{
                     width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                     background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                     color: 'var(--text-primary)', outline: 'none',
                   }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      rows={2} placeholder="What's this plan about?"
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
                      }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Difficulty
              </label>
              <select value={planForm.difficulty} onChange={(e) => setPlanForm({ ...planForm, difficulty: e.target.value })}
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                        background: '#151a24', border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)', outline: 'none',
                      }}>
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Assign to Student (optional)
              </label>
              <select value={planForm.studentId} onChange={(e) => setPlanForm({ ...planForm, studentId: e.target.value })}
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                        background: '#151a24', border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)', outline: 'none',
                      }}>
                <option value="">— Template (Unassigned) —</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>{s.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Target Goal
            </label>
            <input type="text" value={planForm.targetGoal} onChange={(e) => setPlanForm({ ...planForm, targetGoal: e.target.value })}
                   placeholder="e.g. Muscle Hypertrophy"
                   style={{
                     width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                     background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                     color: 'var(--text-primary)', outline: 'none',
                   }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Start Date
              </label>
              <input type="date" value={planForm.startDate} onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                     style={{
                       width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                       background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                       color: 'var(--text-primary)', outline: 'none',
                     }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                End Date
              </label>
              <input type="date" value={planForm.endDate} onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
                     style={{
                       width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                       background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                       color: 'var(--text-primary)', outline: 'none',
                     }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="planActiveCheck" checked={planForm.isActive}
                   onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                   style={{ width: '18px', height: '18px', accentColor: 'var(--accent-orange)' }} />
            <label htmlFor="planActiveCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Mark as Active
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPlanModalOpen(false)} disabled={submittingPlan}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingPlan}>
              {submittingPlan ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========= Plan Detail Modal ========= */}
      <Modal isOpen={!!detailPlan} onClose={() => setDetailPlan(null)}
             title={detailPlan?.title || 'Workout Plan'} maxWidth="900px">
        {loadingDetail ? (
          <Loader message="Loading plan details..." />
        ) : detailPlan && (
          <div>
            {/* Day Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {DAYS.map((day) => {
                  const count = getExercisesForDay(day).length;
                  return (
                    <button key={day} onClick={() => setActiveDay(day)}
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              background: activeDay === day ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                              border: activeDay === day ? '1px solid rgba(255, 107, 0, 0.4)' : '1px solid transparent',
                              color: activeDay === day ? 'var(--accent-orange)' : 'var(--text-secondary)',
                              fontWeight: activeDay === day ? 700 : 500,
                              fontSize: '0.85rem', cursor: 'pointer',
                            }}>
                      {day.slice(0, 3)}
                      {count > 0 && (
                        <span style={{
                          marginLeft: '0.35rem', padding: '0.1rem 0.4rem', borderRadius: '10px',
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
              <button onClick={openAddExercise} className="btn btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', gap: '0.35rem' }}>
                <FaPlus /> Add Exercise
              </button>
            </div>

            {/* Exercises */}
            <AnimatePresence mode="wait">
              <motion.div key={activeDay} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}
                          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {getExercisesForDay(activeDay).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No exercises for {activeDay}. Click <strong>Add Exercise</strong> to build this day.
                  </div>
                ) : (
                  getExercisesForDay(activeDay).map((ex, idx) => (
                    <div key={ex.id} className="glass-card" style={{
                      padding: '1rem',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(255, 107, 0, 0.12)',
                        border: '1px solid rgba(255, 107, 0, 0.3)',
                        color: 'var(--accent-orange)', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1rem', margin: 0 }}>{ex.exerciseName}</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Sets: </span><strong>{ex.sets}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Reps: </span><strong>{ex.reps}</strong></div>
                          {ex.targetWeightKg && (
                            <div><FaDumbbell style={{ color: 'var(--accent-orange)' }} /> <strong>{ex.targetWeightKg} kg</strong></div>
                          )}
                          <div><span style={{ color: 'var(--text-muted)' }}>Rest: </span><strong>{ex.restSeconds}s</strong></div>
                        </div>
                        {ex.notes && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            💡 {ex.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <button onClick={() => openEditExercise(ex)} className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}>
                          <FaEdit />
                        </button>
                        <button onClick={() => handleRemoveExercise(ex.id)} className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', color: 'var(--accent-red)' }}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Modal>

      {/* ========= Exercise Create/Edit Modal ========= */}
      <Modal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)}
             title={editingExerciseId ? 'Edit Exercise' : 'Add Exercise'} maxWidth="500px">
        <form onSubmit={handleSaveExercise} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exerciseModalError && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)', border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)', fontSize: '0.875rem',
            }}>
              {exerciseModalError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Day *
              </label>
              <select value={exerciseForm.dayOfWeek} onChange={(e) => setExerciseForm({ ...exerciseForm, dayOfWeek: e.target.value })}
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                        background: '#151a24', border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)', outline: 'none',
                      }}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Order
              </label>
              <input type="number" min="0" value={exerciseForm.orderIndex}
                     onChange={(e) => setExerciseForm({ ...exerciseForm, orderIndex: e.target.value })}
                     style={{
                       width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                       background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                       color: 'var(--text-primary)', outline: 'none',
                     }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Exercise Name *
            </label>
            <input type="text" value={exerciseForm.exerciseName}
                   onChange={(e) => setExerciseForm({ ...exerciseForm, exerciseName: e.target.value })}
                   placeholder="e.g. Barbell Squat"
                   style={{
                     width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                     background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                     color: 'var(--text-primary)', outline: 'none',
                   }} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Sets *
              </label>
              <input type="number" min="1" value={exerciseForm.sets}
                     onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                     style={{
                       width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                       background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                       color: 'var(--text-primary)', outline: 'none',
                     }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Reps *
              </label>
              <input type="text" value={exerciseForm.reps}
                     onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                     placeholder="8-10 or 12"
                     style={{
                       width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                       background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                       color: 'var(--text-primary)', outline: 'none',
                     }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Weight (kg)
              </label>
              <input type="number" step="0.01" min="0" value={exerciseForm.targetWeightKg}
                     onChange={(e) => setExerciseForm({ ...exerciseForm, targetWeightKg: e.target.value })}
                     placeholder="60"
                     style={{
                       width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                       background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                       color: 'var(--text-primary)', outline: 'none',
                     }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Rest (seconds)
            </label>
            <input type="number" min="1" value={exerciseForm.restSeconds}
                   onChange={(e) => setExerciseForm({ ...exerciseForm, restSeconds: e.target.value })}
                   style={{
                     width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                     background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                     color: 'var(--text-primary)', outline: 'none',
                   }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Cues / Notes
            </label>
            <input type="text" value={exerciseForm.notes}
                   onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                   placeholder="e.g. Keep chest up, control eccentric"
                   style={{
                     width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
                     background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                     color: 'var(--text-primary)', outline: 'none',
                   }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsExerciseModalOpen(false)} disabled={submittingExercise}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingExercise}>
              {submittingExercise ? 'Saving...' : editingExerciseId ? 'Update' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========= Assign Modal ========= */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}
             title="Assign Plan to Student" maxWidth="450px">
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignPlan && (
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
              <strong>{assignPlan.title}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {assignPlan.exercises?.length || 0} exercises • {assignPlan.difficulty}
                {assignPlan.studentName && <> • Currently assigned to <strong>{assignPlan.studentName}</strong></>}
              </div>
            </div>
          )}
          {assignModalError && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)', border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)', fontSize: '0.875rem',
            }}>
              {assignModalError}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Select Student
            </label>
            <select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                      background: '#151a24', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', outline: 'none',
                    }} required>
              <option value="">— Select a student —</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>{s.fullName} {s.fitnessGoal ? `(${s.fitnessGoal})` : ''}</option>
              ))}
            </select>
            {students.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '0.5rem' }}>
                You have no assigned students. Approve assignment requests first.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)} disabled={submittingAssign}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingAssign || students.length === 0}>
              {submittingAssign ? 'Assigning...' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========= Delete Dialog ========= */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setDeletingPlan(null); }}
        onConfirm={handleDeletePlan}
        title="Delete Workout Plan"
        message={`Are you sure you want to permanently delete '${deletingPlan?.title}'? All exercises in this plan will also be removed.`}
        confirmText="Delete Plan"
        isDestructive={true}
        loading={deleting}
      />
    </div>
  );
};

export default TrainerWorkoutPlans;
