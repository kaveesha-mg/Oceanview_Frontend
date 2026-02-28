import { useAuth } from '../context/AuthContext'

export default function AdminHelp() {
  const { user } = useAuth()
  const isReceptionist = user?.role === 'RECEPTIONIST'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const sections = [
    { title: 'Walk-in Reservations', content: 'When a guest arrives in person, use Walk-in. Enter guest details (Name, NIC, Address, Contact), select room type, set check-in & check-out dates. The system calculates the total bill and gives you a reservation number to provide to the guest.' },
    { title: 'Check Room Availability', content: 'Go to Room Availability to view available room types, how many rooms are free, and rates per night at a glance.' },
    { title: 'Managing Rooms', content: 'Go to Manage Rooms to view room inventory. You can add new rooms, edit existing rooms, and delete rooms that are no longer in service. (Room management may be restricted based on your role.)' },
    ...(isSuperAdmin ? [{ title: 'Super Admin', content: 'Super Admins can Add Receptionists and access Manage Customers. Use the secure Logout button when finished.' }] : []),
    { title: 'Security', content: 'Always log out when leaving the workstation. Keep your credentials secure and do not share them with others.' }
  ]

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Staff Help</div>
          <div className="admin-page-subtitle">
            {isReceptionist ? 'Front desk guidelines and usage instructions' : 'System guidelines and usage instructions'}
          </div>
        </div>
      </div>
      <div className="admin-page-body" style={{ maxWidth: 680 }}>
        {sections.map((s) => (
          <div key={s.title} className="admin-help-section">
            <h2>{s.title}</h2>
            <p>{s.content}</p>
          </div>
        ))}
      </div>
    </>
  )
}
