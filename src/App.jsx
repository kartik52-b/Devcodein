import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ModuleRoutes from './pages/ModuleRoutes';
import AuthPage from './pages/AuthPage';
import { PublicOnly, RequireAuth } from './components/RequireAuth';
import { useAuth } from './context/AuthContext';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isAuthenticated, user, logout, isBootstrapping } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="mouse-glow" style={{ left: mousePosition.x, top: mousePosition.y }} />
      <div className="relative z-10">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-[0.2em] text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm">DV</span>
            DEVVERSE
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link to="/" className="transition hover:text-white">Home</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
            ) : null}
            <Link to="/modules/programming-explorer" className="transition hover:text-white">Learn</Link>
            <Link to="/modules/practice" className="transition hover:text-white">Practice</Link>
            <Link to="/modules/ai-mentor" className="transition hover:text-white">AI</Link>
            <Link to="/modules/leaderboard" className="transition hover:text-white">Leaderboard</Link>
            <Link to="/modules/community" className="transition hover:text-white">Community</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isBootstrapping ? (
              <span className="text-sm text-slate-400">Restoring…</span>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/modules/profile"
                  className="hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 sm:inline-flex"
                >
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur transition hover:bg-white/20"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>

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
          <Route path="/verify-otp" element={<Navigate to="/auth?mode=verify-otp" replace />} />

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
      </div>
    </div>
  );
}

export default App;
