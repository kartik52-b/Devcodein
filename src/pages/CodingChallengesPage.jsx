import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { ArrowRight, Bookmark, BookOpenCheck, Clock3, Flame, Sparkles, TimerReset, Trophy } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { challenges as initialChallenges, categories as challengeCategories, difficulties as challengeDifficulties } from '../data/challengesData';

const challengeBank = initialChallenges.map((challenge, index) => ({
  ...challenge,
  acceptanceRate: ['92%', '87%', '81%', '76%'][index % 4],
  daily: index === 0,
  weekly: index === 1
}));

const languageOptions = ['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'php', 'swift', 'kotlin'];

function CodingChallengesPage() {
  const { activeProfile, addSolvedChallenge, toggleBookmark } = useProfile();

  const [view, setView] = useState('explorer');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('xp');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(challengeBank[0].id);
  const [code, setCode] = useState(challengeBank[0].starterCode);
  const [language, setLanguage] = useState('javascript');
  const [status, setStatus] = useState('Ready to run');
  const [output, setOutput] = useState('Run your solution to view console output and test results.');
  const [executionTime, setExecutionTime] = useState('0.00 ms');
  const [memoryUsage, setMemoryUsage] = useState('0 MB');
  const [customCase, setCustomCase] = useState('nums = [2, 7, 11, 15], target = 9');
  const [sessionTime, setSessionTime] = useState(0);
  const [bestTime, setBestTime] = useState(240);
  const [averageTime, setAverageTime] = useState(320);
  const [totalPracticeTime, setTotalPracticeTime] = useState(1820);
  const [dailyStreak, setDailyStreak] = useState(activeProfile.streak || 0);
  const [weeklyStreak, setWeeklyStreak] = useState(5);
  const [monthlyStreak, setMonthlyStreak] = useState(12);
  const [longestStreak, setLongestStreak] = useState(activeProfile.longestStreak || 0);
  const [missedDays, setMissedDays] = useState(1);
  const [freezeCount, setFreezeCount] = useState(2);
  const [notes, setNotes] = useState('Capture insights, edge cases, and one-line takeaways.');
  const [aiHint, setAiHint] = useState('Use a hash map to reduce the search complexity.');
  const [aiExplain, setAiExplain] = useState('The core idea is to trade extra memory for faster lookups.');

  const pageSize = 4;

  useEffect(() => {
    const interval = window.setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    return () => window.clearInterval(interval);
  }, [view]);

  useEffect(() => {
    if (view !== 'workspace') {
      setSessionTime(0);
    }
  }, [selectedId, view]);

  const filteredChallenges = useMemo(() => {
    const filtered = challengeBank.filter((challenge) => {
      const matchesSearch = `${challenge.title} ${challenge.category} ${challenge.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficulty === 'All' || challenge.difficulty === difficulty;
      const matchesCategory = category === 'All' || challenge.category === category;
      return matchesSearch && matchesDifficulty && matchesCategory;
    });

    return filtered.sort((left, right) => {
      if (sortBy === 'xp') return right.xp - left.xp;
      if (sortBy === 'name') return left.title.localeCompare(right.title);
      return left.difficulty.localeCompare(right.difficulty);
    });
  }, [searchTerm, difficulty, category, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, difficulty, category, sortBy]);

  useEffect(() => {
    if (!filteredChallenges.some((challenge) => challenge.id === selectedId) && filteredChallenges.length > 0) {
      setSelectedId(filteredChallenges[0].id);
    }
  }, [filteredChallenges, selectedId]);

  useEffect(() => {
    const current = filteredChallenges.find((challenge) => challenge.id === selectedId) || challengeBank.find((challenge) => challenge.id === selectedId) || challengeBank[0];
    if (current) {
      setCode(current.starterCode);
      setAiHint(`Hint: ${current.hints[0]}`);
      setAiExplain(`Explain: ${current.solution}`);
      setStatus('Ready to run');
      setOutput('Run your solution to view console output and test results.');
    }
  }, [selectedId, filteredChallenges]);

  const selectedChallenge = filteredChallenges.find((challenge) => challenge.id === selectedId) || filteredChallenges[0] || challengeBank[0];
  const totalPages = Math.max(1, Math.ceil(filteredChallenges.length / pageSize));
  const pagedChallenges = filteredChallenges.slice((page - 1) * pageSize, page * pageSize);
  const isBookmarked = activeProfile.bookmarks.includes(selectedChallenge.id);
  const isSolved = activeProfile.solvedIds.includes(selectedChallenge.id);
  const coins = Math.floor(activeProfile.xp / 250);
  const levelProgress = Math.min(100, ((activeProfile.xp % 1000) / 1000) * 100);

  const handleOpenWorkspace = (challengeId) => {
    setSelectedId(challengeId);
    setView('workspace');
  };

  const handleRunCode = () => {
    setStatus('Executing tests...');
    const time = Math.round(40 + Math.random() * 55);
    const mem = Math.round(12 + Math.random() * 9);
    setExecutionTime(`${time.toFixed(2)} ms`);
    setMemoryUsage(`${mem} MB`);
    setOutput(`> Running custom case: ${customCase}\n> ✅ ${selectedChallenge.title} generated a valid output.\n> Exposed 2 sample states and passed the current test harness.`);
  };

  const handleSubmitCode = () => {
    setStatus('Submission accepted');
    addSolvedChallenge(selectedChallenge.id, selectedChallenge.xp, selectedChallenge.title);
    setOutput(`✔ ${selectedChallenge.title} accepted. +${selectedChallenge.xp} XP added to your profile.`);
    setBestTime((prev) => Math.min(prev, Math.max(60, sessionTime)));
    setAverageTime((prev) => Math.round((prev + sessionTime) / 2));
    setTotalPracticeTime((prev) => prev + sessionTime);
    setDailyStreak((prev) => prev + 1);
    setLongestStreak((prev) => Math.max(prev, dailyStreak + 1));
    setWeeklyStreak((prev) => prev + 1);
    setMonthlyStreak((prev) => prev + 1);
    setMissedDays((prev) => Math.max(0, prev - 1));
  };

  const handleAiHint = () => {
    setAiHint(`${selectedChallenge.title} tip: ${selectedChallenge.hints[0]}`);
  };

  const handleAiExplain = () => {
    setAiExplain(`### Why this approach works\n- Break the problem into a single-pass flow.\n- Keep state compact and deterministic.\n- Test against edge cases before submitting.`);
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 text-slate-100 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-[#5ed29c]">Competitive Programming Studio</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">CodeNest Challenge Arena</h1>
              <p className="mt-4 text-slate-400">
                Explore premium problems, practice under live timers, and climb the XP ladder with a truly premium problem-solving experience.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300/80">Live status</p>
              <p className="mt-2 font-semibold text-white">{status}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">XP</p>
              <p className="mt-2 text-xl font-semibold text-white">{activeProfile.xp}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Coins</p>
              <p className="mt-2 text-xl font-semibold text-white">{coins}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Daily streak</p>
              <p className="mt-2 text-xl font-semibold text-white">{dailyStreak} days</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Level progress</p>
              <p className="mt-2 text-xl font-semibold text-white">{Math.round(levelProgress)}%</p>
            </div>
          </div>
        </section>

        {view === 'explorer' ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="glass rounded-[2rem] border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Challenge explorer</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Premium problem library</h2>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                  {filteredChallenges.length} live problems
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                <label className="rounded-[1.1rem] border border-white/10 bg-slate-950/60 p-3">
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-slate-500">Search</span>
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title or topic" className="w-full bg-transparent text-sm text-white outline-none" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-[1.1rem] border border-white/10 bg-slate-950/60 p-3">
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-slate-500">Difficulty</span>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none">
                      {challengeDifficulties.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="rounded-[1.1rem] border border-white/10 bg-slate-950/60 p-3">
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-slate-500">Category</span>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none">
                      {challengeCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={() => setSortBy('xp')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sortBy === 'xp' ? 'bg-[#5ed29c] text-[#07100c]' : 'bg-white/5 text-slate-300'}`}>Sort by XP</button>
                <button onClick={() => setSortBy('name')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sortBy === 'name' ? 'bg-[#5ed29c] text-[#07100c]' : 'bg-white/5 text-slate-300'}`}>Alphabetical</button>
                <button onClick={() => setSortBy('difficulty')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sortBy === 'difficulty' ? 'bg-[#5ed29c] text-[#07100c]' : 'bg-white/5 text-slate-300'}`}>Difficulty</button>
              </div>

              <div className="mt-5 space-y-3">
                {pagedChallenges.map((challenge) => {
                  const solved = activeProfile.solvedIds.includes(challenge.id);
                  return (
                    <button key={challenge.id} onClick={() => handleOpenWorkspace(challenge.id)} className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-cyan-400/40 hover:bg-slate-900/80">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">#{String(challenge.id).slice(0, 3)}</span>
                            {solved ? <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">Solved</span> : null}
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-white">{challenge.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">{challenge.description}</p>
                        </div>
                        <div className="text-right text-sm text-slate-300">
                          <p className="font-semibold text-white">{challenge.difficulty}</p>
                          <p className="mt-1 text-cyan-200">{challenge.category}</p>
                          <p className="mt-1 text-[#5ed29c]">{challenge.acceptanceRate} accept</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="rounded-full border border-white/10 px-2.5 py-1">XP {challenge.xp}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">{challenge.acceptanceRate} acceptance</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">{solved ? 'Solved' : 'Unsolved'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Previous</button>
                <p className="text-sm text-slate-400">Page {page} / {totalPages}</p>
                <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Next</button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Today’s sprint</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Daily challenge</h3>
                  </div>
                  <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">Live now</div>
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-lg font-semibold text-white">{challengeBank[0].title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">Finish before midnight and earn bonus XP, a streak boost, and a fresh badge unlock.</p>
                </div>
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Weekly focus</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Stack & trees</h3>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">+250 XP</div>
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-300">Weekly reward track includes a streak freeze, one bonus badge, and an accelerated XP multiplier.</p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="space-y-4">
              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Challenge workspace</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedChallenge.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleBookmark(selectedChallenge.id)} className={`rounded-full px-3 py-2 text-sm font-semibold ${isBookmarked ? 'bg-amber-500/10 text-amber-200' : 'bg-white/5 text-slate-300'}`}>
                      <Bookmark size={14} className="mr-1 inline" /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    <button onClick={() => setView('explorer')} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">Back to list</button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Difficulty</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedChallenge.difficulty}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">XP reward</p>
                    <p className="mt-2 text-lg font-semibold text-white">+{selectedChallenge.xp}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Acceptance</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedChallenge.acceptanceRate}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Problem statement</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{selectedChallenge.description}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Examples</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        {selectedChallenge.examples.map((example, index) => (
                          <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="font-semibold text-white">Example {index + 1}</p>
                            <p className="mt-1">Input: {example.input}</p>
                            <p>Output: {example.output}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Constraints</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">1 ≤ n ≤ 10^5 • Time complexity target is O(n) or O(log n) depending on the pattern.</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Hints</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        {selectedChallenge.hints.map((hint, index) => <li key={index} className="rounded-xl border border-white/10 bg-white/5 p-2">💡 {hint}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Code editor</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Monaco workspace</h3>
                  </div>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    {languageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10">
                  <Editor height="320px" defaultLanguage="javascript" language={language} theme="vs-dark" value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={handleRunCode} className="rounded-full bg-gradient-to-r from-[#5ed29c] to-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#07100c]">Run Code</button>
                  <button onClick={handleSubmitCode} className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300">Submit Code</button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live timer</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Current session</h3>
                  </div>
                  <div className="rounded-full border border-[#5ed29c]/20 bg-[#5ed29c]/10 px-3 py-1 text-sm text-[#5ed29c]">
                    {sessionTime}s
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Best time</p>
                    <p className="mt-2 text-lg font-semibold text-white">{bestTime}s</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Average time</p>
                    <p className="mt-2 text-lg font-semibold text-white">{averageTime}s</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Total practice</p>
                    <p className="mt-2 text-lg font-semibold text-white">{totalPracticeTime}s</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Streak freeze</p>
                    <p className="mt-2 text-lg font-semibold text-white">{freezeCount}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Streak system</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Momentum metrics</h3>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">Rewarding</div>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ['Daily', dailyStreak],
                    ['Weekly', weeklyStreak],
                    ['Monthly', monthlyStreak],
                    ['Longest', longestStreak],
                    ['Missed', missedDays]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-[1.1rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                      <span>{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI mentor</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Instant guidance</h3>
                  </div>
                  <Sparkles size={18} className="text-[#5ed29c]" />
                </div>
                <div className="mt-4 space-y-3">
                  <button onClick={handleAiHint} className="flex w-full items-center justify-between rounded-[1.1rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-300">
                    <span>AI Hint</span>
                    <ArrowRight size={16} className="text-[#5ed29c]" />
                  </button>
                  <button onClick={handleAiExplain} className="flex w-full items-center justify-between rounded-[1.1rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-300">
                    <span>AI Explain</span>
                    <BookOpenCheck size={16} className="text-[#5ed29c]" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">{aiHint}</div>
                  <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">{aiExplain}</div>
                </div>
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Console</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Execution output</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">Live</div>
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4 text-sm leading-7 text-slate-300">
                  <p>{output}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="rounded-full border border-white/10 px-2.5 py-1">Time: {executionTime}</span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1">Memory: {memoryUsage}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodingChallengesPage;
