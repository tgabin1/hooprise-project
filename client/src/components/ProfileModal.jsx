import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const POSITIONS = ['Point Guard (PG)', 'Shooting Guard (SG)', 'Small Forward (SF)', 'Power Forward (PF)', 'Center (C)'];
const LOCATIONS = ['Kigali — Gasabo', 'Kigali — Kicukiro', 'Kigali — Nyarugenge', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-RW', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdate }) {
  const [tab, setTab]         = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [myPrograms, setMyPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: '', last_name: '', phone: '', location: '', position: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', confirm_password: ''
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass]         = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    fetch(`${API_URL}/api/auth/profile/${user.id}`)
      .then(r => r.json())
      .then(data => {
        setProfileData({
          first_name: data.first_name || '',
          last_name:  data.last_name  || '',
          phone:      data.phone      || '',
          location:   data.location   || '',
          position:   data.position   || ''
        });
      })
      .catch(() => {});
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      setTab('profile');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (tab === 'programs' && user) {
      setProgramsLoading(true);
      fetch(`${API_URL}/api/programs/my-registrations/${user.email}`)
        .then(r => r.json())
        .then(data => setMyPrograms(Array.isArray(data) ? data : []))
        .catch(() => setMyPrograms([]))
        .finally(() => setProgramsLoading(false));
    }
  }, [tab, user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Profile updated successfully!');
      onProfileUpdate({ ...user, first_name: profileData.first_name, last_name: profileData.last_name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay is-open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--auth" style={{ maxWidth: 500 }}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__logo">
          <span className="logo-hoop">HOOP</span><span className="logo-rise">RISE</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5a623, #e8920f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#000'
          }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <h3 style={{ margin: 0 }}>{user?.first_name} {user?.last_name}</h3>
          <p style={{ opacity: 0.6, margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{user?.email}</p>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab${tab === 'profile' ? ' modal-tab--active' : ''}`} onClick={() => { setTab('profile'); setError(''); setSuccess(''); }}>
            Profile
          </button>
          <button className={`modal-tab${tab === 'password' ? ' modal-tab--active' : ''}`} onClick={() => { setTab('password'); setError(''); setSuccess(''); }}>
            Password
          </button>
          <button className={`modal-tab${tab === 'programs' ? ' modal-tab--active' : ''}`} onClick={() => { setTab('programs'); setError(''); setSuccess(''); }}>
            Programs
          </button>
        </div>

        {error   && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</p>}
        {success && <p style={{ color: '#22c55e', fontSize: 13, marginBottom: 8 }}>{success}</p>}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <form className="modal-form" onSubmit={handleProfileSave}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" required value={profileData.first_name}
                  onChange={e => setProfileData(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" required value={profileData.last_name}
                  onChange={e => setProfileData(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+250 7XX XXX XXX" value={profileData.phone}
                onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Your Position</label>
              <select value={profileData.position} onChange={e => setProfileData(p => ({ ...p, position: e.target.value }))}>
                <option value="">Select position</option>
                {POSITIONS.map(pos => <option key={pos}>{pos}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location in Rwanda</label>
              <select value={profileData.location} onChange={e => setProfileData(p => ({ ...p, location: e.target.value }))}>
                <option value="">Select your district</option>
                {LOCATIONS.map(loc => <option key={loc}>{loc}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <form className="modal-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-password">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  placeholder="Enter current password" required
                  value={passwordData.current_password}
                  onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))}
                />
                <button type="button" className="input-password__toggle" onClick={() => setShowCurrentPass(p => !p)}>
                  {showCurrentPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-password">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Enter new password" required
                  value={passwordData.new_password}
                  onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                />
                <button type="button" className="input-password__toggle" onClick={() => setShowNewPass(p => !p)}>
                  {showNewPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-password">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Repeat new password" required
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                />
                <button type="button" className="input-password__toggle" onClick={() => setShowConfirmPass(p => !p)}>
                  {showConfirmPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}

        {/* Programs Tab */}
        {tab === 'programs' && (
          <div className="modal-form">
            {programsLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Loading...</p>
            ) : myPrograms.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                You have not registered for any programs yet.
              </p>
            ) : (
              <div className="history-list">
                {myPrograms.map(p => (
                  <div key={p.id} className="history-item">
                    <div className="history-item__header">
                      <h4>{p.title}</h4>
                      <span className="history-item__status history-item__status--confirmed">
                        {p.status}
                      </span>
                    </div>
                    <p className="history-item__meta">📍 {p.location}</p>
                    <div className="history-item__details">
                      <span>📅 {formatDate(p.start_date)}</span>
                      <span>🕐 {p.start_time}</span>
                      <span style={{ textTransform: 'capitalize', color: '#f5a623' }}>{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}