import { useAuth } from '../context/AuthContext'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap');

  /* FULL PAGE WRAPPER WITH RESORT BACKGROUND */
  .help-container { 
    font-family: 'Inter', sans-serif; 
    color: #1e293b; 
    min-height: 100vh;
    background: linear-gradient(rgba(253, 250, 245, 0.45), rgba(253, 250, 245, 0.45)), 
                url('https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1920&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
  }

  /* FROSTED GLASS HEADER */
  .admin-page-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    padding: 40px 60px;
    border-bottom: 1px solid rgba(229, 222, 201, 0.5);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #d4af7a;
    font-weight: 700;
    margin-top: 8px;
  }

  /* BLUR BODY CONTENT */
  .admin-page-body {
    flex: 1;
    padding: 60px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .help-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 80px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .help-grid { grid-template-columns: 1fr; gap: 40px; }
    .help-nav { position: relative; top: 0; }
  }

  /* SIDE NAV STYLING */
  .help-nav {
    position: sticky;
    top: 40px;
    height: fit-content;
    padding-right: 20px;
    border-right: 1px solid rgba(212, 175, 122, 0.2);
  }

  .nav-label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #d4af7a;
    margin-bottom: 24px;
    display: block;
  }

  .help-nav-link {
    display: block;
    padding: 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    text-decoration: none;
    transition: all 0.3s;
  }

  .help-nav-link:hover { 
    color: #0f172a;
    transform: translateX(5px);
  }

  /* CONTENT SECTION STYLING */
  .admin-help-section {
    background: rgba(255, 255, 255, 0.7);
    padding: 40px;
    border-radius: 20px;
    margin-bottom: 40px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    animation: fadeIn 0.5s ease-out;
  }

  .admin-help-section h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 18px 0;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .admin-help-section h2::before {
    content: "";
    width: 30px;
    height: 1px;
    background: #d4af7a; /* Gold line accent */
  }

  .admin-help-section p {
    font-size: 16px;
    line-height: 1.8;
    color: #475569;
    margin: 0;
  }

  /* SECURITY BOX - ALERT STYLE */
  .security-box {
    background: #0f172a; /* Dark Midnight */
    border: 1px solid rgba(212, 175, 122, 0.3);
    padding: 40px;
    border-radius: 20px;
  }

  .security-box h2 { color: #ffffff; }
  .security-box h2::before { background: #d4af7a; }
  .security-box p { color: #cbd5e1; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  html { scroll-behavior: smooth; }
`

export default function AdminHelp() {
  const { user } = useAuth()
  const isReceptionist = user?.role === 'RECEPTIONIST'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const sections = [
    { id: 'walkin', title: 'Walk-in Reservations', content: 'When a guest arrives in person, use the Walk-in module. Enter mandatory guest details including Name, NIC/Passport, Address, and Contact. Select the desired room type and define the stay period. The system will automatically calculate the total bill based on current nightly rates.' },
    { id: 'availability', title: 'Check Room Availability', content: 'The Live Vacancy Status dashboard provides a real-time view of available inventory. You can monitor unit counts per category and verified nightly rates without opening individual reservation records.' },
    { id: 'rooms', title: 'Managing Rooms', content: 'The Room Management section allows you to maintain the physical inventory. You can add new units, update room category pricing, or decommission rooms for maintenance. Note: These actions are logged for audit purposes.' },
    ...(isSuperAdmin ? [{ id: 'admin', title: 'Super Admin Tools', content: 'Super Admins have elevated permissions to manage the staff roster. You can create new receptionist credentials and access the master Customer database to review stay histories and financial analytics.' }] : []),
    { id: 'security', title: 'Security Protocol', content: 'To maintain data integrity and guest privacy, always log out when leaving your workstation. Never share your administrative credentials. If you suspect an account compromise, contact the system administrator immediately.', special: true }
  ]

  return (
    <div className="help-container">
      <style>{css}</style>
      
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Operational Guide</h1>
          <div className="admin-page-subtitle">
            {isReceptionist ? 'Front desk protocols and system standard operating procedures' : 'Administrative system guidelines and data management instructions'}
          </div>
        </div>
      </header>

      <main className="admin-page-body">
        <div className="help-grid">
          <aside className="help-nav">
            <span className="nav-label">Documentation</span>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="help-nav-link">{s.title}</a>
            ))}
          </aside>

          <section style={{ maxWidth: 800 }}>
            {sections.map((s) => (
              <div 
                key={s.id} 
                id={s.id} 
                className={`admin-help-section ${s.special ? 'security-box' : ''}`}
              >
                <h2>{s.title}</h2>
                <p>{s.content}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}