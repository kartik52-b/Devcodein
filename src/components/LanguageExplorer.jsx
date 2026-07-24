import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';

const languages = [
  {
    id: 'c',
    name: 'C',
    accent: 'from-cyan-400 to-sky-500',
    description: 'Low-level control for systems and embedded software.',
    advantages: ['Predictable performance', 'Direct memory access', 'Universal in systems programming'],
    disadvantages: ['Manual memory management', 'Verbose syntax', 'Higher chance of bugs'],
    performance: 'Excellent for low-level workloads',
    performanceScore: 92,
    popularity: 78,
    popularityLabel: 'Widely used in systems and embedded work',
    example: `#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    for (int i = 0; i < 3; i++) {\n        total += i;\n    }\n    printf("%d\\n", total);\n    return 0;\n}`,
    tutorials: ['C Programming Basics', 'Systems Programming with C']
  },
  {
    id: 'cpp',
    name: 'C++',
    accent: 'from-indigo-400 to-violet-500',
    description: 'Performance-first applications with modern abstractions.',
    advantages: ['High performance', 'Strong standard library', 'Excellent for game engines and tooling'],
    disadvantages: ['Complex language', 'Steeper learning curve', 'More boilerplate'],
    performance: 'Excellent for compute-heavy applications',
    performanceScore: 94,
    popularity: 88,
    popularityLabel: 'Highly adopted across enterprise and performance-sensitive software',
    example: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int total = 0;\n    for (int i = 0; i < 3; i++) {\n        total += i;\n    }\n    cout << total << '\\n';\n    return 0;\n}`,
    tutorials: ['Modern C++ Essentials', 'C++ for Competitive Programming']
  },
  {
    id: 'java',
    name: 'Java',
    accent: 'from-amber-400 to-orange-500',
    description: 'Enterprise-grade reliability with portable bytecode.',
    advantages: ['Strong typing', 'Excellent tooling', 'Portable across platforms'],
    disadvantages: ['More verbose', 'Higher memory usage', 'Slower startup than native code'],
    performance: 'Reliable and scalable for large systems',
    performanceScore: 82,
    popularity: 92,
    popularityLabel: 'A staple in enterprise and backend platforms',
    example: `public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        for (int i = 0; i < 3; i++) {\n            total += i;\n        }\n        System.out.println(total);\n    }\n}`,
    tutorials: ['Java for Backend Developers', 'Spring Boot Fundamentals']
  },
  {
    id: 'python',
    name: 'Python',
    accent: 'from-emerald-400 to-lime-500',
    description: 'Readable and expressive for AI, automation, and web apps.',
    advantages: ['Easy to read', 'Rapid prototyping', 'Strong ecosystem'],
    disadvantages: ['Slower runtime', 'Dynamic typing', 'Less ideal for low-level work'],
    performance: 'Excellent for productivity and data-heavy workflows',
    performanceScore: 70,
    popularity: 98,
    popularityLabel: 'The most popular language for AI and scripting',
    example: `def sum_numbers(limit):\n    total = 0\n    for i in range(limit):\n        total += i\n    return total\n\nprint(sum_numbers(3))`,
    tutorials: ['Python for Beginners', 'AI with Python']
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    accent: 'from-fuchsia-400 to-pink-500',
    description: 'The runtime for interactive experiences across the web.',
    advantages: ['Runs in browsers', 'Huge ecosystem', 'Great for UI development'],
    disadvantages: ['Quirky semantics', 'Asynchronous complexity', 'Runtime surprises'],
    performance: 'Fast enough for most web experiences',
    performanceScore: 78,
    popularity: 97,
    popularityLabel: 'Ubiquitous in front-end and full-stack products',
    example: `let total = 0;\nfor (let i = 0; i < 3; i++) {\n    total += i;\n}\nconsole.log(total);`,
    tutorials: ['JavaScript Essentials', 'Modern Frontend Development']
  },
  {
    id: 'go',
    name: 'Go',
    accent: 'from-sky-400 to-cyan-500',
    description: 'Simple concurrency for cloud-native products.',
    advantages: ['Built-in concurrency', 'Excellent tooling', 'Fast compile times'],
    disadvantages: ['Smaller ecosystem', 'Less flexible syntax', 'Limited generics historically'],
    performance: 'Excellent for cloud services and APIs',
    performanceScore: 86,
    popularity: 84,
    popularityLabel: 'Growing fast in distributed backend systems',
    example: `package main\n\nimport "fmt"\n\nfunc main() {\n    total := 0\n    for i := 0; i < 3; i++ {\n        total += i\n    }\n    fmt.Println(total)\n}`,
    tutorials: ['Go in 30 Minutes', 'Build APIs with Go']
  },
  {
    id: 'rust',
    name: 'Rust',
    accent: 'from-rose-400 to-red-500',
    description: 'Memory safety with fearless performance.',
    advantages: ['Memory safety', 'Zero-cost abstractions', 'Excellent for systems'],
    disadvantages: ['Steep learning curve', 'Verbose ownership model', 'Longer compile times'],
    performance: 'Outstanding for performance-critical and safe systems',
    performanceScore: 95,
    popularity: 81,
    popularityLabel: 'Rising quickly in systems and infrastructure tools',
    example: `fn main() {\n    let mut total = 0;\n    for i in 0..3 {\n        total += i;\n    }\n    println!("{}", total);\n}`,
    tutorials: ['Rust for Systems Programming', 'Learn Rust by Building']
  }
];

const starterSnippets = {
  c: `#include <stdio.h>\n\nint main(void) {\n  int total = 0;\n  for (int i = 0; i < 3; i++) {\n    total += i;\n  }\n  printf("%d\\n", total);\n  return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int total = 0;\n  for (int i = 0; i < 3; i++) {\n    total += i;\n  }\n  cout << total << '\\n';\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    int total = 0;\n    for (int i = 0; i < 3; i++) {\n      total += i;\n    }\n    System.out.println(total);\n  }\n}`,
  python: `total = 0\nfor i in range(3):\n    total += i\nprint(total)`,
  javascript: `let total = 0;\nfor (let i = 0; i < 3; i++) {\n  total += i;\n}\nconsole.log(total);`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n  total := 0\n  for i := 0; i < 3; i++ {\n    total += i\n  }\n  fmt.Println(total)\n}`,
  rust: `fn main() {\n    let mut total = 0;\n    for i in 0..3 {\n        total += i;\n    }\n    println!("{}", total);\n}`
};

const monacoLanguageMap = {
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  python: 'python',
  javascript: 'javascript',
  go: 'go',
  rust: 'rust'
};

const diffRows = [
  { feature: 'Loop syntax', c: 'for (int i = 0; i < 3; i++)', cpp: 'for (int i = 0; i < 3; i++)', java: 'for (int i = 0; i < 3; i++)', python: 'for i in range(3):', javascript: 'for (let i = 0; i < 3; i++)', go: 'for i := 0; i < 3; i++ {', rust: 'for i in 0..3 {' },
  { feature: 'Output', c: 'printf("%d\\n", total);', cpp: 'cout << total << "\\n";', java: 'System.out.println(total);', python: 'print(total)', javascript: 'console.log(total);', go: 'fmt.Println(total)', rust: 'println!("{}", total);' },
  { feature: 'Variable declaration', c: 'int total = 0;', cpp: 'int total = 0;', java: 'int total = 0;', python: 'total = 0', javascript: 'let total = 0;', go: 'total := 0', rust: 'let mut total = 0;' }
];

function LanguageExplorer() {
  const [sourceLanguage, setSourceLanguage] = useState('python');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(starterSnippets.python);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(starterSnippets[sourceLanguage]);
  }, [sourceLanguage]);

  const target = useMemo(() => languages.find((lang) => lang.id === selectedLanguage) || languages[0], [selectedLanguage]);
  const source = useMemo(() => languages.find((lang) => lang.id === sourceLanguage) || languages[0], [sourceLanguage]);
  const previewCode = useMemo(() => starterSnippets[selectedLanguage] || code, [code, selectedLanguage]);

  const explanation = useMemo(() => {
    return `${source.name} leans into ${source.description.toLowerCase()} while ${target.name} focuses on ${target.description.toLowerCase()} The comparison keeps the core logic intact but highlights the syntax and conventions that define each language.`;
  }, [source, target]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleDownload = () => {
    const blob = new Blob([previewCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedLanguage}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Programming Language Explorer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Compare syntax, trade-offs, and performance in one focused workspace.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">This page is dedicated entirely to language comparison. Choose a source language, inspect a target language, and explore example programs, strengths, weaknesses, and popularity.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-5 shadow-2xl shadow-indigo-950/40">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Monaco Editor</p>
              <p className="text-lg font-semibold text-white">Write in {source.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSourceLanguage(lang.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${sourceLanguage === lang.id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.25rem] border border-white/10">
            <Editor
              height="320px"
              defaultLanguage={monacoLanguageMap[sourceLanguage]}
              language={monacoLanguageMap[sourceLanguage]}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
                scrollBeyondLastLine: false
              }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={handleCopy} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
              {copied ? 'Copied ✓' : 'Copy code'}
            </button>
            <button onClick={handleDownload} className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:scale-[1.01]">
              Download code
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[2rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Syntax Explanation</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Why this translation feels natural</h2>
            <p className="mt-4 leading-7 text-slate-300">{explanation}</p>
          </div>

          <div className="glass rounded-[2rem] border border-white/10 p-6">
            <p className="text-sm text-slate-400">Language Selector</p>
            <div className="mt-4 grid gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLanguage(lang.id);
                    setSourceLanguage(lang.id);
                  }}
                  className={`rounded-[1.2rem] border p-3 text-left transition ${selectedLanguage === lang.id ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-slate-950/40 hover:bg-slate-900/70'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{lang.name}</span>
                    <span className="text-sm text-slate-400">{lang.id}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{lang.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass rounded-[2rem] border border-white/10 p-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Syntax Comparison</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Core syntax differences at a glance</h2>
        </div>
        <div className="overflow-hidden rounded-[1.25rem] border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-slate-200">
              <tr>
                <th className="px-3 py-3">Feature</th>
                <th className="px-3 py-3">{target.name}</th>
              </tr>
            </thead>
            <tbody>
              {diffRows.map((row) => (
                <tr key={row.feature} className="border-t border-white/10">
                  <td className="px-3 py-3 font-medium text-white">{row.feature}</td>
                  <td className="px-3 py-3">{row[selectedLanguage] || row.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Advantages</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {target.advantages.map((item) => (
              <li key={item} className="flex items-start gap-2"><span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />{item}</li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Disadvantages</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {target.disadvantages.map((item) => (
              <li key={item} className="flex items-start gap-2"><span className="mt-2 h-2 w-2 rounded-full bg-rose-400" />{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Performance Comparison</p>
          <div className="mt-4 space-y-4">
            {languages.map((lang) => (
              <div key={lang.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{lang.name}</span>
                  <span>{lang.performanceScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${lang.performanceScore}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{target.performance}</p>
        </div>

        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Language Popularity</p>
          <div className="mt-4 space-y-4">
            {languages.map((lang) => (
              <div key={lang.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{lang.name}</span>
                  <span>{lang.popularity}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${lang.popularity}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{target.popularityLabel}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Example Programs</p>
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-slate-200">{target.example}</pre>
          </div>
        </div>
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Related Tutorials</p>
          <div className="mt-4 space-y-3">
            {target.tutorials.map((tutorial) => (
              <div key={tutorial} className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                {tutorial}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LanguageExplorer;
