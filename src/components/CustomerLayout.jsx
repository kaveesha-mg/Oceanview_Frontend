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
    width: 220px;
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
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .customer-sidebar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: #d4af7a;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .customer-sidebar-sub {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .customer-sidebar-user {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    margin-top: 8px;
    text-transform: none;
    letter-spacing: 0;
  }

  .customer-sidebar-nav {
    flex: 1;
    padding: 16px 0;
  }

  .customer-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 24px;
    color: rgba(255,255,255,0.45);
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    border-left: 2px solid transparent;
    text-decoration: none;
  }

  .customer-nav-link:hover {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.04);
  }

  .customer-nav-link.active {
    color: #d4af7a;
    border-left-color: #d4af7a;
    background: rgba(212,175,122,0.08);
  }

  .customer-nav-icon {
    font-size: 15px;
    width: 18px;
    text-align: center;
    opacity: 0.7;
  }

  .customer-nav-link.active .customer-nav-icon { opacity: 1; }

  .customer-sidebar-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .customer-sidebar-back {
    display: block;
    width: 100%;
    padding: 8px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    text-align: center;
    margin-bottom: 8px;
  }

  .customer-sidebar-back:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .customer-logout-btn {
    width: 100%;
    padding: 8px 14px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(248,113,113,0.95);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
  }

  .customer-logout-btn:hover {
    background: rgba(248,113,113,0.15);
    color: #f87171;
  }

  .customer-main {
    flex: 1;
    margin-left: 220px;
    overflow-y: auto;
    min-height: 100vh;
  }

  .customer-page-header {
    background: white;
    border-bottom: 1px solid #e8e3dc;
    padding: 24px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .customer-page-subtitle {
    font-size: 12.5px;
    color: #9a8f83;
    margin-top: 2px;
    letter-spacing: 0.01em;
  }

  .customer-page-body {
    padding: 36px 40px;
  }

  .customer-gold-btn {
    background: #0d2137;
    color: #d4af7a;
    border: 1px solid rgba(212,175,122,0.3);
    padding: 9px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em;
    text-decoration: none;
  }

  .customer-gold-btn:hover {
    background: #162d47;
    border-color: rgba(212,175,122,0.6);
    color: #d4af7a;
  }

  .customer-form-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }

  .customer-form-input {
    width: 100%;
    padding: 9px 14px;
    border: 1px solid #e0dbd4;
    border-radius: 7px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    background: #faf9f7;
    transition: border 0.15s;
    box-sizing: border-box;
  }

  .customer-form-input:focus {
    outline: none;
    border-color: #d4af7a;
    background: white;
  }

  .customer-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e8e3dc;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .customer-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #d4af7a, #e8c87a);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .customer-card:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  }

  .customer-card:hover::before { opacity: 1; }

  .customer-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: #0d2137;
  }

  .customer-card-meta {
    font-size: 12.5px;
    color: #9a8f83;
    margin-top: 4px;
  }

  .customer-card-rate {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 600;
    color: #0d2137;
    margin-top: 12px;
  }

  .customer-help-section {
    margin-bottom: 28px;
  }

  .customer-help-section h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: #0d2137;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8e3dc;
  }

  .customer-help-section p,
  .customer-help-section ul {
    font-size: 13.5px;
    color: #4b5563;
    line-height: 1.7;
  }

  .customer-help-section ul {
    margin: 8px 0 0 1.5rem;
    padding-left: 0;
  }
`

const NAV_ITEMS = [
  { to: '/reservations', label: 'My Reservations', icon: '⊞' },
  { to: '/reservations/new', label: 'Book Now', icon: '⊕' },
  { to: '/reservations/help', label: 'Help', icon: '⊘' }
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
              <div className="customer-sidebar-user">{user.username}</div>
            )}
          </div>
          <nav className="customer-sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to === '/reservations' && location.pathname === '/reservations') ||
                (item.to === '/reservations/new' && location.pathname === '/reservations/new') ||
                (item.to === '/reservations/help' && location.pathname === '/reservations/help')
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
            <Link to="/" className="customer-sidebar-back">← Back to Site</Link>
            <button
              type="button"
              className="customer-logout-btn"
              onClick={() => { logout(); navigate('/', { state: { logoutSuccess: true } }) }}
            >
              Logout
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
