import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

  .reservations-container { font-family: 'Inter', sans-serif; color: #1e293b; }

  .admin-page-header {
    padding: 48px 0;
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 40px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; /* INCREASED FROM 32px */
    color: #111;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 16px; /* INCREASED FROM 14px */
    color: #64748b;
    margin-top: 6px;
  }

  .admin-page-body {
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    padding-right: 40px;
    padding-bottom: 100px;
  }

  .res-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 30px;
  }

  .res-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 28px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .res-card:hover {
    border-color: #111;
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }

  .res-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background: #f3f4f6;
    padding: 6px 10px;
    border-radius: 4px;
    color: #374151;
    display: inline-block;
    margin-bottom: 14px;
    font-weight: 500;
  }

  .guest-name {
    font-size: 20px; /* INCREASED SIZE */
    font-weight: 600;
    color: #111;
    margin-bottom: 4px;
  }

  .room-tag {
    font-size: 14px; /* INCREASED SIZE */
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .date-row {
    margin: 24px 0;
    padding: 16px 0;
    border-top: 1px dashed #e5e7eb;
    border-bottom: 1px dashed #e5e7eb;
    display: flex;
    justify-content: space-between;
  }

  .date-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin-bottom: 6px;
    font-weight: 700;
  }

  .date-value {
    font-size: 15px;
    font-weight: 500;
    color: #374151;
  }

  .bill-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .total-amt {
    font-size: 18px;
    font-weight: 700;
    color: #059669;
  }

  .admin-gold-btn {
    background: #111;
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .admin-gold-btn:hover { background: #333; transform: translateY(-1px); }

  .delete-link {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(8px);
    z-index: 40;
  }

  .modal-content {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #fff; border-radius: 16px;
    width: 95vw; maxWidth: 550px;
    maxHeight: 90vh; overflowY: auto;
    padding: 40px; z-index: 50;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }

  .form-group { margin-bottom: 20px; }
  .admin-form-label { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
  .admin-form-input { 
    width: 100%; padding: 12px; border: 1px solid #d1d5db; 
    border-radius: 8px; font-family: 'Inter'; font-size: 15px;
    box-sizing: border-box;
  }
  .admin-form-input:focus { outline: none; border-color: #111; ring: 2px solid #f3f4f6; }
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

function timeToAmPm(str) {
  if (!str) return '02:00 PM'
  const parts = str.trim().split(/[:\s]/).filter(Boolean)
  const h = parseInt(parts[0], 10)
  const m = parts[1] ? parseInt(parts[1], 10) : 0
  if (isNaN(h)) return '02:00 PM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
}

const emptyForm = {
  guestName: '',
  address: '',
  nicNumber: '',
  contactNumber: '',
  roomType: '',
  checkInDate: '',
  checkInTime: '02:00 PM',
  checkOutDate: '',
  checkOutTime: '11:00 AM'
}

function getReservationId(r) {
  if (!r) return null
  return r.id ?? r._id ?? null
}

export default function AdminReservations() {
  const { api, logout } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [rooms, setRooms] = useState([])
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)

  const load = () => {
    setError('')
    api('/api/admin/reservations')
      .then(r => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setList(list.map((item) => ({ ...item, id: item.id ?? item._id })))
      })
      .catch(() => {
        setList([])
        setError('Failed to load reservations')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [api])

  useEffect(() => {
    if (editing) {
      setForm({
        guestName: editing.guestName || '',
        address: editing.address || '',
        nicNumber: editing.nicNumber || '',
        contactNumber: editing.contactNumber || '',
        roomType: editing.roomType || '',
        checkInDate: editing.checkInDate || '',
        checkInTime: timeToAmPm(editing.checkInTime),
        checkOutDate: editing.checkOutDate || '',
        checkOutTime: timeToAmPm(editing.checkOutTime)
      })
      setEditError('')
    }
    api('/api/rooms')
      .then(r => r.json().catch(() => []))
      .then(setRooms)
      .catch(() => setRooms([]))
  }, [editing, api])

  const roomTypes = [...new Set(rooms.map(r => r.roomType))]
  const selectedRate = rooms.find(r => r.roomType === form.roomType)?.ratePerNight
  const checkIn = form.checkInDate ? new Date(form.checkInDate) : null
  const checkOut = form.checkOutDate ? new Date(form.checkOutDate) : null
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000)) : 0
  const totalBill = selectedRate && nights > 0 ? selectedRate * nights : 0

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setEditError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editing) return
    setEditError('')
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
      setEditError(Object.values(errs)[0])
      return
    }
    const dateErr = validations.dateAfter(form.checkOutDate, form.checkInDate)
    if (dateErr) {
      setEditError(dateErr)
      return
    }
    if (nights <= 0) {
      setEditError('Please select valid check-in and check-out dates')
      return
    }
    const nicErr = validations.nic(form.nicNumber)
    if (nicErr) {
      setEditError(nicErr)
      return
    }
    const phoneErr = validations.phone(form.contactNumber)
    if (phoneErr) {
      setEditError(phoneErr)
      return
    }
    setEditLoading(true)
    try {
      const payload = {
        guestName: form.guestName.trim(),
        address: form.address.trim(),
        nicNumber: form.nicNumber.trim(),
        contactNumber: form.contactNumber.trim(),
        roomType: form.roomType.trim(),
        roomId: null,
        checkInDate: form.checkInDate,
        checkInTime: parseTime(form.checkInTime) ? `${parseTime(form.checkInTime)}:00` : '14:00:00',
        checkOutDate: form.checkOutDate,
        checkOutTime: parseTime(form.checkOutTime) ? `${parseTime(form.checkOutTime)}:00` : '11:00:00'
      }
      const id = getReservationId(editing)
      if (!id) {
        setEditError('Invalid reservation')
        setEditLoading(false)
        return
      }
      const res = await api(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const raw = await res.text()
      let data = {}
      try {
        if (raw) data = JSON.parse(raw) || {}
      } catch (_) {}
      if (!res.ok) {
        const rawShort = typeof raw === 'string' && raw.length > 200 ? raw.substring(0, 200) + '…' : raw
        const msg = data.error || data.message ||
          (typeof data === 'object' && Object.keys(data).length > 0 ? Object.values(data).join('. ') : null) ||
          (res.status === 401 ? 'Please log in again.' : null) ||
          (res.status === 403 ? 'Access denied. Please log in again as admin.' : null) ||
          (res.status === 404 ? 'Reservation not found.' : null) ||
          (res.status >= 500 ? `Server error (${res.status}). Try again later.` : null) ||
          (rawShort && !rawShort.startsWith('<') ? rawShort : null) ||
          `Failed to update reservation (${res.status})`
        throw new Error(msg)
      }
      const updatedId = data.id ?? data._id
      setList(prev => prev.map(item => (item.id ?? item._id) === updatedId ? { ...data, id: updatedId } : item))
      setEditSuccess(`Reservation updated. Bill recalculated: LKR ${(data.totalBill ?? 0).toLocaleString()}.`)
      setEditing(null)
      setForm(emptyForm)
    } catch (err) {
      setEditError(err.message || 'Failed to update reservation')
      showValidationAlert(err.message || 'Failed to update reservation')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (r) => {
    if (!confirm(`Delete reservation ${r.reservationNumber}? This cannot be undone.`)) return
    const id = getReservationId(r)
    if (!id) {
      setError('Invalid reservation')
      return
    }
    setDeleteLoadingId(id)
    try {
      const res = await api(`/api/admin/reservations/${id}`, { method: 'DELETE' })
      const text = await res.text()
      let data = {}
      try { if (text) data = JSON.parse(text) } catch (_) {}
      if (!res.ok) {
        const textShort = typeof text === 'string' && text.length > 200 ? text.substring(0, 200) + '…' : text
        const msg = data.error || data.message ||
          (typeof data === 'object' && Object.keys(data).length > 0 ? Object.values(data).join('. ') : null) ||
          (res.status === 401 ? 'Please log in again.' : null) ||
          (res.status === 403 ? 'Access denied. Please log in again as admin.' : null) ||
          (res.status === 404 ? 'Reservation not found.' : null) ||
          (res.status >= 500 ? `Server error (${res.status}). Try again later.` : null) ||
          (textShort && !textShort.startsWith('<') ? textShort : null) ||
          `Failed to delete (${res.status})`
        throw new Error(msg)
      }
      const deletedId = getReservationId(r)
      setList(prev => prev.filter(x => (x.id ?? x._id) !== deletedId))
    } catch (err) {
      setError(err.message || 'Failed to delete reservation')
      showValidationAlert(err.message || 'Failed to delete reservation')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const closeEdit = () => {
    setEditing(null)
    setForm(emptyForm)
    setEditError('')
  }

  return (
    <div className="reservations-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reservations Ledger</h1>
          <div className="admin-page-subtitle">Managing {list.length} active and upcoming guest stays</div>
        </div>
      </div>

      <div className="admin-page-body">
        {error && (
          <div style={{ marginBottom: 32 }}>
            <Alert message={error} onDismiss={() => setError('')} />
            {(error.includes('Access denied') || error.includes('log in again')) && (
              <div style={{ marginTop: 16 }}>
                <button type="button" onClick={() => { logout(); navigate('/login', { state: { logoutSuccess: true } }); }} className="admin-gold-btn">Log out and sign in again</button>
              </div>
            )}
          </div>
        )}
        
        {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
        
        {loading ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '100px 0', fontSize: '16px' }}>Syncing with server...</p>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', border: '2px dashed #e5e7eb', borderRadius: '12px' }}>
            <p style={{ color: '#9ca3af', fontSize: '18px' }}>No guest records found.</p>
          </div>
        ) : (
          <div className="res-grid">
            {list.map((r) => (
              <div key={getReservationId(r) || r.reservationNumber} className="res-card">
                <span className="res-number">#{r.reservationNumber}</span>
                <div className="guest-name">{r.guestName}</div>
                <div className="room-tag">
                  <span>{r.roomType}</span>
                  <span>•</span>
                  <span>{r.nights} {r.nights === 1 ? 'Night' : 'Nights'}</span>
                </div>

                <div className="date-row">
                  <div className="date-box">
                    <div className="date-label">Check In</div>
                    <div className="date-value">{format(new Date(r.checkInDate), 'MMM dd, yyyy')}</div>
                  </div>
                  <div className="date-box" style={{ textAlign: 'right' }}>
                    <div className="date-label">Check Out</div>
                    <div className="date-value">{format(new Date(r.checkOutDate), 'MMM dd, yyyy')}</div>
                  </div>
                </div>

                <div className="bill-section">
                  <div className="total-amt">LKR {Number(r.totalBill).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <button type="button" onClick={() => setEditing(r)} className="admin-gold-btn">Edit</button>
                    <button 
                      type="button" 
                      onClick={() => handleDelete(r)} 
                      disabled={deleteLoadingId === getReservationId(r)} 
                      className="delete-link"
                    >
                      {deleteLoadingId === getReservationId(r) ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <>
          <div className="modal-overlay" onClick={closeEdit} />
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h3 style={{ margin: 0, fontSize: '26px', fontFamily: 'Cormorant Garamond, serif' }}>Edit Folio: {editing.reservationNumber}</h3>
              <button type="button" onClick={closeEdit} style={{ border: 'none', background: 'none', fontSize: '32px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              {editError && <Alert message={editError} onDismiss={() => setEditError('')} />}
              
              <div className="form-group">
                <label className="admin-form-label">Guest Legal Name *</label>
                <input name="guestName" value={form.guestName} onChange={handleFormChange} required className="admin-form-input" />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Physical Address *</label>
                <input name="address" value={form.address} onChange={handleFormChange} required className="admin-form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="admin-form-label">NIC / Passport *</label>
                  <input name="nicNumber" value={form.nicNumber} onChange={handleFormChange} required className="admin-form-input" />
                </div>
                <div className="form-group">
                  <label className="admin-form-label">Contact Number *</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={handleFormChange} required className="admin-form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="admin-form-label">Assigned Room Type *</label>
                <select name="roomType" value={form.roomType} onChange={handleFormChange} required className="admin-form-input">
                  <option value="">Select room category</option>
                  {roomTypes.map((t) => (
                    <option key={t} value={t}>{t} – LKR {rooms.find(r => r.roomType === t)?.ratePerNight?.toLocaleString()}/night</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="admin-form-label">Arrival Date *</label>
                  <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleFormChange} required className="admin-form-input" />
                </div>
                <div className="form-group">
                  <label className="admin-form-label">Departure Date *</label>
                  <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleFormChange} required min={form.checkInDate} className="admin-form-input" />
                </div>
              </div>

              {nights > 0 && selectedRate && (
                <div style={{ padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 24 }}>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase' }}>Bill Projection</div>
                  <div style={{ fontSize: '16px', color: '#1e293b' }}>
                    <strong>{nights} nights</strong> at {selectedRate.toLocaleString()} = <strong>LKR {totalBill.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <button type="button" onClick={closeEdit} style={{ flex: 1, padding: '14px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>Discard</button>
                <button type="submit" disabled={editLoading} className="admin-gold-btn" style={{ flex: 2, fontSize: '15px' }}>{editLoading ? 'Processing...' : 'Update Reservation'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}