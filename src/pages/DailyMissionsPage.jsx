import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';

const initialTodayTasks = [
  { id: 1, title: 'Solve 2 coding challenges', xp: 180, completed: false, category: 'Algorithm' },
  { id: 2, title: 'Review one data structure', xp: 120, completed: false, category: 'Conceptual' },
  { id: 3, title: 'Debug the AI Mentor code suggestion', xp: 220, completed: false, category: 'AI Lab' }
];

const initialWeeklyTasks = [
  { id: 101, title: 'Maintain a 5-day coding streak', xp: 500, current: 4, target: 5, claimed: false },
  { id: 102, title: 'Spend 5 hours in the Algorithm Visualizer', xp: 350, current: 3.5, target: 5, claimed: false },
  { id: 103, title: 'Complete 3 database roadmaps milestones', xp: 400, current: 3, target: 3, claimed: false }
];

const initialMonthlyGoals = [
  { id: 201, title: 'Solve 30 challenges in practice room', xp: 1500, current: 24, target: 30 },
  { id: 202, title: 'Earn 5 new badges', xp: 1000, current: 4, target: 5 },
  { id: 203, title: 'Unlock the "Binary Beast" Achievement', xp: 2000, current: 0, target: 1 }
];

function DailyMissionsPage() {
  const { activeProfile, addXp, updateActiveProfile } = useProfile();
  
  const [todayTasks, setTodayTasks] = useState(initialTodayTasks);
  const [weeklyTasks, setWeeklyTasks] = useState(initialWeeklyTasks);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState('');

  // Handle fresh vs. Aarav presets
  useEffect(() => {
    // If it's a new user, reset claimed rewards
    if (activeProfile.xp === 0) {
      setHasClaimedToday(false);
      setTodayTasks(initialTodayTasks);
      setWeeklyTasks(initialWeeklyTasks.map(t => ({ ...t, current: 0, claimed: false })));
    } else {
      // Aarav default
      setHasClaimedToday(false);
      setTodayTasks(initialTodayTasks.map((t, idx) => idx < 2 ? { ...t, completed: true } : t));
      setWeeklyTasks(initialWeeklyTasks);
    }
  }, [activeProfile.id]);

  const completedCount = todayTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / todayTasks.length) * 100);

  const toggleTask = (id) => {
    setTodayTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleClaimTodayReward = () => {
    if (progressPercent < 100) return;
    if (hasClaimedToday) return;

    const claimedXp = todayTasks.reduce((sum, t) => sum + t.xp, 0);
    const { leveledUp, level } = addXp(claimedXp);
    setHasClaimedToday(true);

    // Create achievements & history updates
    const rewardMsg = `Claimed Daily rewards +${claimedXp} XP.`;
    setUnlockMessage(leveledUp ? `Leveled up to Level ${level}! ${rewardMsg}` : rewardMsg);
    setShowUnlockNotification(true);

    const historyItem = {
      id: Date.now(),
      label: 'Claimed Daily Mission Rewards',
      time: 'Just now',
      reward: `+${claimedXp} XP`
    };

    updateActiveProfile(prev => ({
      ...prev,
      history: [historyItem, ...prev.history],
      recentActivity: ['Claimed daily rewards', ...prev.recentActivity].slice(0, 10)
    }));
  };

  const handleClaimWeekly = (id, xp) => {
    setWeeklyTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, claimed: true } : t))
    );
    const { leveledUp, level } = addXp(xp);

    const rewardMsg = `Weekly Milestone +${xp} XP.`;
    setUnlockMessage(leveledUp ? `Leveled up to Level ${level}! ${rewardMsg}` : rewardMsg);
    setShowUnlockNotification(true);

    const historyItem = {
      id: Date.now(),
      label: 'Claimed Weekly Challenge Reward',
      time: 'Just now',
      reward: `+${xp} XP`
    };

    updateActiveProfile(prev => ({
      ...prev,
      history: [historyItem, ...prev.history],
      recentActivity: ['Claimed weekly milestone', ...prev.recentActivity].slice(0, 10)
    }));
  };

  useEffect(() => {
    if (showUnlockNotification) {
      const timer = setTimeout(() => {
        setShowUnlockNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showUnlockNotification]);

  // Calendar setup (e.g. July 2026, 31 days)
  const currentMonth = 'July 2026';
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    // New users have no completed days, Aarav has some
    const completedDays = activeProfile.xp === 0 ? [] : [3, 4, 7, 8, 9, 10, 11, 14, 15, 17, 18, 20, 21];
    return {
      day,
      completed: completedDays.includes(day),
      today: day === 21
    };
  });

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100">
      {/* Achievement Unlock Popup */}
      {showUnlockNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-2xl border border-amber-400/30 bg-slate-900/95 p-4 shadow-2xl shadow-amber-950/20 backdrop-blur animate-slide-up">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-2xl text-amber-300">
            👑
          </div>
          <div>
            <h4 className="font-semibold text-white">Reward Unlocked!</h4>
            <p className="mt-1 text-xs text-slate-300">{unlockMessage}</p>
          </div>
          <button
            onClick={() => setShowUnlockNotification(false)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Daily Missions</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Turn your daily practice into a rewarding streak.</h1>
            <p className="mt-2 text-slate-400">Complete tasks to gain XP, unlock custom badges, and show off your consistency in the ecosystem.</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-400">Total XP</p>
              <p className="text-2xl font-semibold text-white">{activeProfile.xp.toLocaleString()}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-xl">
              ✨
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Today's Tasks & Weekly Progress */}
        <div className="space-y-6">
          {/* Today's Tasks */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Today&apos;s Missions</h3>
                <p className="text-sm text-slate-400">July 21, 2026</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                  {progressPercent}% Complete
                </span>
                <button
                  disabled={progressPercent < 100 || hasClaimedToday}
                  onClick={handleClaimTodayReward}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                    progressPercent === 100 && !hasClaimedToday
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 btn-micro'
                      : hasClaimedToday
                      ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                      : 'border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {hasClaimedToday ? '✓ Claimed' : 'Claim Daily Reward'}
                </button>
              </div>
            </div>

            {/* Progress Bar visualizer */}
            <div className="mb-6 h-3.5 w-full overflow-hidden rounded-full bg-slate-950/70 p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-300 ${
                    task.completed
                      ? 'border-emerald-500/30 bg-emerald-950/10 text-slate-300'
                      : 'border-white/10 bg-slate-950/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
                        task.completed
                          ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      {task.completed && '✓'}
                    </div>
                    <div>
                      <p className={`font-medium transition-all ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <span className="mt-1 inline-block rounded bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${task.completed ? 'text-emerald-400' : 'text-slate-300'}`}>
                      +{task.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Tasks */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="mb-2 text-xl font-semibold text-white">Weekly Objectives</h3>
            <p className="mb-6 text-sm text-slate-400">Complete before week cycle ends on Sunday.</p>

            <div className="space-y-4">
              {weeklyTasks.map((task) => {
                const isComplete = task.current >= task.target;
                return (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div>
                        <h4 className="font-semibold text-white">{task.title}</h4>
                        <p className="mt-0.5 text-xs text-slate-400">Reward: +{task.xp} XP</p>
                      </div>
                      <div className="text-right">
                        {isComplete ? (
                          task.claimed ? (
                            <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 border border-emerald-500/20">
                              Claimed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimWeekly(task.id, task.xp)}
                              className="rounded bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow hover:scale-105 btn-micro"
                            >
                              Claim
                            </button>
                          )
                        ) : (
                          <span className="text-slate-400">
                            {task.current}/{task.target}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                        style={{ width: `${Math.min(100, (task.current / task.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar, History, Monthly Goals */}
        <div className="space-y-6">
          {/* Calendar Grid */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Active Calendar</h3>
              <span className="rounded bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300">
                {currentMonth}
              </span>
            </div>
            <p className="mb-4 text-xs text-slate-400">Glow indicate days you successfully cleared all today missions.</p>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((dayObj) => (
                <div
                  key={dayObj.day}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition-all relative ${
                    dayObj.completed
                      ? 'border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 to-teal-400/10 text-emerald-200 shadow-md shadow-emerald-950/20 scale-105'
                      : dayObj.today
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                      : 'border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/10'
                  }`}
                >
                  {dayObj.day}
                  {dayObj.today && (
                    <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Goals */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="mb-4 text-xl font-semibold text-white">Monthly Goals</h3>
            <div className="space-y-4">
              {initialMonthlyGoals.map((goal) => {
                const isNew = activeProfile.xp === 0;
                const curr = isNew ? 0 : goal.current;
                const percent = Math.min(100, Math.round((curr / goal.target) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-medium">{goal.title}</span>
                      <span className="text-xs text-slate-400">{curr} / {goal.target}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Reward: +{goal.xp} XP</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History log */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="mb-4 text-xl font-semibold text-white">Mission History</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {activeProfile.history.length > 0 ? (
                activeProfile.history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 text-xs">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-0.5 text-slate-400">{item.time}</p>
                    </div>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-300 border border-cyan-400/20">
                      {item.reward}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">No claimed missions in history logs.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyMissionsPage;
