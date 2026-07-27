import { useState } from 'react';

const sections = [
  {
    title: 'Home',
    items: ['Overview', 'Why DevVerse']
  },
  {
    title: 'Learn',
    items: ['Programming Language Explorer', 'DSA Battle Arena', 'Algorithm Visualizer', 'Complexity Analyzer']
  },
  {
    title: 'Practice',
    items: ['Coding Challenges', 'Daily Missions', 'Weekly Challenges', 'Contest Arena']
  },
  {
    title: 'AI',
    items: ['AI Coding Mentor', 'AI Code Reviewer', 'AI Debugger', 'AI Roadmap Generator']
  },
  {
    title: 'Dashboard',
    items: ['Coding Habit Tracker', 'Progress Analytics', 'Achievements', 'XP History']
  },
  {
    title: 'Roadmaps',
    items: ['Frontend', 'Backend', 'Full Stack', 'AI', 'DevOps', 'Android', 'Cyber Security']
  },
  {
    title: 'Community',
    items: ['Profile', 'Leaderboard', 'Friends', 'Discussion']
  },
  {
    title: 'Settings',
    items: ['Preferences', 'Integrations', 'Notifications', 'Security']
  }
];

function NavigationShell({ children }) {
  const [activeSection, setActiveSection] = useState('Home');

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:px-8">
      <aside className="glass w-full rounded-[2rem] border border-white/10 p-5 lg:w-72 lg:sticky lg:top-6 lg:h-fit">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">DevVerse</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Learning Navigation</h3>
        </div>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => setActiveSection(section.title)}
                className={`w-full rounded-[1rem] px-3 py-2 text-left text-sm font-medium transition ${activeSection === section.title ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                {section.title}
              </button>
              {activeSection === section.title && (
                <div className="mt-2 space-y-1 pl-3">
                  {section.items.map((item) => (
                    <div key={item} className="rounded-[0.8rem] px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 space-y-6">{children}</div>
    </div>
  );
}

export default NavigationShell;
