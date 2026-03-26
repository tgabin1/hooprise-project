import { useState } from 'react';
import Navbar             from './components/Navbar';
import Hero               from './components/Hero';
import Features           from './components/Features';
import HowItWorks         from './components/HowItWorks';
import Courts             from './components/Courts';
import Programs           from './components/Programs';
import CTABanner          from './components/CTABanner';
import Footer             from './components/Footer';
import AuthModal          from './components/AuthModal';
import BookingModal       from './components/BookingModal';
import BookingHistory     from './components/BookingHistory';
import AdminDashboard     from './components/AdminDashboard';
import AdminPasswordModal from './components/AdminPasswordModal';
import ProfileModal       from './components/ProfileModal';
import EquipmentModal     from './components/EquipmentModal';
import Toast              from './components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [authOpen, setAuthOpen]           = useState(false);
  const [authTab, setAuthTab]             = useState('login');
  const [bookingOpen, setBookingOpen]     = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [historyOpen, setHistoryOpen]     = useState(false);
  const [adminPassOpen, setAdminPassOpen] = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [toastMsg, setToastMsg]           = useState('');
  const [toastVisible, setToastVisible]   = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hooprise_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminOpen, setAdminOpen] = useState(
    () => localStorage.getItem('hooprise_admin') === 'true'
  );
  const [adminVerified, setAdminVerified] = useState(
    () => localStorage.getItem('hooprise_admin') === 'true'
  );

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const openLogin  = () => { setAuthTab('login');  setAuthOpen(true); };
  const openSignup = () => { setAuthTab('signup'); setAuthOpen(true); };

  const handleAuthSuccess = (msg, userData) => {
    showToast(msg);
    if (userData) {
      setUser(userData);
      localStorage.setItem('hooprise_user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAdminVerified(false);
    setAdminOpen(false);
    localStorage.removeItem('hooprise_user');
    localStorage.removeItem('hooprise_admin');
    showToast('Logged out successfully!');
  };

  const handleAdminClick = () => setAdminPassOpen(true);

  const handleAdminVerified = () => {
    setAdminPassOpen(false);
    setAdminVerified(true);
    setAdminOpen(true);
    localStorage.setItem('hooprise_admin', 'true');
  };

  const handleProfileUpdate = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('hooprise_user', JSON.stringify(newUser));
    showToast('Profile updated successfully!');
  };

  const openBooking = (court = null) => {
    setSelectedCourt(court || {
      id: 1,
      name: 'BK Arena Practice Court',
      location: 'Kimihurura, Kigali',
      court_type: 'Indoor',
      surface: 'Hardwood',
      price_rwf: 1000,
    });
    setBookingOpen(true);
  };

  if (adminOpen && adminVerified) {
    return (
      <AdminDashboard
        user={user}
        onClose={() => {
          setAdminOpen(false);
          setAdminVerified(false);
          localStorage.removeItem('hooprise_admin');
        }}
      />
    );
  }

  return (
    <>
      <Navbar
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        user={user}
        onLogout={handleLogout}
        onHistoryClick={() => setHistoryOpen(true)}
        onAdminClick={handleAdminClick}
        onProfileClick={() => setProfileOpen(true)}
        onEquipmentClick={() => setEquipmentOpen(true)}
      />

      <main>
        <Hero
          onBookClick={() => openBooking()}
          onSignupClick={openSignup}
        />
        <Features   onSignupClick={openSignup} />
        <HowItWorks />
        <Courts     onBookClick={openBooking} />
        <Programs   user={user} onLoginClick={openLogin} />
        <CTABanner  onSignupClick={openSignup} />
      </main>

      <Footer />

      <AuthModal
        isOpen={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <BookingModal
        isOpen={bookingOpen}
        court={selectedCourt}
        onClose={() => setBookingOpen(false)}
        onSuccess={showToast}
        user={user}
      />
      <BookingHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        user={user}
      />
      <AdminPasswordModal
        isOpen={adminPassOpen}
        onClose={() => setAdminPassOpen(false)}
        user={user}
        onSuccess={handleAdminVerified}
      />
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
      <EquipmentModal
        isOpen={equipmentOpen}
        onClose={() => setEquipmentOpen(false)}
        user={user}
      />

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}