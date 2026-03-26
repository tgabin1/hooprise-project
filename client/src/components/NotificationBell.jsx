import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/${user.email}?t=${Date.now()}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-read/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-all/${user.email}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const typeIcon = (type) => ({ booking: '📅', equipment: '🏀', general: '🔔' }[type] || '🔔');

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell__btn" onClick={() => setOpen(prev => !prev)}>
        🔔
        {unread > 0 && <span className="notif-bell__badge">{unread}</span>}
      </button>

      {open && (
        <div className="notif-bell__dropdown">
          <div className="notif-bell__header">
            <span>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllAsRead} className="notif-bell__mark-all">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.5, fontSize: '0.85rem' }}>
              No notifications yet
            </p>
          ) : (
            <div className="notif-bell__list">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-bell__item${n.is_read ? '' : ' notif-bell__item--unread'}`}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <div className="notif-bell__icon">{typeIcon(n.type)}</div>
                  <div className="notif-bell__content">
                    <p className="notif-bell__title">{n.title}</p>
                    <p className="notif-bell__msg">{n.message}</p>
                    <p className="notif-bell__time">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="notif-bell__dot" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}