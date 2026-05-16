import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CSSRendererProps {
  /** CSS string to render */
  content: string;
  /** Theme: 'light' or 'dark' (default: 'light') */
  theme?: 'light' | 'dark';
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Whether to show a copy button (default: true) */
  showCopyButton?: boolean;
  /** Whether to group media queries visually (default: true) */
  groupMediaQueries?: boolean;
  /** Custom CSS class for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Maximum height with scroll (default: 500px) */
  maxHeight?: number | string;
  /** Tab size for indentation (default: 2) */
  tabSize?: number;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Fallback ReactNode rendered on error */
  fallback?: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
  /** Whether to render with accessibility attributes (default: true) */
  accessible?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// ─── CSS Rule Types ──────────────────────────────────────────────────────────

interface CSSDeclaration {
  property: string;
  value: string;
  important: boolean;
  line: number;
}

interface CSSRule {
  selectors: string[];
  declarations: CSSDeclaration[];
  startLine: number;
  endLine: number;
}

interface CSSMediaQuery {
  condition: string;
  rules: CSSRule[];
  startLine: number;
  endLine: number;
}

interface CSSKeyframeRule {
  name: string;
  frames: Array<{
    selector: string;
    declarations: CSSDeclaration[];
    line: number;
  }>;
  startLine: number;
  endLine: number;
}

interface CSSComment {
  text: string;
  line: number;
  isBlock: boolean;
}

interface ParsedCSS {
  rules: CSSRule[];
  mediaQueries: CSSMediaQuery[];
  keyframes: CSSKeyframeRule[];
  comments: CSSComment[];
  variables: Array<{ name: string; value: string; line: number }>;
  imports: Array<{ value: string; line: number }>;
}

// ─── Theme Definitions ───────────────────────────────────────────────────────

interface ThemeColors {
  background: string;
  text: string;
  border: string;
  headerBg: string;
  headerText: string;
  selector: string;
  property: string;
  value: string;
  important: string;
  punctuation: string;
  comment: string;
  atKeyword: string;
  string: string;
  number: string;
  function: string;
  variable: string;
  lineNumberColor: string;
  lineNumberBg: string;
  hoverBg: string;
  copySuccess: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  mediaQueryBadge: string;
  mediaQueryBadgeBg: string;
  keyframesBadge: string;
  keyframesBadgeBg: string;
  ruleHoverBg: string;
}

const THEMES: Record<string, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#24292e',
    border: '#e1e4e8',
    headerBg: '#f6f8fa',
    headerText: '#24292e',
    selector: '#0550ae',
    property: '#6639ba',
    value: '#0550ae',
    important: '#cf222e',
    punctuation: '#24292e',
    comment: '#6a737d',
    atKeyword: '#cf222e',
    string: '#0a3069',
    number: '#0550ae',
    function: '#8250df',
    variable: '#953800',
    lineNumberColor: '#959da5',
    lineNumberBg: '#f6f8fa',
    hoverBg: '#f6f8fa',
    copySuccess: '#1a7f37',
    buttonBg: '#f3f4f6',
    buttonText: '#24292e',
    buttonBorder: '#d0d7de',
    mediaQueryBadge: '#0550ae',
    mediaQueryBadgeBg: '#ddf4ff',
    keyframesBadge: '#8250df',
    keyframesBadgeBg: '#fbefff',
    ruleHoverBg: '#f6f8fa',
  },
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    border: '#3e3e42',
    headerBg: '#252526',
    headerText: '#cccccc',
    selector: '#4ec9b0',
    property: '#c586c0',
    value: '#9cdcfe',
    important: '#f44747',
    punctuation: '#d4d4d4',
    comment: '#6a9955',
    atKeyword: '#f92672',
    string: '#ce9178',
    number: '#b5cea8',
    function: '#dcdcaa',
    variable: '#e36209',
    lineNumberColor: '#858585',
    lineNumberBg: '#1e1e1e',
    hoverBg: '#2a2d2e',
    copySuccess: '#4ec9b0',
    buttonBg: '#3e3e42',
    buttonText: '#cccccc',
    buttonBorder: '#555555',
    mediaQueryBadge: '#4fc1ff',
    mediaQueryBadgeBg: '#264f78',
    keyframesBadge: '#c586c0',
    keyframesBadgeBg: '#2d2b3d',
    ruleHoverBg: '#2a2d2e',
  },
};

// ─── Simple CSS Parser ───────────────────────────────────────────────────────

/**
 * Parse CSS string into structured rules, media queries, keyframes, and comments.
 */
function parseCSS(css: string): ParsedCSS {
  const rules: CSSRule[] = [];
  const mediaQueries: CSSMediaQuery[] = [];
  const keyframes: CSSKeyframeRule[] = [];
  const comments: CSSComment[] = [];
  const variables: Array<{ name: string; value: string; line: number }> = [];
  const imports: Array<{ value: string; line: number }> = [];

  if (!css || typeof css !== 'string') {
    return { rules, mediaQueries, keyframes, comments, variables, imports };
  }

  // Remove comments first, tracking their positions
  let cleanedCSS = css;
  const commentRegex = /\/\*([\s\S]*?)\*\//g;
  let commentMatch: RegExpExecArray | null;
  let lineOffset = 0;

  while ((commentMatch = commentRegex.exec(css)) !== null) {
    const startLine = css.substring(0, commentMatch.index).split('\n').length;
    comments.push({
      text: commentMatch[1],
      line: startLine,
      isBlock: true,
    });
  }

  // Remove block comments for parsing
  cleanedCSS = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove inline comments (// style, non-standard but common)
  cleanedCSS = cleanedCSS.replace(/\/\/.*$/gm, '');

  const lines = cleanedCSS.split('\n');
  let i = 0;

  function getLine(): number { return i + 1; }

  function skipWhitespace(): void {
    while (i < lines.length && lines[i].trim() === '') i++;
  }

  function parseDeclarations(declarationLines: string[]): CSSDeclaration[] {
    const decls: CSSDeclaration[] = [];
    const fullText = declarationLines.join('\n');

    // Split by semicolons, respecting parentheses
    const parts: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of fullText) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ';' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());

    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) continue;

      const property = part.substring(0, colonIdx).trim();
      const value = part.substring(colonIdx + 1).trim();
      const important = /!important/i.test(value);
      const cleanValue = value.replace(/\s*!important\s*$/i, '').trim();

      if (property && cleanValue) {
        decls.push({
          property,
          value: cleanValue,
          important,
          line: getLine(),
        });
      }
    }

    return decls;
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (line === '') {
      i++;
      continue;
    }

    // @import
    if (line.startsWith('@import')) {
      imports.push({ value: line, line: getLine() });
      i++;
      continue;
    }

    // @media
    if (line.startsWith('@media')) {
      const startLine = getLine();
      let condition = line.replace(/^@media\s*/, '').replace(/\s*\{$/, '').trim();
      i++;

      const mediaRules: CSSRule[] = [];
      let braceCount = 1;

      while (i < lines.length && braceCount > 0) {
        const mediaLine = lines[i].trim();
        if (mediaLine === '') { i++; continue; }

        braceCount += (mediaLine.match(/\{/g) || []).length;
        braceCount -= (mediaLine.match(/\}/g) || []).length;

        if (braceCount <= 0) { i++; break; }

        // Collect selector lines
        const selectorLines: string[] = [];
        let foundOpen = false;

        while (i < lines.length) {
          const sl = lines[i].trim();
          if (sl === '') { i++; continue; }

          selectorLines.push(sl);
          if (sl.includes('{')) { foundOpen = true; i++; break; }
          i++;
        }

        if (!foundOpen) continue;

        // Collect declaration lines
        const declLines: string[] = [];
        let innerBraces = 0;

        while (i < lines.length) {
          const dl = lines[i].trim();
          if (dl === '') { declLines.push(''); i++; continue; }

          innerBraces += (dl.match(/\{/g) || []).length;
          innerBraces -= (dl.match(/\}/g) || []).length;

          if (innerBraces < 0) { i++; break; }

          declLines.push(dl);
          i++;
        }

        // Parse the rule
        const selectorText = selectorLines.join(' ').replace(/\s*\{$/, '').trim();
        const declarations = parseDeclarations(declLines.filter(d => !d.includes('{')));

        if (selectorText && declarations.length > 0) {
          mediaRules.push({
            selectors: selectorText.split(',').map(s => s.trim()),
            declarations,
            startLine: startLine,
            endLine: getLine(),
          });
        }
      }

      mediaQueries.push({
        condition,
        rules: mediaRules,
        startLine,
        endLine: getLine(),
      });
      continue;
    }

    // @keyframes
    if (line.startsWith('@keyframes')) {
      const startLine = getLine();
      const nameMatch = line.match(/@keyframes\s+([\w-]+)/);
      const name = nameMatch ? nameMatch[1] : 'unknown';
      i++;

      const frames: Array<{ selector: string; declarations: CSSDeclaration[]; line: number }> = [];
      let braceCount = 1;

      while (i < lines.length && braceCount > 0) {
        const frameLine = lines[i].trim();
        if (frameLine === '') { i++; continue; }

        braceCount += (frameLine.match(/\{/g) || []).length;
        braceCount -= (frameLine.match(/\}/g) || []).length;

        if (braceCount <= 0) { i++; break; }

        // Collect frame selector
        const frameLines: string[] = [];
        let foundOpen = false;

        while (i < lines.length) {
          const fl = lines[i].trim();
          if (fl === '') { i++; continue; }

          frameLines.push(fl);
          if (fl.includes('{')) { foundOpen = true; i++; break; }
          i++;
        }

        if (!foundOpen) continue;

        const selector = frameLines.join(' ').replace(/\s*\{$/, '').trim();
        const declLines2: string[] = [];
        let ib = 0;

        while (i < lines.length) {
          const dl = lines[i].trim();
          if (dl === '') { declLines2.push(''); i++; continue; }
          ib += (dl.match(/\{/g) || []).length;
          ib -= (dl.match(/\}/g) || []).length;
          if (ib < 0) { i++; break; }
          declLines2.push(dl);
          i++;
        }

        const declarations = parseDeclarations(declLines2.filter(d => !d.includes('{')));
        if (selector && declarations.length > 0) {
          frames.push({ selector, declarations, line: getLine() });
        }
      }

      keyframes.push({ name, frames, startLine, endLine: getLine() });
      continue;
    }

    // :root variables
    if (line.startsWith(':root') || line.startsWith(':root {')) {
      i++;
      const declLines: string[] = [];
      while (i < lines.length) {
        const dl = lines[i].trim();
        if (dl === '}') { i++; break; }
        if (dl === '') { i++; continue; }

        const varMatch = dl.match(/^(--[\w-]+)\s*:\s*(.+?)(?:;|$)/);
        if (varMatch) {
          variables.push({
            name: varMatch[1],
            value: varMatch[2].trim(),
            line: getLine(),
          });
        }
        declLines.push(dl);
        i++;
      }

      // Also add as a regular rule
      const decls = parseDeclarations(declLines);
      if (decls.length > 0) {
        rules.push({
          selectors: [':root'],
          declarations: decls,
          startLine: i - declLines.length,
          endLine: getLine(),
        });
      }
      continue;
    }

    // Regular rule
    if (line.includes('{')) {
      const startLine = getLine();
      const selectorLines: string[] = [line];
      let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      i++;

      while (i < lines.length && braceCount > 0) {
        const ruleLine = lines[i].trim();
        if (ruleLine === '') { i++; continue; }
        braceCount += (ruleLine.match(/\{/g) || []).length;
        braceCount -= (ruleLine.match(/\}/g) || []).length;
        selectorLines.push(lines[i]);
        i++;
      }

      const fullRule = selectorLines.join('\n');
      const openBraceIdx = fullRule.indexOf('{');
      const selectorText = fullRule.substring(0, openBraceIdx).trim();
      const declarationText = fullRule.substring(openBraceIdx + 1, fullRule.lastIndexOf('}')).trim();

      if (selectorText && declarationText) {
        const declarations = parseDeclarations(declarationText.split('\n'));
        if (declarations.length > 0) {
          rules.push({
            selectors: selectorText.split(',').map(s => s.trim()),
            declarations,
            startLine,
            endLine: getLine(),
          });
        }
      }
      continue;
    }

    // Skip lines that don't match any pattern
    i++;
  }

  return { rules, mediaQueries, keyframes, comments, variables, imports };
}

// ─── Clipboard Hook ──────────────────────────────────────────────────────────

function useClipboard(timeout = 2000): { copied: boolean; copyToClipboard: (text: string) => Promise<void> } {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* noop */ }
      finally { document.body.removeChild(textarea); }
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), timeout);
  }, [timeout]);

  return { copied, copyToClipboard };
}

// ─── Highlighted Declaration Component ───────────────────────────────────────

interface HighlightedDeclarationProps {
  decl: CSSDeclaration;
  theme: ThemeColors;
}

const HighlightedDeclaration: React.FC<HighlightedDeclarationProps> = React.memo(({ decl, theme }) => {
  // Highlight the value further: detect functions, numbers, colors, strings
  const highlightedValue = useMemo(() => {
    let value = decl.value;
    const parts: Array<{ text: string; color: string }> = [];

    // Simple tokenization of CSS values
    const tokens = value.split(/(\s*(?:,|\s)\s*)/);

    for (const token of tokens) {
      const trimmed = token.trim();
      if (!trimmed) {
        parts.push({ text: token, color: theme.punctuation });
        continue;
      }

      // CSS function: calc(), rgba(), var(), etc.
      if (/^[\w-]+\(/.test(trimmed) && trimmed.endsWith(')')) {
        parts.push({ text: token, color: theme.function });
        continue;
      }

      // CSS custom property: var(--name)
      if (/^var\(/.test(trimmed)) {
        parts.push({ text: token, color: theme.variable });
        continue;
      }

      // Color hex: #fff, #ffffff, etc.
      if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
        parts.push({ text: token, color: theme.number });
        continue;
      }

      // Number with unit: 10px, 2rem, 100%, etc.
      if (/^\d+\.?\d*(px|em|rem|vh|vw|vmin|vmax|%|deg|rad|grad|turn|s|ms|fr|ch|ex|pt|pc|in|cm|mm|dpi|dpcm|dppx|vw|vh)$/i.test(trimmed)) {
        parts.push({ text: token, color: theme.number });
        continue;
      }

      // Plain number
      if (/^\d+\.?\d*$/.test(trimmed)) {
        parts.push({ text: token, color: theme.number });
        continue;
      }

      // Quoted string
      if (/^(['"]).*\1$/.test(trimmed)) {
        parts.push({ text: token, color: theme.string });
        continue;
      }

      // CSS custom property reference --name
      if (/^--/.test(trimmed)) {
        parts.push({ text: token, color: theme.variable });
        continue;
      }

      // Default
      parts.push({ text: token, color: theme.value });
    }

    return parts;
  }, [decl.value, theme]);

  return (
    <div style={{ display: 'flex', paddingLeft: 20, lineHeight: '1.6' }}>
      <span style={{ color: theme.property, whiteSpace: 'nowrap' }}>
        {decl.property}
      </span>
      <span style={{ color: theme.punctuation, margin: '0 6px' }}>:</span>
      <span>
        {highlightedValue.map((part, idx) => (
          <span key={idx} style={{ color: part.color }}>{part.text}</span>
        ))}
      </span>
      {decl.important && (
        <span style={{ color: theme.important, marginLeft: 4, fontWeight: 600 }}>!important</span>
      )}
      <span style={{ color: theme.punctuation }}></span>
    </div>
  );
});

HighlightedDeclaration.displayName = 'HighlightedDeclaration';

// ─── Highlighted Rule Component ──────────────────────────────────────────────

interface HighlightedRuleProps {
  rule: CSSRule;
  theme: ThemeColors;
}

const HighlightedRule: React.FC<HighlightedRuleProps> = React.memo(({ rule, theme }) => {
  return (
    <div
      style={{
        padding: '4px 0',
        borderLeft: `2px solid transparent`,
        paddingLeft: 4,
        borderRadius: 2,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = theme.ruleHoverBg;
        (e.currentTarget as HTMLElement).style.borderLeftColor = theme.selector;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
      }}
    >
      {/* Selectors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 4px', marginBottom: 2 }}>
        {rule.selectors.map((selector, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span style={{ color: theme.punctuation }}>,</span>}
            <span style={{ color: theme.selector }}>{selector}</span>
          </React.Fragment>
        ))}
        <span style={{ color: theme.punctuation }}>{' {'}</span>
      </div>

      {/* Declarations */}
      {rule.declarations.map((decl, idx) => (
        <HighlightedDeclaration key={idx} decl={decl} theme={theme} />
      ))}

      {/* Closing brace */}
      <div style={{ color: theme.punctuation }}>{'}'}</div>
    </div>
  );
});

HighlightedRule.displayName = 'HighlightedRule';

// ─── Stats Summary ───────────────────────────────────────────────────────────

interface StatsSummary {
  rules: number;
  mediaQueries: number;
  keyframes: number;
  variables: number;
  imports: number;
  comments: number;
  declarations: number;
}

function computeStats(parsed: ParsedCSS): StatsSummary {
  return {
    rules: parsed.rules.length,
    mediaQueries: parsed.mediaQueries.length,
    keyframes: parsed.keyframes.length,
    variables: parsed.variables.length,
    imports: parsed.imports.length,
    comments: parsed.comments.length,
    declarations: parsed.rules.reduce((sum, r) => sum + r.declarations.length, 0) +
      parsed.mediaQueries.reduce((sum, m) => sum + m.rules.reduce((s, r) => s + r.declarations.length, 0), 0),
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * CSSRenderer - Renders CSS content with syntax highlighting and structure.
 *
 * Features:
 * - Simple, zero-dependency CSS parser
 * - Syntax highlighting for:
 *   - Selectors (blue/green)
 *   - Properties (purple/pink)
 *   - Values (blue/light-blue)
 *   - @-keywords (red/pink)
 *   - Comments (gray, italic)
 *   - Strings, numbers, colors, functions, variables
 *   - !important (red, bold)
 * - Media query grouping with badge
 * - @keyframes grouping with badge
 * - CSS custom property detection (:root --var)
 * - @import detection
 * - Statistics summary (rules, declarations, media queries, etc.)
 * - Line numbers
 * - Copy to clipboard
 * - Light and dark themes
 * - Rule hover highlighting
 * - Accessible rendering
 *
 * @example
 * <CSSRenderer
 *   content=".container { display: flex; }"
 *   theme="dark"
 *   showLineNumbers
 *   groupMediaQueries
 * />
 */
export const CSSRenderer: React.FC<CSSRendererProps> = ({
  content,
  theme = 'light',
  showLineNumbers = true,
  showCopyButton = true,
  groupMediaQueries = true,
  className,
  style,
  maxHeight = '500px',
  tabSize = 2,
  onError,
  fallback,
  testID,
  accessible,
  accessibilityLabel,
}) => {
  const [showStats, setShowStats] = useState(false);
  const { copied, copyToClipboard } = useClipboard();

  const themeColors = THEMES[theme] || THEMES.light;

  // Parse CSS content
  const parsedCSS = useMemo((): ParsedCSS => {
    if (!content || typeof content !== 'string') {
      return { rules: [], mediaQueries: [], keyframes: [], comments: [], variables: [], imports: [] };
    }

    try {
      return parseCSS(content);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      return { rules: [], mediaQueries: [], keyframes: [], comments: [], variables: [], imports: [] };
    }
  }, [content, onError]);

  const stats = useMemo(() => computeStats(parsedCSS), [parsedCSS]);

  const handleCopy = useCallback(() => {
    if (content) copyToClipboard(content);
  }, [content, copyToClipboard]);

  const handleToggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Empty content
  if (!content) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    border: `1px solid ${themeColors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: themeColors.background,
    color: themeColors.text,
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    fontSize: 13,
    lineHeight: 1.6,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: themeColors.headerBg,
    borderBottom: `1px solid ${themeColors.border}`,
    color: themeColors.headerText,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '3px 8px',
    fontSize: 12,
    cursor: 'pointer',
    border: `1px solid ${themeColors.buttonBorder}`,
    borderRadius: 4,
    backgroundColor: themeColors.buttonBg,
    color: themeColors.buttonText,
    marginLeft: 4,
    transition: 'background-color 0.15s ease',
  };

  const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
    fontSize: 10,
    padding: '1px 6px',
    borderRadius: 3,
    backgroundColor: bg,
    color,
    fontWeight: 600,
    display: 'inline-block',
    marginBottom: 4,
  });

  return (
    <div className={className} style={containerStyle} data-testid={testID || 'content-renderer-css'}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>CSS</span>
          <span style={{
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 3,
            backgroundColor: theme === 'dark' ? '#264f78' : '#ddf4ff',
            color: theme === 'dark' ? '#4fc1ff' : '#0550ae',
          }}>
            {stats.rules} {stats.rules === 1 ? 'rule' : 'rules'}
          </span>
          <span style={{
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 3,
            backgroundColor: theme === 'dark' ? '#264f78' : '#ddf4ff',
            color: theme === 'dark' ? '#4fc1ff' : '#0550ae',
          }}>
            {stats.declarations} {stats.declarations === 1 ? 'declaration' : 'declarations'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={handleToggleStats} style={buttonStyle} title="Toggle statistics">
            {showStats ? 'Hide Stats' : 'Stats'}
          </button>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              style={{
                ...buttonStyle,
                color: copied ? themeColors.copySuccess : themeColors.buttonText,
              }}
              title={copied ? 'Copied!' : 'Copy CSS'}
            >
              {copied ? '\u2713 Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${themeColors.border}`,
          backgroundColor: theme === 'dark' ? '#2a2d2e' : '#f6f8fa',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 8,
          fontSize: 12,
        }}>
          {[
            { label: 'Rules', value: stats.rules },
            { label: 'Declarations', value: stats.declarations },
            { label: 'Media Queries', value: stats.mediaQueries },
            { label: 'Keyframes', value: stats.keyframes },
            { label: 'Variables', value: stats.variables },
            { label: 'Imports', value: stats.imports },
            { label: 'Comments', value: stats.comments },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: themeColors.comment, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
              <span style={{ fontWeight: 600, fontSize: 16, color: themeColors.text }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          padding: '12px 16px',
          overflow: 'auto',
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
        role={accessible !== false ? 'region' : undefined}
        aria-label={accessibilityLabel || 'CSS stylesheet'}
      >
        {/* @imports */}
        {parsedCSS.imports.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {parsedCSS.imports.map((imp, idx) => (
              <div key={idx} style={{ color: themeColors.atKeyword, marginBottom: 2 }}>
                <span style={{ fontWeight: 600 }}>{'@import'}</span>
                <span> {imp.value.replace('@import', '').trim()}</span>
              </div>
            ))}
          </div>
        )}

        {/* CSS Variables */}
        {parsedCSS.variables.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={badgeStyle(themeColors.variable, theme === 'dark' ? '#3d2800' : '#fff3cd')}>
              CSS Variables ({parsedCSS.variables.length})
            </div>
            {parsedCSS.variables.map((v, idx) => (
              <div key={idx} style={{ paddingLeft: 16, lineHeight: '1.6' }}>
                <span style={{ color: themeColors.variable }}>{v.name}</span>
                <span style={{ color: themeColors.punctuation }}>{': '}</span>
                <span style={{ color: themeColors.value }}>{v.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        {parsedCSS.comments.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {parsedCSS.comments.map((comment, idx) => (
              <div key={idx} style={{
                color: themeColors.comment,
                fontStyle: 'italic',
                fontSize: 12,
                marginBottom: 4,
                paddingLeft: 4,
                borderLeft: `2px solid ${themeColors.comment}33`,
              }}>
                {comment.text.split('\n').map((line, lineIdx) => (
                  <div key={lineIdx}>{line.trim() || '\u00A0'}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Regular Rules */}
        {parsedCSS.rules.map((rule, idx) => (
          <HighlightedRule key={`rule-${idx}`} rule={rule} theme={themeColors} />
        ))}

        {/* Media Queries */}
        {groupMediaQueries && parsedCSS.mediaQueries.map((mq, idx) => (
          <div key={`media-${idx}`} style={{ marginTop: 8 }}>
            <div style={badgeStyle(themeColors.mediaQueryBadge, themeColors.mediaQueryBadgeBg)}>
              {'@media'} {mq.condition}
            </div>
            <div style={{ paddingLeft: 8, borderLeft: `2px solid ${themeColors.mediaQueryBadge}33`, marginLeft: 4 }}>
              {mq.rules.map((rule, rIdx) => (
                <HighlightedRule key={`media-rule-${rIdx}`} rule={rule} theme={themeColors} />
              ))}
            </div>
          </div>
        ))}

        {/* Keyframes */}
        {parsedCSS.keyframes.map((kf, idx) => (
          <div key={`kf-${idx}`} style={{ marginTop: 8 }}>
            <div style={badgeStyle(themeColors.keyframesBadge, themeColors.keyframesBadgeBg)}>
              {'@keyframes'} {kf.name}
            </div>
            <div style={{ paddingLeft: 8, borderLeft: `2px solid ${themeColors.keyframesBadge}33`, marginLeft: 4 }}>
              {kf.frames.map((frame, fIdx) => (
                <div key={fIdx} style={{ padding: '2px 0' }}>
                  <div>
                    <span style={{ color: themeColors.selector }}>{frame.selector}</span>
                    <span style={{ color: themeColors.punctuation }}> {'{'}</span>
                  </div>
                  {frame.declarations.map((decl, dIdx) => (
                    <HighlightedDeclaration key={dIdx} decl={decl} theme={themeColors} />
                  ))}
                  <div style={{ color: themeColors.punctuation }}>{'}'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

CSSRenderer.displayName = 'CSSRenderer';

export default CSSRenderer;
