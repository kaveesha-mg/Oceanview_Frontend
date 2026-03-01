import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

  .booking-container { font-family: 'Inter', sans-serif; background: #fcfcfd; min-height: 100vh; }
  
  /* DASHBOARD STYLE HEADER */
  .customer-page-header {
    background: #ffffff;
    padding: 32px 60px;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; 
    color: #0f172a; 
    line-height: 1.2;
    margin: 0;
  }
  
  .customer-page-subtitle {
    font-size: 15px; 
    color: #64748b; 
    margin-top: 6px;
    text-transform: none;
    letter-spacing: normal;
  }

  .booking-content-area {
    padding: 0 60px 100px 60px;
    max-width: 1000px;
  }

  .booking-form-wrap {
    background: #fff; 
    border: 1px solid #e2e8f0; 
    border-radius: 16px;
    padding: 48px; 
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .form-section-label {
    font-size: 13px; 
    font-weight: 700; 
    color: #d4af7a;
    letter-spacing: 0.1em; 
    text-transform: uppercase;
    margin-bottom: 32px; 
    display: flex; 
    align-items: center; 
    gap: 15px;
  }
  .form-section-label::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

  .customer-form-label {
    display: block; font-size: 13px; font-weight: 600; color: #334155;
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;
  }

  .customer-form-input {
    width: 100%; padding: 14px 18px; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 10px; font-size: 15px;
    transition: all 0.2s; color: #1e293b;
    box-sizing: border-box;
  }
  .customer-form-input:focus { outline: none; border-color: #0f172a; background: #fff; box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05); }

  .price-summary {
    background: #0f172a; color: #fff; padding: 32px;
    border-radius: 12px; margin: 40px 0; display: flex; justify-content: space-between; align-items: center;
  }

  .customer-gold-btn {
    background: #0f172a; color: #fff; border: none;
    padding: 18px 32px; border-radius: 12px; font-size: 15px;
    font-weight: 600; cursor: pointer; transition: all 0.2s; 
    display: inline-flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .customer-gold-btn:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

  /* Boarding Pass confirmation */
  .boarding-pass {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
    overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  }
  .pass-header { background: #0f172a; padding: 40px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
  .pass-body { padding: 48px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
  
  @media print {
    .no-print { display: none; }
    .customer-page-header { display: none; }
    .boarding-pass { box-shadow: none; border: 1px solid #000; margin: 0; }
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
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
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
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000)) : 0
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
    if (nights <= 0) {
      const msg = 'Please select valid check-in and check-out dates'; setError(msg); showValidationAlert(msg); return
    }
    
    setLoading(true)
    try {
      const res = await api('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          roomId: rooms.find(r => r.roomType === form.roomType)?.id,
          checkInTime: `${parseTime(form.checkInTime)}:00`,
          checkOutTime: `${parseTime(form.checkOutTime)}:00`
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

  if (confirmed) {
    return (
      <div className="booking-container">
        <style>{css}</style>
        <div className="customer-page-header">
          <div>
            <h1 className="customer-page-title">Booking Confirmed</h1>
            <div className="customer-page-subtitle">Your stay at Ocean View has been secured.</div>
          </div>
        </div>
        
        <div className="booking-content-area">
          <div className="boarding-pass">
            <div className="pass-header">
              <div>
                <div style={{fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7}}>Reservation Reference</div>
                <div style={{fontSize: '32px', fontWeight: '700', color: '#fff'}}>{confirmed.reservationNumber}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '28px', fontWeight: '700', color: '#fff'}}>LKR {confirmed.totalBill?.toLocaleString()}</div>
                <div style={{fontSize: '13px', opacity: 0.8}}>Paid via Portal</div>
              </div>
            </div>
            
            <div className="pass-body">
              {[
                { label: 'Guest Name', val: confirmed.guestName },
                { label: 'Room Type', val: confirmed.roomType },
                { label: 'Check-in', val: `${confirmed.checkInDate} at ${confirmed.checkInTime}` },
                { label: 'Check-out', val: `${confirmed.checkOutDate} at ${confirmed.checkOutTime}` },
                { label: 'Nights', val: confirmed.nights },
                { label: 'ID Number', val: confirmed.nicNumber },
              ].map(item => (
                <div key={item.label}>
                  <dt style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '11px', marginBottom: '6px' }}>{item.label}</dt>
                  <dd style={{ fontSize: '18px', color: '#0f172a', fontWeight: '500', margin: 0 }}>{item.val}</dd>
                </div>
              ))}
            </div>
            
            <div style={{ padding: '32px 48px', borderTop: '1px dashed #e2e8f0', background: '#f8fafc', display: 'flex', gap: '16px' }} className="no-print">
              <button onClick={() => window.print()} className="customer-gold-btn">Print Details</button>
              <button onClick={() => navigate('/reservations')} style={{ padding: '16px 28px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>View My Itinerary</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-container">
      <style>{css}</style>
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">Reserve a Suite</h1>
          <div className="customer-page-subtitle">Experience luxury at Ocean View Hotel</div>
        </div>
      </div>
      
      <div className="booking-content-area">
        <div className="booking-form-wrap">
          <form onSubmit={handleSubmit}>
            {error && <Alert message={error} onDismiss={() => setError('')} />}
            
            <div className="form-section-label">Guest Information</div>
            <div style={{ marginBottom: 32 }}>
              <label className="customer-form-label">Full Name</label>
              <input name="guestName" value={form.guestName} onChange={handleChange} placeholder="Enter your full name" className="customer-form-input" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div>
                <label className="customer-form-label">NIC / Passport</label>
                <input name="nicNumber" value={form.nicNumber} onChange={handleChange} className="customer-form-input" />
              </div>
              <div>
                <label className="customer-form-label">Phone Number</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="customer-form-input" />
              </div>
            </div>

            <div style={{ marginBottom: 48 }}>
              <label className="customer-form-label">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="customer-form-input" />
            </div>

            <div className="form-section-label">Stay Details</div>
            
            <div style={{ marginBottom: 32 }}>
              <label className="customer-form-label">Room Category</label>
              <select name="roomType" value={form.roomType} onChange={handleChange} className="customer-form-input">
                <option value="">Select a Suite...</option>
                {roomTypes.map((t) => (
                  <option key={t} value={t}>{t} (LKR {rooms.find((r) => r.roomType === t)?.ratePerNight?.toLocaleString()}/night)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div>
                <label className="customer-form-label">Check-in Date</label>
                <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} className="customer-form-input" />
              </div>
              <div>
                <label className="customer-form-label">Check-out Date</label>
                <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} min={form.checkInDate} className="customer-form-input" />
              </div>
            </div>

            {nights > 0 && selectedRate && (
              <div className="price-summary">
                <div>
                  <div style={{fontSize: '13px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px'}}>Duration</div>
                  <div style={{fontSize: '24px', fontWeight: '500'}}>{nights} Night(s)</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '13px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px'}}>Total Amount</div>
                  <div style={{fontSize: '32px', fontWeight: '700'}}>LKR {totalBill.toLocaleString()}</div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="customer-gold-btn" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}