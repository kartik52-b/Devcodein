import { useMemo, useState } from 'react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const contributionData = [
  { day: 'Mon', value: 3 },
  { day: 'Tue', value: 5 },
  { day: 'Wed', value: 2 },
  { day: 'Thu', value: 7 },
  { day: 'Fri', value: 4 },
  { day: 'Sat', value: 6 },
  { day: 'Sun', value: 8 }
];

const achievements = [
  { title: 'Week Warrior', detail: '7-day streak achieved' },
  { title: 'Problem Solver', detail: '25 problems solved' },
  { title: 'Deep Focus', detail: '10 hours in one week' }
];

const badges = ['Consistency', 'Night Owl', 'Ship Mode'];

function HabitTracker() {
  const [selectedRange, setSelectedRange] = useState('Weekly');

  const stats = useMemo(() => {
    const total = contributionData.reduce((sum, item) => sum + item.value, 0);
    const average = Math.round(total / contributionData.length);
    return { total, average };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Coding habit tracker</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">A GitHub-inspired rhythm board for your craft.</h2>
        </div>
        <p className="max-w-2xl text-slate-400">Track your daily streak, weekly momentum, monthly consistency, and the habits that compound into mastery.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['Weekly', 'Monthly'].map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`rounded-full px-4 py-2 text-sm transition ${selectedRange === range ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-indigo-950/40">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Contribution graph</p>
              <p className="text-lg font-semibold text-white">{selectedRange} activity</p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">{stats.total} contributions</div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
              {days.map((day) => <span key={day} className="w-10 text-center">{day}</span>)}
            </div>
            <div className="flex gap-2">
              {contributionData.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-xl transition-all duration-500 ${item.value > 6 ? 'bg-gradient-to-br from-emerald-400 to-cyan-400' : item.value > 4 ? 'bg-gradient-to-br from-indigo-400 to-violet-400' : 'bg-slate-800'}`} style={{ opacity: 0.6 + item.value / 10 }} />
                  <span className="text-xs text-slate-500">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[1.75rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Daily streak</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-4xl font-semibold text-white">14 days</p>
                <p className="mt-2 text-sm text-slate-400">Keep the momentum alive</p>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">On fire</div>
            </div>
          </div>

          <div className="glass rounded-[1.75rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Weekly report</p>
            <div className="mt-4 space-y-3">
              {[
                ['Solved problems', '12'],
                ['Hours coded', '18h'],
                ['Average focus', '92%']
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Monthly report</p>
          <div className="mt-4 space-y-4">
            {[
              ['Completion rate', '87%'],
              ['Consistency', '93%'],
              ['Focus score', '95%']
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Achievements</p>
          <div className="mt-4 space-y-3">
            {achievements.map((item) => (
              <div key={item.title} className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-3">
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Badges</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div key={badge} className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">{badge}</div>
            ))}
          </div>
          <div className="mt-6 rounded-[1rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Average focus</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.average}%</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HabitTracker;
