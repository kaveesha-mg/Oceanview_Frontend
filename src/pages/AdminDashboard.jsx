import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RECEPTIONIST_CARDS = [
  { to: '/admin/walk-in', icon: '⊕', label: 'Walk-in Reservation', desc: 'Add booking for guests who come directly to the hotel' },
  { to: '/admin/room-availability', icon: '◈', label: 'Room Availability', desc: 'View available room types, free rooms & rates per night' },
  { to: '/admin/rooms', icon: '⊡', label: 'Manage Rooms', desc: 'View room inventory and availability' },
  { to: '/admin/help', icon: '⊘', label: 'Staff Help', desc: 'System guidelines and usage instructions' }
]

const SUPER_ADMIN_CARDS = [
  { to: '/admin/add-receptionist', icon: '⊛', label: 'Add Receptionist', desc: 'Create receptionist accounts for front desk staff' },
  { to: '/admin/users', icon: '⊙', label: 'Manage Customers', desc: 'View all registered guests and user accounts' }
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
    ? 'Manage walk-in reservations and check room availability'
    : 'Manage rooms, reservations, and availability'

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">
            {isReceptionist ? 'Front Desk Dashboard' : 'Dashboard'}
          </div>
          <div className="admin-page-subtitle">{subtitle}</div>
        </div>
        <div style={{ fontSize: 12, color: '#9a8f83' }}>{formatDate()}</div>
      </div>
      <div className="admin-page-body">
        <div className="admin-stat-row">
          <div className="admin-stat-box">
            <div className="admin-stat-value">{loading ? '—' : totalRooms}</div>
            <div className="admin-stat-label">Total Rooms</div>
          </div>
          <div className="admin-stat-box">
            <div className="admin-stat-value" style={{ color: '#2e7d52' }}>
              {loading ? '—' : available}
            </div>
            <div className="admin-stat-label">Available</div>
          </div>
          <div className="admin-stat-box">
            <div className="admin-stat-value" style={{ color: '#b45309' }}>
              {loading ? '—' : occupied}
            </div>
            <div className="admin-stat-label">Occupied</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="admin-dash-card">
              <div className="admin-dash-card-icon">{card.icon}</div>
              <div className="admin-dash-card-title">{card.label}</div>
              <div className="admin-dash-card-desc">{card.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
