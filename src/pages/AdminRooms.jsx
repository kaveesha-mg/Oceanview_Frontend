import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const emptyForm = { roomNumber: '', roomType: '', ratePerNight: '', description: '', imageUrl: '' }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --brand-dark: #0f172a;
    --brand-accent: #6366f1;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --bg-soft: #f8fafc;
    --border-color: #e2e8f0;
    --transition-smooth: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .room-mgmt-container { font-family: 'Inter', sans-serif; color: var(--text-main); background: #fff; min-height: 100vh; }
  
  /* Header Alignment */
  .admin-page-header {
    display: flex; 
    justify-content: space-between;
    align-items: flex-end;
    padding: 60px; 
    border-bottom: 1px solid var(--border-color); 
    margin-bottom: 40px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif; 
    font-size: 42px; 
    color: var(--brand-dark); 
    margin: 0;
    line-height: 1;
  }

  .admin-page-subtitle { 
    font-size: 16px; 
    color: var(--text-muted); 
    margin-top: 12px; 
  }

  .admin-page-body {
    padding: 0 60px 100px 60px;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* Buttons */
  .admin-gold-btn {
    background: var(--brand-dark); 
    color: #fff; 
    border: none; 
    padding: 16px 32px;
    border-radius: 12px; 
    font-size: 14px; 
    font-weight: 700; 
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: var(--transition-smooth); 
    display: flex; 
    align-items: center; 
    gap: 10px;
  }
  
  .admin-gold-btn:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.2); 
    background: #1e293b;
  }

  /* Room Grid & Cards */
  .room-grid {
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
    gap: 32px;
  }

  .room-card {
    background: #fff; 
    border-radius: 24px; 
    border: 1px solid var(--border-color);
    overflow: hidden; 
    transition: var(--transition-smooth);
    position: relative;
  }

  .room-card:hover { 
    transform: translateY(-10px); 
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.1); 
    border-color: #cbd5e1;
  }

  .room-image-container {
    height: 260px;
    background: var(--bg-soft);
    position: relative;
    overflow: hidden;
  }

  .room-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .room-card:hover .room-card-img {
    transform: scale(1.05);
  }

  .room-badge {
    position: absolute; 
    top: 20px; 
    left: 20px; 
    padding: 8px 16px;
    border-radius: 100px; 
    font-size: 11px; 
    font-weight: 800; 
    text-transform: uppercase;
    letter-spacing: 0.08em; 
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  /* Form & Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); 
    zIndex: 100; backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }

  .admin-form-card {
    background: #fff;
    padding: 48px;
    border-radius: 32px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.25);
  }

  .admin-form-label {
    display: block; font-size: 11px; font-weight: 800; color: var(--text-muted);
    margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  }

  .admin-form-input {
    width: 100%; padding: 16px 20px; border: 1px solid var(--border-color); 
    border-radius: 14px; font-size: 15px; transition: var(--transition-smooth);
    font-family: 'Inter', sans-serif; background: var(--bg-soft);
  }

  .admin-form-input:focus { 
    outline: none; border-color: var(--brand-dark); background: #fff;
    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05); 
  }

  .delete-btn {
    padding: 14px 20px; font-size: 14px; font-weight: 600; color: #ef4444;
    background: #fff; border: 1px solid #fee2e2; border-radius: 12px; 
    cursor: pointer; transition: all 0.2s;
  }
  .delete-btn:hover { background: #fef2f2; border-color: #fecaca; }

  @media (max-width: 768px) {
    .admin-page-header { padding: 40px 24px; flex-direction: column; align-items: flex-start; gap: 24px; }
    .admin-page-body { padding: 0 24px 60px 24px; }
    .room-grid { grid-template-columns: 1fr; }
  }
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
        try { return t ? JSON.parse(t) : [] } catch { return [] }
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
      showValidationAlert('Image must be under 5MB'); return
    }
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm(f => ({ ...f, imageUrl: data.imageUrl || '' }))
    } catch (err) {
      showValidationAlert(err.message)
    } finally {
      setUploading(false); e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateForm({
      roomNumber: (v) => validations.required(v, 'Room number'),
      roomType: (v) => validations.required(v, 'Room type'),
      ratePerNight: (v) => validations.positiveNumber(v, 'Rate per night')
    }, form)
    if (errs) { showValidationAlert(Object.values(errs)[0]); return }

    const body = { ...form, ratePerNight: parseFloat(form.ratePerNight) }
    const res = editing
      ? await api(`/api/admin/rooms/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      : await api('/api/admin/rooms', { method: 'POST', body: JSON.stringify(body) })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      showValidationAlert(data.error || 'Operation failed'); return
    }
    closeForm(); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this room permanently?')) return
    try {
      const res = await api(`/api/admin/rooms/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      load()
    } catch (e) { showValidationAlert(e.message) }
  }

  const openAddForm = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEditForm = (room) => {
    setEditing(room); 
    setForm({ ...room, ratePerNight: String(room.ratePerNight) }); 
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); setError('') }

  return (
    <div className="room-mgmt-container">
      <style>{css}</style>
      
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory Control</h1>
          <div className="admin-page-subtitle">Refining the portfolio of {rooms.length} accommodations</div>
        </div>
        <button type="button" onClick={openAddForm} className="admin-gold-btn">
          <span>+ Add New Unit</span>
        </button>
      </div>

      <div className="admin-page-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>Syncing global inventory...</div>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-image-container">
                  {room.imageUrl ? (
                    <img src={room.imageUrl} alt={room.roomNumber} className="room-card-img" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '13px', background: '#f1f5f9' }}>
                      Image Placeholder
                    </div>
                  )}
                  <div className="room-badge" style={{ 
                    background: room.available ? 'rgba(236, 253, 245, 0.9)' : 'rgba(254, 242, 242, 0.9)', 
                    color: room.available ? '#065f46' : '#991b1b',
                    border: `1px solid ${room.available ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    <span style={{width: 6, height: 6, borderRadius: '50%', background: 'currentColor'}}></span>
                    {room.available ? 'Ready' : 'Occupied'}
                  </div>
                </div>

                <div style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand-dark)' }}>Unit {room.roomNumber}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>{room.roomType}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand-dark)' }}>LKR {Number(room.ratePerNight).toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>Net / Night</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => openEditForm(room)} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>EDIT DETAILS</button>
                    <button type="button" onClick={() => handleDelete(room.id)} className="delete-btn">REMOVE</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="admin-form-card" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ margin: 0, fontSize: '36px', fontFamily: 'Cormorant Garamond, serif', color: 'var(--brand-dark)' }}>
                {editing ? 'Refine Entry' : 'New Inventory'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>Global synchronization occurs upon confirmation.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label className="admin-form-label">Identifier *</label>
                  <input value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} className="admin-form-input" placeholder="e.g. 402" />
                </div>
                <div>
                  <label className="admin-form-label">Classification *</label>
                  <input value={form.roomType} onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))} className="admin-form-input" placeholder="e.g. Deluxe" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="admin-form-label">Nightly Rate (LKR) *</label>
                <input type="number" value={form.ratePerNight} onChange={e => setForm(f => ({ ...f, ratePerNight: e.target.value }))} className="admin-form-input" placeholder="0.00" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="admin-form-label">Specifications</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-form-input" rows={3} placeholder="Describe amenities..." />
              </div>

              <div style={{ marginBottom: '40px', padding: '32px', background: 'var(--bg-soft)', borderRadius: '20px', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
                <label className="admin-form-label" style={{marginBottom: '16px'}}>Unit Media</label>
                <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} style={{ fontSize: '13px' }} />
                {form.imageUrl && <img src={form.imageUrl} style={{ marginTop: '20px', width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }} alt="Preview" />}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={closeForm} style={{ flex: 1, padding: '18px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>DISCARD</button>
                <button type="submit" className="admin-gold-btn" style={{ flex: 2, justifyContent: 'center' }}>
                  {editing ? 'SAVE CHANGES' : 'PUBLISH UNIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}