import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  /* FULL PAGE WRAPPER WITH RESORT BACKGROUND */
  .users-container { 
    font-family: 'Inter', sans-serif; 
    color: #1e293b; 
    min-height: 100vh;
    background: linear-gradient(rgba(253, 250, 245, 0.45), rgba(253, 250, 245, 0.45)), 
                url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop');
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

  /* BLUR BODY CONTENT */
  .admin-page-body {
    flex: 1;
    padding: 60px;
    background: rgba(253, 250, 245, 0.6); 
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .table-wrapper {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    max-width: 1400px;
    margin: 0 auto;
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  /* UPDATED: WHITE TEXT HEADERS */
  .custom-table th {
    background: #0f172a;
    padding: 24px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #ffffff; /* CHANGED TO WHITE */
    border-bottom: 1px solid rgba(212, 175, 122, 0.2);
  }

  .custom-table td {
    padding: 22px 24px;
    font-size: 15px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .custom-table tr:last-child td { border-bottom: none; }
  .custom-table tr:hover td { background: rgba(255, 255, 255, 1); }

  .user-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #ffffff;
    background: #0f172a; 
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(212, 175, 122, 0.3);
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .role-admin { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
  .role-receptionist { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
  .role-customer { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }

  .empty-msg {
    padding: 100px 40px;
    text-align: center;
    color: #64748b;
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
  }
`

export default function AdminUsers() {
  const { api } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api('/api/users')
      .then(r => r.json())
      .then(setUsers)
      .catch((err) => {
        setUsers([])
        const msg = err?.message || 'Failed to load users'
        setError(msg)
        showValidationAlert(msg)
      })
      .finally(() => setLoading(false))
  }, [api])

  const getRoleClass = (role) => {
    const r = role?.toUpperCase()
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') return 'role-admin'
    if (r === 'RECEPTIONIST') return 'role-receptionist'
    return 'role-customer'
  }

  return (
    <div className="users-container">
      <style>{css}</style>
      
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client & Staff Registry</h1>
          <div className="admin-page-subtitle">Centralized directory of all authenticated system entities</div>
        </div>
      </header>

      <main className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        
        {loading ? (
          <p style={{ 
            color: '#0f172a', 
            textAlign: 'center', 
            padding: '100px 0', 
            fontSize: '18px', 
            fontFamily: 'Cormorant Garamond',
            fontWeight: 600
          }}>
            Decrypting registry entries...
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>System Identity</th>
                  <th>Legal Full Name</th>
                  <th>Contact Email</th>
                  <th>Access Permission</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <span className="user-mono">{u.username}</span>
                    </td>
                    <td style={{ 
                      fontWeight: 700, 
                      color: '#0f172a', 
                      fontFamily: 'Cormorant Garamond', 
                      fontSize: '18px' 
                    }}>
                      {u.fullName}
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {u.email || 'No email provided'}
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleClass(u.role)}`}>
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="empty-msg">No authorized entities found in the current directory.</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}