import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

  .walkin-container { font-family: 'Inter', sans-serif; color: #1e293b; background: #fcfcfd; min-height: 100vh; }

  .admin-page-header {
    padding: 48px 0;
    padding-left: 60px; 
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 32px;
    background: #fff;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 16px;
    color: #64748b;
    margin-top: 6px;
  }

  .admin-page-body {
    padding-left: 60px; /* SIDEBAR SPACE */
    padding-right: 60px;
    padding-bottom: 100px;
    display: flex;         /* ENABLE CENTERING */
    justify-content: center;
  }

  .reservation-form-wrapper {
    width: 100%;
    max-width: 800px;      /* CENTERED FORM WIDTH */
    background: #ffffff;
    padding: 48px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  }

  .form-section-label {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #94a3b8;
    margin: 40px 0 24px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .form-section-label:first-of-type { margin-top: 0; }

  .form-section-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #f1f5f9;
  }

  .admin-form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #334155;
  }

  .admin-form-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 15px;
    transition: all 0.2s;
    background: #fcfcfd;
    box-sizing: border-box;
    color: #1e293b;
    font-family: 'Inter', sans-serif;
  }

  .admin-form-input:focus {
    outline: none;
    border-color: #0f172a;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08);
  }

  .billing-summary {
    background: #0f172a;
    border-radius: 12px;
    padding: 28px;
    margin: 40px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
  }

  .bill-amount {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 600;
    color: #fff;
  }

  .confirmation-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    max-width: 550px;
    margin: 60px auto;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  }

  .res-number {
    font-family: 'JetBrains Mono', monospace;
    background: #f1f5f9;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 24px;
    color: #0f172a;
    display: inline-block;
    margin: 24px 0;
    letter-spacing: 1px;
  }

  .admin-gold-btn {
    background: #0f172a;
    color: white;
    padding: 16px 32px;
    border-radius: 10px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .admin-gold-btn:hover {
    background: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
        <div className="confirmation-card">
          <div style={{ fontSize: 48, marginBottom: 16, color: '#10b981' }}>✓</div>
          <h1 className="admin-page-title">Booking Confirmed</h1>
          <p className="admin-page-subtitle">Reference number generated successfully</p>
          <div className="res-number">{confirmed.reservationNumber}</div>
          <div style={{ margin: '32px 0', padding: '24px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Total Collection</span>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>LKR {confirmed.totalBill?.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button type="button" onClick={() => window.print()} className="admin-gold-btn">Print Folio</button>
            <button type="button" onClick={() => setConfirmed(null)} style={{ padding: '14px 28px', border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: 16, cursor: 'pointer', fontWeight: 600 }}>New Check-in</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="walkin-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Walk-in Reservation</h1>
          <div className="admin-page-subtitle">Direct front-desk guest registration and billing</div>
        </div>
      </div>

      <div className="admin-page-body">
        <div className="reservation-form-wrapper">
          <form onSubmit={handleSubmit}>
            {error && <Alert message={error} onDismiss={() => setError('')} />}
            
            <div className="form-section-label">Guest Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <label className="admin-form-label">Guest Full Name *</label>
                <input name="guestName" value={form.guestName} onChange={handleChange} required className="admin-form-input" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="admin-form-label">Contact Number *</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className="admin-form-input" placeholder="+94 ..." />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <label className="admin-form-label">Address *</label>
                <input name="address" value={form.address} onChange={handleChange} required className="admin-form-input" placeholder="City, Country" />
              </div>
              <div>
                <label className="admin-form-label">NIC / Passport *</label>
                <input name="nicNumber" value={form.nicNumber} onChange={handleChange} required className="admin-form-input" placeholder="ID Number" />
              </div>
            </div>

            <div className="form-section-label">Stay Details</div>
            <div style={{ marginBottom: 24 }}>
              <label className="admin-form-label">Available Room Category *</label>
              <select name="roomType" value={form.roomType} onChange={handleChange} required className="admin-form-input">
                <option value="">Select a category</option>
                {roomTypes.map(t => (
                  <option key={t} value={t}>
                    {t} — LKR {rooms.find(r=>r.roomType===t)?.ratePerNight?.toLocaleString()} / night
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="admin-form-label">Check-in Date</label><input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required className="admin-form-input" /></div>
                <div><label className="admin-form-label">Time</label><input name="checkInTime" value={form.checkInTime} onChange={handleChange} className="admin-form-input" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="admin-form-label">Check-out Date</label><input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required min={form.checkInDate} className="admin-form-input" /></div>
                <div><label className="admin-form-label">Time</label><input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} className="admin-form-input" /></div>
              </div>
            </div>

            {nights > 0 && selectedRate && (
              <div className="billing-summary">
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}>STAY DURATION</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: '4px' }}>{nights} Night{nights > 1 ? 's' : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL PAYABLE</div>
                  <div className="bill-amount" style={{ marginTop: '4px' }}>LKR {totalBill.toLocaleString()}</div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="admin-gold-btn" style={{ width: '100%', marginTop: 12, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing Check-in...' : 'Confirm Reservation & Generate Bill'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}