import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LiveTicker from './components/LiveTicker';
import Footer from './components/Footer';
import EmergencyFAB from './components/EmergencyFAB';
import EnhancedChatBot from './components/EnhancedChatBot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrgDashboard from './pages/OrgDashboard';
import DonationCamps from './pages/DonationCamps';
import Heroes from './pages/Heroes';
import Compatibility from './pages/Compatibility';
import Community from './pages/Community';
import ProtocolPage from './pages/ProtocolPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useThemeStore } from './context/themeStore';
import { useAuthStore } from './context/authStore';

function App() {
  const { isDark, initTheme } = useThemeStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    try {
      initTheme();
      initAuth();
    } catch (error) {
      console.error('App initialization error:', error);
    }
  }, [initTheme, initAuth]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-500 bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
      <LiveTicker />
      <Navbar />
      
      <main className="flex-grow pt-32">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/camps" element={<DonationCamps />} />
          <Route path="/heroes" element={<Heroes />} />
          <Route path="/community" element={<Community />} />
          <Route path="/compatibility" element={<Compatibility />} />
          <Route path="/protocols/:id" element={<ProtocolPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/org-dashboard" element={<ProtectedRoute requireOrg={true}><OrgDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
      <EmergencyFAB />
      <EnhancedChatBot />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-medium brand-font tracking-wide rounded-xl shadow-lg border border-gray-100',
          style: {
            background: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: isDark ? '#f3f4f6' : '#1f2937',
            borderColor: isDark ? '#374151' : '#f3f4f6',
          },
        }}
      />
    </div>
  );
}

export default App;