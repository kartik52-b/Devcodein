import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard for authenticated areas.
 *
 * - Unauthenticated visitors are sent to /auth with `returnTo` preserved so
 *   they land back where they intended.
 * - While the stored token is being validated we show a neutral shell instead
 *   of flashing the sign-in page.
 * - Signed-in users never see /auth (handled by <PublicOnly>).
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        <span className="animate-pulse">Restoring your session…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children ?? <Outlet />;
}

/** Redirects already-authenticated visitors away from login/register. */
export function PublicOnly({ children }) {
  const { isAuthenticated, isBootstrapping, otpPending } = useAuth();
  const location = useLocation();

  if (isBootstrapping) return null;

  // A signed-in learner who still has to confirm their email must stay here.
  if (isAuthenticated && otpPending) return children;

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo');
    const safeReturn =
      returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/dashboard';
    return <Navigate to={safeReturn} replace />;
  }

  return children;
}

export default RequireAuth;
