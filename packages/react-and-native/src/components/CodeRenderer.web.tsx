import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { tokenize, resolveLanguageName } from '../utils/syntax-highlight.web';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CodeRendererProps {
  /** Source code string to render */
  code: string;
  /** Programming language identifier for syntax highlighting */
  language?: string;
  /** File name displayed in the header bar */
  fileName?: string;
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Starting line number (default: 1) */
  startLineNumber?: number;
  /** Tab size for indentation (default: 2) */
  tabSize?: number;
  /** Whether to enable word wrap (default: false) */
  wordWrap?: boolean;
  /** Whether to show a copy-to-clipboard button (default: true) */
  showCopyButton?: boolean;
  /** Whether the code block is initially collapsed (default: false) */
  collapsible?: boolean;
  /** Whether the code block starts collapsed (default: false) */
  defaultCollapsed?: boolean;
  /** Maximum height when collapsed in pixels (default: 200) */
  collapsedHeight?: number;
  /** Theme: 'light', 'dark', or custom CSS class prefix (default: 'light') */
  theme?: 'light' | 'dark' | 'github' | 'monokai' | 'dracula';
  /** Specific lines to highlight (1-indexed) */
  highlightLines?: number[];
  /** Custom CSS class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Maximum height with scroll (default: none) */
  maxHeight?: number | string;
  /** Custom CSS class prefix for generated class names (default: 'cr') */
  classPrefix?: string;
}

// ─── Theme Definitions ───────────────────────────────────────────────────────

interface ThemeColors {
  background: string;
  text: string;
  lineNumberColor: string;
  lineNumberBg: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  border: string;
  selectionBg: string;
  gutterBorder: string;
  highlightLineBg: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  operator: string;
  function: string;
  class: string;
  tag: string;
  attribute: string;
  property: string;
  punctuation: string;
  builtin: string;
  variable: string;
  type: string;
  regex: string;
  literal: string;
}

const THEMES: Record<string, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#24292e',
    lineNumberColor: '#959da5',
    lineNumberBg: '#f6f8fa',
    headerBg: '#f1f3f5',
    headerText: '#24292e',
    headerBorder: '#e1e4e8',
    border: '#e1e4e8',
    selectionBg: '#b3d4fc',
    gutterBorder: '#e1e4e8',
    highlightLineBg: '#fff9c4',
    keyword: '#d73a49',
    string: '#032f62',
    comment: '#6a737d',
    number: '#005cc5',
    operator: '#d73a49',
    function: '#6f42c1',
    class: '#6f42c1',
    tag: '#22863a',
    attribute: '#005cc5',
    property: '#005cc5',
    punctuation: '#24292e',
    builtin: '#005cc5',
    variable: '#e36209',
    type: '#005cc5',
    regex: '#032f62',
    literal: '#005cc5',
  },
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    lineNumberColor: '#858585',
    lineNumberBg: '#1e1e1e',
    headerBg: '#252526',
    headerText: '#cccccc',
    headerBorder: '#3e3e42',
    border: '#3e3e42',
    selectionBg: '#264f78',
    gutterBorder: '#3e3e42',
    highlightLineBg: '#2a2d2e',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    operator: '#d4d4d4',
    function: '#dcdcaa',
    class: '#4ec9b0',
    tag: '#569cd6',
    attribute: '#9cdcfe',
    property: '#9cdcfe',
    punctuation: '#d4d4d4',
    builtin: '#4ec9b0',
    variable: '#9cdcfe',
    type: '#4ec9b0',
    regex: '#d16969',
    literal: '#569cd6',
  },
  github: {
    background: '#f6f8fa',
    text: '#24292f',
    lineNumberColor: '#8b949e',
    lineNumberBg: '#f6f8fa',
    headerBg: '#f0f3f6',
    headerText: '#24292f',
    headerBorder: '#d0d7de',
    border: '#d0d7de',
    selectionBg: '#b6e3ff',
    gutterBorder: '#d0d7de',
    highlightLineBg: '#fff8c5',
    keyword: '#cf222e',
    string: '#0a3069',
    comment: '#6e7781',
    number: '#0550ae',
    operator: '#cf222e',
    function: '#8250df',
    class: '#8250df',
    tag: '#116329',
    attribute: '#0550ae',
    property: '#0550ae',
    punctuation: '#24292f',
    builtin: '#0550ae',
    variable: '#953800',
    type: '#0550ae',
    regex: '#0a3069',
    literal: '#0550ae',
  },
  monokai: {
    background: '#272822',
    text: '#f8f8f2',
    lineNumberColor: '#90908a',
    lineNumberBg: '#272822',
    headerBg: '#1e1f1c',
    headerText: '#f8f8f2',
    headerBorder: '#3e3d32',
    border: '#3e3d32',
    selectionBg: '#49483e',
    gutterBorder: '#3e3d32',
    highlightLineBg: '#3e3d32',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    operator: '#f92672',
    function: '#a6e22e',
    class: '#a6e22e',
    tag: '#f92672',
    attribute: '#a6e22e',
    property: '#66d9ef',
    punctuation: '#f8f8f2',
    builtin: '#66d9ef',
    variable: '#f8f8f2',
    type: '#66d9ef',
    regex: '#e6db74',
    literal: '#ae81ff',
  },
  dracula: {
    background: '#282a36',
    text: '#f8f8f2',
    lineNumberColor: '#6272a4',
    lineNumberBg: '#282a36',
    headerBg: '#21222c',
    headerText: '#f8f8f2',
    headerBorder: '#44475a',
    border: '#44475a',
    selectionBg: '#44475a',
    gutterBorder: '#44475a',
    highlightLineBg: '#44475a',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    number: '#bd93f9',
    operator: '#ff79c6',
    function: '#50fa7b',
    class: '#8be9fd',
    tag: '#ff79c6',
    attribute: '#50fa7b',
    property: '#66d9ef',
    punctuation: '#f8f8f2',
    builtin: '#8be9fd',
    variable: '#f8f8f2',
    type: '#8be9fd',
    regex: '#f1fa8c',
    literal: '#bd93f9',
  },
};

// ─── Copy to Clipboard Hook ──────────────────────────────────────────────────

function useClipboard(timeout = 2000): {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        setCopied(true);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setCopied(false);
        }, timeout);
      } catch {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[CodeRenderer] Failed to copy to clipboard');
        }
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, [timeout]);

  return { copied, copyToClipboard };
}

// ─── Tokenized Line ──────────────────────────────────────────────────────────

interface TokenizedLine {
  lineNumber: number;
  tokens: Array<{ type: string; value: string; className: string }>;
  isHighlighted: boolean;
}

/**
 * Tokenize code and split into lines with line numbers.
 */
function tokenizeToLines(
  code: string,
  language: string,
  startLine: number,
  highlightLines?: number[]
): TokenizedLine[] {
  const resolvedLang = resolveLanguageName(language || 'text');
  const tokens = tokenize(code, resolvedLang);
  const highlightSet = highlightLines ? new Set(highlightLines) : new Set<number>();

  // Rebuild the source with token annotations
  const lines = code.split('\n');
  const result: TokenizedLine[] = [];

  // Build a position-to-token map
  let pos = 0;
  const tokenMap: Array<{ start: number; end: number; type: string; className: string }> = [];
  for (const token of tokens) {
    tokenMap.push({
      start: pos,
      end: pos + token.value.length,
      type: token.type,
      className: token.className,
    });
    pos += token.value.length;
  }

  for (let i = 0; i < lines.length; i++) {
    const lineStart = i === 0 ? 0 : code.indexOf('\n', result.length > 0 ? (() => {
      // Calculate actual start position by summing previous line lengths + newlines
      let offset = 0;
      for (let j = 0; j < i; j++) {
        offset += lines[j].length + 1;
      }
      return offset;
    })() : 0);

    const lineTokens: TokenizedLine['tokens'] = [];
    const lineNum = startLine + i;

    for (const tm of tokenMap) {
      if (tm.end <= lineStart || tm.start >= lineStart + lines[i].length) {
        continue;
      }

      const overlapStart = Math.max(tm.start, lineStart);
      const overlapEnd = Math.min(tm.end, lineStart + lines[i].length);

      if (overlapStart < overlapEnd) {
        lineTokens.push({
          type: tm.type,
          value: lines[i].substring(overlapStart - lineStart, overlapEnd - lineStart),
          className: tm.className,
        });
      }
    }

    result.push({
      lineNumber: lineNum,
      tokens: lineTokens,
      isHighlighted: highlightSet.has(lineNum),
    });
  }

  return result;
}

// ─── Inline Styles for Token Types ───────────────────────────────────────────

function getTokenStyle(tokenType: string, theme: ThemeColors): React.CSSProperties | undefined {
  const color = theme[tokenType as keyof ThemeColors];
  if (color && typeof color === 'string') {
    return { color };
  }
  return undefined;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const CopyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon: React.FC<{ color: string; expanded: boolean }> = ({ color, expanded }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * CodeRenderer - Renders source code with syntax highlighting.
 *
 * Features:
 * - Regex-based syntax highlighting for 15+ languages
 * - Line numbers (configurable start number)
 * - Line highlighting
 * - Copy to clipboard button
 * - Collapsible code blocks
 * - File name header bar
 * - 5 built-in color themes (light, dark, github, monokai, dracula)
 * - Tab size and word wrap configuration
 * - Max height with scrolling
 *
 * @example
 * <CodeRenderer
 *   code="const x = 42;"
 *   language="javascript"
 *   fileName="app.ts"
 *   theme="dark"
 *   showLineNumbers
 *   highlightLines={[3, 5]}
 * />
 */
export const CodeRenderer: React.FC<CodeRendererProps> = ({
  code,
  language = 'text',
  fileName,
  showLineNumbers = true,
  startLineNumber = 1,
  tabSize = 2,
  wordWrap = false,
  showCopyButton = true,
  collapsible = false,
  defaultCollapsed = false,
  collapsedHeight = 200,
  theme = 'light',
  highlightLines,
  className,
  style,
  maxHeight,
  classPrefix = 'cr',
}) => {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const { copied, copyToClipboard } = useClipboard();
  const codeRef = useRef<HTMLPreElement>(null);

  const themeColors = THEMES[theme] || THEMES.light;

  const lines = useMemo(() => {
    if (!code || typeof code !== 'string') return [];

    const processedCode = code.replace(/\t/g, ' '.repeat(tabSize));
    return tokenizeToLines(processedCode, language, startLineNumber, highlightLines);
  }, [code, language, startLineNumber, tabSize, highlightLines]);

  const handleCopy = useCallback(() => {
    if (code) {
      copyToClipboard(code);
    }
  }, [code, copyToClipboard]);

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  if (!code || typeof code !== 'string') {
    return null;
  }

  const lineCount = lines.length;
  const gutterWidth = String(startLineNumber + lineCount - 1).length;

  const containerStyle: React.CSSProperties = {
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${themeColors.border}`,
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: themeColors.headerBg,
    borderBottom: `1px solid ${themeColors.headerBorder}`,
    color: themeColors.headerText,
  };

  const codeAreaStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: themeColors.background,
    color: themeColors.text,
    overflow: maxHeight || (!expanded && collapsible) ? 'auto' : 'visible',
    maxHeight: !expanded && collapsible
      ? `${collapsedHeight}px`
      : maxHeight
        ? typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
        : undefined,
    transition: collapsible ? 'max-height 0.3s ease' : undefined,
  };

  const gutterStyle: React.CSSProperties = {
    padding: '12px 0',
    backgroundColor: themeColors.lineNumberBg,
    borderRight: `1px solid ${themeColors.gutterBorder}`,
    color: themeColors.lineNumberColor,
    userSelect: 'none',
    textAlign: 'right' as const,
    flexShrink: 0,
  };

  const codeBlockStyle: React.CSSProperties = {
    padding: '12px 16px',
    flex: 1,
    minWidth: 0,
    overflowX: wordWrap ? 'hidden' : 'auto',
    whiteSpace: wordWrap ? 'pre-wrap' : 'pre' as const,
    wordBreak: wordWrap ? 'break-all' : 'normal' as const,
    tabSize: tabSize,
  };

  const copyButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: themeColors.headerText,
    transition: 'background-color 0.2s ease',
  };

  const collapseButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: themeColors.headerText,
    transition: 'background-color 0.2s ease',
  };

  return (
    <div className={className} style={containerStyle} data-testid="content-renderer-code">
      {/* Header */}
      {(fileName || showCopyButton || collapsible) && (
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {fileName && (
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{fileName}</span>
            )}
            {language && (
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: themeColors.background,
                color: themeColors.lineNumberColor,
                border: `1px solid ${themeColors.border}`,
              }}>
                {language}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {collapsible && lineCount > 5 && (
              <button
                onClick={toggleExpanded}
                style={collapseButtonStyle}
                title={expanded ? 'Collapse' : 'Expand'}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = themeColors.selectionBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <ChevronIcon color={themeColors.headerText} expanded={expanded} />
                <span>{expanded ? 'Collapse' : `+${lineCount} lines`}</span>
              </button>
            )}
            {showCopyButton && (
              <button
                onClick={handleCopy}
                style={copyButtonStyle}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = themeColors.selectionBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                {copied ? (
                  <>
                    <CheckIcon color="#28a745" />
                    <span style={{ color: '#28a745' }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon color={themeColors.headerText} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Code Area */}
      <div style={codeAreaStyle}>
        {/* Line Numbers Gutter */}
        {showLineNumbers && (
          <div style={gutterStyle} aria-hidden="true">
            {lines.map((line) => (
              <div
                key={`ln-${line.lineNumber}`}
                style={{
                  padding: '0 12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  backgroundColor: line.isHighlighted ? themeColors.highlightLineBg : undefined,
                }}
              >
                {String(line.lineNumber).padStart(gutterWidth, '\u00A0')}
              </div>
            ))}
          </div>
        )}

        {/* Code Content */}
        <pre ref={codeRef} style={codeBlockStyle}>
          <code>
            {lines.map((line, lineIdx) => (
              <div
                key={`line-${line.lineNumber}`}
                style={{
                  backgroundColor: line.isHighlighted ? themeColors.highlightLineBg : undefined,
                  borderLeft: line.isHighlighted ? `2px solid ${themeColors.number}` : '2px solid transparent',
                  paddingLeft: '8px',
                  marginLeft: '-8px',
                }}
              >
                {line.tokens.length === 0 ? (
                  '\n'
                ) : (
                  line.tokens.map((token, tokenIdx) => {
                    const key = `${lineIdx}-${tokenIdx}`;
                    const tokenStyle = getTokenStyle(token.type, themeColors);

                    if (token.type === 'plain' && !tokenStyle) {
                      return <span key={key}>{token.value}</span>;
                    }

                    return (
                      <span
                        key={key}
                        className={token.className ? `${classPrefix}-${token.className.replace('cr-', '')}` : undefined}
                        style={tokenStyle}
                      >
                        {token.value}
                      </span>
                    );
                  })
                )}
                {lineIdx < lines.length - 1 ? '\n' : null}
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Gradient Fade for Collapsed State */}
      {!expanded && collapsible && lineCount > 5 && (
        <div
          style={{
            height: '32px',
            background: `linear-gradient(transparent, ${themeColors.background})`,
            marginTop: '-32px',
            position: 'relative',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;
