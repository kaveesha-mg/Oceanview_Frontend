import { Link } from 'react-router-dom'

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700&family=Jost:wght@300;400;500&display=swap');
  .about-page { font-family: 'Jost', sans-serif; min-height: 100vh; display: flex; flex-direction: column; background: #f7f4ef; }
  .about-header {
    background: linear-gradient(135deg, #0a1628 0%, #162d47 100%);
    padding: 64px 24px 56px;
    text-align: center;
    border-bottom: 1px solid rgba(240,212,138,0.12);
  }
  .about-header-eyebrow {
    font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #f0d48a;
    margin-bottom: 12px; font-weight: 500;
  }
  .about-header-title {
    font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 48px); font-weight: 500;
    color: #fff; line-height: 1.2; letter-spacing: -0.02em;
  }
  .about-header-title em { font-style: italic; color: #f0d48a; font-weight: 400; }
  .about-header-line { width: 48px; height: 2px; background: linear-gradient(to right, #f0d48a, #b8960c); margin: 20px auto 0; border-radius: 2px; }
  .about-header-sub { font-size: 15px; color: rgba(255,255,255,0.6); margin-top: 16px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5; }
  .about-body { flex: 1; max-width: 720px; margin: 0 auto; padding: 56px 24px 80px; }
  .about-card {
    background: #fff; border-radius: 16px; padding: 40px 44px;
    box-shadow: 0 8px 32px rgba(10,22,40,0.06); border: 1px solid #e8e4df;
  }
  .about-card p { font-size: 16px; color: #4b5563; line-height: 1.75; margin-bottom: 20px; }
  .about-card p:last-child { margin-bottom: 0; }
  .about-footer {
    background: #06101e; padding: 28px 24px;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .about-footer-logo { font-family: 'Playfair Display', serif; font-size: 17px; color: #f0d48a; letter-spacing: 0.04em; }
  .about-footer-text { font-size: 12px; color: rgba(255,255,255,0.32); letter-spacing: 0.05em; }
  .about-footer-links { display: flex; gap: 20px; }
  .about-footer-links a { font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; letter-spacing: 0.05em; transition: color 0.2s; }
  .about-footer-links a:hover { color: #f0d48a; }
`

export default function About() {
  return (
    <>
      <style>{pageStyles}</style>
      <div className="about-page">
        <header className="about-header">
          <div className="about-header-eyebrow">Our Story</div>
          <h1 className="about-header-title">About <em>Ocean View</em> Hotel</h1>
          <div className="about-header-line" />
          <p className="about-header-sub">Where the ocean meets quiet luxury on the coast of Colombo.</p>
        </header>

        <main className="about-body">
          <div className="about-card">
            <p>
              Nestled along the pristine coastline, Ocean View Hotel offers a peaceful escape with breathtaking ocean views.
            </p>
            <p>
              Our rooms blend modern comfort with coastal elegance. From Standard rooms to luxurious Suites, we ensure a relaxing stay.
            </p>
            <p>
              Use our smart reservation system to browse rooms, check availability, and book your stay easily online.
            </p>
          </div>
        </main>

        <footer className="about-footer">
          <div className="about-footer-logo">Ocean View Hotel</div>
          <div className="about-footer-text">Colombo, Sri Lanka · © {new Date().getFullYear()}</div>
          <div className="about-footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/help">Help</Link>
            <Link to="/reservations/new">Book Now</Link>
          </div>
        </footer>
      </div>
    </>
  )
}