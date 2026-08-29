import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaPlus, FaChartLine, FaWeightHanging, FaRulerVertical, FaDumbbell,
  FaImages, FaTrash, FaEdit, FaTimes, FaCheck,
  FaFileAlt, FaCalendarAlt, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { progressService } from '../../services/progressService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const CARD_BASE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
  border: '1px solid var(--border-glass)',
  borderRadius: '16px',
  padding: '1.25rem',
};

const MEASUREMENT_DEFS = [
  { key: 'weightKg', label: 'Weight', unit: 'kg', accent: '#f59e0b', Icon: FaWeightHanging, chart: true },
  { key: 'heightCm', label: 'Height', unit: 'cm', accent: '#8b5cf6', Icon: FaRulerVertical, chart: false },
  { key: 'bodyFatPct', label: 'Body Fat', unit: '%', accent: '#ef4444', Icon: FaChartLine, chart: true },
  { key: 'muscleMassKg', label: 'Muscle Mass', unit: 'kg', accent: '#22c55e', Icon: FaDumbbell, chart: true },
  { key: 'chestCm', label: 'Chest', unit: 'cm', accent: '#3b82f6', Icon: FaRulerVertical, chart: false },
  { key: 'waistCm', label: 'Waist', unit: 'cm', accent: '#06b6d4', Icon: FaRulerVertical, chart: true },
  { key: 'hipsCm', label: 'Hips', unit: 'cm', accent: '#a855f7', Icon: FaRulerVertical, chart: false },
  { key: 'armCm', label: 'Arm', unit: 'cm', accent: '#ec4899', Icon: FaRulerVertical, chart: false },
  { key: 'thighCm', label: 'Thigh', unit: 'cm', accent: '#14b8a6', Icon: FaRulerVertical, chart: false },
];

const toISODate = (d) => {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const numOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const fmt = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1);
};

const diffBadge = (delta, lowerIsBetter = false) => {
  const n = Number(delta);
  if (!Number.isFinite(n) || Math.abs(n) < 0.001) {
    return <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>±0</span>;
  }
  const improved = lowerIsBetter ? n < 0 : n > 0;
  const Arrow = improved ? FaArrowUp : FaArrowDown;
  const color = improved ? '#22c55e' : '#ef4444';
  const sign = n > 0 ? '+' : '';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color, fontWeight: 600 }}>
      <Arrow size={9} /> {sign}{n.toFixed(1)}
    </span>
  );
};

// Lightweight inline SVG line chart (no extra dependencies)
const LineChart = ({ data, color = '#f59e0b', height = 140 }) => {
  if (!data || data.length === 0) return null;
  const width = 600;
  const padX = 24;
  const padY = 20;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const values = data.map((d) => Number(d.value));
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const span = Math.max(0.0001, maxY - minY);
  const xStep = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padX + i * xStep;
    const y = padY + h - ((Number(d.value) - minY) / span) * h;
    return { x, y, date: d.label, value: d.value };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${points[points.length - 1].x} ${padY + h} L ${points[0].x} ${padY + h} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '380px', display: 'block' }}>
        <defs>
          <linearGradient id="pg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={padX} x2={width - padX}
            y1={padY + h * f} y2={padY + h * f}
            stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
        ))}
        <path d={area} fill="url(#pg-fill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#090c10" stroke={color} strokeWidth="2" />
            <text x={p.x} y={padY + h + 14} textAnchor="middle"
              fill="rgba(255,255,255,0.55)" fontSize="10">{p.date}</text>
            <text x={p.x} y={p.y - 8} textAnchor="middle"
              fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight={600}>{fmt(p.value)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const PHOTO_TYPE_LABEL = { BEFORE: 'Before', AFTER: 'After', PROGRESS: 'Progress' };
const PHOTO_TYPE_COLOR = { BEFORE: '#ef4444', AFTER: '#22c55e', PROGRESS: '#06b6d4' };

const ProgressPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [chartMetric, setChartMetric] = useState('weightKg');

  const emptyForm = () => ({
    recordDate: toISODate(new Date()),
    weightKg: '', heightCm: '', bodyFatPct: '', muscleMassKg: '',
    chestCm: '', waistCm: '', hipsCm: '', armCm: '', thighCm: '',
    notes: '', photos: [],
  });

  const [form, setForm] = useState(emptyForm());

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await progressService.getMyProgress();
      if (res.success) setEntries(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const sortedAsc = useMemo(
    () => [...entries].sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate)),
    [entries]
  );

  const latest = sortedAsc.length ? sortedAsc[sortedAsc.length - 1] : null;
  const previous = sortedAsc.length > 1 ? sortedAsc[sortedAsc.length - 2] : null;

  const chartData = useMemo(() => {
    const metric = MEASUREMENT_DEFS.find((m) => m.key === chartMetric);
    if (!metric) return [];
    return sortedAsc
      .filter((e) => e[chartMetric] !== null && e[chartMetric] !== undefined && e[chartMetric] !== '')
      .map((e) => ({
        label: new Date(e.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: Number(e[chartMetric]),
      }));
  }, [sortedAsc, chartMetric]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalError('');
    setIsModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      recordDate: entry.recordDate,
      weightKg: entry.weightKg ?? '', heightCm: entry.heightCm ?? '',
      bodyFatPct: entry.bodyFatPct ?? '', muscleMassKg: entry.muscleMassKg ?? '',
      chestCm: entry.chestCm ?? '', waistCm: entry.waistCm ?? '',
      hipsCm: entry.hipsCm ?? '', armCm: entry.armCm ?? '',
      thighCm: entry.thighCm ?? '', notes: entry.notes ?? '',
      photos: (entry.photos || []).map((p) => ({ ...p })),
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const updatePhoto = (idx, field, value) => {
    setForm((f) => {
      const photos = [...(f.photos || [])];
      photos[idx] = { ...photos[idx], [field]: value };
      return { ...f, photos };
    });
  };

  const addPhoto = () => {
    setForm((f) => ({
      ...f,
      photos: [...(f.photos || []), { photoUrl: '', caption: '', photoType: 'PROGRESS' }],
    }));
  };

  const removePhoto = (idx) => {
    setForm((f) => ({ ...f, photos: (f.photos || []).filter((_, i) => i !== idx) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      setSubmitting(true);
      const payload = {
        recordDate: form.recordDate,
        weightKg: numOrNull(form.weightKg),
        heightCm: numOrNull(form.heightCm),
        bodyFatPct: numOrNull(form.bodyFatPct),
        muscleMassKg: numOrNull(form.muscleMassKg),
        chestCm: numOrNull(form.chestCm),
        waistCm: numOrNull(form.waistCm),
        hipsCm: numOrNull(form.hipsCm),
        armCm: numOrNull(form.armCm),
        thighCm: numOrNull(form.thighCm),
        notes: form.notes && String(form.notes).trim() ? form.notes.trim() : null,
        photos: (form.photos || [])
          .filter((p) => p && p.photoUrl && String(p.photoUrl).trim().length > 0)
          .map((p) => ({
            photoUrl: String(p.photoUrl).trim(),
            caption: p.caption && String(p.caption).trim() ? p.caption.trim() : null,
            photoType: p.photoType || 'PROGRESS',
          })),
      };
      const res = editingId
        ? await progressService.updateEntry(editingId, payload)
        : await progressService.createEntry(payload);
      if (res.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        setModalError(res.message || 'Failed to save.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (entryId) => {
    if (!window.confirm('Delete this progress entry? This cannot be undone.')) return;
    try {
      const res = await progressService.deleteEntry(entryId);
      if (res.success) await loadData();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Delete failed.');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Progress Tracking
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Log measurements, track trends, and document your journey.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', fontWeight: 600 }}
        >
          <FaPlus size={14} /> Log Progress
        </button>
      </motion.div>

      {loading && <Loader />}
      {!loading && error && (
        <div style={{ ...CARD_BASE, color: '#f87171', marginBottom: '1rem' }}>{error}</div>
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          title="No progress logged yet"
          description="Start by logging your first set of measurements."
          Icon={FaChartLine}
          actionLabel="Log First Entry"
          onAction={openCreate}
        />
      )}

      {!loading && entries.length > 0 && (
        <>
          {/* Summary cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {MEASUREMENT_DEFS.map(({ key, label, unit, accent, Icon }) => {
              const value = latest?.[key];
              const prev = previous?.[key];
              const delta = (value !== undefined && value !== null && value !== '' && prev !== undefined && prev !== null && prev !== '')
                ? Number(value) - Number(prev) : null;
              const lowerBetter = key === 'bodyFatPct' || key === 'waistCm' || key === 'weightKg';
              return (
                <div key={key} style={{ ...CARD_BASE, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: accent }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.03em' }}>
                      <Icon size={13} style={{ color: accent }} /> {label.toUpperCase()}
                    </div>
                    {delta !== null && diffBadge(delta, lowerBetter)}
                  </div>
                  <div style={{ paddingLeft: '0.5rem' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {fmt(value)}
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>{unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
            style={{ ...CARD_BASE, marginBottom: '1.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                <FaChartLine size={15} style={{ color: 'var(--accent-orange)' }} />
                Trend
              </div>
              <select
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                {MEASUREMENT_DEFS.filter((m) => m.chart).map((m) => (
                  <option key={m.key} value={m.key}>{m.label} ({m.unit})</option>
                ))}
              </select>
            </div>
            {chartData.length > 1 ? (
              <LineChart
                data={chartData}
                color={MEASUREMENT_DEFS.find((m) => m.key === chartMetric)?.accent || '#f59e0b'}
              />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Log at least 2 entries with this metric to see a trend line.
              </div>
            )}
          </motion.div>

          {/* History table / cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
            style={{ ...CARD_BASE }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
              <FaFileAlt size={15} style={{ color: 'var(--accent-cyan)' }} />
              History ({entries.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    padding: '1rem 1.1rem',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaCalendarAlt size={13} style={{ color: 'var(--accent-orange)' }} />
                      <span style={{ fontWeight: 700 }}>
                        {new Date(entry.recordDate).toLocaleDateString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openEdit(entry)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        title="Edit"
                      >
                        <FaEdit size={11} /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem', color: '#f87171' }}
                        title="Delete"
                      >
                        <FaTrash size={11} /> Delete
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.65rem',
                    marginBottom: entry.notes || entry.photos?.length ? '0.75rem' : 0,
                  }}>
                    {MEASUREMENT_DEFS.map(({ key, label, unit, accent }) => (
                      <div key={key} style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '10px',
                        borderLeft: `3px solid ${accent}`,
                        background: 'rgba(255,255,255,0.025)',
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                          {label}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {fmt(entry[key])} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {entry.notes && (
                    <div style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid var(--border-glass)',
                      marginBottom: entry.photos?.length ? '0.75rem' : 0,
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                    }}>
                      {entry.notes}
                    </div>
                  )}

                  {entry.photos && entry.photos.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <FaImages size={12} /> Photos ({entry.photos.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                        {entry.photos.map((p) => (
                          <div key={p.id} style={{ position: 'relative', maxWidth: '170px' }}>
                            <img
                              src={p.photoUrl}
                              alt={p.caption || 'progress photo'}
                              loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              style={{
                                width: '170px',
                                height: '170px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                border: '1px solid var(--border-glass)',
                                background: 'rgba(255,255,255,0.03)',
                              }}
                            />
                            <div style={{
                              position: 'absolute', top: '6px', left: '6px',
                              padding: '2px 8px', borderRadius: '999px',
                              background: PHOTO_TYPE_COLOR[p.photoType] || '#64748b',
                              color: '#fff', fontSize: '10px', fontWeight: 700,
                              letterSpacing: '0.04em',
                            }}>
                              {PHOTO_TYPE_LABEL[p.photoType] || p.photoType}
                            </div>
                            {p.caption && (
                              <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingInline: '2px' }}>
                                {p.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title={editingId ? 'Edit Progress Entry' : 'Log Progress Entry'}
      >
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div style={{ padding: '0.6rem 0.9rem', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', fontSize: '0.85rem' }}>
              {modalError}
            </div>
          )}

          <div>
            <label style={labelStyle}>Record Date *</label>
            <input
              type="date"
              required
              value={form.recordDate}
              onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem',
          }}>
            {MEASUREMENT_DEFS.map(({ key, label, unit, accent }) => (
              <div key={key}>
                <label style={labelStyle}>
                  {label}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>({unit})</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ ...inputStyle, borderLeft: `3px solid ${accent}` }}
                  placeholder={`${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="How are you feeling? Energy levels, workouts, observations..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                <FaImages size={12} style={{ marginRight: '4px' }} />
                Progress Photos
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '0.75rem' }}>
                  (Provide image URLs)
                </span>
              </label>
              <button
                type="button"
                onClick={addPhoto}
                style={{
                  padding: '0.3rem 0.65rem', borderRadius: '8px',
                  background: 'transparent', border: '1px solid var(--border-glass)',
                  color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                }}
              >
                + Add Photo
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(form.photos || []).length === 0 && (
                <div style={{
                  padding: '0.8rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
                  borderRadius: '10px', border: '1px dashed var(--border-glass)',
                }}>
                  No photos added for this entry.
                </div>
              )}
              {(form.photos || []).map((p, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center',
                  padding: '0.5rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-glass)',
                }}>
                  <input
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={p.photoUrl || ''}
                    onChange={(e) => updatePhoto(idx, 'photoUrl', e.target.value)}
                    style={{ ...inputStyle, padding: '0.4rem 0.6rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={p.caption || ''}
                    onChange={(e) => updatePhoto(idx, 'caption', e.target.value)}
                    style={{ ...inputStyle, padding: '0.4rem 0.6rem' }}
                  />
                  <select
                    value={p.photoType || 'PROGRESS'}
                    onChange={(e) => updatePhoto(idx, 'photoType', e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-glass)', color: 'var(--text-primary)',
                      padding: '0.4rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', outline: 'none',
                    }}
                  >
                    <option value="PROGRESS">Progress</option>
                    <option value="BEFORE">Before</option>
                    <option value="AFTER">After</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    title="Remove photo"
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'transparent', border: '1px solid var(--border-glass)',
                      color: '#f87171', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FaTimes size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {submitting ? <Loader inline /> : <FaCheck size={12} />}
              {submitting ? 'Saving…' : (editingId ? 'Update Entry' : 'Save Entry')}
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

export default ProgressPage;
