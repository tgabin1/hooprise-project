import { useState, useEffect, useRef } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar({ onLoginClick, onSignupClick, user, onLogout, onHistoryClick, onAdminClick, onProfileClick, onEquipmentClick }) {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a href="#" className="nav__logo">
          <span className="logo-hoop">HOOP</span>
          <span className="logo-rise">RISE</span>
        </a>

        <ul className={`nav__links${menuOpen ? ' nav__links--open' : ''}`}>
          <li><a href="#features"     onClick={closeMenu}>Features</a></li>
          <li><a href="#how-it-works" onClick={closeMenu}>How It Works</a></li>
          <li><a href="#courts"       onClick={closeMenu}>Courts</a></li>
        </ul>

        <div className={`nav__actions${menuOpen ? ' nav__actions--open' : ''}`}>
          {user ? (
            <>
              {user.is_admin && (
                <button className="btn btn--gold btn--sm" onClick={() => { closeMenu(); onAdminClick(); }}>
                  Admin
                </button>
              )}

              <NotificationBell user={user} />

              <div className="nav__profile" ref={dropdownRef}>
                <button
                  className="nav__profile-btn"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  <div className="nav__avatar">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <span className="nav__user">👋 {user.first_name}</span>
                  <span className="nav__chevron">{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {dropdownOpen && (
                  <div className="nav__dropdown">
                    <button className="nav__dropdown-item" onClick={() => { setDropdownOpen(false); closeMenu(); onProfileClick(); }}>
                      👤 My Profile
                    </button>
                    <button className="nav__dropdown-item" onClick={() => { setDropdownOpen(false); closeMenu(); onHistoryClick(); }}>
                      📅 My Bookings
                    </button>
                    <button className="nav__dropdown-item" onClick={() => { setDropdownOpen(false); closeMenu(); onEquipmentClick(); }}>
                      🏀 Equipment
                    </button>
                    <div className="nav__dropdown-divider" />
                    <button className="nav__dropdown-item nav__dropdown-item--danger" onClick={() => { setDropdownOpen(false); closeMenu(); onLogout(); }}>
                      🚪 Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn btn--ghost" onClick={() => { closeMenu(); onLoginClick(); }}>
                Log In
              </button>
              <button className="btn btn--gold" onClick={() => { closeMenu(); onSignupClick(); }}>
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          className="nav__burger"
          aria-label="Menu"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
        </button>
      </div>
    </nav>
  );
}