export default function CustomerHelp() {
  const HELP_STYLES = `
    /* RESTORED LIGHT BACKGROUND */
    .help-page-wrapper {
      min-height: 100vh;
      background: linear-gradient(rgba(253, 250, 245, 0.4), rgba(253, 250, 245, 0.4)), 
                  url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      display: flex;
      flex-direction: column;
    }

    /* LIGHT GLASSMORPHISM HEADER */
    .customer-page-header {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-bottom: 1px solid rgba(229, 222, 201, 0.5);
      padding: 30px 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .header-breadcrumb {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: #d4af7a;
      font-weight: 800;
      margin-bottom: 4px;
      display: block;
    }

    .customer-page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 38px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1;
    }

    /* LIGHT BLUR BODY SECTION */
    .customer-page-body {
      flex: 1;
      padding: 60px 20px;
      background: rgba(253, 250, 245, 0.6); 
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .help-grid {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
    }

    /* MIDNIGHT BLUR CARDS (Help Points) */
    .help-step-card {
      background: rgba(15, 23, 42, 0.85); /* Deep midnight glass */
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 40px;
      display: flex;
      gap: 35px;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }

    .help-step-card:hover {
      transform: translateY(-8px);
      background: rgba(30, 41, 59, 0.95);
      border-color: #d4af7a;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    .step-number {
      font-family: 'Cormorant Garamond', serif;
      font-size: 60px;
      font-weight: 700;
      color: #d4af7a;
      line-height: 0.8;
      min-width: 80px;
      text-shadow: 0 0 10px rgba(212, 175, 122, 0.2);
    }

    .step-content h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 30px;
      font-weight: 700;
      color: #ffffff; /* White text for contrast on dark cards */
      margin: 0 0 15px 0;
    }

    .step-content p {
      font-size: 16px;
      line-height: 1.8;
      color: #cbd5e1; /* Silver grey for readability */
      margin: 0;
    }

    .help-list {
      margin: 25px 0 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .help-list li {
      font-size: 14px;
      color: #e2e8f0;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .help-list li::before {
      content: "•";
      color: #d4af7a;
      font-size: 20px;
    }

    .info-callout {
      margin-top: 30px;
      padding: 20px 25px;
      background: rgba(212, 175, 122, 0.15);
      border-left: 5px solid #d4af7a;
      border-radius: 8px;
      font-size: 15px;
      font-style: italic;
      color: #d4af7a;
    }

    @media (max-width: 768px) {
      .customer-page-header { padding: 25px; }
      .help-step-card { flex-direction: column; gap: 20px; padding: 30px; }
      .help-list { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div className="help-page-wrapper">
      <style>{HELP_STYLES}</style>
      
      <header className="customer-page-header">
        <div>
          <span className="header-breadcrumb">Guest Resources</span>
          <h1 className="customer-page-title">Guest Guide</h1>
          <div style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>
            Personalized navigation for your Ocean View experience
          </div>
        </div>
        
        <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(212, 175, 122, 0.3)', paddingLeft: '25px' }}>
          <div style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.1em' }}>PORTAL STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>
            <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
            SECURE
          </div>
        </div>
      </header>

      <main className="customer-page-body">
        <div className="help-grid">
          
          <div className="help-step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <h2>Membership Registration</h2>
              <p>
                Begin your journey by selecting <strong>Register</strong>. We require your 
                official details including full name, NIC/Passport, and contact info to 
                guarantee your security and personalized service.
              </p>
            </div>
          </div>

          <div className="help-step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <h2>Secure Access</h2>
              <p>
                Use your unique <strong>Username</strong> and <strong>Password</strong> to 
                enter the Guest Portal. For your protection, your session is encrypted and timed.
              </p>
            </div>
          </div>

          <div className="help-step-card">
            <div className="step-number">03</div>
            <div className="step-content">
              <h2>Explore Our Suites</h2>
              <p>
                Browse available room categories and real-time rates. Each selection 
                details the nightly investment and current availability status.
              </p>
            </div>
          </div>

          <div className="help-step-card">
            <div className="step-number">04</div>
            <div className="step-content">
              <h2>Reservations Process</h2>
              <p>Navigate to <strong>Book Now</strong>. Our concierge form requires:</p>
              <ul className="help-list">
                <li>Legal Guest Name</li>
                <li>Valid Identification</li>
                <li>Check-in Date/Time</li>
                <li>Check-out Date/Time</li>
                <li>Residential Address</li>
                <li>Primary Contact</li>
              </ul>
              <div className="info-callout">
                Note: Departure dates must follow the arrival date. Same-day checkout is not supported online.
              </div>
            </div>
          </div>

          <div className="help-step-card">
            <div className="step-number">05</div>
            <div className="step-content">
              <h2>Confirmation & Billing</h2>
              <p>
                Once you click <strong>Finalize Reservation</strong>, your digital folio 
                will be generated. You may download your bill as a PDF or print it for 
                your travel records.
              </p>
            </div>
          </div>

          <div className="help-step-card">
            <div className="step-number">06</div>
            <div className="step-content">
              <h2>Safe Departure</h2>
              <p>
                Select <strong>Sign Out</strong> from the sidebar to end your session. 
                This ensures your personal travel data remains strictly confidential.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}