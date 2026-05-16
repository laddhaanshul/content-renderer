import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VirtualizedCodeRendererProps {
  /** Source code string to render */
  code: string;
  /** Programming language identifier (currently used for the header badge only) */
  language?: string;
  /** Color theme: 'light' or 'dark' */
  theme?: 'light' | 'dark';
  /** Height of each line in pixels (default: 21) */
  lineHeight?: number;
  /** Number of lines visible at once (default: 20) */
  visibleLines?: number;
  /** Optional CSS class name for the outermost container */
  className?: string;
  /** Inline styles for the outermost container */
  style?: React.CSSProperties;
  /** Test ID for testing */
  testID?: string;
}

// ---------------------------------------------------------------------------
// Theme Colors
// ---------------------------------------------------------------------------

interface VCRThemeColors {
  background: string;
  text: string;
  gutterBg: string;
  gutterText: string;
  gutterBorder: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  border: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
}

const VCR_LIGHT: VCRThemeColors = {
  background: '#ffffff',
  text: '#24292e',
  gutterBg: '#f6f8fa',
  gutterText: '#959da5',
  gutterBorder: '#e1e4e8',
  headerBg: '#f1f3f5',
  headerText: '#24292e',
  headerBorder: '#e1e4e8',
  border: '#e1e4e8',
  keyword: '#d73a49',
  string: '#032f62',
  comment: '#6a737d',
  number: '#005cc5',
};

const VCR_DARK: VCRThemeColors = {
  background: '#1e1e1e',
  text: '#d4d4d4',
  gutterBg: '#1e1e1e',
  gutterText: '#858585',
  gutterBorder: '#3e3e42',
  headerBg: '#252526',
  headerText: '#cccccc',
  headerBorder: '#3e3e42',
  border: '#3e3e42',
  keyword: '#569cd6',
  string: '#ce9178',
  comment: '#6a9955',
  number: '#b5cea8',
};

// ---------------------------------------------------------------------------
// Minimal Tokenizer (inline, no deps)
// ---------------------------------------------------------------------------

interface SimpleToken {
  text: string;
  type: 'keyword' | 'string' | 'comment' | 'number' | 'plain';
}

const KEYWORD_SET = new Set([
  'function', 'const', 'let', 'var', 'class', 'import', 'export', 'return',
  'if', 'else', 'for', 'while', 'def', 'pub', 'fn', 'struct', 'enum', 'impl',
  'trait', 'type', 'interface', 'package', 'module', 'use', 'mut', 'async',
  'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends',
  'implements', 'public', 'private', 'protected', 'static', 'void', 'int',
  'string', 'bool', 'float', 'double', 'char', 'byte', 'long', 'short',
  'true', 'false', 'null', 'undefined', 'nil', 'none', 'self', 'from',
  'as', 'with', 'yield', 'lambda', 'print', 'in', 'not', 'and', 'or',
  'is', 'elif', 'except', 'finally', 'raise', 'pass', 'break', 'continue',
  'del', 'global', 'nonlocal', 'assert', 'switch', 'case', 'default', 'do',
  'goto', 'sizeof', 'typedef', 'sizeof', 'volatile', 'register', 'extern',
  'inline', 'restrict', 'alignas', 'alignof', 'constexpr', 'decltype',
  'noexcept', 'override', 'final', 'operator', 'template', 'typename',
  'namespace', 'using', 'virtual', 'explicit', 'friend', 'mutable',
  'thread_local', 'constexpr', 'static_assert', 'atomic_commit',
]);

/**
 * Very simple single-pass tokenizer for the virtualized renderer.
 * Produces enough coloring to be useful without pulling in the full
 * syntax-highlight module.
 */
function tokenizeLine(line: string): SimpleToken[] {
  if (!line) return [{ text: '', type: 'plain' }];

  const tokens: SimpleToken[] = [];
  let remaining = line;

  // Detect line-level comment early
  const trimmed = remaining.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return [{ text: remaining, type: 'comment' }];
  }

  while (remaining.length > 0) {
    let matched = false;

    // Strings (double & single quoted)
    if (remaining.startsWith('"') || remaining.startsWith("'") || remaining.startsWith('`')) {
      const quote = remaining[0];
      let end = 1;
      while (end < remaining.length) {
        if (remaining[end] === '\\') {
          end += 2; // skip escaped char
          continue;
        }
        if (remaining[end] === quote) {
          end++;
          break;
        }
        end++;
      }
      tokens.push({ text: remaining.substring(0, end), type: 'string' });
      remaining = remaining.substring(end);
      matched = true;
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^(\d+\.?\d*([eE][+-]?\d+)?)/);
    if (numMatch) {
      tokens.push({ text: numMatch[0], type: 'number' });
      remaining = remaining.substring(numMatch[0].length);
      matched = true;
      continue;
    }

    // Identifiers / keywords
    const wordMatch = remaining.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (wordMatch) {
      const word = wordMatch[1];
      if (KEYWORD_SET.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else {
        tokens.push({ text: word, type: 'plain' });
      }
      remaining = remaining.substring(word.length);
      matched = true;
      continue;
    }

    // Everything else (operators, punctuation, whitespace) → plain
    tokens.push({ text: remaining[0], type: 'plain' });
    remaining = remaining.substring(1);
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * VirtualizedCodeRenderer — renders large code blocks with basic windowing.
 *
 * Only the lines currently visible in the scroll viewport are mounted in the
 * DOM. Padding elements above and below maintain correct scrollbar height.
 *
 * This is a lightweight, zero-dependency implementation suitable for
 * rendering files with thousands of lines without jank.
 *
 * @example
 * ```tsx
 * <VirtualizedCodeRenderer
 *   code={veryLargeFileContent}
 *   language="typescript"
 *   theme="dark"
 *   lineHeight={20}
 *   visibleLines={30}
 * />
 * ```
 */
export const VirtualizedCodeRenderer: React.FC<VirtualizedCodeRendererProps> = ({
  code,
  language,
  theme = 'light',
  lineHeight = 21,
  visibleLines = 20,
  className,
  style,
  testID,
}) => {
  const colors = theme === 'dark' ? VCR_DARK : VCR_LIGHT;

  // Split code into lines once
  const lines = useMemo<string[]>(() => {
    if (!code) return [];
    if (code.endsWith('\n')) {
      return code.slice(0, -1).split('\n');
    }
    return code.split('\n');
  }, [code]);

  const totalHeight = lines.length * lineHeight;

  // Scroll state
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Which lines are visible
  const startIndex = Math.max(0, Math.floor(scrollTop / lineHeight) - 2); // 2 lines buffer above
  const endIndex = Math.min(
    lines.length,
    Math.ceil((scrollTop + visibleLines * lineHeight) / lineHeight) + 2 // 2 lines buffer below
  );
  const visibleSlice = lines.slice(startIndex, endIndex);

  // Gutter width
  const gutterWidth = lines.length > 0 ? String(lines.length).length : 1;

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Reset scroll when code changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [code]);

  // Container height based on visibleLines
  const containerHeight = Math.min(totalHeight, visibleLines * lineHeight);

  // Token color lookup
  const tokenColor = useCallback(
    (type: SimpleToken['type']): string | undefined => {
      switch (type) {
        case 'keyword': return colors.keyword;
        case 'string': return colors.string;
        case 'comment': return colors.comment;
        case 'number': return colors.number;
        default: return undefined;
      }
    },
    [colors]
  );

  // Render a single token span
  const renderToken = useCallback(
    (token: SimpleToken, key: string) => {
      const color = tokenColor(token.type);
      if (!color) {
        return <span key={key}>{token.text}</span>;
      }
      return (
        <span key={key} style={{ color }}>
          {token.text}
        </span>
      );
    },
    [tokenColor]
  );

  // Outer wrapper style
  const wrapperStyle: React.CSSProperties = {
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    fontSize: '13px',
    lineHeight: `${lineHeight}px`,
    color: colors.text,
    backgroundColor: colors.background,
    ...style,
  };

  // Header
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

  // Scroll viewport
  const viewportStyle: React.CSSProperties = {
    overflow: 'auto',
    height: containerHeight,
    position: 'relative' as const,
  };

  // Inner spacer that sets the total scrollable height
  const innerStyle: React.CSSProperties = {
    height: totalHeight,
    position: 'relative' as const,
  };

  // Line row
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: `${lineHeight}px`,
    lineHeight: `${lineHeight}px`,
  };

  // Gutter
  const gutterStyle: React.CSSProperties = {
    flexShrink: 0,
    textAlign: 'right',
    userSelect: 'none',
    padding: '0 12px',
    fontSize: '13px',
    lineHeight: `${lineHeight}px`,
    backgroundColor: colors.gutterBg,
    borderRight: `1px solid ${colors.gutterBorder}`,
    color: colors.gutterText,
    minWidth: `${gutterWidth + 2}ch`,
  };

  // Code content
  const codeStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: '0 16px',
    whiteSpace: 'pre' as const,
    fontSize: '13px',
    lineHeight: `${lineHeight}px`,
  };

  if (!code || lines.length === 0) {
    return null;
  }

  return (
    <div className={className} style={wrapperStyle} data-testid={testID ?? 'virtualized-code-renderer'}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 500 }}>Code</span>
          {language && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: colors.background,
                color: colors.gutterText,
                border: `1px solid ${colors.border}`,
              }}
            >
              {language}
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: colors.gutterText }}>
          {lines.length} lines
        </span>
      </div>

      {/* Scroll viewport */}
      <div
        ref={containerRef}
        style={viewportStyle}
        onScroll={handleScroll}
        role="region"
        aria-label="Code viewer"
      >
        {/* Spacer element — sets the correct total scroll height */}
        <div style={innerStyle}>
          {/* Only the visible lines are rendered */}
          {visibleSlice.map((line, i) => {
            const lineIdx = startIndex + i;
            const top = lineIdx * lineHeight;
            const tokens = tokenizeLine(line);

            return (
              <div
                key={`vline-${lineIdx}`}
                style={{ ...rowStyle, top }}
                data-line-number={lineIdx + 1}
              >
                {/* Line number */}
                <div style={gutterStyle} aria-hidden="true">
                  {String(lineIdx + 1).padStart(gutterWidth, '\u00A0')}
                </div>
                {/* Tokenized code */}
                <div style={codeStyle}>
                  {tokens.length === 1 && tokens[0].type === 'plain'
                    ? tokens[0].text || '\u00A0'
                    : tokens.map((token, ti) =>
                        renderToken(token, `tok-${lineIdx}-${ti}`)
                      )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

VirtualizedCodeRenderer.displayName = 'VirtualizedCodeRenderer';

export default VirtualizedCodeRenderer;
