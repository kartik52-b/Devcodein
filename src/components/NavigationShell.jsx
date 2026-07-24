import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const navigationGroups = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Profile', path: '/modules/profile', icon: '👤' },
      { name: 'Leaderboard', path: '/modules/leaderboard', icon: '🏆' },
      { name: 'Daily Missions', path: '/modules/daily-missions', icon: '🎯' },
      { name: 'Habit Tracker', path: '/modules/habit-tracker', icon: '⚡' }
    ]
  },
  {
    title: 'Learning',
    items: [
      { name: 'Roadmaps', path: '/modules/roadmaps', icon: '🗺️' },
      { name: 'Programming Explorer', path: '/modules/programming-explorer', icon: '💻' },
      { name: 'DSA Battle Arena', path: '/modules/dsa-battle', icon: '⚔️' },
      { name: 'Algorithm Visualizer', path: '/modules/algorithm-visualizer', icon: '👁️' },
      { name: 'Complexity Analyzer', path: '/modules/complexity-analyzer', icon: '📊' },
      { name: 'Coding Challenges', path: '/modules/challenges', icon: '🧠' }
    ]
  },
  {
    title: 'AI Workspace',
    items: [
      { name: 'AI Coding Mentor', path: '/modules/ai-mentor', icon: '🤖' }
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', path: '/modules/settings', icon: '⚙️' }
    ]
  }
];

function NavigationShell({ children }) {
  const { activeProfile, profiles, switchProfile, createNewProfile } = useProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);

  return (
    <div className="mx-auto flex max-w-8xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-8 lg:py-6 relative min-h-screen">
      
      {/* Mobile Toggle Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-widest text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs">DV</span>
          DEVVERSE
        </Link>
        
        {/* Mobile profile switcher */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Sidebar (Desktop + Mobile overlay) */}
      <aside className={`glass w-full rounded-[2rem] border border-white/10 p-5 lg:w-72 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:flex lg:flex-col lg:justify-between overflow-y-auto ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="space-y-6">
          <div className="hidden items-center justify-between border-b border-white/5 pb-4 lg:flex">
            <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-[0.2em] text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm">DV</span>
              DEVVERSE
            </Link>
          </div>

          {/* Active Profile Info Header card with switch dropdown */}
          <div className="relative border border-white/10 bg-slate-950/60 p-3.5 rounded-2xl">
            <div
              onClick={() => setShowNavDropdown(!showNavDropdown)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">{activeProfile.avatar}</span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{activeProfile.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Level {activeProfile.level} • {activeProfile.xp} XP</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">▼</span>
            </div>

            {showNavDropdown && (
              <div className="absolute left-0 right-0 mt-3 z-30 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl">
                <p className="px-3 py-1 text-[9px] uppercase font-bold text-slate-500 tracking-wider">Switch Profile</p>
                <div className="space-y-1 mt-1 max-h-36 overflow-y-auto">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setShowNavDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] transition ${
                        activeProfile.id === p.id ? 'bg-indigo-500/20 text-white font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{p.avatar} {p.name}</span>
                      <span className="text-[9px] text-slate-500">Lvl {p.level}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const name = prompt('Enter new profile name:') || 'New Coder';
                      createNewProfile(name);
                      setShowNavDropdown(false);
                    }}
                    className="w-full rounded-xl px-2.5 py-1.5 text-left text-[11px] text-cyan-300 hover:bg-white/5 transition font-semibold"
                  >
                    + Create Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <div className="space-y-5">
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{group.title}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 border-l-2 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 text-white border-cyan-400 shadow-md shadow-indigo-950/20'
                            : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center text-[10px] text-slate-500">
          <Link to="/" className="hover:text-slate-300 transition uppercase tracking-widest font-semibold">Home Platform</Link>
        </div>
      </aside>

      {/* Page Content area */}
      <main className="flex-1 min-h-[calc(100vh-3rem)] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default NavigationShell;
