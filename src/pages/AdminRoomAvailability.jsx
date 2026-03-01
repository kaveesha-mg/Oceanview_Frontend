import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

  .availability-container { font-family: 'Inter', sans-serif; color: #1e293b; }

  .admin-page-header {
    padding: 48px 0;
    padding-left: 60px; /* INCREASED GAP FROM SIDEBAR */
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 32px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; /* INCREASED FROM 32px */
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 16px; /* INCREASED FROM 14px */
    color: #64748b;
    margin-top: 6px;
  }

  .admin-page-body {
    padding-left: 60px; /* MATCHING GAP FOR GRID */
    padding-right: 40px;
    padding-bottom: 100px;
  }

  .availability-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
  }

  .admin-avail-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
  }

  .admin-avail-card:hover {
    border-color: #0f172a;
    box-shadow: 0 12px 25px -10px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .admin-avail-type {
    font-size: 20px; /* INCREASED SIZE */
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10px;
    text-transform: capitalize;
  }

  .admin-avail-rate {
    font-size: 22px; /* INCREASED SIZE */
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 18px;
    letter-spacing: -0.02em;
  }

  .admin-avail-rate span {
    font-size: 14px;
    font-weight: 400;
    color: #94a3b8;
  }

  .admin-avail-pill {
    display: inline-flex;
    align-items: center;
    background: #f0fdf4;
    color: #166534;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14px; /* INCREASED SIZE */
    font-weight: 600;
    border: 1px solid #dcfce7;
    width: fit-content;
  }

  .room-list-container {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }

  .room-label {
    font-size: 12px; /* INCREASED SIZE */
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
    display: block;
    font-weight: 700;
  }

  .room-numbers {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px; /* INCREASED SIZE */
    color: #334155;
    word-spacing: 8px;
    font-weight: 500;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 100px 0;
    background: #f8fafc;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
    color: #64748b;
    font-size: 16px;
  }
`

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
    <div className="availability-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Live Vacancy Status</h1>
          <div className="admin-page-subtitle">Real-time room allocation and nightly rate distribution</div>
        </div>
      </div>
      <div className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b', fontSize: '16px' }}>Consulting room ledger...</div>
        ) : (
          <div className="availability-grid">
            {Object.entries(byType).map(([type, data]) => (
              <div key={type} className="admin-avail-card">
                <div>
                  <div className="admin-avail-type">{type}</div>
                  <div className="admin-avail-rate">
                    LKR {data.rate?.toLocaleString()} <span>/ night</span>
                  </div>
                  <div className="admin-avail-pill">
                    ✓ {data.count} {data.count !== 1 ? 'Units' : 'Unit'} Free
                  </div>
                </div>
                
                <div className="room-list-container">
                  <span className="room-label">Ready for Check-in</span>
                  <div className="room-numbers">
                    {data.rooms.join('  ')}
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(byType).length === 0 && (
              <div className="empty-state">
                <p>All rooms are currently occupied or being serviced.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}