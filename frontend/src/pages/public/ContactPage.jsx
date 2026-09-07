import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'MEMBERSHIP',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (formData.inquiryType === 'OTHER') {
      console.log('[CONCIERGE_FEEDBACK_LOG]: Direct member feedback logged:', {
        timestamp: new Date().toISOString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: 'DIRECT_FEEDBACK',
        message: formData.message,
      });
      toast.success('Thank you for your valuable feedback! Our Madurai management team has logged your message.');
    } else {
      console.log('[CONCIERGE_INQUIRY_LOG]: Concierge lead logged:', formData);
      toast.success('Your message has been received! Our Madurai concierge desk will reach out within 2 hours.');
    }
  };

  return (
    <div style={{ padding: '4rem 1.5rem', color: '#F3F4F6' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Madurai Flagship Concierge
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
            Contact Elite Athletic Club
          </h1>
          <p style={{ color: '#9CA3AF', maxWidth: '600px', margin: '0.75rem auto 0', fontSize: '1rem' }}>
            Schedule an on-site private walkthrough at our Ponmeni campus, discuss corporate rates, or reach our front desk.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Contact Cards & Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '1.25rem' }}>
                Madurai Campus Location
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FaMapMarkerAlt color="#EF4444" size={18} style={{ marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#F3F4F6' }}>Elite Athletic Club Flagship</div>
                    <div style={{ color: '#9CA3AF', marginTop: '0.2rem', lineHeight: '1.5' }}>
                      Bye Pass Road, Near Aparna Towers, Ponmeni, Madurai, Tamil Nadu – 625016
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaPhoneAlt color="#00E5FF" size={16} style={{ flexShrink: 0 }} />
                  <div style={{ color: '#D1D5DB' }}>+91 452 245 8890</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaWhatsapp color="#00E676" size={17} style={{ flexShrink: 0 }} />
                  <div style={{ color: '#D1D5DB' }}>+91 98421 77650 (WhatsApp Support)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaEnvelope color="#F59E0B" size={16} style={{ flexShrink: 0 }} />
                  <div style={{ color: '#D1D5DB' }}>concierge@elitegym.in / support@elitegym.in</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '1.25rem' }}>
                Club Operational Hours
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Monday – Saturday</span>
                  <span style={{ fontWeight: 700, color: '#00E676' }}>5:00 AM – 10:30 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Sunday Morning</span>
                  <span style={{ fontWeight: 700, color: '#00E676' }}>6:00 AM – 1:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Sunday Evening</span>
                  <span style={{ fontWeight: 700, color: '#00E676' }}>4:00 PM – 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '1.25rem' }}>
              Direct Concierge Inquiry
            </h3>

            {submitted ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: '12px' }}>
                <FaCheckCircle color="#00E676" size={36} style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '0.5rem' }}>
                  Inquiry Dispatched
                </h4>
                <p style={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                  Thank you for contacting Elite Athletic Club Madurai. Our concierge team has received your message.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Sundar Raman"
                    style={{ width: '100%', padding: '0.7rem 0.85rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sundar@example.com"
                      style={{ width: '100%', padding: '0.7rem 0.85rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98421 00000"
                      style={{ width: '100%', padding: '0.7rem 0.85rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Inquiry Type *</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="MEMBERSHIP">Membership Tiers & Subscriptions (INR)</option>
                    <option value="TOUR">Schedule Campus Walkthrough</option>
                    <option value="TRAINING">1-on-1 Certified Coach Guidance</option>
                    <option value="CORPORATE">Corporate & Group Membership Plans</option>
                    <option value="OTHER">Other Inquiries / Direct Feedback</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Inquire about swimming pool access, personal training, or membership start dates..."
                    style={{ width: '100%', padding: '0.7rem 0.85rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <FaPaperPlane size={14} /> Send Message to Concierge
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
