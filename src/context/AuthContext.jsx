import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = (authResponse) => {
    localStorage.setItem('token', authResponse.token)
    setToken(authResponse.token)
    setUser({
      userId: authResponse.userId,
      username: authResponse.username,
      role: authResponse.role
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const api = (path, options = {}) => {
    const t = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
    const headers = {
      'Content-Type': 'application/json',
      ...(t && { Authorization: `Bearer ${t}` }),
      ...options.headers
    }
    return fetch(path, { ...options, headers })
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, api, isAdmin: ['ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'].includes(user?.role) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
