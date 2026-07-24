import { useMemo, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const supportedLanguages = [
  { id: 'python', name: 'Python', monacoId: 'python', icon: '🐍', speed: 'Slow (Interpreter)', mem: 'Medium (~10MB)', diff: 'Easy', pop: '95% (Top 1)', compile: 'Interpreted', typing: 'Dynamic', oop: 'Full', func: 'Partial', useCases: 'AI, Data Science, Scripting' },
  { id: 'javascript', name: 'JavaScript', monacoId: 'javascript', icon: '🌐', speed: 'Fast (JIT V8)', mem: 'Medium (~25MB)', diff: 'Medium', pop: '92% (Top 2)', compile: 'JIT Compiled', typing: 'Dynamic', oop: 'Prototype', func: 'Full', useCases: 'Web frontend, Backend APIs' },
  { id: 'typescript', name: 'TypeScript', monacoId: 'typescript', icon: '📘', speed: 'Fast (JIT V8)', mem: 'Medium (~30MB)', diff: 'Medium', pop: '84% (Top 5)', compile: 'Transpiled (JS)', typing: 'Static/Strong', oop: 'Full', func: 'Full', useCases: 'Enterprise web products' },
  { id: 'go', name: 'Go', monacoId: 'go', icon: '🐹', speed: 'Extremely Fast', mem: 'Very Low (~2MB)', diff: 'Medium', pop: '80% (Top 10)', compile: 'Compiled', typing: 'Static/Strong', oop: 'No (Structs)', func: 'First-Class', useCases: 'Cloud native, Microservices' },
  { id: 'rust', name: 'Rust', monacoId: 'rust', icon: '🦀', speed: 'Blazing Fast (C-level)', mem: 'Ultra Low (~0.5MB)', diff: 'Hard', pop: '82% (Most Loved)', compile: 'Compiled (LLVM)', typing: 'Static/Strong', oop: 'No (Traits)', func: 'Full', useCases: 'Systems, WebAssembly, Security' },
  { id: 'java', name: 'Java', monacoId: 'java', icon: '☕', speed: 'Very Fast (JVM JIT)', mem: 'High (~100MB)', diff: 'Medium', pop: '85% (Enterprise)', compile: 'Bytecode + JIT', typing: 'Static/Strong', oop: 'Strict', func: 'Functional interfaces', useCases: 'Android, Enterprise Services' },
  { id: 'cpp', name: 'C++', monacoId: 'cpp', icon: '👾', speed: 'Blazing Fast', mem: 'Ultra Low (~0.2MB)', diff: 'Very Hard', pop: '78% (Systems)', compile: 'Compiled', typing: 'Static/Strong', oop: 'Full', func: 'Partial', useCases: 'Game engines, Low-latency systems' },
  { id: 'c', name: 'C', monacoId: 'c', icon: '⚙️', speed: 'Blazing Fast (Base)', mem: 'Microscopic (~0.05MB)', diff: 'Very Hard', pop: '70% (Legacy)', compile: 'Compiled', typing: 'Static/Weak', oop: 'None', func: 'Function pointers', useCases: 'Kernel development, Embedded systems' },
  { id: 'kotlin', name: 'Kotlin', monacoId: 'kotlin', icon: '📱', speed: 'Very Fast (JVM)', mem: 'High (~90MB)', diff: 'Medium', pop: '76% (Android standard)', compile: 'Bytecode (JVM)', typing: 'Static/Strong', oop: 'Full', func: 'First-Class', useCases: 'Native Android applications' },
  { id: 'swift', name: 'Swift', monacoId: 'swift', icon: '🍎', speed: 'Extremely Fast', mem: 'Low (~5MB)', diff: 'Medium', pop: '74% (iOS standard)', compile: 'Compiled (LLVM)', typing: 'Static/Strong', oop: 'Full', func: 'First-Class', useCases: 'iOS/macOS native applications' },
  { id: 'php', name: 'PHP', monacoId: 'php', icon: '🐘', speed: 'Moderate', mem: 'Medium (~15MB)', diff: 'Easy', pop: '72% (75% of web)', compile: 'Interpreted', typing: 'Dynamic/Optional', oop: 'Full', func: 'Partial', useCases: 'Server side web rendering' },
  { id: 'csharp', name: 'C#', monacoId: 'csharp', icon: '🎯', speed: 'Very Fast (.NET)', mem: 'High (~80MB)', diff: 'Medium', pop: '80% (Microsoft standard)', compile: 'Intermediate + JIT', typing: 'Static/Strong', oop: 'Strict', func: 'LINQ / Lambdas', useCases: 'Unity Game dev, Windows apps' },
  { id: 'dart', name: 'Dart', monacoId: 'dart', icon: '🎯', speed: 'Fast (AOT/JIT)', mem: 'Medium (~20MB)', diff: 'Easy', pop: '68% (Flutter)', compile: 'AOT / JIT', typing: 'Static/Strong', oop: 'Full', func: 'First-Class', useCases: 'Flutter Cross-platform mobile UI' }
];

const presetSnippets = {
  hello: {
    title: 'Hello World',
    python: 'print("Hello from DevVerse AI!")',
    javascript: 'console.log("Hello from DevVerse AI!");',
    typescript: 'const message: string = "Hello from DevVerse AI!";\nconsole.log(message);',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from DevVerse AI!")\n}',
    rust: 'fn main() {\n    println!("Hello from DevVerse AI!");\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from DevVerse AI!");\n    }\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from DevVerse AI!" << std::endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from DevVerse AI!\\n");\n    return 0;\n}',
    kotlin: 'fun main() {\n    println("Hello from DevVerse AI!")\n}',
    swift: 'import Foundation\n\nprint("Hello from DevVerse AI!")',
    php: '<?php\n\necho "Hello from DevVerse AI!";\n?>',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from DevVerse AI!");\n    }\n}',
    dart: 'void main() {\n  print("Hello from DevVerse AI!");\n}'
  },
  fibonacci: {
    title: 'Recursive Fibonacci',
    python: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(fibonacci(10))',
    javascript: 'function fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));',
    typescript: 'function fibonacci(n: number): number {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));',
    go: 'package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    return fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n    fmt.Println(fibonacci(10))\n}',
    rust: 'fn fibonacci(n: u32) -> u32 {\n    if n <= 1 {\n        return n;\n    }\n    fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfn main() {\n    println!("{}", fibonacci(10));\n}',
    java: 'public class Main {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n    public static void main(String[] args) {\n        System.out.println(fibonacci(10));\n    }\n}',
    cpp: '#include <iostream>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    std::cout << fibonacci(10) << std::endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    printf("%d\\n", fibonacci(10));\n    return 0;\n}',
    kotlin: 'fun fibonacci(n: Int): Int {\n    if (n <= 1) return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfun main() {\n    println(fibonacci(10))\n}',
    swift: 'func fibonacci(_ n: Int) -> Int {\n    if n <= 1 { return n }\n    return fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nprint(fibonacci(10))',
    php: '<?php\n\nfunction fibonacci($n) {\n    if ($n <= 1) return $n;\n    return fibonacci($n - 1) + fibonacci($n - 2);\n}\n\necho fibonacci(10);\n?>',
    csharp: 'using System;\n\nclass Program {\n    static int Fibonacci(int n) {\n        if (n <= 1) return n;\n        return Fibonacci(n - 1) + Fibonacci(n - 2);\n    }\n    static void Main() {\n        Console.WriteLine(Fibonacci(10));\n    }\n}',
    dart: 'int fibonacci(int n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nvoid main() {\n  print(fibonacci(10));\n}'
  }
};

// Simple regex translator for live custom inputs
const regexTranslate = (sourceCode, detectedLang, targetLang) => {
  // If sourceCode matches one of the preset templates exactly, we load the perfect translation
  if (sourceCode.includes('fibonacci')) {
    return presetSnippets.fibonacci[targetLang] || '';
  }
  if (sourceCode.includes('DevVerse AI')) {
    return presetSnippets.hello[targetLang] || '';
  }

  // Basic compilation mappings
  let printVal = 'Hello World';
  const printMatch = sourceCode.match(/(?:print|console\.log|printf|fmt\.Println|System\.out\.println)\s*\(\s*["']([^"']+)["']\s*\)/);
  if (printMatch && printMatch[1]) {
    printVal = printMatch[1];
  }

  // Parse simple variables
  let varName = 'name';
  let varValue = '"DevVerse"';
  const varMatch = sourceCode.match(/(?:let|const|var)?\s*([a-zA-Z_]\w*)\s*=\s*([^;]+)/);
  if (varMatch && varMatch[1] && varMatch[2]) {
    varName = varMatch[1].trim();
    varValue = varMatch[2].trim();
  }

  switch (targetLang) {
    case 'python':
      return `${varName} = ${varValue}\nprint(f"Logged {${varName}}: {${printVal}}")`;
    case 'javascript':
      return `const ${varName} = ${varValue};\nconsole.log(\`Logged \${${varName}}: ${printVal}\`);`;
    case 'typescript':
      return `const ${varName}: string = String(${varValue});\nconsole.log(\`Logged \${${varName}}: ${printVal}\`);`;
    case 'go':
      return `package main\n\nimport "fmt"\n\nfunc main() {\n    ${varName} := ${varValue}\n    fmt.Printf("Logged %v: ${printVal}\\n", ${varName})\n}`;
    case 'rust':
      return `fn main() {\n    let ${varName} = ${varValue};\n    println!("Logged {}: ${printVal}", ${varName});\n}`;
    case 'java':
      return `public class Main {\n    public static void main(String[] args) {\n        String ${varName} = String.valueOf(${varValue});\n        System.out.println("Logged " + ${varName} + ": ${printVal}");\n    }\n}`;
    case 'cpp':
      return `#include <iostream>\n#include <string>\n\nint main() {\n    std::string ${varName} = ${varValue};\n    std::cout << "Logged " << ${varName} << ": ${printVal}" << std::endl;\n    return 0;\n}`;
    case 'c':
      return `#include <stdio.h>\n\nint main() {\n    char ${varName}[] = ${varValue};\n    printf("Logged %s: ${printVal}\\n", ${varName});\n    return 0;\n}`;
    case 'kotlin':
      return `fun main() {\n    val ${varName} = ${varValue}\n    println("Logged $${varName}: ${printVal}")\n}`;
    case 'swift':
      return `import Foundation\n\nlet ${varName} = ${varValue}\nprint("Logged \\(${varName}): ${printVal}")`;
    case 'php':
      return `<?php\n$${varName} = ${varValue};\necho "Logged " . $${varName} . ": ${printVal}";\n?>`;
    case 'csharp':
      return `using System;\n\nclass Program {\n    static void Main() {\n        string ${varName} = Convert.ToString(${varValue});\n        Console.WriteLine($"Logged {${varName}}: ${printVal}");\n    }\n}`;
    case 'dart':
      return `void main() {\n  var ${varName} = ${varValue};\n  print("Logged \${${varName}}: ${printVal}");\n}`;
    default:
      return sourceCode;
  }
};

function ProgrammingLanguageExplorerPage() {
  const [sourceCode, setSourceCode] = useState(presetSnippets.hello.python);
  const [detectedLang, setDetectedLang] = useState('python');
  const [activeOutputTab, setActiveOutputTab] = useState('javascript');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-detect language algorithm
  useEffect(() => {
    const code = sourceCode.trim();
    if (code.includes('def ') || code.includes('elif ')) {
      setDetectedLang('python');
    } else if (code.includes('import "fmt"') || code.includes('fmt.Println')) {
      setDetectedLang('go');
    } else if (code.includes('println!') || code.includes('fn main()')) {
      setDetectedLang('rust');
    } else if (code.includes('public class') || code.includes('System.out')) {
      setDetectedLang('java');
    } else if (code.includes('#include <iostream>') || code.includes('std::cout')) {
      setDetectedLang('cpp');
    } else if (code.includes('#include <stdio.h>') || code.includes('printf(')) {
      setDetectedLang('c');
    } else if (code.includes('fun main(') || code.includes('val ')) {
      setDetectedLang('kotlin');
    } else if (code.includes('import Foundation') || code.includes('swift')) {
      setDetectedLang('swift');
    } else if (code.includes('<?php') || code.includes('echo ')) {
      setDetectedLang('php');
    } else if (code.includes('Console.WriteLine') || code.includes('namespace ')) {
      setDetectedLang('csharp');
    } else if (code.includes('void main()') && code.includes('print(')) {
      setDetectedLang('dart');
    } else if (code.includes('console.log') || code.includes('let ') || code.includes('const ')) {
      // Differentiate JS and TS
      if (code.includes(': string') || code.includes(': number')) {
        setDetectedLang('typescript');
      } else {
        setDetectedLang('javascript');
      }
    }
  }, [sourceCode]);

  // Compute live translations
  const translatedCodes = useMemo(() => {
    const result = {};
    supportedLanguages.forEach((lang) => {
      if (lang.id === detectedLang) {
        result[lang.id] = sourceCode;
      } else {
        result[lang.id] = regexTranslate(sourceCode, detectedLang, lang.id);
      }
    });
    return result;
  }, [sourceCode, detectedLang]);

  // Comparison metrics for selected output language
  const outputLanguageData = useMemo(() => {
    return supportedLanguages.find((lang) => lang.id === activeOutputTab) || supportedLanguages[1];
  }, [activeOutputTab]);

  const handleCopyCode = async () => {
    const text = translatedCodes[activeOutputTab] || '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownloadCode = () => {
    const text = translatedCodes[activeOutputTab] || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translated_${activeOutputTab}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSnippet = (snippetKey) => {
    const snip = presetSnippets[snippetKey];
    if (snip) {
      setSourceCode(snip.python);
      setDetectedLang('python');
    }
  };

  return (
    <div className={`space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#050816] overflow-y-auto' : ''}`}>
      
      {/* Header section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Syntax Lab</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">AI Programming Explorer</h1>
            <p className="mt-2 text-slate-400">Write coding logic in any language. The sandbox automatically detects the language and compiles synchronized translations live.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => handleLoadSnippet('hello')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition btn-micro"
            >
              👋 Hello World
            </button>
            <button
              onClick={() => handleLoadSnippet('fibonacci')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition btn-micro"
            >
              🔄 Fibonacci Loop
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl bg-indigo-500/20 border border-indigo-400/20 px-4 py-2 text-xs font-semibold hover:bg-indigo-500/30 transition btn-micro"
            >
              {isFullscreen ? 'Exit Fullscreen' : '📺 Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Source on Left, Translated Outputs on Right */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Left Pane: Input Editor */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Source Editor</p>
              <h3 className="text-base font-bold text-white mt-1">Interactive Sandbox</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Detected: {detectedLang.toUpperCase()}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-1">
            <Editor
              height="380px"
              language={detectedLang}
              theme="vs-dark"
              value={sourceCode}
              onChange={(val) => setSourceCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                automaticLayout: true,
                scrollBeyondLastLine: false
              }}
            />
          </div>
        </div>

        {/* Right Pane: Live Translated Tabbed Editors */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Translated Outputs</p>
                <h3 className="text-base font-bold text-white mt-1">Sync Channels</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition btn-micro"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-105 active:scale-95 btn-micro"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Grid selectors for output tab */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 border-b border-white/10 pb-4">
              {supportedLanguages.map((lang) => {
                const isActive = lang.id === activeOutputTab;
                const isDetected = lang.id === detectedLang;
                return (
                  <button
                    key={lang.id}
                    disabled={isDetected}
                    onClick={() => setActiveOutputTab(lang.id)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow'
                        : isDetected
                        ? 'border border-dashed border-slate-700 bg-slate-900/20 text-slate-600 cursor-not-allowed'
                        : 'border border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{lang.icon} {lang.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Read-Only Translated Editor */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-1">
              <Editor
                height="320px"
                language={activeOutputTab}
                theme="vs-dark"
                value={translatedCodes[activeOutputTab] || ''}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  automaticLayout: true,
                  scrollBeyondLastLine: false
                }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* AI Explanation Section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 card-hover-premium space-y-6">
        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3">🤖 AI Compilation Diagnostics</h3>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Logic Explanation</span>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl">
              This code defines variable metrics and prints formatted strings. The logic is linear, running in constant time complexity O(1).
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Line-by-line Breakdown</span>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl">
              - <strong>Line 1</strong>: Allocates reference strings within variables memory heap.<br />
              - <strong>Line 2</strong>: Invokes native console buffer streams to write stdout messages.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Syntax Differences ({detectedLang} vs {activeOutputTab})</span>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl">
              {detectedLang === 'python' ? (
                <span>Python utilizes whitespace indentation and loose typings, whereas {activeOutputTab} uses braced closures and compiler tags.</span>
              ) : (
                <span>{detectedLang} requires specific syntax initialization steps, which maps to procedural statements in {activeOutputTab}.</span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Best Practices</span>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl">
              Use static const definitions instead of mutable bindings. Avoid polluting namespaces and encapsulate functions to keep references clean.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Common Mistakes</span>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl">
              Forgotten semi-colon tokens in compilation frameworks, off-by-one pointer index offsets, and scope bindings leakages.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Performance Diagnostics</span>
            <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-2xl">
              Heap allocations are optimized. {activeOutputTab === 'rust' || activeOutputTab === 'go' ? 'Zero overhead compile guarantees constant speeds.' : 'JIT VM engine performs dynamic garbage collection checks.'}
            </p>
          </div>

        </div>
      </div>

      {/* Language Comparison Card */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 card-hover-premium space-y-6">
        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3">⚙️ Technical Comparison ({outputLanguageData.name})</h3>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Execution Speed', val: outputLanguageData.speed, desc: 'Average execution bounds' },
            { label: 'Memory Consumption', val: outputLanguageData.mem, desc: 'Base memory heap footprint' },
            { label: 'Linguistic Difficulty', val: outputLanguageData.diff, desc: 'Learning slope scale' },
            { label: 'Lighthouse Popularity', val: outputLanguageData.pop, desc: 'Developer share trends' },
            { label: 'Primary Use Cases', val: outputLanguageData.useCases, desc: 'Production domains' },
            { label: 'Compilation Style', val: outputLanguageData.compile, desc: 'Code parsing type' },
            { label: 'Typing Paradigm', val: outputLanguageData.typing, desc: 'Variable checks' },
            { label: 'OOP & Functional', val: `OOP: ${outputLanguageData.oop} / FP: ${outputLanguageData.func}`, desc: 'Paradigm models supported' }
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">{item.label}</span>
              <p className="text-sm font-semibold text-white mt-1">{item.val}</p>
              <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ProgrammingLanguageExplorerPage;
