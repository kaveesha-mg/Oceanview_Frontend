import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .reg-root {
    font-family: 'Jost', sans-serif;
    display: flex; min-height: 100vh;
  }

  /* ── LEFT PANEL ── */
  .reg-left {
    width: 340px; flex-shrink: 0; position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 56px 40px;
  }
  .reg-left-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=85') center / cover no-repeat;
  }
  .reg-left-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(6,16,30,0.93) 0%, rgba(6,16,30,0.78) 100%);
  }
  .reg-back {
    position: absolute; top: 32px; left: 32px; z-index: 3;
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11.5px; color: rgba(255,255,255,0.38); text-decoration: none;
    letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s;
  }
  .reg-back:hover { color: rgba(255,255,255,0.7); }

  .reg-left-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: flex-start; color: white;
    width: 100%;
  }
  .reg-left-logo-icon {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(240,212,138,0.12); border: 1px solid rgba(240,212,138,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 18px;
  }
  .reg-left-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 500; color: #f0d48a; margin-bottom: 4px;
  }
  .reg-left-logo em { font-style: italic; font-weight: 400; }
  .reg-left-sub { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 40px; }

  .reg-steps { display: flex; flex-direction: column; gap: 0; width: 100%; }
  .reg-step {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 18px 0; position: relative;
  }
  .reg-step:not(:last-child)::after {
    content: ''; position: absolute; left: 15px; top: 46px;
    width: 1px; height: calc(100% - 28px);
    background: rgba(240,212,138,0.18);
  }
  .reg-step-circle {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: rgba(240,212,138,0.12); border: 1px solid rgba(240,212,138,0.35);
    color: #f0d48a; font-size: 13px; font-weight: 500;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
  }
  .reg-step-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.85); margin-bottom: 3px; }
  .reg-step-desc { font-size: 12px; color: rgba(255,255,255,0.42); line-height: 1.55; }

  .reg-left-note {
    margin-top: 36px; padding: 14px 16px;
    background: rgba(240,212,138,0.07); border: 1px solid rgba(240,212,138,0.18);
    border-radius: 8px; font-size: 12px; color: rgba(255,255,255,0.48);
    line-height: 1.6;
  }
  .reg-left-note strong { color: rgba(240,212,138,0.75); font-weight: 500; }

  /* ── RIGHT PANEL ── */
  .reg-right {
    flex: 1; background: #f7f4ef;
    display: flex; align-items: center; justify-content: center;
    padding: 56px 64px; overflow-y: auto;
  }
  .reg-right-inner { width: 100%; max-width: 520px; }

  .reg-form-eyebrow {
    font-size: 10.5px; letter-spacing: 0.26em; text-transform: uppercase;
    color: #b8960c; font-weight: 500; margin-bottom: 10px;
  }
  .reg-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 500; color: #0a1628;
    line-height: 1.15; letter-spacing: -0.01em; margin-bottom: 6px;
  }
  .reg-form-title em { font-style: italic; font-weight: 400; }
  .reg-form-sub { font-size: 13.5px; color: #8a8078; margin-bottom: 32px; line-height: 1.5; }

  /* Error */
  .reg-err {
    background: #fff8f8; border: 1px solid #fcd0cc;
    border-left: 3px solid #e05252; border-radius: 6px;
    padding: 12px 14px; color: #b83232; font-size: 13px;
    margin-bottom: 22px; display: flex; align-items: center; gap: 10px;
  }

  /* Section dividers */
  .reg-section {
    font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase;
    color: #c0b8b0; font-weight: 500; margin: 28px 0 18px;
    padding-bottom: 10px; border-bottom: 1px solid #e8e3dc;
    display: flex; align-items: center; gap: 10px;
  }
  .reg-section:first-of-type { margin-top: 0; }
  .reg-section-dot { width: 4px; height: 4px; border-radius: 50%; background: #f0d48a; }

  /* Grid */
  .reg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .reg-field { margin-bottom: 18px; }
  .reg-label {
    display: block; font-size: 11px; font-weight: 500;
    color: #6b6560; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 7px;
  }
  .reg-input-wrap { position: relative; }
  .reg-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: #c0b8b0; font-size: 14px; pointer-events: none;
  }
  .reg-input {
    width: 100%; padding: 11px 13px 11px 38px;
    border: 1px solid #e0dbd4; border-radius: 8px;
    font-size: 13.5px; font-family: 'Jost', sans-serif;
    color: #1a1a1a; background: white; outline: none; transition: all 0.18s;
  }
  .reg-input:focus { border-color: #d4af50; box-shadow: 0 0 0 3px rgba(212,175,80,0.11); }
  .reg-input::placeholder { color: #c8c0b8; }
  .reg-input-hint { font-size: 11px; color: #c0b8b0; margin-top: 5px; }

  /* Submit */
  .reg-submit {
    width: 100%; padding: 14px;
    background: #0a1628; color: #f0d48a;
    border: 1px solid rgba(240,212,138,0.25);
    border-radius: 8px; font-size: 13px; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.22s;
    font-family: 'Jost', sans-serif; margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .reg-submit:hover { background: #162d47; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(10,22,40,0.2); }
  .reg-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .reg-arrow { transition: transform 0.2s; }
  .reg-submit:hover .reg-arrow { transform: translateX(4px); }

  .reg-login-link {
    text-align: center; font-size: 13.5px; color: #8a8078; margin-top: 22px;
  }
  .reg-login-link a {
    color: #0a1628; font-weight: 500; text-decoration: none;
    border-bottom: 1px solid rgba(10,22,40,0.2); padding-bottom: 1px; transition: all 0.15s;
  }
  .reg-login-link a:hover { color: #b8960c; border-color: #b8960c; }

  .reg-terms {
    font-size: 11.5px; color: #b0a89a; text-align: center; margin-top: 16px; line-height: 1.5;
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

  const field = (name, label, type = 'text', placeholder = '', hint = '', icon = '◈') => (
    <div className="reg-field">
      <label className="reg-label">{label}</label>
      <div className="reg-input-wrap">
        <span className="reg-input-icon">{icon}</span>
        <input
          name={name} type={type}
          value={form[name]} onChange={handleChange}
          placeholder={placeholder} className="reg-input"
        />
      </div>
      {hint && <div className="reg-input-hint">{hint}</div>}
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
          <Link to="/" className="reg-back">← Home</Link>

          <div className="reg-left-content">
            <div className="reg-left-logo-icon">🌊</div>
            <div className="reg-left-logo">Ocean<em>View</em></div>
            <div className="reg-left-sub">Hotel · Colombo, LK</div>

            <div className="reg-steps">
              {[
                { n: '1', title: 'Create your account', desc: 'Fill in your details to register in under 2 minutes.' },
                { n: '2', title: 'Browse our rooms', desc: 'Explore Standard, Deluxe, and Suite categories.' },
                { n: '3', title: 'Confirm your booking', desc: 'Receive instant confirmation and a downloadable bill.' },
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
              <strong>Your data is safe.</strong> We use your NIC and contact details solely for reservation verification — never shared with third parties.
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="reg-right">
          <div className="reg-right-inner">
            <div className="reg-form-eyebrow">New Guest</div>
            <h1 className="reg-form-title">Create your<br /><em>account</em></h1>
            <p className="reg-form-sub">Join Ocean View Hotel and start booking your perfect seaside stay.</p>

            {error && (
              <div className="reg-err">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="reg-section"><div className="reg-section-dot" />Account Credentials</div>
              <div className="reg-grid-2">
                {field('username', 'Username *', 'text', 'e.g. john_doe', 'Minimum 3 characters', '◈')}
                {field('password', 'Password *', 'password', 'Min. 6 characters', 'At least 6 characters', '⊛')}
              </div>

              <div className="reg-section"><div className="reg-section-dot" />Personal Information</div>
              {field('fullName', 'Full Name *', 'text', 'Your full legal name', '', '⊙')}
              {field('email', 'Email Address', 'email', 'you@example.com', '', '⊕')}
              {field('address', 'Home Address', 'text', 'Street, City', '', '◉')}

              <div className="reg-section"><div className="reg-section-dot" />Identity & Contact</div>
              <div className="reg-grid-2">
                {field('nicNumber', 'NIC Number', 'text', '199012345678', '', '⊘')}
                {field('contactNumber', 'Contact Number', 'text', '0771234567', '', '⊗')}
              </div>

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? 'Creating account…' : <>Create Account <span className="reg-arrow">→</span></>}
              </button>
            </form>

            <div className="reg-login-link">
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
            <div className="reg-terms">
              By registering you agree to our terms of service and privacy policy.
            </div>
          </div>
        </div>

      </div>
    </>
  )
}