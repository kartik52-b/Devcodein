/**
 * Submission judging.
 *
 * DevVerse does NOT execute untrusted user code on the server: there is no
 * sandboxed runner in this repository, and running arbitrary code with `eval`,
 * `vm` or `child_process` would be unsafe. This module is the single, clearly
 * isolated seam where a real execution service can be plugged in later
 * (e.g. a containerised Judge0 instance set through JUDGE_HTTP_URL).
 *
 * The default implementation performs a deterministic *static* review:
 *   - payload validation (language allow-list, size limits)
 *   - the expected entry function must be present
 *   - obviously destructive/privileged patterns are rejected
 *
 * It never claims to have executed test cases; responses carry
 * `judgedBy: 'static-analysis'` so the UI can label results honestly.
 */

const SUPPORTED_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust'];

const MAX_CODE_BYTES = 64 * 1024;

const BLOCKED_PATTERNS = [
  { pattern: /\beval\s*\(/, reason: 'eval() is not allowed' },
  { pattern: /\bnew\s+Function\s*\(/, reason: 'dynamic code construction is not allowed' },
  { pattern: /\bchild_process\b/, reason: 'process spawning is not allowed' },
  { pattern: /\brequire\s*\(\s*['"]child_process/, reason: 'process spawning is not allowed' },
  { pattern: /\bprocess\s*\.\s*(exit|env|kill)\b/, reason: 'process access is not allowed' },
  { pattern: /\b__proto__\s*\[/, reason: 'prototype manipulation is not allowed' },
  { pattern: /\bimport\s*\(\s*['"]node:/, reason: 'node built-ins are not allowed' }
];

const normalizeLanguage = (language = 'javascript') =>
  String(language).toLowerCase().split(/[\s+-]/)[0];

/**
 * Removes string/template literals and comments so bracket counting only looks
 * at real code — `const map = {')': '('}` must not read as unbalanced.
 */
const stripLiteralsAndComments = (source) => {
  let out = '';
  let i = 0;
  let quote = null;

  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];

    if (quote) {
      if (char === '\\') {
        i += 2;
        continue;
      }
      if (char === quote) quote = null;
      i += 1;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      i += 1;
      continue;
    }

    if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }

    out += char;
    i += 1;
  }

  return out;
};

/**
 * @param {{ code: string, language?: string, functionName?: string }} input
 * @returns {{ result: 'accepted'|'compile-error'|'runtime-error', judgedBy: string, messages: string[] }}
 */
export const judgeSubmission = ({ code, language, functionName }) => {
  const messages = [];
  const lang = normalizeLanguage(language);

  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return {
      result: 'compile-error',
      judgedBy: 'static-analysis',
      messages: [`Unsupported language "${language}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}.`]
    };
  }

  if (typeof code !== 'string' || code.trim().length === 0) {
    return { result: 'compile-error', judgedBy: 'static-analysis', messages: ['Submission is empty.'] };
  }

  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
    return {
      result: 'compile-error',
      judgedBy: 'static-analysis',
      messages: [`Submission exceeds the ${MAX_CODE_BYTES / 1024}KB limit.`]
    };
  }

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { result: 'runtime-error', judgedBy: 'static-analysis', messages: [reason] };
    }
  }

  if (functionName && !new RegExp(`function\\s+${functionName}\\b|${functionName}\\s*[:=]\\s*(async\\s*)?(function|\\()|def\\s+${functionName}\\b|fn\\s+${functionName}\\b`).test(code)) {
    return {
      result: 'compile-error',
      judgedBy: 'static-analysis',
      messages: [`Expected an implementation of ${functionName}().`]
    };
  }

  const stripped = stripLiteralsAndComments(code);
  const openers = (stripped.match(/[{([]/g) || []).length;
  const closers = (stripped.match(/[})\]]/g) || []).length;
  if (openers !== closers) {
    messages.push('Unbalanced brackets detected — double check your solution.');
    return { result: 'compile-error', judgedBy: 'static-analysis', messages };
  }

  messages.push('Static review passed. Run your code locally against the test cases for execution results.');
  return { result: 'accepted', judgedBy: 'static-analysis', messages };
};

export const isSupportedLanguage = (language) => SUPPORTED_LANGUAGES.includes(normalizeLanguage(language));
