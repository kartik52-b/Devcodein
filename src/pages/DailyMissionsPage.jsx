import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import {
  dailyMissions,
  weeklyMissions,
  monthlyGoals,
  dailyMissionTotalXp
} from '../data/missionsData';
import { profileApi } from '../services/profileApi';
import { isUnavailable } from '../services/api';

/* Local completion of the checklist is a UI concern and lives in localStorage
   (keyed by day). The XP *reward* for claiming is decided by the server. */
const todayKey = () => new Date().toISOString().slice(0, 10);
const storageKey = `devverse_missions_${todayKey()}`;

const readLocalState = () => {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey)) || null;
  } catch {
    return null;
  }
};

const writeLocalState = (state) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    /* storage disabled */
  }
};

const buildDailyTasks = (completedIds = []) =>
  dailyMissions.map((mission) => ({ ...mission, completed: completedIds.includes(mission.id) }));

const buildWeeklyTasks = (claimedIds = []) =>
  weeklyMissions.map((mission) => ({
    ...mission,
    current: mission.initial,
    claimed: claimedIds.includes(mission.id)
  }));

function DailyMissionsPage() {
  const { activeProfile, addXp, updateActiveProfile, applyServerProgress } = useProfile();

  const [restored] = useState(readLocalState);
  const [todayTasks, setTodayTasks] = useState(() =>
    buildDailyTasks(restored?.completedDaily ?? (activeProfile.xp > 0 ? dailyMissions.slice(0, 2).map((m) => m.id) : []))
  );
  const [weeklyTasks, setWeeklyTasks] = useState(() => buildWeeklyTasks(restored?.claimedWeekly || []));
  const [hasClaimedToday, setHasClaimedToday] = useState(Boolean(restored?.claimedDaily));
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState('');
  const [claimState, setClaimState] = useState({ busy: false, error: '' });
  const [serverState, setServerState] = useState({ online: true, message: '' });

  // Persist the checklist so a refresh never loses progress.
  useEffect(() => {
    writeLocalState({
      completedDaily: todayTasks.filter((task) => task.completed).map((task) => task.id),
      claimedWeekly: weeklyTasks.filter((task) => task.claimed).map((task) => task.id),
      claimedDaily: hasClaimedToday
    });
  }, [todayTasks, weeklyTasks, hasClaimedToday]);

  // Restore which rewards the server has already settled for this period.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await profileApi.missions();
        if (cancelled) return;
        const claims = data.claims || [];
        const dailyClaimed = dailyMissions.every((m) => claims.includes(`daily:${m.id}:${data.today}`));
        const claimedWeeklyIds = weeklyMissions
          .filter((m) => claims.includes(`weekly:${m.id}:${data.week}`))
          .map((m) => m.id);

        if (dailyClaimed) setHasClaimedToday(true);
        if (claimedWeeklyIds.length) {
          setWeeklyTasks((prev) =>
            prev.map((task) => (claimedWeeklyIds.includes(task.id) ? { ...task, claimed: true } : task))
          );
        }
        setServerState({ online: true, message: '' });
      } catch (error) {
        if (cancelled) return;
        setServerState({
          online: !isUnavailable(error),
          message: isUnavailable(error)
            ? 'Rewards will be recorded locally until the API is reachable.'
            : error?.message || 'Unable to sync mission claims.'
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = todayTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / todayTasks.length) * 100);

  const toggleTask = (id) => {
    setTodayTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const celebrate = (message) => {
    setUnlockMessage(message);
    setShowUnlockNotification(true);
    updateActiveProfile((prev) => ({
      ...prev,
      history: [
        { id: Date.now(), label: message, time: 'Just now', reward: message.match(/\+\d+ XP/)?.[0] || 'Reward' },
        ...prev.history
      ],
      recentActivity: [message, ...prev.recentActivity].slice(0, 10)
    }));
  };

  const handleClaimTodayReward = async () => {
    if (progressPercent < 100 || hasClaimedToday || claimState.busy) return;

    const localXp = dailyMissionTotalXp;
    setClaimState({ busy: true, error: '' });

    try {
      const payload = await profileApi.claimDaily();
      setHasClaimedToday(true);
      if (payload.user) applyServerProgress(payload.user);

      const awarded = payload.awardedXp || 0;
      celebrate(
        payload.alreadyClaimed || awarded === 0
          ? 'Daily rewards were already claimed today.'
          : payload.leveledUp
            ? `Leveled up! Claimed daily rewards +${awarded} XP.`
            : `Claimed daily rewards +${awarded} XP.`
      );
      setServerState({ online: true, message: '' });
    } catch (error) {
      if (isUnavailable(error)) {
        // Offline fallback: award locally, clearly stating it is not synced.
        const { leveledUp, level } = addXp(localXp);
        setHasClaimedToday(true);
        setServerState({
          online: false,
          message: 'The API is unreachable — this reward is stored locally and not yet synced.'
        });
        celebrate(
          leveledUp
            ? `Leveled up to Level ${level}! Daily rewards +${localXp} XP (local).`
            : `Claimed daily rewards +${localXp} XP (local).`
        );
      } else {
        setClaimState({ busy: false, error: error?.message || 'Unable to claim that reward.' });
        setUnlockMessage(error?.message || 'Unable to claim that reward.');
        setShowUnlockNotification(true);
      }
    } finally {
      setClaimState((prev) => ({ ...prev, busy: false }));
    }
  };

  const handleClaimWeekly = async (id, xp) => {
    if (claimState.busy) return;
    setClaimState({ busy: true, error: '' });

    try {
      const payload = await profileApi.claimMission({ type: 'weekly', id });
      setWeeklyTasks((prev) => prev.map((task) => (task.id === id ? { ...task, claimed: true } : task)));
      if (payload.user) applyServerProgress(payload.user);
      const awarded = payload.awardedXp || 0;
      celebrate(
        payload.alreadyClaimed || awarded === 0
          ? 'That weekly reward was already claimed.'
          : `Weekly milestone +${awarded} XP.`
      );
      setServerState({ online: true, message: '' });
    } catch (error) {
      if (isUnavailable(error)) {
        const { leveledUp, level } = addXp(xp);
        setWeeklyTasks((prev) => prev.map((task) => (task.id === id ? { ...task, claimed: true } : task)));
        setServerState({
          online: false,
          message: 'The API is unreachable — this reward is stored locally and not yet synced.'
        });
        celebrate(leveledUp ? `Leveled up to Level ${level}! Weekly milestone +${xp} XP (local).` : `Weekly milestone +${xp} XP (local).`);
      } else {
        setClaimState({ busy: false, error: error?.message || 'Unable to claim that reward.' });
        setUnlockMessage(error?.message || 'Unable to claim that reward.');
        setShowUnlockNotification(true);
      }
    } finally {
      setClaimState((prev) => ({ ...prev, busy: false }));
    }
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

      {!serverState.online || serverState.message ? (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {serverState.message || 'Mission rewards are not syncing with the server.'}
        </div>
      ) : null}

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
                  disabled={progressPercent < 100 || hasClaimedToday || claimState.busy}
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
              {monthlyGoals.map((goal) => {
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
