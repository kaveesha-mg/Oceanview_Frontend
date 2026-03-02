import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

  /* FULL PAGE WRAPPER WITH RESORT BACKGROUND */
  .availability-container { 
    font-family: 'Inter', sans-serif; 
    color: #1e293b; 
    min-height: 100vh;
    background: linear-gradient(rgba(253, 250, 245, 0.4), rgba(253, 250, 245, 0.4)), 
                url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
  }

  /* FROSTED GLASS HEADER */
  .admin-page-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    padding: 40px 60px;
    border-bottom: 1px solid rgba(229, 222, 201, 0.5);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #d4af7a;
    font-weight: 700;
    margin-top: 8px;
  }

  /* BLUR BODY CONTENT */
  .admin-page-body {
    flex: 1;
    padding: 60px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .availability-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* FROSTED MIDNIGHT CARDS */
  .admin-avail-card {
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(212, 175, 122, 0.2);
    border-radius: 20px;
    padding: 35px;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 240px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  }

  .admin-avail-card:hover {
    border-color: #d4af7a;
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  }

  .admin-avail-type {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 12px;
    text-transform: capitalize;
  }

  .admin-avail-rate {
    font-size: 24px;
    font-weight: 700;
    color: #d4af7a;
    margin-bottom: 20px;
    letter-spacing: -0.01em;
  }

  .admin-avail-rate span {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .admin-avail-pill {
    display: inline-flex;
    align-items: center;
    background: rgba(16, 185, 129, 0.15);
    color: #4ade80;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 800;
    border: 1px solid rgba(74, 222, 128, 0.3);
    width: fit-content;
    letter-spacing: 0.05em;
  }

  .room-list-container {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .room-label {
    font-size: 11px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.15em;
    margin-bottom: 12px;
    display: block;
    font-weight: 800;
  }

  .room-numbers {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    color: #ffffff;
    word-spacing: 12px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.05);
    padding: 10px 15px;
    border-radius: 8px;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 120px 0;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 24px;
    border: 2px dashed #d4af7a;
    backdrop-filter: blur(5px);
  }

  .empty-state p {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    color: #0f172a;
    font-weight: 600;
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
      
      {/* GLASS HEADER */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Live Vacancy Status</h1>
          <div className="admin-page-subtitle">Inventory Management & Nightly Rates</div>
        </div>
      </header>

      {/* BLUR BODY */}
      <main className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#0f172a', fontSize: '18px', fontFamily: 'Cormorant Garamond', fontWeight: 600 }}>
            Syncing with room ledger...
          </div>
        ) : (
          <div className="availability-grid">
            {Object.entries(byType).map(([type, data]) => (
              <div key={type} className="admin-avail-card">
                <div>
                  <div className="admin-avail-type">{type} Suite</div>
                  <div className="admin-avail-rate">
                    LKR {data.rate?.toLocaleString()} <span>/ Per Night</span>
                  </div>
                  <div className="admin-avail-pill">
                    <span style={{ marginRight: '8px' }}>●</span> {data.count} {data.count !== 1 ? 'Units' : 'Unit'} Available
                  </div>
                </div>
                
                <div className="room-list-container">
                  <span className="room-label">Allocatable Units</span>
                  <div className="room-numbers">
                    {data.rooms.map(num => (
                      <span key={num} style={{ marginRight: '15px' }}>{num}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {Object.keys(byType).length === 0 && (
              <div className="empty-state">
                <p>All luxury suites are currently occupied or undergoing maintenance.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}