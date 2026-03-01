import { useAuth } from '../context/AuthContext'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&display=swap');

  .help-container { font-family: 'Inter', sans-serif; color: #1e293b; }

  .admin-page-header {
    padding: 48px 0;
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 48px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; /* INCREASED FROM 36px */
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 16px; /* INCREASED FROM 15px */
    color: #64748b;
    margin-top: 6px;
  }

  .admin-page-body {
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    padding-right: 40px;
    padding-bottom: 100px;
  }

  .help-grid {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 80px;
  }

  @media (max-width: 900px) {
    .help-grid { grid-template-columns: 1fr; gap: 40px; }
  }

  .help-nav {
    position: sticky;
    top: 40px;
    height: fit-content;
  }

  .help-nav-link {
    display: block;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s;
    border-left: 2px solid transparent;
  }

  .help-nav-link:hover { 
    color: #0f172a;
    padding-left: 8px;
    border-left-color: #e2e8f0;
  }

  .admin-help-section {
    margin-bottom: 56px;
    animation: fadeIn 0.5s ease-out;
  }

  .admin-help-section h2 {
    font-size: 22px; /* INCREASED SIZE */
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .admin-help-section h2::before {
    content: "";
    width: 4px;
    height: 22px;
    background: #0f172a;
    border-radius: 2px;
  }

  .admin-help-section p {
    font-size: 16px; /* INCREASED SIZE */
    line-height: 1.8;
    color: #475569;
    margin: 0;
  }

  .security-box {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    padding: 32px;
    border-radius: 16px;
  }

  .security-box h2 { color: #991b1b; }
  .security-box h2::before { background: #991b1b; }
  .security-box p { color: #991b1b; font-weight: 500; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export default function AdminHelp() {
  const { user } = useAuth()
  const isReceptionist = user?.role === 'RECEPTIONIST'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const sections = [
    { id: 'walkin', title: 'Walk-in Reservations', content: 'When a guest arrives in person, use the Walk-in module. Enter mandatory guest details including Name, NIC/Passport, Address, and Contact. Select the desired room type and define the stay period. The system will automatically calculate the total bill based on current nightly rates.' },
    { id: 'availability', title: 'Check Room Availability', content: 'The Live Vacancy Status dashboard provides a real-time view of available inventory. You can monitor unit counts per category and verified nightly rates without opening individual reservation records.' },
    { id: 'rooms', title: 'Managing Rooms', content: 'The Room Management section allows you to maintain the physical inventory. You can add new units, update room category pricing, or decommission rooms for maintenance. Note: These actions are logged for audit purposes.' },
    ...(isSuperAdmin ? [{ id: 'admin', title: 'Super Admin', content: 'Super Admins have elevated permissions to manage the staff roster. You can create new receptionist credentials and access the master Customer database to review stay histories.' }] : []),
    { id: 'security', title: 'Security Protocol', content: 'To maintain data integrity and guest privacy, always log out when leaving your workstation. Never share your administrative credentials. If you suspect an account compromise, contact the system administrator immediately.', special: true }
  ]

  return (
    <div className="help-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Operational Guide</h1>
          <div className="admin-page-subtitle">
            {isReceptionist ? 'Front desk protocols and system standard operating procedures' : 'Administrative system guidelines and data management instructions'}
          </div>
        </div>
      </div>

      <div className="admin-page-body">
        <div className="help-grid">
          <aside className="help-nav">
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '20px' }}>Documentation</div>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="help-nav-link">{s.title}</a>
            ))}
          </aside>

          <main style={{ maxWidth: 700 }}>
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
          </main>
        </div>
      </div>
    </div>
  )
}