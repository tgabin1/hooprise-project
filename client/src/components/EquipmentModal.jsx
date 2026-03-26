import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EquipmentModal({ isOpen, onClose, user }) {
  const [tab, setTab]               = useState('browse');
  const [equipment, setEquipment]   = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [selected, setSelected]     = useState(null);

  const [requestForm, setRequestForm] = useState({
    user_name: '', user_email: '', user_phone: '', message: ''
  });

  const [shareForm, setShareForm] = useState({
    name: '', description: '', quantity: 1,
    condition_status: 'good'
  });

  useEffect(() => {
    if (!isOpen) return;
    fetchEquipment();
    if (user) {
      setRequestForm(p => ({
        ...p,
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email
      }));
      fetchMyRequests();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      setTab('browse');
      setError('');
      setSuccess('');
      setSelected(null);
    }
  }, [isOpen]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/equipment`);
      const data = await res.json();
      setEquipment(data);
    } catch {
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/equipment/my-requests/${user.email}`);
      const data = await res.json();
      setMyRequests(data);
    } catch {
      setMyRequests([]);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/equipment/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestForm, equipment_id: selected.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Request submitted! Admin will contact you soon.');
      setSelected(null);
      fetchMyRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/equipment/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shareForm,
          owner_email: user?.email || '',
          owner_name: user ? `${user.first_name} ${user.last_name}` : ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Equipment shared successfully! Other youth can now request it.');
      setShareForm({ name: '', description: '', quantity: 1, condition_status: 'good' });
      fetchEquipment();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const conditionColor = (c) => ({
    new: '#22c55e', good: '#86efac', fair: '#f5a623', poor: '#f87171'
  }[c] || '#fff');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay is-open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--history" style={{ maxWidth: 600 }}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__header">
          <span className="section-tag">Equipment</span>
          <h2>Sports Equipment</h2>
          <p className="modal__meta">Borrow or share sports equipment with the community</p>
        </div>

        <div className="modal-tabs" style={{ marginBottom: '1rem' }}>
          <button className={`modal-tab${tab === 'browse' ? ' modal-tab--active' : ''}`} onClick={() => { setTab('browse'); setError(''); setSuccess(''); setSelected(null); }}>
            Browse
          </button>
          <button className={`modal-tab${tab === 'share' ? ' modal-tab--active' : ''}`} onClick={() => { setTab('share'); setError(''); setSuccess(''); }}>
            Share
          </button>
          {user && (
            <button className={`modal-tab${tab === 'requests' ? ' modal-tab--active' : ''}`} onClick={() => { setTab('requests'); setError(''); setSuccess(''); }}>
              My Requests
            </button>
          )}
        </div>

        {error   && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</p>}
        {success && <p style={{ color: '#22c55e', fontSize: 13, marginBottom: 8 }}>{success}</p>}

        {/* Browse Tab */}
        {tab === 'browse' && (
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Loading…</p>
            ) : selected ? (
              <div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#f5a623', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to list
                </button>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem' }}>{selected.name}</h4>
                  <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{selected.description}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span>Qty: {selected.quantity}</span>
                    <span style={{ color: conditionColor(selected.condition_status) }}>
                      ● {selected.condition_status}
                    </span>
                    <span style={{ opacity: 0.6 }}>By: {selected.owner_name}</span>
                  </div>
                </div>

                <form className="modal-form" onSubmit={handleRequest}>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input type="text" required value={requestForm.user_name}
                      onChange={e => setRequestForm(p => ({ ...p, user_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Your Email</label>
                    <input type="email" required value={requestForm.user_email}
                      onChange={e => setRequestForm(p => ({ ...p, user_email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+250 7XX XXX XXX" value={requestForm.user_phone}
                      onChange={e => setRequestForm(p => ({ ...p, user_phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Message (optional)</label>
                    <textarea placeholder="Why do you need this equipment?" rows={3}
                      value={requestForm.message}
                      onChange={e => setRequestForm(p => ({ ...p, message: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
                    {loading ? 'Submitting…' : 'Request Equipment'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="history-list">
                {equipment.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No equipment available right now.</p>
                ) : equipment.map(item => (
                  <div key={item.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                        <span style={{
                          fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 999,
                          background: item.available ? '#22c55e22' : '#f8717122',
                          color: item.available ? '#22c55e' : '#f87171'
                        }}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p style={{ opacity: 0.6, fontSize: '0.8rem', margin: 0 }}>
                        Qty: {item.quantity} · <span style={{ color: conditionColor(item.condition_status) }}>● {item.condition_status}</span> · By {item.owner_name}
                      </p>
                    </div>
                    {item.available && (
                      <button className="btn btn--gold btn--sm" onClick={() => setSelected(item)}>
                        Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Share Tab */}
        {tab === 'share' && (
          <form className="modal-form" onSubmit={handleShare}>
            <div className="form-group">
              <label>Equipment Name</label>
              <input type="text" placeholder="e.g. Basketball, Shoes..." required
                value={shareForm.name}
                onChange={e => setShareForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" placeholder="Brief description..."
                value={shareForm.description}
                onChange={e => setShareForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={shareForm.quantity}
                onChange={e => setShareForm(p => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select value={shareForm.condition_status}
                onChange={e => setShareForm(p => ({ ...p, condition_status: e.target.value }))}>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
              {loading ? 'Sharing…' : 'Share Equipment'}
            </button>
          </form>
        )}

        {/* My Requests Tab */}
        {tab === 'requests' && (
          <div className="history-list">
            {myRequests.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No requests yet.</p>
            ) : myRequests.map(r => (
              <div key={r.id} className="history-item">
                <div className="history-item__header">
                  <h4>{r.equipment_name}</h4>
                  <span className={`history-item__status history-item__status--${r.status}`}>
                    {r.status}
                  </span>
                </div>
                <p className="history-item__meta">{r.message || 'No message'}</p>
                <p style={{ opacity: 0.5, fontSize: '0.75rem', margin: 0 }}>
                  Requested on {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}