import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaFilter, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import { membershipService } from '../../services/membershipService';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const ManageMemberships = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'subscriptions'

  // Plans State
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Plan Modal State (Create / Edit)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    durationMonths: 1,
    price: '',
    featuresText: '',
    isActive: true,
  });
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [planModalError, setPlanModalError] = useState('');

  // Delete Plan Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Change Dialog State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions(statusFilter);
    }
  }, [activeTab, statusFilter]);

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 4000);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await membershipService.getAllPlans();
      if (res.success) setPlans(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch plans', true);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchSubscriptions = async (status = '') => {
    try {
      setLoadingSubscriptions(true);
      const res = await membershipService.getAllStudentMembershipsAdmin(status || null);
      if (res.success) setSubscriptions(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch student subscriptions', true);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm({
      name: '',
      description: '',
      durationMonths: 1,
      price: '',
      featuresText: 'Full Gym Access\nLocker Room',
      isActive: true,
    });
    setPlanModalError('');
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      durationMonths: plan.durationMonths,
      price: String(plan.price),
      featuresText: plan.features ? plan.features.join('\n') : '',
      isActive: plan.isActive,
    });
    setPlanModalError('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.name.trim() || !planForm.price || !planForm.description.trim()) {
      setPlanModalError('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(planForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setPlanModalError('Price must be a valid number greater than 0.');
      return;
    }

    const featuresList = planForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      durationMonths: parseInt(planForm.durationMonths, 10),
      price: priceNum,
      features: featuresList,
      isActive: planForm.isActive,
    };

    try {
      setSubmittingPlan(true);
      setPlanModalError('');

      if (editingPlanId) {
        await membershipService.updatePlan(editingPlanId, payload);
        showToast(`Plan '${payload.name}' updated successfully!`);
      } else {
        await membershipService.createPlan(payload);
        showToast(`Plan '${payload.name}' created successfully!`);
      }

      setIsPlanModalOpen(false);
      await fetchPlans();
    } catch (err) {
      setPlanModalError(err.response?.data?.message || err.message || 'Failed to save plan.');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      await membershipService.togglePlanStatus(plan.id, !plan.isActive);
      showToast(`Plan '${plan.name}' is now ${!plan.isActive ? 'Active' : 'Inactive'}.`);
      await fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to toggle status', true);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      setDeleting(true);
      await membershipService.deletePlan(deletingPlan.id);
      showToast(`Plan '${deletingPlan.name}' deleted successfully.`);
      setIsDeleteDialogOpen(false);
      await fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Cannot delete plan.', true);
      setIsDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
      setDeletingPlan(null);
    }
  };

  const handleUpdateSubStatus = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      setUpdatingStatus(true);
      await membershipService.updateMembershipStatusAdmin(selectedSub.id, newStatus);
      showToast(`Membership #${selectedSub.id} updated to ${newStatus}`);
      setIsStatusModalOpen(false);
      await fetchSubscriptions(statusFilter);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update status', true);
    } finally {
      setUpdatingStatus(false);
      setSelectedSub(null);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1150px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
            <FaLayerGroup /> Administration
          </span>
          <h1 style={{ fontSize: '2rem' }}>Membership Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Configure membership plan tiers, pricing perks, and manage student subscriptions.
          </p>
        </div>

        {activeTab === 'plans' && (
          <button onClick={handleOpenCreatePlan} className="btn btn-primary">
            <FaPlus /> Create New Plan
          </button>
        )}
      </div>

      {/* Toast Alert Notice */}
      {toastMessage && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 230, 118, 0.15)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          color: 'var(--accent-green)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}>
          ✓ {toastMessage}
        </div>
      )}

      {toastError && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 23, 68, 0.15)',
          border: '1px solid rgba(255, 23, 68, 0.3)',
          color: 'var(--accent-red)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}>
          ⚠ {toastError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'plans' ? '2px solid var(--accent-orange)' : '2px solid transparent',
            color: activeTab === 'plans' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          <FaLayerGroup style={{ marginRight: '0.4rem' }} /> Plans Catalog ({plans.length})
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'subscriptions' ? '2px solid var(--accent-orange)' : '2px solid transparent',
            color: activeTab === 'subscriptions' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          <FaUsers style={{ marginRight: '0.4rem' }} /> Student Subscriptions
        </button>
      </div>

      {/* TAB 1: Plans Catalog */}
      {activeTab === 'plans' && (
        loadingPlans ? (
          <Loader message="Loading plans catalog..." />
        ) : plans.length === 0 ? (
          <EmptyState
            title="No membership plans"
            message="Get started by creating your gym's first membership tier."
            action={
              <button onClick={handleOpenCreatePlan} className="btn btn-primary">
                <FaPlus /> Create Plan
              </button>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {plans.map((plan) => (
              <div key={plan.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.3rem' }}>{plan.name}</h3>
                    <span className={plan.isActive ? 'badge badge-green' : 'badge badge-red'}>
                      {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {plan.description}
                  </p>

                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                      ${plan.price} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {plan.durationMonths} mo</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Perks & Features:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                      {plan.features && plan.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaCheck size={10} style={{ color: 'var(--accent-green)' }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                  <button
                    onClick={() => handleOpenEditPlan(plan)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', gap: '0.35rem' }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                  >
                    {plan.isActive ? <FaTimes style={{ color: 'var(--accent-red)' }} /> : <FaCheck style={{ color: 'var(--accent-green)' }} />}
                  </button>

                  <button
                    onClick={() => {
                      setDeletingPlan(plan);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--accent-red)' }}
                    title="Delete Plan"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: Student Subscriptions Ledger */}
      {activeTab === 'subscriptions' && (
        <div>
          {/* Status Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaFilter /> Filter Status:
            </span>
            {['', 'ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`badge ${statusFilter === st ? 'badge-orange' : 'badge-cyan'}`}
                style={{ cursor: 'pointer', border: 'none', padding: '0.4rem 0.85rem' }}
              >
                {st || 'ALL'}
              </button>
            ))}
          </div>

          {loadingSubscriptions ? (
            <Loader message="Loading student subscriptions..." />
          ) : subscriptions.length === 0 ? (
            <EmptyState title="No subscriptions found" message="No student records match the selected status filter." />
          ) : (
            <div className="glass-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Sub #</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Member</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>#{sub.id}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{sub.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.studentEmail}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{sub.planName}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>${sub.planPrice} ({sub.durationMonths} mo)</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {sub.startDate} → {sub.endDate}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge status={sub.status} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setNewStatus(sub.status);
                            setIsStatusModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Plan Create / Edit Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlanId ? 'Edit Membership Plan' : 'Create Membership Plan'}
        maxWidth="550px"
      >
        <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {planModalError && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 23, 68, 0.12)',
              border: '1px solid rgba(255, 23, 68, 0.3)',
              color: 'var(--accent-red)',
              fontSize: '0.875rem',
            }}>
              {planModalError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Plan Name *
            </label>
            <input
              type="text"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="e.g. Pro Quarterly"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Description *
            </label>
            <textarea
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              rows={2}
              placeholder="Brief description of who this plan is suitable for..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                placeholder="79.99"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Duration (Months) *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={planForm.durationMonths}
                onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Features & Perks (one per line)
            </label>
            <textarea
              value={planForm.featuresText}
              onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
              rows={4}
              placeholder="Full Gym Floor Access&#10;Sauna Access&#10;Free Consultation"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={planForm.isActive}
              onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-orange)' }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Publish plan as Active (Available for student purchase)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingPlan}>
              {submittingPlan ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingPlan(null);
        }}
        onConfirm={handleDeletePlan}
        title="Delete Membership Plan"
        message={`Are you sure you want to permanently delete '${deletingPlan?.name}'? If students have active or past memberships under this plan, it cannot be deleted and must be deactivated instead.`}
        confirmText="Delete Plan"
        isDestructive={true}
        loading={deleting}
      />

      {/* Subscription Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedSub(null);
        }}
        title="Update Subscription Status"
        maxWidth="420px"
      >
        <form onSubmit={handleUpdateSubStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Updating membership for <strong>{selectedSub?.studentName}</strong> (Plan: {selectedSub?.planName}).
            </p>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Select New Status:
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#151a24',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageMemberships;
