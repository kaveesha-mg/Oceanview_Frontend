import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .reg-root {
    font-family: 'Inter', sans-serif;
    display: flex; min-height: 100vh;
    background: #fff;
  }

  /* ── LEFT PANEL ── */
  .reg-left {
    width: 420px; flex-shrink: 0; position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    padding: 80px 50px;
  }
  
  .reg-left-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=85') center / cover no-repeat;
    transform: scale(1.1);
  }
  
  .reg-left-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(10,22,40,0.92), rgba(10,22,40,0.85));
  }
  
  .reg-back {
    position: absolute; top: 40px; left: 50px; z-index: 3;
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; color: rgba(255,255,255,0.5); text-decoration: none;
    letter-spacing: 0.25em; text-transform: uppercase; transition: 0.3s;
  }
  .reg-back:hover { color: #f0d48a; transform: translateX(-5px); }

  .reg-left-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    height: 100%;
  }
  
  .reg-left-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; color: #f0d48a; margin-bottom: 8px;
    letter-spacing: 0.05em;
  }
  .reg-left-logo em { font-style: italic; color: #fff; }
  
  .reg-left-sub { 
    font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; 
    color: rgba(255,255,255,0.4); margin-bottom: 60px; 
  }

  .reg-steps { display: flex; flex-direction: column; gap: 30px; }
  
  .reg-step {
    display: flex; align-items: flex-start; gap: 20px;
    padding: 20px; background: rgba(255,255,255,0.03);
    backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
  }
  
  .reg-step-circle {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: #f0d48a; color: #0a1628;
    font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  
  .reg-step-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
  .reg-step-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.6; }

  .reg-left-note {
    margin-top: auto; padding-top: 40px;
    font-size: 12px; color: rgba(255,255,255,0.4);
    line-height: 1.8; font-style: italic;
  }

  /* ── RIGHT PANEL ── */
  .reg-right {
    flex: 1; background: #fff;
    display: flex; align-items: center; justify-content: center;
    padding: 80px; overflow-y: auto;
  }
  
  .reg-right-inner { width: 100%; max-width: 580px; }

  .reg-form-eyebrow {
    font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
    color: #c5a367; font-weight: 700; margin-bottom: 15px;
  }
  
  .reg-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px; font-weight: 500; color: #0a1628;
    line-height: 1; margin-bottom: 15px;
  }
  
  .reg-form-sub { font-size: 15px; color: #777; margin-bottom: 45px; font-weight: 300; }

  .reg-err {
    background: #fff5f5; border-radius: 4px; padding: 16px;
    color: #c53030; font-size: 13px; margin-bottom: 30px;
    border-left: 4px solid #c53030; display: flex; align-items: center; gap: 12px;
  }

  .reg-section {
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: #0a1628; font-weight: 700; margin: 40px 0 20px;
    display: flex; align-items: center; gap: 15px;
  }
  
  .reg-section::after { content: ''; flex: 1; height: 1px; background: #eee; }

  .reg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .reg-field { margin-bottom: 24px; }
  
  .reg-label {
    display: block; font-size: 11px; font-weight: 600;
    color: #444; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
  }
  
  .reg-input {
    width: 100%; padding: 14px 16px 14px 42px;
    border: 1px solid #e2e8f0; border-radius: 4px;
    font-size: 14px; color: #1a1a1a; transition: all 0.3s;
    background: #fbfbfb;
  }
  
  .reg-input:focus {
    border-color: #0a1628; background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05); outline: none;
  }
  
  .reg-input-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: #cbd5e0; font-size: 14px;
  }

  .reg-submit {
    width: 100%; padding: 18px;
    background: #0a1628; color: #f0d48a;
    border: none; border-radius: 4px;
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s;
    margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  
  .reg-submit:hover:not(:disabled) { background: #1a2a3a; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(10,22,40,0.1); }
  .reg-submit:disabled { opacity: 0.6; }

  .reg-login-link { text-align: center; font-size: 14px; color: #718096; margin-top: 30px; }
  .reg-login-link a { color: #0a1628; font-weight: 600; text-decoration: none; border-bottom: 1px solid #f0d48a; }

  .reg-terms { font-size: 11px; color: #a0aec0; text-align: center; margin-top: 25px; line-height: 1.6; }

  @media (max-width: 1100px) {
    .reg-left { display: none; }
    .reg-right { padding: 40px 24px; }
  }
`

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', address: '', nicNumber: '', contactNumber: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validateForm({
      username: (v) => validations.username(v),
      password: (v) => validations.password(v),
      fullName: (v) => validations.required(v, 'Full name'),
      email: (v) => validations.email(v),
      nicNumber: (v) => validations.nic(v),
      contactNumber: (v) => validations.phone(v)
    }, form)
    if (errs) {
      const msg = Object.values(errs)[0]
      setError(msg)
      showValidationAlert(msg)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data === 'object' && data.error ? data.error : Object.values(data)[0] || 'Registration failed')
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const msg = err.message || 'Registration failed'
      setError(msg)
      showValidationAlert(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', placeholder = '', hint = '', icon = '✦') => (
    <div className="reg-field">
      <label className="reg-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span className="reg-input-icon">{icon}</span>
        <input
          name={name} type={type}
          value={form[name]} onChange={handleChange}
          placeholder={placeholder} className="reg-input"
        />
      </div>
      {hint && <div style={{fontSize: '10px', color: '#a0aec0', marginTop: '6px', letterSpacing: '0.02em'}}>{hint}</div>}
    </div>
  )

  return (
    <>
      <style>{css}</style>
      <div className="reg-root">

        {/* ── LEFT ── */}
        <div className="reg-left">
          <div className="reg-left-bg" />
          <div className="reg-left-overlay" />
          <Link to="/" className="reg-back"><span>←</span> Sanctuary Home</Link>

          <div className="reg-left-content">
            <div className="reg-left-logo">Ocean<em>View</em></div>
            <div className="reg-left-sub">Resort & Spa · Colombo</div>

            <div className="reg-steps">
              {[
                { n: '01', title: 'Guest Profile', desc: 'Secure your unique identity within our luxury network.' },
                { n: '02', title: 'Explore Suites', desc: 'Gain access to our full collection of oceanfront rooms.' },
                { n: '03', title: 'Seamless Booking', desc: 'Experience the art of effortless vacation planning.' },
              ].map(s => (
                <div key={s.n} className="reg-step">
                  <div className="reg-step-circle">{s.n}</div>
                  <div>
                    <div className="reg-step-title">{s.title}</div>
                    <div className="reg-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="reg-left-note">
              "Registration is the first step toward a bespoke coastal experience tailored specifically to your preferences."
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="reg-right">
          <div className="reg-right-inner">
            <div className="reg-form-eyebrow">Membership</div>
            <h1 className="reg-form-title">Join the <em>Collection</em></h1>
            <p className="reg-form-sub">Become a member of the Ocean View community for exclusive access to the best rates and personalized service.</p>

            {error && (
              <div className="reg-err">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="reg-section">Access Credentials</div>
              <div className="reg-grid-2">
                {field('username', 'Username', 'text', 'Preferred name', 'Minimum 3 characters', '👤')}
                {field('password', 'Password', 'password', '••••••••', 'At least 6 characters', '🔑')}
              </div>

              <div className="reg-section">Guest Details</div>
              {field('fullName', 'Full Name', 'text', 'As it appears on NIC', '', '✧')}
              <div className="reg-grid-2">
                {field('email', 'Email', 'email', 'name@domain.com', '', '✉')}
                {field('contactNumber', 'Phone', 'text', '077 123 4567', '', '☎')}
              </div>
              {field('address', 'Home Address', 'text', 'Suite, Street, City', '', '🏠')}

              <div className="reg-section">Verification</div>
              {field('nicNumber', 'NIC / Passport Number', 'text', 'Verification ID', 'Required for check-in', '🆔')}

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? 'Processing…' : <>Complete Registration <span>→</span></>}
              </button>
            </form>

            <div className="reg-login-link">
              Already an esteemed guest? <Link to="/login">Sign in here</Link>
            </div>
            <div className="reg-terms">
              By clicking complete, you acknowledge our commitment to your privacy and agree to our luxury service standards.
            </div>
          </div>
        </div>

      </div>
    </>
  )
}