import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const presets = {
  linearSearch: {
    name: 'Linear Search (O(N))',
    code: `function linearSearch(arr, target) {
  // Single loop scanning elements one by one
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Target found
    }
  }
  return -1; // Target not found
}`
  },
  binarySearch: {
    name: 'Binary Search (O(log N))',
    code: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  // Divides search range in half each step
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = arr[mid];

    if (value === target) return mid;
    if (value < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}`
  },
  bubbleSort: {
    name: 'Bubble Sort (O(N²))',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  // Nested loops comparing adjacent cells
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap values
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`
  },
  recursiveFibonacci: {
    name: 'Recursive Fibonacci (O(2^N))',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  
  // Exponential branching recursion
  return fibonacci(n - 1) + fibonacci(n - 2);
}`
  },
  matrixMultiplication: {
    name: 'Matrix Multiplication (O(N³))',
    code: `function multiplyMatrices(A, B) {
  const rA = A.length, cA = A[0].length;
  const cB = B[0].length;
  
  // Allocate O(N²) matrix space
  const C = Array(rA).fill(0).map(() => Array(cB).fill(0));

  // Triple nested loop
  for (let i = 0; i < rA; i++) {
    for (let j = 0; j < cB; j++) {
      for (let k = 0; k < cA; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return C;
}`
  }
};

function analyzeCodeComplexity(code) {
  if (!code) {
    return {
      loopCount: 0,
      maxLoopDepth: 0,
      recursion: 'None',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      score: 100,
      suggestions: ['Paste code in the editor to start the analysis.'],
      metrics: { time: 100, space: 100, nest: 100 }
    };
  }

  const normalized = code.toLowerCase();
  
  // Extract function declarations and detect recursion
  // Detects: function name(...) or const name = (...) => or def name(...)
  let recursion = 'None';
  const fnDeclRegex = /(?:function\s+|def\s+|const\s+|let\s+)(\w+)\s*(?:\(|=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>)/g;
  let match;
  const declaredFunctions = [];
  
  while ((match = fnDeclRegex.exec(code)) !== null) {
    if (match[1]) declaredFunctions.push(match[1]);
  }

  // If we found declared functions, check if they call themselves
  if (declaredFunctions.length > 0) {
    declaredFunctions.forEach(fnName => {
      // Find matches of the function name inside the code excluding declaration index
      const escapeFnName = fnName.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
      const callRegex = new RegExp(`\\b${escapeFnName}\\b`, 'g');
      const matchesCount = (code.match(callRegex) || []).length;
      // If matchesCount > 1, it calls itself (once for declaration, rest are calls)
      if (matchesCount > 1) {
        recursion = 'Detected';
      }
    });
  }

  // Approximate loop counts and max loop depth
  const lines = code.split('\n');
  let currentDepth = 0;
  let maxLoopDepth = 0;
  let loopCount = 0;

  lines.forEach(line => {
    const trimmed = line.trim().toLowerCase();
    const isLoopStart = /\bfor\b|\bwhile\b/.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('*');
    
    if (isLoopStart) {
      loopCount++;
      currentDepth++;
      if (currentDepth > maxLoopDepth) {
        maxLoopDepth = currentDepth;
      }
    }
    
    // Simple bracket balance scanning to reduce depth
    const openBrackets = (trimmed.match(/\{/g) || []).length;
    const closeBrackets = (trimmed.match(/\}/g) || []).length;
    
    // Decrement loop depth if a loop block is closing
    if (closeBrackets > openBrackets) {
      currentDepth = Math.max(0, currentDepth - (closeBrackets - openBrackets));
    }
  });

  // Calculate complexities
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  let score = 98;
  const suggestions = [];

  // Space logic
  const allocatesArrays = normalized.includes('.push(') || normalized.includes('[]') || normalized.includes('new array') || normalized.includes('array(');
  if (allocatesArrays) {
    spaceComplexity = 'O(N)';
    score -= 8;
    suggestions.push('Allocating arrays in loops increases space complexity. Re-use existing buffers if possible.');
  }

  if (recursion === 'Detected') {
    spaceComplexity = allocatesArrays ? 'O(N)' : 'O(log N)';
    score -= 10;
    suggestions.push('Recursion utilizes recursive stack frames. Ensure maximum depth limits are safe.');
  }

  // Time complexity mapping
  if (maxLoopDepth === 1) {
    // Check if range is divided (Binary search signature)
    const dividesRange = normalized.includes('/=') || normalized.includes('>>=') || normalized.includes('mid');
    if (dividesRange) {
      timeComplexity = 'O(log N)';
      score -= 5;
      suggestions.push('Logarithmic loop detected (divides range). Highly efficient scaling!');
    } else if (normalized.includes('.sort(')) {
      timeComplexity = 'O(N log N)';
      score -= 12;
      suggestions.push('Built-in sorting uses O(N log N) time complexity. Ensure array size calls are expected.');
    } else {
      timeComplexity = 'O(N)';
      score -= 8;
      suggestions.push('Linear loop structure detected. Time increases proportionally with input size.');
    }
  } else if (maxLoopDepth === 2) {
    timeComplexity = 'O(N²)';
    score -= 22;
    suggestions.push('Nested loop (depth 2) detected. High growth rate; avoid running frequently on large inputs.');
  } else if (maxLoopDepth >= 3) {
    timeComplexity = 'O(N³)';
    score -= 38;
    suggestions.push('Triple nested loop detected. Complexity scales cubically. Refactor algorithm if possible.');
  } else if (recursion === 'Detected') {
    // Branching recursion
    const callsSelfMultipleTimes = (code.match(/fibonacci|recurse|factorial/g) || []).length > 2 || code.includes('+') && code.includes(') +');
    if (callsSelfMultipleTimes) {
      timeComplexity = 'O(2^N)';
      score -= 50;
      suggestions.push('Branching recursion detected (Exponential growth O(2^N)). Consider using Dynamic Programming (Memoization) to cache results.');
    } else {
      timeComplexity = 'O(N)';
      score -= 12;
      suggestions.push('Single branching recursion detected. Time complexity scales linearly with recursion depth.');
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Your snippet looks extremely lean and optimized with O(1) complexity.');
  }

  // Structuring metric indexes
  const timeBarValue = timeComplexity.includes('2^') ? 30 : timeComplexity.includes('N³') ? 48 : timeComplexity.includes('N²') ? 65 : timeComplexity.includes('log N') ? 92 : timeComplexity.includes('1') ? 98 : 82;
  const spaceBarValue = spaceComplexity.includes('N²') ? 45 : spaceComplexity.includes('N') ? 70 : spaceComplexity.includes('log') ? 85 : 98;
  const nestBarValue = maxLoopDepth >= 3 ? 40 : maxLoopDepth === 2 ? 65 : maxLoopDepth === 1 ? 85 : 98;

  return {
    loopCount,
    maxLoopDepth,
    recursion,
    timeComplexity,
    spaceComplexity,
    score: Math.max(25, Math.min(99, score)),
    suggestions,
    metrics: {
      time: timeBarValue,
      space: spaceBarValue,
      nest: nestBarValue
    }
  };
}

function ComplexityAnalyzerPage() {
  const [code, setCode] = useState(presets.linearSearch.code);
  const [activePreset, setActivePreset] = useState('linearSearch');

  // Handle Preset updates
  const handlePresetSelect = (presetKey) => {
    setActivePreset(presetKey);
    if (presets[presetKey]) {
      setCode(presets[presetKey].code);
    }
  };

  const analysis = useMemo(() => {
    return analyzeCodeComplexity(code);
  }, [code]);

  // Dash properties for radial gauge
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.score / 100) * circumference;

  return (
    <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8 text-slate-100 max-w-7xl mx-auto">
      
      {/* Background radial overlays */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[8%] left-[12%] w-[38rem] h-[38rem] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[22%] right-[8%] w-[42rem] h-[42rem] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      </div>

      {/* Header Block */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 lg:p-10 mb-8 shadow-2xl relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs md:text-sm text-indigo-300 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Automated Code Auditing Engine
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Complexity Analyzer
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
              Analyze programmatic complexity and growth parameters. Paste your function below to review loop nesting depth, stack frames, execution growth curves, and optimization recommendations.
            </p>
          </div>
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 backdrop-blur shadow-lg hover:border-white/20 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Editor workspace & radial dial score dashboards */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] mb-8">
        
        {/* Editor block */}
        <div className="glass rounded-[2rem] border border-white/10 p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 mt-2">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Input Workspace</span>
                <p className="text-sm text-slate-400">Paste your code below (JavaScript / JS format)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Preset Templates</span>
                <select
                  value={activePreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-slate-350 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none appearance-none cursor-pointer pr-8 relative"
                >
                  {Object.keys(presets).map(key => (
                    <option key={key} value={key}>{presets[key].name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monaco code workspace container */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 p-1 flex-grow">
              <Editor
                height="330px"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  fontFamily: 'Fira Code, JetBrains Mono, source-code-pro, Menlo, Monaco, Consolas, monospace',
                  tabSize: 2
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500 flex justify-between">
            <span>Editor parsing operates in real-time</span>
            <span>Static analyzer v2.0</span>
          </div>
        </div>

        {/* Dashboard Indicators side panel */}
        <div className="space-y-8">
          
          {/* Radial score gauge panel */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-xl relative overflow-hidden flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-550 font-bold uppercase tracking-wider block">Performance Score</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[140px]">
                Score represents static optimization indices and time/space scales.
              </p>
              
              {/* Healthy score indicator */}
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                  analysis.score >= 85 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                    : analysis.score >= 60 
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    analysis.score >= 85 ? 'bg-emerald-400' : analysis.score >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  {analysis.score >= 85 ? 'Optimal' : analysis.score >= 60 ? 'Moderate' : 'Unoptimized'}
                </span>
              </div>
            </div>

            {/* SVG circular speedometer dial */}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                {/* Track circle path */}
                <circle 
                  cx="64" cy="64" r={radius} 
                  fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" 
                />
                {/* Score progress path */}
                <circle 
                  cx="64" cy="64" r={radius} 
                  fill="transparent" 
                  stroke="url(#radialGrad)" strokeWidth="8" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                
                {/* Define gradient colors */}
                <defs>
                  <linearGradient id="radialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Text score centered inside circle */}
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-white font-mono">{analysis.score}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Score</span>
              </div>
            </div>
          </div>

          {/* Metric parameters dashboards progress bars */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-4">Structure Quality</h3>
            <div className="space-y-4">
              
              {/* Metric 1: Time efficiency */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-350 mb-1.5">
                  <span>Asymptotic Time Efficiency</span>
                  <span className="font-mono text-indigo-300">{analysis.metrics.time}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" style={{ width: `${analysis.metrics.time}%` }} />
                </div>
              </div>

              {/* Metric 2: Space footprint */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-350 mb-1.5">
                  <span>Auxiliary Space Efficiency</span>
                  <span className="font-mono text-indigo-300">{analysis.metrics.space}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" style={{ width: `${analysis.metrics.space}%` }} />
                </div>
              </div>

              {/* Metric 3: Loop depth score */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-350 mb-1.5">
                  <span>Nesting Bounds Score</span>
                  <span className="font-mono text-indigo-300">{analysis.metrics.nest}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" style={{ width: `${analysis.metrics.nest}%` }} />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* SVG Growth Plot curves */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 mb-8 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Complexity Growth Chart
        </h3>
        <p className="text-sm text-slate-400 mb-6">Plot demonstrating operations ($T$) vs input elements ($N$). The curve corresponding to the code&apos;s estimated time complexity (<strong className="text-indigo-300">{analysis.timeComplexity}</strong>) is highlighted.</p>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.3fr_0.7fr]">
          
          {/* SVG canvas */}
          <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 flex items-center justify-center">
            <svg className="w-full h-64 max-w-lg" viewBox="0 0 300 200">
              {/* Axes lines */}
              <line x1="30" y1="170" x2="280" y2="170" stroke="#475569" strokeWidth="2" />
              <line x1="30" y1="20" x2="30" y2="170" stroke="#475569" strokeWidth="2" />
              <text x="280" y="185" fill="#94a3b8" fontSize="8" textAnchor="end">Input Size (N)</text>
              <text x="25" y="20" fill="#94a3b8" fontSize="8" textAnchor="start" transform="rotate(-90 25 20)">Operations</text>

              {/* O(1) - Constant */}
              <line 
                x1="30" y1="160" x2="270" y2="160" 
                stroke={analysis.timeComplexity === 'O(1)' ? '#06b6d4' : '#334155'} 
                strokeWidth={analysis.timeComplexity === 'O(1)' ? '3.5' : '1.5'} 
                className="transition-all duration-300"
              />
              <text x="275" y="162" fill={analysis.timeComplexity === 'O(1)' ? '#06b6d4' : '#475569'} fontSize="7" fontWeight="bold">O(1)</text>

              {/* O(log N) - Logarithmic */}
              <path 
                d="M 30 170 Q 100 130, 270 120" 
                fill="none" 
                stroke={analysis.timeComplexity === 'O(log N)' ? '#fbbf24' : '#334155'} 
                strokeWidth={analysis.timeComplexity === 'O(log N)' ? '3.5' : '1.5'} 
                className="transition-all duration-300"
              />
              <text x="275" y="122" fill={analysis.timeComplexity === 'O(log N)' ? '#fbbf24' : '#475569'} fontSize="7" fontWeight="bold">O(log N)</text>

              {/* O(N) - Linear */}
              <line 
                x1="30" y1="170" x2="250" y2="50" 
                stroke={analysis.timeComplexity === 'O(N)' ? '#818cf8' : '#334155'} 
                strokeWidth={analysis.timeComplexity === 'O(N)' ? '3.5' : '1.5'} 
                className="transition-all duration-300"
              />
              <text x="255" y="52" fill={analysis.timeComplexity === 'O(N)' ? '#818cf8' : '#475569'} fontSize="7" fontWeight="bold">O(N)</text>

              {/* O(N log N) - Linearithmic */}
              <path 
                d="M 30 170 C 80 140, 160 80, 220 30" 
                fill="none" 
                stroke={analysis.timeComplexity === 'O(N log N)' ? '#a78bfa' : '#334155'} 
                strokeWidth={analysis.timeComplexity === 'O(N log N)' ? '3.5' : '1.5'} 
                className="transition-all duration-300"
              />
              <text x="225" y="32" fill={analysis.timeComplexity === 'O(N log N)' ? '#a78bfa' : '#475569'} fontSize="7" fontWeight="bold">O(N log N)</text>

              {/* O(N^2) - Quadratic */}
              <path 
                d="M 30 170 Q 80 160, 120 20" 
                fill="none" 
                stroke={analysis.timeComplexity === 'O(N²)' ? '#f43f5e' : '#334155'} 
                strokeWidth={analysis.timeComplexity === 'O(N²)' ? '3.5' : '1.5'} 
                className="transition-all duration-300"
              />
              <text x="125" y="22" fill={analysis.timeComplexity === 'O(N²)' ? '#f43f5e' : '#475569'} fontSize="7" fontWeight="bold">O(N²)</text>

              {/* O(2^N) - Exponential */}
              <path 
                d="M 30 170 Q 55 160, 70 20" 
                fill="none" 
                stroke={analysis.timeComplexity === 'O(2^N)' ? '#ec4899' : '#334155'} 
                strokeWidth={analysis.timeComplexity === 'O(2^N)' ? '3.5' : '1.5'} 
                className="transition-all duration-300"
              />
              <text x="75" y="22" fill={analysis.timeComplexity === 'O(2^N)' ? '#ec4899' : '#475569'} fontSize="7" fontWeight="bold">O(2ᴺ)</text>
            </svg>
          </div>

          {/* Scale descriptors list */}
          <div className="space-y-4 flex flex-col justify-center">
            <h4 className="text-sm font-semibold text-white">Highlighted Curves Description</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-cyan-400" />
                <span className="text-xs text-slate-350"><strong>O(1) (Constant)</strong>: operations scale flat.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-350"><strong>O(log N) (Logarithmic)</strong>: dividing searches halves input space.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-indigo-400" />
                <span className="text-xs text-slate-350"><strong>O(N) (Linear)</strong>: execution grows exactly with array length.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-violet-400" />
                <span className="text-xs text-slate-350"><strong>O(N log N) (Linearithmic)</strong>: split and merge sorting standard.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-rose-500" />
                <span className="text-xs text-slate-350"><strong>O(N²) (Quadratic)</strong>: double nested loop scans.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-pink-500" />
                <span className="text-xs text-slate-350"><strong>O(2ᴺ) (Exponential)</strong>: recursive tree branches.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic parameters cards grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        
        {/* Estimated complexities */}
        <div className="glass rounded-2xl border border-white/10 p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Time Complexity</span>
          <p className="mt-2 text-2xl font-bold text-cyan-300 font-mono">{analysis.timeComplexity}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Growth rate of instruction cycles.</span>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Space Complexity</span>
          <p className="mt-2 text-2xl font-bold text-violet-300 font-mono">{analysis.spaceComplexity}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Auxiliary memory allocation metrics.</span>
        </div>

        {/* Static parses */}
        <div className="glass rounded-2xl border border-white/10 p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Loops Detected</span>
          <p className="mt-2 text-2xl font-bold text-white font-mono">{analysis.loopCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Maximum nesting: depth {analysis.maxLoopDepth}.</span>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recursion Detected</span>
          <p className={`mt-2 text-2xl font-bold font-mono ${analysis.recursion === 'Detected' ? 'text-amber-400' : 'text-slate-400'}`}>
            {analysis.recursion}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">Stack frame allocation detection.</span>
        </div>

      </div>

      {/* Optimization Recommendations Block */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Optimization Suggestions
        </h3>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {analysis.suggestions.map((suggestion, i) => (
            <div key={i} className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-xs md:text-sm text-slate-350 leading-relaxed pt-0.5">
                {suggestion}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ComplexityAnalyzerPage;
