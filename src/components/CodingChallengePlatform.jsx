import { useMemo, useState } from 'react';

const challenges = [
  {
    id: 1,
    title: 'Two Sum Match',
    difficulty: 'Easy',
    xp: 120,
    solved: true,
    bookmarked: true,
    statement: 'Find two numbers in an array that sum to the target value.',
    input: 'nums = [2, 7, 11, 15], target = 9',
    output: '[0, 1]',
    examples: ['Example 1: nums = [2,7,11,15], target = 9 -> [0,1]'],
    hints: ['Use a hash map to track seen values.'],
    testCases: ['Input: [2,7,11,15], 9 -> Output: [0,1]']
  },
  {
    id: 2,
    title: 'Balanced Parentheses',
    difficulty: 'Medium',
    xp: 220,
    solved: false,
    bookmarked: false,
    statement: 'Validate whether a string of brackets is balanced.',
    input: 's = "()[]{}"',
    output: 'true',
    examples: ['Example 1: "()[]{}" -> true'],
    hints: ['A stack is ideal for matching pairs.'],
    testCases: ['Input: "([{}])" -> Output: true']
  },
  {
    id: 3,
    title: 'Longest Path in Tree',
    difficulty: 'Hard',
    xp: 360,
    solved: false,
    bookmarked: true,
    statement: 'Compute the longest path from root to leaf in a binary tree.',
    input: 'root = [3,9,20,null,null,15,7]',
    output: '3',
    examples: ['Example 1: tree -> 3'],
    hints: ['Use DFS and track the maximum depth.'],
    testCases: ['Input: root -> Output: 3']
  }
];

function CodingChallengePlatform() {
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [code, setCode] = useState('function solve(nums, target) {\n  return [];\n}');
  const [status, setStatus] = useState('Ready');
  const [xp, setXp] = useState(1240);
  const [bookmarks, setBookmarks] = useState(challenges.filter((challenge) => challenge.bookmarked));

  const recentlySolved = useMemo(() => challenges.filter((challenge) => challenge.solved).slice(0, 2), []);

  const handleRun = () => {
    setStatus('Ran successfully');
  };

  const handleSubmit = () => {
    if (selectedChallenge.difficulty === 'Easy') {
      setXp((prev) => prev + selectedChallenge.xp);
      setStatus('Success! XP awarded');
      setBookmarks((prev) => prev.filter((item) => item.id !== selectedChallenge.id));
    } else {
      setStatus('Submitted for review');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Coding challenge platform</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Sharpen problem-solving with a premium challenge experience.</h2>
        </div>
        <p className="max-w-2xl text-slate-400">From daily drills to ranked problems, DevVerse turns practice into a beautiful ritual with XP, bookmarks, and polished submission flow.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {['Easy', 'Medium', 'Hard'].map((level) => (
          <div key={level} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {level}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="glass rounded-[2rem] border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Daily challenge</p>
                <p className="text-lg font-semibold text-white">{challenges[0].title}</p>
              </div>
              <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-300">Live today</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p>Earn bonus XP by completing today’s challenge before midnight.</p>
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Problem list</p>
              <p className="text-sm text-slate-400">{xp} XP</p>
            </div>
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedChallenge(challenge)}
                  className={`w-full rounded-[1.25rem] border p-4 text-left transition ${selectedChallenge.id === challenge.id ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-slate-950/60 hover:bg-slate-900/70'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{challenge.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{challenge.difficulty} • {challenge.xp} XP</p>
                    </div>
                    <div className="flex gap-2">
                      {challenge.solved && <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Solved</span>}
                      {challenge.bookmarked && <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">Bookmarked</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[2rem] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Selected problem</p>
                <h3 className="text-2xl font-semibold text-white">{selectedChallenge.title}</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{selectedChallenge.difficulty}</div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Problem statement</p>
                <p className="mt-2 leading-7 text-slate-300">{selectedChallenge.statement}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Input</p>
                <p className="mt-2 text-sm text-slate-300">{selectedChallenge.input}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Output</p>
                <p className="mt-2 text-sm text-slate-300">{selectedChallenge.output}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Examples</p>
                <p className="mt-2 text-sm text-slate-300">{selectedChallenge.examples[0]}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Code editor</p>
                <p className="text-lg font-semibold text-white">Write your solution</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">{status}</div>
            </div>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-4 min-h-[220px] w-full rounded-[1.25rem] border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-200 outline-none"
              spellCheck={false}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleRun} className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white transition hover:scale-[1.01]">Run Code</button>
              <button onClick={handleSubmit} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">Submit Code</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass rounded-[1.75rem] border border-white/10 p-5">
              <p className="text-sm text-slate-400">Hints</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{selectedChallenge.hints[0]}</p>
            </div>
            <div className="glass rounded-[1.75rem] border border-white/10 p-5">
              <p className="text-sm text-slate-400">Test cases</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{selectedChallenge.testCases[0]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Bookmarks</p>
          <div className="mt-3 space-y-2">
            {bookmarks.length ? bookmarks.map((item) => <p key={item.id} className="text-sm text-slate-300">• {item.title}</p>) : <p className="text-sm text-slate-400">No bookmarks yet.</p>}
          </div>
        </div>
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Recently solved</p>
          <div className="mt-3 space-y-2">
            {recentlySolved.map((item) => <p key={item.id} className="text-sm text-slate-300">• {item.title}</p>)}
          </div>
        </div>
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Success animation</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-300">Celebration state unlocked after successful submission.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CodingChallengePlatform;
