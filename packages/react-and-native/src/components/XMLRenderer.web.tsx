import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface XMLRendererProps {
  /** XML string to render */
  content: string;
  /** Theme: 'light' or 'dark' (default: 'light') */
  theme?: 'light' | 'dark';
  /** Whether to show line numbers in the raw view (default: false) */
  showLineNumbers?: boolean;
  /** Default collapse depth. Nodes deeper than this start collapsed. (default: Infinity) */
  defaultCollapseDepth?: number;
  /** Whether to show a copy button (default: true) */
  showCopyButton?: boolean;
  /** Custom CSS class for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Maximum height with scroll (default: 500px) */
  maxHeight?: number | string;
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

// ─── Theme Definitions ───────────────────────────────────────────────────────

interface ThemeColors {
  background: string;
  text: string;
  border: string;
  headerBg: string;
  headerText: string;
  tagName: string;
  attributeName: string;
  attributeValue: string;
  textContent: string;
  comment: string;
  cdata: string;
  processingInstruction: string;
  declaration: string;
  bracket: string;
  equals: string;
  colon: string;
  hoverBg: string;
  selectionBg: string;
  lineNumberColor: string;
  lineNumberBg: string;
  collapseIcon: string;
  expandIcon: string;
  copySuccess: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
}

const THEMES: Record<string, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#24292e',
    border: '#e1e4e8',
    headerBg: '#f6f8fa',
    headerText: '#24292e',
    tagName: '#22863a',
    attributeName: '#6f42c1',
    attributeValue: '#032f62',
    textContent: '#24292e',
    comment: '#6a737d',
    cdata: '#6a737d',
    processingInstruction: '#005cc5',
    declaration: '#cf222e',
    bracket: '#24292e',
    equals: '#d73a49',
    colon: '#d73a49',
    hoverBg: '#f6f8fa',
    selectionBg: '#b3d4fc',
    lineNumberColor: '#959da5',
    lineNumberBg: '#f6f8fa',
    collapseIcon: '#6e7781',
    expandIcon: '#6e7781',
    copySuccess: '#1a7f37',
    buttonBg: '#f3f4f6',
    buttonText: '#24292e',
    buttonBorder: '#d0d7de',
  },
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    border: '#3e3e42',
    headerBg: '#252526',
    headerText: '#cccccc',
    tagName: '#4ec9b0',
    attributeName: '#9cdcfe',
    attributeValue: '#ce9178',
    textContent: '#d4d4d4',
    comment: '#6a9955',
    cdata: '#6a9955',
    processingInstruction: '#569cd6',
    declaration: '#f92672',
    bracket: '#d4d4d4',
    equals: '#d4d4d4',
    colon: '#d4d4d4',
    hoverBg: '#2a2d2e',
    selectionBg: '#264f78',
    lineNumberColor: '#858585',
    lineNumberBg: '#1e1e1e',
    collapseIcon: '#808080',
    expandIcon: '#808080',
    copySuccess: '#4ec9b0',
    buttonBg: '#3e3e42',
    buttonText: '#cccccc',
    buttonBorder: '#555555',
  },
};

// ─── XML Node Types ──────────────────────────────────────────────────────────

interface XMLAttribute {
  name: string;
  value: string;
  prefix?: string;
}

interface XMLParsedNode {
  type: 'element' | 'text' | 'comment' | 'cdata' | 'processing-instruction' | 'declaration';
  name?: string;
  prefix?: string;
  attributes?: XMLAttribute[];
  content?: string;
  children?: XMLParsedNode[];
  target?: string;
}

// ─── Simple XML Parser ──────────────────────────────────────────────────────

/**
 * Parse an XML string into a tree of XMLParsedNode objects.
 */
function parseXML(xml: string): XMLParsedNode[] {
  if (!xml || typeof xml !== 'string') return [];

  const nodes: XMLParsedNode[] = [];
  let pos = 0;
  const len = xml.length;

  function parseWhitespace(): string {
    let ws = '';
    while (pos < len && /\s/.test(xml[pos])) {
      ws += xml[pos];
      pos++;
    }
    return ws;
  }

  function parseName(): string {
    let name = '';
    while (pos < len && /[\w:.-]/.test(xml[pos])) {
      name += xml[pos];
      pos++;
    }
    return name;
  }

  function parseString(quote: string): string {
    let value = '';
    pos++; // skip opening quote
    while (pos < len && xml[pos] !== quote) {
      if (xml[pos] === '&') {
        // Entity reference
        const entityEnd = xml.indexOf(';', pos);
        if (entityEnd !== -1 && entityEnd - pos < 10) {
          const entity = xml.substring(pos, entityEnd + 1);
          value += decodeEntity(entity);
          pos = entityEnd + 1;
        } else {
          value += xml[pos];
          pos++;
        }
      } else if (xml[pos] === '\\' && pos + 1 < len) {
        value += xml[pos + 1];
        pos += 2;
      } else {
        value += xml[pos];
        pos++;
      }
    }
    pos++; // skip closing quote
    return value;
  }

  function parseAttributes(): XMLAttribute[] {
    const attrs: XMLAttribute[] = [];
    while (pos < len) {
      parseWhitespace();
      if (pos >= len || xml[pos] === '>' || xml[pos] === '/' || xml[pos] === '?') {
        break;
      }
      const name = parseName();
      if (!name) break;

      parseWhitespace();
      let value = '';
      if (pos < len && xml[pos] === '=') {
        pos++; // skip =
        parseWhitespace();
        if (pos < len && (xml[pos] === '"' || xml[pos] === "'")) {
          value = parseString(xml[pos]);
        }
      }

      const colonIdx = name.indexOf(':');
      attrs.push({
        name: colonIdx !== -1 ? name.substring(colonIdx + 1) : name,
        value,
        prefix: colonIdx !== -1 ? name.substring(0, colonIdx) : undefined,
      });
    }
    return attrs;
  }

  function parseNodes(): XMLParsedNode[] {
    const result: XMLParsedNode[] = [];
    while (pos < len) {
      if (xml[pos] === '<') {
        // Comment
        if (xml.substring(pos, pos + 4) === '<!--') {
          const end = xml.indexOf('-->', pos + 4);
          if (end !== -1) {
            result.push({
              type: 'comment',
              content: xml.substring(pos + 4, end),
            });
            pos = end + 3;
            continue;
          }
        }

        // CDATA
        if (xml.substring(pos, pos + 9) === '<![CDATA[') {
          const end = xml.indexOf(']]>', pos + 9);
          if (end !== -1) {
            result.push({
              type: 'cdata',
              content: xml.substring(pos + 9, end),
            });
            pos = end + 3;
            continue;
          }
        }

        // Processing instruction
        if (xml[pos + 1] === '?' && xml.substring(pos, pos + 5) !== '<?xml') {
          const end = xml.indexOf('?>', pos + 2);
          if (end !== -1) {
            const content = xml.substring(pos + 2, end).trim();
            const spaceIdx = content.indexOf(' ');
            result.push({
              type: 'processing-instruction',
              target: spaceIdx !== -1 ? content.substring(0, spaceIdx) : content,
              content: spaceIdx !== -1 ? content.substring(spaceIdx + 1).trim() : '',
            });
            pos = end + 2;
            continue;
          }
        }

        // XML Declaration
        if (xml.substring(pos, pos + 5) === '<?xml') {
          const end = xml.indexOf('?>', pos + 5);
          if (end !== -1) {
            result.push({
              type: 'declaration',
              content: xml.substring(pos + 2, end),
              attributes: parseDeclarationAttrs(xml.substring(pos + 5, end)),
            });
            pos = end + 2;
            continue;
          }
        }

        // Closing tag
        if (xml[pos + 1] === '/') {
          break; // Let the parent handle it
        }

        // Opening tag
        const tagStart = pos + 1;
        const tagName = parseName();
        if (!tagName) {
          result.push({ type: 'text', content: '<' });
          pos++;
          continue;
        }

        const attrs = parseAttributes();
        parseWhitespace();

        const isSelfClosing = xml[pos] === '/';
        if (isSelfClosing) pos++; // skip /
        if (pos < len && xml[pos] === '>') pos++; // skip >

        if (isSelfClosing) {
          const colonIdx = tagName.indexOf(':');
          result.push({
            type: 'element',
            name: colonIdx !== -1 ? tagName.substring(colonIdx + 1) : tagName,
            prefix: colonIdx !== -1 ? tagName.substring(0, colonIdx) : undefined,
            attributes: attrs,
            children: [],
          });
        } else {
          // Parse children
          const children = parseNodes();

          // Expect closing tag
          parseWhitespace();
          if (pos < len && xml[pos] === '<' && xml[pos + 1] === '/') {
            pos += 2;
            parseName(); // skip tag name
            parseWhitespace();
            if (pos < len && xml[pos] === '>') pos++;
          }

          const colonIdx = tagName.indexOf(':');
          result.push({
            type: 'element',
            name: colonIdx !== -1 ? tagName.substring(colonIdx + 1) : tagName,
            prefix: colonIdx !== -1 ? tagName.substring(0, colonIdx) : undefined,
            attributes: attrs,
            children,
          });
        }
      } else {
        // Text content
        let text = '';
        const textStart = pos;
        while (pos < len && xml[pos] !== '<') {
          if (xml[pos] === '&') {
            const entityEnd = xml.indexOf(';', pos);
            if (entityEnd !== -1 && entityEnd - pos < 10) {
              text += decodeEntity(xml.substring(pos, entityEnd + 1));
              pos = entityEnd + 1;
            } else {
              text += xml[pos];
              pos++;
            }
          } else {
            text += xml[pos];
            pos++;
          }
        }
        if (text.trim()) {
          result.push({ type: 'text', content: text });
        }
      }
    }
    return result;
  }

  function parseDeclarationAttrs(content: string): XMLAttribute[] {
    const attrs: XMLAttribute[] = [];
    const regex = /(\w[\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      attrs.push({
        name: match[1],
        value: match[2] ?? match[3] ?? '',
      });
    }
    return attrs;
  }

  function decodeEntity(entity: string): string {
    const entities: Record<string, string> = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': '\u00A0',
    };
    return entities[entity] || entity;
  }

  return parseNodes();
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

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const ChevronRight: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDown: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Tree Node Component ─────────────────────────────────────────────────────

interface TreeNodeProps {
  node: XMLParsedNode;
  depth: number;
  defaultCollapsed: boolean;
  theme: ThemeColors;
  indent: number;
  keyPrefix: string;
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(({
  node,
  depth,
  defaultCollapsed,
  theme,
  indent,
  keyPrefix,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const nodeKey = `${keyPrefix}-${depth}`;

  // Text node
  if (node.type === 'text') {
    const displayText = (node.content || '').trim();
    if (!displayText) return null;
    return (
      <span style={{ color: theme.textContent }} key={nodeKey}>
        {displayText}
      </span>
    );
  }

  // Comment node
  if (node.type === 'comment') {
    return (
      <div key={nodeKey} style={{ paddingLeft: `${depth * indent}px`, color: theme.comment, fontStyle: 'italic', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
        {'<!--'}{node.content}{'-->'}
      </div>
    );
  }

  // CDATA node
  if (node.type === 'cdata') {
    return (
      <div key={nodeKey} style={{ paddingLeft: `${depth * indent}px`, color: theme.cdata, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
        {'<![CDATA['}{node.content}{']]>'}
      </div>
    );
  }

  // Processing instruction
  if (node.type === 'processing-instruction') {
    return (
      <div key={nodeKey} style={{ paddingLeft: `${depth * indent}px`, color: theme.processingInstruction, fontFamily: 'monospace', fontSize: 13 }}>
        <span style={{ color: theme.bracket }}>{'<?'}</span>
        <span style={{ color: theme.tagName }}>{node.target}</span>
        {node.content && <span> {node.content}</span>}
        <span style={{ color: theme.bracket }}>{'?>'}</span>
      </div>
    );
  }

  // Declaration
  if (node.type === 'declaration') {
    return (
      <div key={nodeKey} style={{ paddingLeft: `${depth * indent}px`, color: theme.declaration, fontFamily: 'monospace', fontSize: 13 }}>
        <span style={{ color: theme.bracket }}>{'<?'}</span>
        <span style={{ fontWeight: 600 }}>xml</span>
        {node.attributes?.map((attr, idx) => (
          <span key={idx}>
            {' '}
            <span style={{ color: theme.attributeName }}>{attr.name}</span>
            <span style={{ color: theme.equals }}>=</span>
            <span style={{ color: theme.attributeValue }}>"{attr.value}"</span>
          </span>
        ))}
        <span style={{ color: theme.bracket }}>{'?>'}</span>
      </div>
    );
  }

  // Element node
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsed && hasChildren;
  const textOnlyChildren = hasChildren && node.children!.length === 1 && node.children![0].type === 'text';

  const displayName = node.prefix
    ? <><span style={{ color: theme.colon }}>{node.prefix}</span><span style={{ color: theme.tagName }}>:{node.name}</span></>
    : <span style={{ color: theme.tagName }}>{node.name}</span>;

  const attrSpans = node.attributes && node.attributes.length > 0 && (
    <>
      {node.attributes.map((attr, idx) => (
        <span key={idx}>
          {' '}
          <span style={{ color: theme.attributeName }}>{attr.prefix ? `${attr.prefix}:${attr.name}` : attr.name}</span>
          <span style={{ color: theme.equals }}>=</span>
          <span style={{ color: theme.attributeValue }}>"{attr.value}"</span>
        </span>
      ))}
    </>
  );

  return (
    <div key={nodeKey}>
      <div
        style={{
          paddingLeft: `${depth * indent}px`,
          display: 'flex',
          alignItems: 'center',
          padding: '2px 0',
          cursor: hasChildren ? 'pointer' : 'default',
          borderRadius: '2px',
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: '1.6',
          whiteSpace: 'nowrap',
        }}
        onClick={hasChildren ? () => setCollapsed(prev => !prev) : undefined}
        onMouseEnter={(e) => {
          if (hasChildren) (e.currentTarget as HTMLElement).style.backgroundColor = theme.hoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        {/* Expand/collapse toggle */}
        <span style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {hasChildren ? (
            isCollapsed
              ? <ChevronRight color={theme.collapseIcon} size={10} />
              : <ChevronDown color={theme.expandIcon} size={10} />
          ) : <span style={{ width: 10 }} />}
        </span>

        {/* Tag opening bracket */}
        <span style={{ color: theme.bracket }}>{'<'}</span>

        {/* Tag name */}
        {displayName}

        {/* Attributes */}
        {attrSpans}

        {/* Self-closing or closing bracket */}
        {!hasChildren && !textOnlyChildren && (
          <span style={{ color: theme.bracket }}>{' />'}</span>
        )}
        {textOnlyChildren && !isCollapsed && (
          <>
            <span style={{ color: theme.bracket }}>{'>'}</span>
            <span style={{ color: theme.textContent }}>{node.children![0].content}</span>
            <span style={{ color: theme.bracket }}>{'<'}</span>
            <span style={{ color: theme.bracket }}>{'/'}</span>
            <span style={{ color: theme.tagName }}>{node.name}</span>
            <span style={{ color: theme.bracket }}>{'>'}</span>
          </>
        )}
        {isCollapsed && hasChildren && (
          <>
            <span style={{ color: theme.bracket }}>{'>'}</span>
            <span style={{ color: theme.comment, fontStyle: 'italic', marginLeft: 4, fontSize: 11 }}>
              {node.children!.length} {node.children!.length === 1 ? 'child' : 'children'}
            </span>
            <span style={{ color: theme.bracket }}>{'</'}</span>
            <span style={{ color: theme.tagName }}>{node.name}</span>
            <span style={{ color: theme.bracket }}>{'>'}</span>
          </>
        )}
        {!isCollapsed && hasChildren && !textOnlyChildren && (
          <span style={{ color: theme.bracket }}>{'>'}</span>
        )}
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && !textOnlyChildren && (
        <div>
          {node.children!.map((child, idx) => (
            <TreeNode
              key={`${nodeKey}-child-${idx}`}
              node={child}
              depth={depth + 1}
              defaultCollapsed={false}
              theme={theme}
              indent={indent}
              keyPrefix={`${nodeKey}-${idx}`}
            />
          ))}
          <div style={{
            paddingLeft: `${depth * indent}px`,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: '1.6',
          }}>
            <span style={{ color: theme.bracket }}>{'</'}</span>
            <span style={{ color: theme.tagName }}>{node.name}</span>
            <span style={{ color: theme.bracket }}>{'>'}</span>
          </div>
        </div>
      )}
    </div>
  );
});

TreeNode.displayName = 'XMLTreeNode';

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * XMLRenderer - Renders XML content as an interactive collapsible tree.
 *
 * Features:
 * - Simple, zero-dependency XML parser
 * - Collapsible tree view with expand/collapse per node
 * - Expand all / Collapse all controls
 * - Syntax highlighting for:
 *   - Tag names (green/blue)
 *   - Attributes (purple) and values (blue)
 *   - Comments (gray, italic)
 *   - CDATA sections
 *   - Processing instructions
 *   - XML declarations
 * - Text content display
 * - Copy to clipboard
 * - Light and dark themes
 * - Accessible tree view with ARIA attributes
 * - Customizable collapse depth
 * - Error handling with fallback
 *
 * @example
 * <XMLRenderer
 *   content='<?xml version="1.0"?><root><item id="1">Hello</item></root>'
 *   theme="dark"
 *   defaultCollapseDepth={1}
 * />
 */
export const XMLRenderer: React.FC<XMLRendererProps> = ({
  content,
  theme = 'light',
  showLineNumbers = false,
  defaultCollapseDepth = Infinity,
  showCopyButton = true,
  className,
  style,
  maxHeight = '500px',
  onError,
  fallback,
  testID,
  accessible,
  accessibilityLabel,
}) => {
  const [allExpanded, setAllExpanded] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const { copied, copyToClipboard } = useClipboard();

  const themeColors = THEMES[theme] || THEMES.light;

  // Parse XML content
  const parsedNodes = useMemo((): XMLParsedNode[] => {
    if (!content || typeof content !== 'string') return [];

    try {
      setParseError(null);
      return parseXML(content);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setParseError(msg);
      onError?.(error instanceof Error ? error : new Error(msg));
      return [];
    }
  }, [content, onError]);

  const handleCopy = useCallback(() => {
    if (content) copyToClipboard(content);
  }, [content, copyToClipboard]);

  const handleExpandAll = useCallback(() => {
    setAllExpanded(true);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setAllExpanded(false);
  }, []);

  // Error state
  if (parseError) {
    return (
      <div
        className={className}
        style={{
          padding: 16,
          border: `1px solid ${themeColors.border}`,
          borderRadius: 8,
          backgroundColor: themeColors.background,
          color: '#c53030',
          fontFamily: 'monospace',
          fontSize: 13,
          ...style,
        }}
        data-testid={testID || 'content-renderer-xml-error'}
        role={accessible !== false ? 'alert' : undefined}
      >
        <strong>XML Parse Error:</strong> {parseError}
      </div>
    );
  }

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

  return (
    <div className={className} style={containerStyle} data-testid={testID || 'content-renderer-xml'}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>XML</span>
          <span style={{
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 3,
            backgroundColor: theme === 'dark' ? '#264f78' : '#ddf4ff',
            color: theme === 'dark' ? '#4fc1ff' : '#0550ae',
          }}>
            {parsedNodes.length} {parsedNodes.length === 1 ? 'node' : 'nodes'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={handleExpandAll} style={buttonStyle} title="Expand all">
            Expand All
          </button>
          <button onClick={handleCollapseAll} style={buttonStyle} title="Collapse all">
            Collapse All
          </button>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              style={{
                ...buttonStyle,
                color: copied ? themeColors.copySuccess : themeColors.buttonText,
              }}
              title={copied ? 'Copied!' : 'Copy XML'}
            >
              {copied ? '\u2713 Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Tree Content */}
      <div
        style={{
          padding: '12px 16px',
          overflow: 'auto',
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
        role={accessible !== false ? 'tree' : undefined}
        aria-label={accessibilityLabel || 'XML document tree'}
      >
        {parsedNodes.map((node, idx) => (
          <TreeNode
            key={`xml-root-${idx}`}
            node={node}
            depth={0}
            defaultCollapsed={isFinite(defaultCollapseDepth) ? 0 >= defaultCollapseDepth : !allExpanded}
            theme={themeColors}
            indent={20}
            keyPrefix={`root-${idx}`}
          />
        ))}
      </div>
    </div>
  );
};

XMLRenderer.displayName = 'XMLRenderer';

export default XMLRenderer;
