import { useMemo, useState } from 'react';

const quickActions = [
  { label: 'Explain Code', prompt: 'Explain this code clearly and step by step.' },
  { label: 'Generate Code', prompt: 'Generate a clean implementation for this feature.' },
  { label: 'Fix Bugs', prompt: 'Find and fix the issues in this code.' },
  { label: 'Optimize Code', prompt: 'Optimize this solution for readability and performance.' },
  { label: 'Interview Questions', prompt: 'Give me interview-style questions and concise answers.' },
  { label: 'Coding Tips', prompt: 'Share practical coding tips for this topic.' },
  { label: 'Learning Recommendations', prompt: 'Recommend a focused learning path for this area.' }
];

function AICodingMentor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'I am your AI coding mentor. Share a bug, snippet, or goal and I will guide you like a senior engineer.'
    }
  ]);
  const [draft, setDraft] = useState('');
  const [activeMode, setActiveMode] = useState('AI Chat');
  const [isTyping, setIsTyping] = useState(false);

  const modeLabel = useMemo(() => activeMode, [activeMode]);

  const buildReply = (mode, text) => {
    const normalized = text.trim().toLowerCase();

    switch (mode) {
      case 'Explain Code':
        return `Here is a concise explanation of your request: ${text || 'the provided code'}\n\n- Identify the core intent of the snippet\n- Break down the logic in plain English\n- Highlight edge cases and possible improvements`;
      case 'Generate Code':
        return `I can scaffold a clean implementation for this idea. A strong starting point would be:\n\n- clear function names\n- modular structure\n- simple input/output handling\n- comments for maintainability`;
      case 'Fix Bugs':
        return `I would debug this by checking:\n\n- null or invalid input\n- off-by-one errors\n- asynchronous race conditions\n- incorrect assumptions about data shape`;
      case 'Optimize Code':
        return `For performance, I would reduce complexity, reuse work, and simplify control flow. A refined version would likely improve time or memory usage while keeping the solution readable.`;
      case 'Interview Questions':
        return `Try this interview prompt:\n\n1. Explain your approach in plain English.\n2. Walk through time and space complexity.\n3. Discuss trade-offs and edge cases.`;
      case 'Coding Tips':
        return `A few high-leverage tips:\n\n- write small functions\n- name variables clearly\n- test one case at a time\n- refactor before you optimize`;
      case 'Learning Recommendations':
        return `A focused plan for growth:\n\n- practice one concept per day\n- build one mini project each week\n- review errors and write short notes`;
      default:
        return normalized
          ? `I’m here to help with that. A practical next step would be to share the relevant code, error message, or goal so I can guide you with targeted feedback.`
          : 'Tell me what you want to build, debug, or understand and I will respond like a calm senior mentor.';
    }
  };

  const handleSend = (customMode = modeLabel, customText = draft) => {
    const text = customText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: text }]);
    setDraft('');
    setActiveMode(customMode);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: buildReply(customMode, text)
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleQuickAction = (action) => {
    setActiveMode(action.label);
    handleSend(action.label, action.prompt);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">AI Coding Mentor</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">A beautiful mentor for debugging, explaining, and building faster.</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white">Mentor modes</h3>
            <p className="mt-2 text-sm text-slate-400">Choose a focus and start a guided conversation.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Current focus</p>
            <p className="mt-2 text-lg font-semibold text-white">{modeLabel}</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Use this mentor to explain concepts, generate a starter implementation, review bugs, or prepare for interviews.
            </p>
          </div>
        </div>

        <div className="glass rounded-[2rem] border border-white/10 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between rounded-[1rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <div>
              <p className="text-sm text-slate-400">Conversation history</p>
              <p className="font-semibold text-white">Live AI mentor session</p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              Online
            </div>
          </div>

          <div className="mb-4 max-h-[420px] space-y-3 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[1rem] px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white' : 'border border-white/10 bg-white/5 text-slate-200'}`}>
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={3}
              placeholder="Ask about a bug, concept, or coding challenge..."
              className="w-full resize-none rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Responses are designed to feel like a premium engineering mentor.</p>
              <button
                onClick={() => handleSend()}
                className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01]"
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AICodingMentor;
