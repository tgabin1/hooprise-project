// client/src/components/CTABanner.jsx
export default function CTABanner({ onSignupClick }) {
  return (
    <section className="cta-banner">
      <div className="cta-banner__bg">
        <div className="cta-banner__ball cta-banner__ball--1" />
        <div className="cta-banner__ball cta-banner__ball--2" />
      </div>
      <div className="container cta-banner__content">
        <h2>Your Court is Waiting.</h2>
        <p>Join hundreds of youth players already using Hooprise to book courts and compete across Rwanda.</p>
        <button className="btn btn--gold btn--lg" onClick={onSignupClick}>
          Get Started — It's Free
        </button>
      </div>
    </section>
  );
}
