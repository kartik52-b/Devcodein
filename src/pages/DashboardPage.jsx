import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Route,
  Sparkles,
  Target,
  Trophy,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { leaderboardApi } from '../services/leaderboardApi';
import { dailyMissions, dailyMissionTotalXp } from '../data/missionsData';

/**
 * /dashboard — the learner's central overview.
 *
 * Deliberately a SUMMARY: it answers "what should I do next?" and links into
 * the full modules. No module renders its complete interface here — previews
 * only (missions, achievements, leaderboard), each with a "view all" entry.
 */

const StatCard = ({ icon: Icon, label, value, hint, accent = 'text-cyan-300' }) => (
  <div className="glass rounded-[1.5rem] border border-white/10 p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <Icon size={16} className={accent} />
    </div>
    <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

const SectionCard = ({ title, action, children }) => (
  <section className="glass rounded-[1.75rem] border border-white/10 p-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const ViewAllLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
  >
    {children} <ArrowRight size={14} />
  </Link>
);

function DashboardPage() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const [board, setBoard] = useState({ status: 'loading', entries: [] });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    leaderboardApi
      .top({ limit: 5, signal: controller.signal })
      .then((data) => {
        if (!cancelled) setBoard({ status: 'ready', entries: data?.entries || [] });
      })
      .catch(() => {
        if (!cancelled) setBoard({ status: 'unavailable', entries: [] });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const firstName = (user?.name || activeProfile?.name || 'there').split(' ')[0];
  const xp = user?.xp ?? activeProfile?.xp ?? 0;
  const level = user?.level ?? activeProfile?.level ?? 1;
  const streak = user?.streak ?? activeProfile?.streak ?? 0;
  const solved = user?.solvedProblems ?? activeProfile?.solvedCount ?? 0;
  const achievements = (user?.achievements || activeProfile?.achievements || []).filter(Boolean);
  const activity = (activeProfile?.history || []).slice(0, 3);
  const milestonesDone = (activeProfile?.completedMilestones || []).length;
  const xpIntoLevel = xp % 1000;
  const progressPct = Math.min(100, Math.round((xpIntoLevel / 1000) * 100));

  const recommended = [
    {
      to: '/modules/practice',
      icon: Target,
      title: 'Practice a challenge',
      desc: 'Sharpen DSA with a short problem.',
      tag: 'Recommended'
    },
    {
      to: '/modules/algorithm-visualizer',
      icon: Sparkles,
      title: 'Visualize an algorithm',
      desc: 'See sorting and searching step by step.',
      tag: 'Tools'
    },
    {
      to: '/modules/ai-mentor',
      icon: BookOpen,
      title: 'Ask the AI Mentor',
      desc: 'Debug, review, and understand code.',
      tag: 'AI'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-8">
      {/* ---------------------------------------------------------- header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pick up where you left off — here is your learning snapshot.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-200">
          <Flame size={15} /> {streak}-day streak
        </span>
      </header>

      {/* ----------------------------------------------------- stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="XP" value={xp.toLocaleString()} hint={`${xpIntoLevel} / 1000 to next level`} accent="text-amber-300" />
        <StatCard icon={Trophy} label="Level" value={level} hint="Earn XP to level up" accent="text-indigo-300" />
        <StatCard icon={Flame} label="Streak" value={`${streak} days`} hint={`Best: ${user?.longestStreak ?? activeProfile?.longestStreak ?? streak}`} accent="text-orange-300" />
        <StatCard icon={CheckCircle2} label="Solved" value={solved} hint="Challenges completed" accent="text-emerald-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ------------------------------------------- continue learning */}
        <SectionCard
          title="Continue learning"
          action={<ViewAllLink to="/modules/roadmaps">Roadmaps</ViewAllLink>}
        >
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <Route size={18} />
              </span>
              <div>
                <p className="font-medium text-white">Your learning roadmap</p>
                <p className="text-sm text-slate-400">
                  {milestonesDone > 0
                    ? `${milestonesDone} milestones completed — keep going.`
                    : 'Start a roadmap and finish your first milestone.'}
                </p>
              </div>
            </div>
            <Link
              to="/modules/roadmaps"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">Your progress</p>
                <p className="text-sm text-slate-400">
                  Level {level} · {progressPct}% toward level {level + 1}
                </p>
              </div>
              <span className="text-sm font-semibold text-cyan-300">{progressPct}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </SectionCard>

        {/* --------------------------------------------- today's missions */}
        <SectionCard
          title="Today's missions"
          action={<ViewAllLink to="/modules/missions">View missions</ViewAllLink>}
        >
          <ul className="space-y-3">
            {dailyMissions.map((mission) => (
              <li
                key={mission.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">{mission.title}</p>
                  <p className="text-xs text-slate-500">{mission.category}</p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                  +{mission.xp} XP
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            Up to <span className="font-semibold text-amber-300">{dailyMissionTotalXp} XP</span> available today.
          </p>
        </SectionCard>
      </div>

      {/* ------------------------------------------------- recommended */}
      <SectionCard title="Recommended for you">
        <div className="grid gap-4 sm:grid-cols-3">
          {recommended.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900/70"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <item.icon size={18} />
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-slate-400">
                  {item.tag}
                </span>
              </div>
              <p className="mt-3 font-medium text-white group-hover:text-cyan-200">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* --------------------------------------------- recent activity */}
        <SectionCard
          title="Recent activity"
          action={<ViewAllLink to="/modules/profile">Profile</ViewAllLink>}
        >
          {activity.length > 0 ? (
            <ul className="space-y-3">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-emerald-300">{item.reward}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
              Solve a challenge and your activity will show up here.
            </p>
          )}
        </SectionCard>

        {/* ---------------------------------------------- achievements */}
        <SectionCard
          title="Achievements"
          action={<ViewAllLink to="/achievements">View all</ViewAllLink>}
        >
          {achievements.length > 0 ? (
            <ul className="space-y-3">
              {achievements.slice(0, 4).map((achievement, index) => (
                <li
                  key={achievement.key || achievement.id || index}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                >
                  <span className="text-xl">{achievement.icon || '🏅'}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {achievement.title || achievement.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {achievement.desc || achievement.description}
                    </p>
                  </div>
                  {achievement.earned ? (
                    <Award size={15} className="ml-auto shrink-0 text-amber-300" />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
              Complete challenges to unlock your first badge.
            </p>
          )}
        </SectionCard>
      </div>

      {/* ---------------------------------------------- leaderboard top 5 */}
      <SectionCard
        title="Leaderboard"
        action={<ViewAllLink to="/leaderboard">View leaderboard</ViewAllLink>}
      >
        {board.status === 'ready' && board.entries.length > 0 ? (
          <ol className="space-y-3">
            {board.entries.slice(0, 5).map((entry) => (
              <li
                key={entry.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  entry.isMe
                    ? 'border-cyan-400/30 bg-cyan-400/5'
                    : 'border-white/10 bg-slate-950/60'
                }`}
              >
                <span className="w-6 text-center text-sm font-semibold text-slate-400">{entry.rank}</span>
                <span className="text-lg">{entry.avatar || '👤'}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                  {entry.name}
                  {entry.isMe ? <span className="text-cyan-300"> (You)</span> : null}
                </span>
                <span className="text-sm font-semibold text-amber-300">{entry.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
            {board.status === 'unavailable'
              ? 'The leaderboard is temporarily unavailable.'
              : 'Loading the top learners…'}
          </p>
        )}
      </SectionCard>
    </div>
  );
}

export default DashboardPage;
