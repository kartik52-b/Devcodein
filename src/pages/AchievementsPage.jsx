import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Lock, Trophy } from 'lucide-react';
import { achievementsApi } from '../services/achievementsApi';
import { useProfile } from '../context/ProfileContext';
import { isUnavailable } from '../services/api';

/**
 * /achievements (alias) → /modules/achievements
 *
 * The single source of truth for badges: full catalog from the API merged
 * with the learner's unlocks. The dashboard and profile only show previews.
 */
function AchievementsPage() {
  const { activeProfile } = useProfile();
  const [state, setState] = useState({ status: 'loading', catalog: [], mine: [] });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      try {
        const [catalog, mine] = await Promise.all([
          achievementsApi.catalog(controller.signal),
          achievementsApi.mine(controller.signal)
        ]);
        if (cancelled) return;
        setState({
          status: 'ready',
          catalog: Array.isArray(catalog) ? catalog : [],
          mine: Array.isArray(mine) ? mine : []
        });
      } catch (error) {
        if (cancelled || error?.name === 'AbortError') return;
        setState((prev) => ({
          status: isUnavailable(error) ? 'unavailable' : 'error',
          catalog: [],
          mine: []
        }));
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Fallback unlocks from the local profile store if the API is unreachable.
  const fallbackMine = (activeProfile?.achievements || []).map((item) => ({
    key: item.key || String(item.id),
    title: item.title,
    desc: item.desc,
    icon: item.icon,
    earned: item.earned
  }));

  const mine = state.mine.length > 0 ? state.mine : fallbackMine;
  const unlockedKeys = new Set(mine.map((item) => item.key).filter(Boolean));

  const entries = state.catalog.length
    ? state.catalog.map((item) => {
        const unlock = mine.find(
          (owned) => owned.key === item.key || owned.title === item.title || owned.name === item.name
        );
        return {
          key: item.key,
          title: item.title || item.name,
          description: item.description || item.desc,
          icon: item.icon || '🏅',
          xpReward: item.xpReward || 0,
          earned: unlock?.earned || null
        };
      })
    : mine.map((item) => ({
        key: item.key,
        title: item.title,
        description: item.desc,
        icon: item.icon || '🏅',
        xpReward: 0,
        earned: item.earned || null
      }));

  const unlocked = entries.filter((item) => item.earned || unlockedKeys.has(item.key));
  const locked = entries.filter((item) => !(item.earned || unlockedKeys.has(item.key)));

  const Badge = ({ item, isUnlocked }) => (
    <li
      className={`rounded-2xl border p-5 ${
        isUnlocked
          ? 'border-amber-400/25 bg-amber-400/5'
          : 'border-white/10 bg-slate-950/60 opacity-80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl">{item.icon}</span>
        {isUnlocked ? (
          <Award size={16} className="text-amber-300" />
        ) : (
          <Lock size={15} className="text-slate-500" />
        )}
      </div>
      <p className="mt-3 font-semibold text-white">{item.title}</p>
      {item.description ? (
        <p className="mt-1 text-sm text-slate-400">{item.description}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={isUnlocked ? 'text-amber-300' : 'text-slate-500'}>
          {isUnlocked
            ? `Unlocked${item.earned ? ` · ${item.earned}` : ''}`
            : 'Locked'}
        </span>
        {item.xpReward ? <span className="text-emerald-300">+{item.xpReward} XP</span> : null}
      </div>
    </li>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">Community</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold text-white">
            <Trophy className="text-amber-300" size={26} /> Achievements
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Every badge you can earn on DevVerse — {unlocked.length} unlocked, {locked.length} still to go.
          </p>
        </div>
        <Link
          to="/modules/community"
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          Community
        </Link>
      </header>

      {state.status === 'loading' ? (
        <p className="animate-pulse text-sm text-slate-500">Loading achievements…</p>
      ) : null}

      {state.status === 'unavailable' ? (
        <p className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          The achievements API is unreachable — showing your locally cached badges.
        </p>
      ) : null}

      {entries.length === 0 && state.status !== 'loading' ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
          No achievements available yet. Solve a challenge to unlock your first badge.
        </p>
      ) : null}

      {unlocked.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Unlocked ({unlocked.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((item) => (
              <Badge key={item.key || item.title} item={item} isUnlocked />
            ))}
          </ul>
        </section>
      ) : null}

      {locked.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Locked ({locked.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((item) => (
              <Badge key={item.key || item.title} item={item} isUnlocked={false} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default AchievementsPage;
