import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { languages, presets, constructs } from '../data/languagesData';

function LanguageExplorerPage() {
  const [langA, setLangA] = useState('python');
  const [langB, setLangB] = useState('javascript');
  const [activePreset, setActivePreset] = useState('hello');
  
  const [codeA, setCodeA] = useState('');
  const [codeB, setCodeB] = useState('');
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  // Sync editor code with preset & selected languages
  useEffect(() => {
    if (presets[activePreset]) {
      setCodeA(presets[activePreset][langA] || '');
      setCodeB(presets[activePreset][langB] || '');
    }
  }, [activePreset, langA, langB]);

  const selectedLangAObj = languages.find(l => l.id === langA) || languages[0];
  const selectedLangBObj = languages.find(l => l.id === langB) || languages[1];

  const handleSwap = () => {
    const temp = langA;
    setLangA(langB);
    setLangB(temp);
  };

  const handleCopy = async (code, setCopied) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = (code, langId) => {
    const fileExtensions = {
      python: 'py',
      javascript: 'js',
      go: 'go',
      rust: 'rs',
      java: 'java',
      cpp: 'cpp',
      c: 'c'
    };
    const ext = fileExtensions[langId] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devverse_compare_${langId}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8 text-slate-100 max-w-7xl mx-auto">
      
      {/* Aurora visual glow background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[35rem] h-[35rem] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      </div>

      {/* Header Block */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 lg:p-10 mb-8 shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs md:text-sm text-indigo-300 mb-4">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Interactive Syntax Comparative Environment
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Programming Language Explorer
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
              Analyze code structure, parse paradigm shifts, compare performance metrics, and track industry popularity indexes across major languages side-by-side in real-time.
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

      {/* Main Grid: Comparison Controls & Monaco Editors */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mb-8">
        
        {/* Editor A Panel */}
        <div className="glass rounded-[2rem] border border-white/10 p-5 md:p-6 shadow-xl flex flex-col relative overflow-hidden">
          {/* Subtle indicator bar matching language A accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedLangAObj.accent}`} />
          
          {/* Selection controls A */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 mt-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Language A</span>
              <div className="relative">
                <select
                  value={langA}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setLangA(newLang);
                    if (newLang === langB) {
                      setLangB(langA); // automatically swap if selected same
                    }
                  }}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-medium pr-10 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                >
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            {/* Quick stats badge */}
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Typing Model</span>
              <span className="text-xs md:text-sm font-semibold text-slate-300">{selectedLangAObj.typing}</span>
            </div>
          </div>

          {/* Monaco Editor Wrapper */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 p-1 flex-grow">
            <div className="flex justify-between items-center bg-slate-950/90 px-4 py-2 border-b border-white/5 text-xs text-slate-400 font-mono">
              <span>{selectedLangAObj.name} editor (editable)</span>
              <span>{selectedLangAObj.executionModel}</span>
            </div>
            <Editor
              height="340px"
              language={langA === 'cpp' ? 'cpp' : langA === 'c' ? 'c' : langA}
              theme="vs-dark"
              value={codeA}
              onChange={(val) => setCodeA(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontFamily: 'Fira Code, JetBrains Mono, source-code-pro, Menlo, Monaco, Consolas, monospace',
                tabSize: 4,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on'
              }}
            />
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center gap-3 mt-4">
            <button
              onClick={() => handleCopy(codeA, setCopiedA)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 px-4 py-2 text-xs md:text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              {copiedA ? (
                <>
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Snippet
                </>
              )}
            </button>
            <button
              onClick={() => handleDownload(codeA, langA)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 px-4 py-2 text-xs md:text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          </div>
        </div>

        {/* Editor B Panel */}
        <div className="glass rounded-[2rem] border border-white/10 p-5 md:p-6 shadow-xl flex flex-col relative overflow-hidden">
          {/* Subtle indicator bar matching language B accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedLangBObj.accent}`} />
          
          {/* Selection controls B */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 mt-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Language B</span>
              <div className="relative">
                <select
                  value={langB}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setLangB(newLang);
                    if (newLang === langA) {
                      setLangA(langB); // automatically swap if selected same
                    }
                  }}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-medium pr-10 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                >
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            {/* Swap Button in between panels */}
            <div className="self-end">
              <button 
                onClick={handleSwap}
                className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                title="Swap left and right languages"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Swap
              </button>
            </div>

            {/* Quick stats badge */}
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Typing Model</span>
              <span className="text-xs md:text-sm font-semibold text-slate-300">{selectedLangBObj.typing}</span>
            </div>
          </div>

          {/* Monaco Editor Wrapper */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 p-1 flex-grow">
            <div className="flex justify-between items-center bg-slate-950/90 px-4 py-2 border-b border-white/5 text-xs text-slate-400 font-mono">
              <span>{selectedLangBObj.name} editor (editable)</span>
              <span>{selectedLangBObj.executionModel}</span>
            </div>
            <Editor
              height="340px"
              language={langB === 'cpp' ? 'cpp' : langB === 'c' ? 'c' : langB}
              theme="vs-dark"
              value={codeB}
              onChange={(val) => setCodeB(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontFamily: 'Fira Code, JetBrains Mono, source-code-pro, Menlo, Monaco, Consolas, monospace',
                tabSize: 4,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on'
              }}
            />
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center gap-3 mt-4">
            <button
              onClick={() => handleCopy(codeB, setCopiedB)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 px-4 py-2 text-xs md:text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              {copiedB ? (
                <>
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Snippet
                </>
              )}
            </button>
            <button
              onClick={() => handleDownload(codeB, langB)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 px-4 py-2 text-xs md:text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          </div>
        </div>

      </div>

      {/* Preset Example Programs Selection Block */}
      <div className="glass rounded-[2rem] border border-white/10 p-5 md:p-6 mb-8 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Select Example Program Template
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(presets).map((key) => (
            <button
              key={key}
              onClick={() => setActivePreset(key)}
              className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                activePreset === key
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/30'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {presets[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparative Data Blocks Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mb-8">
        
        {/* Paradigm & General Syntax Explanation Card */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Syntax Paradigm Shift Analysis
              </h3>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/20">
                Live Insights
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Language A Paradigm</span>
                  <span className="text-sm font-semibold text-slate-200">{selectedLangAObj.paradigm}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Language B Paradigm</span>
                  <span className="text-sm font-semibold text-slate-200">{selectedLangBObj.paradigm}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Comparing <strong className="text-indigo-300">{selectedLangAObj.name}</strong> (released {selectedLangAObj.releaseYear}) 
                and <strong className="text-cyan-300">{selectedLangBObj.name}</strong> (released {selectedLangBObj.releaseYear}). 
                While {selectedLangAObj.name} relies on a <span className="text-slate-200">{selectedLangAObj.executionModel}</span> execution environment, 
                {selectedLangBObj.name} employs a <span className="text-slate-200">{selectedLangBObj.executionModel}</span> process. 
                This affects memory management directly, where {selectedLangAObj.name} uses 
                {langA === 'rust' || langA === 'c' || langA === 'cpp' ? ' explicit/ownership models ' : ' garbage collection '} 
                and {selectedLangBObj.name} manages runtime references via 
                {langB === 'rust' || langB === 'c' || langB === 'cpp' ? ' ownership/manual management.' : ' a garbage-collected heap.'}
              </p>
              
              <div className="bg-indigo-950/20 rounded-2xl border border-indigo-500/10 p-4">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block mb-2">Architectural Translation Key</span>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    Moving from dynamic to static typing (e.g. JS to Go/Rust) introduces compile-time type safety but requires explicit compiler signatures.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    Garbage-collected environments prioritize engineering speed, whereas compiled low-level systems (C, C++, Rust) guarantee deterministic performance with zero-cost bounds.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500 flex justify-between">
            <span>Core compiler profiles active</span>
            <span>Static comparative engine v1.2</span>
          </div>
        </div>

        {/* Dynamic Interactive Metrics Dashboard (Performance) */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Performance & Resource Comparison
            </h3>

            {/* Performance metric 1: CPU Execution Speed */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs md:text-sm mb-2">
                  <span className="text-slate-300 font-medium">Relative CPU Execution Speed (Lower is Faster)</span>
                  <span className="text-slate-400 text-xs">C benchmark is baseline 1.0</span>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{selectedLangAObj.name}</span>
                      <span className="font-mono text-indigo-300">{selectedLangAObj.performance.speedLabel}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedLangAObj.accent} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (selectedLangAObj.performance.speed / 15.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{selectedLangBObj.name}</span>
                      <span className="font-mono text-cyan-300">{selectedLangBObj.performance.speedLabel}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedLangBObj.accent} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (selectedLangBObj.performance.speed / 15.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance metric 2: Baseline Memory Footprint */}
              <div>
                <div className="flex justify-between items-center text-xs md:text-sm mb-2">
                  <span className="text-slate-300 font-medium">Baseline Memory Footprint (Lower is Better)</span>
                  <span className="text-slate-400 text-xs">Minimal runtime overhead in MB</span>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{selectedLangAObj.name}</span>
                      <span className="font-mono text-indigo-300">{selectedLangAObj.performance.memoryLabel}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedLangAObj.accent} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (selectedLangAObj.performance.memory / 35.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{selectedLangBObj.name}</span>
                      <span className="font-mono text-cyan-300">{selectedLangBObj.performance.memoryLabel}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedLangBObj.accent} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (selectedLangBObj.performance.memory / 35.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Compilation Model summary badges */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-slate-950/50 border border-white/5 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">{selectedLangAObj.name} Compile style</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-300 block">{selectedLangAObj.performance.compilation}</span>
                </div>
                <div className="bg-slate-950/50 border border-white/5 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">{selectedLangBObj.name} Compile style</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-300 block">{selectedLangBObj.performance.compilation}</span>
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-4 text-xs text-slate-500 text-right">
            Stats represent average production builds running standard benchmarks.
          </div>
        </div>

      </div>

      {/* Pros & Cons Section (Advantages & Disadvantages) */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 mb-8">
        
        {/* Language A Details */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${selectedLangAObj.accent}`} />
              <h3 className="text-xl font-semibold text-white">Pros & Cons: {selectedLangAObj.name}</h3>
            </div>
            
            <div className="space-y-6">
              {/* Advantages */}
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-3">Key Advantages</span>
                <ul className="space-y-2.5">
                  {selectedLangAObj.advantages.map((adv, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <svg className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Disadvantages */}
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-3">Key Disadvantages</span>
                <ul className="space-y-2.5">
                  {selectedLangAObj.disadvantages.map((dis, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <svg className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Language B Details */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${selectedLangBObj.accent}`} />
              <h3 className="text-xl font-semibold text-white">Pros & Cons: {selectedLangBObj.name}</h3>
            </div>
            
            <div className="space-y-6">
              {/* Advantages */}
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-3">Key Advantages</span>
                <ul className="space-y-2.5">
                  {selectedLangBObj.advantages.map((adv, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <svg className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Disadvantages */}
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-3">Key Disadvantages</span>
                <ul className="space-y-2.5">
                  {selectedLangBObj.disadvantages.map((dis, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <svg className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Language Popularity Section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 mb-8 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Industry Popularity Index
        </h3>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          
          {/* TIOBE ranks */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">TIOBE Index Rank (Overall)</span>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Official industry rank based on developer search volumes globally.</p>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <span className="text-xs text-slate-500 block">{selectedLangAObj.name}</span>
                <span className="text-2xl font-bold text-indigo-300 font-mono">{selectedLangAObj.popularity.tiobeRank}</span>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-right">
                <span className="text-xs text-slate-500 block">{selectedLangBObj.name}</span>
                <span className="text-2xl font-bold text-cyan-300 font-mono">{selectedLangBObj.popularity.tiobeRank}</span>
              </div>
            </div>
          </div>

          {/* Stack Overflow Survey preference */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">StackOverflow Usage %</span>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Percentage of developers using this language in production surveys.</p>
            </div>
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{selectedLangAObj.name}</span>
                  <span className="font-mono font-semibold text-indigo-300">{selectedLangAObj.popularity.soSurveyPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${selectedLangAObj.accent}`} style={{ width: `${selectedLangAObj.popularity.soSurveyPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{selectedLangBObj.name}</span>
                  <span className="font-mono font-semibold text-cyan-300">{selectedLangBObj.popularity.soSurveyPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${selectedLangBObj.accent}`} style={{ width: `${selectedLangBObj.popularity.soSurveyPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* GitHub PR volumes */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">GitHub Pull Request Share %</span>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Total active codebase growth index based on submitted PR metrics.</p>
            </div>
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{selectedLangAObj.name}</span>
                  <span className="font-mono font-semibold text-indigo-300">{selectedLangAObj.popularity.githubPRPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${selectedLangAObj.accent}`} style={{ width: `${selectedLangAObj.popularity.githubPRPct * 4}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{selectedLangBObj.name}</span>
                  <span className="font-mono font-semibold text-cyan-300">{selectedLangBObj.popularity.githubPRPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${selectedLangBObj.accent}`} style={{ width: `${selectedLangBObj.popularity.githubPRPct * 4}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Syntax Comparison Side-by-side Table */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 mb-8 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
          </svg>
          Interactive Syntax Comparison Grid
        </h3>
        <p className="text-sm text-slate-400 mb-6">Compare language structural rules by construct definitions.</p>
        
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-200 border-b border-white/10">
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider w-1/4">Construct Feature</th>
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider w-3/8 border-l border-white/10">
                  {selectedLangAObj.name} Syntax
                </th>
                <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider w-3/8 border-l border-white/10">
                  {selectedLangBObj.name} Syntax
                </th>
              </tr>
            </thead>
            <tbody>
              {constructs.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'
                  }`}
                >
                  <td className="px-5 py-4 font-medium text-white align-top">
                    <span className="block text-sm">{row.feature}</span>
                    <span className="block text-xs text-slate-400 mt-1 font-normal leading-relaxed">{row.description}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs border-l border-white/10 align-top text-indigo-300 whitespace-pre bg-slate-950/20">
                    {row[langA] || '// N/A'}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs border-l border-white/10 align-top text-cyan-300 whitespace-pre bg-slate-950/20">
                    {row[langB] || '// N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curated Resources Section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Related Learning Resources & Tutorials
        </h3>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          
          {/* Tutorials for A */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${selectedLangAObj.accent}`} />
              <h4 className="font-semibold text-white text-base">Study {selectedLangAObj.name}</h4>
            </div>
            <div className="space-y-3">
              {selectedLangAObj.tutorials.map((tut, i) => (
                <a 
                  key={i} 
                  href={tut.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-850 transition-all"
                >
                  <div>
                    <span className="text-xs md:text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors block">
                      {tut.title}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-1 font-semibold">
                      {tut.difficulty} Path
                    </span>
                  </div>
                  <svg className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Tutorials for B */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${selectedLangBObj.accent}`} />
              <h4 className="font-semibold text-white text-base">Study {selectedLangBObj.name}</h4>
            </div>
            <div className="space-y-3">
              {selectedLangBObj.tutorials.map((tut, i) => (
                <a 
                  key={i} 
                  href={tut.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-850 transition-all"
                >
                  <div>
                    <span className="text-xs md:text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors block">
                      {tut.title}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-1 font-semibold">
                      {tut.difficulty} Path
                    </span>
                  </div>
                  <svg className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LanguageExplorerPage;
