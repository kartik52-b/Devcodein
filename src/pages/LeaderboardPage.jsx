import { useState, useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';

const mockPodiums = {
  global: [
    { rank: 1, name: 'Mina Chen', xp: 18420, country: 'US', avatar: '🦊', badges: 12 },
    { rank: 2, name: 'Arjun Verma', xp: 17980, country: 'IN', avatar: '🧙‍♂️', badges: 9 },
    { rank: 3, name: 'Sofia Lopez', xp: 17110, country: 'UK', avatar: '🦄', badges: 10 }
  ],
  country: [
    { rank: 1, name: 'Arjun Verma', xp: 17980, country: 'IN', avatar: '🧙‍♂️', badges: 9 },
    { rank: 2, name: 'Aarav Singh', xp: 16820, country: 'IN', avatar: '💻', badges: 8 },
    { rank: 3, name: 'Vikram Seth', xp: 15400, country: 'IN', avatar: '👾', badges: 6 }
  ],
  college: [
    { rank: 1, name: 'Aarav Singh', xp: 16820, college: 'IIT Bombay', avatar: '💻', badges: 8 },
    { rank: 2, name: 'Priya Patel', xp: 14900, college: 'IIT Bombay', avatar: '🦄', badges: 5 },
    { rank: 3, name: 'Rohit Sharma', xp: 13200, college: 'IIT Bombay', avatar: '🦊', badges: 4 }
  ],
  friends: [
    { rank: 1, name: 'Aarav Singh', xp: 16820, relation: 'You', avatar: '💻', badges: 8 },
    { rank: 2, name: 'Maya Chen', xp: 14120, relation: 'Friend', avatar: '🦊', badges: 7 },
    { rank: 3, name: 'Sofia Lopez', xp: 12100, relation: 'Friend', avatar: '🦄', badges: 5 }
  ]
};

const mockLeaderboards = {
  global: [
    { rank: 4, name: 'Aarav Singh', xp: 16820, country: 'IN', badges: 8, trend: '+64' },
    { rank: 5, name: 'Kai Ryusaki', xp: 16240, country: 'CA', badges: 7, trend: '+56' },
    { rank: 6, name: 'Elena Rostova', xp: 15890, country: 'RU', badges: 6, trend: '+75' },
    { rank: 7, name: 'Liam Davies', xp: 14200, country: 'AU', badges: 5, trend: '+45' }
  ],
  country: [
    { rank: 4, name: 'Ananya Rao', xp: 14800, country: 'IN', badges: 5, trend: '+90' },
    { rank: 5, name: 'Kabir Mehta', xp: 13900, country: 'IN', badges: 4, trend: '+20' },
    { rank: 6, name: 'Rohan Gupta', xp: 12800, country: 'IN', badges: 4, trend: '+35' }
  ],
  college: [
    { rank: 4, name: 'Dev Joshi', xp: 12100, college: 'IIT Bombay', badges: 3, trend: '+15' },
    { rank: 5, name: 'Tanvi Shah', xp: 11050, college: 'IIT Bombay', badges: 2, trend: '+10' }
  ],
  friends: [
    { rank: 4, name: 'Arjun Verma', xp: 11980, relation: 'Friend', badges: 4, trend: '+80' },
    { rank: 5, name: 'Kai Ryusaki', xp: 10400, relation: 'Friend', badges: 3, trend: '+15' }
  ]
};

function LeaderboardPage() {
  const { activeProfile } = useProfile();
  const [activeBoard, setActiveBoard] = useState('global');
  const [activePeriod, setActivePeriod] = useState('weekly');

  const currentPodium = useMemo(() => {
    // If active user is Aarav, show standard. If not, we customize the podium representation to let them see their new avatar!
    const base = mockPodiums[activeBoard] || mockPodiums.global;
    return base.map(user => {
      if (user.name === 'Aarav Singh' && activeProfile.id !== 'aarav') {
        return {
          ...user,
          name: activeProfile.name,
          avatar: activeProfile.avatar,
          xp: activeProfile.xp
        };
      }
      return user;
    });
  }, [activeBoard, activeProfile]);

  const currentList = useMemo(() => {
    let list = [...(mockLeaderboards[activeBoard] || mockLeaderboards.global)];
    
    // Scale XP if monthly is active to simulate monthly cumulative state
    if (activePeriod === 'monthly') {
      list = list.map(item => ({
        ...item,
        xp: Math.round(item.xp * 3.4)
      }));
    }

    // Dynamic insertion of active profile if they are not already in list
    const isUserInList = list.some(item => item.name === activeProfile.name || (activeProfile.id === 'aarav' && item.name === 'Aarav Singh'));
    const isUserInPodium = currentPodium.some(item => item.name === activeProfile.name);

    if (!isUserInList && !isUserInPodium) {
      // Append the custom active user at bottom
      const userXp = activePeriod === 'monthly' ? Math.round(activeProfile.xp * 3.4) : activeProfile.xp;
      list.push({
        rank: list.length + 4,
        name: activeProfile.name,
        xp: userXp,
        country: 'IN',
        badges: activeProfile.badges.length,
        trend: '+100'
      });
    }

    // Update Aarav stats dynamically if he is selected and has gained XP
    return list.map(item => {
      if (item.name === 'Aarav Singh' && activeProfile.id === 'aarav') {
        return {
          ...item,
          xp: activePeriod === 'monthly' ? Math.round(activeProfile.xp * 3.4) : activeProfile.xp,
          badges: activeProfile.badges.length
        };
      }
      // If it's the custom user
      if (item.name === activeProfile.name && activeProfile.id !== 'aarav') {
        return {
          ...item,
          xp: activePeriod === 'monthly' ? Math.round(activeProfile.xp * 3.4) : activeProfile.xp,
          badges: activeProfile.badges.length
        };
      }
      return item;
    });

  }, [activeBoard, activePeriod, activeProfile, currentPodium]);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100">
      
      {/* Header section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Arena Rankings</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Leaderboard</h1>
            <p className="mt-2 text-slate-400">See where you stack up. Switch filters to compare global stats, country, college, and friend standings.</p>
          </div>
          
          {/* Rank filters toggler */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {/* Period selector */}
            <div className="flex rounded-xl bg-slate-950/60 p-1 border border-white/5">
              <button
                onClick={() => setActivePeriod('weekly')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  activePeriod === 'weekly' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setActivePeriod('monthly')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  activePeriod === 'monthly' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Group selector */}
            <div className="flex flex-wrap rounded-xl bg-slate-950/60 p-1 border border-white/5">
              {[
                { id: 'global', label: 'Global' },
                { id: 'country', label: 'Country' },
                { id: 'college', label: 'College' },
                { id: 'friends', label: 'Friends' }
              ].map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => setActiveBoard(grp.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeBoard === grp.id ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Podium View (Top 3 Users) */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 flex flex-col justify-end card-hover-premium">
        <h3 className="text-base font-semibold text-white mb-8 text-center uppercase tracking-widest text-slate-500">🏆 Top Contributors</h3>
        
        {/* Flex layout for Podium elements */}
        <div className="flex flex-col sm:flex-row justify-center items-end gap-6 sm:gap-12 min-h-[220px]">
          
          {/* Second Place (Left) */}
          {currentPodium[1] && (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">{currentPodium[1].avatar}</span>
              <p className="text-xs font-semibold text-slate-200">{currentPodium[1].name}</p>
              <p className="text-[10px] text-cyan-300 font-medium">{(activePeriod === 'monthly' ? Math.round(currentPodium[1].xp * 3.4) : currentPodium[1].xp).toLocaleString()} XP</p>
              
              {/* Podium Column */}
              <div className="w-24 sm:w-28 rounded-t-xl bg-gradient-to-t from-slate-900 via-indigo-950/60 to-indigo-900/60 border border-white/10 flex items-center justify-center mt-3 animate-podium-second shadow-lg shadow-indigo-950/30">
                <span className="text-2xl font-bold text-slate-400">#2</span>
              </div>
            </div>
          )}

          {/* First Place (Center) */}
          {currentPodium[0] && (
            <div className="flex flex-col items-center z-10 scale-105">
              <span className="text-4xl mb-1 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">{currentPodium[0].avatar}</span>
              <p className="text-xs font-bold text-white">{currentPodium[0].name}</p>
              <p className="text-[10px] text-amber-400 font-semibold">{(activePeriod === 'monthly' ? Math.round(currentPodium[0].xp * 3.4) : currentPodium[0].xp).toLocaleString()} XP</p>
              
              {/* Podium Column */}
              <div className="w-24 sm:w-28 rounded-t-xl bg-gradient-to-t from-slate-900 via-amber-950/60 to-amber-900/40 border border-amber-400/20 flex items-center justify-center mt-3 animate-podium-first shadow-xl shadow-amber-950/40">
                <span className="text-3xl font-extrabold text-amber-400">#1</span>
              </div>
            </div>
          )}

          {/* Third Place (Right) */}
          {currentPodium[2] && (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">{currentPodium[2].avatar}</span>
              <p className="text-xs font-semibold text-slate-200">{currentPodium[2].name}</p>
              <p className="text-[10px] text-cyan-300 font-medium">{(activePeriod === 'monthly' ? Math.round(currentPodium[2].xp * 3.4) : currentPodium[2].xp).toLocaleString()} XP</p>
              
              {/* Podium Column */}
              <div className="w-24 sm:w-28 rounded-t-xl bg-gradient-to-t from-slate-900 via-indigo-950/50 to-indigo-950/40 border border-white/5 flex items-center justify-center mt-3 animate-podium-third shadow shadow-indigo-950/20">
                <span className="text-xl font-bold text-slate-500">#3</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main rank lists grid & XP distribution curve charts */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* Table Rankings List */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 overflow-hidden card-hover-premium">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Full Leaderboard Rankings</h3>
            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/20">
              Active Users Mode
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">{activeBoard === 'college' ? 'College' : 'Country/Rel'}</th>
                  <th className="pb-3 font-semibold text-center">Badges</th>
                  <th className="pb-3 font-semibold text-right">XP Points</th>
                  <th className="pb-3 font-semibold text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((entry) => {
                  const isYou = entry.name === activeProfile.name || (activeProfile.id === 'aarav' && entry.name === 'Aarav Singh');
                  return (
                    <tr
                      key={entry.name}
                      className={`border-b border-white/5 transition hover:bg-white/5 ${
                        isYou ? 'bg-indigo-500/10 text-indigo-200 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-3.5 font-bold">#{entry.rank}</td>
                      <td className="py-3.5 font-semibold text-white">{entry.name} {isYou && '(You)'}</td>
                      <td className="py-3.5 text-slate-400">{entry.college || entry.country || entry.relation}</td>
                      <td className="py-3.5 text-center font-bold text-cyan-300">{entry.badges}</td>
                      <td className="py-3.5 text-right font-bold text-white">{entry.xp.toLocaleString()}</td>
                      <td className="py-3.5 text-right text-emerald-300 font-semibold">{entry.trend}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSS distribution charts */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 flex flex-col justify-between card-hover-premium">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">XP Performance Curve</h3>
            <p className="text-xs text-slate-400 mb-6">Distribution scale of total claimed XP globally.</p>
            
            {/* Simple distribution histogram curve */}
            <div className="space-y-4">
              {[
                { label: 'Elite Tier (Top 1%)', range: '15k+ XP', users: '142 users', percent: 12 },
                { label: 'Pro Tier (Top 10%)', range: '10k–15k XP', users: '956 users', percent: 35 },
                { label: 'Core Tier (Top 50%)', range: '5k–10k XP', users: '4.8k users', percent: 80 },
                { label: 'Novice Tier', range: '<5k XP', users: '12k users', percent: 100 }
              ].map((bar, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{bar.label}</span>
                    <span className="text-slate-500">{bar.range}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${bar.percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{bar.users}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500 leading-relaxed">
            🏆 <strong>Weekly Reset</strong>: Ranks update every Sunday at 00:00 UTC. Top 3 contenders receive unique season trophy profile badges.
          </div>
        </div>

      </div>
    </div>
  );
}

export default LeaderboardPage;
