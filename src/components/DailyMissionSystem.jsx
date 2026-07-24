import { useMemo, useState } from 'react';

const todayMissions = [
  { title: 'Solve 2 coding challenges', xp: 180, completed: true },
  { title: 'Review one algorithm', xp: 120, completed: true },
  { title: 'Ship one small improvement', xp: 220, completed: false }
];

const weeklyMissions = [
  { title: 'Maintain 5-day streak', xp: 500, completed: false },
  { title: 'Finish 3 mentor sessions', xp: 350, completed: true },
  { title: 'Publish one project update', xp: 400, completed: false }
];

const missionHistory = [
  { label: 'Completed React challenge', time: '2h ago', reward: '+180 XP' },
  { label: 'Claimed weekly milestone', time: 'Yesterday', reward: '+500 XP' },
  { label: 'Unlocked bug hunter badge', time: '2 days ago', reward: 'Badge' }
];

function DailyMissionSystem() {
  const [claimed, setClaimed] = useState(false);
  const totalXp = useMemo(() => todayMissions.reduce((sum, mission) => sum + mission.xp, 0), []);
  const completedCount = todayMissions.filter((mission) => mission.completed).length;
  const progress = Math.round((completedCount / todayMissions.length) * 100);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Daily Mission System</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Turn your daily practice into a rewarding streak of progress.</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Today&apos;s mission</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Stay in motion</h3>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              {progress}% complete
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-slate-950/70">
              <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="url(#missionGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={301.59}
                  strokeDashoffset={301.59 * (1 - progress / 100)}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="missionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-semibold text-white">{progress}%</p>
                <p className="text-sm text-slate-400">done</p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {todayMissions.map((mission) => (
                <div key={mission.title} className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{mission.title}</p>
                      <p className="text-sm text-slate-400">+{mission.xp} XP</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-sm ${mission.completed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-slate-300'}`}>
                      {mission.completed ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Mission timer</p>
                <p className="mt-2 text-xl font-semibold text-white">02:18:36</p>
              </div>
              <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-sm text-violet-200">
                Focus sprint
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Weekly mission</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Build momentum</h3>
            </div>
            <button
              onClick={() => setClaimed(true)}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              {claimed ? 'Claimed' : 'Claim reward'}
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {weeklyMissions.map((mission) => (
              <div key={mission.title} className="rounded-[1.25rem] border border-white/10 bg-slate-950/65 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{mission.title}</p>
                    <p className="text-sm text-slate-400">Reward: +{mission.xp} XP</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm ${mission.completed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-slate-300'}`}>
                    {mission.completed ? 'Done' : 'In progress'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Achievements</p>
                <p className="mt-2 text-lg font-semibold text-white">3 unlocked this week</p>
              </div>
              <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
                +{totalXp} XP total
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Mission history</p>
            <div className="mt-3 space-y-3">
              {missionHistory.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </div>
                  <span className="text-sm text-cyan-200">{item.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DailyMissionSystem;
