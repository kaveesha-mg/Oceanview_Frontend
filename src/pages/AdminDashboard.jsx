import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&display=swap');

  .dashboard-container { font-family: 'Inter', sans-serif; color: #1e293b; }

  .admin-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 48px 0;
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    padding-right: 40px;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 40px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; /* INCREASED FROM 36px */
    color: #0f172a;
    margin: 0;
    line-height: 1.1;
  }

  .admin-page-subtitle {
    font-size: 16px; /* INCREASED FROM 14px */
    color: #64748b;
    margin-top: 8px;
  }

  .date-display {
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-bottom: 5px;
  }

  .admin-page-body {
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    padding-right: 40px;
    padding-bottom: 100px;
  }

  .admin-stat-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    margin-bottom: 48px;
  }

  .admin-stat-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 32px;
    border-radius: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }

  .admin-stat-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .admin-stat-value {
    font-size: 40px; /* LARGER STATS */
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .admin-dash-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 40px 32px; /* INCREASED PADDING */
    border-radius: 20px;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }

  .admin-dash-card::after {
    content: "→";
    position: absolute;
    right: 32px;
    bottom: 32px;
    font-size: 20px;
    color: #cbd5e1;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(-10px);
  }

  .admin-dash-card:hover {
    border-color: #0f172a;
    transform: translateY(-6px);
    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.1);
  }

  .admin-dash-card:hover::after {
    opacity: 1;
    transform: translateX(0);
    color: #0f172a;
  }

  .admin-dash-card-icon {
    font-size: 24px;
    width: 56px;
    height: 56px;
    background: #f1f5f9;
    color: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }

  .admin-dash-card:hover .admin-dash-card-icon {
    background: #0f172a;
    color: #ffffff;
    transform: scale(1.1);
  }

  .admin-dash-card-title {
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 12px;
  }

  .admin-dash-card-desc {
    font-size: 15px;
    color: #64748b;
    line-height: 1.6;
    max-width: 90%;
  }

  @media (max-width: 1024px) {
    .admin-stat-row { gap: 16px; }
  }

  @media (max-width: 768px) {
    .admin-stat-row { grid-template-columns: 1fr; }
    .card-grid { grid-template-columns: 1fr; }
    .admin-page-header { padding-left: 24px; flex-direction: column; align-items: flex-start; gap: 16px; }
    .admin-page-body { padding-left: 24px; }
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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
    api('/api/rooms')
      .then(async (r) => {
        const t = await r.text()
        try { return t ? JSON.parse(t) : [] } catch { return [] }
      })
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
  }, [api])

  const totalRooms = rooms.length
  const available = rooms.filter((r) => r.available).length
  const occupied = totalRooms - available

  const cards = isReceptionist
    ? RECEPTIONIST_CARDS
    : [...RECEPTIONIST_CARDS, ...(isSuperAdmin ? SUPER_ADMIN_CARDS : [])]

  const subtitle = isReceptionist
    ? 'Front desk operations and live room tracking'
    : 'Property oversight and administrative controls'

  return (
    <div className="dashboard-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {isReceptionist ? 'Concierge Dashboard' : 'Executive Overview'}
          </h1>
          <div className="admin-page-subtitle">{subtitle}</div>
        </div>
        <div className="date-display">{formatDate()}</div>
      </div>
      
      <div className="admin-page-body">
        <div className="admin-stat-row">
          <div className="admin-stat-box">
            <div className="admin-stat-label">Inventory</div>
            <div className="admin-stat-value">{loading ? '—' : totalRooms}</div>
            <div style={{fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: '500'}}>Total Rooms Managed</div>
          </div>
          <div className="admin-stat-box" style={{ borderTop: '4px solid #10b981' }}>
            <div className="admin-stat-label" style={{ color: '#059669' }}>Vacant</div>
            <div className="admin-stat-value" style={{ color: '#059669' }}>
              {loading ? '—' : available}
            </div>
            <div style={{fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: '500'}}>Ready for Check-in</div>
          </div>
          <div className="admin-stat-box" style={{ borderTop: '4px solid #f59e0b' }}>
            <div className="admin-stat-label" style={{ color: '#d97706' }}>Occupied</div>
            <div className="admin-stat-value" style={{ color: '#d97706' }}>
              {loading ? '—' : occupied}
            </div>
            <div style={{fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: '500'}}>Active Guest Stays</div>
          </div>
        </div>

        <div className="card-grid">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="admin-dash-card">
              <div className="admin-dash-card-icon">{card.icon}</div>
              <div className="admin-dash-card-title">{card.label}</div>
              <div className="admin-dash-card-desc">{card.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}