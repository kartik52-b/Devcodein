import { useMemo, useState } from 'react';

const sampleCode = `function findTarget(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`;

function analyzeCode(code) {
  const normalized = code.toLowerCase();
  const loopMatches = (normalized.match(/for\s*\(|while\s*\(/g) || []).length;
  const recursive = normalized.includes('function') && normalized.includes('return') && normalized.includes('arguments') ? 'possible' : 'none';

  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  let score = 86;
  let suggestions = [];

  if (loopMatches > 0) {
    timeComplexity = loopMatches > 1 ? 'O(n²)' : 'O(n)';
    score -= 8;
    suggestions.push('Reduce nested loops to lower the growth rate.');
  }

  if (normalized.includes('sort(') || normalized.includes('includes(')) {
    timeComplexity = 'O(n log n)';
    score -= 6;
    suggestions.push('Consider a more efficient data structure if this runs frequently.');
  }

  if (recursive === 'possible') {
    spaceComplexity = 'O(log n)';
    score -= 5;
    suggestions.push('Ensure recursion depth stays safe for large inputs.');
  }

  if (!suggestions.length) {
    suggestions.push('This snippet looks lean and efficient for its current shape.');
  }

  return {
    loopCount: loopMatches,
    recursion: recursive,
    timeComplexity,
    spaceComplexity,
    score: Math.max(60, Math.min(98, score)),
    suggestions
  };
}

function ComplexityAnalyzer() {
  const [code, setCode] = useState(sampleCode);
  const [analysis, setAnalysis] = useState(() => analyzeCode(sampleCode));

  const metrics = useMemo(() => {
    const result = analyzeCode(code);
    setAnalysis(result);
    return result;
  }, [code]);

  const performanceBars = [
    { label: 'Time', value: analysis.timeComplexity.includes('n²') ? 68 : analysis.timeComplexity.includes('n log n') ? 79 : 90 },
    { label: 'Space', value: analysis.spaceComplexity.includes('log') ? 82 : 88 },
    { label: 'Structure', value: analysis.loopCount > 1 ? 72 : 88 }
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Complexity analyzer</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Estimate performance in seconds with a polished code dashboard.</h2>
        </div>
        <p className="max-w-2xl text-slate-400">Paste code, inspect loops and recursion, and receive practical suggestions that feel like a real performance review for your logic.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-5 shadow-2xl shadow-indigo-950/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Code input</p>
              <p className="text-lg font-semibold text-white">Paste and analyze</p>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">Live analysis</div>
          </div>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="min-h-[280px] w-full rounded-[1.25rem] border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-200 outline-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[1.75rem] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Performance score</p>
                <p className="text-3xl font-semibold text-white">{analysis.score}/100</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Healthy</div>
            </div>
            <div className="mt-5 space-y-3">
              {performanceBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.75rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Estimated complexity</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-slate-400">Time complexity</p>
                <p className="mt-1 text-lg font-semibold text-white">{analysis.timeComplexity}</p>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-slate-400">Space complexity</p>
                <p className="mt-1 text-lg font-semibold text-white">{analysis.spaceComplexity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Loops detected</p>
          <p className="mt-3 text-3xl font-semibold text-white">{analysis.loopCount}</p>
        </div>
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Recursion detected</p>
          <p className="mt-3 text-3xl font-semibold text-white">{analysis.recursion}</p>
        </div>
        <div className="glass rounded-[1.75rem] border border-white/10 p-6">
          <p className="text-sm text-slate-400">Optimization suggestions</p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {analysis.suggestions.map((suggestion) => (
              <li key={suggestion} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ComplexityAnalyzer;
