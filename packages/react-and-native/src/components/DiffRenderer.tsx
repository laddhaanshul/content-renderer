import React, { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Represents a single line in a text diff.
 * Mirrors the DiffLine type from @laddhaanshul/content-renderer-core's diff-engine so
 * the component works self-contained without a direct dependency on core.
 */
export interface DiffLine {
  /** The type of change for this line */
  type: 'added' | 'removed' | 'unchanged';
  /** The text content of the line (without trailing newline) */
  content: string;
  /** Line number in the original text */
  oldLineNumber?: number;
  /** Line number in the new text */
  newLineNumber?: number;
}

export interface DiffRendererProps {
  /** The original text */
  oldText: string;
  /** The modified text */
  newText: string;
  /** Language hint (currently unused, reserved for future syntax-aware diffs) */
  language?: string;
  /** Color theme: 'light' or 'dark' */
  theme?: 'light' | 'dark';
  /** Show line numbers on the left side (default: true) */
  showLineNumbers?: boolean;
  /** Maximum height of the diff container (CSS value). Enables scrolling when exceeded. */
  maxHeight?: number | string;
  /** Optional CSS class name for the outermost container */
  className?: string;
  /** Inline styles for the outermost container */
  style?: React.CSSProperties;
  /** Test ID for testing */
  testID?: string;
}

// ---------------------------------------------------------------------------
// Theme Definitions
// ---------------------------------------------------------------------------

interface DiffThemeColors {
  background: string;
  text: string;
  gutterBg: string;
  gutterBorder: string;
  gutterText: string;
  addedBg: string;
  addedGutterBg: string;
  addedGutterText: string;
  addedText: string;
  removedBg: string;
  removedGutterBg: string;
  removedGutterText: string;
  removedText: string;
  unchangedBg: string;
  border: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
}

const LIGHT_THEME: DiffThemeColors = {
  background: '#ffffff',
  text: '#24292e',
  gutterBg: '#f6f8fa',
  gutterBorder: '#e1e4e8',
  gutterText: '#959da5',
  addedBg: '#e6ffec',
  addedGutterBg: '#cdffd8',
  addedGutterText: '#22863a',
  addedText: '#22863a',
  removedBg: '#ffeef0',
  removedGutterBg: '#ffdce0',
  removedGutterText: '#cb2431',
  removedText: '#cb2431',
  unchangedBg: '#ffffff',
  border: '#e1e4e8',
  headerBg: '#f1f3f5',
  headerText: '#24292e',
  headerBorder: '#e1e4e8',
};

const DARK_THEME: DiffThemeColors = {
  background: '#1e1e1e',
  text: '#d4d4d4',
  gutterBg: '#1e1e1e',
  gutterBorder: '#3e3e42',
  gutterText: '#858585',
  addedBg: '#1b3a2a',
  addedGutterBg: '#0e4429',
  addedGutterText: '#3fb950',
  addedText: '#3fb950',
  removedBg: '#3d1f24',
  removedGutterBg: '#6e1c23',
  removedGutterText: '#f85149',
  removedText: '#f85149',
  unchangedBg: '#1e1e1e',
  border: '#3e3e42',
  headerBg: '#252526',
  headerText: '#cccccc',
  headerBorder: '#3e3e42',
};

// ---------------------------------------------------------------------------
// Inline Diff Engine (LCS-based)
// ---------------------------------------------------------------------------

/**
 * Compute line-level diff between two strings using an LCS approach.
 * This is a self-contained implementation so the component doesn't depend
 * on @laddhaanshul/content-renderer-core's diff-engine at runtime.
 */
function createDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);
  return computeLineChanges(oldLines, newLines);
}

function splitLines(text: string): string[] {
  if (!text) return [];
  const lines = text.split('\n');
  // If the text ends with a newline, drop the empty trailing element
  if (text.endsWith('\n')) {
    return lines.slice(0, -1);
  }
  return lines;
}

function computeLineChanges(oldLines: string[], newLines: string[]): DiffLine[] {
  const m = oldLines.length;
  const n = newLines.length;

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

  // For very large inputs, use patience-diff fallback to avoid O(m*n) memory
  const LCS_THRESHOLD = 5000;
  if (m * n > LCS_THRESHOLD * LCS_THRESHOLD) {
    return computeLineChangesFallback(oldLines, newLines);
  }

  // Build LCS table
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

  // Walk backwards to build edit script
  type Op = { type: 'added' | 'removed' | 'unchanged'; oi?: number; ni?: number };
  const rawOps: Op[] = [];
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

/**
 * Patience-diff inspired fallback for very large inputs.
 */
function computeLineChangesFallback(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];

  // Build a map of unique lines in the old text
  const oldLineMap = new Map<string, number[]>();
  for (let idx = 0; idx < oldLines.length; idx++) {
    const line = oldLines[idx];
    if (!oldLineMap.has(line)) {
      oldLineMap.set(line, []);
    }
    oldLineMap.get(line)!.push(idx);
  }

  // Greedy unique matching (patience algorithm)
  const anchors: Array<{ oi: number; ni: number }> = [];
  const usedOld = new Set<number>();

  for (let j = 0; j < newLines.length; j++) {
    const line = newLines[j];
    const oldIndices = oldLineMap.get(line);
    if (oldIndices) {
      for (const oi of oldIndices) {
        if (!usedOld.has(oi)) {
          if (anchors.length === 0 || oi > anchors[anchors.length - 1].oi) {
            anchors.push({ oi, ni: j });
            usedOld.add(oi);
            break;
          }
        }
      }
    }
  }

  let prevOldEnd = 0;
  let prevNewEnd = 0;

  for (const anchor of anchors) {
    const oldChunk = oldLines.slice(prevOldEnd, anchor.oi);
    const newChunk = newLines.slice(prevNewEnd, anchor.ni);

    if (oldChunk.length > 0 || newChunk.length > 0) {
      const chunkDiff = computeSimpleDiff(oldChunk, newChunk);
      for (const ln of chunkDiff) {
        if (ln.oldLineNumber !== undefined) ln.oldLineNumber += prevOldEnd;
        if (ln.newLineNumber !== undefined) ln.newLineNumber += prevNewEnd;
      }
      result.push(...chunkDiff);
    }

    result.push({
      type: 'unchanged',
      content: oldLines[anchor.oi],
      oldLineNumber: anchor.oi + 1,
      newLineNumber: anchor.ni + 1,
    });

    prevOldEnd = anchor.oi + 1;
    prevNewEnd = anchor.ni + 1;
  }

  // Handle trailing chunks
  const tailOld = oldLines.slice(prevOldEnd);
  const tailNew = newLines.slice(prevNewEnd);
  if (tailOld.length > 0 || tailNew.length > 0) {
    const tailDiff = computeSimpleDiff(tailOld, tailNew);
    for (const ln of tailDiff) {
      if (ln.oldLineNumber !== undefined) ln.oldLineNumber += prevOldEnd;
      if (ln.newLineNumber !== undefined) ln.newLineNumber += prevNewEnd;
    }
    result.push(...tailDiff);
  }

  return result;
}

function computeSimpleDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  if (oldLines.length === 0) {
    return newLines.map((l, i) => ({ type: 'added' as const, content: l, newLineNumber: i + 1 }));
  }
  if (newLines.length === 0) {
    return oldLines.map((l, i) => ({ type: 'removed' as const, content: l, oldLineNumber: i + 1 }));
  }

  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = new Array(m + 1);
  for (let i = 0; i <= m; i++) dp[i] = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  type Op = { type: 'added' | 'removed' | 'unchanged'; oi?: number; ni?: number };
  const rawOps: Op[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawOps.push({ type: 'unchanged', oi: i - 1, ni: j - 1 });
      i--; j--;
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
// Component
// ---------------------------------------------------------------------------

/**
 * DiffRenderer — renders a side-by-side or unified diff of two text strings.
 *
 * Features:
 * - LCS-based line diffing (self-contained, no core dependency)
 * - Fallback to patience-diff for very large inputs
 * - Light / dark themes
 * - Line numbers for old and new texts
 * - Configurable max-height with scrolling
 *
 * @example
 * ```tsx
 * <DiffRenderer
 *   oldText="Hello World\nGoodbye World\n"
 *   newText="Hello Earth\nGoodbye World\nWelcome\n"
 *   theme="dark"
 *   showLineNumbers
 * />
 * ```
 */
export const DiffRenderer: React.FC<DiffRendererProps> = ({
  oldText,
  newText,
  theme = 'light',
  showLineNumbers = true,
  maxHeight,
  className,
  style,
  testID,
}) => {
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const diffResult = useMemo(() => {
    const lines = createDiff(oldText, newText);
    const additions = lines.filter((l) => l.type === 'added').length;
    const deletions = lines.filter((l) => l.type === 'removed').length;
    const unchanged = lines.filter((l) => l.type === 'unchanged').length;
    return { lines, additions, deletions, unchanged };
  }, [oldText, newText]);

  // Calculate the width needed for line numbers
  const maxLineNum = Math.max(
    ...diffResult.lines.map((l) => Math.max(l.oldLineNumber ?? 0, l.newLineNumber ?? 0)),
    1
  );
  const gutterWidth = String(maxLineNum).length;

  // Container style
  const containerStyle: React.CSSProperties = {
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    color: colors.text,
    backgroundColor: colors.background,
    ...style,
  };

  // Header style
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: colors.headerBg,
    borderBottom: `1px solid ${colors.headerBorder}`,
    color: colors.headerText,
    fontSize: '13px',
  };

  // Diff body with optional scrolling
  const bodyStyle: React.CSSProperties = {
    overflow: maxHeight ? 'auto' : 'visible',
    maxHeight: maxHeight
      ? typeof maxHeight === 'number'
        ? `${maxHeight}px`
        : maxHeight
      : undefined,
  };

  // Line row
  const lineRowStyle = (line: DiffLine): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      minHeight: '20px',
    };

    if (line.type === 'added') {
      base.backgroundColor = colors.addedBg;
    } else if (line.type === 'removed') {
      base.backgroundColor = colors.removedBg;
    } else {
      base.backgroundColor = colors.unchangedBg;
    }

    return base;
  };

  // Gutter (line numbers)
  const gutterBaseStyle: React.CSSProperties = {
    flexShrink: 0,
    textAlign: 'right',
    userSelect: 'none',
    padding: '0 12px',
    fontSize: '13px',
    lineHeight: '1.6',
    borderRight: `1px solid ${colors.gutterBorder}`,
    minWidth: `${gutterWidth + 2}ch`,
  };

  const gutterOldStyle = (line: DiffLine): React.CSSProperties => {
    if (line.type === 'added') {
      return {
        ...gutterBaseStyle,
        backgroundColor: colors.addedBg,
        color: 'transparent',
      };
    }
    if (line.type === 'removed') {
      return {
        ...gutterBaseStyle,
        backgroundColor: colors.removedGutterBg,
        color: colors.removedGutterText,
      };
    }
    return {
      ...gutterBaseStyle,
      backgroundColor: colors.gutterBg,
      color: colors.gutterText,
    };
  };

  const gutterNewStyle = (line: DiffLine): React.CSSProperties => {
    if (line.type === 'removed') {
      return {
        ...gutterBaseStyle,
        backgroundColor: colors.removedBg,
        color: 'transparent',
      };
    }
    if (line.type === 'added') {
      return {
        ...gutterBaseStyle,
        backgroundColor: colors.addedGutterBg,
        color: colors.addedGutterText,
      };
    }
    return {
      ...gutterBaseStyle,
      backgroundColor: colors.gutterBg,
      color: colors.gutterText,
    };
  };

  // Content cell
  const contentStyle = (line: DiffLine): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: '0 16px',
    whiteSpace: 'pre' as const,
    fontSize: '13px',
    lineHeight: '1.6',
    color:
      line.type === 'added'
        ? colors.addedText
        : line.type === 'removed'
          ? colors.removedText
          : colors.text,
    backgroundColor:
      line.type === 'added'
        ? colors.addedBg
        : line.type === 'removed'
          ? colors.removedBg
          : colors.unchangedBg,
  });

  // Sign indicator column
  const signStyle = (line: DiffLine): React.CSSProperties => ({
    flexShrink: 0,
    width: '20px',
    textAlign: 'center',
    userSelect: 'none',
    fontSize: '13px',
    lineHeight: '1.6',
    fontWeight: 700,
    color:
      line.type === 'added'
        ? colors.addedText
        : line.type === 'removed'
          ? colors.removedText
          : 'transparent',
    backgroundColor:
      line.type === 'added'
        ? colors.addedBg
        : line.type === 'removed'
          ? colors.removedBg
          : colors.unchangedBg,
  });

  return (
    <div className={className} style={containerStyle} data-testid={testID ?? 'diff-renderer'}>
      {/* Stats Header */}
      <div style={headerStyle}>
        <span style={{ fontWeight: 500 }}>Diff</span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          {diffResult.additions > 0 && (
            <span style={{ color: colors.addedText }}>
              +{diffResult.additions} {diffResult.additions === 1 ? 'addition' : 'additions'}
            </span>
          )}
          {diffResult.deletions > 0 && (
            <span style={{ color: colors.removedText }}>
              -{diffResult.deletions} {diffResult.deletions === 1 ? 'deletion' : 'deletions'}
            </span>
          )}
          {diffResult.unchanged > 0 && (
            <span style={{ color: colors.gutterText }}>
              {diffResult.unchanged} unchanged
            </span>
          )}
        </div>
      </div>

      {/* Diff Lines */}
      <div style={bodyStyle}>
        {diffResult.lines.map((line, idx) => (
          <div key={`diff-line-${idx}`} style={lineRowStyle(line)}>
            {showLineNumbers && (
              <>
                {/* Old line number */}
                <div style={gutterOldStyle(line)}>
                  {line.oldLineNumber != null
                    ? String(line.oldLineNumber).padStart(gutterWidth, '\u00A0')
                    : ''}
                </div>
                {/* New line number */}
                <div style={gutterNewStyle(line)}>
                  {line.newLineNumber != null
                    ? String(line.newLineNumber).padStart(gutterWidth, '\u00A0')
                    : ''}
                </div>
              </>
            )}
            {/* +/- sign */}
            <div style={signStyle(line)}>
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : '\u00A0'}
            </div>
            {/* Line content */}
            <div style={contentStyle(line)}>
              {line.content || '\u00A0'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

DiffRenderer.displayName = 'DiffRenderer';

export default DiffRenderer;
