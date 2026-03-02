import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  /* FULL PAGE WRAPPER WITH RESORT BACKGROUND */
  .reservations-container { 
    font-family: 'Inter', sans-serif; 
    color: #1e293b; 
    min-height: 100vh;
    background: linear-gradient(rgba(253, 250, 245, 0.45), rgba(253, 250, 245, 0.45)), 
                url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
  }

  /* FROSTED GLASS HEADER */
  .admin-page-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    padding: 40px 60px;
    border-bottom: 1px solid rgba(229, 222, 201, 0.5);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #d4af7a;
    font-weight: 700;
    margin-top: 8px;
  }

  /* BLUR BODY CONTENT */
  .admin-page-body {
    flex: 1;
    padding: 60px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .res-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* ELEVATED RESERVATION CARDS */
  .res-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 32px;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.03);
  }

  .res-card:hover {
    border-color: #d4af7a;
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    transform: translateY(-5px);
  }

  /* UPDATED: REFERENCE NUMBER TAG */
  .res-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    background: #0f172a; /* Dark Midnight */
    color: #ffffff;      /* PURE WHITE AS REQUESTED */
    padding: 6px 14px;
    border-radius: 6px;
    display: inline-block;
    margin-bottom: 18px;
    font-weight: 600;
    letter-spacing: 1px;
    border: 1px solid rgba(212, 175, 122, 0.3);
  }

  .guest-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
  }

  .room-tag {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .date-row {
    margin: 24px 0;
    padding: 20px 0;
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
  }

  .date-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #94a3b8;
    margin-bottom: 8px;
    font-weight: 800;
  }

  .date-value {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }

  .bill-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .total-amt {
    font-family: 'JetBrains Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }

  .admin-gold-btn {
    background: #0f172a;
    color: #d4af7a;
    border: 1px solid rgba(212, 175, 122, 0.3);
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
  }

  .admin-gold-btn:hover { 
    background: #d4af7a; 
    color: #0f172a;
    transform: translateY(-2px);
  }

  .delete-link {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .delete-link:hover { opacity: 1; text-decoration: underline; }

  /* MODAL STYLES */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(10px);
    z-index: 100;
  }

  .modal-content {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #fff; border-radius: 24px;
    width: 90vw; max-width: 600px;
    max-height: 90vh; overflow-y: auto;
    padding: 50px; z-index: 101;
    box-shadow: 0 30px 60px rgba(0,0,0,0.2);
  }

  .form-group { margin-bottom: 24px; }
  .admin-form-label { font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 10px; display: block; text-transform: uppercase; letter-spacing: 0.05em; }
  .admin-form-input { 
    width: 100%; padding: 14px; border: 1px solid #e2e8f0; 
    border-radius: 12px; font-family: 'Inter'; font-size: 15px;
    box-sizing: border-box; background: #fcfcfd;
  }
  .admin-form-input:focus { outline: none; border-color: #d4af7a; box-shadow: 0 0 0 4px rgba(212, 175, 122, 0.1); }
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
    if (dateErr) { setEditError(dateErr); return; }
    if (nights <= 0) { setEditError('Please select valid check-in and check-out dates'); return; }
    
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
      const res = await api(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')
      
      setList(prev => prev.map(item => (item.id ?? item._id) === id ? { ...data, id } : item))
      setEditSuccess(`Reservation updated.`)
      setEditing(null)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (r) => {
    if (!confirm(`Remove record for ${r.guestName}?`)) return
    const id = getReservationId(r)
    setDeleteLoadingId(id)
    try {
      const res = await api(`/api/admin/reservations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setList(prev => prev.filter(x => (x.id ?? x._id) !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  return (
    <div className="reservations-container">
      <style>{css}</style>
      
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reservations Ledger</h1>
          <div className="admin-page-subtitle">Managing active and upcoming guest stays</div>
        </div>
      </header>

      <main className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        {editSuccess && <Alert type="success" message={editSuccess} onDismiss={() => setEditSuccess('')} />}
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', fontFamily: 'Cormorant Garamond', fontWeight: 600 }}>Syncing ledger...</p>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', border: '2px dashed #d4af7a', borderRadius: '24px', background: 'rgba(255,255,255,0.4)' }}>
            <p style={{ color: '#0f172a', fontSize: '20px', fontFamily: 'Cormorant Garamond', fontWeight: 600 }}>No guest records found.</p>
          </div>
        ) : (
          <div className="res-grid">
            {list.map((r) => (
              <div key={getReservationId(r) || r.reservationNumber} className="res-card">
                <span className="res-number">REF: {r.reservationNumber}</span>
                <div className="guest-name">{r.guestName}</div>
                <div className="room-tag">
                  <span>{r.roomType} Suite</span>
                  <span>•</span>
                  <span>{r.nights} {r.nights === 1 ? 'Night' : 'Nights'}</span>
                </div>

                <div className="date-row">
                  <div className="date-box">
                    <div className="date-label">Arrival</div>
                    <div className="date-value">{format(new Date(r.checkInDate), 'MMM dd, yyyy')}</div>
                  </div>
                  <div className="date-box" style={{ textAlign: 'right' }}>
                    <div className="date-label">Departure</div>
                    <div className="date-value">{format(new Date(r.checkOutDate), 'MMM dd, yyyy')}</div>
                  </div>
                </div>

                <div className="bill-section">
                  <div className="total-amt">LKR {Number(r.totalBill).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <button type="button" onClick={() => setEditing(r)} className="admin-gold-btn">Edit Folio</button>
                    <button 
                      type="button" 
                      onClick={() => handleDelete(r)} 
                      disabled={deleteLoadingId === getReservationId(r)} 
                      className="delete-link"
                    >
                      {deleteLoadingId === getReservationId(r) ? '...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editing && (
        <>
          <div className="modal-overlay" onClick={() => setEditing(null)} />
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 }}>
              <h3 style={{ margin: 0, fontSize: '30px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>Update Guest Folio</h3>
              <button type="button" onClick={() => setEditing(null)} style={{ border: 'none', background: 'none', fontSize: '32px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              {editError && <Alert message={editError} onDismiss={() => setEditError('')} />}
              <div className="form-group">
                <label className="admin-form-label">Full Guest Name</label>
                <input name="guestName" value={form.guestName} onChange={handleFormChange} required className="admin-form-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="admin-form-label">NIC / Passport No.</label>
                  <input name="nicNumber" value={form.nicNumber} onChange={handleFormChange} required className="admin-form-input" />
                </div>
                <div className="form-group">
                  <label className="admin-form-label">Phone Contact</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={handleFormChange} required className="admin-form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="admin-form-label">Suite Allocation</label>
                <select name="roomType" value={form.roomType} onChange={handleFormChange} required className="admin-form-input">
                  <option value="">Select Category</option>
                  {roomTypes.map((t) => <option key={t} value={t}>{t} Suite</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="admin-form-label">Check-in</label>
                  <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleFormChange} required className="admin-form-input" />
                </div>
                <div className="form-group">
                  <label className="admin-form-label">Check-out</label>
                  <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleFormChange} required min={form.checkInDate} className="admin-form-input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 12, fontWeight: '700' }}>Cancel</button>
                <button type="submit" disabled={editLoading} className="admin-gold-btn" style={{ flex: 2 }}>{editLoading ? 'Updating...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}