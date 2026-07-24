import { useMemo } from 'react';

const achievements = [
  '7-day streak',
  'React wizard',
  'Bug hunter',
  'Performance pro'
];

const badges = ['Fast Resolver', 'Consistency King', 'AI Explorer'];

const recentActivity = [
  'Solved Two Sum in 6 min',
  'Optimized a DP solution',
  'Bookmarked Advanced Graph Patterns'
];

const bookmarks = ['System Design Patterns', 'Dynamic Programming', 'TypeScript Tips'];

const leaderboardRows = [
  { rank: 1, name: 'Mina Chen', xp: 18420, country: 'US', trend: '+120' },
  { rank: 2, name: 'Arjun V.', xp: 17980, country: 'IN', trend: '+95' },
  { rank: 3, name: 'Sofia L.', xp: 17110, country: 'UK', trend: '+84' },
  { rank: 4, name: 'You', xp: 16820, country: 'IN', trend: '+64' },
  { rank: 5, name: 'Kai R.', xp: 16240, country: 'CA', trend: '+56' }
];

function ProfileLeaderboard() {
  const xpGraph = useMemo(() => [72, 85, 81, 91, 96, 102, 118], []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Profile & Leaderboard</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Track your growth, showcase your wins, and rise through the ranks.</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-indigo-500 to-cyan-400 text-2xl font-semibold text-white">
                AV
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Developer Profile</p>
                <h3 className="text-2xl font-semibold text-white">Aarav Singh</h3>
                <p className="text-sm text-slate-400">Full-stack builder • 128 days active</p>
              </div>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              Level 19 • 18.6k XP
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/65 p-4">
              <p className="text-sm text-slate-400">Solved problems</p>
              <p className="mt-2 text-2xl font-semibold text-white">142</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/65 p-4">
              <p className="text-sm text-slate-400">Bookmarks</p>
              <p className="mt-2 text-2xl font-semibold text-white">24</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/65 p-4">
              <p className="text-sm text-slate-400">Current streak</p>
              <p className="mt-2 text-2xl font-semibold text-white">9 days</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Achievements</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {achievements.map((item) => (
                  <span key={item} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Badges</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((item) => (
                  <span key={item} className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-sm text-violet-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recent activity</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {recentActivity.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Bookmarks</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {bookmarks.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="glass rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Leaderboard</p>
              <h3 className="text-2xl font-semibold text-white">Global ranking</h3>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              Top 1% globally
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {leaderboardRows.map((entry) => (
              <div key={entry.name} className={`rounded-[1.25rem] border p-4 transition ${entry.name === 'You' ? 'border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-950/40' : 'border-white/10 bg-slate-950/60'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                      #{entry.rank}
                    </div>
                    <div>
                      <p className="font-medium text-white">{entry.name}</p>
                      <p className="text-sm text-slate-400">{entry.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{entry.xp.toLocaleString()} XP</p>
                    <p className="text-sm text-emerald-300">{entry.trend}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">XP graph</p>
                <p className="text-lg font-semibold text-white">Weekly momentum</p>
              </div>
              <div className="text-sm text-emerald-300">+18% this week</div>
            </div>
            <div className="mt-4 flex h-32 items-end gap-2">
              {xpGraph.map((value, index) => (
                <div key={`${value}-${index}`} className="flex-1 rounded-t-[0.75rem] bg-gradient-to-t from-indigo-500 to-cyan-400" style={{ height: `${value}%` }} />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-sm text-slate-400">Global rank</p>
              <p className="mt-1 text-xl font-semibold text-white">#4</p>
            </div>
            <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-sm text-slate-400">Country rank</p>
              <p className="mt-1 text-xl font-semibold text-white">#2</p>
            </div>
            <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-sm text-slate-400">Weekly rank</p>
              <p className="mt-1 text-xl font-semibold text-white">#12</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileLeaderboard;
