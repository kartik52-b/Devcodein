import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bot, BrainCircuit, Compass, MessageSquareText, Sparkles } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const quickActions = [
  { label: 'Write Code', prompt: 'Write merge sort in Java' },
  { label: 'Debug Code', prompt: 'Find and fix the bug in this JavaScript function' },
  { label: 'Explain Code', prompt: 'Explain this code line by line' },
  { label: 'Optimize Code', prompt: 'Optimize this solution for performance' },
  { label: 'Convert Code', prompt: 'Convert this Python function to JavaScript' },
  { label: 'Interview Questions', prompt: 'Give me interview questions for arrays and trees' },
  { label: 'Project Ideas', prompt: 'Suggest a project idea for a portfolio' }
];

function AICodingMentorPage() {
  const { activeProfile, updateActiveProfile } = useProfile();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am CodeNest AI. Share a prompt, snippet, or error and I will guide you like a senior engineer.'
    }
  ]);
  const [draft, setDraft] = useState('');
  const [activeMode, setActiveMode] = useState('Write Code');
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedChats] = useState(['Merge sort in Java', 'Explain recursion', 'Debug an API bug']);
  const [recentChats] = useState(['React hook issue', 'DP practice', 'Upload bug fix']);

  const intentLabel = useMemo(() => activeMode, [activeMode]);

  const buildReply = (mode, text) => {
    const normalized = text.trim().toLowerCase();
    if (normalized.includes('merge sort') && normalized.includes('java')) {
      return [
        'Here is a complete Java implementation for merge sort:',
        '',
        '```java',
        'class Solution {',
        '  public static void mergeSort(int[] arr) {',
        '    if (arr.length < 2) return;',
        '    int mid = arr.length / 2;',
        '    int[] left = Arrays.copyOfRange(arr, 0, mid);',
        '    int[] right = Arrays.copyOfRange(arr, mid, arr.length);',
        '    mergeSort(left);',
        '    mergeSort(right);',
        '    merge(arr, left, right);',
        '  }',
        '',
        '  private static void merge(int[] arr, int[] left, int[] right) {',
        '    int i = 0, j = 0, k = 0;',
        '    while (i < left.length && j < right.length) {',
        '      if (left[i] <= right[j]) arr[k++] = left[i++];',
        '      else arr[k++] = right[j++];',
        '    }',
        '    while (i < left.length) arr[k++] = left[i++];',
        '    while (j < right.length) arr[k++] = right[j++];',
        '  }',
        '}',
        '```',
        'This version uses divide and conquer with O(n log n) time complexity.'
      ].join('\n');
    }

    if (mode === 'Debug Code' || normalized.includes('bug') || normalized.includes('error')) {
      return `I would inspect the flow for:\n- off-by-one errors\n- null or undefined handling\n- incorrect loop boundaries\n- missing return values\n\nI can also generate a corrected version if you paste the broken snippet.`;
    }

    if (mode === 'Explain Code') {
      return `I would explain the code in three layers:\n1. What the function is trying to do\n2. How each line contributes to the result\n3. Time and space complexity with small examples.`;
    }

    if (mode === 'Optimize Code') {
      return `The best optimization path is usually to reduce unnecessary work and simplify control flow. I would target complexity first, then readability and caching.`;
    }

    if (mode === 'Convert Code') {
      return `I can convert the code while preserving behavior. I would keep naming consistent and note any language-specific nuances.`;
    }

    return `I can help with that. Share the snippet, error message, or goal and I’ll respond with a polished explanation, implementation, or debugging plan.`;
  };

  const handleSend = (customMode = intentLabel, customText = draft) => {
    const text = customText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: text }]);
    setDraft('');
    setActiveMode(customMode);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: buildReply(customMode, text) }]);
      setIsTyping(false);
      updateActiveProfile((prev) => ({
        ...prev,
        recentActivity: [`Asked AI: ${text.slice(0, 30)}...`, ...prev.recentActivity].slice(0, 8)
      }));
    }, 700);
  };

  const handleQuickAction = (action) => {
    setActiveMode(action.label);
    handleSend(action.label, action.prompt);
  };

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: `Hello ${activeProfile.name}! I am CodeNest AI. Paste a prompt, broken snippet, or learning goal and I'll guide you through it.`
      }
    ]);
  }, [activeProfile.id]);

  return (
    <div className="min-h-screen bg-[#050816] p-4 text-slate-100 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-[#5ed29c]">Intelligent programming assistant</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">AI mentor for writing, debugging, explaining, and optimizing</h1>
              <p className="mt-4 text-slate-400">The assistant understands prompts across languages and workflows, from merge sort in Java to debugging production issues.</p>
            </div>
            <div className="rounded-[1.2rem] border border-[#5ed29c]/20 bg-[#5ed29c]/10 px-4 py-3 text-sm text-[#5ed29c]">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <span>Online and ready</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="glass rounded-[2rem] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Suggested prompts</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Start a high-signal conversation</h2>
              </div>
              <BrainCircuit size={18} className="text-[#5ed29c]" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button key={action.label} onClick={() => handleQuickAction(action)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-[#5ed29c]/40 hover:bg-[#5ed29c]/10">
                  {action.label}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Current focus</p>
              <p className="mt-2 text-lg font-semibold text-white">{intentLabel}</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">The experience supports code generation, debugging, explanation, optimization, language conversion, interviews, and project planning.</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Recent chats</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {recentChats.map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{item}</div>)}
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pinned chats</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {pinnedChats.map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{item}</div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="glass rounded-[2rem] border border-white/10 p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Conversation history</p>
                <p className="text-lg font-semibold text-white">Live mentor session</p>
              </div>
              <div className="rounded-full border border-[#5ed29c]/20 bg-[#5ed29c]/10 px-3 py-1 text-sm text-[#5ed29c]">Typing {isTyping ? '…' : 'ready'}</div>
            </div>
            <div className="mb-4 max-h-[420px] space-y-3 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-[1rem] px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-gradient-to-r from-[#5ed29c] to-cyan-500 text-[#07100c]' : 'border border-white/10 bg-white/5 text-slate-200'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#5ed29c]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#5ed29c] [animation-delay:120ms]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#5ed29c] [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-3">
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder="Ask about a bug, concept, or coding challenge..." className="w-full resize-none rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Responses are designed to feel like a premium engineering mentor.</p>
                <button onClick={() => handleSend()} className="rounded-full bg-gradient-to-r from-[#5ed29c] to-cyan-400 px-4 py-2 text-sm font-semibold text-[#07100c]">Send message</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AICodingMentorPage;
