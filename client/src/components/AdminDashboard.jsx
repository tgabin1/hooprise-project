import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard({ user, onClose }) {
  const [tab, setTab]               = useState('bookings');
  const [bookings, setBookings]     = useState([]);
  const [users, setUsers]           = useState([]);
  const [revenue, setRevenue]       = useState(null);
  const [courts, setCourts]         = useState([]);
  const [equipment, setEquipment]   = useState([]);
  const [equipRequests, setEquipRequests] = useState([]);
  const [programs, setPrograms]     = useState([]); // ← NEW
  const [programRegs, setProgramRegs] = useState([]); // ← NEW
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [courtForm, setCourtForm] = useState({
    name: '', location: '', surface: 'Concrete',
    court_type: 'Outdoor', price_rwf: 0, image_url: ''
  });
  const [editingCourt, setEditingCourt] = useState(null);

  // ← NEW: Program form state
  const [programForm, setProgramForm] = useState({
    title: '', description: '', location: '',
    start_date: '', end_date: '', start_time: '',
    max_participants: 20, category: 'training', price_rwf: 0
  });

  const headers = {
    'Content-Type': 'application/json',
    'admin-email': user?.email
  };

  const fetchData = async (endpoint, setter) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/${endpoint}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setter(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'bookings')  fetchData('bookings', setBookings);
    if (tab === 'users')     fetchData('users', setUsers);
    if (tab === 'revenue')   fetchData('revenue', setRevenue);
    if (tab === 'courts')    fetchData('courts', setCourts);
    if (tab === 'equipment') {
      fetchData('equipment', setEquipment);
      fetchData('equipment/requests', setEquipRequests);
    }
    // ← NEW
    if (tab === 'programs') {
      fetchData('programs', setPrograms);
      fetchData('programs/registrations', setProgramRegs);
    }
  }, [tab]);

  const handleAddCourt = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/courts`, {
        method: 'POST', headers, body: JSON.stringify(courtForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('courts', setCourts);
      setCourtForm({ name: '', location: '', surface: 'Concrete', court_type: 'Outdoor', price_rwf: 0, image_url: '' });
      alert('Court added!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditCourt = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/courts/${editingCourt.id}`, {
        method: 'PUT', headers, body: JSON.stringify(editingCourt)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('courts', setCourts);
      setEditingCourt(null);
      alert('Court updated!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCourt = async (id) => {
    if (!confirm('Are you sure you want to delete this court?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/courts/${id}`, {
        method: 'DELETE', headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('courts', setCourts);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEquipRequest = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/equipment/requests/${id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('equipment/requests', setEquipRequests);
      alert(`Request ${status}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // ← NEW: Add program
  const handleAddProgram = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/programs`, {
        method: 'POST', headers, body: JSON.stringify(programForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('programs', setPrograms);
      setProgramForm({ title: '', description: '', location: '', start_date: '', end_date: '', start_time: '', max_participants: 20, category: 'training', price_rwf: 0 });
      alert('Program created!');
    } catch (err) {
      alert(err.message);
    }
  };

  // ← NEW: Update program status
  const handleProgramStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/programs/${id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('programs', setPrograms);
    } catch (err) {
      alert(err.message);
    }
  };

  // ← NEW: Delete program
  const handleDeleteProgram = async (id) => {
    if (!confirm('Delete this program and all its registrations?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/programs/${id}`, {
        method: 'DELETE', headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('programs', setPrograms);
    } catch (err) {
      alert(err.message);
    }
  };

  const inputStyle = { padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' };
  const selectStyle = { padding: '0.75rem', borderRadius: '8px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>🏀 Admin Dashboard</h1>
            <p style={{ opacity: 0.6, margin: 0 }}>Welcome, {user?.first_name}</p>
          </div>
          <button className="btn btn--ghost" onClick={onClose}>Back to Site</button>
        </div>

        {/* Tabs — ← NEW: added 'programs' */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          {['bookings', 'revenue', 'courts', 'users', 'equipment', 'programs'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? '#f5a623' : 'transparent',
                color: tab === t ? '#000' : '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        {loading && <p style={{ opacity: 0.6 }}>Loading...</p>}

        {/* Bookings Tab */}
        {tab === 'bookings' && !loading && (
          <div>
            <h3>All Bookings ({bookings.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', opacity: 0.6 }}>
                  <th style={{ padding: '0.75rem' }}>Court</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>{b.court_name}</td>
                    <td style={{ padding: '0.75rem' }}>{b.user_name}<br /><span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{b.user_email}</span></td>
                    <td style={{ padding: '0.75rem' }}>{b.date}</td>
                    <td style={{ padding: '0.75rem' }}>{b.time_slot}</td>
                    <td style={{ padding: '0.75rem', color: '#f5a623' }}>{b.total_cost === 0 ? 'Free' : `${Number(b.total_cost).toLocaleString()} RWF`}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem',
                        background: b.status === 'confirmed' ? '#22c55e22' : '#f5a62322',
                        color: b.status === 'confirmed' ? '#22c55e' : '#f5a623'
                      }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Revenue Tab */}
        {tab === 'revenue' && !loading && revenue && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                <p style={{ opacity: 0.6, margin: 0 }}>Total Revenue</p>
                <h2 style={{ color: '#f5a623', margin: '0.5rem 0 0' }}>{Number(revenue.total).toLocaleString()} RWF</h2>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                <p style={{ opacity: 0.6, margin: 0 }}>Today's Revenue</p>
                <h2 style={{ color: '#22c55e', margin: '0.5rem 0 0' }}>{Number(revenue.today).toLocaleString()} RWF</h2>
              </div>
            </div>
            <h3>Revenue by Court</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', opacity: 0.6 }}>
                  <th style={{ padding: '0.75rem' }}>Court</th>
                  <th style={{ padding: '0.75rem' }}>Bookings</th>
                  <th style={{ padding: '0.75rem' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenue.byCourt.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>{c.name}</td>
                    <td style={{ padding: '0.75rem' }}>{c.bookings}</td>
                    <td style={{ padding: '0.75rem', color: '#f5a623' }}>{Number(c.revenue).toLocaleString()} RWF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Courts Tab */}
        {tab === 'courts' && !loading && (
          <div>
            <h3>Manage Courts</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem' }}>Add New Court</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <input placeholder="Court Name" value={courtForm.name} onChange={e => setCourtForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                <input placeholder="Location" value={courtForm.location} onChange={e => setCourtForm(p => ({ ...p, location: e.target.value }))} style={inputStyle} />
                <select value={courtForm.surface} onChange={e => setCourtForm(p => ({ ...p, surface: e.target.value }))} style={selectStyle}>
                  <option>Concrete</option>
                  <option>Hardwood</option>
                  <option>Asphalt</option>
                </select>
                <select value={courtForm.court_type} onChange={e => setCourtForm(p => ({ ...p, court_type: e.target.value }))} style={selectStyle}>
                  <option>Outdoor</option>
                  <option>Indoor</option>
                </select>
                <input type="number" placeholder="Price (RWF)" value={courtForm.price_rwf} onChange={e => setCourtForm(p => ({ ...p, price_rwf: e.target.value }))} style={inputStyle} />
                <input placeholder="Image URL" value={courtForm.image_url} onChange={e => setCourtForm(p => ({ ...p, image_url: e.target.value }))} style={inputStyle} />
              </div>
              <button onClick={handleAddCourt} className="btn btn--gold" style={{ marginTop: '1rem' }}>Add Court</button>
            </div>
            {courts.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingCourt?.id === c.id ? (
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <input value={editingCourt.name} onChange={e => setEditingCourt(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                    <input value={editingCourt.location} onChange={e => setEditingCourt(p => ({ ...p, location: e.target.value }))} style={inputStyle} />
                    <input type="number" value={editingCourt.price_rwf} onChange={e => setEditingCourt(p => ({ ...p, price_rwf: e.target.value }))} style={inputStyle} />
                    <input value={editingCourt.image_url || ''} onChange={e => setEditingCourt(p => ({ ...p, image_url: e.target.value }))} style={inputStyle} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleEditCourt} className="btn btn--gold btn--sm">Save</button>
                      <button onClick={() => setEditingCourt(null)} className="btn btn--ghost btn--sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 style={{ margin: 0 }}>{c.name}</h4>
                      <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>📍 {c.location} · {c.court_type} · {c.surface} · {c.price_rwf === 0 ? 'Free' : `${Number(c.price_rwf).toLocaleString()} RWF`}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingCourt(c)} className="btn btn--ghost btn--sm">Edit</button>
                      <button onClick={() => handleDeleteCourt(c.id)} style={{ background: '#f8717122', color: '#f87171', border: '1px solid #f87171', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && !loading && (
          <div>
            <h3>All Users ({users.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', opacity: 0.6 }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>{u.first_name} {u.last_name}</td>
                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>{u.location || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>{u.is_admin ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Equipment Tab */}
        {tab === 'equipment' && !loading && (
          <div>
            <h3>Equipment Requests ({equipRequests.length})</h3>
            {equipRequests.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No requests yet.</p>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                {equipRequests.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem' }}>{r.equipment_name}</h4>
                      <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>{r.user_name} · {r.user_email} · {r.user_phone || 'No phone'}</p>
                      {r.message && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', fontStyle: 'italic' }}>"{r.message}"</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', background: r.status === 'approved' ? '#22c55e22' : r.status === 'rejected' ? '#f8717122' : '#f5a62322', color: r.status === 'approved' ? '#22c55e' : r.status === 'rejected' ? '#f87171' : '#f5a623' }}>
                        {r.status}
                      </span>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleEquipRequest(r.id, 'approved')} className="btn btn--gold btn--sm">Approve</button>
                          <button onClick={() => handleEquipRequest(r.id, 'rejected')} style={{ background: '#f8717122', color: '#f87171', border: '1px solid #f87171', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <h3>All Equipment ({equipment.length})</h3>
            {equipment.map(e => (
              <div key={e.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem' }}>{e.name}</h4>
                  <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Qty: {e.quantity} · {e.condition_status} · By {e.owner_name} · {e.type}</p>
                </div>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', background: e.available ? '#22c55e22' : '#f8717122', color: e.available ? '#22c55e' : '#f87171' }}>
                  {e.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ← NEW: Programs Tab */}
        {tab === 'programs' && !loading && (
          <div>
            {/* Add Program Form */}
            <h3>Add New Program</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <input placeholder="Title" value={programForm.title} onChange={e => setProgramForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                <input placeholder="Location" value={programForm.location} onChange={e => setProgramForm(p => ({ ...p, location: e.target.value }))} style={inputStyle} />
                <input placeholder="Description" value={programForm.description} onChange={e => setProgramForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} />
                <select value={programForm.category} onChange={e => setProgramForm(p => ({ ...p, category: e.target.value }))} style={selectStyle}>
                  <option value="training">Training</option>
                  <option value="tournament">Tournament</option>
                  <option value="workshop">Workshop</option>
                  <option value="camp">Camp</option>
                </select>
                <input type="date" placeholder="Start Date" value={programForm.start_date} onChange={e => setProgramForm(p => ({ ...p, start_date: e.target.value }))} style={inputStyle} />
                <input type="date" placeholder="End Date" value={programForm.end_date} onChange={e => setProgramForm(p => ({ ...p, end_date: e.target.value }))} style={inputStyle} />
                <input type="time" placeholder="Start Time" value={programForm.start_time} onChange={e => setProgramForm(p => ({ ...p, start_time: e.target.value }))} style={inputStyle} />
                <input type="number" placeholder="Max Participants" value={programForm.max_participants} onChange={e => setProgramForm(p => ({ ...p, max_participants: e.target.value }))} style={inputStyle} />
                <input type="number" placeholder="Price (RWF)" value={programForm.price_rwf} onChange={e => setProgramForm(p => ({ ...p, price_rwf: e.target.value }))} style={inputStyle} />
              </div>
              <button onClick={handleAddProgram} className="btn btn--gold" style={{ marginTop: '1rem' }}>Create Program</button>
            </div>

            {/* Registrations */}
            <h3>Registrations ({programRegs.length})</h3>
            {programRegs.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No registrations yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', opacity: 0.6 }}>
                    <th style={{ padding: '0.75rem' }}>Program</th>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Email</th>
                    <th style={{ padding: '0.75rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programRegs.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>{r.program_title}</td>
                      <td style={{ padding: '0.75rem' }}>{r.user_name}</td>
                      <td style={{ padding: '0.75rem' }}>{r.user_email}</td>
                      <td style={{ padding: '0.75rem' }}>{r.user_phone || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', background: '#22c55e22', color: '#22c55e' }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Programs List */}
            <h3>All Programs ({programs.length})</h3>
            {programs.map(p => (
              <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem' }}>{p.title}</h4>
                  <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>
                    📍 {p.location} · {p.category} · {p.start_date} · {p.current_participants}/{p.max_participants} registered
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', background: p.status === 'open' ? '#22c55e22' : '#f8717122', color: p.status === 'open' ? '#22c55e' : '#f87171' }}>
                    {p.status}
                  </span>
                  {p.status === 'open' && (
                    <button onClick={() => handleProgramStatus(p.id, 'closed')} className="btn btn--ghost btn--sm">Close</button>
                  )}
                  {p.status === 'closed' && (
                    <button onClick={() => handleProgramStatus(p.id, 'open')} className="btn btn--gold btn--sm">Reopen</button>
                  )}
                  <button onClick={() => handleDeleteProgram(p.id)} style={{ background: '#f8717122', color: '#f87171', border: '1px solid #f87171', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}