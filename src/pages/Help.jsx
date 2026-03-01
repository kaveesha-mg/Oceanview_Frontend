import { Link } from 'react-router-dom'

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;500;600&display=swap');

  .help-page { 
    font-family: 'Inter', sans-serif; 
    min-height: 100vh; 
    display: flex; 
    flex-direction: column; 
    background-color: #fdfcfb; 
    color: #333;
  }

  /* ── HEADER ── */
  .help-header {
    background: #0a1628;
    background-image: radial-gradient(circle at 20% 150%, rgba(240, 212, 138, 0.15) 0%, transparent 50%),
                      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0d48a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    padding: 100px 24px 80px;
    text-align: center;
    border-bottom: 4px solid #f0d48a;
  }

  .help-header-eyebrow {
    font-size: 12px; 
    letter-spacing: 0.4em; 
    text-transform: uppercase; 
    color: #f0d48a;
    margin-bottom: 16px; 
    font-weight: 600;
  }

  .help-header-title {
    font-family: 'Playfair Display', serif; 
    font-size: clamp(38px, 7vw, 56px); 
    font-weight: 400;
    color: #fff; 
    line-height: 1.1;
    margin-bottom: 24px;
  }

  .help-header-title em { font-style: italic; color: #f0d48a; }

  .help-header-sub { 
    font-size: 16px; 
    color: rgba(255,255,255,0.7); 
    max-width: 550px; 
    margin: 0 auto; 
    line-height: 1.6;
    font-weight: 300;
  }

  /* ── MAIN CONTENT ── */
  .help-body { 
    flex: 1; 
    max-width: 850px; 
    margin: -40px auto 0; 
    padding: 0 24px 100px; 
    z-index: 2;
  }

  .help-card {
    background: #fff; 
    border-radius: 4px; 
    padding: 60px 8%;
    box-shadow: 0 20px 50px rgba(0,0,0,0.08);
    border: 1px solid #eee;
  }

  .help-section { 
    margin-bottom: 48px; 
    position: relative; 
    padding-left: 50px;
  }

  .help-section:last-child { margin-bottom: 0; }

  /* Vertical Timeline Line */
  .help-section::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 30px;
    bottom: -50px;
    width: 1px;
    background: #eee;
  }
  .help-section:last-child::before { display: none; }

  /* Number Indicators */
  .help-section h2 { 
    font-family: 'Playfair Display', serif; 
    font-size: 24px; 
    font-weight: 700; 
    color: #0a1628; 
    margin-bottom: 15px; 
    position: relative;
  }

  .help-section h2::after {
    content: '';
    position: absolute;
    left: -42px;
    top: 8px;
    width: 15px;
    height: 15px;
    background: #f0d48a;
    border: 4px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px #f0d48a;
    z-index: 2;
  }

  .help-section p { 
    font-size: 15px; 
    color: #555; 
    line-height: 1.8; 
    margin-bottom: 12px; 
  }

  .help-section strong { color: #0a1628; font-weight: 600; }

  .help-section ul { 
    margin: 20px 0; 
    padding: 0; 
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    list-style: none;
  }

  .help-section li { 
    font-size: 14px; 
    color: #666; 
    padding: 12px 16px;
    background: #f9f9f9;
    border-left: 3px solid #f0d48a;
    transition: transform 0.2s ease;
  }
  
  .help-section li:hover { transform: translateX(5px); }

  /* ── FOOTER ── */
  .help-footer {
    background: #0a1628; 
    padding: 60px 24px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .help-footer-logo { 
    font-family: 'Playfair Display', serif; 
    font-size: 22px; 
    color: #f0d48a; 
    letter-spacing: 0.1em;
    margin-bottom: 15px;
  }

  .help-footer-text { 
    font-size: 13px; 
    color: rgba(255,255,255,0.4); 
    margin-bottom: 30px;
  }

  .help-footer-links { 
    display: flex; 
    justify-content: center; 
    gap: 30px; 
    flex-wrap: wrap;
  }

  .help-footer-links a { 
    font-size: 12px; 
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.6); 
    text-decoration: none; 
    transition: color 0.3s; 
  }

  .help-footer-links a:hover { color: #f0d48a; }

  @media (max-width: 600px) {
    .help-card { padding: 40px 24px; }
    .help-section { padding-left: 30px; }
    .help-section h2::after { left: -22px; }
    .help-section::before { left: 15px; }
  }
`

export default function Help() {
  return (
    <>
      <style>{pageStyles}</style>
      <div className="help-page">
        <header className="help-header">
          <div className="help-header-eyebrow">Assistance & Concierge</div>
          <h1 className="help-header-title">How to <em>Book</em> Your Stay</h1>
          <p className="help-header-sub">Experience the ease of securing your sanctuary at Ocean View with our guided reservation process.</p>
        </header>

        <main className="help-body">
          <div className="help-card">
            <section className="help-section">
              <h2>1. Create an Account</h2>
              <p>Click <strong>Register</strong> and fill in your details: username, password, full name, email, address, NIC number, and contact number. You must be registered to make reservations.</p>
            </section>
            <section className="help-section">
              <h2>2. Log In</h2>
              <p>After registering, use your <strong>Username</strong> and <strong>Password</strong> to log in. Keep your credentials safe.</p>
            </section>
            <section className="help-section">
              <h2>3. Browse Available Rooms</h2>
              <p>On the Home page, view available room types and rates. Each room type shows the price per night and how many rooms are available.</p>
            </section>
            <section className="help-section">
              <h2>4. Make a Reservation</h2>
              <p>Click <strong>Book Now</strong> or <strong>Make a Reservation</strong>. Fill in all required details:</p>
              <ul>
                <li>Guest name</li>
                <li>Address</li>
                <li>NIC Number</li>
                <li>Contact Number</li>
                <li>Room Type</li>
                <li>Check-in (AM/PM)</li>
                <li>Check-out (AM/PM)</li>
              </ul>
              <p style={{ marginTop: 12 }}>The system will not allow a check-out date before the check-in date.</p>
            </section>
            <section className="help-section">
              <h2>5. Review & Confirm</h2>
              <p>After submitting, the system calculates your bill based on nights stayed and room rate. You can view the complete reservation and print it for your records.</p>
            </section>
            <section className="help-section">
              <h2>6. Secure Logout</h2>
              <p>Always use the <strong>Logout</strong> button when you are done to safely exit the system and protect your account.</p>
            </section>
          </div>
        </main>

        <footer className="help-footer">
          <div className="help-footer-logo">Ocean View Hotel</div>
          <div className="help-footer-text">Colombo, Sri Lanka · © {new Date().getFullYear()}</div>
          <div className="help-footer-links">
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