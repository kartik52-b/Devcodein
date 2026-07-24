import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import ModuleRoutes from './pages/ModuleRoutes';
import AuthPage from './pages/AuthPage';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isAuthenticated, isEmailVerified } = useAuth();

  useEffect(() => {
    const onMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      {/* Interactive mouse background glow overlay */}
      <div className="mouse-glow" style={{ left: mousePosition.x, top: mousePosition.y }} />
      
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={isAuthenticated && !isEmailVerified ? <AuthPage /> : isAuthenticated ? <Navigate to="/modules/profile" replace /> : <AuthPage />} />
          <Route path="/*" element={<ModuleRoutes />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
