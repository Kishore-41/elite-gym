import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaWhatsapp, FaInstagram, FaYoutube, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '4rem 1.5rem 2rem',
      background: '#07070A',
      marginTop: 'auto',
      color: '#9CA3AF',
      fontSize: '0.9rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem',
        }}>
          {/* Column 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <FaDumbbell size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F3F4F6' }}>
                ELITE<span style={{ color: '#F59E0B' }}> ATHLETIC CLUB</span>
              </span>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
              Madurai's flagship high-performance sports and recovery arena. Engineered with Olympic platforms, 25m swimming pool, and hydrotherapy cedar saunas.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: '#F3F4F6' }}>
              <a href="#instagram" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}><FaInstagram size={18} /></a>
              <a href="#whatsapp" style={{ color: '#00E676', transition: 'color 0.2s' }}><FaWhatsapp size={18} /></a>
              <a href="#youtube" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}><FaYoutube size={18} /></a>
              <a href="#facebook" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}><FaFacebook size={18} /></a>
            </div>
          </div>

          {/* Column 2: Club Navigation */}
          <div>
            <h4 style={{ color: '#F3F4F6', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Club Experience
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/facilities" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}>Facilities & Amenities</Link></li>
              <li><Link to="/schedule" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}>Class Timetable</Link></li>
              <li><Link to="/trainers" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}>Certified Coaches</Link></li>
              <li><Link to="/membership-plans" style={{ color: '#9CA3AF', transition: 'color 0.2s' }}>Membership Tiers (INR)</Link></li>
              <li><Link to="/free-pass" style={{ color: '#F59E0B', fontWeight: 600 }}>Claim 1-Day Guest Pass</Link></li>
              <li><Link to="/complaint" style={{ color: '#FF8800', fontWeight: 600 }}>Grievance Redressal (Confidential)</Link></li>
            </ul>
          </div>

          {/* Column 3: Hours & Operations */}
          <div>
            <h4 style={{ color: '#F3F4F6', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Club Hours
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <FaClock color="#F59E0B" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#F3F4F6', fontWeight: 600, fontSize: '0.85rem' }}>Monday – Saturday</div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>5:00 AM – 10:30 PM</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <FaClock color="#F59E0B" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#F3F4F6', fontWeight: 600, fontSize: '0.85rem' }}>Sunday</div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>6:00 AM – 1:00 PM | 4:00 PM – 9:00 PM</div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                Olympic Pool closes 30 minutes prior to facility closing.
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Concierge */}
          <div>
            <h4 style={{ color: '#F3F4F6', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Madurai Concierge
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <FaMapMarkerAlt color="#EF4444" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>
                  Elite Athletic Club, Bye Pass Road, Near Aparna Towers, Ponmeni, Madurai, Tamil Nadu – 625016
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaPhoneAlt color="#00E5FF" size={13} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>+91 452 245 8890</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaWhatsapp color="#00E676" size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>+91 98421 77650</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaEnvelope color="#F59E0B" size={13} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#D1D5DB' }}>concierge@elitegym.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#6B7280',
        }}>
          <div>
            © {new Date().getFullYear()} Elite Athletic Club (Madurai, Tamil Nadu). All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/about" style={{ color: '#9CA3AF' }}>About Club</Link>
            <Link to="/faq" style={{ color: '#9CA3AF' }}>FAQs</Link>
            <Link to="/contact" style={{ color: '#9CA3AF' }}>Contact Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
