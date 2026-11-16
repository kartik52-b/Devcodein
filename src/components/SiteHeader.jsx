import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/modules/programming-explorer', label: 'Learn' },
  { to: '/modules/practice', label: 'Practice' },
  { to: '/modules/ai-mentor', label: 'AI' },
  { to: '/modules/leaderboard', label: 'Leaderboard' },
  { to: '/modules/community', label: 'Community' }
];

function navLinkClass({ isActive }) {
  return [
    'rounded-sm px-1 py-1 text-sm transition',
    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
  ].join(' ');
}

function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isBootstrapping } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Route changes must never leave the mobile panel open.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="relative z-20 mx-auto max-w-7xl px-6 py-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link
 to="/"
 className="flex items-center gap-3 rounded-sm text-lg font-semibold text-white"
 aria-label="DevVerse home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm">
            DV
          </span>
          DevVerse
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {isBootstrapping ? (
            <span className="hidden text-sm text-slate-400 sm:inline">Restoring…</span>
          ) : isAuthenticated ? (
            <>
              <Button
 to="/modules/profile"
 variant="secondary"
 className="hidden sm:inline-flex"
              >
                {user?.name?.split(' ')[0] || 'Profile'}
              </Button>
              <Button variant="tertiary" onClick={handleLogout} className="hidden sm:inline-flex">
                Sign out
              </Button>
            </>
          ) : (
            <Button to="/auth" variant="secondary" className="hidden sm:inline-flex">
              Sign in
            </Button>
          )}

          <Button
 variant="tertiary"
 size="icon"
 className="md:hidden"
            aria-expanded={isMenuOpen}
 aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
 id="mobile-navigation"
 className="glass mt-4 rounded-md p-4 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-sm px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <NavLink
 to="/dashboard"
 className="rounded-sm px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </NavLink>
            ) : null}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <>
                <Button to="/modules/profile" variant="secondary" className="w-full">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Button>
                <Button variant="tertiary" className="w-full" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button to="/auth" variant="primary" className="w-full">
                Sign in
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default SiteHeader;
