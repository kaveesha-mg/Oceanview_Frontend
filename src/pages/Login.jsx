import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/Alert'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    font-family: 'Jost', sans-serif;
    display: flex; min-height: 100vh;
    background: #f7f4ef;
  }

  /* ── LEFT PANEL ── */
  .login-left {
    flex: 1; position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 56px 48px; min-height: 100vh;
  }
  .login-left-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=85') center / cover no-repeat;
  }
  .login-left-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(6,16,30,0.88) 0%, rgba(6,16,30,0.72) 60%, rgba(6,16,30,0.92) 100%);
  }
  .login-left-content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: center; text-align: center; color: white;
    max-width: 380px;
  }
  .login-back {
    position: absolute; top: 36px; left: 48px; z-index: 3;
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 12px; color: rgba(255,255,255,0.42); text-decoration: none;
    letter-spacing: 0.1em; text-transform: uppercase;
    transition: color 0.2s;
  }
  .login-back:hover { color: rgba(255,255,255,0.75); }
  .login-back-arrow { font-size: 14px; }

  .login-logo-wrap { margin-bottom: 10px; }
  .login-logo-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(240,212,138,0.12);
    border: 1px solid rgba(240,212,138,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin: 0 auto 18px;
  }
  .login-logo {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 500; color: #f0d48a;
    letter-spacing: 0.02em; line-height: 1.2;
  }
  .login-logo em { font-style: italic; font-weight: 400; }
  .login-tagline {
    font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
    color: rgba(255,255,255,0.32); margin-top: 4px;
  }

  .login-divider {
    width: 40px; height: 1px;
    background: linear-gradient(to right, transparent, rgba(240,212,138,0.5), transparent);
    margin: 32px auto;
  }

  .login-quote {
    font-family: 'Playfair Display', serif;
    font-size: 19px; font-style: italic; font-weight: 400;
    color: rgba(255,255,255,0.72); line-height: 1.62;
    margin-bottom: 16px;
  }
  .login-quote-attr {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  .login-features {
    display: flex; flex-direction: column; gap: 14px;
    margin-top: 40px; width: 100%; text-align: left;
  }
  .login-feat {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
  }
  .login-feat-icon { font-size: 16px; opacity: 0.75; width: 20px; text-align: center; }
  .login-feat-text { font-size: 12.5px; color: rgba(255,255,255,0.55); letter-spacing: 0.02em; }

  /* ── RIGHT PANEL ── */
  .login-right {
    width: 480px; flex-shrink: 0;
    background: #f7f4ef;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 72px 56px;
    position: relative;
  }
  .login-right-inner { width: 100%; max-width: 340px; }

  .login-form-eyebrow {
    font-size: 10.5px; letter-spacing: 0.26em; text-transform: uppercase;
    color: #b8960c; font-weight: 500; margin-bottom: 10px;
  }
  .login-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px; font-weight: 500; color: #0a1628;
    line-height: 1.15; letter-spacing: -0.01em;
    margin-bottom: 6px;
  }
  .login-form-title em { font-style: italic; font-weight: 400; }
  .login-form-sub { font-size: 13.5px; color: #8a8078; margin-bottom: 36px; line-height: 1.5; }

  /* Error */
  .login-err {
    background: #fff8f8; border: 1px solid #fcd0cc;
    border-left: 3px solid #e05252;
    border-radius: 6px; padding: 12px 14px;
    color: #b83232; font-size: 13px; margin-bottom: 24px;
    display: flex; align-items: center; gap: 10px;
  }
  .login-err-icon { font-size: 14px; flex-shrink: 0; }

  /* Fields */
  .login-field { margin-bottom: 20px; }
  .login-label {
    display: block; font-size: 11px; font-weight: 500;
    color: #6b6560; text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 7px;
  }
  .login-input-wrap { position: relative; }
  .login-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #c0b8b0; font-size: 15px; pointer-events: none;
  }
  .login-input {
    width: 100%; padding: 12px 14px 12px 40px;
    border: 1px solid #e0dbd4; border-radius: 8px;
    font-size: 14px; font-family: 'Jost', sans-serif;
    color: #1a1a1a; background: white; outline: none;
    transition: all 0.18s;
  }
  .login-input:focus {
    border-color: #d4af50; background: white;
    box-shadow: 0 0 0 3px rgba(212,175,80,0.12);
  }
  .login-input::placeholder { color: #c8c0b8; }

  /* Submit */
  .login-submit {
    width: 100%; padding: 14px;
    background: #0a1628; color: #f0d48a;
    border: 1px solid rgba(240,212,138,0.25);
    border-radius: 8px; font-size: 13px; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.22s;
    font-family: 'Jost', sans-serif; margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .login-submit:hover { background: #162d47; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(10,22,40,0.2); }
  .login-submit:active { transform: translateY(0); }
  .login-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .login-submit-arrow { transition: transform 0.2s; }
  .login-submit:hover .login-submit-arrow { transform: translateX(4px); }

  /* Divider */
  .login-or {
    display: flex; align-items: center; gap: 14px;
    margin: 24px 0; color: #c0b8b0; font-size: 12px; letter-spacing: 0.1em;
  }
  .login-or::before, .login-or::after { content: ''; flex: 1; height: 1px; background: #e8e3dc; }

  /* Register link */
  .login-register-link {
    text-align: center; font-size: 13.5px; color: #8a8078;
  }
  .login-register-link a {
    color: #0a1628; font-weight: 500; text-decoration: none;
    border-bottom: 1px solid rgba(10,22,40,0.2); padding-bottom: 1px;
    transition: all 0.15s;
  }
  .login-register-link a:hover { color: #b8960c; border-color: #b8960c; }

  /* Bottom brand */
  .login-right-brand {
    position: absolute; bottom: 28px; left: 0; right: 0;
    text-align: center; font-size: 11px; color: #c0b8b0;
    letter-spacing: 0.12em;
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
            <span className="login-back-arrow">←</span> Back to home
          </Link>

          <div className="login-left-content">
            <div className="login-logo-wrap">
              <div className="login-logo-icon">🌊</div>
              <div className="login-logo">Ocean<em>View</em></div>
              <div className="login-tagline">Hotel · Colombo, Sri Lanka</div>
            </div>

            <div className="login-divider" />

            <p className="login-quote">
              "Every morning here, the ocean reminds you that some things are more vast than any worry."
            </p>
            <div className="login-quote-attr">— A returning guest</div>

            <div className="login-features">
              {[
                { icon: '🔒', text: 'Secure, encrypted login' },
                { icon: '📋', text: 'Manage all your reservations' },
                { icon: '⚡', text: 'Instant booking confirmation' },
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
          <div className="login-right-inner">
            <div className="login-form-eyebrow">{fromRegistration ? 'Account created' : 'Welcome back'}</div>
            <h1 className="login-form-title">Sign in to<br /><em>your account</em></h1>
            <p className="login-form-sub">
              {fromRegistration ? 'Registration successful. Sign in with your new account, then go to the customer dashboard to book.' : 'Enter your credentials to manage your reservations.'}
            </p>

            {fromLogout && (
              <Alert type="success" message="You have been logged out successfully." onDismiss={() => navigate('/login', { replace: true })} />
            )}
            {fromRegistration && (
              <div className="login-success" style={{ marginBottom: 20, padding: '12px 16px', background: '#f0faf4', border: '1px solid #86efac', borderRadius: 8, color: '#166534', fontSize: 13 }}>
                ✓ Account created. Please sign in below.
              </div>
            )}
            {successMessage && (
              <Alert type="success" message={successMessage} />
            )}

            {error && (
              <div className="login-err">
                <span className="login-err-icon">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">Username</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">◈</span>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Password</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">⊛</span>
                  <input
                    className="login-input"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Signing in…' : <>Sign In <span className="login-submit-arrow">→</span></>}
              </button>
            </form>

            <div className="login-or">or</div>

            <div className="login-register-link">
              New to Ocean View Hotel?{' '}
              <Link to="/register">Create an account</Link>
            </div>
          </div>

          <div className="login-right-brand">OCEAN VIEW HOTEL · EST. 2015</div>
        </div>

      </div>
    </>
  )
}