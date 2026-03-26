import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Courts({ onBookClick }) {
  const [courts, setCourts]   = useState([]);
  const [showAll, setShowAll] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/courts`)
      .then(r => r.json())
      .then(data => setCourts(data))
      .catch(() => {
        setCourts([
          { id: 1, name: 'BK Arena Practice Court',  location: 'Kimihurura, Kigali', surface: 'Hardwood', court_type: 'Indoor',  price_rwf: 1000, image_url: 'https://www.kigalicity.gov.rw/fileadmin/user_upload/Kigali_city/Background_Images/kigali-arena.jpeg' },
          { id: 2, name: 'Kigali Arena Court',        location: 'Remera, Kigali',     surface: 'Hardwood', court_type: 'Indoor',  price_rwf: 800,  image_url: 'https://giantsofafrica.org/wp-content/uploads/2023/09/1M9A8259-1-2560x1708.jpg' },
          { id: 3, name: 'Club Rafiki Court',         location: 'Nyamirambo, Kigali', surface: 'Concrete', court_type: 'Outdoor', price_rwf: 0,    image_url: 'https://giantsofafrica.org/wp-content/uploads/2022/05/1M9A9594-986x658.jpg' },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('.fade-in-item');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    items.forEach((el, i) => { el.style.transitionDelay = `${i * 0.1}s`; observer.observe(el); });
    return () => observer.disconnect();
  }, [courts, showAll]);

  const handleCardMouseMove = (e, el) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const handleCardMouseLeave = (el) => {
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const displayed = showAll ? courts : courts.slice(0, 3);

  return (
    <section className="courts section" id="courts">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Available Now</span>
          <h2 className="section-title">Courts Across<br /><span className="text-gold">Rwanda</span></h2>
          <p className="section-sub">Browse courts near you and book your next game.</p>
        </div>

        <div className="courts__grid" ref={ref}>
          {displayed.map((court) => {
            const price      = court.price_rwf === 0 ? 'Free' : `${court.price_rwf.toLocaleString()} RWF/hr`;
            const badge      = court.status === 'open' ? 'Open Now' : 'Closed';
            const badgeClass = court.status === 'open' ? 'court-card__badge--open' : 'court-card__badge--later';

            return (
              <div
                key={court.id}
                className="court-card fade-in-item"
                onMouseMove={e => handleCardMouseMove(e, e.currentTarget)}
                onMouseLeave={e => handleCardMouseLeave(e.currentTarget)}
              >
                <div
                  className="court-card__img"
                  style={{
                    backgroundImage: court.image_url ? `url(${court.image_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: court.image_url ? 'transparent' : '#1a1a2e'
                  }}
                >
                  <span className={`court-card__badge ${badgeClass}`}>{badge}</span>
                </div>
                <div className="court-card__body">
                  <h4>{court.name}</h4>
                  <p className="court-card__location">📍 {court.location}</p>
                  <div className="court-card__meta">
                    <span>{court.court_type} · {court.surface}</span>
                    <span className="court-card__price">{price}</span>
                  </div>
                  <button className="btn btn--gold btn--sm" onClick={() => onBookClick(court)}>
                    Book Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="courts__more">
          <button
            className="btn btn--outline btn--lg"
            onClick={() => setShowAll(prev => !prev)}
          >
            {showAll ? 'Show Less ↑' : `View All Courts (${courts.length}) →`}
          </button>
        </div>
      </div>
    </section>
  );
}