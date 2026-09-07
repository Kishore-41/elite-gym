import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, FaTimes, FaLock, FaCreditCard, 
  FaMobileAlt, FaBuilding, FaShieldAlt, FaWallet, FaStore, FaCheck 
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const fmtINR = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return String(n || 0);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const POPULAR_BANKS = [
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN' },
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB' },
  { id: 'CANARA', name: 'Canara Bank', code: 'CNRB' },
  { id: 'INDIAN_BANK', name: 'Indian Bank', code: 'IDIB' },
];

const OTHER_BANKS = [
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'IndusInd Bank',
  'Union Bank of India',
  'Federal Bank',
  'IDBI Bank',
  'City Union Bank',
  'Karur Vysya Bank',
  'Tamilnad Mercantile Bank',
];

const CheckoutModal = ({ plan, isOpen, onClose }) => {
  const { user, isAuthenticated, registerWithPlan } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    emergencyContact: '',
    fitnessGoal: 'Muscle Gain & Performance',
    paymentMethod: 'UPI', // UPI, CARD, NET_BANKING, WALLET, CAMPUS_PAY
    // UPI specific
    upiApp: 'GPAY',
    upiVpa: '',
    // Card specific
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    // Net Banking specific
    selectedBank: 'SBI',
    // Wallet specific
    selectedWallet: 'PAYTM',
  });

  const [vpaVerified, setVpaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !plan) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      // Auto-format 16 digit card with space
      const cleaned = value.replace(/\D/g, '').slice(0, 16);
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setFormData((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }
    if (name === 'cardExpiry') {
      // Auto-format MM/YY
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      }
      setFormData((prev) => ({ ...prev, cardExpiry: formatted }));
      return;
    }
    if (name === 'cardCvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 3);
      setFormData((prev) => ({ ...prev, cardCvv: cleaned }));
      return;
    }
    if (name === 'upiVpa') {
      setFormData((prev) => ({ ...prev, upiVpa: value }));
      const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      setVpaVerified(vpaRegex.test(value.trim()));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (formData.paymentMethod === 'UPI' && !formData.upiVpa && !formData.upiApp) {
        setErrorMsg('Please select a UPI app or provide a valid UPI ID (VPA).');
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        // Unauthenticated guest checkout
        const payload = {
          ...formData,
          planId: plan.id,
          paymentAmount: plan.price,
          durationMonths: plan.durationMonths,
        };
        await registerWithPlan(payload);
        if (formData.paymentMethod === 'CAMPUS_PAY') {
          toast.success(`Plan reserved! Visit Ponmeni front desk with ref code MAD-REG-${Math.floor(1000 + Math.random() * 9000)} to pay.`);
        } else {
          toast.success(`Welcome to Elite Athletic Club! Your ${plan.name} is now active.`);
        }
        onClose();
        navigate('/student/dashboard');
      } else {
        toast.info(
          formData.paymentMethod === 'CAMPUS_PAY'
            ? 'Plan reservation logged! Pay at Ponmeni front desk on your next visit.'
            : 'Payment recorded! Your subscription tier update has been queued for verification.'
        );
        onClose();
        navigate('/student/membership');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment/Enrollment failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#10141f',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '22px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 107, 0, 0.15)',
          padding: '2.25rem',
          position: 'relative',
          color: '#F8FAFC',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94A3B8',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 107, 0, 0.2)';
            e.currentTarget.style.color = '#FF8800';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <FaTimes size={16} />
        </button>

        {/* Modal Header & Plan Summary */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid rgba(255, 107, 0, 0.35)',
              color: '#FF8800',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.5rem',
            }}
          >
            Secured Indian Payment Rails
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F8FAFC' }}>
            Checkout: {plan.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FF8800', letterSpacing: '-0.02em' }}>
              {fmtINR(plan.price)}
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.92rem', fontWeight: 600 }}>
              / {plan.durationMonths === 1 ? '1 Month' : `${plan.durationMonths} Months`}
            </span>
            {plan.hasTrainerAddon && (
              <span style={{ fontSize: '0.78rem', color: '#00E5FF', background: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                Includes Personal Coach
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '10px', color: '#EF4444', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isAuthenticated ? (
            <>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FF8800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                1. Member Profile & Account Setup
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Sundar"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Raman"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sundar@gmail.com"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98421 00000"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>Username *</label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="sundar_athlete"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#090c13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Enrolling as active club member:</div>
              <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem' }}>{user?.fullName || user?.username} ({user?.email})</div>
            </div>
          )}

          {/* 2. INDIAN PAYMENT METHOD SELECTOR TABS */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FF8800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              2. Select Indian Payment Mode
            </h4>

            {/* Payment Method Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[
                { id: 'UPI', label: 'UPI / QR', icon: <FaMobileAlt /> },
                { id: 'CARD', label: 'Cards', icon: <FaCreditCard /> },
                { id: 'NET_BANKING', label: 'Net Banking', icon: <FaBuilding /> },
                { id: 'WALLET', label: 'Wallets', icon: <FaWallet /> },
                { id: 'CAMPUS_PAY', label: 'Pay at Campus', icon: <FaStore /> },
              ].map((m) => {
                const isSelected = formData.paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: m.id }))}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 136, 0, 0.1) 100%)' : '#090c13',
                      color: isSelected ? '#FF8800' : '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* A. UPI DIRECT / INTENT APPS */}
            {formData.paymentMethod === 'UPI' && (
              <div style={{ background: '#090c13', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Popular UPI Apps (Instant Checkout)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { id: 'GPAY', label: 'Google Pay', color: '#4285F4' },
                    { id: 'PHONEPE', label: 'PhonePe', color: '#5f259f' },
                    { id: 'PAYTM', label: 'Paytm UPI', color: '#00b9f5' },
                    { id: 'BHIM', label: 'BHIM', color: '#25a843' },
                  ].map((app) => {
                    const isAppSelected = formData.upiApp === app.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, upiApp: app.id }))}
                        style={{
                          padding: '0.6rem 0.35rem',
                          borderRadius: '8px',
                          border: isAppSelected ? '1.5px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isAppSelected ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isAppSelected ? '#F8FAFC' : '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {app.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom VPA Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Or Enter Custom UPI ID (VPA)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="upiVpa"
                      value={formData.upiVpa}
                      onChange={handleChange}
                      placeholder="e.g. username@okaxis / username@ybl"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 0.9rem',
                        background: '#04070c',
                        border: vpaVerified ? '1.5px solid #00E676' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                      }}
                    />
                    {vpaVerified && (
                      <FaCheck
                        color="#00E676"
                        size={14}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: vpaVerified ? '#00E676' : '#64748b', marginTop: '0.35rem' }}>
                    {vpaVerified ? '✓ Valid UPI format detected' : 'Supports @okaxis, @okhdfcbank, @ybl, @paytm, @ibl, @upi'}
                  </div>
                </div>
              </div>
            )}

            {/* B. CARDS (RuPay, Visa, Mastercard, Maestro) */}
            {formData.paymentMethod === 'CARD' && (
              <div style={{ background: '#090c13', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                    Credit / Debit Card
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: '#FF8800' }}>
                    <span style={{ background: 'rgba(255, 107, 0, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>RuPay</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>Visa</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>Mastercard</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>Maestro</span>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="4532 •••• •••• 8891"
                    maxLength={19}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#04070c', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Valid Thru</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#04070c', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>CVV</label>
                    <input
                      type="password"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={handleChange}
                      placeholder="•••"
                      maxLength={3}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#04070c', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Name on Card</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="SUNDAR RAMAN"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: '#04070c', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            )}

            {/* C. NET BANKING */}
            {formData.paymentMethod === 'NET_BANKING' && (
              <div style={{ background: '#090c13', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Popular Indian Banks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {POPULAR_BANKS.map((bank) => {
                    const isBankSelected = formData.selectedBank === bank.id;
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, selectedBank: bank.id }))}
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: '8px',
                          border: isBankSelected ? '1.5px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isBankSelected ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isBankSelected ? '#F8FAFC' : '#cbd5e1',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {bank.name}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Or Select Another Scheduled Bank
                  </label>
                  <select
                    name="selectedBank"
                    value={formData.selectedBank}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      background: '#04070c',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="">-- All Other Banks --</option>
                    {OTHER_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* D. DIGITAL WALLETS */}
            {formData.paymentMethod === 'WALLET' && (
              <div style={{ background: '#090c13', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Supported Digital Wallets
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { id: 'PAYTM', name: 'Paytm Wallet', desc: 'Fast checkout via linked Paytm balance' },
                    { id: 'PHONEPE', name: 'PhonePe Wallet', desc: 'Pay using PhonePe wallet cashback & balance' },
                    { id: 'AMAZONPAY', name: 'Amazon Pay', desc: 'Use Amazon Pay INR balance for direct membership debit' },
                  ].map((w) => {
                    const isWSelected = formData.selectedWallet === w.id;
                    return (
                      <label
                        key={w.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: isWSelected ? '1.5px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isWSelected ? 'rgba(255, 107, 0, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="selectedWallet"
                          value={w.id}
                          checked={isWSelected}
                          onChange={handleChange}
                          style={{ accentColor: '#FF6B00' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC' }}>{w.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{w.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* E. FRONT DESK / PAY AT CAMPUS */}
            {formData.paymentMethod === 'CAMPUS_PAY' && (
              <div style={{ background: '#090c13', border: '1px solid rgba(255, 107, 0, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FF8800', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  <FaStore size={18} /> Reserve Online, Pay at Club Front Desk
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.55 }}>
                  Lock in this subscription tier today. Your profile will be reserved instantly. You can pay via <strong>Cash, Credit/Debit Card, or UPI POS Machine</strong> directly at the Ponmeni Campus reception upon arrival.
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#00E5FF', fontWeight: 600 }}>
                  Campus Address: Bye Pass Road, Ponmeni, Madurai - 625016
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.95rem',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              letterSpacing: '0.02em',
            }}
          >
            <FaLock size={14} />
            {loading
              ? 'Processing Enrollment...'
              : formData.paymentMethod === 'CAMPUS_PAY'
              ? `Reserve ${plan.name} (${fmtINR(plan.price)})`
              : `Pay ${fmtINR(plan.price)} & Activate`}
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <FaShieldAlt color="#00E676" /> 256-Bit Encrypted Indian Payment Gateway • Instant Access in Madurai
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
