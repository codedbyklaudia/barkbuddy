import './App.css';
import { useState, useEffect, lazy, Suspense } from 'react';
import { SavedProvider } from './context/SavedContext';
import { useAuth } from './context/AuthContext';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Always eager — needed immediately on load
import Navigation from './components/Navigation';
import HomePage   from './components/HomePage';

// Lazy loaded — only downloaded when the route is visited
const ServiceFinder        = lazy(() => import('./components/ServiceFinder'));
const ServiceDetailPage    = lazy(() => import('./components/ServiceDetailPage'));
const TravelPage           = lazy(() => import('./components/TravelPage'));
const RegisterPage         = lazy(() => import('./components/Register'));
const LoginPage            = lazy(() => import('./components/Login'));
const ForgotPasswordPage   = lazy(() => import('./components/ForgotPassword'));
const ResetPasswordPage    = lazy(() => import('./components/ResetPassword'));
const Dashboard            = lazy(() => import('./components/Dashboard/Dashboard'));
const DogProfilePage       = lazy(() => import('./components/Dashboard/DogProfilePage'));
const RegisterBusiness     = lazy(() => import('./components/RegisterBusiness'));
const VerifyBusinessEmail  = lazy(() => import('./components/Verifybusinessemail'));
const About                = lazy(() => import('./components/About'));
const Contact              = lazy(() => import('./components/Contact'));
const AdminPanel           = lazy(() => import('./components/AdminPanel'));
const BusinessLogin        = lazy(() => import('./components/BusinessLogin'));
const BusinessForgotPassword = lazy(() => import('./components/BusinessForgotPassword'));
const BusinessResetPassword  = lazy(() => import('./components/BusinessResetPassword'));
const BusinessDashboard    = lazy(() => import('./components/BusinessDashboard'));
const TipsGrooming         = lazy(() => import('./components/TipsGrooming'));
const TipsHealth           = lazy(() => import('./components/TipsHealth'));
const TipsTraining         = lazy(() => import('./components/TipsTraining'));
const TipsNutrition        = lazy(() => import('./components/TipsNutrition'));
const ForumPage            = lazy(() => import('./components/ForumPage'));
const ForumPolicy          = lazy(() => import('./components/Legals/ForumPolicy'));
const Terms                = lazy(() => import('./components/Legals/Terms'));
const PrivacyPolicy        = lazy(() => import('./components/Legals/Privacy'));
const Faqpage              = lazy(() => import('./components/Legals/Faqpage'));

const SavedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  return <SavedProvider token={token}>{children}</SavedProvider>;
};

// App content 
function AppContent() {
  const location = useLocation();
  const [isTravelFlowActive, setIsTravelFlowActive] = useState(false);

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
  const showNav        = !isAuthPage && !isBusinessPage && !isDashboard && !isTravelFlowActive;

  return (
    <div className="App">
      <ScrollToTop />
      {showNav && <Navigation />}

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/service-finder" element={<ServiceFinder />} />
          <Route path="/forumpolicy" element={<ForumPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<Faqpage />} />
          <Route path="/activity/:id" element={<ServiceDetailPage />} />
          <Route path="/dog/:dogId" element={<DogProfilePage />} />

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
          <Route path="/about"      element={<About />} />
          <Route path="/contact"    element={<Contact />} />
          <Route path="/forum-page" element={<ForumPage />} />
          <Route path="/admin"      element={<AdminPanel />} />
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
      </Suspense>
    </div>
  );
}

// Root 
function App() {
  return (
    <AuthProvider>
      <SavedWrapper>        
        <Router>
          <AppContent />
        </Router>
      </SavedWrapper>
    </AuthProvider>
  );
}

export default App;