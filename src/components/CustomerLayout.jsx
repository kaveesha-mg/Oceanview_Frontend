import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CUSTOMER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

  .customer-root {
    font-family: 'Inter', sans-serif;
    background: #fdfaf5; /* MATCHES FORM BACKGROUND */
    min-height: 100vh;
    display: flex;
  }

  /* SIDEBAR REDESIGN - DEEP NAVY */
  .customer-sidebar {
    width: 280px; 
    min-height: 100vh;
    background: #0f172a; /* Deep Navy to match Price Summary */
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    box-shadow: 4px 0 15px rgba(0,0,0,0.1);
  }

  .customer-sidebar-logo {
    padding: 40px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(0,0,0,0.2);
  }

  .customer-sidebar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 700;
    color: #d4af7a; /* Gold Accent */
    letter-spacing: 0.02em;
    line-height: 1.2;
  }

  .customer-sidebar-sub {
    font-size: 11px;
    color: rgba(212, 175, 122, 0.6);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 6px;
    font-weight: 700;
  }

  .customer-sidebar-user {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 15px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.03);
    border-radius: 6px;
    display: inline-block;
  }

  .customer-sidebar-nav {
    flex: 1;
    padding: 30px 15px;
  }

  .customer-nav-link {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    color: #94a3b8;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    border-radius: 10px;
    margin-bottom: 8px;
  }

  .customer-nav-link:hover {
    color: #ffffff;
    background: rgba(255,255,255,0.05);
  }

  .customer-nav-link.active {
    color: #0f172a;
    background: #d4af7a; /* Gold background for active state */
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(212, 175, 122, 0.3);
  }

  .customer-nav-icon {
    font-size: 20px;
    width: 24px;
    text-align: center;
  }

  .customer-sidebar-footer {
    padding: 24px;
    background: rgba(0,0,0,0.2);
  }

  .customer-sidebar-back {
    display: block;
    width: 100%;
    padding: 12px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    color: #94a3b8;
    text-decoration: none;
    text-align: center;
    margin-bottom: 12px;
  }

  .customer-sidebar-back:hover {
    border-color: #d4af7a;
    color: #d4af7a;
  }

  .customer-logout-btn {
    width: 100%;
    padding: 12px;
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.2);
    color: #f87171;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: 0.3s;
  }

  .customer-logout-btn:hover {
    background: #f87171;
    color: #ffffff;
  }

  .customer-main {
    flex: 1;
    margin-left: 280px; 
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* CONTENT SYYLING */
  .customer-page-header {
    background: #ffffff;
    border-bottom: 1px solid #e5dec9;
    padding: 30px 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .customer-page-subtitle {
    font-size: 14px;
    color: #64748b;
    margin-top: 4px;
  }
`

const NAV_ITEMS = [
  { to: '/reservations', label: 'My Reservations', icon: '⊞' },
  { to: '/reservations/new', label: 'Book a Suite', icon: '⊕' },
  { to: '/reservations/help', label: 'Guest Support', icon: '⊘' }
]

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <style>{CUSTOMER_STYLES}</style>
      <div className="customer-root">
        <aside className="customer-sidebar">
          <div className="customer-sidebar-logo">
            <div className="customer-sidebar-title">Ocean View</div>
            <div className="customer-sidebar-sub">Luxury Collection</div>
            {user?.username && (
              <div className="customer-sidebar-user">Welcome, {user.username}</div>
            )}
          </div>
          
          <nav className="customer-sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to || 
                               (item.to === '/reservations' && location.pathname.startsWith('/reservations/view'))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`customer-nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="customer-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="customer-sidebar-footer">
            <Link to="/" className="customer-sidebar-back">Main Website</Link>
            <button
              type="button"
              className="customer-logout-btn"
              onClick={() => { logout(); navigate('/') }}
            >
              Log Out
            </button>
          </div>
        </aside>
        
        <main className="customer-main">
          <Outlet />
        </main>
      </div>
    </>
  )
}