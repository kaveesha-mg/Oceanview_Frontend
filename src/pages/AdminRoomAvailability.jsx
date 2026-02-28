import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'

export default function AdminRoomAvailability() {
  const { api } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api('/api/rooms')
      .then(async r => { const t = await r.text(); try { return t ? JSON.parse(t) : []; } catch { return []; } })
      .then(setRooms)
      .catch((err) => {
        setRooms([])
        const msg = err?.message || 'Failed to load room availability'
        setError(msg)
        showValidationAlert(msg)
      })
      .finally(() => setLoading(false))
  }, [api])

  const available = rooms.filter(r => r.available)
  const byType = {}
  available.forEach(r => {
    byType[r.roomType] = byType[r.roomType] || { count: 0, rate: r.ratePerNight, rooms: [] }
    byType[r.roomType].count++
    byType[r.roomType].rooms.push(r.roomNumber)
  })

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Room Availability</div>
          <div className="admin-page-subtitle">View available room types, free rooms and rates per night</div>
        </div>
      </div>
      <div className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        {loading ? (
          <p style={{ color: '#9a8f83' }}>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {Object.entries(byType).map(([type, data]) => (
              <div key={type} className="admin-avail-card">
                <div className="admin-avail-type">{type}</div>
                <div className="admin-avail-rate">
                  LKR {data.rate?.toLocaleString()}{' '}
                  <span style={{ fontSize: 14, color: '#9a8f83', fontFamily: 'DM Sans, sans-serif' }}>/ night</span>
                </div>
                <span className="admin-avail-pill">
                  ✓ {data.count} room{data.count !== 1 ? 's' : ''} available
                </span>
                <div style={{ fontSize: 12, color: '#9a8f83', marginTop: 8 }}>
                  Rooms: {data.rooms.join(', ')}
                </div>
              </div>
            ))}
            {Object.keys(byType).length === 0 && (
              <p style={{ color: '#9a8f83', gridColumn: '1 / -1' }}>No rooms available at the moment.</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
