// ═══════════════════════════════════════════════════════════════════════════════
// Web Worker support for off-thread syntax highlighting
// ═══════════════════════════════════════════════════════════════════════════════
//
// This module provides a factory function for creating an inline Web Worker
// that performs basic keyword-level tokenization on a background thread.
// Useful for highlighting very large code blocks without blocking the UI.
//
// The worker is created from a Blob URL so no external worker file is needed.
// If the runtime does not support Workers (e.g. SSR), the factory returns
// `null` and callers can fall back to synchronous highlighting.
//
// @example
// ```ts
// import { createHighlightWorker, highlightInWorker } from './syntax-highlight-worker';
//
// const worker = createHighlightWorker();
// if (worker) {
//   const tokens = await highlightInWorker(worker, hugeCode, 'javascript');
//   worker.terminate();
// }
// ```
// ═══════════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Message Types
// ---------------------------------------------------------------------------

/** Message sent TO the worker. */
export interface WorkerMessage {
  type: 'highlight';
  code: string;
  language: string;
  theme: 'light' | 'dark';
}

/** Message received FROM the worker. */
export interface WorkerResult {
  type: 'highlight-result';
  tokens: HighlightToken[];
}

/** A single highlighted token returned by the worker. */
export interface HighlightToken {
  /** The raw text of the token */
  text: string;
  /** Token type classification */
  type: 'comment' | 'keyword' | 'string' | 'number' | 'operator' | 'plain';
  /** 0-based line index the token belongs to */
  line: number;
}

// ---------------------------------------------------------------------------
// Worker Inline Source
// ---------------------------------------------------------------------------

/**
 * The JavaScript source code that will run inside the Web Worker.
 *
 * It defines a `self.onmessage` handler that:
 * 1. Receives `{ type, code, language }`.
 * 2. Splits the code into lines.
 * 3. Performs a lightweight per-line classification (comment, keyword,
 *    string, number, operator, plain).
 * 4. Posts back `{ type: 'highlight-result', tokens }`.
 *
 * The tokenization is intentionally simple — it's meant to offload work
 * from the main thread, not to replace a full parser.
 */
const WORKER_SOURCE = `
// ── Highlight Worker ──────────────────────────────────────────────────────

self.onmessage = function(e) {
  var data = e.data;
  if (!data || data.type !== 'highlight') return;

  var code   = data.code   || '';
  var lang   = data.language || 'text';
  var tokens = tokenize(code, lang);

  self.postMessage({ type: 'highlight-result', tokens: tokens });
};

// ── Keyword sets ─────────────────────────────────────────────────────────

var JS_KEYWORDS = [
  'function','const','let','var','class','import','export','return',
  'if','else','for','while','do','switch','case','break','continue',
  'new','this','super','extends','implements','typeof','instanceof',
  'in','of','from','as','async','await','try','catch','finally',
  'throw','yield','default','delete','void','with','debugger',
  'static','get','set'
];

var PY_KEYWORDS = [
  'def','class','import','from','return','if','elif','else','for',
  'while','break','continue','pass','raise','try','except','finally',
  'with','as','lambda','yield','global','nonlocal','assert','del',
  'True','False','None','and','or','not','is','in','print'
];

var RUST_KEYWORDS = [
  'fn','let','mut','const','struct','enum','impl','trait','type',
  'use','mod','pub','crate','self','super','return','if','else',
  'for','while','loop','match','where','as','in','ref','move',
  'async','await','unsafe','extern','static','true','false'
];

var GO_KEYWORDS = [
  'func','var','const','type','struct','interface','map','chan',
  'range','for','if','else','switch','case','default','break',
  'continue','return','go','select','defer','package','import',
  'true','false','nil','make','new','append','len','cap'
];

var KEYWORDS_BY_LANG = {
  javascript: JS_KEYWORDS,
  typescript: JS_KEYWORDS,
  jsx:        JS_KEYWORDS,
  tsx:        JS_KEYWORDS,
  python:     PY_KEYWORDS,
  py:         PY_KEYWORDS,
  rust:       RUST_KEYWORDS,
  rs:         RUST_KEYWORDS,
  go:         GO_KEYWORDS,
};

// ── Tokenizer ────────────────────────────────────────────────────────────

function getKeywords(lang) {
  var lower = (lang || 'text').toLowerCase();
  return KEYWORDS_BY_LANG[lower] || JS_KEYWORDS;
}

function tokenize(code, lang) {
  var lines   = code.split('\\n');
  var tokens  = [];
  var keywords = getKeywords(lang);
  var kwSet  = {};

  for (var k = 0; k < keywords.length; k++) {
    kwSet[keywords[k]] = true;
    kwSet[keywords[k].toLowerCase()] = true;
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();

    // Line-level comment detection
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      tokens.push({ text: line, type: 'comment', line: i });
      continue;
    }

    // Block comment end detection (heuristic: if line ends with */ and starts with whitespace or *)
    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/')) {
      // Could be inside a block comment — classify conservatively
      if (trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        tokens.push({ text: line, type: 'comment', line: i });
        continue;
      }
    }

    // Check for keyword line (line starts with a known keyword)
    var wordMatch = trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch && kwSet[wordMatch[0]]) {
      tokens.push({ text: line, type: 'keyword', line: i });
      continue;
    }

    // Check for string-only lines
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('\`') && trimmed.endsWith('\`'))) {
      tokens.push({ text: line, type: 'string', line: i });
      continue;
    }

    // Check for number-only lines
    if (/^\\s*\\d+\\.?\\d*\\s*$/.test(line)) {
      tokens.push({ text: line, type: 'number', line: i });
      continue;
    }

    // Default
    tokens.push({ text: line, type: 'plain', line: i });
  }

  return tokens;
}
`;

// ---------------------------------------------------------------------------
// Worker Factory
// ---------------------------------------------------------------------------

/**
 * Creates a Web Worker from an inline Blob that can perform basic syntax
 * tokenization on a background thread.
 *
 * @returns A `Worker` instance, or `null` if the environment does not
 *          support Web Workers (e.g. server-side rendering).
 *
 * @example
 * ```ts
 * const worker = createHighlightWorker();
 * if (worker) {
 *   try {
 *     const tokens = await highlightInWorker(worker, code, 'typescript');
 *     // use tokens...
 *   } finally {
 *     worker.terminate();
 *   }
 * }
 * ```
 */
export function createHighlightWorker(): Worker | null {
  if (typeof Worker === 'undefined') {
    return null;
  }

  try {
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    // Clean up the object URL once the worker is created
    worker.addEventListener('error', () => {
      URL.revokeObjectURL(url);
    }, { once: true });

    // Also revoke on successful message (the worker loaded fine)
    worker.addEventListener('message', () => {
      URL.revokeObjectURL(url);
    }, { once: true });

    return worker;
  } catch {
    // Blob URL creation may fail in some restricted environments
    return null;
  }
}

// ---------------------------------------------------------------------------
// Highlight-in-Worker Helper
// ---------------------------------------------------------------------------

/**
 * Sends code to a highlight worker and returns a Promise that resolves
 * with the tokenized result.
 *
 * The Promise rejects if the worker encounters an error.
 *
 * @param worker  - The Worker instance created by `createHighlightWorker()`
 * @param code    - The source code to tokenize
 * @param language - The language identifier (e.g. 'javascript', 'python')
 * @returns A Promise resolving to an array of `HighlightToken`
 *
 * @example
 * ```ts
 * const worker = createHighlightWorker();
 * if (worker) {
 *   const tokens = await highlightInWorker(worker, 'const x = 42;', 'javascript');
 *   // tokens => [
 *   //   { text: 'const x = 42;', type: 'keyword', line: 0 }
 *   // ]
 * }
 * ```
 */
export function highlightInWorker(
  worker: Worker,
  code: string,
  language: string
): Promise<HighlightToken[]> {
  return new Promise<HighlightToken[]>((resolve, reject) => {
    const handler = (e: MessageEvent) => {
      const data = e.data as WorkerResult;

      if (data && data.type === 'highlight-result') {
        worker.removeEventListener('message', handler);
        worker.removeEventListener('error', errorHandler);
        resolve(data.tokens);
      }
    };

    const errorHandler = (err: ErrorEvent) => {
      worker.removeEventListener('message', handler);
      worker.removeEventListener('error', errorHandler);
      reject(err);
    };

    worker.addEventListener('message', handler);
    worker.addEventListener('error', errorHandler);

    // Send the highlighting request
    worker.postMessage({
      type: 'highlight',
      code,
      language,
      theme: 'light', // theme is accepted but the inline tokenizer doesn't use it
    } as WorkerMessage);
  });
}

// ---------------------------------------------------------------------------
// Convenience: Highlight with auto-created worker
// ---------------------------------------------------------------------------

/**
 * One-shot helper that creates a worker, highlights the code, and then
 * terminates the worker.  Falls back to synchronous inline tokenization
 * if Workers are unavailable.
 *
 * This is the simplest API for callers that don't want to manage
 * worker lifecycle themselves.
 *
 * @param code     - The source code to tokenize
 * @param language - The language identifier
 * @returns A Promise resolving to an array of `HighlightToken`
 */
export async function highlightOnce(
  code: string,
  language: string
): Promise<HighlightToken[]> {
  const worker = createHighlightWorker();
  if (!worker) {
    // Fallback: synchronous inline tokenization on main thread
    return highlightSync(code, language);
  }

  try {
    return await highlightInWorker(worker, code, language);
  } finally {
    worker.terminate();
  }
}

// ---------------------------------------------------------------------------
// Synchronous Fallback
// ---------------------------------------------------------------------------

/**
 * Synchronous fallback tokenizer used when Web Workers are not available.
 * Performs the same classification as the worker but on the main thread.
 */
function highlightSync(
  code: string,
  language: string
): HighlightToken[] {
  const lines = code.split('\n');
  const tokens: HighlightToken[] = [];

  const jsKw = new Set([
    'function', 'const', 'let', 'var', 'class', 'import', 'export', 'return',
    'if', 'else', 'for', 'while', 'def', 'pub', 'fn', 'struct', 'enum',
    'impl', 'trait', 'type', 'interface', 'package', 'module', 'use', 'mut',
    'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super',
    'extends', 'implements', 'public', 'private', 'protected', 'static',
    'void', 'int', 'string', 'bool', 'float', 'double', 'true', 'false',
    'null', 'undefined', 'nil', 'none', 'self', 'from', 'as', 'with',
    'yield', 'lambda', 'print', 'in', 'not', 'and', 'or', 'is', 'elif',
    'except', 'finally', 'raise', 'pass', 'break', 'continue', 'del',
    'global', 'nonlocal', 'assert', 'switch', 'case', 'default', 'go',
    'chan', 'range', 'defer', 'select', 'make', 'map', 'chan',
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
      tokens.push({ text: line, type: 'comment', line: i });
      continue;
    }

    // Keyword lines
    const wordMatch = trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch && jsKw.has(wordMatch[0])) {
      tokens.push({ text: line, type: 'keyword', line: i });
      continue;
    }

    // String-only lines
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('`') && trimmed.endsWith('`'))
    ) {
      tokens.push({ text: line, type: 'string', line: i });
      continue;
    }

    // Number-only lines
    if (/^\s*\d+\.?\d*\s*$/.test(line)) {
      tokens.push({ text: line, type: 'number', line: i });
      continue;
    }

    tokens.push({ text: line, type: 'plain', line: i });
  }

  return tokens;
}
