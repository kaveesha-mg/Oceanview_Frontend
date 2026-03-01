import { Link } from 'react-router-dom'

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500&display=swap');

  .about-page { 
    font-family: 'Inter', sans-serif; 
    min-height: 100vh; 
    display: flex; 
    flex-direction: column; 
    background: #fdfaf5; 
    color: #1a1a1a;
  }

  /* ── HEADER ── */
  .about-header {
    background: #0a1628;
    background-image: linear-gradient(to bottom, rgba(10, 22, 40, 0.8), rgba(10, 22, 40, 0.95)),
                      url('https://images.unsplash.com/photo-1551882547-ff43c63faf76?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    padding: 120px 24px 100px;
    text-align: center;
    position: relative;
  }

  .about-header-eyebrow {
    font-size: 11px; 
    letter-spacing: 0.5em; 
    text-transform: uppercase; 
    color: #c5a367;
    margin-bottom: 20px; 
    font-weight: 600;
  }

  .about-header-title {
    font-family: 'Cormorant Garamond', serif; 
    font-size: clamp(40px, 8vw, 68px); 
    font-weight: 300;
    color: #fff; 
    line-height: 1.1;
    margin-bottom: 30px;
  }

  .about-header-title em { 
    font-style: italic; 
    color: #e2c99d; 
    font-weight: 400;
  }

  .about-header-line { 
    width: 60px; 
    height: 1px; 
    background: #c5a367; 
    margin: 0 auto; 
  }

  .about-header-sub { 
    font-size: 17px; 
    color: rgba(255,255,255,0.6); 
    margin-top: 30px; 
    max-width: 500px; 
    margin-left: auto; 
    margin-right: auto; 
    line-height: 1.6;
    font-weight: 300;
    letter-spacing: 0.5px;
  }

  /* ── BODY ── */
  .about-body { 
    flex: 1; 
    max-width: 900px; 
    margin: -60px auto 0; 
    padding: 0 24px 100px; 
    position: relative;
    z-index: 5;
  }

  .about-card {
    background: #fff; 
    padding: 80px 10%;
    box-shadow: 0 40px 100px rgba(0,0,0,0.05); 
    border: 1px solid #e8e4df;
    position: relative;
  }

  /* Elegant Drop Cap for the first paragraph */
  .about-card p:first-of-type::first-letter {
    font-family: 'Cormorant Garamond', serif;
    float: left;
    font-size: 75px;
    line-height: 60px;
    padding-top: 4px;
    padding-right: 12px;
    padding-left: 3px;
    color: #c5a367;
  }

  .about-card p { 
    font-size: 18px; 
    color: #444; 
    line-height: 1.9; 
    margin-bottom: 30px; 
    font-family: 'Cormorant Garamond', serif;
    font-weight: 400;
  }

  .about-card p:last-child { 
    margin-bottom: 0; 
    color: #666; 
    font-style: italic;
    border-top: 1px solid #f0f0f0;
    padding-top: 30px;
    font-size: 16px;
    font-family: 'Inter', sans-serif;
  }

  /* ── FOOTER ── */
  .about-footer {
    background: #0f141a; 
    padding: 60px 40px;
    display: flex; 
    flex-direction: column;
    align-items: center; 
    gap: 30px;
    text-align: center;
  }

  .about-footer-logo { 
    font-family: 'Cormorant Garamond', serif; 
    font-size: 26px; 
    color: #e2c99d; 
    letter-spacing: 0.1em; 
  }

  .about-footer-text { 
    font-size: 11px; 
    color: rgba(255,255,255,0.3); 
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .about-footer-links { 
    display: flex; 
    gap: 32px; 
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 32px;
  }

  .about-footer-links a { 
    font-size: 11px; 
    color: rgba(255,255,255,0.5); 
    text-decoration: none; 
    text-transform: uppercase;
    letter-spacing: 0.15em; 
    transition: color 0.3s; 
  }

  .about-footer-links a:hover { color: #c5a367; }

  @media (max-width: 768px) {
    .about-card { padding: 50px 24px; }
    .about-header { padding: 80px 20px 60px; }
    .about-footer-links { flex-direction: column; gap: 15px; }
  }
`

export default function About() {
  return (
    <>
      <style>{pageStyles}</style>
      <div className="about-page">
        <header className="about-header">
          <div className="about-header-eyebrow">The Heritage</div>
          <h1 className="about-header-title">About <em>Ocean View</em> Resort</h1>
          <div className="about-header-line" />
          <p className="about-header-sub">Defining the art of coastal living and quiet luxury since 2015.</p>
        </header>

        <main className="about-body">
          <div className="about-card">
            <p>
              Nestled along the pristine coastline of Sri Lanka, Ocean View Resort offers a sanctuary where the rhythmic pulse of the Indian Ocean meets sophisticated architecture. Our hotel was envisioned as a peaceful escape for those seeking to reconnect with the horizon while enjoying world-class hospitality.
            </p>
            <p>
              Every detail of our property is designed to blend modern comfort with timeless coastal elegance. From our sun-drenched Standard rooms to our expansive luxury Suites, we prioritize space, natural light, and the calming influence of the sea to ensure your stay is nothing short of restorative.
            </p>
            <p>
              We invite you to experience our seamless service. Utilize our intuitive digital concierge and reservation system to curate your perfect stay, browse our inventory, and secure your place in the sun with absolute ease.
            </p>
          </div>
        </main>

        <footer className="about-footer">
          <div className="about-footer-logo">Ocean View Resort</div>
          <div className="about-footer-text">Colombo, Sri Lanka · © {new Date().getFullYear()}</div>
          <div className="about-footer-links">
            <Link to="/">The Collection</Link>
            <Link to="/about">Our Story</Link>
            <Link to="/help">Assistance</Link>
            <Link to="/reservations/new">Reserve Now</Link>
          </div>
        </footer>
      </div>
    </>
  )
}