import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPasswordModal({ isOpen, onClose, user, onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      const res = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay is-open"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal--auth" style={{ maxWidth: 400 }}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__logo">
          <span className="logo-hoop">HOOP</span><span className="logo-rise">RISE</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>🔐 Admin Access</h3>
          <p style={{ opacity: 0.6, margin: 0, fontSize: '0.9rem' }}>Enter your password to continue</p>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</p>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Password</label>
            <div className="input-password">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="input-password__toggle" onClick={() => setShowPass(p => !p)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}