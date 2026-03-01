import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

  .res-container { font-family: 'Inter', sans-serif; max-width: 1200px; margin: 0 auto; }
  
  .customer-page-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding: 40px 0; border-bottom: 1px solid #eee; margin-bottom: 40px;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px; color: #0a1628; line-height: 1;
  }
  
  .customer-page-subtitle {
    font-size: 14px; color: #718096; margin-top: 8px; letter-spacing: 0.05em;
  }

  .customer-gold-btn {
    background: #0a1628; color: #f0d48a; border: none;
    padding: 12px 24px; border-radius: 4px; font-size: 12px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em;
    cursor: pointer; transition: all 0.3s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .customer-gold-btn:hover { background: #1a2a3a; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(10,22,40,0.1); }

  .res-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 30px; margin-bottom: 60px;
  }

  .customer-card {
    background: #fff; border: 1px solid #f0f0f0; border-radius: 8px;
    padding: 30px; transition: all 0.3s; position: relative;
    overflow: hidden;
  }
  .customer-card:hover { border-color: #f0d48a; box-shadow: 0 15px 40px rgba(0,0,0,0.04); }

  .customer-card-title {
    font-size: 11px; font-weight: 700; color: #c5a367;
    letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 15px;
    display: flex; justify-content: space-between;
  }

  .customer-card-meta {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; color: #0a1628; font-weight: 500;
  }

  .customer-card-rate {
    margin-top: 20px; padding-top: 20px; border-top: 1px dashed #eee;
    font-weight: 600; color: #0a1628; font-size: 18px;
  }

  /* Modal Edit Design */
  .edit-modal {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    z-index: 100; width: 100%; max-width: 600px;
    background: #fff; padding: 50px; border-radius: 4px;
    box-shadow: 0 30px 90px rgba(0,0,0,0.25);
  }

  .customer-form-label {
    display: block; font-size: 11px; font-weight: 700; color: #0a1628;
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
  }

  .customer-form-input {
    width: 100%; padding: 12px 16px; background: #f9f9f9;
    border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px;
    transition: all 0.3s;
  }
  .customer-form-input:focus { outline: none; border-color: #f0d48a; background: #fff; }

  .bill-preview {
    background: #0a1628; color: #f0d48a; padding: 20px;
    border-radius: 4px; margin: 25px 0;
  }

  .overlay {
    position: fixed; inset: 0; background: rgba(10,22,40,0.8);
    backdrop-filter: blur(4px); z-index: 90;
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
  guestName: '', address: '', nicNumber: '', contactNumber: '',
  roomType: '', checkInDate: '', checkInTime: '02:00 PM',
  checkOutDate: '', checkOutTime: '11:00 AM'
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
        const msg = data?.error || data?.message || `Failed to update (${res.status})`
        throw new Error(msg)
      }
      setEditingReservation(null)
      setEditForm(emptyEditForm)
      const updatedId = data.id ?? data._id
      setList(prev => prev.map(item => (item.id ?? item._id) === updatedId ? { ...data, id: updatedId } : item))
      setEditSuccess(`Reservation updated. Bill recalculated: LKR ${(data.totalBill ?? 0).toLocaleString()}.`)
    } catch (err) {
      setEditError(err.message)
      showValidationAlert(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`Cancel reservation ${r.reservationNumber}?`)) return
    const id = getReservationId(r)
    setDeleteLoadingId(id)
    try {
      const res = await api(`/api/reservations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setList(prev => prev.filter(x => (x.id ?? x._id) !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="res-container">
        <div className="customer-page-header">
          <div>
            <h1 className="customer-page-title">My Itinerary</h1>
            <div className="customer-page-subtitle">Personalized reservations at Ocean View</div>
          </div>
          <Link to="/reservations/new" className="customer-gold-btn">
            <span>+</span> New Reservation
          </Link>
        </div>

        <div className="customer-page-body">
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '100px', color: '#a0aec0' }}>Refining your itinerary...</p>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: '#fcfaf7', borderRadius: '8px' }}>
              <p style={{ color: '#718096', marginBottom: '20px' }}>Your travel journal is currently empty.</p>
              <Link to="/reservations/new" className="customer-gold-btn">Begin Your Journey</Link>
            </div>
          ) : (
            <div className="res-grid">
              {list.map((r) => (
                <div key={getReservationId(r)} className="customer-card">
                  <div className="customer-card-title">
                    <span>{r.reservationNumber}</span>
                    <span style={{color: '#48bb78'}}>Confirmed</span>
                  </div>
                  <div className="customer-card-meta">{r.roomType} Suite</div>
                  <div style={{ fontSize: '13px', color: '#718096', marginTop: '10px' }}>
                    {format(new Date(r.checkInDate), 'MMMM do')} — {format(new Date(r.checkOutDate), 'MMMM do, yyyy')}
                    <br /> {r.nights} Nights · {r.guestName}
                  </div>
                  <div className="customer-card-rate">LKR {r.totalBill?.toLocaleString()}</div>
                  
                  <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => setEditingReservation(r)} className="customer-gold-btn" style={{flex: 1, justifyContent: 'center'}}>Edit</button>
                    <button 
                      onClick={() => handleDelete(r)} 
                      disabled={deleteLoadingId === getReservationId(r)}
                      style={{ padding: '12px', background: 'transparent', border: '1px solid #e2e8f0', color: '#e53e3e', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {deleteLoadingId === getReservationId(r) ? '...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingReservation && (
        <>
          <div className="overlay" onClick={() => setEditingReservation(null)} />
          <div className="edit-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', margin: 0 }}>Modify Reservation</h3>
              <button onClick={() => setEditingReservation(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              {editError && <Alert message={editError} onDismiss={() => setEditError('')} />}
              
              <div style={{ marginBottom: '20px' }}>
                <label className="customer-form-label">Primary Guest</label>
                <input name="guestName" value={editForm.guestName} onChange={handleEditChange} className="customer-form-input" />
              </div>

              <div className="res-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="customer-form-label">NIC / Passport</label>
                  <input name="nicNumber" value={editForm.nicNumber} onChange={handleEditChange} className="customer-form-input" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="customer-form-label">Contact</label>
                  <input name="contactNumber" value={editForm.contactNumber} onChange={handleEditChange} className="customer-form-input" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="customer-form-label">Suite Preference</label>
                <select name="roomType" value={editForm.roomType} onChange={handleEditChange} className="customer-form-input">
                  {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="res-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="customer-form-label">Check-in</label>
                  <input name="checkInDate" type="date" value={editForm.checkInDate} onChange={handleEditChange} className="customer-form-input" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="customer-form-label">Check-out</label>
                  <input name="checkOutDate" type="date" value={editForm.checkOutDate} onChange={handleEditChange} className="customer-form-input" />
                </div>
              </div>

              {nights > 0 && (
                <div className="bill-preview">
                  <div style={{fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '5px'}}>Estimated Total</div>
                  <div style={{fontSize: '22px', fontWeight: '600'}}>LKR {totalBill.toLocaleString()}</div>
                  <div style={{fontSize: '12px', opacity: 0.7, marginTop: '5px'}}>{nights} Nights at LKR {selectedRate?.toLocaleString()}/night</div>
                </div>
              )}

              <button type="submit" disabled={editLoading} className="customer-gold-btn" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                {editLoading ? 'Updating Itinerary...' : 'Confirm Changes'}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}