import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaCreditCard, FaRupeeSign, FaHistory, FaReceipt, FaCheckCircle,
  FaTimesCircle, FaHourglassHalf, FaUndoAlt, FaFileInvoice, FaCheck, FaTimes, FaWallet, FaMoneyBill, FaBuilding, FaMobile, FaCashRegister
} from 'react-icons/fa';
import { paymentService } from '../../services/paymentService';
import { membershipService } from '../../services/membershipService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';

const STATUS_STYLES = {
  SUCCESS: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', Icon: FaCheckCircle, label: 'Success' },
  PENDING: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', Icon: FaHourglassHalf, label: 'Pending' },
  FAILED: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', Icon: FaTimesCircle, label: 'Failed' },
  REFUNDED: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', Icon: FaUndoAlt, label: 'Refunded' },
};

const METHOD_STYLES = {
  CREDIT_CARD: { Icon: FaCreditCard, label: 'Credit Card', accent: '#3b82f6' },
  DEBIT_CARD: { Icon: FaCreditCard, label: 'Debit Card', accent: '#06b6d4' },
  UPI: { Icon: FaMobile, label: 'UPI', accent: '#22c55e' },
  NET_BANKING: { Icon: FaBuilding, label: 'Net Banking', accent: '#8b5cf6' },
  CASH: { Icon: FaCashRegister, label: 'Cash', accent: '#f59e0b' },
};

const fmtINR = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const genTxnId = () =>
  'TXN-WEB-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 900 + 100);

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.25rem',
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    membershipId: '',
    amount: '',
    paymentMethod: 'UPI',
    transactionId: genTxnId(),
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [payRes, memRes] = await Promise.all([
        paymentService.getMyPayments(),
        membershipService.getAllStudentMemberships(),
      ]);
      if (payRes.success) setPayments(payRes.data || []);
      if (memRes.success) setMemberships(memRes.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => {
    const paid = payments.filter((p) => p.paymentStatus === 'SUCCESS')
      .reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments.filter((p) => p.paymentStatus === 'PENDING')
      .reduce((s, p) => s + Number(p.amount), 0);
    const failed = payments.filter((p) => p.paymentStatus === 'FAILED').length;
    const refunded = payments.filter((p) => p.paymentStatus === 'REFUNDED')
      .reduce((s, p) => s + Number(p.amount), 0);
    return { paid, pending, failed, refunded, count: payments.length };
  }, [payments]);

  const openPay = () => {
    const defaultMem = memberships.find((m) => m.status === 'PENDING') || memberships[0];
    setForm({
      membershipId: defaultMem ? String(defaultMem.id) : '',
      amount: defaultMem ? String(defaultMem.planPrice || '') : '',
      paymentMethod: 'UPI',
      transactionId: genTxnId(),
      notes: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const selectedMembership = memberships.find((m) => String(m.id) === String(form.membershipId));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.membershipId) {
      setModalError('Please select a membership first. If you have none, subscribe on the Membership page.');
      return;
    }
    try {
      setSubmitting(true);
      setModalError('');
      const payload = {
        membershipId: Number(form.membershipId),
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        paymentStatus: 'SUCCESS',
        notes: form.notes || undefined,
      };
      const res = await paymentService.createPayment(payload);
      if (res.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        setModalError(res.message || 'Payment failed.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <Badge color="cyan" style={{ marginBottom: '0.5rem' }}>
            <FaWallet /> Payments
          </Badge>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            My Payments
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review transactions, invoices, and pay for pending memberships.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openPay}
          disabled={memberships.length === 0}
          title={memberships.length === 0 ? 'Subscribe to a plan first on the Membership page' : ''}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', fontWeight: 600 }}
        >
          <FaMoneyBill size={14} /> Pay Now
        </button>
      </motion.div>

      {loading && <Loader />}
      {!loading && error && (
        <div style={{ ...CARD_BASE, color: '#f87171', marginBottom: '1rem' }}>{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Summary */}
          {totals.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem', marginBottom: '1.5rem',
              }}
            >
              <div style={{ ...CARD_BASE, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#22c55e' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.6rem', paddingLeft: '0.5rem', textTransform: 'uppercase' }}>
                  <FaCheckCircle size={12} style={{ color: '#22c55e' }} /> Total Paid
                </div>
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <FaRupeeSign size={16} style={{ color: '#22c55e' }} />
                    {Number(totals.paid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div style={{ ...CARD_BASE, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.6rem', paddingLeft: '0.5rem', textTransform: 'uppercase' }}>
                  <FaHourglassHalf size={12} style={{ color: '#f59e0b' }} /> Pending
                </div>
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <FaRupeeSign size={16} style={{ color: '#f59e0b' }} />
                    {Number(totals.pending).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div style={{ ...CARD_BASE, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.6rem', paddingLeft: '0.5rem', textTransform: 'uppercase' }}>
                  <FaTimesCircle size={12} style={{ color: '#ef4444' }} /> Failed
                </div>
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {totals.failed}
                  </div>
                </div>
              </div>

              <div style={{ ...CARD_BASE, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#64748b' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '0.6rem', paddingLeft: '0.5rem', textTransform: 'uppercase' }}>
                  <FaUndoAlt size={12} style={{ color: '#64748b' }} /> Refunded
                </div>
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <FaRupeeSign size={16} style={{ color: '#64748b' }} />
                    {Number(totals.refunded).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            style={{ ...CARD_BASE }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
              <FaHistory size={15} style={{ color: 'var(--accent-orange)' }} />
              Payment History ({payments.length})
            </div>

            {payments.length === 0 ? (
              <EmptyState
                title="No payments yet"
                description="Your transactions will appear here once you pay for a membership."
                Icon={FaReceipt}
                actionLabel={memberships.length > 0 ? 'Make a Payment' : undefined}
                onAction={memberships.length > 0 ? openPay : undefined}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {payments.map((p) => {
                  const ss = STATUS_STYLES[p.paymentStatus] || STATUS_STYLES.PENDING;
                  const ms = METHOD_STYLES[p.paymentMethod] || METHOD_STYLES.UPI;
                  const SIcon = ss.Icon;
                  const MIcon = ms.Icon;
                  return (
                    <div key={p.id} style={{
                      border: '1px solid var(--border-glass)',
                      borderRadius: '14px',
                      padding: '1rem 1.1rem',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '0.75rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: '1 1 260px', minWidth: 0 }}>
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: ms.accent + '20',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: ms.accent, flexShrink: 0,
                          }}>
                            <MIcon size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.planName || 'Membership'}</span>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '2px 8px', borderRadius: '999px',
                                background: ss.bg, color: ss.color,
                                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.03em',
                              }}>
                                <SIcon size={9} /> {ss.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span><FaFileInvoice size={10} /> {p.invoiceNumber}</span>
                              <span>· {fmtDateTime(p.paidAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: ss.color, lineHeight: 1 }}>
                            {fmtINR(p.amount)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            via {ms.label}
                          </div>
                        </div>
                      </div>
                      {p.notes && (
                        <div style={{
                          marginTop: '0.75rem', padding: '0.6rem 0.8rem',
                          borderRadius: '10px', background: 'rgba(255,255,255,0.025)',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55,
                        }}>
                          {p.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Make a Payment"
      >
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div style={{ padding: '0.6rem 0.9rem', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', fontSize: '0.85rem' }}>
              {modalError}
            </div>
          )}

          <div>
            <label style={labelStyle}>Membership *</label>
            <select
              required
              value={form.membershipId}
              onChange={(e) => {
                const m = memberships.find((x) => String(x.id) === e.target.value);
                setForm({
                  ...form,
                  membershipId: e.target.value,
                  amount: m ? String(m.planPrice || form.amount) : form.amount,
                });
              }}
              style={inputStyle}
            >
              <option value="">-- Select membership --</option>
              {memberships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.planName} ({m.status}) — {fmtINR(m.planPrice)}
                </option>
              ))}
            </select>
            {selectedMembership && (
              <div style={{
                marginTop: '0.4rem', padding: '0.5rem 0.7rem',
                borderRadius: '10px', background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.25)',
                fontSize: '0.78rem', color: 'var(--text-secondary)',
              }}>
                Valid {new Date(selectedMembership.startDate).toLocaleDateString()} →{' '}
                {new Date(selectedMembership.endDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={inputStyle}
              placeholder="e.g. 2999"
            />
          </div>

          <div>
            <label style={labelStyle}>Payment Method *</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.5rem',
            }}>
              {Object.entries(METHOD_STYLES).map(([key, { Icon, label, accent }]) => {
                const active = form.paymentMethod === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setForm({ ...form, paymentMethod: key })}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: active ? `1px solid ${accent}` : '1px solid var(--border-glass)',
                      background: active ? accent + '15' : 'rgba(255,255,255,0.03)',
                      color: active ? accent : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.45rem',
                      fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={12} /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Transaction ID *</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                required
                value={form.transactionId}
                onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                style={{ ...inputStyle, fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, transactionId: genTxnId() })}
                title="Regenerate"
                style={{
                  padding: '0 0.8rem', borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--accent-cyan)', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.8rem',
                }}
              >
                ↻
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enter the reference ID from your bank / UPI app.
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any reference or remarks for this payment..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
            />
          </div>

          <div style={{
            padding: '0.75rem 0.9rem', borderRadius: '12px',
            background: 'rgba(34,197,94,0.07)', border: '1px dashed rgba(34,197,94,0.3)',
            fontSize: '0.8rem', color: '#86efac',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          }}>
            <FaCheckCircle size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
            Submitting will mark this payment as SUCCESS and activate the membership if currently pending.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <FaTimes size={11} /> Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {submitting ? <Loader inline /> : <FaCheck size={12} />}
              {submitting ? 'Processing…' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.55rem 0.8rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-glass)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: '0.88rem',
  outline: 'none',
  transition: 'border-color 0.15s, background 0.15s',
};

export default PaymentsPage;
