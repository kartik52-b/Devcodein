import { useEffect, useMemo, useState } from 'react';

const challenges = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    xp: 120,
    description: 'Return the indices of two numbers that add up to the target in a single pass.',
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: [
      'Use a hash map to track seen values.',
      'Think about checking the complement instead of looping twice.'
    ],
    solution: 'Store each number and its index as you iterate, then look up whether the complement has already been seen.',
    discussion: [
      'Best for interview prep on arrays and hash tables.',
      'Works well when you need constant-time lookups.'
    ],
    bookmarked: false
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    category: 'Stacks',
    xp: 180,
    description: 'Validate whether a string of brackets is balanced using a stack-based strategy.',
    starterCode: `function isValid(s) {
  const stack = [];
  const map = {')': '(', '}': '{', ']': '['};
  for (const char of s) {
    // add your logic here
  }
  return stack.length === 0;
}`,
    hints: [
      'Push opening brackets and pop on matching closers.',
      'A leftover stack means the string is invalid.'
    ],
    solution: 'Use a stack to track open brackets and validate each closing bracket against the last open one.',
    discussion: [
      'This is a classic stack challenge with simple but powerful logic.',
      'It also teaches you to reason about edge cases like empty input.'
    ],
    bookmarked: true
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Searching',
    xp: 140,
    description: 'Find a target value in a sorted array using logarithmic time complexity.',
    starterCode: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    // add your logic here
  }
  return -1;
}`,
    hints: [
      'Reduce the search space by halving it each iteration.',
      'Keep track of both left and right boundaries carefully.'
    ],
    solution: 'Compare the middle element to the target and discard half of the array each iteration.',
    discussion: [
      'Great for understanding divide-and-conquer thinking.',
      'This pattern shows up across many algorithmic problems.'
    ],
    bookmarked: false
  }
];

function CodingChallengesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(challenges[0].id);
  const [code, setCode] = useState(challenges[0].starterCode);
  const [bookmarks, setBookmarks] = useState(['valid-parentheses']);
  const [status, setStatus] = useState('Ready to run');

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const matchesSearch = `${challenge.title} ${challenge.category} ${challenge.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficulty === 'All' || challenge.difficulty === difficulty;
      const matchesCategory = category === 'All' || challenge.category === category;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [searchTerm, difficulty, category]);

  useEffect(() => {
    if (!filteredChallenges.some((challenge) => challenge.id === selectedId) && filteredChallenges.length > 0) {
      setSelectedId(filteredChallenges[0].id);
    }
  }, [filteredChallenges, selectedId]);

  useEffect(() => {
    const current = filteredChallenges.find((challenge) => challenge.id === selectedId) || challenges.find((challenge) => challenge.id === selectedId);
    if (current) {
      setCode(current.starterCode);
    }
  }, [selectedId, filteredChallenges]);

  const selectedChallenge = filteredChallenges.find((challenge) => challenge.id === selectedId) || filteredChallenges[0] || challenges[0];
  const isBookmarked = bookmarks.includes(selectedChallenge.id);

  const toggleBookmark = () => {
    setBookmarks((current) =>
      current.includes(selectedChallenge.id)
        ? current.filter((id) => id !== selectedChallenge.id)
        : [...current, selectedChallenge.id]
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_52%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Coding challenges</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Train with focused problems, instant feedback, and guided solutions.</h1>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Browse the problem list, filter by difficulty or category, then run or submit your code without leaving the experience.
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              <p className="text-slate-300">Current status</p>
              <p className="mt-1 text-lg font-semibold text-white">{status}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Problem list</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{filteredChallenges.length} active challenges</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                {bookmarks.length} bookmarked
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">Search</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search problems"
                  className="w-full border-none bg-transparent text-sm text-white outline-none"
                />
              </label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">Difficulty</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full border-none bg-transparent text-sm text-white outline-none">
                  <option value="All" className="bg-slate-900">All</option>
                  <option value="Easy" className="bg-slate-900">Easy</option>
                  <option value="Medium" className="bg-slate-900">Medium</option>
                </select>
              </label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full border-none bg-transparent text-sm text-white outline-none">
                  <option value="All" className="bg-slate-900">All</option>
                  <option value="Arrays" className="bg-slate-900">Arrays</option>
                  <option value="Stacks" className="bg-slate-900">Stacks</option>
                  <option value="Searching" className="bg-slate-900">Searching</option>
                </select>
              </label>
            </div>

            <div className="space-y-3">
              {filteredChallenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedId(challenge.id)}
                  className={`w-full rounded-[1.2rem] border p-4 text-left transition ${selectedChallenge.id === challenge.id ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{challenge.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{challenge.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-300">
                      <p>{challenge.difficulty}</p>
                      <p className="mt-1 text-cyan-300">+{challenge.xp} XP</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                    <span>{challenge.category}</span>
                    <span>{bookmarks.includes(challenge.id) ? 'Bookmarked' : 'Save'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Selected problem</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{selectedChallenge.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleBookmark} className={`rounded-full border px-3 py-2 text-sm ${isBookmarked ? 'border-amber-400/40 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                    {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                  </button>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">+{selectedChallenge.xp} XP</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">{selectedChallenge.difficulty}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">{selectedChallenge.category}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-lg leading-8 text-slate-300">{selectedChallenge.description}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => setStatus('Running code...')} className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white">Run Code</button>
                  <button onClick={() => setStatus('Submitted successfully')} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100">Submit Code</button>
                </div>

                <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-slate-900/80 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Starter code</h3>
                    <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Editor</span>
                  </div>
                  <textarea
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="min-h-[220px] w-full rounded-[1rem] border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold text-white">Hints</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                    {selectedChallenge.hints.map((hint) => (
                      <li key={hint} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">{hint}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold text-white">Solutions</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{selectedChallenge.solution}</p>
                </div>

                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold text-white">Discussion</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                    {selectedChallenge.discussion.map((topic) => (
                      <li key={topic} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CodingChallengesPage;
