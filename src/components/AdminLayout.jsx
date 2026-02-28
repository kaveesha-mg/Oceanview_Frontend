import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ADMIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .admin-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0ede8;
    min-height: 100vh;
    display: flex;
  }

  .admin-sidebar {
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

  .admin-sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .admin-sidebar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: #d4af7a;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .admin-sidebar-sub {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .admin-sidebar-user {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    margin-top: 8px;
    text-transform: none;
    letter-spacing: 0;
  }

  .admin-sidebar-nav {
    flex: 1;
    padding: 16px 0;
  }

  .admin-nav-link {
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

  .admin-nav-link:hover {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.04);
  }

  .admin-nav-link.active {
    color: #d4af7a;
    border-left-color: #d4af7a;
    background: rgba(212,175,122,0.08);
  }

  .admin-nav-icon {
    font-size: 15px;
    width: 18px;
    text-align: center;
    opacity: 0.7;
  }

  .admin-nav-link.active .admin-nav-icon { opacity: 1; }

  .admin-sidebar-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .admin-sidebar-back {
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

  .admin-sidebar-back:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .admin-logout-btn {
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

  .admin-logout-btn:hover {
    background: rgba(248,113,113,0.15);
    color: #f87171;
  }

  .admin-main {
    flex: 1;
    margin-left: 220px;
    overflow-y: auto;
    min-height: 100vh;
  }

  .admin-page-header {
    background: white;
    border-bottom: 1px solid #e8e3dc;
    padding: 24px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .admin-page-subtitle {
    font-size: 12.5px;
    color: #9a8f83;
    margin-top: 2px;
    letter-spacing: 0.01em;
  }

  .admin-page-body {
    padding: 36px 40px;
  }

  .admin-gold-btn {
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

  .admin-gold-btn:hover {
    background: #162d47;
    border-color: rgba(212,175,122,0.6);
    color: #d4af7a;
  }

  .admin-stat-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .admin-stat-box {
    background: white;
    border-radius: 10px;
    border: 1px solid #e8e3dc;
    padding: 18px 20px;
  }

  .admin-stat-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 600;
    color: #0d2137;
  }

  .admin-stat-label {
    font-size: 12px;
    color: #9a8f83;
    margin-top: 2px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .admin-dash-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e8e3dc;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .admin-dash-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #d4af7a, #e8c87a);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .admin-dash-card:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }

  .admin-dash-card:hover::before { opacity: 1; }

  .admin-dash-card-icon {
    width: 40px;
    height: 40px;
    background: #f0ede8;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 14px;
    color: #0d2137;
  }

  .admin-dash-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .admin-dash-card-desc {
    font-size: 12.5px;
    color: #9a8f83;
    margin-top: 4px;
    line-height: 1.5;
  }

  .admin-help-section {
    margin-bottom: 28px;
  }

  .admin-help-section h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: #0d2137;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8e3dc;
  }

  .admin-help-section p {
    font-size: 13.5px;
    color: #4b5563;
    line-height: 1.7;
  }

  .admin-room-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e8e3dc;
  }

  .admin-avail-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e8e3dc;
  }

  .admin-avail-type {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .admin-avail-rate {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 300;
    color: #0d2137;
    margin-top: 8px;
  }

  .admin-avail-pill {
    display: inline-block;
    background: #f0faf4;
    color: #2e7d52;
    border: 1px solid #c6e6d4;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    margin-top: 10px;
  }

  .admin-form-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }

  .admin-form-input {
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

  .admin-form-input:focus {
    outline: none;
    border-color: #d4af7a;
    background: white;
  }
`

const NAV_ICONS = {
  dashboard: '⊞',
  rooms: '⊡',
  'walk-in': '⊕',
  'room-availability': '◈',
  reservations: '▣',
  help: '⊘',
  'add-receptionist': '⊛',
  users: '⊙'
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isReceptionist = user?.role === 'RECEPTIONIST'

  const navItems = [
    { to: '/admin', label: 'Dashboard', id: 'dashboard' },
    { to: '/admin/rooms', label: 'Manage Rooms', id: 'rooms' },
    { to: '/admin/walk-in', label: 'Walk-in', id: 'walk-in' },
    { to: '/admin/room-availability', label: 'Availability', id: 'room-availability' },
    { to: '/admin/reservations', label: 'Reservations', id: 'reservations' },
    { to: '/admin/help', label: 'Help', id: 'help' },
    ...(isSuperAdmin ? [
      { to: '/admin/add-receptionist', label: 'Add Receptionist', id: 'add-receptionist' },
      { to: '/admin/users', label: 'Manage Customers', id: 'users' }
    ] : [])
  ]

  const sidebarLabel = isReceptionist ? 'Front Desk' : (isSuperAdmin ? 'Admin Portal' : 'Admin Portal')

  return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="admin-root">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-title">Ocean View Hotel</div>
            <div className="admin-sidebar-sub">{sidebarLabel}</div>
            {user?.username && (
              <div className="admin-sidebar-user">{user.username}</div>
            )}
          </div>
          <nav className="admin-sidebar-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to !== '/admin' && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`admin-nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="admin-nav-icon">{NAV_ICONS[item.id] || '•'}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="admin-sidebar-footer">
            <Link to="/" className="admin-sidebar-back">← Back to Site</Link>
            <button type="button" className="admin-logout-btn" onClick={() => { logout(); navigate('/', { state: { logoutSuccess: true } }) }}>
              Logout
            </button>
          </div>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  )
}
