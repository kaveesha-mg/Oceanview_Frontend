import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap');

  /* FULL PAGE WRAPPER WITH RESORT BACKGROUND */
  .provisioning-container { 
    font-family: 'Inter', sans-serif; 
    color: #1e293b; 
    min-height: 100vh;
    background: linear-gradient(rgba(253, 250, 245, 0.45), rgba(253, 250, 245, 0.45)), 
                url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop');
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

  /* CENTERED BODY CONTENT */
  .admin-page-body {
    flex: 1;
    padding: 60px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  /* PREMIUM FORM CARD */
  .form-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 50px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 580px;
    animation: fadeIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .info-banner {
    background: #0f172a;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 40px;
    border: 1px solid rgba(212, 175, 122, 0.3);
  }

  .info-banner p {
    font-size: 13px;
    color: #cbd5e1;
    line-height: 1.6;
    margin: 0;
  }

  .info-banner strong {
    color: #d4af7a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 8px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .admin-form-label {
    display: block;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748b;
    margin-bottom: 10px;
  }

  .admin-form-input {
    width: 100%;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.3s;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
    background: #fcfcfd;
  }

  .admin-form-input:focus {
    outline: none;
    border-color: #d4af7a;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(212, 175, 122, 0.15);
  }

  .admin-gold-btn {
    width: 100%;
    background: #0f172a;
    color: #d4af7a;
    border: 1px solid rgba(212, 175, 122, 0.3);
    padding: 18px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 15px;
  }

  .admin-gold-btn:hover {
    background: #d4af7a;
    color: #0f172a;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(212, 175, 122, 0.2);
  }

  .admin-gold-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default function AddReceptionist() {
  const { api } = useAuth()
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

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
      setLoading(false)
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
      
      if (!res.ok) throw new Error(data.error || 'Failed to provision account')
      
      setSuccess(true)
      setForm({ username: '', password: '', fullName: '', email: '' })
    } catch (err) {
      setError(err.message)
      showValidationAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="provisioning-container">
      <style>{css}</style>
      
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Receptionist Provisioning</h1>
          <div className="admin-page-subtitle">Security protocol for front desk authorization</div>
        </div>
      </header>

      <main className="admin-page-body">
        <div className="form-card">
          <div className="info-banner">
            <p>
              <strong>Access Level — Concierge & Front Desk</strong>
              New accounts are authorized for walk-in bookings and live availability checks. 
              Financial ledgers and core system configurations remain restricted to Super Admin roles.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <Alert message={error} onDismiss={() => setError('')} />}
            {success && <Alert type="success" message="Receptionist account provisioned successfully." onDismiss={() => setSuccess(false)} />}
            
            <div className="form-group">
              <label className="admin-form-label">System Username</label>
              <input 
                placeholder="e.g. frontdesk_sam"
                value={form.username} 
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
                required 
                className="admin-form-input" 
              />
            </div>

            <div className="form-group">
              <label className="admin-form-label">Temporary Password</label>
              <input 
                type="password" 
                placeholder="Minimum 6 characters"
                value={form.password} 
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                required 
                className="admin-form-input" 
              />
            </div>

            <div className="form-group">
              <label className="admin-form-label">Full Legal Name</label>
              <input 
                placeholder="As per identification"
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
                placeholder="staff@luxuryresort.com"
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                className="admin-form-input" 
              />
            </div>

            <button type="submit" className="admin-gold-btn" disabled={loading}>
              {loading ? 'Authorizing...' : 'Provision Account'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}