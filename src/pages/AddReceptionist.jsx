import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&display=swap');

  .provisioning-container { font-family: 'Inter', sans-serif; color: #1e293b; }

  .admin-page-header {
    padding: 48px 0;
    padding-left: 60px; 
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 48px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 16px;
    color: #64748b;
    margin-top: 6px;
  }

  .admin-page-body {
    padding-left: 60px; /* SPACE FOR SIDEBAR */
    padding-right: 60px;
    padding-bottom: 100px;
    display: flex;        /* ADDED FOR CENTERING */
    justify-content: center; /* ALIGN HORIZONTALLY */
    align-items: flex-start; /* KEEP AT TOP OF PAGE */
  }

  .form-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    width: 100%;           /* ENSURE RESPONSIVENESS */
    max-width: 580px;      /* CONTROLLED WIDTH */
  }

  .info-banner {
    background: #f8fafc;
    border-left: 4px solid #0f172a;
    padding: 20px;
    border-radius: 4px 12px 12px 4px;
    margin-bottom: 32px;
  }

  .info-banner p {
    font-size: 14px;
    color: #475569;
    line-height: 1.7;
    margin: 0;
  }

  .form-group {
    margin-bottom: 28px;
  }

  .admin-form-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #475569;
    margin-bottom: 10px;
  }

  .admin-form-input {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 15px;
    transition: all 0.2s;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  .admin-form-input:focus {
    outline: none;
    border-color: #0f172a;
    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08);
  }

  .admin-gold-btn {
    width: 100%;
    background: #0f172a;
    color: #ffffff;
    border: none;
    padding: 16px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 12px;
  }

  .admin-gold-btn:hover {
    background: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  }

  .admin-gold-btn:active {
    transform: scale(0.99);
  }
`

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
    <div className="provisioning-container">
      <style>{css}</style>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Add Receptionist</h1>
          <div className="admin-page-subtitle">Create a new receptionist account for front desk staff</div>
        </div>
      </div>

      <div className="admin-page-body">
        <div className="form-card">
          <div className="info-banner">
            <p>
              <strong>Security Protocol: Access Level — Receptionist</strong><br />
              New accounts are authorized for walk-in bookings and live availability checks. 
              Financial ledgers and core system configurations remain restricted to Super Admin roles.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <Alert message={error} onDismiss={() => setError('')} />}
            {success && <Alert type="success" message="Receptionist account provisioned successfully." onDismiss={() => setSuccess(false)} />}
            
            <div className="form-group">
              <label className="admin-form-label">System Username *</label>
              <input 
                placeholder="e.g. jdoe_frontdesk"
                value={form.username} 
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
                required 
                minLength={3} 
                className="admin-form-input" 
              />
            </div>

            <div className="form-group">
              <label className="admin-form-label">Temporary Password *</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                required 
                minLength={6} 
                className="admin-form-input" 
              />
            </div>

            <div className="form-group">
              <label className="admin-form-label">Full Legal Name *</label>
              <input 
                placeholder="Jane Doe"
                value={form.fullName} 
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
                required 
                className="admin-form-input" 
              />
            </div>

            <div className="form-group">
              <label className="admin-form-label">Official Email</label>
              <input 
                type="email" 
                placeholder="jane@hotel.com"
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                className="admin-form-input" 
              />
            </div>

            <button type="submit" className="admin-gold-btn">Provision Account</button>
          </form>
        </div>
      </div>
    </div>
  )
}