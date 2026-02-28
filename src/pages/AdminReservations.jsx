import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
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
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Reservations</div>
          <div className="admin-page-subtitle">View, edit and delete all reservations</div>
        </div>
      </div>
      <div className="admin-page-body">
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert message={error} onDismiss={() => setError('')} />
            {(error.includes('Access denied') || error.includes('log in again')) && (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => { logout(); navigate('/login', { state: { logoutSuccess: true } }); }}
                  className="admin-gold-btn"
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  Log out and sign in again
                </button>
                <p style={{ marginTop: 8, fontSize: 12, color: '#9a8f83' }}>Use an account with Admin, Receptionist, or Super Admin role.</p>
              </div>
            )}
          </div>
        )}
        {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
        {loading ? (
          <p style={{ color: '#9a8f83' }}>Loading...</p>
        ) : list.length === 0 ? (
          <p style={{ color: '#9a8f83' }}>No reservations yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {list.map((r) => (
              <div key={getReservationId(r) || r.reservationNumber} className="admin-card">
                <div className="admin-card-title">{r.reservationNumber}</div>
                <div style={{ fontSize: 13, color: '#9a8f83', marginTop: 4 }}>{r.guestName} · {r.roomType}</div>
                <p style={{ fontSize: 12.5, color: '#6b7280', marginTop: 8 }}>
                  {format(new Date(r.checkInDate), 'MMM d, yyyy')} – {format(new Date(r.checkOutDate), 'MMM d, yyyy')} · {r.nights} night(s)
                </p>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0d2137', marginTop: 8 }}>LKR {Number(r.totalBill).toLocaleString()}</div>
                <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setEditing(r)} className="admin-gold-btn" style={{ padding: '8px 14px', fontSize: 13 }}>Edit</button>
                  <button type="button" onClick={() => handleDelete(r)} disabled={deleteLoadingId === getReservationId(r)} style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #c53030', borderRadius: 6, background: '#fff', color: '#c53030', cursor: deleteLoadingId === getReservationId(r) ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {deleteLoadingId === getReservationId(r) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <>
          <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} onClick={closeEdit} />
          <div
            className="admin-card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
              width: '90vw',
              maxWidth: 520,
              maxHeight: '90vh',
              overflow: 'auto',
              background: '#fff',
              boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e8e4df'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e8e4df' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0d2137' }}>Edit reservation · {editing.reservationNumber}</h3>
              <button type="button" onClick={closeEdit} aria-label="Close" style={{ padding: 8, border: 'none', background: '#f5f2ee', borderRadius: 6, cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              {editError && (
                <>
                  <Alert message={editError} onDismiss={() => setEditError('')} />
                  {(editError.includes('Access denied') || editError.includes('log in again')) && (
                    <div style={{ marginTop: 8 }}>
                      <button type="button" onClick={() => { logout(); navigate('/login', { state: { logoutSuccess: true } }); }} className="admin-gold-btn" style={{ padding: '8px 16px', fontSize: 13 }}>Log out and sign in again</button>
                    </div>
                  )}
                </>
              )}
              <div style={{ marginBottom: 14 }}>
                <label className="admin-form-label">Guest name *</label>
                <input name="guestName" value={form.guestName} onChange={handleFormChange} required className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="admin-form-label">Address *</label>
                <input name="address" value={form.address} onChange={handleFormChange} required className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="admin-form-label">NIC *</label>
                  <input name="nicNumber" value={form.nicNumber} onChange={handleFormChange} required className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="admin-form-label">Contact *</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={handleFormChange} required className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="admin-form-label">Room type *</label>
                <select name="roomType" value={form.roomType} onChange={handleFormChange} required className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="">Select room type</option>
                  {roomTypes.map((t) => (
                    <option key={t} value={t}>{t} – LKR {rooms.find(r => r.roomType === t)?.ratePerNight?.toLocaleString()}/night</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="admin-form-label">Check-in date *</label>
                  <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleFormChange} required className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="admin-form-label">Check-in time</label>
                  <input name="checkInTime" value={form.checkInTime} onChange={handleFormChange} placeholder="02:00 PM" className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="admin-form-label">Check-out date *</label>
                  <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleFormChange} required min={form.checkInDate} className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="admin-form-label">Check-out time</label>
                  <input name="checkOutTime" value={form.checkOutTime} onChange={handleFormChange} placeholder="11:00 AM" className="admin-form-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              {nights > 0 && selectedRate && (
                <div style={{ padding: 12, background: '#f0ede8', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                  <strong>{nights}</strong> night(s) × LKR {selectedRate?.toLocaleString()} = <strong>LKR {totalBill.toLocaleString()}</strong> (recalculated on save)
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid #e8e4df' }}>
                <button type="button" onClick={closeEdit} style={{ padding: '10px 20px', border: '1px solid #e0dbd4', borderRadius: 6, background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>Cancel</button>
                <button type="submit" disabled={editLoading} className="admin-gold-btn" style={{ padding: '10px 20px', opacity: editLoading ? 0.7 : 1 }}>{editLoading ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}
