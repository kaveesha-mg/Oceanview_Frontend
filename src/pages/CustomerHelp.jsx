export default function CustomerHelp() {
  return (
    <>
      <div className="customer-page-header">
        <div>
          <div className="customer-page-title">Help</div>
          <div className="customer-page-subtitle">How to use the reservation system</div>
        </div>
      </div>
      <div className="customer-page-body" style={{ maxWidth: 680 }}>
        <div className="customer-help-section">
          <h2>1. Create an Account</h2>
          <p>Click <strong>Register</strong> and fill in your details: username, password, full name, email, address, NIC number, and contact number. You must be registered to make reservations.</p>
        </div>
        <div className="customer-help-section">
          <h2>2. Log In</h2>
          <p>After registering, use your <strong>Username</strong> and <strong>Password</strong> to log in. Keep your credentials safe.</p>
        </div>
        <div className="customer-help-section">
          <h2>3. Browse Available Rooms</h2>
          <p>On the Home page, view available room types and rates. Each room type shows the price per night and how many rooms are available.</p>
        </div>
        <div className="customer-help-section">
          <h2>4. Make a Reservation</h2>
          <p>Click <strong>Book Now</strong> in the sidebar. Fill in all required details:</p>
          <ul>
            <li>Guest name</li>
            <li>Address</li>
            <li>NIC Number</li>
            <li>Contact Number</li>
            <li>Room Type</li>
            <li>Check-in date and time (AM/PM)</li>
            <li>Check-out date and time (AM/PM)</li>
          </ul>
          <p style={{ marginTop: 12 }}>The system will not allow a check-out date before the check-in date.</p>
        </div>
        <div className="customer-help-section">
          <h2>5. Review & Confirm</h2>
          <p>After clicking <strong>Confirm Reservation</strong>, the system calculates your bill based on nights stayed and room rate. You can view the complete reservation, download the bill, or print it for your records.</p>
        </div>
        <div className="customer-help-section">
          <h2>6. Secure Logout</h2>
          <p>Always use the <strong>Logout</strong> button when you are done to safely exit the system and protect your account.</p>
        </div>
      </div>
    </>
  )
}
