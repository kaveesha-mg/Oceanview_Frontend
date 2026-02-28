import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'

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

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Manage Customers</div>
          <div className="admin-page-subtitle">View all registered users</div>
        </div>
      </div>
      <div className="admin-page-body">
      {error && <Alert message={error} onDismiss={() => setError('')} />}
      {loading ? (
        <p style={{ color: '#9a8f83' }}>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Username</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Full Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="border border-gray-200 px-4 py-2">{u.username}</td>
                  <td className="border px-4 py-2">{u.fullName}</td>
                  <td className="border px-4 py-2">{u.email}</td>
                  <td className="border px-4 py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p style={{ color: '#9a8f83', padding: '16px 0' }}>No users found.</p>}
        </div>
      )}
    </div>
    </>
  )
}
