import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaWallet, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaUndoAlt, FaFilter, FaSearch, FaReceipt, FaUser, FaBuilding,
  FaCreditCard, FaMobile, FaCashRegister, FaExchangeAlt, FaFileInvoiceDollar
} from 'react-icons/fa';
import { paymentService } from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const STATUS_CONFIG = {
  SUCCESS: { label: 'Success', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)', Icon: FaCheckCircle },
  PENDING: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', Icon: FaHourglassHalf },
  FAILED: { label: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', Icon: FaTimesCircle },
  REFUNDED: { label: 'Refunded', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.3)', Icon: FaUndoAlt },
};

const METHOD_CONFIG = {
  CREDIT_CARD: { label: 'Credit Card', Icon: FaCreditCard },
  DEBIT_CARD: { label: 'Debit Card', Icon: FaCreditCard },
  UPI: { label: 'UPI', Icon: FaMobile },
  NET_BANKING: { label: 'Net Banking', Icon: FaBuilding },
  CASH: { label: 'Cash', Icon: FaCashRegister },
};

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.25rem',
};

const fmtINR = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
};

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [statusModalPayment, setStatusModalPayment] = useState(null);
  const [newStatus, setNewStatus] = useState('SUCCESS');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await paymentService.getAllPayments();
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setError(err.response?.data?.message || 'Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalPayment) return;
    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');
      const res = await paymentService.updatePaymentStatus(statusModalPayment.id, {
        paymentStatus: newStatus,
      });
      setSuccessMsg(res.message || 'Payment status updated successfully.');
      setStatusModalPayment(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'ALL' && p.paymentStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inv = (p.invoiceNumber || '').toLowerCase();
        const txn = (p.transactionId || '').toLowerCase();
        const name = (p.studentName || '').toLowerCase();
        const plan = (p.planName || '').toLowerCase();
        if (!inv.includes(q) && !txn.includes(q) && !name.includes(q) && !plan.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [payments, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalCount = payments.length;
    let totalRevenue = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    payments.forEach((p) => {
      if (p.paymentStatus === 'SUCCESS') {
        totalRevenue += Number(p.amount) || 0;
        successCount++;
      } else if (p.paymentStatus === 'PENDING') {
        pendingCount++;
      } else if (p.paymentStatus === 'FAILED' || p.paymentStatus === 'REFUNDED') {
        failedCount++;
      }
    });

    return { totalCount, totalRevenue, successCount, pendingCount, failedCount };
  }, [payments]);

  if (loading && payments.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Loader text="Loading financial transaction registry..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaFileInvoiceDollar style={{ color: 'var(--accent-orange)' }} /> Financial Ledger & Payments
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
          Comprehensive audit registry of all gym subscription purchases, transaction statuses, and payment receipts.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <FaTimesCircle /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <FaCheckCircle /> {successMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Revenue Collected</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.35rem', color: '#22c55e' }}>
            {fmtINR(stats.totalRevenue)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>From successful transactions</div>
        </div>

        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Transactions</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.35rem' }}>
            {stats.totalCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>All-time payment records</div>
        </div>

        <div style={CARD_BASE}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Success vs Pending</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>{stats.successCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Successful</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pendingCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>{stats.failedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed/Refund</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ ...CARD_BASE, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <FaSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice, txn ID, member..."
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* Status Filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><FaFilter size={11} /> Status:</span>
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-full)',
                  border: statusFilter === st ? '1px solid var(--accent-orange)' : '1px solid var(--border-glass)',
                  background: statusFilter === st ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: statusFilter === st ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'All' : STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="No transactions match the selected filter or search query."
            icon={<FaWallet size={40} />}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Invoice / Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Member</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Plan / Subscription</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const stat = STATUS_CONFIG[p.paymentStatus] || STATUS_CONFIG.PENDING;
                  const meth = METHOD_CONFIG[p.paymentMethod] || { label: p.paymentMethod, Icon: FaCreditCard };
                  const StatIcon = stat.Icon;
                  const MethIcon = meth.Icon;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>
                          {p.invoiceNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {fmtDateTime(p.paidAt || p.createdAt)}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {p.studentName || 'Student #' + p.studentId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.studentEmail || 'ID: #' + p.studentId}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {p.planName || 'Membership #' + p.membershipId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Txn: {p.transactionId}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {fmtINR(p.amount)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <MethIcon size={12} /> {meth.label}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: stat.bg,
                          color: stat.color,
                          border: '1px solid ' + stat.border,
                        }}>
                          <StatIcon size={10} /> {stat.label}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="View Receipt"
                          >
                            <FaReceipt /> Receipt
                          </button>
                          <button
                            onClick={() => {
                              setStatusModalPayment(p);
                              setNewStatus(p.paymentStatus);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Update Status"
                          >
                            <FaExchangeAlt /> Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModalPayment && (
        <Modal
          isOpen={Boolean(statusModalPayment)}
          onClose={() => setStatusModalPayment(null)}
          title="Update Transaction Status"
        >
          <form onSubmit={handleUpdateStatusSubmit} style={{ padding: '0.5rem 0' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Invoice: <strong>{statusModalPayment.invoiceNumber}</strong></div>
              <div style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>
                Member: {statusModalPayment.studentName} — {fmtINR(statusModalPayment.amount)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Current Status: <strong>{statusModalPayment.paymentStatus}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Select New Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#161b22',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <option value="SUCCESS">SUCCESS (Mark Paid & Activate Membership)</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setStatusModalPayment(null)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                Save Status
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Receipt Modal */}
      {selectedPayment && (
        <Modal
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          title="Payment Transaction Receipt"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
                    ELITE GYM
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Official Payment Voucher
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    {selectedPayment.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {fmtDateTime(selectedPayment.paidAt || selectedPayment.createdAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Billed To:</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.studentName || 'Student'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedPayment.studentEmail}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Subscription Plan:</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.planName || 'Gym Membership'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Membership #{selectedPayment.membershipId}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Transaction ID:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedPayment.transactionId}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Payment Method:</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.paymentMethod}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Paid:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e' }}>
                  {fmtINR(selectedPayment.amount)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="btn btn-secondary"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManagePayments;
