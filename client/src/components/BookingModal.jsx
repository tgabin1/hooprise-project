import { useState, useEffect } from 'react';

const ALL_SLOTS = [
  { time: '06:00', label: '6:00 AM' },
  { time: '07:00', label: '7:00 AM' },
  { time: '08:00', label: '8:00 AM' },
  { time: '09:00', label: '9:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '11:00', label: '11:00 AM' },
  { time: '12:00', label: '12:00 PM' },
  { time: '13:00', label: '1:00 PM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:00', label: '4:00 PM' },
  { time: '17:00', label: '5:00 PM' },
  { time: '18:00', label: '6:00 PM' },
  { time: '19:00', label: '7:00 PM' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-RW', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function BookingModal({ isOpen, onClose, court, onSuccess, user }) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate]                 = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration]         = useState(1);
  const [bookerName, setBookerName]     = useState('');
  const [bookerEmail, setBookerEmail]   = useState('');
  const [bookerPhone, setBookerPhone]   = useState('');
  const [bookedSlots, setBookedSlots]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!court || !date) return;
    fetch(`${API_URL}/api/courts/${court.id}/booked-slots?date=${date}`)
      .then(r => r.json())
      .then(data => setBookedSlots(data.booked || []))
      .catch(() => setBookedSlots([]));
  }, [court, date]);

  useEffect(() => {
    if (isOpen) {
      setDate(today);
      setSelectedTime(null);
      setDuration(1);
      setBookerName(user?.first_name ? `${user.first_name} ${user.last_name}` : '');
      setBookerEmail(user?.email || '');
      setBookerPhone('');
      setError('');
    }
  }, [isOpen, court]);

  const showSummary = selectedTime && date;
  const totalCost   = court ? court.price_rwf * duration : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTime) { setError('Please select a time slot.'); return; }
    setLoading(true); setError('');

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id:   court.id,
          user_name:  bookerName,
          user_email: bookerEmail,
          user_phone: bookerPhone,
          date,
          time_slot:  selectedTime + ':00',
          duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBookedSlots(prev => [...prev, selectedTime]);
      onSuccess(data.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!court) return null;

  return (
    <div
      className={`modal-overlay${isOpen ? ' is-open' : ''}`}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal--booking">
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="modal__header">
          <span className="section-tag">Court Booking</span>
          <h2>{court.name}</h2>
          <p className="modal__meta">
            📍 {court.location} · {court.court_type} · {court.surface}
          </p>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              min={today}
              value={date}
              required
              onChange={e => { setDate(e.target.value); setSelectedTime(null); }}
            />
          </div>

          <div className="form-group">
            <label>Select Time Slot</label>
            <div className="time-slots">
              {ALL_SLOTS.map(slot => {
                const taken    = bookedSlots.includes(slot.time);
                const selected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={taken}
                    className={`time-slot${taken ? ' time-slot--taken' : ''}${selected ? ' time-slot--selected' : ''}`}
                    onClick={() => !taken && setSelectedTime(slot.time)}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
            <div className="time-slot-legend">
              <span><span className="legend-dot legend-dot--open" /> Available</span>
              <span><span className="legend-dot legend-dot--taken" /> Booked</span>
              <span><span className="legend-dot legend-dot--selected" /> Selected</span>
            </div>
          </div>

          <div className="form-group">
            <label>Duration</label>
            <div className="duration-picker">
              {[1, 2, 3].map(h => (
                <button
                  key={h}
                  type="button"
                  className={`duration-btn${duration === h ? ' duration-btn--active' : ''}`}
                  onClick={() => setDuration(h)}
                >
                  {h} hr{h > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="Full name"
              required
              value={bookerName}
              onChange={e => setBookerName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={bookerEmail}
              onChange={e => setBookerEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone Number (MTN or Airtel)</label>
            <input
              type="tel"
              placeholder="+250 7XX XXX XXX"
              required
              value={bookerPhone}
              onChange={e => setBookerPhone(e.target.value)}
            />
          </div>

          {showSummary && (
            <div className="booking-summary">
              <h4>Booking Summary</h4>
              <div className="summary-row"><span>Court</span>    <span>{court.name}</span></div>
              <div className="summary-row"><span>Date</span>     <span>{formatDate(date)}</span></div>
              <div className="summary-row"><span>Time</span>     <span>{formatTime(selectedTime)}</span></div>
              <div className="summary-row"><span>Duration</span> <span>{duration} hour{duration > 1 ? 's' : ''}</span></div>
              <div className="summary-row summary-row--total">
                <span>Total Cost</span>
                <span className="text-gold">{totalCost === 0 ? 'Free' : `${totalCost.toLocaleString()} RWF`}</span>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

          <button type="submit" className="btn btn--gold btn--lg form-submit" disabled={loading}>
            {loading ? 'Processing Payment…' : 'Confirm & Pay'}
          </button>
        </form>
      </div>
    </div>
  );
}