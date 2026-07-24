import { useState } from 'react';

const battleModes = [
  {
    id: 'array-linked-list',
    title: 'Array vs Linked List',
    tagline: 'Fast indexing versus fluid mutation.',
    left: {
      name: 'Array',
      accent: 'from-cyan-400 to-sky-500',
      values: ['10', '20', '30'],
      note: 'Contiguous storage enables O(1) random access.',
      layout: 'row'
    },
    right: {
      name: 'Linked List',
      accent: 'from-violet-400 to-fuchsia-500',
      values: ['10', '20', '30'],
      note: 'Nodes connect dynamically for O(1) head insertions.',
      layout: 'chain'
    },
    speed: { left: 92, right: 70 },
    memory: { left: 74, right: 58 },
    stats: [
      ['Access', 'O(1) / O(n)'],
      ['Insert', 'O(n) / O(1)'],
      ['Delete', 'O(n) / O(1)']
    ]
  },
  {
    id: 'stack-queue',
    title: 'Stack vs Queue',
    tagline: 'LIFO discipline versus FIFO flow.',
    left: {
      name: 'Stack',
      accent: 'from-emerald-400 to-lime-500',
      values: ['A', 'B', 'C'],
      note: 'Push/pop on one end keeps the latest item front and center.',
      layout: 'stack'
    },
    right: {
      name: 'Queue',
      accent: 'from-amber-400 to-orange-500',
      values: ['A', 'B', 'C'],
      note: 'Enqueue/dequeue keeps order stable for pipelines and scheduling.',
      layout: 'queue'
    },
    speed: { left: 82, right: 78 },
    memory: { left: 65, right: 63 },
    stats: [
      ['Push/Enqueue', 'O(1) / O(1)'],
      ['Pop/Dequeue', 'O(1) / O(1)'],
      ['Search', 'O(n) / O(n)']
    ]
  },
  {
    id: 'heap-bst',
    title: 'Heap vs BST',
    tagline: 'Priority-driven structure versus ordered hierarchy.',
    left: {
      name: 'Heap',
      accent: 'from-rose-400 to-red-500',
      values: ['50', '20', '30', '10'],
      note: 'Uses a partial ordering model for quick priority access.',
      layout: 'row'
    },
    right: {
      name: 'BST',
      accent: 'from-sky-400 to-cyan-500',
      values: ['50', '20', '80', '10'],
      note: 'Keeps sorted order for rapid predecessor and successor logic.',
      layout: 'row'
    },
    speed: { left: 88, right: 76 },
    memory: { left: 72, right: 69 },
    stats: [
      ['Insert', 'O(log n) / O(log n)'],
      ['Delete', 'O(log n) / O(log n)'],
      ['Min/Max', 'O(1) / O(log n)']
    ]
  },
  {
    id: 'hashmap-treemap',
    title: 'HashMap vs TreeMap',
    tagline: 'Near-constant lookup versus ordered traversal.',
    left: {
      name: 'HashMap',
      accent: 'from-indigo-400 to-violet-500',
      values: ['A:1', 'B:2', 'C:3'],
      note: 'Average O(1) lookups make it ideal for fast key-value access.',
      layout: 'grid'
    },
    right: {
      name: 'TreeMap',
      accent: 'from-fuchsia-400 to-pink-500',
      values: ['A:1', 'B:2', 'C:3'],
      note: 'Sorted traversal and range queries come with O(log n) lookups.',
      layout: 'grid'
    },
    speed: { left: 90, right: 71 },
    memory: { left: 67, right: 73 },
    stats: [
      ['Lookup', 'O(1) avg / O(log n)'],
      ['Order', 'Unordered / Sorted'],
      ['Range Query', 'Limited / Strong']
    ]
  }
];

const actions = ['Insertion', 'Deletion', 'Searching'];

function renderVisual(values, layout, accent, activeAction, isActive) {
  if (layout === 'stack') {
    return (
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={`rounded-2xl border border-white/10 px-3 py-2 text-center text-sm font-medium transition-all duration-500 ${isActive && index === values.length - 1 ? 'translate-y-0 scale-[1.02] bg-gradient-to-r ' + accent + ' text-slate-950' : 'bg-slate-950/70 text-slate-200'}`}
          >
            {value}
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'queue') {
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={`rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium transition-all duration-500 ${isActive && index === 0 ? 'scale-[1.02] bg-gradient-to-r ' + accent + ' text-slate-950' : 'bg-slate-950/70 text-slate-200'}`}
          >
            {value}
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'chain') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex items-center gap-2">
            <div className={`rounded-2xl border border-white/10 px-3 py-2 transition-all duration-500 ${isActive && index === 0 ? 'bg-gradient-to-r ' + accent + ' text-slate-950' : 'bg-slate-950/70 text-slate-200'}`}>
              {value}
            </div>
            {index < values.length - 1 && <span className="text-slate-500">→</span>}
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={`rounded-2xl border border-white/10 px-3 py-3 text-sm transition-all duration-500 ${isActive && index === 0 ? 'bg-gradient-to-r ' + accent + ' text-slate-950' : 'bg-slate-950/70 text-slate-200'}`}
          >
            {value}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={`rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium transition-all duration-500 ${isActive && index === 1 ? 'scale-[1.02] bg-gradient-to-r ' + accent + ' text-slate-950' : 'bg-slate-950/70 text-slate-200'}`}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function DsaBattleArena() {
  const [selectedMode, setSelectedMode] = useState(battleModes[0].id);
  const [activeAction, setActiveAction] = useState('Insertion');

  const current = battleModes.find((mode) => mode.id === selectedMode) ?? battleModes[0];

  const actionLabel = `${activeAction} demo`;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">DSA battle arena</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Visualize the battle between core data structures.</h2>
        </div>
        <p className="max-w-2xl text-slate-400">Compare how each structure behaves under insertion, deletion, and search operations with animated visuals and clear complexity insights.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {battleModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              setSelectedMode(mode.id);
              setActiveAction('Insertion');
            }}
            className={`rounded-full px-4 py-2 text-sm transition ${selectedMode === mode.id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {mode.title}
          </button>
        ))}
      </div>

      <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-indigo-950/40 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">{current.tagline}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{current.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => setActiveAction(action)}
                className={`rounded-full px-3 py-2 text-sm transition ${activeAction === action ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {[current.left, current.right].map((side, index) => {
                const highlight = activeAction === 'Insertion' ? 0 : activeAction === 'Deletion' ? 1 : 2;
                return (
                  <div key={side.name} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                    <div className={`mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r ${side.accent}`} />
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">{side.name}</h4>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{actionLabel}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{side.note}</p>
                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      {renderVisual(side.values, side.layout, side.accent, activeAction, index === 0 || index === 1)}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                      <span>Complexity</span>
                      <span className="font-medium text-white">{current.stats[0][index === 0 ? 0 : 1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Speed comparison</p>
              <div className="mt-4 space-y-4">
                {[
                  ['Speed', current.speed.left, current.speed.right],
                  ['Memory', current.memory.left, current.memory.right]
                ].map(([label, leftValue, rightValue]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>{label}</span>
                      <span className="text-white">{label === 'Speed' ? `${leftValue}% / ${rightValue}%` : `${leftValue}% / ${rightValue}%`}</span>
                    </div>
                    <div className="grid gap-2">
                      <div className="h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${leftValue}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500" style={{ width: `${rightValue}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Time & space complexity</p>
              <div className="mt-4 space-y-3">
                {current.stats.map(([metric, value]) => (
                  <div key={metric} className="rounded-[1rem] border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{metric}</span>
                      <span>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DsaBattleArena;
