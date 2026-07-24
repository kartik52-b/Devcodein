import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const avatarPresets = [
  '💻', '🚀', '🧙‍♂️', '👾', '🦊', '🦄', '🐱‍💻', '🤖'
];

const defaultFriends = [
  { id: 1, name: 'Maya Chen', status: 'Online', role: 'Frontend wizard', avatar: '🦊' },
  { id: 2, name: 'Arjun Verma', status: 'Online', role: 'DSA Master', avatar: '🧙‍♂️' },
  { id: 3, name: 'Sofia Lopez', status: 'Offline', role: 'Full Stack Dev', avatar: '🦄' },
  { id: 4, name: 'Kai Ryusaki', status: 'Offline', role: 'AI researcher', avatar: '🤖' }
];

function ProfilePage() {
  const { activeProfile, updateActiveProfile } = useProfile();
  
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  
  // Custom local state for friends (unique to session or fallback)
  const [friends, setFriends] = useState(defaultFriends);

  const xpPercentage = useMemo(() => {
    // Every level takes 1000 XP
    const baseLvlXp = (activeProfile.level - 1) * 1000;
    const progressXp = activeProfile.xp - baseLvlXp;
    return Math.min(100, Math.max(0, Math.round((progressXp / 1000) * 100)));
  }, [activeProfile.level, activeProfile.xp]);

  const problemStats = useMemo(() => {
    // Distribute solved challenges between Easy/Medium/Hard dynamically
    const count = activeProfile.solvedCount;
    
    // Fallback if Aarav (142 solved)
    if (activeProfile.id === 'aarav' && count === 142) {
      return {
        solved: 142,
        easy: { solved: 60, total: 100 },
        medium: { solved: 62, total: 150 },
        hard: { solved: 20, total: 50 }
      };
    }
    
    // Dynamic distribution based on count for custom user profiles
    const easyVal = Math.round(count * 0.45);
    const medVal = Math.round(count * 0.4);
    const hardVal = count - (easyVal + medVal);

    return {
      solved: count,
      easy: { solved: easyVal, total: 100 },
      medium: { solved: medVal, total: 150 },
      hard: { solved: Math.max(0, hardVal), total: 50 }
    };
  }, [activeProfile.solvedCount, activeProfile.id]);

  const handleSelectAvatar = (preset) => {
    updateActiveProfile({ avatar: preset });
    setShowAvatarSelector(false);
  };

  const handleAddFriend = () => {
    if (!friendNameInput.trim()) return;
    const newFriend = {
      id: Date.now(),
      name: friendNameInput.trim(),
      status: 'Online',
      role: 'Junior Dev',
      avatar: avatarPresets[Math.floor(Math.random() * avatarPresets.length)]
    };
    setFriends(prev => [...prev, newFriend]);
    setFriendNameInput('');
  };

  const handleRemoveFriend = (id) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100">
      
      {/* Header section (Profile details) */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5 relative">
            
            {/* Clickable Avatar preset selector */}
            <div className="relative">
              <button
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400 bg-gradient-to-br from-indigo-600 to-cyan-400 text-4xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 btn-micro"
                title="Change Avatar"
              >
                {activeProfile.avatar}
              </button>
              
              {showAvatarSelector && (
                <div className="absolute top-24 left-0 z-20 grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-slate-900 p-3 shadow-2xl">
                  {avatarPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSelectAvatar(preset)}
                      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 text-2xl hover:bg-white/15 transition btn-micro"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white md:text-3xl">{activeProfile.name}</h1>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 font-semibold border border-indigo-400/20">
                  {activeProfile.level > 10 ? 'Senior developer' : 'Beginner Coder'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Workspace developer profile • {activeProfile.streak} days active streak</p>
              
              {/* Settings Shortcut */}
              <Link
                to="/modules/settings"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 transition-all font-semibold"
              >
                ⚙️ Settings Profile Control
              </Link>
            </div>
          </div>

          {/* Level progress indicator */}
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Level {activeProfile.level}</span>
              <span className="text-cyan-300">{activeProfile.xp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 text-right">{xpPercentage}% progressed to Level {activeProfile.level + 1}</p>
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Solved stats, Bookmarks, and Achievements */}
        <div className="space-y-6">
          
          {/* Solved Problems distribution */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="text-lg font-semibold text-white mb-4">Solved Coding Problems</h3>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Easy stats card */}
              <div className="rounded-xl border border-white/5 bg-emerald-500/5 p-4 text-center">
                <span className="text-xs font-semibold text-emerald-400">Easy Challenges</span>
                <p className="text-2xl font-bold text-white mt-1.5">{problemStats.easy.solved} / {problemStats.easy.total}</p>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${(problemStats.easy.solved / problemStats.easy.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Medium stats card */}
              <div className="rounded-xl border border-white/5 bg-indigo-500/5 p-4 text-center">
                <span className="text-xs font-semibold text-indigo-400">Medium Challenges</span>
                <p className="text-2xl font-bold text-white mt-1.5">{problemStats.medium.solved} / {problemStats.medium.total}</p>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400"
                    style={{ width: `${(problemStats.medium.solved / problemStats.medium.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Hard stats card */}
              <div className="rounded-xl border border-white/5 bg-rose-500/5 p-4 text-center">
                <span className="text-xs font-semibold text-rose-400">Hard Challenges</span>
                <p className="text-2xl font-bold text-white mt-1.5">{problemStats.hard.solved} / {problemStats.hard.total}</p>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400"
                    style={{ width: `${(problemStats.hard.solved / problemStats.hard.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bookmarked Problems links */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="text-lg font-semibold text-white mb-3">Bookmarked Challenges</h3>
            <p className="text-xs text-slate-400 mb-4">Quick access links to challenges saved during study.</p>
            
            <div className="space-y-2">
              {activeProfile.bookmarks.length > 0 ? (
                activeProfile.bookmarks.map((bookmarkId) => (
                  <Link
                    key={bookmarkId}
                    to="/modules/challenges"
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3.5 text-xs text-slate-300 hover:text-white hover:border-indigo-400/20 hover:bg-indigo-500/5 transition-all"
                  >
                    <span className="font-semibold uppercase truncate">{bookmarkId.replace(/-/g, ' ')}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300">
                      View Challenge
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">No bookmarks saved yet. Save bookmarks inside the Practice room!</p>
              )}
            </div>
          </div>

          {/* Achievements Wall with Hover Explanations */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="text-lg font-semibold text-white mb-2">Unlocked Achievements</h3>
            <p className="text-xs text-slate-400 mb-6">Hover or click achievement node to inspect details.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {activeProfile.achievements.length > 0 ? (
                activeProfile.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="group relative rounded-2xl border border-white/5 bg-slate-950/40 p-4 transition-all hover:border-cyan-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{ach.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {ach.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Earned: {ach.earned}</p>
                      </div>
                    </div>

                    {/* Absolute positioning detail tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 z-10 w-48 -translate-x-1/2 translate-y-[-8px] rounded-lg border border-white/10 bg-slate-900 p-2.5 text-center text-[10px] text-slate-300 opacity-0 shadow-xl pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
                      {ach.desc}
                      <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-slate-900 border-r border-b border-white/10" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-slate-500 italic py-4">
                  No achievements unlocked. Tackle Daily Missions to trigger unlocks!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Friends & Recent activity */}
        <div className="space-y-6">
          
          {/* Friends active panel */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="text-lg font-semibold text-white mb-1">Friends Roster</h3>
            <p className="text-xs text-slate-400 mb-4">Connect and compare stats with team peers.</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                placeholder="Enter username..."
                className="flex-1 text-xs rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-cyan-400/40"
              />
              <button
                onClick={handleAddFriend}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 active:scale-95 transition btn-micro"
              >
                Add Friend
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{friend.avatar}</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{friend.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{friend.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      friend.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`} />
                    <span className="text-[10px] text-slate-400 mr-2">{friend.status}</span>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                      title="Remove Friend"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity stream */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3 relative border-l border-white/10 pl-4 ml-2">
              {activeProfile.recentActivity.length > 0 ? (
                activeProfile.recentActivity.map((act, i) => (
                  <div key={i} className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400 border border-slate-950" />
                    <p className="text-xs text-white font-medium">{act}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic pl-2 py-4">No recent activity logs.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
