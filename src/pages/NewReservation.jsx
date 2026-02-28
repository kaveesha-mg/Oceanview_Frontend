import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

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
    guestName: '',
    address: '',
    nicNumber: '',
    contactNumber: '',
    roomType: '',
    checkInDate: '',
    checkInTime: '02:00 PM',
    checkOutDate: '',
    checkOutTime: '11:00 AM'
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
      const msg = Object.values(errs)[0]
      setError(msg)
      showValidationAlert(msg)
      return
    }
    const dateErr = validations.dateAfter(form.checkOutDate, form.checkInDate)
    if (dateErr) {
      setError(dateErr)
      showValidationAlert(dateErr)
      return
    }
    if (nights <= 0) {
      const msg = 'Please select valid check-in and check-out dates'
      setError(msg)
      showValidationAlert(msg)
      return
    }
    const nicErr = validations.nic(form.nicNumber)
    if (nicErr) {
      setError(nicErr)
      showValidationAlert(nicErr)
      return
    }
    const phoneErr = validations.phone(form.contactNumber)
    if (phoneErr) {
      setError(phoneErr)
      showValidationAlert(phoneErr)
      return
    }
    setLoading(true)
    try {
      const res = await api('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          guestName: form.guestName,
          address: form.address,
          nicNumber: form.nicNumber,
          contactNumber: form.contactNumber,
          roomType: form.roomType,
          roomId: rooms.find(r => r.roomType === form.roomType)?.id,
          checkInDate: form.checkInDate,
          checkInTime: parseTime(form.checkInTime) ? `${parseTime(form.checkInTime)}:00` : '14:00:00',
          checkOutDate: form.checkOutDate,
          checkOutTime: parseTime(form.checkOutTime) ? `${parseTime(form.checkOutTime)}:00` : '11:00:00'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create reservation')
      setConfirmed(data)
    } catch (err) {
      const msg = err.message || 'Failed to create reservation'
      setError(msg)
      showValidationAlert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadBill = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bill - ${confirmed.reservationNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    h1 { color: #005b6b; font-size: 24px; }
    h2 { color: #0099b3; font-size: 18px; margin-top: 24px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; }
    .value { font-weight: 500; }
    .total { font-size: 20px; font-weight: 700; color: #005b6b; margin-top: 16px; }
    .footer { margin-top: 32px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <h1>Ocean View Hotel</h1>
  <h2>Reservation Bill</h2>
  <div class="row"><span class="label">Reservation Number</span><span class="value">${confirmed.reservationNumber}</span></div>
  <div class="row"><span class="label">Guest Name</span><span class="value">${confirmed.guestName}</span></div>
  <div class="row"><span class="label">Address</span><span class="value">${confirmed.address}</span></div>
  <div class="row"><span class="label">NIC Number</span><span class="value">${confirmed.nicNumber}</span></div>
  <div class="row"><span class="label">Contact</span><span class="value">${confirmed.contactNumber}</span></div>
  <div class="row"><span class="label">Room Type</span><span class="value">${confirmed.roomType}</span></div>
  <div class="row"><span class="label">Check-in</span><span class="value">${confirmed.checkInDate} ${confirmed.checkInTime || '2:00 PM'}</span></div>
  <div class="row"><span class="label">Check-out</span><span class="value">${confirmed.checkOutDate} ${confirmed.checkOutTime || '11:00 AM'}</span></div>
  <div class="row"><span class="label">Nights</span><span class="value">${confirmed.nights}</span></div>
  <div class="row"><span class="label">Rate per Night</span><span class="value">LKR ${confirmed.ratePerNight?.toLocaleString()}</span></div>
  <div class="row total"><span>Total Bill</span><span>LKR ${confirmed.totalBill?.toLocaleString()}</span></div>
  <p class="footer">Thank you for choosing Ocean View Hotel. Please present this bill at check-in.</p>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `OceanView-Bill-${confirmed.reservationNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (confirmed) {
    return (
      <>
        <div className="customer-page-header">
          <div>
            <div className="customer-page-title">Thank You!</div>
            <div className="customer-page-subtitle">Your reservation has been confirmed</div>
          </div>
        </div>
        <div className="customer-page-body max-w-2xl print:bg-white" style={{ maxWidth: 640 }}>
          <div className="customer-card" style={{ background: '#f0faf4', borderColor: '#c6e6d4', marginBottom: 24 }}>
            <div className="customer-card-title" style={{ color: '#0d2137' }}>{confirmed.reservationNumber}</div>
            <div className="customer-card-rate" style={{ color: '#2e7d52', marginTop: 8 }}>LKR {confirmed.totalBill?.toLocaleString()}</div>
          </div>
          <div className="customer-card print:shadow-none">
            <h3 className="customer-page-title" style={{ fontSize: 20, marginBottom: 20 }}>Reservation Details</h3>
            <dl style={{ display: 'grid', gap: 12, fontSize: 13.5, color: '#4b5563' }}>
              <div><dt style={{ fontWeight: 500, color: '#9a8f83', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Reservation Number</dt><dd style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0d2137' }}>{confirmed.reservationNumber}</dd></div>
              <div><dt style={{ fontWeight: 500, color: '#9a8f83', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Guest Name</dt><dd>{confirmed.guestName}</dd></div>
              <div><dt style={{ fontWeight: 500, color: '#9a8f83', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Room Type</dt><dd>{confirmed.roomType}</dd></div>
              <div><dt style={{ fontWeight: 500, color: '#9a8f83', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Check-in</dt><dd>{confirmed.checkInDate} {confirmed.checkInTime || '2:00 PM'}</dd></div>
              <div><dt style={{ fontWeight: 500, color: '#9a8f83', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Check-out</dt><dd>{confirmed.checkOutDate} {confirmed.checkOutTime || '11:00 AM'}</dd></div>
              <div><dt style={{ fontWeight: 500, color: '#9a8f83', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Total Bill</dt><dd className="customer-card-rate" style={{ marginTop: 0 }}>LKR {confirmed.totalBill?.toLocaleString()}</dd></div>
            </dl>
            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" onClick={handleDownloadBill} className="customer-gold-btn">Download Bill</button>
              <button type="button" onClick={handlePrint} style={{ padding: '9px 20px', border: '1px solid #e0dbd4', borderRadius: 6, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#374151' }}>Print</button>
              <button type="button" onClick={() => navigate('/reservations')} style={{ padding: '9px 20px', border: '1px solid #e0dbd4', borderRadius: 6, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#374151' }}>Back to Reservations</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="customer-page-header">
        <div>
          <div className="customer-page-title">New Reservation</div>
          <div className="customer-page-subtitle">Book your stay at Ocean View Hotel</div>
        </div>
      </div>
      <div className="customer-page-body" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          <div style={{ marginBottom: 16 }}><label className="customer-form-label">Guest Name *</label><input name="guestName" value={form.guestName} onChange={handleChange} required className="customer-form-input" /></div>
          <div style={{ marginBottom: 16 }}><label className="customer-form-label">Address *</label><input name="address" value={form.address} onChange={handleChange} required className="customer-form-input" /></div>
          <div style={{ marginBottom: 16 }}><label className="customer-form-label">NIC Number *</label><input name="nicNumber" value={form.nicNumber} onChange={handleChange} required className="customer-form-input" /></div>
          <div style={{ marginBottom: 16 }}><label className="customer-form-label">Contact Number *</label><input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className="customer-form-input" /></div>
          <div style={{ marginBottom: 16 }}>
            <label className="customer-form-label">Room Type *</label>
            <select name="roomType" value={form.roomType} onChange={handleChange} required className="customer-form-input">
              <option value="">Select room type</option>
              {roomTypes.map((t) => (
                <option key={t} value={t}>{t} – LKR {rooms.find((r) => r.roomType === t)?.ratePerNight?.toLocaleString()}/night</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className="customer-form-label">Check-in Date *</label><input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required className="customer-form-input" /></div>
            <div><label className="customer-form-label">Check-in Time (AM/PM)</label><input name="checkInTime" value={form.checkInTime} onChange={handleChange} placeholder="02:00 PM" className="customer-form-input" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className="customer-form-label">Check-out Date *</label><input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required min={form.checkInDate} className="customer-form-input" /></div>
            <div><label className="customer-form-label">Check-out Time (AM/PM)</label><input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} placeholder="11:00 AM" className="customer-form-input" /></div>
          </div>
          {nights > 0 && selectedRate && (
            <div style={{ padding: 16, background: '#f0ede8', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 13.5, color: '#0d2137' }}><strong>{nights}</strong> night(s) × LKR {selectedRate.toLocaleString()} = <strong>LKR {totalBill.toLocaleString()}</strong></p>
            </div>
          )}
          <button type="submit" disabled={loading} className="customer-gold-btn" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </>
  )
}
