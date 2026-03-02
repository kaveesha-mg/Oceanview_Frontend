import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, showValidationAlert } from '../components/Alert'
import { validations, validateForm } from '../utils/validation'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

  .booking-container { 
    font-family: 'Inter', sans-serif; 
    background: linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), 
                url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=100');
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 20px;
    box-sizing: border-box;
  }

  .booking-form-wrap {
    position: relative;
    background: #fdfaf5; 
    border-radius: 16px;
    padding: 50px 60px; 
    max-width: 750px;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
    border: 1px solid #e5dec9;
  }

  /* HIGH VISIBILITY TITLE */
  .form-main-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; 
    font-weight: 700;
    color: #0f172a; /* Deep Navy */
    margin: 0;
    text-shadow: 0.5px 0.5px 0px rgba(0,0,0,0.1);
  }

  .form-main-subtitle {
    font-size: 15px;
    font-weight: 500;
    color: #475569; /* Dark Slate Grey */
    margin-top: 8px;
    margin-bottom: 40px;
  }

  .form-section-label {
    font-size: 14px; 
    font-weight: 800; 
    color: #8b7355; /* Rich Bronze */
    letter-spacing: 0.15em; 
    text-transform: uppercase;
    margin-bottom: 30px; 
    display: flex; 
    align-items: center; 
    gap: 15px;
  }
  .form-section-label::after { content: ''; flex: 1; height: 2px; background: rgba(139, 115, 85, 0.3); }

  /* BOLD LABELS FOR VISIBILITY */
  .customer-form-label {
    display: block; 
    font-size: 13px; 
    font-weight: 700; 
    color: #1a1a1a; /* Pure Dark Contrast */
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    margin-bottom: 10px;
  }

  .customer-form-input {
    width: 100%; 
    padding: 16px; 
    background: #ffffff; 
    border: 2px solid #d1d5db; /* Darker border */
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500; /* Thicker text inside input */
    transition: all 0.2s ease; 
    color: #000000; /* Black text for maximum readability */
    box-sizing: border-box;
  }
  
  .customer-form-input:focus { 
    outline: none; 
    border-color: #0f172a; 
    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.1);
  }

  /* FOR DATE INPUTS READABILITY */
  .customer-form-input[type="date"] {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
  }

  .price-summary {
    background: #0f172a; 
    color: #ffffff; 
    padding: 30px;
    margin: 35px 0; 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    border-radius: 10px;
    border-left: 5px solid #d4af7a;
  }

  .summary-text { font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
  .summary-price { font-size: 28px; font-weight: 700; color: #d4af7a; }

  .customer-gold-btn {
    background: #d4af7a; 
    color: #0f172a; /* Dark text on gold button for contrast */
    border: none;
    padding: 20px; 
    font-size: 16px;
    font-weight: 800; 
    cursor: pointer; 
    transition: 0.3s; 
    text-transform: uppercase; 
    letter-spacing: 3px;
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(212, 175, 122, 0.4);
  }
  
  .customer-gold-btn:hover { 
    background: #0f172a; 
    color: #ffffff;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .booking-form-wrap { padding: 40px 20px; }
    .form-main-title { font-size: 28px; }
  }
`

export default function NewReservation() {
  const { api } = useAuth()
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState({
    guestName: '', address: '', nicNumber: '', contactNumber: '',
    roomType: '', checkInDate: '', checkOutDate: ''
  })

  useEffect(() => {
    fetch('/api/rooms/available')
      .then(r => r.json())
      .then(setRooms)
      .catch(() => setRooms([]))
  }, [])

  const roomTypes = [...new Set(rooms.map(r => r.roomType))]
  const selectedRate = rooms.find(r => r.roomType === form.roomType)?.ratePerNight
  const checkIn = form.checkInDate ? new Date(form.checkInDate) : null
  const checkOut = form.checkOutDate ? new Date(form.checkOutDate) : null
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000)) : 0
  const totalBill = selectedRate && nights > 0 ? selectedRate * nights : 0

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="booking-container">
      <style>{css}</style>
      
      <div className="booking-form-wrap">
        <div style={{ textAlign: 'center' }}>
          <h1 className="form-main-title">Reservation Inquiry</h1>
          <p className="form-main-subtitle">Please provide your details to secure your suite</p>
        </div>

        <form>
          <div className="form-section-label">1. Guest Information</div>
          <div style={{ marginBottom: 25 }}>
            <label className="customer-form-label">Full Name</label>
            <input name="guestName" value={form.guestName} onChange={handleChange} placeholder="e.g. Johnathan Doe" className="customer-form-input" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25, marginBottom: 25 }}>
            <div>
              <label className="customer-form-label">Identification (NIC/Passport)</label>
              <input name="nicNumber" value={form.nicNumber} onChange={handleChange} className="customer-form-input" />
            </div>
            <div>
              <label className="customer-form-label">Active Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="+94 ..." className="customer-form-input" />
            </div>
          </div>

          <div className="form-section-label">2. Stay Details</div>
          <div style={{ marginBottom: 25 }}>
            <label className="customer-form-label">Preferred Suite Category</label>
            <select name="roomType" value={form.roomType} onChange={handleChange} className="customer-form-input">
              <option value="">Choose a room...</option>
              {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25, marginBottom: 35 }}>
            <div>
              <label className="customer-form-label">Arrival Date</label>
              <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} className="customer-form-input" />
            </div>
            <div>
              <label className="customer-form-label">Departure Date</label>
              <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} min={form.checkInDate} className="customer-form-input" />
            </div>
          </div>

          {nights > 0 && (
            <div className="price-summary">
              <div>
                <div className="summary-text">Duration of Stay</div>
                <div style={{fontSize: '20px', fontWeight: '700'}}>{nights} Night(s)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="summary-text">Total Investment</div>
                <div className="summary-price">LKR {totalBill.toLocaleString()}</div>
              </div>
            </div>
          )}

          <button type="button" className="customer-gold-btn">
            Finalize Reservation
          </button>
        </form>
      </div>
    </div>
  )
}