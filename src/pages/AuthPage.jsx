import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MODES = ['login', 'register', 'forgot', 'verify-email'];

const parseMode = (value) => {
  if (value === 'register' || value === 'signup') return 'register';
  if (value === 'forgot' || value === 'reset') return 'forgot';
  if (value === 'verify-email' || value === 'verify-otp') return 'verify-email';
  return MODES.includes(value) ? value : 'login';
};

/** Official multicolour Google "G" — no external asset request. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.0364-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9636 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573A8.9965 8.9965 0 000 9c0 1.4523.3477 2.8268.9573 4.0418L3.9636 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}

function AuthPage() {
  const {
    authProvider,
    login,
    register,
    resetPassword,
    resendVerification,
    verifyOtp,
    resendOtp,
    changeEmail,
    googleSignIn,
    isLoading,
    error,
    success,
    user,
    otpPending,
    otpEmail,
    devOtp,
    otpDelivery,
    isAuthenticated,
    isEmailVerified
  } = useAuth();

  const isSupabase = authProvider === 'supabase';
  const [params] = useSearchParams();
  const [mode, setMode] = useState(() => parseMode(params.get('mode')));
  const [name, setName] = useState('');
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [googlePending, setGooglePending] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300);
  const otpRefs = useRef([]);

  // Deep links such as /forgot-password land on /auth?mode=forgot; keep the
  // visible mode in sync when the query string changes.
  useEffect(() => {
    setMode(parseMode(params.get('mode')));
    setFieldErrors({});
  }, [params]);

  useEffect(() => {
    const pendingEmail = params.get('email') || otpEmail;
    if (pendingEmail && !email) setEmail(pendingEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpEmail]);

  useEffect(() => {
    if (!otpPending) return undefined;
    const interval = setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [otpPending]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const seconds = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const validate = () => {
    const next = {};
    const emailValue = email.trim();

    if (!emailValue) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(emailValue)) next.email = 'Enter a valid email address.';

    if (mode === 'register') {
      if (name.trim().length < 2) next.name = 'Enter your full name.';
      if (password.length < 8) next.password = 'Use at least 8 characters.';
      if (confirm !== password) next.confirm = 'Passwords do not match.';
    }

    if (mode === 'login' && password.length < 1) next.password = 'Enter your password.';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password, remember });
      } else if (mode === 'register') {
        await register({ name: name.trim(), email: email.trim(), password });
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
      }
    } catch {
      // The provider already published a friendly message through `error`.
    }
  };

  const handleGoogle = async () => {
    if (isLoading || googlePending) return;
    setGooglePending(true);
    try {
      await googleSignIn();
    } finally {
      setGooglePending(false);
    }
  };

  // ------------------------------------------------------- OTP helpers (legacy)
  const handleOtpChange = (value, index) => {
    const next = [...otp];
    next[index] = value.replace(/\D/g, '').slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    try {
      await verifyOtp(code);
    } catch {
      /* message already surfaced */
    }
  };

  const showVerifyPanel = isSupabase
    ? mode === 'verify-email' || (isAuthenticated && !isEmailVerified && otpPending)
    : otpPending;

  const heading =
    mode === 'register'
      ? 'Create your DevVerse account'
      : mode === 'forgot'
        ? 'Reset your password'
        : mode === 'verify-email'
          ? 'Confirm your email'
          : 'Log in to DevVerse';

  const emailValue = email || otpEmail || user?.email || '';

  return (
    <div className="min-h-[70vh] px-4 py-10 text-slate-200 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass rounded-2xl border border-white/10 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-label text-cyan-300">
            <ShieldCheck size={14} aria-hidden="true" /> Secure access
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
            A protected gateway for every learning journey.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            DevVerse keeps your profile, streak and achievements behind a verified account so your progress
            stays yours.
          </p>
          <div className="mt-8 space-y-3">
            {[
              isSupabase
                ? 'Google sign-in and email passwords handled by Supabase Auth'
                : 'Password hashing and server-side verification',
              'Email verification before your dashboard unlocks',
              isSupabase
                ? 'Row Level Security: you can only read and edit your own profile'
                : 'Protected profile hydration after login'
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
              >
                <CheckCircle2 size={16} className="text-cyan-300" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
          {isSupabase ? (
            <p className="mt-6 text-xs leading-6 text-slate-400">
              We never see or store your Google password, and passwords are hashed by the authentication
              provider — never saved in the profiles table.
            </p>
          ) : null}
        </section>

        <section className="glass rounded-2xl border border-white/10 p-6 md:p-8">
          {showVerifyPanel ? (
            <div className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-label text-slate-400">Almost there</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Verify your email</h2>
                </div>
                {!isSupabase ? (
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                    {formatTime(countdown)}
                  </div>
                ) : null}
              </div>

              {isSupabase ? (
                <>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    We sent a confirmation link to{' '}
                    <span className="font-semibold text-cyan-300">{emailValue || 'your inbox'}</span>. Open it
                    on this device to activate your account, then sign in.
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => resendVerification(emailValue).catch(() => {})}
                      disabled={isLoading}
                      className="btn btn-secondary btn-lg w-full"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                      {isLoading ? 'Sending…' : 'Resend verification link'}
                    </button>
                    <button type="button" onClick={() => switchMode('login')} className="btn btn-ghost w-full">
                      <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-400">
                    A 6-digit code was sent to <span className="text-cyan-300">{otpEmail || email}</span>.
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => (otpRefs.current[index] = element)}
                        value={digit}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        aria-label={`Digit ${index + 1}`}
                        onChange={(event) => handleOtpChange(event.target.value, index)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        className="text-input h-14 w-12 !px-0 text-center text-xl font-semibold"
                      />
                    ))}
                  </div>

                  {otpDelivery === 'development' && devOtp ? (
                    <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-300">
                      <p className="font-semibold">Development notice</p>
                      <p className="mt-2">
                        Email delivery is not configured on this server. Your code is{' '}
                        <button
                          type="button"
                          onClick={() => setOtp(devOtp.split(''))}
                          className="font-mono text-base font-bold underline decoration-dotted"
                        >
                          {devOtp}
                        </button>
                        .
                      </p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={submitOtp}
                    disabled={otp.join('').length !== 6 || isLoading}
                    className="btn btn-primary btn-lg mt-6 w-full"
                  >
                    {isLoading ? 'Verifying…' : 'Verify code'} <ArrowRight size={16} aria-hidden="true" />
                  </button>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                    <button type="button" onClick={() => resendOtp().catch(() => {})} className="text-cyan-300">
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => changeEmail(email || user?.email).catch(() => {})}
                      className="text-slate-400"
                    >
                      Change email
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-label text-slate-400">
                    {mode === 'forgot' ? 'Recovery' : 'Authentication'}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{heading}</h2>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                  {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
                  {isLoading ? 'Working…' : 'Live'}
                </span>
              </div>

              {mode === 'forgot' ? (
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Enter the email you signed up with and we will send a secure reset link. The link expires
                  after one hour.
                </p>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="mt-5 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300"
                >
                  {error}
                </p>
              ) : null}
              {success ? (
                <p
                  role="status"
                  className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
                >
                  {success}
                </p>
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                {mode === 'register' ? (
                  <div>
                    <label htmlFor="auth-name" className="mb-2 block text-sm font-medium text-slate-300">
                      Full name
                    </label>
                    <input
                      id="auth-name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      aria-invalid={fieldErrors.name ? 'true' : 'false'}
                      aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined}
                      className="text-input"
                      placeholder="Aarav Singh"
                    />
                    {fieldErrors.name ? (
                      <p id="auth-name-error" className="mt-2 text-sm text-rose-300">
                        {fieldErrors.name}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-slate-300">
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={fieldErrors.email ? 'true' : 'false'}
                    aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
                    className="text-input"
                    placeholder="you@devverse.dev"
                  />
                  {fieldErrors.email ? (
                    <p id="auth-email-error" className="mt-2 text-sm text-rose-300">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                {mode !== 'forgot' ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor="auth-password" className="block text-sm font-medium text-slate-300">
                        Password
                      </label>
                      {mode === 'login' ? (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                        >
                          Forgot password?
                        </button>
                      ) : null}
                    </div>
                    <div className="relative">
                      <input
                        id="auth-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={fieldErrors.password ? 'true' : 'false'}
                        aria-describedby={
                          fieldErrors.password ? 'auth-password-error' : mode === 'register' ? 'auth-password-hint' : undefined
                        }
                        className="text-input pr-12"
                        placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-2 text-slate-400 transition hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff size={18} aria-hidden="true" />
                        ) : (
                          <Eye size={18} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p id="auth-password-error" className="mt-2 text-sm text-rose-300">
                        {fieldErrors.password}
                      </p>
                    ) : mode === 'register' ? (
                      <p id="auth-password-hint" className="mt-2 text-xs text-slate-400">
                        Use 8 or more characters. A passphrase works well.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {mode === 'register' ? (
                  <div>
                    <label htmlFor="auth-confirm" className="mb-2 block text-sm font-medium text-slate-300">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="auth-confirm"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        aria-invalid={fieldErrors.confirm ? 'true' : 'false'}
                        aria-describedby={fieldErrors.confirm ? 'auth-confirm-error' : undefined}
                        className="text-input pr-12"
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((visible) => !visible)}
                        aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                        aria-pressed={showConfirm}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-2 text-slate-400 transition hover:text-white"
                      >
                        {showConfirm ? (
                          <EyeOff size={18} aria-hidden="true" />
                        ) : (
                          <Eye size={18} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirm ? (
                      <p id="auth-confirm-error" className="mt-2 text-sm text-rose-300">
                        {fieldErrors.confirm}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {mode === 'login' && isSupabase ? (
                  <label htmlFor="auth-remember" className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      id="auth-remember"
                      name="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded-sm border border-white/20 bg-slate-950 accent-cyan-400"
                    />
                    Keep me signed in on this device
                  </label>
                ) : null}

                <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
                  {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                  {isLoading
                    ? mode === 'login'
                      ? 'Signing in…'
                      : mode === 'register'
                        ? 'Creating account…'
                        : 'Sending link…'
                    : mode === 'login'
                      ? 'Sign in with email'
                      : mode === 'register'
                        ? 'Create account'
                        : 'Send reset link'}
                  {!isLoading ? <ArrowRight size={16} aria-hidden="true" /> : null}
                </button>
              </form>

              {mode !== 'forgot' ? (
                <>
                  <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-white/10" />
                    or
                    <span className="h-px flex-1 bg-white/10" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={isLoading || googlePending}
                    className="btn btn-secondary btn-lg w-full"
                  >
                    {googlePending ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <GoogleIcon />
                    )}
                    {googlePending ? 'Opening Google…' : 'Continue with Google'}
                  </button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                    Google opens its own secure sign-in page. DevVerse never sees your Google password.
                  </p>
                </>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
                {mode === 'forgot' ? (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-2 font-semibold text-cyan-300"
                  >
                    <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
                  </button>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Need an account?' : 'Already have one?'}</span>
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                      className="font-semibold text-cyan-300"
                    >
                      {mode === 'login' ? 'Create one' : 'Sign in'}
                    </button>
                  </>
                )}
              </div>

              {isSupabase ? (
                <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                  <MailCheck size={14} aria-hidden="true" />
                  Email delivery can take a minute — check spam if it does not arrive.
                </p>
              ) : null}

              {mode === 'verify-email' && !showVerifyPanel ? (
                <Link to="/auth" className="mt-4 block text-center text-sm text-cyan-300">
                  Back to sign in
                </Link>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
