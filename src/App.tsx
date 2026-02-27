import './App.css';
import { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

import Navigation from './components/Navigation';

import HomePage from './components/HomePage';
import ServiceFinder from './components/ServiceFinder';
import TravelPage from './components/TravelPage';
import RegisterPage from './components/Register';
import LoginPage from './components/Login';
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import RegisterBusiness from './components/RegisterBusiness';
import VerifyBusinessEmail from './components/Verifybusinessemail';
import About from './components/About';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import BusinessLogin from './components/BusinessLogin';
import BusinessForgotPassword from './components/BusinessForgotPassword';
import BusinessResetPassword from './components/BusinessResetPassword';
import BusinessDashboard from './components/BusinessDashboard';
import TipsGrooming   from './components/TipsGrooming';
import TipsHealth     from './components/TipsHealth';
import TipsTraining   from './components/TipsTraining';
import TipsNutrition  from './components/TipsNutrition';

function AppContent() {
  const location = useLocation();

  const [isTravelFlowActive, setIsTravelFlowActive] = useState(false);

  // Reset flow state whenever the user navigates away from travel page
  useEffect(() => {
    if (location.pathname !== '/travel-page') {
      setIsTravelFlowActive(false);
    }
  }, [location.pathname]);

  const authPages = [
    '/register', '/login', '/forgot-password', '/reset-password',
    '/admin', '/business/forgot-password', '/business/reset-password',
    '/business/dashboard', '/business/login',
  ];

  const isAuthPage     = authPages.includes(location.pathname);
  const isBusinessPage = location.pathname.startsWith('/register-business');
  const isDashboard    = location.pathname === '/dashboard';
  // Hide nav only when the travel flow wizard is open, not on the travel landing page
  const showNav = !isAuthPage && !isBusinessPage && !isDashboard && !isTravelFlowActive;

  return (
    <div className="App">
      {showNav && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/service-finder" element={<ServiceFinder />} />

        <Route
          path="/travel-page"
          element={<TravelPage onFlowChange={setIsTravelFlowActive} />}
        />

        <Route element={<GuestRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route path="/business/verify-email" element={<VerifyBusinessEmail />} />
        <Route path="/about"   element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin"   element={<AdminPanel />} />
        <Route path="/business/login"           element={<BusinessLogin />} />
        <Route path="/business/forgot-password" element={<BusinessForgotPassword />} />
        <Route path="/business/reset-password"  element={<BusinessResetPassword />} />
        <Route path="/business/dashboard"       element={<BusinessDashboard />} />

        <Route path="/tips/grooming"  element={<TipsGrooming />}  />
        <Route path="/tips/health"    element={<TipsHealth />}    />
        <Route path="/tips/training"  element={<TipsTraining />}  />
        <Route path="/tips/nutrition" element={<TipsNutrition />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;