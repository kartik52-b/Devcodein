import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ModuleRoutes from './pages/ModuleRoutes';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { PublicOnly, RequireAuth } from './components/RequireAuth';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Decorative pointer glow — skip the listener when motion is reduced.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return undefined;

    const onMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip text-slate-200">
      <a
 href="#main-content"
 className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Skip to main content
      </a>

      <div className="mouse-glow" style={{ left: mousePosition.x, top: mousePosition.y }} aria-hidden="true" />

      <SiteHeader />

      <main id="main-content" className="relative z-10 flex-1">
        <Routes>
          {/* ------------------------------------------------ public */}
          <Route path="/" element={<LandingPage />} />
          <Route
 path="/auth"
            element={
              <PublicOnly>
                <AuthPage />
              </PublicOnly>
            }
          />
          <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth?mode=forgot" replace />} />
          <Route path="/verify-otp" element={<Navigate to="/auth?mode=verify-email" replace />} />
          {/* Recovery links land here with a short-lived session; signed-in
              visitors must be allowed through, so this route is outside
              <PublicOnly>. */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* --------------------------------------- protected area */}
          <Route
 path="/*"
            element={
              <RequireAuth>
                <ModuleRoutes />
              </RequireAuth>
            }
          />
        </Routes>
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

export default App;
