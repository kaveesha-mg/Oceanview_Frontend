import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import CustomerLayout from './components/CustomerLayout'
import Home from './pages/Home'
import About from './pages/About'
import Help from './pages/Help'
import Login from './pages/Login'
import Register from './pages/Register'
import Reservations from './pages/Reservations'
import NewReservation from './pages/NewReservation'
import CustomerHelp from './pages/CustomerHelp'
import AdminDashboard from './pages/AdminDashboard'
import AdminRooms from './pages/AdminRooms'
import AdminWalkIn from './pages/AdminWalkIn'
import AdminHelp from './pages/AdminHelp'
import AdminUsers from './pages/AdminUsers'
import AddReceptionist from './pages/AddReceptionist'
import AdminRoomAvailability from './pages/AdminRoomAvailability'
import AdminReservations from './pages/AdminReservations'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children, adminOnly, superAdminOnly }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (superAdminOnly && user.role !== 'SUPER_ADMIN') return <Navigate to="/" replace />
  if (adminOnly && !['ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="reservations" element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<Reservations />} />
        <Route path="new" element={<NewReservation />} />
        <Route path="help" element={<CustomerHelp />} />
      </Route>
      <Route path="admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="walk-in" element={<AdminWalkIn />} />
        <Route path="room-availability" element={<AdminRoomAvailability />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="help" element={<AdminHelp />} />
        <Route path="users" element={<ProtectedRoute superAdminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="add-receptionist" element={<ProtectedRoute superAdminOnly><AddReceptionist /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
