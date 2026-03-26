// client/src/components/HowItWorks.jsx
import { useEffect, useRef } from 'react';

const steps = [
  { num: '01', title: 'Create Your Profile',    desc: 'Sign up in under a minute. Tell us your name, age, position, and the area in Rwanda you play in.' },
  { num: '02', title: 'Find Courts Near You',   desc: 'Browse available courts across Rwanda. See real-time availability, location, and court details.' },
  { num: '03', title: 'Book Your Slots',        desc: 'Pick a date and time that works for you. Confirm your booking instantly — no waiting, no calls.' },
  { num: '04', title: 'Play & Compete',         desc: 'Show up, hoop, and join tournaments set up by coaches in your area. Let the game begin.' },
];

export default function HowItWorks() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('.fade-in-item');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    items.forEach((el, i) => { el.style.transitionDelay = `${i * 0.1}s`; observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="how section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Simple Process</span>
          <h2 className="section-title">From Sign Up<br /><span className="text-gold">To Game Time</span></h2>
          <p className="section-sub">Four easy steps and you're on the court.</p>
        </div>

        <div className="steps" ref={ref}>
          {steps.map((s, i) => (
            <>
              <div key={s.num} className="step fade-in-item">
                <div className="step__number">{s.num}</div>
                <div className="step__content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div key={`arrow-${i}`} className="step__arrow">→</div>}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
