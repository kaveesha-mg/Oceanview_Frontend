import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --brand-dark: #0f172a;
    --brand-accent: #6366f1;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --bg-soft: #f8fafc;
    --border-color: #e2e8f0;
    --transition-smooth: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .dashboard-container { 
    font-family: 'Inter', sans-serif; 
    color: var(--text-main);
    background-color: #fff;
    min-height: 100vh;
  }

  /* Header Section */
  .admin-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 60px 60px 40px 60px;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 40px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    color: var(--brand-dark);
    margin: 0;
    line-height: 1;
    font-weight: 600;
  }

  .admin-page-subtitle {
    font-size: 16px;
    color: var(--text-muted);
    margin-top: 12px;
    font-weight: 400;
  }

  .date-display {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: #f1f5f9;
    padding: 8px 16px;
    border-radius: 100px;
  }

  /* Body & Layout */
  .admin-page-body {
    padding: 0 60px 100px 60px;
    max-width: 1400px;
  }

  /* Stats Section */
  .admin-stat-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 60px;
  }

  .admin-stat-box {
    background: #ffffff;
    border: 1px solid var(--border-color);
    padding: 32px;
    border-radius: 24px;
    transition: var(--transition-smooth);
    position: relative;
  }

  .admin-stat-box:hover {
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
    border-color: #cbd5e1;
  }

  .admin-stat-label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #cbd5e1;
  }

  .admin-stat-value {
    font-size: 48px;
    font-weight: 700;
    color: var(--brand-dark);
    letter-spacing: -0.02em;
  }

  .stat-footer-text {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 12px;
    font-weight: 500;
  }

  /* Navigation Cards */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  .admin-dash-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    padding: 40px;
    border-radius: 24px;
    text-decoration: none;
    transition: var(--transition-smooth);
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .admin-dash-card:hover {
    border-color: var(--brand-dark);
    transform: translateY(-8px);
    box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.12);
  }

  .admin-dash-card-icon {
    font-size: 20px;
    width: 52px;
    height: 52px;
    background: var(--bg-soft);
    color: var(--brand-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    margin-bottom: 28px;
    transition: var(--transition-smooth);
  }

  .admin-dash-card:hover .admin-dash-card-icon {
    background: var(--brand-dark);
    color: #fff;
    transform: rotate(-5deg) scale(1.1);
  }

  .admin-dash-card-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--brand-dark);
    margin-bottom: 12px;
  }

  .admin-dash-card-desc {
    font-size: 15px;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .arrow-icon {
    margin-top: auto;
    padding-top: 24px;
    font-size: 18px;
    color: var(--brand-dark);
    opacity: 0;
    transform: translateX(-10px);
    transition: var(--transition-smooth);
  }

  .admin-dash-card:hover .arrow-icon {
    opacity: 1;
    transform: translateX(0);
  }

  @media (max-width: 1024px) {
    .admin-page-header, .admin-page-body { padding: 40px 30px; }
    .admin-stat-row { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  }

  @media (max-width: 768px) {
    .admin-page-header { flex-direction: column; align-items: flex-start; gap: 24px; }
    .admin-page-title { font-size: 34px; }
    .admin-stat-row { grid-template-columns: 1fr; }
  }
`

const RECEPTIONIST_CARDS = [
  { to: '/admin/walk-in', icon: '⊕', label: 'Walk-in Reservation', desc: 'Process immediate bookings for guests arriving at the front desk.' },
  { to: '/admin/room-availability', icon: '◈', label: 'Room Availability', desc: 'Monitor real-time occupancy, vacancies, and nightly rates.' },
  { to: '/admin/rooms', icon: '⊡', label: 'Manage Rooms', desc: 'Audit room inventory and update maintenance status.' },
  { to: '/admin/help', icon: '⊘', label: 'Staff Help', desc: 'Access standard operating procedures and system guides.' }
]

const SUPER_ADMIN_CARDS = [
  { to: '/admin/add-receptionist', icon: '⊛', label: 'Add Receptionist', desc: 'Provision new accounts for front desk personnel.' },
  { to: '/admin/users', icon: '⊙', label: 'Manage Customers', desc: 'Review registered guest data and user account levels.' }
]

function formatDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function AdminDashboard() {
  const { api, user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isReceptionist = user?.role === 'RECEPTIONIST'

  useEffect(() => {
    let isMounted = true
    api('/api/rooms')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (isMounted) setRooms(data)
      })
      .catch(() => {
        if (isMounted) setRooms([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [api])

  const totalRooms = rooms.length
  const available = rooms.filter((r) => r.available).length
  const occupied = totalRooms - available

  const cards = isReceptionist
    ? RECEPTIONIST_CARDS
    : [...RECEPTIONIST_CARDS, ...(isSuperAdmin ? SUPER_ADMIN_CARDS : [])]

  return (
    <div className="dashboard-container">
      <style>{css}</style>
      
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {isReceptionist ? 'Front Desk Portal' : 'Executive Overview'}
          </h1>
          <div className="admin-page-subtitle">
            {isReceptionist 
              ? 'Manage check-ins and live room inventory' 
              : 'Comprehensive property oversight and administration'}
          </div>
        </div>
        <div className="date-display">{formatDate()}</div>
      </header>

      <main className="admin-page-body">
        <section className="admin-stat-row">
          <div className="admin-stat-box">
            <div className="admin-stat-label">
              <span className="stat-dot"></span> Inventory
            </div>
            <div className="admin-stat-value">{loading ? '—' : totalRooms}</div>
            <div className="stat-footer-text">Total Units Managed</div>
          </div>

          <div className="admin-stat-box" style={{ borderTop: '4px solid #10b981' }}>
            <div className="admin-stat-label" style={{ color: '#059669' }}>
              <span className="stat-dot" style={{background: '#10b981'}}></span> Vacant
            </div>
            <div className="admin-stat-value" style={{ color: '#059669' }}>
              {loading ? '—' : available}
            </div>
            <div className="stat-footer-text">Available for Booking</div>
          </div>

          <div className="admin-stat-box" style={{ borderTop: '4px solid #6366f1' }}>
            <div className="admin-stat-label" style={{ color: '#4f46e5' }}>
              <span className="stat-dot" style={{background: '#6366f1'}}></span> Occupied
            </div>
            <div className="admin-stat-value" style={{ color: '#4f46e5' }}>
              {loading ? '—' : occupied}
            </div>
            <div className="stat-footer-text">Active Guest Stays</div>
          </div>
        </section>

        <section className="card-grid">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="admin-dash-card">
              <div className="admin-dash-card-icon">{card.icon}</div>
              <div className="admin-dash-card-title">{card.label}</div>
              <div className="admin-dash-card-desc">{card.desc}</div>
              <div className="arrow-icon">Explore →</div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}