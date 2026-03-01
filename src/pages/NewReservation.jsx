import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

  .booking-container { font-family: 'Inter', sans-serif; max-width: 900px; margin: 0 auto; padding-bottom: 80px; }
  
  .customer-page-header {
    padding: 60px 0 40px; text-align: center;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px; color: #0a1628; line-height: 1.1; margin-bottom: 12px;
  }
  
  .customer-page-subtitle {
    font-size: 13px; color: #718096; letter-spacing: 0.3em; text-transform: uppercase;
  }

  .booking-form-wrap {
    background: #fff; border: 1px solid #eef0f2; border-radius: 4px;
    padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.03);
  }

  .form-section-label {
    font-size: 11px; font-weight: 700; color: #c5a367;
    letter-spacing: 0.2em; text-transform: uppercase;
    margin-bottom: 25px; display: flex; align-items: center; gap: 15px;
  }
  .form-section-label::after { content: ''; flex: 1; height: 1px; background: #f0f0f0; }

  .customer-form-label {
    display: block; font-size: 11px; font-weight: 600; color: #4a5568;
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
  }

  .customer-form-input {
    width: 100%; padding: 14px 16px; background: #fcfcfc;
    border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px;
    transition: all 0.3s; color: #1a202c;
  }
  .customer-form-input:focus { outline: none; border-color: #0a1628; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

  .price-summary {
    background: #0a1628; color: #f0d48a; padding: 30px;
    border-radius: 4px; margin: 30px 0; display: flex; justify-content: space-between; align-items: center;
  }

  .customer-gold-btn {
    background: #0a1628; color: #f0d48a; border: none;
    padding: 18px 32px; border-radius: 4px; font-size: 12px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em;
    cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px;
  }
  .customer-gold-btn:hover { background: #162a41; transform: translateY(-2px); }

  /* Confirmation Boarding Pass Style */
  .boarding-pass {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.08);
  }
  .pass-header { background: #0a1628; padding: 30px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
  .pass-body { padding: 40px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
  .pass-footer { background: #f8fafc; padding: 25px 40px; border-top: 1px dashed #e2e8f0; }

  @media print {
    .no-print { display: none; }
    .boarding-pass { box-shadow: none; border: 1px solid #000; }
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
    const dateErr = validations.dateAfter(form.checkOutDate, form.checkInDate)
    if (dateErr) { setError(dateErr); showValidationAlert(dateErr); return }
    if (nights <= 0) { const msg = 'Please select valid check-in and check-out dates'; setError(msg); showValidationAlert(msg); return }
    const nicErr = validations.nic(form.nicNumber)
    if (nicErr) { setError(nicErr); showValidationAlert(nicErr); return }
    const phoneErr = validations.phone(form.contactNumber)
    if (phoneErr) { setError(phoneErr); showValidationAlert(phoneErr); return }
    
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
      setError(msg); showValidationAlert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => { window.print() }

  const handleDownloadBill = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${confirmed.reservationNumber}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 40px; border: 1px solid #eee; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #0a1628; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #0a1628; text-transform: uppercase; letter-spacing: 2px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
    .details div { font-size: 14px; line-height: 1.6; }
    .label { font-weight: bold; color: #666; text-transform: uppercase; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; background: #f9f9f9; padding: 12px; border-bottom: 1px solid #ddd; font-size: 12px; }
    td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row { font-size: 18px; font-weight: bold; color: #0a1628; }
    .footer { margin-top: 50px; text-align: center; font-style: italic; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Ocean View Hotel</h1>
    <p>Official Reservation Invoice</p>
  </div>
  <div class="details">
    <div>
      <div class="label">Reservation No.</div><div>${confirmed.reservationNumber}</div>
      <div class="label">Guest Name</div><div>${confirmed.guestName}</div>
    </div>
    <div style="text-align: right">
      <div class="label">Check-in</div><div>${confirmed.checkInDate}</div>
      <div class="label">Room Type</div><div>${confirmed.roomType}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
    <tbody>
      <tr>
        <td>Accommodation (${confirmed.roomType})</td>
        <td>${confirmed.nights} Nights</td>
        <td>LKR ${confirmed.ratePerNight?.toLocaleString()}</td>
        <td>LKR ${confirmed.totalBill?.toLocaleString()}</td>
      </tr>
      <tr class="total-row"><td colspan="3" style="text-align: right">Total Amount Payable</td><td>LKR ${confirmed.totalBill?.toLocaleString()}</td></tr>
    </tbody>
  </table>
  <p class="footer">This is a computer-generated document. No signature required.</p>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `Invoice-${confirmed.reservationNumber}.html`; a.click(); URL.revokeObjectURL(url)
  }

  if (confirmed) {
    return (
      <div className="booking-container">
        <style>{css}</style>
        <div className="customer-page-header">
          <h1 className="customer-page-title">Safe Travels, {confirmed.guestName.split(' ')[0]}</h1>
          <div className="customer-page-subtitle">Your seaside escape is officially booked</div>
        </div>
        
        <div className="boarding-pass">
          <div className="pass-header">
            <div>
              <div style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8}}>Reservation Reference</div>
              <div style={{fontSize: '24px', fontFamily: 'monospace', color: '#f0d48a'}}>{confirmed.reservationNumber}</div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '20px', fontWeight: '600'}}>LKR {confirmed.totalBill?.toLocaleString()}</div>
              <div style={{fontSize: '11px', opacity: 0.8}}>Fully Confirmed</div>
            </div>
          </div>
          
          <div className="pass-body">
            {[
              { label: 'Primary Guest', val: confirmed.guestName },
              { label: 'Accommodation', val: `${confirmed.roomType} Suite` },
              { label: 'Check-in Arrival', val: `${confirmed.checkInDate} @ ${confirmed.checkInTime || '2:00 PM'}` },
              { label: 'Check-out Departure', val: `${confirmed.checkOutDate} @ ${confirmed.checkOutTime || '11:00 AM'}` },
              { label: 'Identification', val: confirmed.nicNumber },
              { label: 'Stay Duration', val: `${confirmed.nights} night(s)` },
            ].map(item => (
              <div key={item.label}>
                <dt style={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', marginBottom: '4px' }}>{item.label}</dt>
                <dd style={{ fontSize: '15px', color: '#1e293b', fontWeight: '500', margin: 0 }}>{item.val}</dd>
              </div>
            ))}
          </div>
          
          <div className="pass-footer no-print">
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleDownloadBill} className="customer-gold-btn">Download Invoice</button>
              <button onClick={handlePrint} style={{ padding: '15px 25px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Print Pass</button>
              <button onClick={() => navigate('/reservations')} style={{ padding: '15px 25px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>My Reservations</button>
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
        <h1 className="customer-page-title">Reserve Your <em>Suite</em></h1>
        <div className="customer-page-subtitle">Ocean View Hotel · Colombo</div>
      </div>
      
      <div className="booking-form-wrap">
        <form onSubmit={handleSubmit}>
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          
          <div className="form-section-label">Guest Profile</div>
          <div style={{ marginBottom: 24 }}>
            <label className="customer-form-label">Full Legal Name</label>
            <input name="guestName" value={form.guestName} onChange={handleChange} placeholder="e.g. Johnathan Doe" className="customer-form-input" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label className="customer-form-label">NIC / Passport No.</label>
              <input name="nicNumber" value={form.nicNumber} onChange={handleChange} placeholder="ID Number" className="customer-form-input" />
            </div>
            <div>
              <label className="customer-form-label">Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="07XXXXXXXX" className="customer-form-input" />
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <label className="customer-form-label">Permanent Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Country" className="customer-form-input" />
          </div>

          <div className="form-section-label">Stay Details</div>
          
          <div style={{ marginBottom: 24 }}>
            <label className="customer-form-label">Preferred Room Category</label>
            <select name="roomType" value={form.roomType} onChange={handleChange} className="customer-form-input">
              <option value="">Choose a Suite...</option>
              {roomTypes.map((t) => (
                <option key={t} value={t}>{t} (LKR {rooms.find((r) => r.roomType === t)?.ratePerNight?.toLocaleString()}/night)</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label className="customer-form-label">Check-in</label><input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} className="customer-form-input" /></div>
              <div><label className="customer-form-label">Time</label><input name="checkInTime" value={form.checkInTime} onChange={handleChange} className="customer-form-input" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label className="customer-form-label">Check-out</label><input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} min={form.checkInDate} className="customer-form-input" /></div>
              <div><label className="customer-form-label">Time</label><input name="checkOutTime" value={form.checkOutTime} onChange={handleChange} className="customer-form-input" /></div>
            </div>
          </div>

          {nights > 0 && selectedRate && (
            <div className="price-summary">
              <div>
                <div style={{fontSize: '11px', textTransform: 'uppercase', opacity: 0.7}}>Total Stay Duration</div>
                <div style={{fontSize: '20px', fontWeight: '500'}}>{nights} Night(s)</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '11px', textTransform: 'uppercase', opacity: 0.7}}>Estimated Total</div>
                <div style={{fontSize: '28px', fontWeight: '600'}}>LKR {totalBill.toLocaleString()}</div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="customer-gold-btn" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Securing your suite...' : 'Confirm My Reservation'}
          </button>
        </form>
      </div>
    </div>
  )
}