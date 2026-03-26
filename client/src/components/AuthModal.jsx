import { useState, useEffect } from 'react';

const POSITIONS = ['Point Guard (PG)', 'Shooting Guard (SG)', 'Small Forward (SF)', 'Power Forward (PF)', 'Center (C)'];
const LOCATIONS = ['Kigali — Gasabo', 'Kigali — Kicukiro', 'Kigali — Nyarugenge', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', onSuccess }) {
  const [tab, setTab]         = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Show/hide password state
  const [showLoginPass, setShowLoginPass]       = useState(false);
  const [showSignupPass, setShowSignupPass]     = useState(false);
  const [showConfirmPass, setShowConfirmPass]   = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });

  // Signup form state
  const [signupData, setSignupData] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    position: '', location: '', password: '', confirm_password: '',
  });

  useEffect(() => {
  if (isOpen) {
    setTab(defaultTab);
    setError('');
  }
}, [isOpen, defaultTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.message, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Confirm password check
    if (signupData.password !== signupData.confirm_password) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.message, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setError(''); };

  return (
    <div className={`modal-overlay${isOpen ? ' is-open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--auth">
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__logo">
          <span className="logo-hoop">HOOP</span><span className="logo-rise">RISE</span>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab${tab === 'login'  ? ' modal-tab--active' : ''}`} onClick={() => switchTab('login')}>Log In</button>
          <button className={`modal-tab${tab === 'signup' ? ' modal-tab--active' : ''}`} onClick={() => switchTab('signup')}>Sign Up</button>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</p>}

        {/* ── Login Form ── */}
        {tab === 'login' && (
          <form className="modal-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" required
                value={loginData.email} onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-password">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={loginData.password}
                  onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" className="input-password__toggle" onClick={() => setShowLoginPass(p => !p)}>
                  {showLoginPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group form-group--row">
              <label className="checkbox-label">
                <input type="checkbox" checked={loginData.remember}
                  onChange={e => setLoginData(p => ({ ...p, remember: e.target.checked }))} /> Remember me
              </label>
              <a href="#" className="form-link">Forgot password?</a>
            </div>
            <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
            <p className="form-switch">Don't have an account? <a onClick={() => switchTab('signup')}>Sign up free</a></p>
          </form>
        )}

        {/* ── Sign Up Form ── */}
        {tab === 'signup' && (
          <form className="modal-form" onSubmit={handleSignupSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" placeholder="Jean" required
                  value={signupData.first_name} onChange={e => setSignupData(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" placeholder="Mutuyimana" required
                  value={signupData.last_name} onChange={e => setSignupData(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" required
                value={signupData.email} onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+250 7XX XXX XXX"
                value={signupData.phone} onChange={e => setSignupData(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Your Position</label>
              <select value={signupData.position} onChange={e => setSignupData(p => ({ ...p, position: e.target.value }))}>
                <option value="">Select position</option>
                {POSITIONS.map(pos => <option key={pos}>{pos}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location in Rwanda</label>
              <select value={signupData.location} onChange={e => setSignupData(p => ({ ...p, location: e.target.value }))}>
                <option value="">Select your district</option>
                {LOCATIONS.map(loc => <option key={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-password">
                <input
                  type={showSignupPass ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" className="input-password__toggle" onClick={() => setShowSignupPass(p => !p)}>
                  {showSignupPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-password">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  required
                  value={signupData.confirm_password}
                  onChange={e => setSignupData(p => ({ ...p, confirm_password: e.target.value }))}
                />
                <button type="button" className="input-password__toggle" onClick={() => setShowConfirmPass(p => !p)}>
                  {showConfirmPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="form-switch">Already have an account? <a onClick={() => switchTab('login')}>Log in</a></p>
          </form>
        )}
      </div>
    </div>
  );
}