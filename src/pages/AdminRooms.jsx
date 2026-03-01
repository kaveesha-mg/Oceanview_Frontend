import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const emptyForm = { roomNumber: '', roomType: '', ratePerNight: '', description: '', imageUrl: '' }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@300;400;500;600&display=swap');

  .room-mgmt-container { font-family: 'Inter', sans-serif; color: #1e293b; }
  
  .admin-page-header {
    display: flex; 
    justify-content: flex-start; /* CHANGED FROM space-between TO ALIGN LEFT */
    align-items: flex-end;
    gap: 40px; /* SPACE BETWEEN TITLE AND BUTTON */
    padding: 48px 0; 
    padding-left: 60px; 
    border-bottom: 1px solid #e5e7eb; 
    margin-bottom: 40px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif; 
    font-size: 38px; 
    color: #111827; 
    margin: 0;
    line-height: 1.1;
  }

  .admin-page-subtitle { 
    font-size: 16px; 
    color: #6b7280; 
    margin-top: 6px; 
  }

  .admin-page-body {
    padding-left: 60px; 
    padding-right: 40px;
    padding-bottom: 100px;
  }

  .admin-gold-btn {
    background: #111827; 
    color: #fff; 
    border: none; 
    padding: 14px 28px;
    border-radius: 8px; 
    font-size: 15px; 
    font-weight: 600; 
    cursor: pointer;
    transition: all 0.2s; 
    display: flex; 
    align-items: center; 
    gap: 8px;
    margin-bottom: 4px; /* ALIGN BETTER WITH BOTTOM OF TEXT */
  }
  
  .admin-gold-btn:hover { 
    background: #1f2937; 
    transform: translateY(-1px); 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
  }

  .room-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
    gap: 32px;
  }

  .room-card {
    background: #fff; 
    border-radius: 16px; 
    border: 1px solid #e5e7eb;
    overflow: hidden; 
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }
  .room-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

  .room-badge {
    position: absolute; top: 16px; left: 16px; padding: 6px 12px;
    border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; backdrop-filter: blur(8px);
  }

  .admin-form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .admin-form-input {
    width: 100%; 
    padding: 14px 18px; 
    border: 1px solid #d1d5db; 
    border-radius: 10px;
    font-size: 15px; 
    transition: all 0.2s;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }
  .admin-form-input:focus { outline: none; border-color: #111827; box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08); }

  .delete-btn {
    padding: 12px 18px; 
    font-size: 14px; 
    font-weight: 600; 
    color: #991b1b;
    background: #fef2f2; 
    border: 1px solid #fee2e2; 
    border-radius: 10px; 
    cursor: pointer;
    transition: all 0.2s;
  }
  .delete-btn:hover { background: #fee2e2; color: #7f1d1d; }
`

export default function AdminRooms() {
  const { api, token } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = () =>
    api('/api/rooms')
      .then(async r => {
        const t = await r.text()
        try { return t ? JSON.parse(t) : [] }
        catch { return [] }
      })
      .then(setRooms)
      .catch(() => setRooms([]))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [api])

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Image must be under 5MB'; setError(msg); showValidationAlert(msg); return
    }
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const t = token ?? localStorage.getItem('token')
      const res = await fetch('/api/admin/upload/room-image', {
        method: 'POST',
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        body: formData
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm(f => ({ ...f, imageUrl: data.imageUrl || '' }))
    } catch (err) {
      const msg = err.message || 'Failed to upload image'; setError(msg); showValidationAlert(msg)
    } finally {
      setUploading(false); e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const errs = validateForm({
      roomNumber: (v) => validations.required(v, 'Room number'),
      roomType: (v) => validations.required(v, 'Room type'),
      ratePerNight: (v) => validations.positiveNumber(v, 'Rate per night')
    }, form)
    if (errs) { const msg = Object.values(errs)[0]; setError(msg); showValidationAlert(msg); return }

    const body = { ...form, ratePerNight: parseFloat(form.ratePerNight) }
    const res = editing
      ? await api(`/api/admin/rooms/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      : await api('/api/admin/rooms', { method: 'POST', body: JSON.stringify(body) })

    const text = await res.text()
    let data = {}
    try { data = text ? JSON.parse(text) : {} } catch { data = {} }

    if (!res.ok) {
      const msg = typeof data === 'object' ? (data.error || Object.values(data)[0] || 'Failed') : 'Failed'
      setError(msg); showValidationAlert(msg); return
    }
    setForm(emptyForm); setEditing(null); setShowForm(false); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this room? This cannot be undone.')) return
    try {
      const res = await api(`/api/admin/rooms/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to delete room')
      }
      load()
    } catch (e) { showValidationAlert(e?.message || 'Failed to delete room') }
  }

  const openAddForm = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true) }
  const openEditForm = (room) => {
    setEditing(room); setForm({
      roomNumber: room.roomNumber, roomType: room.roomType,
      ratePerNight: String(room.ratePerNight), description: room.description || '', imageUrl: room.imageUrl || ''
    }); setError(''); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); setError('') }

  return (
    <div className="room-mgmt-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory Control</h1>
          <div className="admin-page-subtitle">Managing {rooms.length} active hotel accommodations</div>
        </div>
        <button type="button" onClick={openAddForm} className="admin-gold-btn">
          <span>+ Add New Unit</span>
        </button>
      </div>

      <div className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>Initializing inventory...</div>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', border: '2px dashed #e5e7eb', borderRadius: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '18px' }}>The portfolio is currently empty.</p>
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <div style={{ height: 240, background: '#f3f4f6', position: 'relative' }}>
                  {room.imageUrl ? (
                    <img src={room.imageUrl} alt={room.roomNumber} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '14px', background: 'linear-gradient(45deg, #f8fafc, #f1f5f9)' }}>
                      No Image Provided
                    </div>
                  )}
                  <div className="room-badge" style={{ 
                    background: room.available ? 'rgba(236, 253, 245, 0.95)' : 'rgba(254, 242, 242, 0.95)', 
                    color: room.available ? '#065f46' : '#991b1b',
                    border: `1px solid ${room.available ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {room.available ? '● Ready' : '● Booked'}
                  </div>
                </div>
                <div style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>Room {room.roomNumber}</div>
                      <div style={{ fontSize: '15px', color: '#6b7280', fontWeight: '500', marginTop: '4px' }}>{room.roomType}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>LKR {Number(room.ratePerNight).toLocaleString()}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>per night</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => openEditForm(room)} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Edit Unit</button>
                    <button type="button" onClick={() => handleDelete(room.id)} className="delete-btn">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.6)', zIndex: 40, backdropFilter: 'blur(12px)' }} onClick={closeForm} />
          <div className="room-card" style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            zIndex: 50, width: '95vw', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '48px' 
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '32px', fontFamily: 'Cormorant Garamond, serif' }}>{editing ? 'Modify Accommodation' : 'New Inventory Entry'}</h3>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '8px 0 0' }}>Ensure all technical details are accurate before publishing.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label className="admin-form-label">Room Number *</label>
                  <input name="roomNumber" value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} className="admin-form-input" placeholder="101" />
                </div>
                <div>
                  <label className="admin-form-label">Room Type *</label>
                  <input name="roomType" value={form.roomType} onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))} className="admin-form-input" placeholder="Luxury Suite" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="admin-form-label">Nightly Rate (LKR) *</label>
                <input name="ratePerNight" type="number" value={form.ratePerNight} onChange={e => setForm(f => ({ ...f, ratePerNight: e.target.value }))} className="admin-form-input" placeholder="0.00" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="admin-form-label">Amenities & Description</label>
                <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-form-input" rows={3} placeholder="Sea view, king bed, mini-bar..." />
              </div>

              <div style={{ marginBottom: '36px', padding: '24px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                <label className="admin-form-label">Property Image</label>
                <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} style={{ fontSize: '14px', color: '#6b7280' }} />
                {form.imageUrl && <div style={{ marginTop: '16px' }}><img src={form.imageUrl} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e5e7eb' }} alt="Preview" /></div>}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={closeForm} style={{ flex: 1, padding: '16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="admin-gold-btn" style={{ flex: 2, justifyContent: 'center' }}>
                  {editing ? 'Update Inventory' : 'Confirm & Add'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}