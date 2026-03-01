import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/Alert'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    font-family: 'Inter', sans-serif;
    display: flex; min-height: 100vh;
    background: #fdfaf5;
  }

  /* ── LEFT PANEL ── */
  .login-left {
    flex: 1.2; position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px; min-height: 100vh;
  }
  
  .login-left-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=85') center / cover no-repeat;
    transform: scale(1.05);
  }
  
  .login-left-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(165deg, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.7) 50%, rgba(10,22,40,0.95) 100%);
  }

  .login-left-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: center; text-align: center; color: white;
    max-width: 460px;
  }

  .login-back {
    position: absolute; top: 40px; left: 40px; z-index: 3;
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 12px; color: rgba(255,255,255,0.6); text-decoration: none;
    letter-spacing: 0.2em; text-transform: uppercase;
    transition: all 0.3s ease;
  }
  .login-back:hover { color: #f0d48a; transform: translateX(-5px); }

  .login-logo-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(240,212,138,0.1);
    border: 1px solid rgba(240,212,138,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin: 0 auto 28px;
    box-shadow: 0 0 35px rgba(0,0,0,0.3);
  }

  .login-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px; font-weight: 400; color: #f0d48a;
    letter-spacing: 0.05em;
  }
  .login-logo em { font-style: italic; color: #fff; }
  
  .login-tagline {
    font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase;
    color: rgba(255,255,255,0.4); margin-top: 10px;
  }

  .login-divider {
    width: 60px; height: 1px;
    background: #f0d48a;
    margin: 45px auto;
    opacity: 0.5;
  }

  .login-quote {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; font-style: italic; color: rgba(255,255,255,0.85);
    line-height: 1.5; margin-bottom: 15px;
  }
  .login-quote-attr {
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  .login-features {
    display: flex; flex-direction: column; gap: 14px;
    margin-top: 55px; width: 100%;
  }

  .login-feat {
    display: flex; align-items: center; gap: 18px;
    padding: 16px 24px;
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    transition: background 0.3s;
  }
  .login-feat:hover { background: rgba(255,255,255,0.06); }
  .login-feat-icon { color: #f0d48a; font-size: 18px; }
  .login-feat-text { font-size: 14px; color: rgba(255,255,255,0.65); letter-spacing: 0.03em; }

  /* ── RIGHT PANEL ── */
  .login-right {
    width: 560px; flex-shrink: 0;
    background: #fff;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px; position: relative;
    box-shadow: -10px 0 50px rgba(0,0,0,0.04);
  }

  .login-form-eyebrow {
    font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase;
    color: #c5a367; font-weight: 600; margin-bottom: 15px;
  }

  .login-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px; font-weight: 500; color: #0a1628;
    line-height: 1.1; margin-bottom: 15px;
  }
  .login-form-title em { font-style: italic; color: #c5a367; }

  .login-form-sub { font-size: 16px; color: #666; margin-bottom: 45px; line-height: 1.6; font-weight: 300; }

  .login-err {
    background: #fff5f5; border-radius: 4px; padding: 16px;
    color: #c53030; font-size: 14px; margin-bottom: 28px;
    border-left: 4px solid #c53030; display: flex; align-items: center; gap: 12px;
  }

  .login-field { margin-bottom: 28px; width: 100%; }
  .login-label {
    display: block; font-size: 12px; font-weight: 600;
    color: #0a1628; text-transform: uppercase; letter-spacing: 0.15em;
    margin-bottom: 10px;
  }

  .login-input {
    width: 100%; padding: 16px 16px 16px 48px;
    border: 1px solid #e2e8f0; border-radius: 5px;
    font-size: 15px; color: #1a1a1a; transition: all 0.3s;
    background: #fafafa;
  }
  .login-input:focus {
    border-color: #0a1628; background: #fff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
    outline: none;
  }

  .login-input-icon {
    position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
    color: #cbd5e0; font-size: 16px;
  }

  .login-submit {
    width: 100%; padding: 18px;
    background: #0a1628; color: #f0d48a;
    border: none; border-radius: 5px;
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .login-submit:hover:not(:disabled) { background: #1a2a3a; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(10,22,40,0.15); }
  .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-or {
    display: flex; align-items: center; gap: 20px;
    margin: 35px 0; color: #cbd5e0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;
  }
  .login-or::before, .login-or::after { content: ''; flex: 1; height: 1px; background: #f0f0f0; }

  .login-register-link { font-size: 15px; color: #718096; }
  .login-register-link a {
    color: #0a1628; font-weight: 600; text-decoration: none;
    border-bottom: 1.5px solid #f0d48a; transition: all 0.2s;
  }
  .login-register-link a:hover { color: #c5a367; border-color: #0a1628; }

  .login-right-brand {
    position: absolute; bottom: 30px; font-size: 11px; 
    color: #cbd5e0; letter-spacing: 0.3em;
  }

  @media (max-width: 1000px) {
    .login-left { display: none; }
    .login-right { width: 100%; padding: 60px 24px; }
  }
`

export default function Login() {
  const location = useLocation()
  const fromRegistration = location.state?.registered === true
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const fromLogout = location.state?.logoutSuccess === true

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      login(data)
      setSuccessMessage('Logged in successfully! Redirecting…')
      const role = data.role || ''
      const target = ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'].includes(role) ? '/admin' : '/reservations'
      setTimeout(() => navigate(target), 1200)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-root">

        {/* ── LEFT ── */}
        <div className="login-left">
          <div className="login-left-bg" />
          <div className="login-left-overlay" />

          <Link to="/" className="login-back">
            <span>←</span> Return to Sanctuary
          </Link>

          <div className="login-left-content">
            <div className="login-logo-wrap">
              <div className="login-logo-icon">🌊</div>
              <div className="login-logo">Ocean<em>View</em></div>
              <div className="login-tagline">Resort & Spa · Colombo</div>
            </div>

            <div className="login-divider" />

            <p className="login-quote">
              "The soul is healed by being with the water."
            </p>
            <div className="login-quote-attr">— Guest Journal, 2024</div>

            <div className="login-features">
              {[
                { icon: '✦', text: 'Encrypted Guest Access' },
                { icon: '✦', text: 'Manage Private Reservations' },
                { icon: '✦', text: 'Exclusive Member Rates' },
              ].map(f => (
                <div key={f.text} className="login-feat">
                  <span className="login-feat-icon">{f.icon}</span>
                  <span className="login-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div className="login-form-eyebrow">{fromRegistration ? 'Account Verified' : 'Guest Portal'}</div>
            <h1 className="login-form-title">Sign in to<br /><em>your stay</em></h1>
            <p className="login-form-sub">
              {fromRegistration ? 'Registration successful. Please sign in to access your dashboard.' : 'Enter your credentials to manage your coastal experience.'}
            </p>

            {fromLogout && (
              <div style={{marginBottom: 24}}>
                <Alert type="success" message="You have been safely logged out." onDismiss={() => navigate('/login', { replace: true })} />
              </div>
            )}
            
            {fromRegistration && (
              <div className="login-success" style={{ marginBottom: 24, padding: '16px', background: '#f0faf4', border: '1px solid #86efac', borderRadius: 5, color: '#166534', fontSize: 14 }}>
                ✓ Account created. Welcome to Ocean View.
              </div>
            )}

            {successMessage && (
              <div style={{marginBottom: 24}}>
                <Alert type="success" message={successMessage} />
              </div>
            )}

            {error && (
              <div className="login-err">
                <span>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <span className="login-input-icon">👤</span>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <span className="login-input-icon">🔑</span>
                  <input
                    className="login-input"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Authenticating…' : <>Begin Session <span>→</span></>}
              </button>
            </form>

            <div className="login-or">or</div>

            <div className="login-register-link" style={{textAlign: 'center'}}>
              New to the Resort?{' '}
              <Link to="/register">Create an account</Link>
            </div>
          </div>

          <div className="login-right-brand">OCEAN VIEW · AUTHENTIC LUXURY</div>
        </div>

      </div>
    </>
  )
}