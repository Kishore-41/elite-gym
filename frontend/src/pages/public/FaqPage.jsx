import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaHeadset } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { publicInfoService } from '../../services/publicInfoService';

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const cat = selectedCategory === 'ALL' ? null : selectedCategory;
        const res = await publicInfoService.getFaqs(cat);
        if (res?.data) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error('Error fetching faqs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [selectedCategory]);

  const categories = [
    { id: 'ALL', label: 'All Questions' },
    { id: 'GENERAL', label: 'General & Passes' },
    { id: 'MEMBERSHIP', label: 'Memberships & Policies' },
    { id: 'FACILITIES', label: 'Pool & Recovery Amenities' },
    { id: 'TRAINING', label: 'Personal Coaching' },
  ];

  return (
    <div style={{ padding: '4rem 1.5rem', color: '#F3F4F6' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Help Center & Policies
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: '#9CA3AF', maxWidth: '600px', margin: '0.75rem auto 0', fontSize: '1rem' }}>
            Everything you need to know about memberships, guest passes, pool etiquette, and personal training.
          </p>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setOpenFaqIndex(0); }}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '30px',
                  border: selectedCategory === cat.id ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedCategory === cat.id ? 'rgba(245, 158, 11, 0.15)' : '#13131A',
                  color: selectedCategory === cat.id ? '#F59E0B' : '#9CA3AF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
          {(faqs?.length > 0 ? faqs : [
            {
              id: 1,
              question: 'How do guest passes work and how can I redeem one?',
              answer: 'Every prospective member is entitled to a 1-day complimentary VIP Guest Pass. Simply generate your pass online, and present the 8-character confirmation code along with a photo ID at the front desk upon arrival.',
            },
            {
              id: 2,
              question: 'Can I freeze or temporarily hold my membership?',
              answer: 'Yes, members on Pro Quarterly and Elite Annual tiers can freeze memberships for up to 60 days per calendar year with a 7-day advance notice through the member portal without cancellation fees.',
            },
            {
              id: 3,
              question: 'What locker room amenities are provided?',
              answer: 'All members receive access to biometric digital lockers, rainfall showers, Malin+Goetz bath amenities, and hair dryers. Elite tier members also receive private locker assignments and daily laundered towel service.',
            },
            {
              id: 4,
              question: 'What is the cancellation policy for memberships?',
              answer: 'Monthly memberships can be cancelled at any time with 14 days notice before the next billing cycle. Annual memberships include a 30-day money-back guarantee.',
            },
          ]).map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.id || idx}
                style={{
                  background: '#13131A',
                  border: isOpen ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'none',
                    border: 'none',
                    color: '#F3F4F6',
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{ color: isOpen ? '#F59E0B' : '#9CA3AF' }}>
                    {isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.5rem',
                      color: '#9CA3AF',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(0, 229, 255, 0.05) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#F59E0B', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
            <FaHeadset size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '0.5rem' }}>
            Have a Specific Question or Custom Inquiry?
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Our member concierge team is available 7 days a week to assist with membership inquiries and facility tours.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
