import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-RW', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

const categoryColors = {
  training:   { bg: '#3b82f622', color: '#3b82f6' },
  tournament: { bg: '#f5a62322', color: '#f5a623' },
  workshop:   { bg: '#22c55e22', color: '#22c55e' },
  camp:       { bg: '#a855f722', color: '#a855f7' },
};

export default function Programs({ user, onLoginClick }) {
  const [programs, setPrograms]         = useState([]);
  const [selected, setSelected]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [registering, setRegistering]   = useState(false);
  const ref = useRef(null);

  const [form, setForm] = useState({
    user_name: '', user_email: '', user_phone: ''
  });

  useEffect(() => {
    fetch(`${API_URL}/api/programs`)
      .then(r => r.json())
      .then(data => setPrograms(data))
      .catch(() => setPrograms([]));
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('.fade-in-item');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    items.forEach((el, i) => { el.style.transitionDelay = `${i * 0.1}s`; observer.observe(el); });
    return () => observer.disconnect();
  }, [programs]);

  useEffect(() => {
    if (selected && user) {
      setForm({
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email,
        user_phone: ''
      });
    }
  }, [selected, user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/programs/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, program_id: selected.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setRegistering(false);
      // Update participant count locally
      setPrograms(prev => prev.map(p =>
        p.id === selected.id
          ? { ...p, current_participants: p.current_participants + 1 }
          : p
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="programs section" id="programs">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Get Involved</span>
          <h2 className="section-title">Programs {'&'} Events<br /><span className="text-gold">Near You</span></h2>
          <p className="section-sub">Join training camps, tournaments and workshops across Rwanda.</p>
        </div>

        {/* Program Cards */}
        {!selected && (
          <div className="programs__grid" ref={ref}>
            {programs.map(program => {
              const cat = categoryColors[program.category] || categoryColors.training;
              const spotsLeft = program.max_participants - program.current_participants;
              return (
                <div key={program.id} className="program-card fade-in-item">
                  <div className="program-card__header">
                    <span style={{ background: cat.bg, color: cat.color, padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {program.category}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 999,
                      background: program.status === 'open' ? '#22c55e22' : '#f8717122',
                      color: program.status === 'open' ? '#22c55e' : '#f87171'
                    }}>
                      {program.status === 'open' ? `${spotsLeft} spots left` : program.status}
                    </span>
                  </div>
                  <h4 className="program-card__title">{program.title}</h4>
                  <p className="program-card__desc">{program.description}</p>
                  <div className="program-card__details">
                    <span>📍 {program.location}</span>
                    <span>📅 {formatDate(program.start_date)}</span>
                    <span>🕐 {program.start_time}</span>
                    <span className="text-gold">{program.price_rwf === 0 ? 'Free' : `${program.price_rwf.toLocaleString()} RWF`}</span>
                  </div>
                  <div className="program-card__progress">
                    <div className="program-card__progress-bar">
                      <div
                        className="program-card__progress-fill"
                        style={{ width: `${(program.current_participants / program.max_participants) * 100}%` }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                      {program.current_participants}/{program.max_participants} registered
                    </span>
                  </div>
                  <button
                    className="btn btn--gold btn--sm"
                    disabled={program.status !== 'open'}
                    onClick={() => { setSelected(program); setError(''); setSuccess(''); setRegistering(false); }}
                  >
                    {program.status === 'open' ? 'Register Now' : program.status === 'full' ? 'Full' : 'Closed'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Program Detail + Registration */}
        {selected && (
          <div className="program-detail">
            <button
              onClick={() => { setSelected(null); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#f5a623', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
            >
              Back to Programs
            </button>

            <div className="program-detail__card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{selected.title}</h3>
                <span style={{ color: '#f5a623', fontWeight: 700, fontSize: '1.1rem' }}>
                  {selected.price_rwf === 0 ? 'Free' : `${selected.price_rwf.toLocaleString()} RWF`}
                </span>
              </div>
              <p style={{ opacity: 0.7, marginBottom: '1rem' }}>{selected.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <span>📍 {selected.location}</span>
                <span>📅 {formatDate(selected.start_date)}</span>
                <span>🕐 {selected.start_time}</span>
                <span>👥 {selected.max_participants - selected.current_participants} spots left</span>
              </div>

              {success && <p style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '1rem' }}>{success}</p>}
              {error   && <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

              {!success && (
                <>
                  {!registering ? (
                    <button className="btn btn--gold btn--lg" onClick={() => {
                      if (!user) { onLoginClick(); return; }
                      setRegistering(true);
                    }}>
                      {user ? 'Register for this Program' : 'Log in to Register'}
                    </button>
                  ) : (
                    <form onSubmit={handleRegister} className="modal-form">
                      <div className="form-group">
                        <label>Your Name</label>
                        <input type="text" required value={form.user_name}
                          onChange={e => setForm(p => ({ ...p, user_name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" required value={form.user_email}
                          onChange={e => setForm(p => ({ ...p, user_email: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" placeholder="+250 7XX XXX XXX" value={form.user_phone}
                          onChange={e => setForm(p => ({ ...p, user_phone: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn--gold btn--lg" disabled={loading}>
                          {loading ? 'Registering...' : 'Confirm Registration'}
                        </button>
                        <button type="button" className="btn btn--ghost btn--lg" onClick={() => setRegistering(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}