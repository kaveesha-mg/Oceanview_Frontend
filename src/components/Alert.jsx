import { useState } from 'react'

export function Alert({ type = 'error', message, onDismiss }) {
  const [visible, setVisible] = useState(true)
  if (!visible || !message) return null
  const isError = type === 'error'
  const bg = isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
  const text = isError ? 'text-red-800' : 'text-green-800'
  const handleDismiss = () => { setVisible(false); onDismiss?.() }
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${bg} ${text} mb-4`} role="alert">
      <span className="font-medium">{message}</span>
      <button onClick={handleDismiss} className="ml-4 text-current opacity-70 hover:opacity-100" aria-label="Dismiss">×</button>
    </div>
  )
}

export function showValidationAlert(message) {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(message)
  }
}
