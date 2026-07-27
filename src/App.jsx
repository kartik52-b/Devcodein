import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ModuleRoutes from './pages/ModuleRoutes';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <Link to="/modules/programming-explorer" className="transition hover:text-white">Learn</Link>
            <Link to="/modules/practice" className="transition hover:text-white">Practice</Link>
            <Link to="/modules/ai-mentor" className="transition hover:text-white">AI</Link>
            <Link to="/modules/community" className="transition hover:text-white">Community</Link>
          </nav>
          <a href="#cta" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20">
            Join waitlist
          </a>
        </header>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/*" element={<ModuleRoutes />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
