import { useEffect, useRef } from 'react';

export default function Hero({ onBookClick, onSignupClick }) {
  const basketballRef = useRef(null);

  useEffect(() => {
    const ball = basketballRef.current;
    if (!ball) return;

    let angle = 0;
    let animFrame;

    const animate = () => {
      angle += 0.005;
      const y = Math.sin(angle) * 20;
      const rotateY = Math.sin(angle * 0.7) * 15;
      const rotateX = Math.cos(angle * 0.5) * 10;
      ball.style.transform = `translateY(${y}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      animFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <section className="hero">
      {/* Particle background */}
      <div className="hero__particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            opacity: 0.1 + Math.random() * 0.3
          }} />
        ))}
      </div>

      <div className="hero__bg">
        <div className="hero__ball hero__ball--1" />
        <div className="hero__ball hero__ball--2" />
        <div className="hero__lines" />
      </div>

      {/* 3D Floating Basketball */}
      <div className="hero__3d-container">
        <div className="basketball-3d" ref={basketballRef}>
          <div className="basketball-face basketball-face--front">🏀</div>
        </div>
      </div>

      <div className="container hero__content">
        <div className="hero__badge">Rwanda's #1 Youth Basketball Platform</div>

        <h1 className="hero__title">
          Book Courts.<br />
          <span className="text-gold">Rise</span> Together.
        </h1>

        <p className="hero__sub">
          Hooprise connects youth players across Rwanda with available courts,
          coaches, and tournaments — so nothing stands between you and the game.
        </p>

        <div className="hero__ctas">
          <button className="btn btn--gold btn--lg" onClick={onBookClick}>
            Book a Court Now
          </button>
          <a href="#how-it-works" className="btn btn--outline btn--lg">
            See how it works
          </a>
        </div>

        <div className="hero__stats">
          <div className="stat">
            <span className="stat__num">50+</span>
            <span className="stat__label">Courts Available</span>
          </div>
          <div className="stat__divider" />
          <div className="stat">
            <span className="stat__num">200+</span>
            <span className="stat__label">Youth Players</span>
          </div>
          <div className="stat__divider" />
          <div className="stat">
            <span className="stat__num">30+</span>
            <span className="stat__label">Tournaments Hosted</span>
          </div>
        </div>
      </div>

      <div className="hero__scroll-hint">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}