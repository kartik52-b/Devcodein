import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Hls from 'hls.js';
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const platformFeatures = [
  { title: 'Programming Explorer', description: 'Explore languages with a focused editor and guided theory.', path: '/modules/programming-explorer', accent: 'from-indigo-500/25 to-cyan-400/20', icon: '💻' },
  { title: 'DSA Battle Arena', description: 'Compare structures and patterns with live visual feedback.', path: '/modules/dsa-battle', accent: 'from-fuchsia-500/25 to-violet-500/20', icon: '⚔️' },
  { title: 'Algorithm Visualizer', description: 'See iteration logic transform into understandable motion.', path: '/modules/algorithm-visualizer', accent: 'from-cyan-500/25 to-sky-500/20', icon: '👁️' },
  { title: 'Complexity Analyzer', description: 'Measure runtime and memory trade-offs without friction.', path: '/modules/complexity-analyzer', accent: 'from-amber-500/25 to-orange-500/20', icon: '📊' },
  { title: 'Coding Challenges', description: 'Practice in curated rooms with hints, explanations, and scoring.', path: '/modules/challenges', accent: 'from-rose-500/25 to-pink-500/20', icon: '🧠' },
  { title: 'AI Coding Mentor', description: 'Get guidance that feels like a senior engineer beside you.', path: '/modules/ai-mentor', accent: 'from-violet-500/25 to-purple-500/20', icon: '🤖' },
  { title: 'Roadmaps', description: 'Move through career paths that unlock the next challenge.', path: '/modules/roadmaps', accent: 'from-emerald-500/25 to-lime-500/20', icon: '🗺️' },
  { title: 'Daily Missions', description: 'Turn consistency into rewards and momentum.', path: '/modules/daily-missions', accent: 'from-amber-400/20 to-yellow-500/20', icon: '🎯' },
  { title: 'Habit Tracker', description: 'Watch your coding rhythm take shape across weeks and months.', path: '/modules/habit-tracker', accent: 'from-teal-400/20 to-emerald-500/20', icon: '⚡' }
];

const careerPaths = [
  { id: 'frontend', title: 'Frontend Engineer', blurb: 'Shape interfaces that feel fast, clear, and alive.', accent: 'from-cyan-400 to-sky-500' },
  { id: 'backend', title: 'Backend Engineer', blurb: 'Build resilient systems and clean API layers.', accent: 'from-violet-500 to-fuchsia-500' },
  { id: 'fullstack', title: 'Full Stack Builder', blurb: 'Bridge product thinking, delivery, and systems design.', accent: 'from-emerald-400 to-lime-500' },
  { id: 'ai', title: 'AI Engineer', blurb: 'Prototype intelligent products with reliable feedback loops.', accent: 'from-indigo-500 to-cyan-400' },
  { id: 'devops', title: 'DevOps Engineer', blurb: 'Own release flow, observability, and dependable delivery.', accent: 'from-amber-500 to-orange-500' },
  { id: 'security', title: 'Cyber Security', blurb: 'Learn to protect systems with practical defensive thinking.', accent: 'from-rose-500 to-red-500' }
];

const pillars = [
  { title: 'Adaptive roadmaps', text: 'Every pathway is designed to unfold into the next milestone at the right moment.' },
  { title: 'Live practice rooms', text: 'Challenges, mentors, and visualizers work together so learning stays active.' },
  { title: 'Progress that stays visible', text: 'XP, streaks, missions, and achievements remain connected across the ecosystem.' }
];

function LandingPage() {
  const { activeProfile, profiles, switchProfile, createNewProfile } = useProfile();
  const { isAuthenticated, user, logout } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('fullstack');
  const videoRef = useRef(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('devverse_has_visited');
    if (!hasVisited) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource('https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8');
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
    }
  }, []);

  const handleSelectOnboardingAarav = () => {
    switchProfile('aarav');
    localStorage.setItem('devverse_has_visited', 'true');
    setShowOnboarding(false);
  };

  const handleSelectOnboardingNew = () => {
    const name = newUsername.trim() || 'Fresh Learner';
    createNewProfile(name);
    localStorage.setItem('devverse_has_visited', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b0a] text-slate-100">
      <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_#070b0a_0%,_rgba(7,11,10,0.92)_30%,_transparent_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_transparent_0%,_rgba(7,11,10,0.4)_45%,_rgba(7,11,10,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-[20%] w-px bg-white/10" />
      <div className="pointer-events-none absolute inset-y-0 left-[50%] w-px bg-white/10" />
      <div className="pointer-events-none absolute inset-y-0 left-[80%] w-px bg-white/10" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(48,197,153,0.28),_rgba(8,22,18,0.08)_70%)] blur-[120px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-[0.2em] text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm">DV</span>
            DEVVERSE
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-300 md:flex">
            <Link to="/modules/challenges" className="transition hover:text-[#5ed29c]">Practice</Link>
            <Link to="/modules/roadmaps" className="transition hover:text-[#5ed29c]">Roadmaps</Link>
            <Link to="/modules/ai-mentor" className="transition hover:text-[#5ed29c]">AI</Link>
            <Link to="/modules/profile" className="transition hover:text-[#5ed29c]">Profile</Link>
            {isAuthenticated ? (
              <>
                <Link to="/modules/profile" className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-cyan-200">{user?.name || 'Profile'}</Link>
                <button onClick={logout} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white">Logout</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white">Login</Link>
                <Link to="/auth" className="rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-3 py-2 font-semibold text-white">Register</Link>
              </>
            )}
          </nav>
          <button onClick={() => setMobileMenuOpen((prev) => !prev)} className="rounded-full border border-white/10 bg-white/10 p-2 text-white md:hidden" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="mx-6 rounded-[1.5rem] border border-white/10 bg-[#070b0a]/90 p-4 text-sm text-slate-200 shadow-2xl md:hidden">
            <div className="flex flex-col gap-3">
              <Link to="/modules/challenges" onClick={() => setMobileMenuOpen(false)}>Practice</Link>
              <Link to="/modules/roadmaps" onClick={() => setMobileMenuOpen(false)}>Roadmaps</Link>
              <Link to="/modules/ai-mentor" onClick={() => setMobileMenuOpen(false)}>AI</Link>
              <Link to="/modules/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/modules/profile" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}

        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-16 pt-4 lg:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">
              <Sparkles size={14} /> What do you want to become?
            </div>
            <h1 className="max-w-4xl text-[40px] font-black leading-[0.9] tracking-[-0.04em] text-white sm:text-[56px] lg:text-[72px]">
              Build your future in the next era of coding.
            </h1>
            <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-white/70">
              DevVerse blends guided roadmaps, live practice, AI support, and progress intelligence into one learning environment built for modern builders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/modules/roadmaps" className="rounded-full bg-[#5ed29c] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#07100c] transition hover:scale-[1.02]">Explore Roadmaps</Link>
              <Link to="/modules/challenges" className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20">Enter Practice Room</Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {careerPaths.map((career) => {
                const isActive = selectedCareer === career.id;
                return (
                  <button key={career.id} onClick={() => setSelectedCareer(career.id)} className={`rounded-[1.1rem] border p-4 text-left transition ${isActive ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-slate-950/50 hover:border-white/20'}`}>
                    <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${career.accent}`} />
                    <h3 className="mt-3 text-sm font-semibold text-white">{career.title}</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-400">{career.blurb}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ml-auto mt-16 max-w-[480px] lg:mt-0">
            <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-[#06120b]/40">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Selected pathway</p>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300">Ready</span>
                </div>
                <div className="mt-5 rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-xl font-semibold text-white">{careerPaths.find((item) => item.id === selectedCareer)?.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{careerPaths.find((item) => item.id === selectedCareer)?.blurb}</p>
                </div>
                <div className="mt-4 space-y-3">
                  {['Interactive learning path', 'Practice challenges and milestones', 'AI mentor support throughout'].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center onboarding-overlay p-4">
          <div className="glass max-w-lg w-full rounded-[2.5rem] border border-white/15 bg-slate-950/90 p-8 space-y-6 text-center shadow-2xl relative animate-slide-up">
            <span className="text-5xl block animate-float">🚀</span>
            <h2 className="text-3xl font-extrabold text-white">Welcome to DevVerse</h2>
            <p className="text-sm text-slate-400 leading-relaxed">Pick a profile to begin your learning journey.</p>
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <button onClick={handleSelectOnboardingAarav} className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5 text-left transition hover:border-indigo-400/50 hover:bg-indigo-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xl">💻</span>
                  <span className="rounded bg-indigo-400/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">Existing</span>
                </div>
                <h4 className="mt-3 font-bold text-white">Aarav Singh</h4>
                <p className="mt-1 text-[11px] text-slate-400">A curated profile with progress, streaks, and achievements.</p>
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                <h4 className="font-bold text-white">New Profile</h4>
                <p className="mt-1 text-[11px] text-slate-400">Start fresh with a zero-state profile and build momentum.</p>
                <input type="text" placeholder="Enter Profile Name..." value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-400/40" />
                <button onClick={handleSelectOnboardingNew} className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 py-2 text-xs font-semibold text-white">Start Fresh</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8 z-10 relative">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="glass rounded-2xl border border-white/5 p-6 card-hover-premium">
              <p className="text-lg font-semibold text-white">{pillar.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 z-10 relative">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300 font-semibold">Core modules</p>
          <h2 className="mt-1 text-3xl font-bold text-white">A focused ecosystem built around momentum.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((feat) => (
            <Link key={feat.title} to={feat.path} className="group glass rounded-2xl border border-white/5 p-6 transition-all duration-300 hover:border-cyan-400/20 hover:-translate-y-1 block space-y-4 card-hover-premium">
              <div className={`h-11 w-11 flex items-center justify-center text-xl rounded-xl bg-gradient-to-br ${feat.accent} group-hover:scale-110 transition-transform`}>{feat.icon}</div>
              <div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
              <span className="text-xs font-semibold text-cyan-400">Open module →</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-white/10 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© 2026 DevVerse. Crafted for modern coding journeys.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Support</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
