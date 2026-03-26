// client/src/components/Toast.jsx
import { useEffect } from 'react';

export default function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  return (
    <div className={`toast${visible ? ' is-visible' : ''}`}>
      <span className="toast__icon">✓</span>
      <span className="toast__msg">{message}</span>
    </div>
  );
}
