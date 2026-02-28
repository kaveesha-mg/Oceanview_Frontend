import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

export default function AddReceptionist() {
  const { api } = useAuth()
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const errs = validateForm({
      username: (v) => validations.username(v),
      password: (v) => validations.password(v),
      fullName: (v) => validations.required(v, 'Full name'),
      email: (v) => validations.email(v)
    }, form)
    if (errs) {
      const msg = Object.values(errs)[0]
      setError(msg)
      showValidationAlert(msg)
      return
    }
    try {
      const res = await api('/api/users/receptionist', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      const text = await res.text()
      let data = {}
      try { data = text ? JSON.parse(text) : {} } catch { data = {} }
      if (!res.ok) throw new Error(data.error || Object.values(data)[0] || 'Failed')
      setSuccess(true)
      setForm({ username: '', password: '', fullName: '', email: '' })
    } catch (err) {
      const msg = err.message || 'Failed to add receptionist'
      setError(msg)
      showValidationAlert(msg)
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Add Receptionist</div>
          <div className="admin-page-subtitle">Create a new receptionist account for front desk staff</div>
        </div>
      </div>
      <div className="admin-page-body" style={{ maxWidth: 480 }}>
        <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>Receptionists can create walk-in reservations and check room availability. They cannot access admin settings.</p>
        <form onSubmit={handleSubmit}>
          {error && <Alert message={error} onDismiss={() => setError('')} />}
          {success && <Alert type="success" message="Receptionist added successfully." onDismiss={() => setSuccess(false)} />}
          <div style={{ marginBottom: 18 }}><label className="admin-form-label">Username *</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required minLength={3} className="admin-form-input" /></div>
          <div style={{ marginBottom: 18 }}><label className="admin-form-label">Password *</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} className="admin-form-input" /></div>
          <div style={{ marginBottom: 18 }}><label className="admin-form-label">Full Name *</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required className="admin-form-input" /></div>
          <div style={{ marginBottom: 18 }}><label className="admin-form-label">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="admin-form-input" /></div>
          <button type="submit" className="admin-gold-btn" style={{ marginTop: 8 }}>Create Account</button>
        </form>
      </div>
    </>
  )
}
