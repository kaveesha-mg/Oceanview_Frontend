import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

  .res-container { font-family: 'Inter', sans-serif; background: #fcfcfd; min-height: 100vh; }
  
  /* ADMIN-STYLE HEADER BAR */
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
  }

  .customer-gold-btn {
    background: #0f172a; 
    color: #fff; 
    border: none;
    padding: 14px 28px; 
    border-radius: 10px; 
    font-size: 14px;
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.2s; 
    text-decoration: none;
    display: inline-flex; 
    align-items: center; 
    gap: 10px;
  }
  
  .customer-gold-btn:hover { 
    background: #1e293b; 
    transform: translateY(-1px); 
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
  }

  /* BODY CONTENT */
  .customer-page-body {
    padding: 0 60px 100px 60px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .res-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 32px; 
  }

  .customer-card {
    background: #fff; 
    border: 1px solid #e2e8f0; 
    border-radius: 16px;
    padding: 32px; 
    transition: all 0.3s ease; 
    position: relative;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  
  .customer-card:hover { 
    border-color: #0f172a; 
    box-shadow: 0 12px 24px rgba(0,0,0,0.06); 
  }

  .customer-card-title {
    font-size: 12px; 
    font-weight: 700; 
    color: #94a3b8;
    letter-spacing: 0.15em; 
    text-transform: uppercase; 
    margin-bottom: 20px;
    display: flex; 
    justify-content: space-between;
  }

  .customer-card-meta {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; 
    color: #0f172a; 
    font-weight: 600;
  }

  .customer-card-rate {
    margin-top: 24px; 
    padding-top: 24px; 
    border-top: 1px solid #f1f5f9;
    font-weight: 700; 
    color: #0f172a; 
    font-size: 20px;
  }

  /* Modal Edit Design */
  .edit-modal {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    z-index: 100; width: 100%; max-width: 600px;
    background: #fff; padding: 48px; border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }

  .customer-form-label {
    display: block; font-size: 13px; font-weight: 600; color: #334155;
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
  }

  .customer-form-input {
    width: 100%; padding: 12px 16px; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 10px; font-size: 15px;
    transition: all 0.2s;
  }
  .customer-form-input:focus { outline: none; border-color: #0f172a; background: #fff; }

  .bill-preview {
    background: #0f172a; color: #fff; padding: 24px;
    border-radius: 12px; margin: 24px 0;
  }

  .overlay {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px); z-index: 90;
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
      setEditError(msg); showValidationAlert(msg); return
    }
    const dateErr = validations.dateAfter(editForm.checkOutDate, editForm.checkInDate)
    if (dateErr) { setEditError(dateErr); showValidationAlert(dateErr); return }
    
    setEditLoading(true)
    try {
      const payload = {
        ...editForm,
        checkInTime: `${parseTime(editForm.checkInTime)}:00`,
        checkOutTime: `${parseTime(editForm.checkOutTime)}:00`
      }
      const id = getReservationId(editingReservation)
      const res = await api(`/api/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json()
      setEditingReservation(null)
      fetchList()
      setEditSuccess('Itinerary updated successfully.')
    } catch (err) {
      setEditError(err.message); showValidationAlert(err.message)
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
        {/* NEW ADMIN-STYLE HEADER BAR */}
        <div className="customer-page-header">
          <div>
            <h1 className="customer-page-title">My Itinerary</h1>
            <div className="customer-page-subtitle">Personalized reservations at Ocean View</div>
          </div>
          <Link to="/reservations/new" className="customer-gold-btn">
            <span style={{fontSize: '18px'}}>+</span> New Reservation
          </Link>
        </div>

        <div className="customer-page-body">
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Refining your itinerary...</p>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: '#fff', border: '1px dashed #e2e8f0', borderRadius: '16px' }}>
              <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '16px' }}>Your travel journal is currently empty.</p>
              <Link to="/reservations/new" className="customer-gold-btn">Begin Your Journey</Link>
            </div>
          ) : (
            <div className="res-grid">
              {list.map((r) => (
                <div key={getReservationId(r)} className="customer-card">
                  <div className="customer-card-title">
                    <span>{r.reservationNumber}</span>
                    <span style={{color: '#10b981', fontWeight: 700}}>✓ Confirmed</span>
                  </div>
                  <div className="customer-card-meta">{r.roomType} Suite</div>
                  <div style={{ fontSize: '15px', color: '#64748b', marginTop: '12px', lineHeight: 1.6 }}>
                    {format(new Date(r.checkInDate), 'MMMM do')} — {format(new Date(r.checkOutDate), 'MMMM do, yyyy')}
                    <br /> <strong style={{color: '#334155'}}>{r.nights} Nights</strong> · {r.guestName}
                  </div>
                  <div className="customer-card-rate">LKR {r.totalBill?.toLocaleString()}</div>
                  
                  <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => setEditingReservation(r)} className="customer-gold-btn" style={{flex: 1, justifyContent: 'center'}}>Edit Stay</button>
                    <button 
                      onClick={() => handleDelete(r)} 
                      disabled={deleteLoadingId === getReservationId(r)}
                      style={{ padding: '0 20px', background: 'transparent', border: '1px solid #e2e8f0', color: '#ef4444', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                      onMouseOut={(e) => e.target.style.background = 'transparent'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', margin: 0, fontWeight: 600 }}>Modify Stay</h3>
              <button onClick={() => setEditingReservation(null)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              {editError && <Alert message={editError} onDismiss={() => setEditError('')} />}
              
              <div style={{ marginBottom: '24px' }}>
                <label className="customer-form-label">Primary Guest</label>
                <input name="guestName" value={editForm.guestName} onChange={handleEditChange} className="customer-form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label className="customer-form-label">NIC / Passport</label>
                  <input name="nicNumber" value={editForm.nicNumber} onChange={handleEditChange} className="customer-form-input" />
                </div>
                <div>
                  <label className="customer-form-label">Contact</label>
                  <input name="contactNumber" value={editForm.contactNumber} onChange={handleEditChange} className="customer-form-input" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="customer-form-label">Suite Preference</label>
                <select name="roomType" value={editForm.roomType} onChange={handleEditChange} className="customer-form-input">
                  {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label className="customer-form-label">Check-in</label>
                  <input name="checkInDate" type="date" value={editForm.checkInDate} onChange={handleEditChange} className="customer-form-input" />
                </div>
                <div>
                  <label className="customer-form-label">Check-out</label>
                  <input name="checkOutDate" type="date" value={editForm.checkOutDate} onChange={handleEditChange} className="customer-form-input" />
                </div>
              </div>

              {nights > 0 && (
                <div className="bill-preview">
                  <div style={{fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '8px'}}>Updated Estimated Total</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>LKR {totalBill.toLocaleString()}</div>
                  <div style={{fontSize: '14px', opacity: 0.8, marginTop: '8px'}}>{nights} Nights at LKR {selectedRate?.toLocaleString()}/night</div>
                </div>
              )}

              <button type="submit" disabled={editLoading} className="customer-gold-btn" style={{ width: '100%', justifyContent: 'center', padding: '18px' }}>
                {editLoading ? 'Updating Stay...' : 'Confirm Changes'}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}