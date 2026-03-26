import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-RW', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BookingHistory({ isOpen, onClose, user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);

useEffect(() => {
    if (!isOpen || !user) return;
    console.log('Fetching bookings for:', user.email);
    setLoading(true);
    fetch(`${API_URL}/api/bookings/user/${user.email}`)
      .then(r => r.json())
      .then(data => {
        console.log('Bookings received:', data);
        setBookings(data);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay is-open"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal--history">
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__header">
          <span className="section-tag">My Bookings</span>
          <h2>Booking History</h2>
          <p className="modal__meta">All your past and upcoming bookings</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading…</p>
        ) : bookings.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
            No bookings yet. Go book a court! 🏀
          </p>
        ) : (
          <div className="history-list">
            {bookings.map(b => (
              <div key={b.id} className="history-item">
                <div className="history-item__header">
                  <h4>{b.court_name}</h4>
                  <span className={`history-item__status history-item__status--${b.status}`}>
                    {b.status}
                  </span>
                </div>
                <p className="history-item__meta">📍 {b.court_location}</p>
                <div className="history-item__details">
                  <span>📅 {formatDate(b.date)}</span>
                  <span>🕐 {b.time_slot}</span>
                  <span>⏱ {b.duration} hr{b.duration > 1 ? 's' : ''}</span>
                  <span className="text-gold">
                    {b.total_cost === 0 ? 'Free' : `${Number(b.total_cost).toLocaleString()} RWF`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}