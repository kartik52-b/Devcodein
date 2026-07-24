import { useEffect, useMemo, useState } from 'react';

const algorithms = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    description: 'Repeatedly swaps adjacent elements until the array is sorted.',
    complexity: 'O(n²) time · O(1) space',
    steps: ['Start with unsorted array', 'Compare adjacent values', 'Swap if needed', 'Repeat until sorted']
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    description: 'Divides the array into halves and merges sorted halves back together.',
    complexity: 'O(n log n) time · O(n) space',
    steps: ['Split array into halves', 'Sort each half recursively', 'Merge sorted halves', 'Return merged output']
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    description: 'Chooses a pivot and partitions the array around it.',
    complexity: 'O(n log n) avg · O(n) worst',
    steps: ['Pick pivot', 'Partition elements', 'Recurse on subarrays', 'Combine results']
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    description: 'Builds the sorted array one item at a time from left to right.',
    complexity: 'O(n²) time · O(1) space',
    steps: ['Take next element', 'Insert into sorted part', 'Shift larger values', 'Continue']
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    description: 'Finds the smallest remaining value and places it in the next position.',
    complexity: 'O(n²) time · O(1) space',
    steps: ['Find minimum in unsorted part', 'Swap into place', 'Reduce search range', 'Repeat']
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    description: 'Efficiently finds a target by halving the search interval.',
    complexity: 'O(log n) time · O(1) space',
    steps: ['Set low and high pointers', 'Check midpoint', 'Move left or right', 'Stop when found']
  },
  {
    id: 'dfs',
    name: 'DFS',
    description: 'Explores as deep as possible before backtracking.',
    complexity: 'O(V + E) time · O(V) space',
    steps: ['Visit starting node', 'Traverse adjacent nodes', 'Backtrack when dead-end', 'Mark visited']
  },
  {
    id: 'bfs',
    name: 'BFS',
    description: 'Explores nodes level by level from the start.',
    complexity: 'O(V + E) time · O(V) space',
    steps: ['Start from root', 'Visit neighbors', 'Queue next nodes', 'Continue until empty']
  }
];

const baseArray = [9, 4, 7, 1, 6, 3];

function AlgorithmVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [arrayValues, setArrayValues] = useState(baseArray);

  const current = useMemo(() => algorithms.find((item) => item.id === selectedAlgorithm) ?? algorithms[0], [selectedAlgorithm]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % (current.steps.length + 3));
    }, 1200 / playbackSpeed);
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed, current.steps.length]);

  useEffect(() => {
    setIsPlaying(false);
    setStepIndex(0);
    setArrayValues(baseArray);
  }, [selectedAlgorithm]);

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
    setArrayValues(baseArray);
  };

  const activeLabel = current.steps[Math.min(stepIndex, current.steps.length - 1)] ?? current.steps[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Algorithm visualizer</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">See how classic algorithms behave in motion.</h2>
        </div>
        <p className="max-w-2xl text-slate-400">Play, pause, and reset each algorithm as it steps through its logic with a premium educational experience designed for modern learners.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {algorithms.map((algorithm) => (
          <button
            key={algorithm.id}
            onClick={() => setSelectedAlgorithm(algorithm.id)}
            className={`rounded-full px-4 py-2 text-sm transition ${selectedAlgorithm === algorithm.id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {algorithm.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-indigo-950/40 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Selected algorithm</p>
              <h3 className="text-2xl font-semibold text-white">{current.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setIsPlaying((prev) => !prev)} className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white transition hover:scale-[1.01]">
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={handleReset} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">Reset</button>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">Playback speed</p>
              <select value={playbackSpeed} onChange={(event) => setPlaybackSpeed(Number(event.target.value))} className="rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200">
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            <div className="flex min-h-[180px] items-end justify-center gap-3 rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6">
              {arrayValues.map((value, index) => (
                <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-[1rem] bg-gradient-to-t from-cyan-500 via-violet-500 to-fuchsia-400" style={{ height: `${value * 16}px`, minHeight: '36px' }} />
                  <span className="text-sm font-medium text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Current step</p>
            <p className="mt-2 text-lg font-semibold text-white">{activeLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[1.75rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Explanation panel</p>
            <p className="mt-3 leading-7 text-slate-300">{current.description}</p>
            <div className="mt-5 space-y-3">
              {current.steps.map((step) => (
                <div key={step} className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.75rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Complexity panel</p>
            <div className="mt-4 rounded-[1rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">{current.complexity}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-slate-400">Best case</p>
                <p className="mt-1 text-lg font-semibold text-white">Very efficient</p>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-slate-400">Worst case</p>
                <p className="mt-1 text-lg font-semibold text-white">Needs caution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AlgorithmVisualizer;
