import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from './Alert'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === ''
  const isAboutOrHelp = location.pathname === '/about' || location.pathname === '/help'
  const showLogoutSuccess = location.state?.logoutSuccess === true

  const mainClass = isHome ? '' : isAboutOrHelp ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'

  const handleLogout = () => {
    logout()
    navigate('/', { state: { logoutSuccess: true } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 to-ocean-50">
      <nav className="bg-white/90 backdrop-blur shadow-sm border-b border-ocean-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="font-display text-xl font-semibold text-ocean-700">Ocean View Hotel</Link>
              <div className="hidden md:flex gap-6">
                <Link to="/" className="text-gray-600 hover:text-ocean-600 transition">Home</Link>
                <Link to="/about" className="text-gray-600 hover:text-ocean-600 transition">About</Link>
                <Link to="/help" className="text-gray-600 hover:text-ocean-600 transition">Help</Link>
                {user && (
                  <Link to="/reservations" className="text-gray-600 hover:text-ocean-600 transition">My Reservations</Link>
                )}
                {user && (
                  <Link to="/reservations/new" className="text-ocean-600 font-medium hover:text-ocean-700">Book Now</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-ocean-700 font-medium">Admin</Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.username} ({user.role})</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 rounded-lg transition">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className={mainClass}>
        {showLogoutSuccess && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Alert type="success" message="You have been logged out successfully." onDismiss={() => navigate(location.pathname, { replace: true })} />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
