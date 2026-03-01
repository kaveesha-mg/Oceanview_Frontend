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
    width: 260px; /* INCREASED FROM 220px FOR LARGER TEXT */
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
    box-shadow: 4px 0 15px rgba(0,0,0,0.1);
  }

  .admin-sidebar-logo {
    padding: 40px 28px 30px; /* INCREASED PADDING */
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .admin-sidebar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; /* INCREASED FROM 18px */
    font-weight: 600;
    color: #d4af7a;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .admin-sidebar-sub {
    font-size: 11px; /* SLIGHTLY LARGER */
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 6px;
  }

  .admin-sidebar-user {
    font-size: 13px; /* INCREASED FROM 11px */
    color: #d4af7a;
    margin-top: 12px;
    opacity: 0.8;
    font-weight: 500;
  }

  .admin-sidebar-nav {
    flex: 1;
    padding: 24px 0; /* MORE VERTICAL BREATHING ROOM */
  }

  .admin-nav-link {
    display: flex;
    align-items: center;
    gap: 14px; /* INCREASED GAP */
    padding: 14px 28px; /* INCREASED PADDING FOR COMFORT */
    color: rgba(255,255,255,0.55);
    font-size: 16px; /* INCREASED FROM 13px - MAIN EDIT */
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: all 0.3s ease;
    border-left: 4px solid transparent; /* THICKER ACTIVE BAR */
    text-decoration: none;
  }

  .admin-nav-link:hover {
    color: #ffffff;
    background: rgba(255,255,255,0.05);
    padding-left: 32px; /* SUBTLE SLIDE EFFECT */
  }

  .admin-nav-link.active {
    color: #d4af7a;
    border-left-color: #d4af7a;
    background: rgba(212,175,122,0.12);
    font-weight: 600;
  }

  .admin-nav-icon {
    font-size: 18px; /* INCREASED FROM 15px */
    width: 22px;
    text-align: center;
    opacity: 0.8;
  }

  .admin-nav-link.active .admin-nav-icon { opacity: 1; }

  .admin-sidebar-footer {
    padding: 24px 28px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .admin-sidebar-back {
    display: block;
    width: 100%;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
    color: rgba(255,255,255,0.8);
    text-decoration: none;
    text-align: center;
    margin-bottom: 12px;
  }

  .admin-sidebar-back:hover {
    background: rgba(255,255,255,0.12);
    color: white;
    border-color: rgba(255,255,255,0.3);
  }

  .admin-logout-btn {
    width: 100%;
    padding: 12px;
    background: rgba(248,113,113,0.05);
    border: 1px solid rgba(248,113,113,0.2);
    color: #fca5a5;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
  }

  .admin-logout-btn:hover {
    background: #f87171;
    color: white;
    border-color: #f87171;
  }

  .admin-main {
    flex: 1;
    margin-left: 260px; /* MATCH SIDEBAR WIDTH */
    overflow-y: auto;
    min-height: 100vh;
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
    { to: '/admin/help', label: 'Help Guide', id: 'help' },
    ...(isSuperAdmin ? [
      { to: '/admin/add-receptionist', label: 'Add Staff', id: 'add-receptionist' },
      { to: '/admin/users', label: 'User Registry', id: 'users' }
    ] : [])
  ]

  const sidebarLabel = isReceptionist ? 'Front Desk' : (isSuperAdmin ? 'Admin Portal' : 'Staff Portal')

  return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="admin-root">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-title">Ocean View Hotel</div>
            <div className="admin-sidebar-sub">{sidebarLabel}</div>
            {user?.username && (
              <div className="admin-sidebar-user">Logged in as: {user.username}</div>
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
              Logout Session
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