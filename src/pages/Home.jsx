import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .hm { font-family: 'Jost', sans-serif; background: #f7f4ef; color: #1a1a1a; min-height: 100vh; overflow-x: hidden; }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 56px; height: 72px;
    transition: all 0.4s ease;
  }
  .nav.scrolled {
    background: rgba(10, 22, 40, 0.96);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(212,175,90,0.15);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 21px; font-weight: 700; color: #f0d48a;
    letter-spacing: 0.03em; text-shadow: 0 2px 20px rgba(0,0,0,0.4);
  }
  .nav-logo span { font-style: italic; font-weight: 400; }
  .nav-links { display: flex; align-items: center; gap: 6px; }
  .nav-a {
    font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.65);
    padding: 8px 16px; border-radius: 6px; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.06em; text-transform: uppercase;
    background: none; border: none; font-family: 'Jost', sans-serif;
    text-decoration: none; display: inline-block;
  }
  .nav-a:hover { color: white; background: rgba(255,255,255,0.08); }
  .nav-cta {
    font-size: 12px; font-weight: 500; color: #1a1a1a;
    background: #f0d48a; padding: 9px 22px; border-radius: 5px;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.08em; text-transform: uppercase;
    border: none; font-family: 'Jost', sans-serif; text-decoration: none; display: inline-block;
    margin-left: 8px;
  }
  .nav-cta:hover { background: #f8e4a0; transform: translateY(-1px); }

  /* ── HERO ── */
  .hero {
    height: 100vh; min-height: 640px; position: relative;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=85') center / cover no-repeat;
    transform: scale(1.04);
    animation: slow-zoom 18s ease-in-out infinite alternate;
  }
  @keyframes slow-zoom { from { transform: scale(1.04); } to { transform: scale(1.12); } }
  .hero-vignette {
    position: absolute; inset: 0;
    background:
      linear-gradient(to bottom, rgba(5,14,26,0.55) 0%, rgba(5,14,26,0.2) 45%, rgba(5,14,26,0.65) 100%);
  }
  .hero-content {
    position: relative; z-index: 2; text-align: center;
    padding: 0 24px; max-width: 820px;
    animation: hero-up 1.2s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes hero-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(240,212,138,0.14); border: 1px solid rgba(240,212,138,0.35);
    color: #f0d48a; padding: 7px 20px; border-radius: 100px;
    font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
    font-weight: 500; margin-bottom: 28px; backdrop-filter: blur(8px);
  }
  .hero-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #f0d48a; }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(52px, 8vw, 88px);
    font-weight: 500; color: #fff;
    line-height: 1.06; letter-spacing: -0.02em;
    margin-bottom: 20px;
    text-shadow: 0 4px 32px rgba(0,0,0,0.3);
  }
  .hero-title em { font-style: italic; color: #f0d48a; font-weight: 400; }
  .hero-sub {
    font-size: 17px; color: rgba(255,255,255,0.62);
    font-weight: 300; letter-spacing: 0.08em;
    margin-bottom: 48px; line-height: 1.6;
  }
  .hero-actions { display: flex; gap: 16px; justify-content: center; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 38px; background: #f0d48a; color: #0a1628;
    border-radius: 5px; font-size: 12px; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    cursor: pointer; border: none; transition: all 0.25s;
    font-family: 'Jost', sans-serif; text-decoration: none;
    box-shadow: 0 8px 32px rgba(240,212,138,0.25);
  }
  .btn-primary:hover { background: #f8e4a0; transform: translateY(-2px); box-shadow: 0 16px 40px rgba(240,212,138,0.35); }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 15px 36px; background: transparent; color: rgba(255,255,255,0.82);
    border: 1px solid rgba(255,255,255,0.32); border-radius: 5px;
    font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
    cursor: pointer; transition: all 0.25s; font-family: 'Jost', sans-serif; text-decoration: none;
  }
  .btn-outline:hover { border-color: rgba(255,255,255,0.7); color: white; background: rgba(255,255,255,0.07); }

  /* Scroll indicator */
  .hero-scroll {
    position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
    z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px;
    color: rgba(255,255,255,0.38); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    animation: bounce 2.4s ease-in-out infinite;
  }
  @keyframes bounce { 0%,100%{ transform: translateX(-50%) translateY(0); } 50%{ transform: translateX(-50%) translateY(8px); } }
  .hero-scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,0.38), transparent); }

  /* ── STATS BAND ── */
  .stats-band { background: #0a1628; }
  .stats-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
  .stat-cell {
    padding: 28px 20px; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.07);
  }
  .stat-cell:last-child { border-right: none; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #f0d48a; line-height: 1; }
  .stat-lbl { font-size: 11px; color: rgba(255,255,255,0.38); letter-spacing: 0.16em; text-transform: uppercase; margin-top: 6px; }

  /* ── SECTION INTRO ── */
  .sec-intro { text-align: center; margin-bottom: 52px; }
  .sec-eyebrow { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #b8960c; font-weight: 500; margin-bottom: 12px; display: block; }
  .sec-title { font-family: 'Playfair Display', serif; font-size: clamp(30px, 4vw, 44px); font-weight: 500; color: #0a1628; line-height: 1.15; letter-spacing: -0.01em; }
  .sec-title em { font-style: italic; font-weight: 400; color: #b8960c; }
  .sec-line { width: 48px; height: 2px; background: linear-gradient(to right, #f0d48a, #b8960c); margin: 18px auto 0; border-radius: 2px; }

  /* ── ROOMS ── */
  .rooms-section { padding: 92px 24px; max-width: 1200px; margin: 0 auto; }
  .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
  .room-card {
    background: white; border-radius: 16px; overflow: hidden;
    border: 1px solid #ece7df; transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
    cursor: pointer;
  }
  .room-card:hover { transform: translateY(-10px); box-shadow: 0 32px 72px rgba(0,0,0,0.13); }
  .room-img-wrap { position: relative; height: 320px; overflow: hidden; }
  .room-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
  .room-card:hover .room-img { transform: scale(1.06); }
  .room-img-ph { width: 100%; height: 100%; background: linear-gradient(135deg, #ece7df, #d8cfc2); display: flex; align-items: center; justify-content: center; color: #b0a89a; font-size: 14px; }
  .room-type-badge {
    position: absolute; top: 16px; left: 16px;
    background: rgba(10,22,40,0.78); color: #f0d48a;
    padding: 5px 14px; border-radius: 100px; font-size: 11px;
    font-weight: 500; letter-spacing: 0.08em; backdrop-filter: blur(8px);
    border: 1px solid rgba(240,212,138,0.25);
  }
  .room-body { padding: 26px 28px 28px; }
  .room-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; color: #0a1628; margin-bottom: 6px; letter-spacing: -0.01em; }
  .room-desc { font-size: 13.5px; color: #8a8078; line-height: 1.6; margin-bottom: 22px; }
  .room-footer { display: flex; align-items: flex-end; justify-content: space-between; }
  .room-rate-lbl { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #b0a89a; margin-bottom: 4px; }
  .room-rate-val { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #0a1628; }
  .room-rate-nit { font-size: 13px; font-family: 'Jost'; color: #b0a89a; font-weight: 300; }
  .room-book-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; background: #0a1628; color: #f0d48a;
    border: 1px solid rgba(240,212,138,0.25); border-radius: 8px;
    font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
    cursor: pointer; transition: all 0.2s; font-family: 'Jost', sans-serif;
    text-decoration: none;
  }
  .room-book-btn:hover { background: #162d47; border-color: rgba(240,212,138,0.5); transform: translateX(3px); }

  /* ── FEATURES ── */
  .features-section { background: #0a1628; padding: 88px 24px; }
  .features-inner { max-width: 1100px; margin: 0 auto; }
  .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-top: 56px; }
  .feat-card {
    background: rgba(255,255,255,0.04); padding: 36px 28px;
    border: 1px solid rgba(255,255,255,0.07); transition: all 0.25s;
    position: relative; overflow: hidden;
  }
  .feat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #f0d48a, #b8960c); opacity: 0; transition: opacity 0.3s;
  }
  .feat-card:hover { background: rgba(255,255,255,0.07); }
  .feat-card:hover::before { opacity: 1; }
  .feat-icon { font-size: 32px; margin-bottom: 20px; opacity: 0.85; }
  .feat-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.9); margin-bottom: 10px; }
  .feat-desc { font-size: 13px; color: rgba(255,255,255,0.42); line-height: 1.7; }

  /* ── TESTIMONIAL ── */
  .quote-section {
    padding: 88px 24px;
    background: linear-gradient(135deg, #f7f4ef 0%, #ece7df 100%);
    text-align: center;
  }
  .quote-inner { max-width: 680px; margin: 0 auto; }
  .quote-marks { font-family: 'Playfair Display', serif; font-size: 80px; color: #f0d48a; line-height: 0.5; margin-bottom: 24px; display: block; }
  .quote-text { font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; font-weight: 400; color: #0a1628; line-height: 1.65; margin-bottom: 28px; }
  .quote-author { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #b0a89a; }
  .quote-stars { color: #f0d48a; font-size: 14px; margin-bottom: 18px; letter-spacing: 4px; }

  /* ── FOOTER ── */
  .footer { background: #06101e; padding: 36px 56px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; color: #f0d48a; letter-spacing: 0.04em; }
  .footer-text { font-size: 12px; color: rgba(255,255,255,0.28); letter-spacing: 0.06em; }
  .footer-links { display: flex; gap: 24px; }
  .footer-link { font-size: 12px; color: rgba(255,255,255,0.38); cursor: pointer; transition: color 0.15s; letter-spacing: 0.06em; text-decoration: none; }
  .footer-link:hover { color: #f0d48a; }

  /* Loading */
  .loading-dots { display: flex; gap: 6px; justify-content: center; padding: 48px 0; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #d4af7a; animation: pulse 1.4s ease-in-out infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse { 0%,80%,100%{ opacity: 0.2; transform: scale(0.8); } 40%{ opacity: 1; transform: scale(1); } }

  /* No rooms */
  .no-rooms { text-align: center; padding: 72px 24px; color: #b0a89a; }
  .no-rooms-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #8a8078; margin-top: 12px; }
`;

export default function Home() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRooms(list.map((r) => ({ ...r, id: r.id ?? r._id })));
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const FEATURES = [
    { icon: "🌊", title: "Ocean Panoramas", desc: "Floor-to-ceiling windows and private balconies with unobstructed sea views in every room." },
    { icon: "🍽️", title: "Signature Dining", desc: "Award-winning chefs crafting Sri Lankan and international cuisine at our waterfront table." },
    { icon: "🌿", title: "Wellness & Spa", desc: "A sanctuary of calm — hydrotherapy pools, Ayurvedic treatments, and meditation gardens." },
    { icon: "✦", title: "Seamless Booking", desc: "Reserve your perfect suite in moments with instant digital confirmation and concierge support." },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="hm">
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-vignette" />
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              Colombo, Sri Lanka · Since 2015
            </div>
            <h1 className="hero-title">
              Where the <em>Ocean</em><br />Greets You Each Day
            </h1>
            <p className="hero-sub">Luxury · Serenity · Timeless Elegance</p>
            <div className="hero-actions">
              {user ? (
                <a href="/reservations/new" className="btn-primary">Reserve Your Stay →</a>
              ) : (
                <>
                  <a href="/register" className="btn-primary">Reserve Your Stay →</a>
                  <a href="#rooms" className="btn-outline">Explore Rooms</a>
                </>
              )}
            </div>
          </div>
          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            Scroll
          </div>
        </section>

        {/* STATS */}
        <div className="stats-band">
          <div className="stats-inner">
            {[["24", "Luxury Rooms"], ["5★", "Guest Rating"], ["10+", "Years Excellence"], ["3", "Room Tiers"]].map(([n, l]) => (
              <div key={l} className="stat-cell">
                <div className="stat-num">{n}</div>
                <div className="stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROOMS */}
        <section className="rooms-section" id="rooms">
          <div className="sec-intro">
            <span className="sec-eyebrow">Our Accommodations</span>
            <h2 className="sec-title">Rooms Crafted for<br /><em>Quiet Luxury</em></h2>
            <div className="sec-line" />
            <p className="sec-sub" style={{ marginTop: 14, fontSize: 15, color: '#8a8078', maxWidth: 520, margin: '14px auto 0' }}>Detailed photos and details of every room added by our team. Click Book Now to reserve.</p>
          </div>
          {loading ? (
            <div className="loading-dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
          ) : rooms.length === 0 ? (
            <div className="no-rooms"><div style={{ fontSize: 48, opacity: 0.2 }}>◈</div><div className="no-rooms-title">No rooms available right now.</div></div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room, i) => (
                <div key={room.id} className="room-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="room-img-wrap">
                    {room.imageUrl ? (
                      <img
                        src={room.imageUrl.startsWith("http") || room.imageUrl.startsWith("/") ? room.imageUrl : `/${room.imageUrl.replace(/^\//, "")}`}
                        alt={`${room.roomType} Room ${room.roomNumber} – ${room.description || ""}`}
                        className="room-img"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="room-img-ph">Photo coming soon</div>
                    )}
                    <div className="room-type-badge">{room.roomType}</div>
                  </div>
                  <div className="room-body">
                    <div className="room-name">{room.roomType} Room {room.roomNumber}</div>
                    <div className="room-desc">{room.description || `${room.roomType} room`}</div>
                    <div className="room-footer">
                      <div>
                        <div className="room-rate-lbl">From</div>
                        <div className="room-rate-val">LKR {room.ratePerNight?.toLocaleString()} <span className="room-rate-nit">/ night</span></div>
                      </div>
                      {user
                        ? <a href="/reservations/new" className="room-book-btn">Book Now →</a>
                        : <a href="/register" className="room-book-btn">Book Now →</a>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QUOTE */}
        <section className="quote-section">
          <div className="quote-inner">
            <div className="quote-stars">★★★★★</div>
            <span className="quote-marks">"</span>
            <p className="quote-text">The most breathtaking sunrise I have ever witnessed — from the comfort of my own suite, coffee in hand, with the whole Indian Ocean laid out before me.</p>
            <div className="quote-author">Amelia R. · Suite Guest · March 2025</div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div className="features-inner">
            <div className="sec-intro" style={{ marginBottom: 0 }}>
              <span className="sec-eyebrow" style={{ color: "#f0d48a" }}>The Experience</span>
              <h2 className="sec-title" style={{ color: "white" }}>Everything You<br /><em style={{ color: "#f0d48a" }}>Need to Unwind</em></h2>
              <div className="sec-line" />
            </div>
            <div className="features-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feat-card">
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">Ocean View Resort</div>
          <div className="footer-text">© 2026 Ocean View Resort · All rights reserved</div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="/help" className="footer-link">Help</a>
            <a href="/about" className="footer-link">About</a>
          </div>
        </footer>

      </div>
    </>
  );
}