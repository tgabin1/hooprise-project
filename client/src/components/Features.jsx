// client/src/components/Features.jsx
import { useEffect, useRef } from 'react';

const features = [
  {
    accent: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3"/>
        <path d="M24 4C24 4 16 14 16 24s8 20 8 20" stroke="currentColor" strokeWidth="3"/>
        <path d="M24 4c0 0 8 10 8 20s-8 20-8 20" stroke="currentColor" strokeWidth="3"/>
        <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="3"/>
      </svg>
    ),
    title: 'Find Courts Near You',
    desc:  'Browse verified basketball courts across Kigali and Rwanda. Filter by location, surface type, and availability.',
    tag:   'Courts',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="34" rx="3" stroke="currentColor" strokeWidth="3"/>
        <line x1="16" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="3"/>
        <line x1="16" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="3"/>
        <circle cx="35" cy="36" r="7" fill="#C9A227" stroke="#C9A227" strokeWidth="1"/>
        <path d="M32 36l2 2 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Book Your Time Slot',
    desc:  'Pick your date, choose your time, and confirm your booking in seconds. No calls, no hassle.',
    tag:   'Booking',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 4l4 8 9 1.3-6.5 6.3 1.5 9L24 24l-8 4.6 1.5-9L11 13.3l9-1.3z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M12 38h24M16 44h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Join Tournaments',
    desc:  'Coaches and organizers post tournaments on Hooprise. Sign up, form your team, and compete.',
    tag:   'Tournaments',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="3"/>
        <path d="M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="38" cy="14" r="5" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M42 28c3 1.5 5 4.5 5 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Connect with Coaches',
    desc:  'Find certified coaches in Rwanda who can guide your game, run training sessions, and organize events.',
    tag:   'Coaches',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="20" r="10" stroke="currentColor" strokeWidth="3"/>
        <path d="M24 10V20l7 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Your Player Profile',
    desc:  'Set up your profile, list your position, and let coaches and teammates find you easily.',
    tag:   'Profile',
  },
];

export default function Features({ onSignupClick }) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll('.fade-in-item');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.07}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="features section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">What we offer</span>
          <h2 className="section-title">Everything You Need<br /><span className="text-gold">To Play</span></h2>
          <p className="section-sub">From finding the right court to joining your first tournament — Hooprise has you covered.</p>
        </div>

        <div className="features__grid" ref={gridRef}>
          {features.map((f, i) => (
            <div key={i} className={`feature-card fade-in-item${f.accent ? ' feature-card--accent' : ''}`}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feature-card__tag">{f.tag}</span>
            </div>
          ))}

          {/* CTA card */}
          <div className="feature-card feature-card--cta fade-in-item">
            <p className="feature-card__cta-text">Ready to play?</p>
            <h3>Start for free today</h3>
            <button className="btn btn--gold btn--md" onClick={onSignupClick}>
              Create Your Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
