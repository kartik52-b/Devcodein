import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

const AARAV_PROFILE = {
  id: 'aarav',
  name: 'Aarav Singh',
  level: 19,
  xp: 18620,
  solvedCount: 142,
  solvedIds: ['two-sum', 'valid-parentheses'],
  badges: ['Fast Resolver', 'Consistency King', 'AI Explorer'],
  achievements: [
    { id: 101, title: 'Bug Hunter', desc: 'Solved 10 code bugs with AI Mentor.', earned: 'July 14, 2026', icon: '🐞' },
    { id: 102, title: 'Complexity Master', desc: 'Analyzed 5 code complexities in Optimizer.', earned: 'July 10, 2026', icon: '📊' },
    { id: 103, title: 'Consistent Coder', desc: 'Log coding activity 14 days in a row.', earned: 'July 20, 2026', icon: '🔥' },
    { id: 104, title: 'Algorithm Architect', desc: 'Completed the Binary Tree roadmap.', earned: 'June 29, 2026', icon: '🌳' }
  ],
  streak: 14,
  longestStreak: 28,
  bookmarks: ['valid-parentheses'],
  recentActivity: [
    'Solved Two Sum in 6 min',
    'Optimized a DP solution',
    'Bookmarked Advanced Graph Patterns'
  ],
  history: [
    { id: 301, label: 'Completed React challenge', time: '2h ago', reward: '+180 XP' },
    { id: 302, label: 'Claimed weekly milestone', time: 'Yesterday', reward: '+500 XP' },
    { id: 303, label: 'Unlocked bug hunter badge', time: '2 days ago', reward: 'Badge' }
  ],
  avatar: '💻',
  completedMilestones: ['fe-m1', 'fe-m2', 'fe-m3', 'be-m1', 'be-m2', 'py-m1', 'py-m2', 'py-m3', 'ja-m1', 'an-m1', 'cs-m1', 'cs-m2'],
  settings: {
    darkMode: true,
    selectedTheme: 'Indigo Cyber',
    language: 'English',
    notifyEmail: true,
    notifyPush: true,
    notifySound: false,
    privacyLevel: 'public',
    twoFactor: false
  },
  contributions: [
    // Pre-filled contribution heatmap matrix for Aarav
    { date: 'Jul 21, 2026', level: 3, hours: 6.5 },
    { date: 'Jul 20, 2026', level: 2, hours: 3.5 },
    { date: 'Jul 19, 2026', level: 1, hours: 1.0 },
    { date: 'Jul 18, 2026', level: 0, hours: 0 },
    { date: 'Jul 17, 2026', level: 3, hours: 8.0 },
    { date: 'Jul 16, 2026', level: 2, hours: 2.5 },
    { date: 'Jul 15, 2026', level: 2, hours: 4.0 }
  ]
};

const FRESH_PROFILE = {
  id: 'new-user',
  name: 'Fresh Learner',
  level: 1,
  xp: 0,
  solvedCount: 0,
  solvedIds: [],
  badges: [],
  achievements: [],
  streak: 0,
  longestStreak: 0,
  bookmarks: [],
  recentActivity: [],
  history: [],
  avatar: '👤',
  completedMilestones: [],
  settings: {
    darkMode: true,
    selectedTheme: 'Indigo Cyber',
    language: 'English',
    notifyEmail: true,
    notifyPush: true,
    notifySound: false,
    privacyLevel: 'public',
    twoFactor: false
  },
  contributions: []
};

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('devverse_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse profiles', e);
      }
    }
    return [AARAV_PROFILE];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = localStorage.getItem('devverse_active_profile_id');
    return saved || 'aarav';
  });

  useEffect(() => {
    localStorage.setItem('devverse_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('devverse_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || AARAV_PROFILE;

  const switchProfile = (id) => {
    if (profiles.some((p) => p.id === id)) {
      setActiveProfileId(id);
    }
  };

  const createNewProfile = (name = 'Fresh Learner') => {
    const newId = `new-user-${Date.now()}`;
    const newProf = {
      ...FRESH_PROFILE,
      id: newId,
      name: name
    };
    setProfiles((prev) => [...prev, newProf]);
    setActiveProfileId(newId);
    return newProf;
  };

  const upsertProfile = (profile) => {
    const normalized = {
      ...FRESH_PROFILE,
      ...profile,
      id: profile.id || `profile-${Date.now()}`,
      name: profile.name || 'Fresh Learner',
      avatar: profile.photo || profile.avatar || '👤',
      completedMilestones: profile.completedMilestones || [],
      achievements: profile.achievements || [],
      xp: profile.xp || 0,
      streak: profile.streak || 0,
      settings: { ...FRESH_PROFILE.settings, ...(profile.settings || {}) }
    };

    setProfiles((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === normalized.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...normalized };
        return next;
      }
      return [...prev, normalized];
    });
    setActiveProfileId(normalized.id);
    return normalized;
  };

  const resetAllProfiles = () => {
    setProfiles([AARAV_PROFILE]);
    setActiveProfileId('aarav');
  };

  const updateActiveProfile = (updater) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === activeProfileId) {
          const updated = typeof updater === 'function' ? updater(p) : { ...p, ...updater };
          return updated;
        }
        return p;
      })
    );
  };

  const addXp = (amount) => {
    let leveledUp = false;
    let newLvl = activeProfile.level;

    updateActiveProfile((prev) => {
      const nextXp = prev.xp + amount;
      const calculatedLevel = Math.floor(nextXp / 1000) + 1;
      if (calculatedLevel > prev.level) {
        leveledUp = true;
        newLvl = calculatedLevel;
      }
      return {
        ...prev,
        xp: nextXp,
        level: calculatedLevel
      };
    });

    return { leveledUp, level: newLvl };
  };

  const addSolvedChallenge = (challengeId, xpReward, challengeTitle) => {
    updateActiveProfile((prev) => {
      if (prev.solvedIds.includes(challengeId)) return prev; // Avoid duplicate solutions

      const nextSolvedIds = [...prev.solvedIds, challengeId];
      const nextXp = prev.xp + xpReward;
      const nextLevel = Math.floor(nextXp / 1000) + 1;
      
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Update contribution activity
      const contributionsCopy = [...prev.contributions];
      const todayCellIndex = contributionsCopy.findIndex(c => c.date === todayStr);
      if (todayCellIndex > -1) {
        const cell = contributionsCopy[todayCellIndex];
        contributionsCopy[todayCellIndex] = {
          ...cell,
          hours: cell.hours + 0.5,
          level: Math.min(3, cell.level + 1)
        };
      } else {
        contributionsCopy.push({ date: todayStr, level: 1, hours: 0.5 });
      }

      // Check for streak increment
      let nextStreak = prev.streak;
      if (prev.streak === 0) {
        nextStreak = 1;
      }

      // Add recent activity and history log
      const nextActivity = [`Solved ${challengeTitle}`, ...prev.recentActivity].slice(0, 10);
      const nextHistory = [
        { id: Date.now(), label: `Solved ${challengeTitle}`, time: 'Just now', reward: `+${xpReward} XP` },
        ...prev.history
      ];

      return {
        ...prev,
        solvedIds: nextSolvedIds,
        solvedCount: nextSolvedIds.length,
        xp: nextXp,
        level: nextLevel,
        streak: nextStreak,
        longestStreak: Math.max(prev.longestStreak, nextStreak),
        contributions: contributionsCopy,
        recentActivity: nextActivity,
        history: nextHistory
      };
    });
  };

  const toggleBookmark = (challengeId) => {
    updateActiveProfile((prev) => {
      const isBookmarked = prev.bookmarks.includes(challengeId);
      const nextBookmarks = isBookmarked
        ? prev.bookmarks.filter((id) => id !== challengeId)
        : [...prev.bookmarks, challengeId];
      return {
        ...prev,
        bookmarks: nextBookmarks
      };
    });
  };

  const toggleMilestone = (milestoneId) => {
    updateActiveProfile((prev) => {
      const isCompleted = prev.completedMilestones.includes(milestoneId);
      const nextMilestones = isCompleted
        ? prev.completedMilestones.filter((id) => id !== milestoneId)
        : [...prev.completedMilestones, milestoneId];
      return {
        ...prev,
        completedMilestones: nextMilestones
      };
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        profiles,
        switchProfile,
        createNewProfile,
        upsertProfile,
        updateActiveProfile,
        resetAllProfiles,
        addXp,
        addSolvedChallenge,
        toggleBookmark,
        toggleMilestone
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
