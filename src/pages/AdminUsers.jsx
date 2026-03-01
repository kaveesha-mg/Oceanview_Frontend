import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

  .users-container { font-family: 'Inter', sans-serif; color: #1e293b; }

  .admin-page-header {
    padding: 48px 0;
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 40px;
  }

  .admin-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px; /* INCREASED FROM 32px */
    color: #0f172a;
    margin: 0;
  }

  .admin-page-subtitle {
    font-size: 16px; /* INCREASED FROM 14px */
    color: #64748b;
    margin-top: 6px;
  }

  .admin-page-body {
    padding-left: 60px; /* CONSISTENT SIDEBAR GAP */
    padding-right: 40px;
    padding-bottom: 100px;
  }

  .table-wrapper {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .custom-table th {
    background: #f8fafc;
    padding: 20px 24px;
    font-size: 12px; /* INCREASED */
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
  }

  .custom-table td {
    padding: 20px 24px;
    font-size: 15px; /* INCREASED */
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  .custom-table tr:last-child td {
    border-bottom: none;
  }

  .custom-table tr:hover td {
    background: #fcfcfd;
  }

  .user-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: #0f172a;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .role-admin { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
  .role-receptionist { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
  .role-customer { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }

  .empty-msg {
    padding: 80px 40px;
    text-align: center;
    color: #94a3b8;
    font-size: 16px;
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client & Staff Registry</h1>
          <div className="admin-page-subtitle">Centralized directory of all authenticated system entities</div>
        </div>
      </div>

      <div className="admin-page-body">
        {error && <Alert message={error} onDismiss={() => setError('')} />}
        
        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '100px 0', fontSize: '16px' }}>
            Retrieving directory...
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Legal Full Name</th>
                  <th>Email Address</th>
                  <th>Access Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <span className="user-mono">{u.username}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.fullName}</td>
                    <td style={{ color: '#64748b' }}>{u.email || '—'}</td>
                    <td>
                      <span className={`role-badge ${getRoleClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="empty-msg">No entries found in the current directory.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}