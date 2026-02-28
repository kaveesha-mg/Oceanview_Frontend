import { useState, useEffect } from 'react'
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
    if (nicErr) { setError(nicErr); showValidationAlert(nicErr); return }
    const phoneErr = validations.phone(form.contactNumber)
    if (phoneErr) { setError(phoneErr); showValidationAlert(phoneErr); return }
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
      const msg = err.message || 'Failed'
      setError(msg)
      showValidationAlert(msg)
    } finally {
      setLoading(false)
    }
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
  <h2>Reservation Bill (Walk-in)</h2>
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
  <p class="footer">Ocean View Hotel - Walk-in reservation. Please present this bill at check-in.</p>
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
        <div className="admin-page-header">
          <div>
            <div className="admin-page-title">Reservation Created</div>
            <div className="admin-page-subtitle">{confirmed.reservationNumber}</div>
          </div>
        </div>
        <div className="admin-page-body">
          <div style={{ background: '#f0faf4', border: '1px solid #c6e6d4', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: '#0d2137' }}>Total: LKR {confirmed.totalBill?.toLocaleString()}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={handleDownloadBill} className="admin-gold-btn">Download Bill</button>
            <button type="button" onClick={() => setConfirmed(null)} style={{ padding: '9px 20px', border: '1px solid #e0dbd4', borderRadius: 6, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#374151' }}>Create Another</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Walk-in Reservation</div>
          <div className="admin-page-subtitle">Add booking for guests who come directly to the hotel</div>
        </div>
      </div>
      <div className="admin-page-body">
        <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>Create a reservation for a guest arriving in person at the front desk.</p>
        <form onSubmit={handleSubmit} className="max-w-2xl" style={{ maxWidth: 560 }}>
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className="admin-form-label">Guest Name *</label><input name="guestName" value={form.guestName} onChange={handleChange} required className="admin-form-input" /></div>
            <div><label className="admin-form-label">Contact *</label><input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className="admin-form-input" /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label className="admin-form-label">Address *</label><input name="address" value={form.address} onChange={handleChange} required className="admin-form-input" /></div>
          <div style={{ marginBottom: 16 }}><label className="admin-form-label">NIC *</label><input name="nicNumber" value={form.nicNumber} onChange={handleChange} required className="admin-form-input" /></div>
          <div style={{ marginBottom: 16 }}>
            <label className="admin-form-label">Room Type *</label>
            <select name="roomType" value={form.roomType} onChange={handleChange} required className="admin-form-input">
              <option value="">Select</option>
              {roomTypes.map(t => <option key={t} value={t}>{t} - LKR {rooms.find(r=>r.roomType===t)?.ratePerNight?.toLocaleString()}/night</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className="admin-form-label">Check-in Date *</label><input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required className="admin-form-input" /></div>
            <div><label className="admin-form-label">Check-in Time</label><input name="checkInTime" value={form.checkInTime} onChange={handleChange} placeholder="02:00 PM" className="admin-form-input" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className="admin-form-label">Check-out Date *</label><input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required min={form.checkInDate} className="admin-form-input" /></div>
            <div><label className="admin-form-label">Check-out Time</label><input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} placeholder="11:00 AM" className="admin-form-input" /></div>
          </div>
          {nights > 0 && selectedRate && <div style={{ padding: 16, background: '#f0ede8', borderRadius: 8, marginBottom: 16 }}><strong>{nights}</strong> night(s) × LKR {selectedRate.toLocaleString()} = LKR {totalBill.toLocaleString()}</div>}
          <button type="submit" disabled={loading} className="admin-gold-btn" style={{ opacity: loading ? 0.6 : 1 }}>Add Reservation</button>
        </form>
      </div>
    </>
  )
}
