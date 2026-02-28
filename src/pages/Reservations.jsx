import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
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

const emptyEditForm = {
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

export default function Reservations() {
  const { api } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingReservation, setEditingReservation] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [rooms, setRooms] = useState([])
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)

  const fetchList = useCallback(() => {
    setError('')
    return api('/api/reservations/my')
      .then(r => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : []
        setList(arr.map((item) => ({ ...item, id: item.id ?? item._id })))
      })
      .catch((err) => {
        setList([])
        const msg = err?.message || 'Failed to load reservations'
        setError(msg)
        showValidationAlert(msg)
      })
      .finally(() => setLoading(false))
  }, [api])

  useEffect(() => {
    setLoading(true)
    fetchList()
  }, [fetchList])

  useEffect(() => {
    if (!editingReservation) return
    setEditForm({
      guestName: editingReservation.guestName || '',
      address: editingReservation.address || '',
      nicNumber: editingReservation.nicNumber || '',
      contactNumber: editingReservation.contactNumber || '',
      roomType: editingReservation.roomType || '',
      checkInDate: editingReservation.checkInDate || '',
      checkInTime: timeToAmPm(editingReservation.checkInTime),
      checkOutDate: editingReservation.checkOutDate || '',
      checkOutTime: timeToAmPm(editingReservation.checkOutTime)
    })
    setEditError('')
    fetch('/api/rooms/available')
      .then(r => r.json())
      .then(setRooms)
      .catch(() => setRooms([]))
  }, [editingReservation])

  const roomTypes = [...new Set(rooms.map(r => r.roomType))]
  const selectedRate = rooms.find(r => r.roomType === editForm.roomType)?.ratePerNight
  const checkIn = editForm.checkInDate ? new Date(editForm.checkInDate) : null
  const checkOut = editForm.checkOutDate ? new Date(editForm.checkOutDate) : null
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000)) : 0
  const totalBill = selectedRate && nights > 0 ? selectedRate * nights : 0

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
    setEditError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingReservation) return
    setEditError('')
    const errs = validateForm({
      guestName: (v) => validations.required(v, 'Guest name'),
      address: (v) => validations.required(v, 'Address'),
      nicNumber: (v) => validations.required(v, 'NIC number'),
      contactNumber: (v) => validations.required(v, 'Contact number'),
      roomType: (v) => validations.required(v, 'Room type'),
      checkInDate: (v) => validations.required(v, 'Check-in date'),
      checkOutDate: (v) => validations.required(v, 'Check-out date')
    }, editForm)
    if (errs) {
      const msg = Object.values(errs)[0]
      setEditError(msg)
      showValidationAlert(msg)
      return
    }
    const dateErr = validations.dateAfter(editForm.checkOutDate, editForm.checkInDate)
    if (dateErr) {
      setEditError(dateErr)
      showValidationAlert(dateErr)
      return
    }
    if (nights <= 0) {
      const msg = 'Please select valid check-in and check-out dates'
      setEditError(msg)
      showValidationAlert(msg)
      return
    }
    const nicErr = validations.nic(editForm.nicNumber)
    if (nicErr) {
      setEditError(nicErr)
      showValidationAlert(nicErr)
      return
    }
    const phoneErr = validations.phone(editForm.contactNumber)
    if (phoneErr) {
      setEditError(phoneErr)
      showValidationAlert(phoneErr)
      return
    }
    setEditLoading(true)
    try {
      const payload = {
        guestName: editForm.guestName.trim(),
        address: editForm.address.trim(),
        nicNumber: editForm.nicNumber.trim(),
        contactNumber: editForm.contactNumber.trim(),
        roomType: editForm.roomType.trim(),
        roomId: null,
        checkInDate: editForm.checkInDate,
        checkInTime: parseTime(editForm.checkInTime) ? `${parseTime(editForm.checkInTime)}:00` : '14:00:00',
        checkOutDate: editForm.checkOutDate,
        checkOutTime: parseTime(editForm.checkOutTime) ? `${parseTime(editForm.checkOutTime)}:00` : '11:00:00'
      }
      const id = getReservationId(editingReservation)
      if (!id) {
        setEditError('Invalid reservation')
        setEditLoading(false)
        return
      }
      const res = await api(`/api/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const raw = await res.text()
      let data = {}
      try {
        if (raw) data = JSON.parse(raw) || {}
      } catch (_) {
        if (!res.ok && raw) data = { error: raw }
      }
      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          (typeof data === 'object' && Object.keys(data).length > 0 && Object.values(data).join('. ')) ||
          (res.status === 401 ? 'Please log in again.' : null) ||
          (res.status === 403 ? 'Access denied. Please log out and log in again, then try again.' : null) ||
          (res.status === 404 ? 'Reservation not found.' : null) ||
          (res.status >= 500 ? `Server error (${res.status})` : null) ||
          `Failed to update reservation (${res.status})`
        throw new Error(msg)
      }
      setEditingReservation(null)
      setEditForm(emptyEditForm)
      const updatedId = data.id ?? data._id
      setList(prev => prev.map(item => (item.id ?? item._id) === updatedId ? { ...data, id: updatedId } : item))
      setEditSuccess(`Reservation updated. Bill recalculated: LKR ${(data.totalBill ?? 0).toLocaleString()}.`)
    } catch (err) {
      const msg = err.message || 'Failed to update reservation'
      setEditError(msg)
      showValidationAlert(msg)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`Cancel reservation ${r.reservationNumber}? This cannot be undone.`)) return
    const id = getReservationId(r)
    if (!id) {
      setError('Invalid reservation')
      return
    }
    setDeleteLoadingId(id)
    try {
      const res = await api(`/api/reservations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const raw = await res.text()
        let data = {}
        try {
          if (raw) data = JSON.parse(raw) || {}
        } catch (_) {
          if (raw) data = { error: raw }
        }
        const msg = data?.error || data?.message || (res.status === 401 ? 'Please log in again.' : null) || (res.status === 403 ? 'Access denied. Please log out and log in again, then try again.' : null) || (res.status === 404 ? 'Reservation not found.' : null) || `Failed to delete reservation (${res.status})`
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

  return (
    <>
      <div className="customer-page-header">
        <div>
          <div className="customer-page-title">My Reservations</div>
          <div className="customer-page-subtitle">View and manage your bookings</div>
        </div>
        <Link to="/reservations/new" className="customer-gold-btn">
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Book Now
        </Link>
      </div>
      <div className="customer-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
        {loading ? (
          <p style={{ color: '#9a8f83' }}>Loading...</p>
        ) : list.length === 0 ? (
          <p style={{ color: '#9a8f83' }}>
            You have no reservations yet.{' '}
            <Link to="/reservations/new" className="customer-gold-btn" style={{ marginLeft: 8, display: 'inline-flex' }}>Book now</Link>
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {list.map((r) => (
              <div key={getReservationId(r) || r.reservationNumber} className="customer-card">
                <div className="customer-card-title">{r.reservationNumber}</div>
                <div className="customer-card-meta">{r.guestName} · {r.roomType}</div>
                <p style={{ fontSize: 12.5, color: '#9a8f83', marginTop: 8 }}>
                  {format(new Date(r.checkInDate), 'MMM d, yyyy')} – {format(new Date(r.checkOutDate), 'MMM d, yyyy')} · {r.nights} night(s)
                </p>
                <div className="customer-card-rate">LKR {r.totalBill?.toLocaleString()}</div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setEditingReservation(r)} className="customer-gold-btn" style={{ padding: '8px 14px', fontSize: 13 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(r)} disabled={deleteLoadingId === getReservationId(r)} style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #c53030', borderRadius: 6, background: 'white', color: '#c53030', cursor: deleteLoadingId === getReservationId(r) ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {deleteLoadingId === getReservationId(r) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingReservation && (
        <div className="customer-card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, maxWidth: 560, width: '90vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="customer-page-title" style={{ margin: 0, fontSize: 20 }}>Edit reservation</h3>
            <button type="button" onClick={() => { setEditingReservation(null); setEditForm(emptyEditForm); setEditError(''); }} aria-label="Close" style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: '#9a8f83', lineHeight: 1 }}>×</button>
          </div>
          <form onSubmit={handleEditSubmit}>
            {editError && <Alert message={editError} onDismiss={() => setEditError('')} />}
            <div style={{ marginBottom: 16 }}><label className="customer-form-label">Guest Name *</label><input name="guestName" value={editForm.guestName} onChange={handleEditChange} required className="customer-form-input" /></div>
            <div style={{ marginBottom: 16 }}><label className="customer-form-label">Address *</label><input name="address" value={editForm.address} onChange={handleEditChange} required className="customer-form-input" /></div>
            <div style={{ marginBottom: 16 }}><label className="customer-form-label">NIC Number *</label><input name="nicNumber" value={editForm.nicNumber} onChange={handleEditChange} required className="customer-form-input" /></div>
            <div style={{ marginBottom: 16 }}><label className="customer-form-label">Contact Number *</label><input name="contactNumber" value={editForm.contactNumber} onChange={handleEditChange} required className="customer-form-input" /></div>
            <div style={{ marginBottom: 16 }}>
              <label className="customer-form-label">Room Type *</label>
              <select name="roomType" value={editForm.roomType} onChange={handleEditChange} required className="customer-form-input">
                <option value="">Select room type</option>
                {roomTypes.map((t) => (
                  <option key={t} value={t}>{t} – LKR {rooms.find((r) => r.roomType === t)?.ratePerNight?.toLocaleString()}/night</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label className="customer-form-label">Check-in Date *</label><input name="checkInDate" type="date" value={editForm.checkInDate} onChange={handleEditChange} required className="customer-form-input" /></div>
              <div><label className="customer-form-label">Check-in Time (AM/PM)</label><input name="checkInTime" value={editForm.checkInTime} onChange={handleEditChange} placeholder="02:00 PM" className="customer-form-input" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label className="customer-form-label">Check-out Date *</label><input name="checkOutDate" type="date" value={editForm.checkOutDate} onChange={handleEditChange} required min={editForm.checkInDate} className="customer-form-input" /></div>
              <div><label className="customer-form-label">Check-out Time (AM/PM)</label><input name="checkOutTime" value={editForm.checkOutTime} onChange={handleEditChange} placeholder="11:00 AM" className="customer-form-input" /></div>
            </div>
            {nights > 0 && selectedRate && (
              <div style={{ padding: 16, background: '#f0ede8', borderRadius: 8, marginBottom: 16 }}>
                <p style={{ fontSize: 13.5, color: '#0d2137' }}><strong>{nights}</strong> night(s) × LKR {selectedRate.toLocaleString()} = <strong>LKR {totalBill.toLocaleString()}</strong></p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setEditingReservation(null); setEditForm(emptyEditForm); setEditError(''); }} style={{ padding: '9px 20px', border: '1px solid #e0dbd4', borderRadius: 6, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#374151' }}>Cancel</button>
              <button type="submit" disabled={editLoading} className="customer-gold-btn" style={{ opacity: editLoading ? 0.7 : 1 }}>{editLoading ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>
      )}

      {editingReservation && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} onClick={() => { setEditingReservation(null); setEditForm(emptyEditForm); setEditError(''); }} />
      )}
    </>
  )
}
