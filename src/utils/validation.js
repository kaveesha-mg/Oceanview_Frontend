export const validations = {
  username: (v) => {
    if (!v?.trim()) return 'Username is required'
    if (v.length < 3) return 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Username can only contain letters, numbers and underscore'
    return null
  },
  password: (v, min = 6) => {
    if (!v) return 'Password is required'
    if (v.length < min) return `Password must be at least ${min} characters`
    return null
  },
  required: (v, label = 'This field') => (!v?.trim() ? `${label} is required` : null),
  email: (v) => {
    if (!v?.trim()) return null
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(v) ? null : 'Invalid email format'
  },
  nic: (v) => {
    if (!v?.trim()) return null
    const s = v.trim()
    if (s.length === 10 && /^\d{9}[vVxX]$/.test(s)) return null
    if (s.length === 12 && /^\d{12}$/.test(s)) return null
    return 'NIC must be 10 digits + V/X or 12 digits'
  },
  phone: (v) => {
    if (!v?.trim()) return null
    if (!/^[\d\s\-\+]{7,15}$/.test(v.replace(/\s/g, ''))) return 'Invalid contact number'
    return null
  },
  dateAfter: (later, earlier, label = 'Check-out date must be after check-in date') =>
    later && earlier && new Date(later) <= new Date(earlier) ? label : null,
  positiveNumber: (v, label = 'Rate') => {
    const n = parseFloat(v)
    if (isNaN(n) || n <= 0) return `${label} must be a positive number`
    return null
  }
}

export function validateForm(fields, values) {
  const errors = {}
  for (const [key, fn] of Object.entries(fields)) {
    const err = typeof fn === 'function' ? fn(values[key], values) : null
    if (err) errors[key] = err
  }
  return Object.keys(errors).length ? errors : null
}
