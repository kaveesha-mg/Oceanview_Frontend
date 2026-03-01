import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CUSTOMER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .customer-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0ede8;
    min-height: 100vh;
    display: flex;
  }

  .customer-sidebar {
    width: 260px; /* INCREASED FROM 220px */
    min-height: 100vh;
    background: #0d2137;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    flex-shrink: 0;
    z-index: 10;
    isolation: isolate;
  }

  .customer-sidebar-logo {
    padding: 32px 24px; /* INCREASED */
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .customer-sidebar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; /* INCREASED FROM 18px */
    font-weight: 600;
    color: #d4af7a;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .customer-sidebar-sub {
    font-size: 11px; /* INCREASED FROM 10px */
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .customer-sidebar-user {
    font-size: 13px; /* INCREASED FROM 11px */
    color: rgba(255,255,255,0.5);
    margin-top: 10px;
    text-transform: none;
    letter-spacing: 0;
  }

  .customer-sidebar-nav {
    flex: 1;
    padding: 24px 0;
  }

  .customer-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 24px; /* INCREASED PADDING */
    color: rgba(255,255,255,0.5);
    font-size: 15px; /* INCREASED FROM 13px */
    font-weight: 400;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    text-decoration: none;
  }

  .customer-nav-link:hover {
    color: rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.04);
  }

  .customer-nav-link.active {
    color: #d4af7a;
    border-left-color: #d4af7a;
    background: rgba(212,175,122,0.08);
    font-weight: 500;
  }

  .customer-nav-icon {
    font-size: 18px; /* INCREASED FROM 15px */
    width: 20px;
    text-align: center;
    opacity: 0.7;
  }

  .customer-sidebar-footer {
    padding: 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .customer-sidebar-back {
    display: block;
    width: 100%;
    padding: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 13px; /* INCREASED */
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    text-align: center;
    margin-bottom: 10px;
  }

  .customer-logout-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(248,113,113,0.95);
    border-radius: 8px;
    font-size: 13px; /* INCREASED */
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
  }

  .customer-logout-btn:hover {
    background: rgba(248,113,113,0.15);
    color: #f87171;
  }

  .customer-main {
    flex: 1;
    margin-left: 260px; /* MATCH SIDEBAR WIDTH */
    overflow-y: auto;
    min-height: 100vh;
  }

  .customer-page-header {
    background: white;
    border-bottom: 1px solid #e8e3dc;
    padding: 32px 48px; /* INCREASED FROM 24px */
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; /* INCREASED FROM 28px (Matches Admin) */
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .customer-page-subtitle {
    font-size: 15px; /* INCREASED FROM 12.5px */
    color: #9a8f83;
    margin-top: 6px;
    letter-spacing: 0.01em;
  }

  .customer-page-body {
    padding: 48px; /* INCREASED */
  }

  .customer-gold-btn {
    background: #0d2137;
    color: #d4af7a;
    border: 1px solid rgba(212,175,122,0.3);
    padding: 12px 24px; /* INCREASED */
    border-radius: 8px;
    font-size: 15px; /* INCREASED FROM 13px */
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
  }

  .customer-form-label {
    display: block;
    font-size: 13px; /* INCREASED */
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }

  .customer-form-input {
    width: 100%;
    padding: 12px 16px; /* INCREASED */
    border: 1px solid #e0dbd4;
    border-radius: 8px;
    font-size: 15px; /* INCREASED FROM 13.5px */
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    background: #faf9f7;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .customer-card {
    background: white;
    border-radius: 16px; /* ROUNDER */
    padding: 32px; /* INCREASED */
    border: 1px solid #e8e3dc;
    transition: all 0.3s ease;
  }

  .customer-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; /* INCREASED FROM 20px */
    font-weight: 600;
    color: #0d2137;
  }

  .customer-card-meta {
    font-size: 14px; /* INCREASED */
    color: #9a8f83;
    margin-top: 6px;
  }

  .customer-card-rate {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; /* INCREASED FROM 26px */
    font-weight: 600;
    color: #0d2137;
    margin-top: 16px;
  }

  .customer-help-section h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; /* INCREASED FROM 20px */
    font-weight: 600;
    margin-bottom: 12px;
  }

  .customer-help-section p,
  .customer-help-section ul {
    font-size: 16px; /* INCREASED FROM 13.5px */
    line-height: 1.8;
  }
`

const NAV_ITEMS = [
  { to: '/reservations', label: 'My Reservations', icon: '⊞' },
  { to: '/reservations/new', label: 'Book Now', icon: '⊕' },
  { to: '/reservations/help', label: 'Help Center', icon: '⊘' }
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
            <div className="customer-sidebar-title">Ocean View Hotel</div>
            <div className="customer-sidebar-sub">Guest Portal</div>
            {user?.username && (
              <div className="customer-sidebar-user">Signed in as: {user.username}</div>
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
            <Link to="/" className="customer-sidebar-back">← Back to Main Site</Link>
            <button
              type="button"
              className="customer-logout-btn"
              onClick={() => { logout(); navigate('/', { state: { logoutSuccess: true } }) }}
            >
              Sign Out
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