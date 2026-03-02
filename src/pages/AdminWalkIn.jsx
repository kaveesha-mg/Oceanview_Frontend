import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

  /* FULL PAGE WRAPPER WITH BACKGROUND */
  .walkin-container { 
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
    letter-spacing: 0.2em;
    color: #d4af7a;
    font-weight: 700;
    margin-top: 8px;
  }

  /* BLUR BODY CONTENT */
  .admin-page-body {
    flex: 1;
    padding: 60px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  /* LIGHT GLASS FORM WRAPPER */
  .reservation-form-wrapper {
    width: 100%;
    max-width: 850px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 50px;
    border-radius: 24px;
    border: 1px solid #ffffff;
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  }

  .form-section-label {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #d4af7a;
    margin: 45px 0 25px 0;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .form-section-label:first-of-type { margin-top: 0; }

  .form-section-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(212, 175, 122, 0.2);
  }

  .admin-form-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #64748b;
    text-transform: uppercase;
  }

  .admin-form-input {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.3s;
    background: #fff;
    box-sizing: border-box;
    color: #0f172a;
    font-family: 'Inter', sans-serif;
  }

  .admin-form-input:focus {
    outline: none;
    border-color: #d4af7a;
    box-shadow: 0 0 0 4px rgba(212, 175, 122, 0.15);
  }

  /* MIDNIGHT BILLING SUMMARY */
  .billing-summary {
    background: #0f172a;
    border: 1px solid #d4af7a;
    border-radius: 16px;
    padding: 30px;
    margin: 40px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .bill-amount {
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 600;
    color: #d4af7a;
  }

  /* CONFIRMATION CARD (MIDNIGHT STYLE) */
  .confirmation-card {
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid #d4af7a;
    border-radius: 24px;
    padding: 60px;
    text-align: center;
    max-width: 600px;
    margin: 40px auto;
    color: white;
  }

  .res-number {
    font-family: 'JetBrains Mono', monospace;
    background: rgba(212, 175, 122, 0.1);
    padding: 12px 24px;
    border: 1px solid rgba(212, 175, 122, 0.3);
    border-radius: 8px;
    font-size: 26px;
    color: #d4af7a;
    display: inline-block;
    margin: 24px 0;
    letter-spacing: 2px;
  }

  .admin-gold-btn {
    background: #0f172a;
    color: #d4af7a;
    padding: 18px 36px;
    border-radius: 12px;
    border: 1px solid rgba(212, 175, 122, 0.4);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .admin-gold-btn:hover {
    background: #d4af7a;
    color: #0f172a;
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(212, 175, 122, 0.25);
  }

  @media (max-width: 768px) {
    .admin-page-header { padding: 30px 20px; }
    .admin-page-body { padding: 30px 20px; }
    .reservation-form-wrapper { padding: 30px 20px; }
  }
`

function parseTime(str) {
  if (!str) return null
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
  return `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}:00`
}

export default function AdminWalkIn() {
  const { api } = useAuth()
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState({
    guestName: '', address: '', nicNumber: '', contactNumber: '',
    roomType: '', checkInDate: '', checkInTime: '02:00 PM', checkOutDate: '', checkOutTime: '11:00 AM'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(null)

  useEffect(() => {
    fetch('/api/rooms/available').then(r => r.json()).then(setRooms).catch(() => setRooms([]))
  }, [])

  const roomTypes = [...new Set(rooms.map(r => r.roomType))]
  const selectedRate = rooms.find(r => r.roomType === form.roomType)?.ratePerNight
  const checkIn = form.checkInDate ? new Date(form.checkInDate) : null
  const checkOut = form.checkOutDate ? new Date(form.checkOutDate) : null
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.ceil((checkOut - checkIn) / (24*60*60*1000)) : 0
  const totalBill = selectedRate && nights > 0 ? selectedRate * nights : 0

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validateForm({
      guestName: (v) => validations.required(v, 'Guest name'),
      address: (v) => validations.required(v, 'Address'),
      nicNumber: (v) => validations.required(v, 'NIC number'),
      contactNumber: (v) => validations.required(v, 'Contact number'),
      roomType: (v) => validations.required(v, 'Room type'),
      checkInDate: (v) => validations.required(v, 'Check-in date'),
      checkOutDate: (v) => validations.required(v, 'Check-out date')
    }, form)
    
    if (errs) {
      const msg = Object.values(errs)[0]; setError(msg); showValidationAlert(msg); return
    }
    if (nights <= 0) {
      const msg = 'Please select valid check-in and check-out dates'; setError(msg); showValidationAlert(msg); return
    }
    
    setLoading(true)
    try {
      const res = await api('/api/admin/reservations/walk-in', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          roomId: rooms.find(r => r.roomType === form.roomType)?.id,
          checkInTime: parseTime(form.checkInTime) || '14:00:00',
          checkOutTime: parseTime(form.checkOutTime) || '11:00:00'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setConfirmed(data)
    } catch (err) {
      setError(err.message); showValidationAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="walkin-container">
        <style>{css}</style>
        <main className="admin-page-body" style={{ alignItems: 'center' }}>
          <div className="confirmation-card">
            <div style={{ fontSize: 60, marginBottom: 20, color: '#d4af7a' }}>✦</div>
            <h1 className="admin-page-title" style={{ color: 'white' }}>Check-in Successful</h1>
            <p style={{ color: '#94a3b8', marginTop: '10px' }}>Guest dossier and reservation folio generated</p>
            <div className="res-number">{confirmed.reservationNumber}</div>
            <div style={{ margin: '35px 0', padding: '30px', borderTop: '1px solid rgba(212, 175, 122, 0.2)' }}>
              <span style={{ color: '#d4af7a', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>TOTAL COLLECTION DUE</span>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'white', marginTop: '10px' }}>LKR {confirmed.totalBill?.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button type="button" onClick={() => window.print()} className="admin-gold-btn">Print Folio</button>
              <button type="button" onClick={() => setConfirmed(null)} style={{ padding: '14px 28px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, background: 'transparent', color: 'white', fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>New Check-in</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="walkin-container">
      <style>{css}</style>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Direct Walk-in</h1>
          <div className="admin-page-subtitle">Concierge Desk Management System</div>
        </div>
      </header>

      <div className="admin-page-body">
        <div className="reservation-form-wrapper">
          <form onSubmit={handleSubmit}>
            {error && <Alert message={error} onDismiss={() => setError('')} />}
            
            <div className="form-section-label">Guest Dossier</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <label className="admin-form-label">Full Legal Name</label>
                <input name="guestName" value={form.guestName} onChange={handleChange} required className="admin-form-input" placeholder="Guest Name" />
              </div>
              <div>
                <label className="admin-form-label">Primary Contact</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className="admin-form-input" placeholder="+94 ..." />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <label className="admin-form-label">Permanent Address</label>
                <input name="address" value={form.address} onChange={handleChange} required className="admin-form-input" placeholder="City, Country" />
              </div>
              <div>
                <label className="admin-form-label">NIC / Passport No.</label>
                <input name="nicNumber" value={form.nicNumber} onChange={handleChange} required className="admin-form-input" placeholder="ID Number" />
              </div>
            </div>

            <div className="form-section-label">Allocation & Duration</div>
            <div style={{ marginBottom: 24 }}>
              <label className="admin-form-label">Suite Category Selection</label>
              <select name="roomType" value={form.roomType} onChange={handleChange} required className="admin-form-input">
                <option value="">Select available suite...</option>
                {roomTypes.map(t => (
                  <option key={t} value={t}>
                    {t} — LKR {rooms.find(r=>r.roomType===t)?.ratePerNight?.toLocaleString()} / night
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div><label className="admin-form-label">Arrival Date</label><input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required className="admin-form-input" /></div>
                <div><label className="admin-form-label">Time</label><input name="checkInTime" value={form.checkInTime} onChange={handleChange} className="admin-form-input" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div><label className="admin-form-label">Departure Date</label><input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required min={form.checkInDate} className="admin-form-input" /></div>
                <div><label className="admin-form-label">Time</label><input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} className="admin-form-input" /></div>
              </div>
            </div>

            {nights > 0 && selectedRate && (
              <div className="billing-summary">
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 800, letterSpacing: '0.1em', color: '#d4af7a' }}>TOTAL NIGHTS</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: '4px' }}>{nights} Night{nights > 1 ? 's' : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 800, letterSpacing: '0.1em', color: '#d4af7a' }}>PAYABLE TOTAL</div>
                  <div className="bill-amount" style={{ marginTop: '4px' }}>LKR {totalBill.toLocaleString()}</div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="admin-gold-btn" style={{ width: '100%', marginTop: 12, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing Transaction...' : 'Finalize Check-in & Generate Receipt'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}