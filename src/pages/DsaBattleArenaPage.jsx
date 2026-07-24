import { useState, useMemo, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import Editor from '@monaco-editor/react';

// Game level tracks
const dsaLevels = [
  { id: 'arrays', name: 'Arrays', xp: 200, category: 'Linear', desc: 'Contiguous memory slots for instant index lookup.' },
  { id: 'strings', name: 'Strings', xp: 250, category: 'Linear', desc: 'Chains of character arrays and buffer transformations.' },
  { id: 'searching', name: 'Searching', xp: 300, category: 'Algorithms', desc: 'Binary search partitions and divide-and-conquer offsets.' },
  { id: 'sorting', name: 'Sorting', xp: 350, category: 'Algorithms', desc: 'Pivot-based swaps, recursive merges, and partition bounds.' },
  { id: 'recursion', name: 'Recursion', xp: 400, category: 'Concepts', desc: 'Self-referencing call stack execution flows.' },
  { id: 'stack', name: 'Stack', xp: 450, category: 'Linear', desc: 'Last-In First-Out (LIFO) call frames management.' },
  { id: 'queue', name: 'Queue', xp: 500, category: 'Linear', desc: 'First-In First-Out (FIFO) messaging queue pipelines.' },
  { id: 'linkedlist', name: 'Linked List', xp: 550, category: 'Linear', desc: 'Scattered data nodes connected via reference pointer links.' },
  { id: 'hashing', name: 'Hashing', xp: 600, category: 'Data Structures', desc: 'Constant-time bucket indices key-value mappings.' },
  { id: 'trees', name: 'Trees', xp: 650, category: 'Hierarchical', desc: 'Parent-child branched folder-like structures.' },
  { id: 'bst', name: 'BST', xp: 700, category: 'Hierarchical', desc: 'Left-child < Parent < Right-child node bounds.' },
  { id: 'heap', name: 'Heap', xp: 750, category: 'Hierarchical', desc: 'Priority queues mapping min/max elements to root.' },
  { id: 'trie', name: 'Trie', xp: 800, category: 'Hierarchical', desc: 'Prefix trees for auto-complete dictionaries.' },
  { id: 'graphs', name: 'Graphs', xp: 850, category: 'Networks', desc: 'Interconnected nodes linked via directional edge lists.' },
  { id: 'dfs', name: 'DFS', xp: 900, category: 'Traversals', desc: 'Depth-first deep path traversal backtracking sweeps.' },
  { id: 'bfs', name: 'BFS', xp: 950, category: 'Traversals', desc: 'Breadth-first outer boundary level-order scans.' },
  { id: 'shortestpath', name: 'Shortest Path', xp: 1000, category: 'Traversals', desc: 'Dijkstra and Bellman-Ford node distance grids.' },
  { id: 'dp', name: 'Dynamic Programming', xp: 1200, category: 'Advanced', desc: 'Memoization tables and optimal sub-problem caching.' },
  { id: 'advanced', name: 'Advanced Algorithms', xp: 1500, category: 'Advanced', desc: 'Network flows, segment trees, and complex structures.' }
];

const mockQuizzes = {
  arrays: {
    q: 'What is the time complexity of looking up an element in a contiguous Array by its offset index?',
    options: ['O(1) Constant Time', 'O(N) Linear Time', 'O(log N) Logarithmic', 'O(N^2) Quadratic'],
    ans: 0
  },
  strings: {
    q: 'How do you check if two strings are anagrams of each other optimally?',
    options: ['Sort both strings (O(N log N))', 'Compare string length bounds only', 'Compare character frequency maps (O(N))', 'Double nested iteration check'],
    ans: 2
  },
  searching: {
    q: 'Binary Search requires the source elements collection to be:',
    options: ['Unsorted', 'Sorted', 'Partially Null', 'Stored in a Stack'],
    ans: 1
  },
  sorting: {
    q: 'Which sorting algorithm has a guaranteed worst-case execution complexity of O(N log N)?',
    options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'],
    ans: 1
  },
  recursion: {
    q: 'What error triggers if a recursive program does not specify or reach its base case?',
    options: ['NullPointerException', 'StackOverflowError', 'OutOfMemoryError', 'InfiniteLoopException'],
    ans: 1
  }
};

const mockCodes = {
  arrays: 'function getElement(arr, index) {\n  // Return item at index\n  return arr[index];\n}',
  strings: 'function isAnagram(s1, s2) {\n  if (s1.length !== s2.length) return false;\n  // Write frequency check logic...\n  return true;\n}',
  searching: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while(left <= right) {\n    let mid = Math.floor((left + right)/2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
  sorting: 'function bubbleSort(arr) {\n  for(let i=0; i<arr.length; i++) {\n    for(let j=0; j<arr.length-i-1; j++) {\n      if(arr[j] > arr[j+1]) {\n        let t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;\n      }\n    }\n  }\n  return arr;\n}',
  recursion: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}'
};

function DsaBattleArenaPage() {
  const { activeProfile, addXp, updateActiveProfile } = useProfile();
  
  // Game views: 'map', 'lesson', 'battle'
  const [currentView, setCurrentView] = useState('map');
  const [selectedLevelId, setSelectedLevelId] = useState('arrays');
  const [lessonStep, setLessonStep] = useState(1); // 1: Learn, 2: Watch, 3: Solve, 4: Quiz, 5: Code, 6: Timed Boss

  // Visualizer interactive states
  const [visualizerData, setVisualizerData] = useState([15, 42, 28, 91, 56]);
  const [selectedVisualizerIndex, setSelectedVisualizerIndex] = useState(-1);
  const [pointerIndex, setPointerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualSpeed, setVisualSpeed] = useState(1000);

  // Lesson quiz & code sandbox states
  const [quizSelection, setQuizSelection] = useState(-1);
  const [codeDraft, setCodeDraft] = useState('');
  const [runLogs, setRunLogs] = useState('Sandbox Ready.');
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [confettiCoords, setConfettiCoords] = useState([]);

  // Battle Mode states (unlocked after level 5)
  const [battleLeft, setBattleLeft] = useState('array');
  const [battleRight, setBattleRight] = useState('linkedlist');
  const [battleMetricActive, setBattleMetricActive] = useState('speed');

  // Load levels unlocked state dynamically based on user solvedCount / progress
  const unlockedLevelIds = useMemo(() => {
    // New user starts with only 'arrays' unlocked
    if (activeProfile.xp === 0) {
      return ['arrays'];
    }
    // Aarav default has levels unlocked up to Stack (which is the 6th level)
    return ['arrays', 'strings', 'searching', 'sorting', 'recursion', 'stack'];
  }, [activeProfile.xp]);

  // Visualizer play timer effect
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setPointerIndex((prev) => {
          if (prev >= visualizerData.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, visualSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, visualizerData, visualSpeed]);

  const handleOpenLevel = (levelId) => {
    if (!unlockedLevelIds.includes(levelId)) {
      alert('Level is locked. Complete previous nodes to advance!');
      return;
    }
    setSelectedLevelId(levelId);
    setLessonStep(1);
    setCodeDraft(mockCodes[levelId] || 'function solve() {\n  return;\n}');
    setCurrentView('lesson');
  };

  const triggerConfettiExplosion = () => {
    // Create random confetti pieces
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20,
      color: ['#818cf8', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 1.5
    }));
    setConfettiCoords(particles);
    setIsConfettiActive(true);
    setTimeout(() => setIsConfettiActive(false), 3000);
  };

  const handleLessonSuccess = () => {
    const level = dsaLevels.find((l) => l.id === selectedLevelId) || dsaLevels[0];
    const xpReward = level.xp;
    
    // Add XP to profile context
    const { leveledUp, level: nextLevel } = addXp(xpReward);
    triggerConfettiExplosion();

    // Log this topic in profile completed roadmaps
    updateActiveProfile((prev) => {
      const nextMilestones = [...prev.completedMilestones];
      if (!nextMilestones.includes(selectedLevelId)) {
        nextMilestones.push(selectedLevelId);
      }
      return {
        ...prev,
        completedMilestones: nextMilestones,
        solvedCount: prev.solvedCount + 1,
        recentActivity: [`Cleared ${level.name} Level`, ...prev.recentActivity].slice(0, 10),
        history: [
          { id: Date.now(), label: `Completed ${level.name} Lesson`, time: 'Just now', reward: `+${xpReward} XP` },
          ...prev.history
        ]
      };
    });

    alert(leveledUp ? `Leveled up to Level ${nextLevel}! Unlocked next node!` : `Level cleared! Awarded +${xpReward} XP.`);
    setCurrentView('map');
  };

  // Interactive Visualizer Operators
  const handleVisualizerInsert = () => {
    const newVal = Math.floor(Math.random() * 90) + 10;
    setVisualizerData(prev => [...prev, newVal]);
    setRunLogs(`Inserted element ${newVal} at index ${visualizerData.length}.`);
  };

  const handleVisualizerDelete = () => {
    if (visualizerData.length === 0) return;
    const removed = visualizerData[visualizerData.length - 1];
    setVisualizerData(prev => prev.slice(0, -1));
    setRunLogs(`Deleted element ${removed} from index ${visualizerData.length - 1}.`);
  };

  const handleVisualizerSearch = () => {
    setIsPlaying(true);
    setPointerIndex(0);
    setRunLogs('Scanning array linearly to look up targets...');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100 min-h-screen relative">
      
      {/* Confetti canvas animation */}
      {isConfettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {confettiCoords.map((c, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: c.x,
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 1. MAP VIEW (Level Progress Path) */}
      {currentView === 'map' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">DSA Academy</p>
                <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Interactive Battle Arena</h1>
                <p className="mt-2 text-slate-400">Level up your DSA knowledge like a game. Complete quizzes, visual checks, and live coding modules to unlock the path.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setCurrentView('battle')}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 text-xs font-semibold text-white hover:scale-105 transition btn-micro"
                >
                  ⚔️ Open Battle Comparison Mode
                </button>
              </div>
            </div>
          </div>

          {/* Gamified Road Map Nodes */}
          <div className="glass rounded-[2rem] border border-white/10 p-8 flex flex-col items-center space-y-6">
            <h3 className="text-lg font-bold text-white text-center uppercase tracking-widest text-slate-500">🗺️ Academy Quest Map</h3>
            
            {/* The vertical node track */}
            <div className="relative flex flex-col items-center gap-12 w-full max-w-md pt-4">
              
              {/* Vertical connecting line */}
              <div className="absolute top-8 bottom-8 w-1 bg-slate-800 rounded z-0" />

              {dsaLevels.map((lvl, index) => {
                const isUnlocked = unlockedLevelIds.includes(lvl.id);
                const isCompleted = activeProfile.completedMilestones.includes(lvl.id);
                
                let nodeStyle = 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed';
                if (isUnlocked) nodeStyle = 'border-indigo-400 bg-indigo-500/10 text-indigo-300 hover:scale-105 shadow';
                if (isCompleted) nodeStyle = 'border-emerald-400 bg-emerald-500/15 text-emerald-300 hover:scale-105';

                // Alternating side offsets for a nice wave curve path
                const offsetClass = index % 2 === 0 ? 'md:translate-x-12' : 'md:-translate-x-12';

                return (
                  <div key={lvl.id} className={`flex items-center gap-4 z-10 w-full md:w-auto ${offsetClass} transition-all`}>
                    <button
                      onClick={() => handleOpenLevel(lvl.id)}
                      className={`h-16 w-16 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${nodeStyle}`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </button>
                    <div className="max-w-[200px]">
                      <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{lvl.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{lvl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. LESSON SCREEN PANEL */}
      {currentView === 'lesson' && (
        <div className="space-y-6">
          {/* Header lesson bar */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Lesson Workspace</p>
              <h2 className="text-xl font-bold text-white mt-1">
                {dsaLevels.find(l => l.id === selectedLevelId)?.name} Module
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('map')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 btn-micro"
            >
              ← Back to Map
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Left Column: Lesson Flow Step components */}
            <div className="glass rounded-[2rem] border border-white/10 p-6 space-y-6 flex flex-col justify-between min-h-[500px]">
              <div>
                {/* Lesson Steps Indicators */}
                <div className="flex justify-between border-b border-white/10 pb-4 mb-4 text-xs font-bold text-slate-400">
                  <span className={lessonStep >= 1 ? 'text-indigo-400' : ''}>1. Learn</span>
                  <span className={lessonStep >= 2 ? 'text-indigo-400' : ''}>2. Watch</span>
                  <span className={lessonStep >= 3 ? 'text-indigo-400' : ''}>3. Practice Quiz</span>
                  <span className={lessonStep >= 4 ? 'text-indigo-400' : ''}>4. Code</span>
                  <span className={lessonStep >= 5 ? 'text-indigo-400' : ''}>5. Mini Boss</span>
                </div>

                {/* Step 1: Learn Theory */}
                {lessonStep === 1 && (
                  <div className="space-y-4 animate-slide-up">
                    <h3 className="text-lg font-bold text-white">Conceptual Overview</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Structures within this data domain represent arrays of elements mapped in sequential coordinates. They allow instantaneous element access via index offset lookups because the compiler immediately computes target addresses directly in memory.
                    </p>
                    <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
                      <p className="text-xs text-slate-400 font-bold">Key Characteristics:</p>
                      <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                        <li>Index access is O(1) constant bounds.</li>
                        <li>Insertion in the middle triggers element shifts O(N).</li>
                        <li>High cache-locality saves search time inside CPUs.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 2: Watch Animation Visualizer */}
                {lessonStep === 2 && (
                  <div className="space-y-4 animate-slide-up">
                    <h3 className="text-lg font-bold text-white">Interactive Visualizer Playground</h3>
                    <p className="text-xs text-slate-400">Trigger operations below to watch elements updates with transitions.</p>
                    
                    {/* Visualizer output grid */}
                    <div className="flex flex-wrap items-end justify-center gap-3.5 h-36 border-b border-white/10 pb-4">
                      {visualizerData.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 group">
                          {pointerIndex === idx && (
                            <span className="text-[10px] text-cyan-300 font-bold animate-bounce">▼ pointer</span>
                          )}
                          <div
                            onClick={() => setSelectedVisualizerIndex(idx)}
                            className={`w-12 rounded-t-lg transition-all duration-300 flex items-center justify-center text-xs font-bold text-slate-950 ${
                              selectedVisualizerIndex === idx
                                ? 'bg-cyan-300 scale-105 border-2 border-cyan-400 shadow-lg'
                                : 'bg-gradient-to-t from-indigo-500 to-cyan-400 hover:from-cyan-300'
                            }`}
                            style={{ height: `${Math.min(100, Math.max(25, val))}%` }}
                          >
                            {val}
                          </div>
                          <span className="text-[10px] text-slate-500">[{idx}]</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button onClick={handleVisualizerInsert} className="rounded-lg bg-indigo-500/20 border border-indigo-400/20 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/30 transition btn-micro">Insert Node</button>
                      <button onClick={handleVisualizerDelete} className="rounded-lg bg-rose-500/20 border border-rose-400/20 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/30 transition btn-micro">Delete Node</button>
                      <button onClick={handleVisualizerSearch} className="rounded-lg bg-cyan-400 text-slate-950 px-3.5 py-1.5 text-xs font-semibold hover:scale-105 transition btn-micro">Linear Search</button>
                      <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
                        <span>Speed</span>
                        <input
                          type="range"
                          min="300"
                          max="2000"
                          value={visualSpeed}
                          onChange={(e) => setVisualSpeed(parseInt(e.target.value))}
                          className="w-16"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Practice Quiz */}
                {lessonStep === 3 && (
                  <div className="space-y-4 animate-slide-up">
                    <h3 className="text-lg font-bold text-white">Concept Verification Quiz</h3>
                    <p className="text-xs text-slate-400">Answer correctly to unlock coding challenges.</p>
                    
                    {mockQuizzes[selectedLevelId] ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-200">{mockQuizzes[selectedLevelId].q}</p>
                        <div className="grid gap-2">
                          {mockQuizzes[selectedLevelId].options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuizSelection(idx)}
                              className={`w-full text-left rounded-xl p-3.5 text-xs transition border ${
                                quizSelection === idx
                                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 font-bold'
                                  : 'border-white/5 bg-slate-950/40 text-slate-300 hover:bg-slate-900'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No quiz for this level. Proceed to coding.</p>
                    )}
                  </div>
                )}

                {/* Step 4: Code Challenge */}
                {lessonStep === 4 && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Coding Sandbox Challenge</h3>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">JavaScript Compiler</span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-1">
                      <Editor
                        height="260px"
                        language="javascript"
                        theme="vs-dark"
                        value={codeDraft}
                        onChange={(val) => setCodeDraft(val || '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          wordWrap: 'on',
                          padding: { top: 8, bottom: 8 },
                          automaticLayout: true
                        }}
                      />
                    </div>

                    <button
                      onClick={() => setRunLogs('Evaluating code...\n✓ Test cases passed successfully.')}
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 transition btn-micro"
                    >
                      Compile Code
                    </button>
                  </div>
                )}

                {/* Step 5: Mini Boss Timed Challenge */}
                {lessonStep === 5 && (
                  <div className="space-y-4 animate-slide-up">
                    <h3 className="text-lg font-bold text-white">Mini Boss Visual Duel</h3>
                    <p className="text-xs text-slate-400">Click the array element bars in ascending order to resolve pointer bounds.</p>
                    
                    <div className="flex justify-center items-end gap-3 h-28 border border-white/5 rounded-2xl bg-slate-950/40 p-4">
                      {visualizerData.map((val, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setRunLogs(`Selected bar element ${val} at index ${idx}.`);
                            setSelectedVisualizerIndex(idx);
                          }}
                          className={`w-10 rounded-t transition-all flex items-center justify-center text-xs font-bold ${
                            selectedVisualizerIndex === idx
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 hover:bg-indigo-500/50'
                          }`}
                          style={{ height: `${val}%` }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation logic */}
              <div className="mt-8 border-t border-white/10 pt-4 flex justify-between">
                <button
                  disabled={lessonStep === 1}
                  onClick={() => setLessonStep(prev => prev - 1)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    lessonStep === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white btn-micro'
                  }`}
                >
                  ← Previous Step
                </button>
                
                {lessonStep < 5 ? (
                  <button
                    onClick={() => {
                      if (lessonStep === 3 && mockQuizzes[selectedLevelId] && quizSelection !== mockQuizzes[selectedLevelId].ans) {
                        alert('Incorrect quiz selection. Try again!');
                        return;
                      }
                      setLessonStep(prev => prev + 1);
                    }}
                    className="rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-400 transition btn-micro"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    onClick={handleLessonSuccess}
                    className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition btn-micro animate-pulse"
                  >
                    Complete Lesson ✓
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Console output logs & details */}
            <div className="glass rounded-[2rem] border border-white/10 p-6 card-hover-premium flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Workspace Console Outputs</h3>
                <p className="text-xs text-slate-400 mb-4">Diagnostics feedback of sandbox scripts execution.</p>
                
                <pre className="w-full rounded-2xl border border-white/5 bg-slate-950/70 p-4 font-mono text-xs text-cyan-300 whitespace-pre-wrap min-h-[220px]">
                  {runLogs}
                </pre>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500 leading-relaxed">
                🧠 <strong>Interactive Flow Tip</strong>: Solve practice quizzes and visual checks before advancing to the final mini-boss compiler checks.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. BATTLE COMPARISON VIEW */}
      {currentView === 'battle' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Comparison Arena</p>
              <h2 className="text-xl font-bold text-white mt-1">Battle Mode</h2>
            </div>
            <button
              onClick={() => setCurrentView('map')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 btn-micro"
            >
              ← Back to Map
            </button>
          </div>

          {/* Select comparison targets */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-[2rem] border border-white/10 p-6 space-y-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Left Data Structure</label>
              <select
                value={battleLeft}
                onChange={(e) => setBattleLeft(e.target.value)}
                className="w-full text-sm rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none"
              >
                <option value="array">Array</option>
                <option value="stack">Stack</option>
                <option value="heap">Heap</option>
                <option value="dfs">DFS Graph</option>
              </select>
            </div>
            
            <div className="glass rounded-[2rem] border border-white/10 p-6 space-y-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Right Data Structure</label>
              <select
                value={battleRight}
                onChange={(e) => setBattleRight(e.target.value)}
                className="w-full text-sm rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none"
              >
                <option value="linkedlist">Linked List</option>
                <option value="queue">Queue</option>
                <option value="bst">BST Tree</option>
                <option value="bfs">BFS Graph</option>
              </select>
            </div>
          </div>

          {/* Visualizers side-by-side comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left visualizer */}
            <div className="glass rounded-[2rem] border border-white/10 p-6 text-center space-y-4 card-hover-premium">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{battleLeft.toUpperCase()} Visualizer</h4>
              <div className="flex gap-2 justify-center items-end h-28 border border-white/5 bg-slate-950/30 rounded-xl p-3">
                {[30, 45, 60, 75].map((val, idx) => (
                  <div key={idx} className="w-8 bg-indigo-500 rounded-t" style={{ height: `${val}%` }} />
                ))}
              </div>
              <p className="text-xs text-slate-400">Contiguous offset allocation.</p>
            </div>

            {/* Right visualizer */}
            <div className="glass rounded-[2rem] border border-white/10 p-6 text-center space-y-4 card-hover-premium">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{battleRight.toUpperCase()} Visualizer</h4>
              <div className="flex gap-4 justify-center items-center h-28 border border-white/5 bg-slate-950/30 rounded-xl p-3">
                {[1, 2, 3].map((val, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="h-10 w-10 rounded-full border border-cyan-400/40 bg-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-200">N</div>
                    {idx < 2 && <span className="text-slate-500">→</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Linked reference node scattering.</p>
            </div>
          </div>

          {/* Metrics comparison cards */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 card-hover-premium space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Technical Complexities Face-Off</h3>
              <div className="flex rounded-lg bg-slate-950/60 p-1 text-xs">
                {['speed', 'memory', 'complexity'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setBattleMetricActive(metric)}
                    className={`rounded px-3 py-1 font-semibold transition ${
                      battleMetricActive === metric ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {metric.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Access Lookup</span>
                <p className="text-lg font-bold text-cyan-300 mt-1">O(1) vs O(N)</p>
                <p className="text-[10px] text-slate-400 mt-1">Array offset indices vs sequential node tracking.</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Node Insertion</span>
                <p className="text-lg font-bold text-cyan-300 mt-1">O(N) vs O(1)</p>
                <p className="text-[10px] text-slate-400 mt-1">Requires shifting cells vs local pointer re-linking.</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Memory Allocation</span>
                <p className="text-lg font-bold text-cyan-300 mt-1">Static vs Dynamic</p>
                <p className="text-[10px] text-slate-400 mt-1">Fixed array sizing blocks vs dynamic heap sizes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DsaBattleArenaPage;
