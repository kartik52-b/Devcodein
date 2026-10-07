import { Component, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { challenges as demoChallenges } from '../data/challengesData';
import { problemsApi, submissionsApi } from '../services/problemsApi';
import { ApiError, ApiUnavailableError } from '../services/api';
import { useProfile } from '../context/ProfileContext';

/* ------------------------------------------------------------------ */
/* Monaco falls back to a plain editor if the CDN bundle is blocked.   */
/* ------------------------------------------------------------------ */
class EditorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('Monaco failed to load, falling back to a plain editor:', error?.message);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

const normalizeDifficulty = (value) =>
  String(value || 'easy').charAt(0).toUpperCase() + String(value || 'easy').slice(1);

/** Backend catalog (or the bundled demo catalog) → the shape the UI renders. */
const normalizeChallenge = (item) => ({
  id: item.externalId || item.id,
  problemId: item.id,
  title: item.title,
  difficulty: normalizeDifficulty(item.difficulty),
  category: item.category || item.tags?.[0] || 'General',
  xp: item.xp ?? 100,
  description: item.description || item.statement || '',
  starterCode: item.starterCode || '',
  functionName: item.functionName || '',
  hints: item.hints || [],
  solution: item.solution || '',
  discussion: item.discussion || [],
  examples: item.examples || [],
  testCases: item.testCases || []
});

const toDiscussionLines = (discussion) =>
  discussion.map((entry) =>
    typeof entry === 'string' ? entry : `${entry.author}: ${entry.message}`
  );

/**
 * Runs the learner's own code against the problem's test cases **in the
 * browser** — the same tab that authored the code. Nothing is executed on the
 * server (see server/src/services/judge.js).
 */
const runTests = (code, challenge) => {
  if (!challenge.testCases?.length) {
    return { ran: false, results: [] };
  }
  if (!challenge.functionName) {
    return { ran: false, results: [] };
  }

  let fn;
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function(
      `${code}\n;return typeof ${challenge.functionName} === 'function' ? ${challenge.functionName} : null;`
    );
    fn = factory();
  } catch (error) {
    return { ran: true, crashed: error.message, results: [] };
  }

  if (typeof fn !== 'function') {
    return { ran: true, crashed: `Could not find a function named ${challenge.functionName}().`, results: [] };
  }

  const results = challenge.testCases.map((testCase, index) => {
    try {
      const actual = fn(...structuredClone(testCase.args));
      const expected = testCase.expected;
      const passed = JSON.stringify(actual) === JSON.stringify(expected);
      return {
        label: testCase.label || `Test ${index + 1}`,
        passed,
        expected: JSON.stringify(expected),
        actual: JSON.stringify(actual)
      };
    } catch (error) {
      return {
        label: testCase.label || `Test ${index + 1}`,
        passed: false,
        expected: JSON.stringify(testCase.expected),
        actual: `Error: ${error.message}`
      };
    }
  });

  return { ran: true, crashed: null, results };
};

function CodingChallengesPage() {
  const { activeProfile, toggleBookmark, applyServerProgress } = useProfile();
  // Deep link: /modules/practice/:challengeId opens that challenge directly.
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [source, setSource] = useState('api'); // 'api' | 'demo'
  const [reloadKey, setReloadKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(challengeId || null);
  const [code, setCode] = useState('');
  const [runOutcome, setRunOutcome] = useState(null);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '', result: null });

  // Keep the selected challenge in sync with the URL (deep links + refresh).
  useEffect(() => {
    if (challengeId) setSelectedId(challengeId);
  }, [challengeId]);

  // ------------------------------------------------------ load catalog
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await problemsApi.list(controller.signal);
        if (!active) return;
        const list = (Array.isArray(data) ? data : data?.items || []).map(normalizeChallenge);
        if (list.length === 0) {
          setCatalog(demoChallenges.map(normalizeChallenge));
          setSource('demo');
          setLoadError('The API returned no published challenges yet.');
        } else {
          setCatalog(list);
          setSource('api');
        }
      } catch (error) {
        if (!active || error?.name === 'AbortError') return;
        setCatalog(demoChallenges.map(normalizeChallenge));
        setSource('demo');
        setLoadError(
          error instanceof ApiUnavailableError
            ? 'Unable to reach the challenges API — showing the bundled demo catalog.'
            : error instanceof ApiError
              ? `Unable to load challenges: ${error.message}`
              : 'Unable to load challenges. Please try again.'
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const filteredChallenges = useMemo(
    () =>
      catalog.filter((challenge) => {
        const matchesSearch = `${challenge.title} ${challenge.category} ${challenge.description}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficulty === 'All' || challenge.difficulty === difficulty;
        const matchesCategory = category === 'All' || challenge.category === category;
        return matchesSearch && matchesDifficulty && matchesCategory;
      }),
    [catalog, searchTerm, difficulty, category]
  );

  useEffect(() => {
    if (filteredChallenges.length === 0) return;
    if (!filteredChallenges.some((challenge) => challenge.id === selectedId)) {
      setSelectedId(filteredChallenges[0].id);
    }
  }, [filteredChallenges, selectedId]);

  const selectedChallenge =
    filteredChallenges.find((challenge) => challenge.id === selectedId) ||
    catalog.find((challenge) => challenge.id === selectedId) ||
    filteredChallenges[0] ||
    null;

  useEffect(() => {
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode);
      setRunOutcome(null);
      setSubmitState({ status: 'idle', message: '', result: null });
    }
  }, [selectedChallenge?.id]);

  const bookmarks = activeProfile.bookmarks || [];
  const isBookmarked = selectedChallenge ? bookmarks.includes(selectedChallenge.id) : false;

  const handleToggleBookmark = () => {
    if (selectedChallenge) toggleBookmark(selectedChallenge.id);
  };

  const handleRun = () => {
    if (!selectedChallenge) return;
    setSubmitState({ status: 'idle', message: '', result: null });
    const outcome = runTests(code, selectedChallenge);
    if (!outcome.ran) {
      setRunOutcome({
        crashed: 'This challenge has no local test cases yet — submit to get a server verdict.',
        results: []
      });
      return;
    }
    setRunOutcome(outcome);
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) return;
    if (!selectedChallenge.problemId) {
      setSubmitState({
        status: 'error',
        message: 'This challenge is only available in demo mode — start the API to submit.',
        result: null
      });
      return;
    }

    setSubmitState({ status: 'submitting', message: '', result: null });
    try {
      const response = await submissionsApi.create({
        problem: selectedChallenge.problemId,
        code,
        language: 'javascript'
      });

      const verdict = response?.submission?.result;
      const accepted = verdict === 'accepted';
      const parts = [];

      if (accepted) {
        parts.push(
          response.awardedXp > 0
            ? `Solved! +${response.awardedXp} XP`
            : 'Already solved — no additional XP awarded.'
        );
        if (response.leveledUp) parts.push(`Level up to ${response.level}!`);
      } else if (response?.submission?.messages?.length) {
        parts.push(...response.submission.messages);
      }

      setSubmitState({
        status: accepted ? 'success' : 'failed',
        message: parts.join(' ') || 'Submission recorded.',
        result: response
      });

      if (response?.user) applyServerProgress(response.user);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error?.message || 'Unable to submit right now. Please try again.',
        result: null
      });
    }
  };

  const categories = useMemo(
    () => ['All', ...new Set(catalog.map((challenge) => challenge.category))],
    [catalog]
  );

  /* ---------------------------------------------------------- states */
  if (loading) {
    return (
      <div className="min-h-[60vh] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 text-center">
          <p className="animate-pulse text-lg text-slate-300">Loading challenges…</p>
          <p className="text-sm text-slate-500">Fetching the problem catalog from the API.</p>
        </div>
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <div className="min-h-[60vh] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 text-center">
          <p className="text-lg text-white">No challenges available yet.</p>
          <p className="text-sm text-slate-400">{loadError || 'The catalog is empty. Please check back soon.'}</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_52%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Coding challenges</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Train with focused problems, instant feedback, and guided solutions.
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Browse the problem list, filter by difficulty or category, then run or submit your code
                without leaving the experience.
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              <p className="text-slate-300">Current status</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {submitState.status === 'submitting'
                  ? 'Submitting…'
                  : submitState.status === 'success'
                    ? 'Solved'
                    : submitState.status === 'failed'
                      ? 'Needs another pass'
                      : runOutcome
                        ? runOutcome.crashed
                          ? 'Run failed'
                          : runOutcome.results.every((item) => item.passed)
                            ? 'All tests passed'
                            : 'Some tests failed'
                        : 'Ready to run'}
              </p>
            </div>
          </div>

          {loadError ? (
            <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {loadError}{' '}
              <button className="font-semibold underline" onClick={() => setReloadKey((key) => key + 1)}>
                Retry
              </button>
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ------------------------------------------------- list */}
          <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Problem list</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {filteredChallenges.length} active challenges
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                {bookmarks.length} bookmarked
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">Search</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search problems"
                  className="w-full border-none bg-transparent text-sm text-white outline-none"
                />
              </label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  className="w-full border-none bg-transparent text-sm text-white outline-none"
                >
                  {['All', 'Easy', 'Medium', 'Hard'].map((value) => (
                    <option key={value} value={value} className="bg-slate-900">
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full border-none bg-transparent text-sm text-white outline-none"
                >
                  {categories.map((value) => (
                    <option key={value} value={value} className="bg-slate-900">
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filteredChallenges.length === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
                <p className="text-white">No challenges match those filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDifficulty('All');
                    setCategory('All');
                  }}
                  className="mt-3 text-sm font-semibold text-cyan-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredChallenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => {
                      setSelectedId(challenge.id);
                      navigate(`/modules/practice/${challenge.id}`, { replace: true });
                    }}
                    className={`w-full rounded-[1.2rem] border p-4 text-left transition ${
                      selectedChallenge?.id === challenge.id
                        ? 'border-cyan-400/40 bg-cyan-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">{challenge.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{challenge.description}</p>
                      </div>
                      <div className="text-right text-sm text-slate-300">
                        <p>{challenge.difficulty}</p>
                        <p className="mt-1 text-cyan-300">+{challenge.xp} XP</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                      <span>{challenge.category}</span>
                      <span>{bookmarks.includes(challenge.id) ? 'Bookmarked' : 'Save'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------------------------- editor */}
          {selectedChallenge ? (
            <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Selected problem</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedChallenge.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleBookmark}
                      className={`rounded-full border px-3 py-2 text-sm ${
                        isBookmarked
                          ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                          : 'border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                    </button>
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
                      +{selectedChallenge.xp} XP
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                    {selectedChallenge.category}
                  </span>
                  {source === 'demo' ? (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">
                      Demo catalog
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-lg leading-8 text-slate-300">{selectedChallenge.description}</p>

                  {selectedChallenge.examples?.length ? (
                    <div className="mt-4 space-y-2">
                      {selectedChallenge.examples.slice(0, 2).map((example, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-slate-950/60 p-3 font-mono text-xs text-slate-300"
                        >
                          <p>
                            <span className="text-slate-500">Input:</span> {example.input}
                          </p>
                          <p>
                            <span className="text-slate-500">Output:</span> {example.output}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={handleRun}
                      className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Run Code
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitState.status === 'submitting'}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 disabled:opacity-60"
                    >
                      {submitState.status === 'submitting' ? 'Submitting…' : 'Submit Code'}
                    </button>
                  </div>

                  <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-slate-900/80 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Your solution</h3>
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Monaco editor
                      </span>
                    </div>
                    <EditorBoundary
                      fallback={
                        <textarea
                          value={code}
                          onChange={(event) => setCode(event.target.value)}
                          spellCheck={false}
                          className="min-h-[260px] w-full rounded-[1rem] border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-200 outline-none"
                        />
                      }
                    >
                      <Editor
                        height="260px"
                        language="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value ?? '')}
                        loading={<div className="p-4 text-sm text-slate-400">Loading editor…</div>}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2
                        }}
                      />
                    </EditorBoundary>
                  </div>

                  {/* ------------------------------------------------ results */}
                  {runOutcome ? (
                    <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-slate-950/70 p-4">
                      <h3 className="text-base font-semibold text-white">Local test results</h3>
                      {runOutcome.crashed ? (
                        <p className="mt-2 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
                          {runOutcome.crashed}
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2 text-sm">
                          {runOutcome.results.map((result) => (
                            <li
                              key={result.label}
                              className={`rounded-xl border p-3 ${
                                result.passed
                                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                                  : 'border-rose-400/25 bg-rose-400/10 text-rose-100'
                              }`}
                            >
                              <p className="font-semibold">
                                {result.passed ? '✓' : '✗'} {result.label}
                              </p>
                              <p className="mt-1 font-mono text-xs opacity-80">
                                expected {result.expected} · got {result.actual}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}

                  {submitState.status !== 'idle' ? (
                    <div
                      className={`mt-4 rounded-[1.3rem] border p-4 text-sm ${
                        submitState.status === 'success'
                          ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                          : submitState.status === 'submitting'
                            ? 'border-white/10 bg-white/5 text-slate-300'
                            : 'border-rose-400/25 bg-rose-400/10 text-rose-100'
                      }`}
                    >
                      <p className="font-semibold">
                        {submitState.status === 'success'
                          ? 'Submission accepted'
                          : submitState.status === 'submitting'
                            ? 'Sending your solution…'
                            : submitState.status === 'failed'
                              ? 'Not accepted yet'
                              : 'Submission failed'}
                      </p>
                      <p className="mt-1">{submitState.message}</p>
                      {submitState.result?.submission?.judgedBy ? (
                        <p className="mt-2 text-xs opacity-75">
                          Server verdict: {submitState.result.submission.result} · judged by{' '}
                          {submitState.result.submission.judgedBy} (test cases run locally above).
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Hints</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                      {selectedChallenge.hints.length ? (
                        selectedChallenge.hints.map((hint, index) => (
                          <li key={index} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                            {hint}
                          </li>
                        ))
                      ) : (
                        <li className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-slate-500">
                          No hints for this one — you have got this.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Solution</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {selectedChallenge.solution || 'The official write-up unlocks after you submit.'}
                    </p>
                  </div>

                  <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Discussion</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                      {toDiscussionLines(selectedChallenge.discussion).length ? (
                        toDiscussionLines(selectedChallenge.discussion).map((line, index) => (
                          <li key={index} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                            {line}
                          </li>
                        ))
                      ) : (
                        <li className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-slate-500">
                          No discussion yet — be the first to share an approach.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default CodingChallengesPage;
