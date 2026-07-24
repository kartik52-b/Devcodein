import { useState, useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';

// Generates base grid dates (last 18 weeks)
const generateGridDays = () => {
  const days = [];
  const baseDate = new Date(2026, 3, 1); // April 1, 2026
  
  for (let week = 0; week < 18; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(baseDate.getTime() + (week * 7 + day) * 24 * 60 * 60 * 1000);
      weekData.push({
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    days.push(weekData);
  }
  return days;
};

const initialAchievements = [
  { id: 1, title: 'Code Voyager', desc: 'Code for 10 consecutive days.', completed: true, icon: '🚀' },
  { id: 2, title: 'Midnight Oils', desc: 'Log code hours between 12 AM and 4 AM.', completed: true, icon: '🌌' },
  { id: 3, title: 'Weekly Century', desc: 'Code for more than 15 hours in a single week.', completed: false, icon: '💯' },
  { id: 4, title: 'Consistency Overload', desc: 'No empty slots in a full monthly calendar.', completed: false, icon: '🔥' }
];

function CodingHabitTrackerPage() {
  const { activeProfile, updateActiveProfile } = useProfile();
  
  const [achievements, setAchievements] = useState(initialAchievements);
  const [logHours, setLogHours] = useState('1');
  const [hoveredCell, setHoveredCell] = useState(null);

  const gridWeeks = useMemo(() => generateGridDays(), []);

  // Compute contribution metrics dynamically based on global active profile
  const computedContributionsGrid = useMemo(() => {
    return gridWeeks.map(week => {
      return week.map(dayObj => {
        // Find if this user has contributions on this date
        const match = activeProfile.contributions.find(c => c.date === dayObj.dateStr);
        return {
          date: dayObj.dateStr,
          day: dayObj.dayName,
          level: match ? match.level : 0,
          hours: match ? match.hours : 0
        };
      });
    });
  }, [gridWeeks, activeProfile.contributions]);

  // Aggregate total statistics
  const stats = useMemo(() => {
    let totalHours = 0;
    let totalDays = 0;
    activeProfile.contributions.forEach(c => {
      totalHours += c.hours;
      if (c.level > 0) totalDays += 1;
    });

    // Default stats if new user
    if (activeProfile.xp === 0 && totalHours === 0) {
      return { totalHours: 0, totalDays: 0, avgFocus: 0 };
    }

    return {
      totalHours: Math.round(totalHours),
      totalDays,
      avgFocus: 92
    };
  }, [activeProfile.contributions, activeProfile.xp]);

  const handleLogActivity = () => {
    const hours = parseFloat(logHours);
    if (isNaN(hours) || hours <= 0) return;

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    updateActiveProfile((prev) => {
      const contributionsCopy = [...prev.contributions];
      const matchIndex = contributionsCopy.findIndex((c) => c.date === todayStr);

      let nextLevel = 1;
      let newHours = hours;

      if (matchIndex > -1) {
        newHours = contributionsCopy[matchIndex].hours + hours;
        if (newHours > 4) nextLevel = 3;
        else if (newHours > 2) nextLevel = 2;

        contributionsCopy[matchIndex] = {
          ...contributionsCopy[matchIndex],
          hours: newHours,
          level: nextLevel
        };
      } else {
        if (newHours > 4) nextLevel = 3;
        else if (newHours > 2) nextLevel = 2;

        contributionsCopy.push({
          date: todayStr,
          level: nextLevel,
          hours: newHours
        });
      }

      // Increment streak
      const nextStreak = prev.streak + 1;
      const nextLongest = Math.max(prev.longestStreak, nextStreak);

      return {
        ...prev,
        contributions: contributionsCopy,
        streak: nextStreak,
        longestStreak: nextLongest,
        recentActivity: [`Logged ${hours} hrs code time`, ...prev.recentActivity].slice(0, 10),
        history: [
          { id: Date.now(), label: `Logged ${hours} hours practice`, time: 'Just now', reward: '+50 XP' },
          ...prev.history
        ],
        xp: prev.xp + 50, // award minor XP for logging hours!
        level: Math.floor((prev.xp + 50) / 1000) + 1
      };
    });

    setLogHours('1');
    alert(`Logged ${hours} hours successfully! Streak updated.`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100">
      {/* Header Section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Analytics Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Coding Habit Tracker</h1>
            <p className="mt-2 text-slate-400">Establish long-term coding rhythms. Visualize consistency using heatmaps and tracking analytics.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-950/60 rounded-2xl border border-white/10 p-4 shrink-0">
            <div className="h-10 w-10 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded-full animate-streak-glow text-xl">
              🔥
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Current Streak</p>
              <p className="text-xl font-bold text-white">{activeProfile.streak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing heatmap & controls */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* Heatmap module */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">GitHub-style Contribution Grid</h3>
              <p className="text-xs text-slate-400">Track commit and problem-solving velocity.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-slate-800" />
              <div className="h-3 w-3 rounded-sm bg-indigo-950" />
              <div className="h-3 w-3 rounded-sm bg-indigo-500" />
              <div className="h-3 w-3 rounded-sm bg-cyan-400" />
              <span>More</span>
            </div>
          </div>

          {/* Grid display scroll container */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-1 min-w-[500px]">
              {/* Day Labels Column */}
              <div className="flex flex-col justify-between text-[10px] text-slate-500 pr-2 pt-1 h-28">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>
              
              {/* Contribution matrix */}
              <div className="flex-1 flex gap-[3px]">
                {computedContributionsGrid.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((cell, dIdx) => {
                      let colorClass = 'bg-slate-800 hover:bg-slate-700';
                      if (cell.level === 1) colorClass = 'bg-indigo-950 border border-indigo-900';
                      if (cell.level === 2) colorClass = 'bg-indigo-600 border border-indigo-500';
                      if (cell.level === 3) colorClass = 'bg-cyan-400 border border-cyan-300';
                      
                      return (
                        <div
                          key={dIdx}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`h-3.5 w-3.5 rounded-[3px] transition-all cursor-pointer ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hover display status */}
          <div className="min-h-[24px] text-xs text-slate-400 mt-2">
            {hoveredCell ? (
              <span><strong>{hoveredCell.date}</strong>: {hoveredCell.hours} hrs of logged practice</span>
            ) : (
              <span className="italic">Hover over grid cells to inspect records.</span>
            )}
          </div>
        </div>

        {/* Action center: Log hours */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 flex flex-col justify-between card-hover-premium">
          <div>
            <h3 className="text-lg font-semibold text-white">Log Code Sessions</h3>
            <p className="text-xs text-slate-400 mt-1">Submit your workspace practice duration to maintain streak.</p>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Hours Spent Coded</label>
                <select
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="w-full text-sm rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none focus:border-cyan-400/40"
                >
                  <option value="0.5">30 Mins (0.5h)</option>
                  <option value="1">1 Hour (1.0h)</option>
                  <option value="2">2 Hours (2.0h)</option>
                  <option value="4">4 Hours (4.0h)</option>
                  <option value="8">8 Hours (8.0h)</option>
                </select>
              </div>

              <button
                onClick={handleLogActivity}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-950/40 hover:scale-[1.01] active:scale-95 transition-all btn-micro"
              >
                Log Today&apos;s Time
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Longest Streak</p>
              <p className="text-lg font-bold text-white mt-1">{activeProfile.longestStreak} days</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Active Days</p>
              <p className="text-lg font-bold text-cyan-400 mt-1">{stats.totalDays} days</p>
            </div>
          </div>
        </div>

      </div>

      {/* Reports section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly stats */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
          <h3 className="text-base font-semibold text-white mb-4">Weekly Snapshot</h3>
          <div className="space-y-3">
            {[
              { label: 'Hours Coded', val: `${stats.totalHours} hrs`, color: 'text-indigo-400' },
              { label: 'Avg Focus Level', val: `${stats.avgFocus}%`, color: 'text-cyan-400' },
              { label: 'Solved Challenges', val: `${activeProfile.solvedCount} total`, color: 'text-emerald-400' }
            ].map((s, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className={`text-sm font-semibold ${s.color}`}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly report analytics */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
          <h3 className="text-base font-semibold text-white mb-4 font-medium">Monthly Trends</h3>
          <div className="space-y-4">
            {[
              { label: 'Consistency Ratio', percent: activeProfile.xp === 0 ? 0 : 84 },
              { label: 'Project Output Speed', percent: activeProfile.xp === 0 ? 0 : 76 },
              { label: 'Debugging Efficiency', percent: activeProfile.xp === 0 ? 0 : 92 }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white font-semibold">{item.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habit accomplishments */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
          <h3 className="text-base font-semibold text-white mb-4">Habit Achievements</h3>
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {achievements.map((ach) => {
              // If new user, they have no completed achievements yet
              const isComp = activeProfile.xp === 0 ? false : ach.completed;
              return (
                <div key={ach.id} className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-xs">
                  <span className="text-lg">{ach.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white">{ach.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ach.desc}</p>
                  </div>
                  {isComp ? (
                    <span className="ml-auto text-emerald-400 font-semibold">✓</span>
                  ) : (
                    <span className="ml-auto text-slate-500">⏳</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Pure CSS Charts visualization */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
        <h3 className="text-lg font-semibold text-white mb-4">Hours Coded per Day (Weekly Distribution)</h3>
        
        {/* Simple Bar Chart */}
        <div className="mt-8 flex h-48 items-end gap-3 md:gap-6 border-b border-white/10 pb-2">
          {[
            { day: 'Mon', hrs: activeProfile.xp === 0 ? 0 : 3.5, percent: activeProfile.xp === 0 ? 0 : 45 },
            { day: 'Tue', hrs: activeProfile.xp === 0 ? 0 : 5.0, percent: activeProfile.xp === 0 ? 0 : 65 },
            { day: 'Wed', hrs: activeProfile.xp === 0 ? 0 : 2.0, percent: activeProfile.xp === 0 ? 0 : 25 },
            { day: 'Thu', hrs: activeProfile.xp === 0 ? 0 : 8.0, percent: activeProfile.xp === 0 ? 0 : 100 },
            { day: 'Fri', hrs: activeProfile.xp === 0 ? 0 : 4.5, percent: activeProfile.xp === 0 ? 0 : 55 },
            { day: 'Sat', hrs: activeProfile.xp === 0 ? 0 : 6.0, percent: activeProfile.xp === 0 ? 0 : 78 },
            { day: 'Sun', hrs: activeProfile.xp === 0 ? 0 : 1.5, percent: activeProfile.xp === 0 ? 0 : 20 }
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition duration-300 font-semibold">
                {bar.hrs}h
              </span>
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 hover:from-cyan-400 hover:to-indigo-500 transition-all duration-500 cursor-pointer shadow-lg shadow-indigo-950/40"
                style={{ height: `${bar.percent}%`, minHeight: '10%' }}
              />
              <span className="text-xs text-slate-500 font-medium">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodingHabitTrackerPage;
