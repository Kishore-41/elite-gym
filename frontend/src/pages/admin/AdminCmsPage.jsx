import React, { useState, useEffect } from 'react';
import { 
  FaDumbbell, FaTrophy, FaComments, FaCalendarAlt, FaQuestionCircle, 
  FaPlus, FaEdit, FaTrashAlt, FaCheck, FaTimes, FaToggleOn, FaToggleOff 
} from 'react-icons/fa';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';

const AdminCmsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('FACILITIES');
  const [loading, setLoading] = useState(false);

  // State data
  const [facilities, setFacilities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form buffers
  const [facilityForm, setFacilityForm] = useState({ name: '', category: 'STRENGTH', description: '', rules: '', capacity: 50, operationalHours: '05:00 AM - 11:00 PM', imageUrl: '' });
  const [achievementForm, setAchievementForm] = useState({ title: '', organization: '', yearAwarded: 2025, description: '', badgeIconUrl: '' });
  const [testimonialForm, setTestimonialForm] = useState({ memberName: '', roleOrPlan: 'Elite Member', rating: 5, reviewText: '', avatarUrl: '', approved: true });
  const [scheduleForm, setScheduleForm] = useState({ title: '', dayOfWeek: 'MONDAY', startTime: '07:00:00', endTime: '08:00:00', capacity: 20, room: 'Studio A' });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'GENERAL', displayOrder: 1 });

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'FACILITIES') {
        const res = await cmsService.getAllFacilities();
        if (res?.data) setFacilities(res.data);
      } else if (activeTab === 'ACHIEVEMENTS') {
        const res = await cmsService.getAllAchievements();
        if (res?.data) setAchievements(res.data);
      } else if (activeTab === 'TESTIMONIALS') {
        const res = await cmsService.getAllTestimonials();
        if (res?.data) setTestimonials(res.data);
      } else if (activeTab === 'SCHEDULES') {
        const res = await cmsService.getAllSchedules();
        if (res?.data) setSchedules(res.data);
      } else if (activeTab === 'FAQS') {
        const res = await cmsService.getAllFaqs();
        if (res?.data) setFaqs(res.data);
      }
    } catch (err) {
      console.error('Error loading CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Facility Actions
  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createFacility(facilityForm);
      toast.success('Facility added successfully!');
      setShowAddModal(false);
      loadTabData();
    } catch (err) {
      toast.error('Could not create facility.');
    }
  };

  const handleToggleFacility = async (id, currentStatus) => {
    try {
      await cmsService.toggleFacilityStatus(id, !currentStatus);
      toast.info('Facility status updated.');
      loadTabData();
    } catch (err) {
      toast.error('Error updating facility status.');
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      await cmsService.deleteFacility(id);
      toast.success('Facility deleted.');
      loadTabData();
    } catch (err) {
      toast.error('Failed to delete facility.');
    }
  };

  // Achievement Actions
  const handleCreateAchievement = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createAchievement(achievementForm);
      toast.success('Achievement milestone saved!');
      setShowAddModal(false);
      loadTabData();
    } catch (err) {
      toast.error('Could not save achievement.');
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await cmsService.deleteAchievement(id);
      toast.success('Achievement removed.');
      loadTabData();
    } catch (err) {
      toast.error('Failed to delete achievement.');
    }
  };

  // Testimonial Actions
  const handleApproveTestimonial = async (id, approved) => {
    try {
      await cmsService.approveTestimonial(id, approved);
      toast.success(`Review ${approved ? 'Approved' : 'Hidden'}!`);
      loadTabData();
    } catch (err) {
      toast.error('Failed to update testimonial status.');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial review?')) return;
    try {
      await cmsService.deleteTestimonial(id);
      toast.success('Review deleted.');
      loadTabData();
    } catch (err) {
      toast.error('Failed to delete testimonial.');
    }
  };

  // Schedule Actions
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createSchedule(scheduleForm);
      toast.success('Class slot created!');
      setShowAddModal(false);
      loadTabData();
    } catch (err) {
      toast.error('Failed to create schedule.');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Cancel/Delete this class slot?')) return;
    try {
      await cmsService.deleteSchedule(id);
      toast.success('Class slot removed.');
      loadTabData();
    } catch (err) {
      toast.error('Failed to delete schedule slot.');
    }
  };

  // FAQ Actions
  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createFaq(faqForm);
      toast.success('FAQ entry added!');
      setShowAddModal(false);
      loadTabData();
    } catch (err) {
      toast.error('Failed to add FAQ.');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ entry?')) return;
    try {
      await cmsService.deleteFaq(id);
      toast.success('FAQ entry deleted.');
      loadTabData();
    } catch (err) {
      toast.error('Failed to delete FAQ.');
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', color: '#F3F4F6' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Administrator Command Center
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '0.2rem' }}>
              Dynamic CMS & Catalog Management
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
          >
            <FaPlus size={13} /> Add New Entry
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { id: 'FACILITIES', label: 'Facilities & Zones', icon: <FaDumbbell /> },
            { id: 'ACHIEVEMENTS', label: 'Awards & Honors', icon: <FaTrophy /> },
            { id: 'TESTIMONIALS', label: 'Member Reviews', icon: <FaComments /> },
            { id: 'SCHEDULES', label: 'Weekly Timetable', icon: <FaCalendarAlt /> },
            { id: 'FAQS', label: 'FAQ Policies', icon: <FaQuestionCircle /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeTab === tab.id ? 'rgba(245, 158, 11, 0.15)' : '#13131A',
                color: activeTab === tab.id ? '#F59E0B' : '#9CA3AF',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'FACILITIES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {facilities.map((fac) => (
              <div key={fac.id} style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F3F4F6' }}>{fac.name}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: fac.active ? 'rgba(0, 230, 118, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: fac.active ? '#00E676' : '#EF4444' }}>
                    {fac.active ? 'ACTIVE' : 'CLOSED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600, marginBottom: '0.5rem' }}>{fac.category}</div>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.5, marginBottom: '1rem' }}>{fac.description}</p>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
                  Capacity: <strong>{fac.capacity}</strong> • Hours: <strong>{fac.operationalHours}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleToggleFacility(fac.id, fac.active)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                    {fac.active ? <><FaToggleOff /> Deactivate</> : <><FaToggleOn /> Activate</>}
                  </button>
                  <button onClick={() => handleDeleteFacility(fac.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ACHIEVEMENTS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {achievements.map((ach) => (
              <div key={ach.id} style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 }}>{ach.organization} • {ach.yearAwarded}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F3F4F6', margin: '0.35rem 0 0.5rem' }}>{ach.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.5 }}>{ach.description}</p>
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleDeleteAchievement(ach.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: '6px', padding: '0.45rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaTrashAlt size={11} /> Delete Milestone
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'TESTIMONIALS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {testimonials.map((t) => (
              <div key={t.id} style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <strong style={{ color: '#F3F4F6' }}>{t.memberName}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>({t.roleOrPlan})</span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: t.approved ? 'rgba(0, 230, 118, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: t.approved ? '#00E676' : '#F59E0B' }}>
                      {t.approved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#D1D5DB', fontStyle: 'italic' }}>"{t.reviewText}"</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApproveTestimonial(t.id, !t.approved)} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                    {t.approved ? 'Hide Review' : 'Approve Review'}
                  </button>
                  <button onClick={() => handleDeleteTestimonial(t.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: '6px', padding: '0.45rem 0.75rem', cursor: 'pointer' }}>
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SCHEDULES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {schedules.map((s) => (
              <div key={s.id} style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>{s.dayOfWeek} • {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F3F4F6', margin: '0.2rem 0' }}>{s.title}</h3>
                  <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Trainer: {s.trainerName || 'Staff'} • Room: {s.room} • Cap: {s.capacity}</div>
                </div>
                <button onClick={() => handleDeleteSchedule(s.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: '6px', padding: '0.5rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaTrashAlt size={12} /> Cancel Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'FAQS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((f) => (
              <div key={f.id} style={{ background: '#13131A', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>{f.category}</span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F3F4F6', margin: '0.25rem 0 0.5rem' }}>{f.question}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.5 }}>{f.answer}</p>
                </div>
                <button onClick={() => handleDeleteFaq(f.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
                  <FaTrashAlt size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Add Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <FaTimes size={18} />
              </button>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F3F4F6', marginBottom: '1.25rem' }}>
                Add New {activeTab.slice(0, -1)}
              </h2>

              {activeTab === 'FACILITIES' && (
                <form onSubmit={handleCreateFacility} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <input type="text" required placeholder="Facility Name" value={facilityForm.name} onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <select value={facilityForm.category} onChange={(e) => setFacilityForm({ ...facilityForm, category: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                    <option value="STRENGTH">STRENGTH</option>
                    <option value="CARDIO">CARDIO</option>
                    <option value="SWIMMING_POOL">SWIMMING_POOL</option>
                    <option value="SPA_RECOVERY">SPA_RECOVERY</option>
                  </select>
                  <textarea placeholder="Description" rows={3} value={facilityForm.description} onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <textarea placeholder="Rules & Protocols" rows={2} value={facilityForm.rules} onChange={(e) => setFacilityForm({ ...facilityForm, rules: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <input type="number" required placeholder="Capacity" value={facilityForm.capacity} onChange={(e) => setFacilityForm({ ...facilityForm, capacity: Number(e.target.value) })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <input type="text" placeholder="Image URL (Unsplash)" value={facilityForm.imageUrl} onChange={(e) => setFacilityForm({ ...facilityForm, imageUrl: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>Save Facility</button>
                </form>
              )}

              {activeTab === 'ACHIEVEMENTS' && (
                <form onSubmit={handleCreateAchievement} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <input type="text" required placeholder="Award / Milestone Title" value={achievementForm.title} onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <input type="text" placeholder="Organization" value={achievementForm.organization} onChange={(e) => setAchievementForm({ ...achievementForm, organization: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <input type="number" placeholder="Year Awarded" value={achievementForm.yearAwarded} onChange={(e) => setAchievementForm({ ...achievementForm, yearAwarded: Number(e.target.value) })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <textarea placeholder="Description" rows={3} value={achievementForm.description} onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>Save Achievement</button>
                </form>
              )}

              {activeTab === 'SCHEDULES' && (
                <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <input type="text" required placeholder="Class Title (e.g. HIIT Surge)" value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <select value={scheduleForm.dayOfWeek} onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input type="time" required value={scheduleForm.startTime.substring(0, 5)} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: `${e.target.value}:00` })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <input type="time" required value={scheduleForm.endTime.substring(0, 5)} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: `${e.target.value}:00` })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  </div>
                  <input type="number" required placeholder="Capacity" value={scheduleForm.capacity} onChange={(e) => setScheduleForm({ ...scheduleForm, capacity: Number(e.target.value) })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <input type="text" placeholder="Room / Zone" value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>Save Schedule Slot</button>
                </form>
              )}

              {activeTab === 'FAQS' && (
                <form onSubmit={handleCreateFaq} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <input type="text" required placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <textarea required placeholder="Answer" rows={3} value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <select value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} style={{ padding: '0.7rem', background: '#0A0A0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                    <option value="GENERAL">GENERAL</option>
                    <option value="MEMBERSHIP">MEMBERSHIP</option>
                    <option value="FACILITIES">FACILITIES</option>
                    <option value="TRAINING">TRAINING</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>Save FAQ</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCmsPage;
