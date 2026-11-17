import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Password recovery landing page.
 *
 * Supabase redirects the recovery email here with a short-lived session. Once
 * the client has exchanged it (detectSessionInUrl), the visitor may set a new
 * password. Without a valid recovery session the page explains how to request
 * a fresh link instead of showing a form that cannot work.
 */
function ResetPasswordPage() {
  const { isAuthenticated, isBootstrapping, passwordRecovery, updatePassword, isLoading, error, success } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const hasRecoverySession = Boolean(passwordRecovery || isAuthenticated);

  useEffect(() => {
    if (success && hasRecoverySession) {
      const timer = setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success, hasRecoverySession, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (confirm !== password) next.confirm = 'Passwords do not match.';
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await updatePassword(password);
    } catch {
      /* provider surfaces the message */
    }
  };

  return (
    <div className="min-h-[70vh] px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-label text-cyan-300">
            <ShieldCheck size={14} aria-hidden="true" /> Account recovery
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">Choose a new password</h1>

          {isBootstrapping ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Validating your reset link…
            </p>
          ) : hasRecoverySession ? (
            <>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Pick something you have not used before. You will stay signed in on this device after saving.
              </p>

              {error ? (
                <p
                  role="alert"
                  className="mt-6 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300"
                >
                  {error}
                </p>
              ) : null}
              {success ? (
                <p
                  role="status"
                  className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
                >
                  <CheckCircle2 size={16} aria-hidden="true" /> {success}
                </p>
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-300">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={fieldErrors.password ? 'true' : 'false'}
                      aria-describedby={fieldErrors.password ? 'new-password-error' : 'new-password-hint'}
                      className="text-input pr-12"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-2 text-slate-400 transition hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p id="new-password-error" className="mt-2 text-sm text-rose-300">
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <p id="new-password-hint" className="mt-2 text-xs text-slate-400">
                      Use 8 or more characters. A passphrase works well.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-300">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      aria-invalid={fieldErrors.confirm ? 'true' : 'false'}
                      aria-describedby={fieldErrors.confirm ? 'confirm-password-error' : undefined}
                      className="text-input pr-12"
                      placeholder="Repeat your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((visible) => !visible)}
                      aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                      aria-pressed={showConfirm}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-2 text-slate-400 transition hover:text-white"
                    >
                      {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.confirm ? (
                    <p id="confirm-password-error" className="mt-2 text-sm text-rose-300">
                      {fieldErrors.confirm}
                    </p>
                  ) : null}
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
                  {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                  {isLoading ? 'Saving…' : 'Save new password'}
                  {!isLoading ? <ArrowRight size={16} aria-hidden="true" /> : null}
                </button>
              </form>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-6">
              <p className="text-sm leading-7 text-amber-300">
                This reset link is invalid or has expired. Reset links can only be used once and expire after
                an hour.
              </p>
              <Link to="/auth?mode=forgot" className="btn btn-primary mt-6 w-full">
                Request a new link
              </Link>
              <Link to="/auth" className="btn btn-ghost mt-2 w-full">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
