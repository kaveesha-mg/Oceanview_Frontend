import { Link } from 'react-router-dom'

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700&family=Jost:wght@300;400;500&display=swap');
  .help-page { font-family: 'Jost', sans-serif; min-height: 100vh; display: flex; flex-direction: column; background: #f7f4ef; }
  .help-header {
    background: linear-gradient(135deg, #0a1628 0%, #162d47 100%);
    padding: 64px 24px 56px;
    text-align: center;
    border-bottom: 1px solid rgba(240,212,138,0.12);
  }
  .help-header-eyebrow {
    font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #f0d48a;
    margin-bottom: 12px; font-weight: 500;
  }
  .help-header-title {
    font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 48px); font-weight: 500;
    color: #fff; line-height: 1.2; letter-spacing: -0.02em;
  }
  .help-header-title em { font-style: italic; color: #f0d48a; font-weight: 400; }
  .help-header-line { width: 48px; height: 2px; background: linear-gradient(to right, #f0d48a, #b8960c); margin: 20px auto 0; border-radius: 2px; }
  .help-header-sub { font-size: 15px; color: rgba(255,255,255,0.6); margin-top: 16px; max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.5; }
  .help-body { flex: 1; max-width: 680px; margin: 0 auto; padding: 56px 24px 80px; }
  .help-card {
    background: #fff; border-radius: 16px; padding: 40px 44px;
    box-shadow: 0 8px 32px rgba(10,22,40,0.06); border: 1px solid #e8e4df;
  }
  .help-section { margin-bottom: 32px; }
  .help-section:last-child { margin-bottom: 0; }
  .help-section h2 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 500; color: #0a1628; margin-bottom: 10px; }
  .help-section p { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 8px; }
  .help-section p:last-child { margin-bottom: 0; }
  .help-section ul { margin: 12px 0 0 20px; padding: 0; }
  .help-section li { font-size: 15px; color: #4b5563; line-height: 1.65; margin-bottom: 6px; }
  .help-footer {
    background: #06101e; padding: 28px 24px;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .help-footer-logo { font-family: 'Playfair Display', serif; font-size: 17px; color: #f0d48a; letter-spacing: 0.04em; }
  .help-footer-text { font-size: 12px; color: rgba(255,255,255,0.32); letter-spacing: 0.05em; }
  .help-footer-links { display: flex; gap: 20px; }
  .help-footer-links a { font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; letter-spacing: 0.05em; transition: color 0.2s; }
  .help-footer-links a:hover { color: #f0d48a; }
`

export default function Help() {
  return (
    <>
      <style>{pageStyles}</style>
      <div className="help-page">
        <header className="help-header">
          <div className="help-header-eyebrow">Support</div>
          <h1 className="help-header-title">How to <em>Book</em> Your Stay</h1>
          <div className="help-header-line" />
          <p className="help-header-sub">Step-by-step guide to using the Ocean View reservation system.</p>
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
                <li>Check-in date and time (AM/PM)</li>
                <li>Check-out date and time (AM/PM)</li>
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
