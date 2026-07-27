import { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { languages } from '../data/languagesData';

const comparisonRows = [
  { feature: 'Hello world', python: 'print("Hello")', javascript: 'console.log("Hello")', go: 'fmt.Println("Hello")', rust: 'println!("Hello")', java: 'System.out.println("Hello")', cpp: 'std::cout << "Hello";', c: 'printf("Hello");' },
  { feature: 'Variable declaration', python: 'name = "DevVerse"', javascript: 'const name = "DevVerse"', go: 'name := "DevVerse"', rust: 'let name = "DevVerse"', java: 'String name = "DevVerse";', cpp: 'std::string name = "DevVerse";', c: 'char name[] = "DevVerse";' },
  { feature: 'Loop', python: 'for i in range(3):', javascript: 'for (let i = 0; i < 3; i++)', go: 'for i := 0; i < 3; i++ {', rust: 'for i in 0..3 {', java: 'for (int i = 0; i < 3; i++) {', cpp: 'for (int i = 0; i < 3; i++) {', c: 'for (int i = 0; i < 3; i++) {' }
];

const snippets = {
  python: 'print("Hello from Python")',
  javascript: 'console.log("Hello from JavaScript")',
  go: 'fmt.Println("Hello from Go")',
  rust: 'println!("Hello from Rust")',
  java: 'System.out.println("Hello from Java")',
  cpp: 'std::cout << "Hello from C++\\n";',
  c: 'printf("Hello from C\\n");'
};

const languageMap = {
  python: 'python',
  javascript: 'javascript',
  go: 'go',
  rust: 'rust',
  java: 'java',
  cpp: 'cpp',
  c: 'c'
};

function ProgrammingLanguageExplorerPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [copied, setCopied] = useState(false);

  const selectedLanguageData = useMemo(() => languages.find((lang) => lang.id === selectedLanguage) || languages[0], [selectedLanguage]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets[selectedLanguage] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleDownload = () => {
    const blob = new Blob([snippets[selectedLanguage] || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedLanguage}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 text-slate-100 lg:px-8 lg:py-10">
      <section className="glass rounded-[2rem] border border-white/10 p-8 shadow-2xl shadow-indigo-950/40 lg:p-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Programming Language Explorer</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Compare syntax, trade-offs, and performance in one focused workspace.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">This page is dedicated entirely to language comparison. Choose a language, inspect its syntax, compare performance and popularity, and review example programs and tutorials.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Monaco Editor</p>
                <p className="text-lg font-semibold text-white">{selectedLanguageData.name} sample</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${selectedLanguage === lang.id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.25rem] border border-white/10">
              <Editor
                height="320px"
                language={languageMap[selectedLanguage]}
                theme="vs-dark"
                value={snippets[selectedLanguage]}
                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 14, bottom: 14 }, automaticLayout: true, scrollBeyondLastLine: false }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleCopy} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                {copied ? 'Copied ✓' : 'Copy code'}
              </button>
              <button onClick={handleDownload} className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:scale-[1.01]">
                Download code
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Syntax Explanation</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Why this language feels the way it does</h2>
              <p className="mt-4 text-slate-300 leading-7">{selectedLanguageData.description}</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Language Selector</p>
              <div className="mt-4 space-y-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`w-full rounded-[1rem] border p-3 text-left transition ${selectedLanguage === lang.id ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-slate-900/60 hover:bg-slate-900/80'}`}
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
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 lg:p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Syntax Comparison</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">A compact comparison across common constructs</h2>
        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-slate-200">
              <tr>
                <th className="px-3 py-3">Feature</th>
                <th className="px-3 py-3">{selectedLanguageData.name}</th>
                <th className="px-3 py-3">Python</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-t border-white/10">
                  <td className="px-3 py-3 font-medium text-white">{row.feature}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-cyan-200">{row[selectedLanguage] || row.python}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-slate-300">{row.python}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Advantages</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {selectedLanguageData.advantages.map((item) => (
              <li key={item} className="flex items-start gap-2"><span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Disadvantages</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {selectedLanguageData.disadvantages.map((item) => (
              <li key={item} className="flex items-start gap-2"><span className="mt-2 h-2 w-2 rounded-full bg-rose-400" />{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Performance Comparison</p>
          <div className="mt-4 space-y-4">
            {languages.map((lang) => (
              <div key={lang.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{lang.name}</span>
                  <span>{lang.performance.speedLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.min(100, Math.max(12, lang.performance.speed * 8))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Language Popularity</p>
          <div className="mt-4 space-y-4">
            {languages.map((lang) => (
              <div key={lang.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{lang.name}</span>
                  <span>{lang.popularity.tiobeRank}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${Math.min(100, lang.popularity.soSurveyPct / 0.5)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Example Programs</p>
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-slate-200">{snippets[selectedLanguage]}</pre>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Related Tutorials</p>
          <div className="mt-4 space-y-3">
            {selectedLanguageData.tutorials.map((tutorial) => (
              <div key={tutorial.title} className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                {tutorial.title}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProgrammingLanguageExplorerPage;
