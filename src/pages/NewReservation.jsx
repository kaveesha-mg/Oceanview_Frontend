import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

  .booking-container { 
    font-family: 'Inter', sans-serif; 
    background: linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), 
                url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=100');
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 20px;
    box-sizing: border-box;
  }

  .booking-form-wrap {
    position: relative;
    background: #fdfaf5; 
    border-radius: 16px;
    padding: 50px 60px; 
    max-width: 750px;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
    border: 1px solid #e5dec9;
  }

  .form-main-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; 
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .form-main-subtitle {
    font-size: 15px;
    font-weight: 500;
    color: #475569;
    margin-top: 8px;
    margin-bottom: 40px;
  }

  .form-section-label {
    font-size: 13px; 
    font-weight: 800; 
    color: #8b7355; 
    letter-spacing: 0.15em; 
    text-transform: uppercase;
    margin-bottom: 25px; 
    display: flex; 
    align-items: center; 
    gap: 15px;
  }
  .form-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(139, 115, 85, 0.3); }

  .customer-form-label {
    display: block; 
    font-size: 12px; 
    font-weight: 700; 
    color: #1a1a1a; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    margin-bottom: 8px;
  }

  .customer-form-input {
    width: 100%; 
    padding: 14px; 
    background: #ffffff; 
    border: 1px solid #d1d5db; 
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s ease; 
    color: #000000;
    box-sizing: border-box;
  }
  
  .customer-form-input:focus { 
    outline: none; 
    border-color: #8b7355; 
    box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
  }

  .price-summary {
    background: #0f172a; 
    color: #ffffff; 
    padding: 25px;
    margin: 30px 0; 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    border-radius: 10px;
    border-left: 5px solid #d4af7a;
  }

  .summary-text { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
  .summary-price { font-size: 24px; font-weight: 700; color: #d4af7a; }

  .customer-gold-btn {
    background: #d4af7a; 
    color: #0f172a; 
    border: none;
    padding: 18px; 
    font-size: 15px;
    font-weight: 800; 
    cursor: pointer; 
    transition: 0.3s; 
    text-transform: uppercase; 
    letter-spacing: 2px;
    width: 100%;
    border-radius: 8px;
  }
  
  .customer-gold-btn:hover:not(:disabled) { 
    background: #0f172a; 
    color: #ffffff;
    transform: translateY(-2px);
  }

  .btn-outline {
    background: transparent;
    border: 1px solid #d1d5db;
    color: #374151;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    .booking-form-wrap { padding: 40px 25px; }
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
  return `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`
}

export default function NewReservation() {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState({
    guestName: '', address: '', nicNumber: '', contactNumber: '',
    roomType: '', checkInDate: '', checkInTime: '02:00 PM',
    checkOutDate: '', checkOutTime: '11:00 AM'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(null)

  useEffect(() => {
    fetch('/api/rooms/available')
      .then(r => r.json())
      .then(setRooms)
      .catch(() => setRooms([]))
  }, [])

  const roomTypes = [...new Set(rooms.map(r => r.roomType))]
  const selectedRate = rooms.find(r => r.roomType === form.roomType)?.ratePerNight
  const checkIn = form.checkInDate ? new Date(form.checkInDate) : null
  const checkOut = form.checkOutDate ? new Date(form.checkOutDate) : null
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.ceil((checkOut - checkIn) / (24*60*60*1000)) : 0
  const totalBill = selectedRate && nights > 0 ? selectedRate * nights : 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    
    setLoading(true)
    try {
      const res = await api('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          checkInTime: parseTime(form.checkInTime) ? `${parseTime(form.checkInTime)}:00` : '14:00:00',
          checkOutTime: parseTime(form.checkOutTime) ? `${parseTime(form.checkOutTime)}:00` : '11:00:00'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create reservation')
      setConfirmed(data)
    } catch (err) {
      setError(err.message); showValidationAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBill = () => {
    const html = `
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: #0f172a; line-height: 1.6;">
        <h1 style="color: #8b7355; border-bottom: 2px solid #e5dec9; padding-bottom: 10px;">Ocean View Hotel</h1>
        <h3>Reservation Bill: ${confirmed.reservationNumber}</h3>
        <hr/>
        <p><strong>Guest Name:</strong> ${confirmed.guestName}</p>
        <p><strong>NIC Number:</strong> ${confirmed.nicNumber}</p>
        <p><strong>Room Type:</strong> ${confirmed.roomType}</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Check-In:</strong> ${confirmed.checkInDate} at ${confirmed.checkInTime || '02:00 PM'}</p>
          <p><strong>Check-Out:</strong> ${confirmed.checkOutDate} at ${confirmed.checkOutTime || '11:00 AM'}</p>
          <p><strong>Duration:</strong> ${confirmed.nights} Night(s)</p>
        </div>
        <h2 style="color: #1e293b;">Total Payable: LKR ${confirmed.totalBill?.toLocaleString()}</h2>
        <p style="font-size: 12px; color: #64748b; margin-top: 50px;">Thank you for choosing our luxury collection.</p>
      </body>
    </html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `OceanView-Bill-${confirmed.reservationNumber}.html`; a.click()
  }

  if (confirmed) {
    return (
      <div className="booking-container">
        <style>{css}</style>
        <div className="booking-form-wrap" style={{textAlign: 'center'}}>
          <h1 className="form-main-title">Reservation Confirmed</h1>
          <p className="form-main-subtitle">Thank you for choosing luxury. Your stay is secured.</p>
          
          <div className="price-summary" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
              <span className="summary-text">Booking Ref:</span>
              <span className="summary-price" style={{fontSize: '18px'}}>{confirmed.reservationNumber}</span>
            </div>
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '10px'}}>
              <span className="summary-text">Check-In:</span>
              <span style={{fontSize: '14px'}}>{confirmed.checkInDate} @ {confirmed.checkInTime || '02:00 PM'}</span>
            </div>
            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
              <span className="summary-text">Check-Out:</span>
              <span style={{fontSize: '14px'}}>{confirmed.checkOutDate} @ {confirmed.checkOutTime || '11:00 AM'}</span>
            </div>
          </div>

          <div className="price-summary">
            <div className="summary-text">Total Investment</div>
            <div className="summary-price">LKR {confirmed.totalBill?.toLocaleString()}</div>
          </div>

          <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
            <button onClick={handleDownloadBill} className="customer-gold-btn">Download Bill</button>
            <button onClick={() => window.print()} className="btn-outline">Print</button>
            <button onClick={() => navigate('/reservations')} className="btn-outline">Back</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-container">
      <style>{css}</style>
      <div className="booking-form-wrap">
        <div style={{ textAlign: 'center' }}>
          <h1 className="form-main-title">Reservation Inquiry</h1>
          <p className="form-main-subtitle">Please provide your details to secure your suite</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section-label">1. Guest Information</div>
          <div style={{ marginBottom: 20 }}>
            <label className="customer-form-label">Full Name</label>
            <input name="guestName" value={form.guestName} onChange={handleChange} placeholder="e.g. Johnathan Doe" className="customer-form-input" required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="customer-form-label">NIC / Passport</label>
              <input name="nicNumber" value={form.nicNumber} onChange={handleChange} className="customer-form-input" required />
            </div>
            <div>
              <label className="customer-form-label">Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="+94 ..." className="customer-form-input" required />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="customer-form-label">Home Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="customer-form-input" required />
          </div>

          <div className="form-section-label">2. Stay Details</div>
          <div style={{ marginBottom: 20 }}>
            <label className="customer-form-label">Suite Category</label>
            <select name="roomType" value={form.roomType} onChange={handleChange} className="customer-form-input" required>
              <option value="">Select a room...</option>
              {roomTypes.map(t => <option key={t} value={t}>{t} - LKR {rooms.find(r => r.roomType === t)?.ratePerNight?.toLocaleString()}/night</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="customer-form-label">Arrival Date</label>
              <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} className="customer-form-input" required />
            </div>
            <div>
              <label className="customer-form-label">Arrival Time</label>
              <input name="checkInTime" value={form.checkInTime} onChange={handleChange} placeholder="02:00 PM" className="customer-form-input" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="customer-form-label">Departure Date</label>
              <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} min={form.checkInDate} className="customer-form-input" required />
            </div>
            <div>
              <label className="customer-form-label">Departure Time</label>
              <input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} placeholder="11:00 AM" className="customer-form-input" />
            </div>
          </div>

          {nights > 0 && selectedRate && (
            <div className="price-summary">
              <div><div className="summary-text">Duration</div><div className="summary-price">{nights} Night(s)</div></div>
              <div style={{ textAlign: 'right' }}><div className="summary-text">Total Bill</div><div className="summary-price">LKR {totalBill.toLocaleString()}</div></div>
            </div>
          )}

          <button type="submit" disabled={loading} className="customer-gold-btn">
            {loading ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  )
}