import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const emptyForm = { roomNumber: '', roomType: '', ratePerNight: '', description: '', imageUrl: '' }

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
      const msg = 'Image must be under 5MB'
      setError(msg)
      showValidationAlert(msg)
      return
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
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      setForm(f => ({ ...f, imageUrl: data.imageUrl || '' }))
    } catch (err) {
      const msg = err.message || 'Failed to upload image'
      setError(msg)
      showValidationAlert(msg)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errs = validateForm({
      roomNumber: (v) => validations.required(v, 'Room number'),
      roomType: (v) => validations.required(v, 'Room type'),
      ratePerNight: (v) => validations.positiveNumber(v, 'Rate per night')
    }, form)

    if (errs) {
      const msg = Object.values(errs)[0]
      setError(msg)
      showValidationAlert(msg)
      return
    }

    const body = { ...form, ratePerNight: parseFloat(form.ratePerNight) }

    const res = editing
      ? await api(`/api/admin/rooms/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      : await api('/api/admin/rooms', { method: 'POST', body: JSON.stringify(body) })

    const text = await res.text()
    let data = {}

    try { data = text ? JSON.parse(text) : {} }
    catch { data = {} }

    if (!res.ok) {
      const msg = typeof data === 'object'
        ? (data.error || Object.values(data)[0] || 'Failed')
        : 'Failed'
      setError(msg)
      showValidationAlert(msg)
      return
    }

    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this room? This cannot be undone.')) return
    try {
      const res = await api(`/api/admin/rooms/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete room')
      }
      load()
    } catch (e) {
      showValidationAlert(e?.message || 'Failed to delete room')
    }
  }

  const openAddForm = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (room) => {
    setEditing(room)
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      ratePerNight: String(room.ratePerNight),
      description: room.description || '',
      imageUrl: room.imageUrl || ''
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Room Management</div>
          <div className="admin-page-subtitle">Add, edit and remove hotel rooms from inventory</div>
        </div>
        <button type="button" onClick={openAddForm} className="admin-gold-btn">
          + Add New Room
        </button>
      </div>

      <div className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        {loading ? (
          <p style={{ color: '#9a8f83' }}>Loading...</p>
        ) : rooms.length === 0 ? (
          <p style={{ color: '#9a8f83' }}>No rooms yet. Click “Add New Room” to add one.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {rooms.map((room) => (
              <div key={room.id} className="admin-card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 160, background: '#e8e4df', position: 'relative' }}>
                  {room.imageUrl ? (
                    <img
                      src={room.imageUrl.startsWith('http') || room.imageUrl.startsWith('/') ? room.imageUrl : room.imageUrl}
                      alt={room.roomNumber}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9a8f83', fontSize: 14 }}>No image</div>
                  )}
                  <span style={{ position: 'absolute', top: 8, right: 8, background: room.available ? '#0d2137' : '#9a8f83', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                    {room.available ? 'Available' : 'Occupied'}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div className="admin-card-title">{room.roomNumber}</div>
                  <div style={{ fontSize: 13, color: '#9a8f83', marginTop: 4 }}>{room.roomType}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0d2137', marginTop: 8 }}>LKR {Number(room.ratePerNight).toLocaleString()}/night</div>
                  {room.description && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8, lineHeight: 1.4 }}>{room.description}</p>}
                  <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => openEditForm(room)} className="admin-gold-btn" style={{ padding: '8px 14px', fontSize: 13 }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(room.id)} style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #c53030', borderRadius: 6, background: '#fff', color: '#c53030', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <>
          <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} onClick={closeForm} />
          <div
            className="admin-card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
              width: '90vw',
              maxWidth: 480,
              maxHeight: '90vh',
              overflow: 'auto',
              background: '#fff',
              boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e8e4df'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e8e4df' }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#0d2137' }}>{editing ? 'Edit Room' : 'Add New Room'}</h3>
              <button type="button" onClick={closeForm} aria-label="Close" style={{ padding: 8, border: 'none', background: '#f5f2ee', borderRadius: 6, cursor: 'pointer', fontSize: 18, color: '#6b7280', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
              {error && <Alert message={error} onDismiss={() => setError('')} />}
              <div style={{ marginBottom: 18 }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: 6 }}>Room number *</label>
                <input name="roomNumber" value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} required className="admin-form-input" placeholder="e.g. 101" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: 6 }}>Room type *</label>
                <input name="roomType" value={form.roomType} onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))} required className="admin-form-input" placeholder="e.g. Deluxe, Suite" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: 6 }}>Rate per night (LKR) *</label>
                <input name="ratePerNight" type="number" min="1" step="1" value={form.ratePerNight} onChange={e => setForm(f => ({ ...f, ratePerNight: e.target.value }))} required className="admin-form-input" placeholder="e.g. 15000" style={{ width: '100%', boxSizing: 'border-box' }} />
                <span style={{ display: 'block', fontSize: 12, color: '#9a8f83', marginTop: 4 }}>Enter amount in Sri Lankan Rupees</span>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: 6 }}>Description <span style={{ fontWeight: 400, color: '#9a8f83' }}>(optional)</span></label>
                <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-form-input" rows={3} placeholder="Brief description of the room and amenities" style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: 6 }}>Room image <span style={{ fontWeight: 400, color: '#9a8f83' }}>(optional)</span></label>
                <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} style={{ display: 'block', marginTop: 4, fontSize: 13 }} />
                {uploading && <span style={{ fontSize: 12, color: '#9a8f83' }}>Uploading...</span>}
                {form.imageUrl && (
                  <div style={{ marginTop: 8 }}>
                    <img src={form.imageUrl.startsWith('http') || form.imageUrl.startsWith('/') ? form.imageUrl : form.imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid #e8e4df' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #e8e4df' }}>
                <button type="button" onClick={closeForm} style={{ padding: '10px 20px', border: '1px solid #e0dbd4', borderRadius: 6, background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151' }}>Cancel</button>
                <button type="submit" className="admin-gold-btn" style={{ padding: '10px 20px' }}>{editing ? 'Save changes' : 'Add room'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}