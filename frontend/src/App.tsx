import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { HealthLog } from './pages/HealthLog';
import { MealPlan } from './pages/MealPlan';
import { AuthPage } from './pages/AuthPage';
import { MedicinePage } from './pages/MedicinePage';
import { FoodsPage } from './pages/FoodsPage';
import { ReportPage } from './pages/ReportPage';
import { Conditions } from './pages/Conditions';
import { Nav } from './components/layout/Nav';
import { Footer } from './components/layout/Footer';
import { PageLoader } from './components/ui/PageLoader';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ConditionalNav = () => {
  const location = useLocation();
  const hidePaths = ['/chat', '/meal-plan', '/health-log', '/profile', '/medicine', '/foods', '/report'];
  if (hidePaths.some(p => location.pathname.startsWith(p))) return null;
  return <Nav />;
};

const ConditionalFooter = () => {
  const location = useLocation();
  const hidePaths = ['/chat', '/meal-plan', '/health-log', '/profile', '/medicine', '/foods', '/report'];
  if (hidePaths.some(p => location.pathname.startsWith(p))) return null;
  return <Footer />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const [loading, setLoading] = useState(true);
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatePresence mode="wait">
        {loading && <PageLoader />}
      </AnimatePresence>

      {!loading && (
        <div className="flex flex-col min-h-screen">
          <ConditionalNav />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/conditions" element={<Conditions />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/health-log" element={<ProtectedRoute><HealthLog /></ProtectedRoute>} />
              <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
              <Route path="/medicine" element={<ProtectedRoute><MedicinePage /></ProtectedRoute>} />
              <Route path="/foods" element={<ProtectedRoute><FoodsPage /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <ConditionalFooter />
        </div>
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
