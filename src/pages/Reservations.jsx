import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

  /* FULL PAGE WRAPPER WITH BACKGROUND */
  .res-container { 
    font-family: 'Inter', sans-serif; 
    min-height: 100vh; 
    background: linear-gradient(rgba(253, 250, 245, 0.4), rgba(253, 250, 245, 0.4)), 
                url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
  }
  
  /* FROSTED GLASS HEADER */
  .customer-page-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    padding: 30px 50px;
    border-bottom: 1px solid rgba(229, 222, 201, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .header-left-group { display: flex; flex-direction: column; gap: 4px; }

  .breadcrumb-text {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #d4af7a;
    font-weight: 800;
  }

  .customer-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; 
    font-weight: 700;
    color: #0f172a; 
    line-height: 1;
    margin: 0;
  }

  /* BUTTON STYLING */
  .customer-gold-btn {
    background: #0f172a; 
    color: #d4af7a;
    border: 1px solid rgba(212, 175, 122, 0.3);
    padding: 12px 24px; 
    border-radius: 8px; 
    font-size: 14px;
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    text-decoration: none;
    display: inline-flex; 
    align-items: center; 
    gap: 10px;
  }
  
  .customer-gold-btn:hover { 
    background: #d4af7a; 
    color: #0f172a;
    transform: translateY(-3px); 
    box-shadow: 0 10px 20px rgba(212, 175, 122, 0.3); 
  }

  /* BLUR BODY CONTENT */
  .customer-page-body {
    flex: 1;
    padding: 60px 50px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .res-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 30px; 
    max-width: 1300px;
    margin: 0 auto;
  }

  /* MIDNIGHT GLASS CARDS */
  .customer-card {
    background: rgba(15, 23, 42, 0.85); 
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 35px; 
    transition: all 0.4s ease; 
    position: relative;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
  
  .customer-card:hover { 
    border-color: #d4af7a; 
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); 
  }

  .status-badge {
    font-size: 11px;
    font-weight: 800;
    padding: 4px 12px;
    background: rgba(22, 163, 74, 0.2);
    color: #4ade80;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .customer-card-meta {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px; 
    color: #ffffff; 
    font-weight: 700;
    margin: 20px 0 8px 0;
  }

  .customer-card-rate {
    margin-top: 25px; 
    padding-top: 20px; 
    border-top: 1px solid rgba(212, 175, 122, 0.2);
    font-weight: 800; 
    color: #d4af7a; 
    font-size: 24px;
  }

  /* MODAL STYLING */
  .edit-modal {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    z-index: 100; width: 90%; max-width: 550px;
    background: #ffffff; padding: 40px; border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    border: 1px solid #d4af7a;
  }

  .overlay {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(6px); z-index: 90;
  }

  .customer-form-label {
    display: block; font-size: 12px; font-weight: 700; color: #64748b; 
    margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;
  }

  .customer-form-input {
    width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;
    font-family: inherit; font-size: 14px; outline: none; transition: border 0.3s;
  }

  .customer-form-input:focus { border-color: #d4af7a; }

  @media (max-width: 768px) {
    .customer-page-header { padding: 25px; flex-direction: column; align-items: flex-start; gap: 20px; }
    .res-grid { grid-template-columns: 1fr; }
    .customer-page-body { padding: 30px 20px; }
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
  const { api, user } = useAuth()
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
        
        {/* GLASS HEADER */}
        <header className="customer-page-header">
          <div className="header-left-group">
            <span className="breadcrumb-text">Guest Resources</span>
            <h1 className="customer-page-title">My Itinerary</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
             <div style={{ textAlign: 'right', borderRight: '1px solid rgba(212, 175, 122, 0.3)', paddingRight: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{user?.username}</div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '800' }}>● ONLINE</div>
             </div>
             <Link to="/reservations/new" className="customer-gold-btn">
               <span style={{fontSize: '20px'}}>⊕</span> New Booking
             </Link>
          </div>
        </header>

        {/* BLUR BODY */}
        <main className="customer-page-body">
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '100px', color: '#64748b', fontSize: '18px', fontFamily: 'Cormorant Garamond' }}>Curating your travel journal...</p>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.4)', border: '2px dashed #d4af7a', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: '#0f172a', marginBottom: '24px', fontSize: '24px', fontFamily: 'Cormorant Garamond', fontWeight: 700 }}>Your itinerary is currently empty.</p>
              <Link to="/reservations/new" className="customer-gold-btn">Begin Your Journey</Link>
            </div>
          ) : (
            <div className="res-grid">
              {list.map((r) => (
                <div key={getReservationId(r)} className="customer-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#d4af7a', fontWeight: 800, letterSpacing: '0.15em' }}>RESERVATION #{r.reservationNumber}</span>
                    <span className="status-badge">Confirmed</span>
                  </div>
                  <div className="customer-card-meta">{r.roomType} Suite</div>
                  <div style={{ fontSize: '15px', color: '#cbd5e1', marginTop: '15px', lineHeight: 1.8 }}>
                    {format(new Date(r.checkInDate), 'MMMM do')} — {format(new Date(r.checkOutDate), 'MMMM do, yyyy')}
                    <br /> <strong style={{color: '#ffffff'}}>{r.nights} Nights</strong> · Registered to {r.guestName}
                  </div>
                  <div className="customer-card-rate">LKR {r.totalBill?.toLocaleString()}</div>
                  
                  <div style={{ marginTop: '35px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => setEditingReservation(r)} className="customer-gold-btn" style={{flex: 1, justifyContent: 'center'}}>Modify Stay</button>
                    <button 
                      onClick={() => handleDelete(r)} 
                      disabled={deleteLoadingId === getReservationId(r)}
                      style={{ padding: '0 18px', background: 'transparent', border: '1px solid #f87171', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', transition: '0.3s' }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
                      onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      {deleteLoadingId === getReservationId(r) ? '...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* EDIT MODAL */}
      {editingReservation && (
        <>
          <div className="overlay" onClick={() => setEditingReservation(null)} />
          <div className="edit-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '30px', margin: 0, fontWeight: 700, color: '#0f172a' }}>Modify Reservation</h3>
              <button onClick={() => setEditingReservation(null)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              {editError && <Alert message={editError} onDismiss={() => setEditError('')} />}
              
              <div style={{ marginBottom: '20px' }}>
                <label className="customer-form-label">Primary Guest</label>
                <input name="guestName" value={editForm.guestName} onChange={handleEditChange} className="customer-form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label className="customer-form-label">NIC / Passport</label>
                  <input name="nicNumber" value={editForm.nicNumber} onChange={handleEditChange} className="customer-form-input" />
                </div>
                <div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
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
                <div style={{ background: '#0f172a', color: '#d4af7a', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #d4af7a' }}>
                  <div style={{fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8, marginBottom: '5px'}}>Updated Estimated Total</div>
                  <div style={{fontSize: '26px', fontWeight: '800'}}>LKR {totalBill.toLocaleString()}</div>
                  <div style={{fontSize: '12px', opacity: 0.8, marginTop: '4px'}}>{nights} Nights at LKR {selectedRate?.toLocaleString()}/night</div>
                </div>
              )}

              <button type="submit" disabled={editLoading} className="customer-gold-btn" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}>
                {editLoading ? 'Synchronizing...' : 'Confirm Changes'}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}