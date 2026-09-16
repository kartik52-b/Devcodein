import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialOtp = ['', '', '', '', '', ''];

function AuthPage() {
  const { login, register, verifyOtp, resendOtp, changeEmail, googleSignIn, isLoading, error, success, user, otpPending, otpEmail, isAuthenticated, isEmailVerified } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(initialOtp);
  const [countdown, setCountdown] = useState(300);
  const [, setActiveField] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (!otpPending) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpPending]);

  useEffect(() => {
    if (otpPending && countdown === 0) {
      setOtp(initialOtp);
    }
  }, [countdown, otpPending]);

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const seconds = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleOtpChange = (value, index) => {
    const next = [...otp];
    next[index] = value.replace(/\D/g, '').slice(-1);
    setOtp(next);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
      setActiveField(index + 1);
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      refs.current[index - 1]?.focus();
      setActiveField(index - 1);
    }
  };

  const submitOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    await verifyOtp(code);
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    if (mode === 'login') {
      await login({ email, password });
      return;
    }
    await register({ name, email, password });
  };
  const handleGoogle = async () => {
    await googleSignIn({ email, name });
  };

  const primaryLabel = useMemo(() => (mode === 'login' ? 'Log in to DevVerse' : 'Create your DevVerse account'), [mode]);

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-10 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            <ShieldCheck size={14} /> Secure access
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">A protected gateway for every learning journey.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">DevVerse pairs modern authentication with an extra verification layer so your profile, streak, and achievements stay protected.</p>
          <div className="mt-8 space-y-3">
            {[
              'Password hashing and server-side verification',
              'OTP sent through a secure email channel',
              'Protected profile hydration after login'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
          {!isAuthenticated || !isEmailVerified ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Authentication</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{primaryLabel}</h2>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                  {isLoading ? 'Working…' : 'Live'}
                </div>
              </div>

              {otpPending ? (
                <div className="mt-8 rounded-[1.5rem] border border-cyan-400/20 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Verify your email</p>
                      <p className="mt-1 text-sm text-slate-400">A secure 6-digit code was sent to <span className="text-cyan-300">{otpEmail || user?.email || email}</span>.</p>
                    </div>
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">{formatTime(countdown)}</div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => (refs.current[index] = element)}
                        value={digit}
                        maxLength={1}
                        onChange={(event) => handleOtpChange(event.target.value, index)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        onFocus={() => setActiveField(index)}
                        className="h-14 w-12 rounded-2xl border border-white/10 bg-white/5 text-center text-xl font-semibold text-white outline-none focus:border-cyan-400/40"
                      />
                    ))}
                  </div>

                  <button onClick={submitOtp} disabled={otp.join('').length !== 6 || isLoading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                    {isLoading ? 'Verifying…' : 'Verify code'} <ArrowRight size={16} />
                  </button>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                    <button onClick={() => resendOtp()} className="text-cyan-300">Resend code</button>
                    <button onClick={() => changeEmail(email || user?.email)} className="text-slate-400">Change email</button>
                  </div>
                </div>
              ) : (
                <form className="mt-8 space-y-4" onSubmit={submitAuth}>
                  {mode === 'register' && (
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-500">Full name</label>
                      <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40" placeholder="Aarav Singh" />
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-500">Email address</label>
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40" placeholder="you@devverse.dev" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-500">Password</label>
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40" placeholder="At least 8 characters" />
                  </div>

                  {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">{error}</p> : null}
                  {success ? <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">{success}</p> : null}

                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-white">
                    {isLoading ? 'Please wait…' : mode === 'login' ? 'Continue with email' : 'Create account'} <ArrowRight size={16} />
                  </button>
                </form>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button onClick={handleGoogle} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"> <Sparkles size={16} /> Continue with Google</button>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span>{mode === 'login' ? 'Need an account?' : 'Already have one?'}</span>
                  <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-cyan-300">{mode === 'login' ? 'Register' : 'Sign in'}</button>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-cyan-400/20 bg-slate-950/70 p-6 text-center">
              <Mail size={28} className="mx-auto text-cyan-300" />
              <h3 className="mt-3 text-xl font-semibold text-white">You are verified and ready.</h3>
              <p className="mt-2 text-sm text-slate-400">Your profile is now protected and loaded into DevVerse.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
