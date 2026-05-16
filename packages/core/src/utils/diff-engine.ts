/**
 * Text Diff Engine
 *
 * A pure TypeScript implementation of text differencing using the LCS
 * (Longest Common Subsequence) approach — conceptually similar to the
 * Myers diff algorithm but simplified for clarity and readability.
 *
 * @module diff-engine
 *
 * @example
 * // Basic diff
 * const old = "Hello World\nGoodbye World\n";
 * const new = "Hello Earth\nGoodbye World\nWelcome\n";
 * const diff = createDiff(old, new);
 * // diff[0] => { type: 'removed', content: 'Hello World', oldLineNumber: 1 }
 * // diff[1] => { type: 'added',   content: 'Hello Earth', newLineNumber: 1 }
 * // diff[2] => { type: 'unchanged', content: 'Goodbye World', oldLineNumber: 2, newLineNumber: 2 }
 * // diff[3] => { type: 'added',   content: 'Welcome', newLineNumber: 3 }
 *
 * @example
 * // Unified diff output
 * const unified = createUnifiedDiff(old, new, 'old.txt', 'new.txt');
 * // "--- old.txt"
 * // "+++ new.txt"
 * // "@@ -1,2 +1,3 @@"
 * // "-Hello World"
 * // "+Hello Earth"
 * // " Goodbye World"
 * // "+Welcome"
 *
 * @example
 * // Applying a diff to reconstruct new text
 * const text = "a\nb\nc\n";
 * const diff = createDiff(text, "a\nx\nc\n");
 * const result = applyDiff(text, diff); // "a\nx\nc\n"
 *
 * @example
 * // Getting statistics
 * const result = createDiff("line1\nline2\n", "line1\nline3\nline4\n");
 * // additions: 2 (line3 + line4), deletions: 1 (line2), unchanged: 1 (line1)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiffLine {
  /** The type of change for this line */
  type: 'added' | 'removed' | 'unchanged';
  /** The text content of the line (without the trailing newline) */
  content: string;
  /** Line number in the original text (if applicable) */
  oldLineNumber?: number;
  /** Line number in the new text (if applicable) */
  newLineNumber?: number;
}

export interface DiffResult {
  /** Array of diff lines */
  lines: DiffLine[];
  /** Number of lines added */
  additions: number;
  /** Number of lines removed */
  deletions: number;
  /** Number of unchanged lines */
  unchanged: number;
}

// ---------------------------------------------------------------------------
// Core: LCS-based line-level diff
// ---------------------------------------------------------------------------

/**
 * Computes the diff between two arrays of lines using an LCS-based approach.
 * This is the core algorithm — higher-level functions delegate to it.
 *
 * The algorithm:
 * 1. Build an LCS table to find the longest common subsequence of lines.
 * 2. Walk the table backwards to produce a minimal edit script.
 * 3. Map edit operations back to `DiffLine` objects with line numbers.
 *
 * @param oldLines - Lines from the original text
 * @param newLines - Lines from the modified text
 * @returns Array of `DiffLine` objects representing the diff
 *
 * @example
 * computeLineChanges(
 *   ['hello', 'world'],
 *   ['hello', 'earth', 'world']
 * );
 * // => [
 * //   { type: 'unchanged', content: 'hello', oldLineNumber: 1, newLineNumber: 1 },
 * //   { type: 'added',     content: 'earth', newLineNumber: 2 },
 * //   { type: 'unchanged', content: 'world', oldLineNumber: 2, newLineNumber: 3 },
 * // ]
 */
export function computeLineChanges(
  oldLines: string[],
  newLines: string[]
): DiffLine[] {
  const m = oldLines.length;
  const n = newLines.length;

  // Quick path: one side is empty
  if (m === 0 && n === 0) return [];
  if (m === 0) {
    return newLines.map((line, i) => ({
      type: 'added' as const,
      content: line,
      newLineNumber: i + 1,
    }));
  }
  if (n === 0) {
    return oldLines.map((line, i) => ({
      type: 'removed' as const,
      content: line,
      oldLineNumber: i + 1,
    }));
  }

  // For very large inputs, fall back to a faster heuristic to avoid
  // O(m*n) memory allocation.  Threshold chosen to keep memory reasonable.
  const LCS_THRESHOLD = 5000;
  if (m * n > LCS_THRESHOLD * LCS_THRESHOLD) {
    return computeLineChangesFallback(oldLines, newLines);
  }

  // 1. Build LCS table
  // dp[i][j] = length of LCS of oldLines[0..i-1] and newLines[0..j-1]
  const dp: number[][] = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1).fill(0);
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 2. Walk backwards through the table to build the edit script
  const rawOps: Array<{ type: 'added' | 'removed' | 'unchanged'; oldIdx?: number; newIdx?: number }> = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawOps.push({ type: 'unchanged', oldIdx: i - 1, newIdx: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawOps.push({ type: 'added', newIdx: j - 1 });
      j--;
    } else {
      rawOps.push({ type: 'removed', oldIdx: i - 1 });
      i--;
    }
  }

  // 3. Reverse to get forward order and assign line numbers
  rawOps.reverse();

  const result: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const op of rawOps) {
    const line: DiffLine = { type: op.type, content: '' };

    if (op.type === 'unchanged') {
      line.content = oldLines[op.oldIdx!];
      line.oldLineNumber = oldLineNum++;
      line.newLineNumber = newLineNum++;
    } else if (op.type === 'removed') {
      line.content = oldLines[op.oldIdx!];
      line.oldLineNumber = oldLineNum++;
    } else {
      line.content = newLines[op.newIdx!];
      line.newLineNumber = newLineNum++;
    }

    result.push(line);
  }

  return result;
}

/**
 * Fallback diff algorithm for very large inputs.
 * Uses a hash-based LCS approach to reduce memory.
 */
function computeLineChangesFallback(
  oldLines: string[],
  newLines: string[]
): DiffLine[] {
  // Simple approach: use a patience-diff inspired heuristic.
  // Find unique common lines, anchor on them, then diff the chunks between.
  const result: DiffLine[] = [];

  // Build a map of unique lines in the old text
  const oldLineMap = new Map<string, number[]>();
  for (let i = 0; i < oldLines.length; i++) {
    const line = oldLines[i];
    if (!oldLineMap.has(line)) {
      oldLineMap.set(line, []);
    }
    oldLineMap.get(line)!.push(i);
  }

  // Build LCS using patience algorithm (greedy unique matching)
  const anchors: Array<{ oldIdx: number; newIdx: number }> = [];
  const usedOld = new Set<number>();

  for (let j = 0; j < newLines.length; j++) {
    const line = newLines[j];
    const oldIndices = oldLineMap.get(line);
    if (oldIndices) {
      // Find the first unused old index that is > the last anchor
      for (const oi of oldIndices) {
        if (!usedOld.has(oi)) {
          // Check it's after the last anchor
          if (anchors.length === 0 || oi > anchors[anchors.length - 1].oldIdx) {
            anchors.push({ oldIdx: oi, newIdx: j });
            usedOld.add(oi);
            break;
          }
        }
      }
    }
  }

  // Now diff between anchors
  let prevOldEnd = 0;
  let prevNewEnd = 0;

  for (const anchor of anchors) {
    // Diff the chunk before this anchor
    const oldChunk = oldLines.slice(prevOldEnd, anchor.oldIdx);
    const newChunk = newLines.slice(prevNewEnd, anchor.newIdx);

    if (oldChunk.length > 0 || newChunk.length > 0) {
      const chunkDiff = computeLineChangesSimple(oldChunk, newChunk);
      // Offset line numbers
      for (const line of chunkDiff) {
        if (line.oldLineNumber !== undefined) {
          line.oldLineNumber += prevOldEnd;
        }
        if (line.newLineNumber !== undefined) {
          line.newLineNumber += prevNewEnd;
        }
      }
      result.push(...chunkDiff);
    }

    // Add the anchored unchanged line
    result.push({
      type: 'unchanged',
      content: oldLines[anchor.oldIdx],
      oldLineNumber: anchor.oldIdx + 1,
      newLineNumber: anchor.newIdx + 1,
    });

    prevOldEnd = anchor.oldIdx + 1;
    prevNewEnd = anchor.newIdx + 1;
  }

  // Handle trailing chunks
  const tailOld = oldLines.slice(prevOldEnd);
  const tailNew = newLines.slice(prevNewEnd);
  if (tailOld.length > 0 || tailNew.length > 0) {
    const tailDiff = computeLineChangesSimple(tailOld, tailNew);
    for (const line of tailDiff) {
      if (line.oldLineNumber !== undefined) {
        line.oldLineNumber += prevOldEnd;
      }
      if (line.newLineNumber !== undefined) {
        line.newLineNumber += prevNewEnd;
      }
    }
    result.push(...tailDiff);
  }

  return result;
}

/**
 * Simple LCS diff for small chunks (used by fallback).
 */
function computeLineChangesSimple(
  oldLines: string[],
  newLines: string[]
): DiffLine[] {
  if (oldLines.length === 0) {
    return newLines.map((line, i) => ({
      type: 'added' as const,
      content: line,
      newLineNumber: i + 1,
    }));
  }
  if (newLines.length === 0) {
    return oldLines.map((line, i) => ({
      type: 'removed' as const,
      content: line,
      oldLineNumber: i + 1,
    }));
  }

  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1).fill(0);
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const rawOps: Array<{ type: 'added' | 'removed' | 'unchanged'; oi?: number; ni?: number }> = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawOps.push({ type: 'unchanged', oi: i - 1, ni: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawOps.push({ type: 'added', ni: j - 1 });
      j--;
    } else {
      rawOps.push({ type: 'removed', oi: i - 1 });
      i--;
    }
  }

  rawOps.reverse();

  const result: DiffLine[] = [];
  let oNum = 1;
  let nNum = 1;

  for (const op of rawOps) {
    const line: DiffLine = { type: op.type, content: '' };
    if (op.type === 'unchanged') {
      line.content = oldLines[op.oi!];
      line.oldLineNumber = oNum++;
      line.newLineNumber = nNum++;
    } else if (op.type === 'removed') {
      line.content = oldLines[op.oi!];
      line.oldLineNumber = oNum++;
    } else {
      line.content = newLines[op.ni!];
      line.newLineNumber = nNum++;
    }
    result.push(line);
  }

  return result;
}

// ---------------------------------------------------------------------------
// High-level API
// ---------------------------------------------------------------------------

/**
 * Creates a diff between two text strings.
 *
 * Splits both texts into lines, computes the line-level diff, and returns
 * an array of `DiffLine` objects with change types and line numbers.
 *
 * @param oldText - The original text
 * @param newText - The modified text
 * @returns Array of `DiffLine` objects
 *
 * @example
 * const diff = createDiff("a\nb\nc\n", "a\nx\nc\n");
 * // diff => [
 * //   { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
 * //   { type: 'removed',   content: 'b', oldLineNumber: 2 },
 * //   { type: 'added',     content: 'x', newLineNumber: 2 },
 * //   { type: 'unchanged', content: 'c', oldLineNumber: 3, newLineNumber: 3 },
 * // ]
 */
export function createDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);
  return computeLineChanges(oldLines, newLines);
}

/**
 * Creates a unified diff string from two texts, similar to `git diff --unified=3`.
 *
 * @param oldText - The original text
 * @param newText - The modified text
 * @param oldFileName - Optional filename for the `---` header (default: `'a/file'`)
 * @param newFileName - Optional filename for the `+++` header (default: `'b/file'`)
 * @returns Unified diff formatted string
 *
 * @example
 * const unified = createUnifiedDiff(
 *   "line1\nline2\nline3\n",
 *   "line1\nline2-modified\nline3\nline4\n",
 *   "original.txt",
 *   "modified.txt"
 * );
 * // "--- original.txt"
 * // "+++ modified.txt"
 * // "@@ -1,3 +1,4 @@"
 * // " line1"
 * // "-line2"
 * // "+line2-modified"
 * // " line3"
 * // "+line4"
 */
export function createUnifiedDiff(
  oldText: string,
  newText: string,
  oldFileName: string = 'a/file',
  newFileName: string = 'b/file'
): string {
  const diffLines = createDiff(oldText, newText);

  // Group consecutive lines into "hunks"
  const hunks = groupHunks(diffLines, 3);

  const lines: string[] = [];
  lines.push(`--- ${oldFileName}`);
  lines.push(`+++ ${newFileName}`);

  for (const hunk of hunks) {
    const oldStart = hunk.lines[0]?.oldLineNumber ?? 0;
    const newStart = hunk.lines[0]?.newLineNumber ?? 0;
    const oldCount = hunk.lines.filter((l) => l.type !== 'added').length;
    const newCount = hunk.lines.filter((l) => l.type !== 'removed').length;

    lines.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);

    for (const line of hunk.lines) {
      const prefix =
        line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      lines.push(`${prefix}${line.content}`);
    }
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Apply diff
// ---------------------------------------------------------------------------

/**
 * Applies a diff to a base text and returns the resulting text.
 * Only `added` and `unchanged` lines are included in the output.
 *
 * @param text - The original (base) text
 * @param diff - Array of `DiffLine` objects
 * @returns The resulting text after applying the diff
 *
 * @example
 * const diff = createDiff("a\nb\nc\n", "a\nx\nc\n");
 * applyDiff("a\nb\nc\n", diff); // "a\nx\nc\n"
 */
export function applyDiff(text: string, diff: DiffLine[]): string {
  const lines: string[] = [];
  for (const line of diff) {
    if (line.type === 'removed') continue;
    lines.push(line.content);
  }
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Hunk {
  lines: DiffLine[];
}

/**
 * Groups diff lines into hunks with configurable context lines.
 * Each hunk includes up to `contextLines` unchanged lines before and after
 * the changed lines.
 */
function groupHunks(diffLines: DiffLine[], contextLines: number): Hunk[] {
  if (diffLines.length === 0) return [];

  // Identify the indices of change lines (added or removed)
  const changeIndices: number[] = [];
  for (let i = 0; i < diffLines.length; i++) {
    if (diffLines[i].type !== 'unchanged') {
      changeIndices.push(i);
    }
  }

  if (changeIndices.length === 0) return [];

  // Merge nearby changes into hunks
  const hunks: Hunk[] = [];
  let hunkStart = Math.max(0, changeIndices[0] - contextLines);
  let lastChangeIdx = changeIndices[0];

  for (let ci = 1; ci < changeIndices.length; ci++) {
    const gap = changeIndices[ci] - lastChangeIdx - 1;
    // If the gap is larger than 2 * contextLines, start a new hunk
    if (gap > contextLines * 2) {
      // Finish current hunk
      const hunkEnd = Math.min(diffLines.length, lastChangeIdx + contextLines + 1);
      hunks.push({ lines: diffLines.slice(hunkStart, hunkEnd) });

      // Start new hunk
      hunkStart = Math.max(0, changeIndices[ci] - contextLines);
    }
    lastChangeIdx = changeIndices[ci];
  }

  // Finish the last hunk
  const hunkEnd = Math.min(diffLines.length, lastChangeIdx + contextLines + 1);
  hunks.push({ lines: diffLines.slice(hunkStart, hunkEnd) });

  return hunks;
}

/**
 * Splits text into lines, preserving the content but stripping trailing newlines.
 * A trailing empty string is included if the text ends with a newline
 * (consistent with how most diff tools handle line-based diffs).
 */
function splitLines(text: string): string[] {
  if (!text) return [];
  // Split on newlines, but don't include the newline in the content
  let lines = text.split('\n');
  // If text ends with newline, the last element will be empty — keep it
  // as a blank line marker if there is actually a trailing newline
  if (text.endsWith('\n')) {
    lines = lines.slice(0, -1); // Remove the empty trailing element
  }
  return lines;
}
