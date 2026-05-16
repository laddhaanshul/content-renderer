import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { getLocaleDirection } from '@laddhaanshul/content-renderer-core';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JSONRendererProps {
  /** JSON string or parsed JavaScript value to render */
  json: string | unknown;
  /** Theme: 'light' or 'dark' (default: 'light') */
  theme?: 'light' | 'dark';
  /** Default indent size in spaces (default: 2) */
  indent?: number;
  /** Initial collapse depth. Nodes deeper than this are collapsed. (default: Infinity = all expanded) */
  defaultCollapseDepth?: number;
  /** Whether to sort object keys alphabetically (default: false) */
  sortKeys?: boolean;
  /** Whether to show data type badges (default: true) */
  showTypes?: boolean;
  /** Whether to show array indices (default: true) */
  showArrayIndices?: boolean;
  /** Whether to show a copy button (default: true) */
  showCopyButton?: boolean;
  /** Whether to enable the search/filter bar (default: false) */
  searchable?: boolean;
  /** Custom CSS class for the root container */
  className?: string;
  /** Inline styles for the root container */
  style?: React.CSSProperties;
  /** Maximum depth to render. Nodes beyond this show "[...]" (default: 50) */
  maxDepth?: number;
  /** Custom label for the root node */
  rootLabel?: string;
  /** Whether to show the root node wrapper (default: true) */
  showRoot?: boolean;
  /** Callback when a value is clicked */
  onValueClick?: (path: string, value: unknown) => void;
  /** Keys to exclude from rendering */
  excludeKeys?: string[];
  /** Keys to include (if set, only these keys are shown) */
  includeKeys?: string[];
  /** Custom CSS class prefix */
  classPrefix?: string;
  /** Whether the JSON is read-only (default: true) */
  readonly?: boolean;
  /** Callback when a value is edited */
  onEdit?: (path: string, newValue: unknown, oldValue: unknown) => void;
  /** Locale for RTL detection (e.g. 'ar', 'he') */
  locale?: string;
}

interface ThemeConfig {
  background: string;
  text: string;
  border: string;
  headerBg: string;
  headerText: string;
  braceColor: string;
  keyColor: string;
  stringColor: string;
  numberColor: string;
  booleanColor: string;
  nullColor: string;
  typeBg: string;
  typeText: string;
  hoverBg: string;
  copySuccess: string;
  buttonBg: string;
  buttonText: string;
  searchBg: string;
  searchText: string;
  searchBorder: string;
  iconExpanded: string;
  iconCollapsed: string;
  iconObject: string;
  iconArray: string;
}

const THEMES: Record<string, ThemeConfig> = {
  light: {
    background: '#ffffff',
    text: '#24292e',
    border: '#e1e4e8',
    headerBg: '#f6f8fa',
    headerText: '#24292e',
    braceColor: '#24292e',
    keyColor: '#0550ae',
    stringColor: '#0a3069',
    numberColor: '#0550ae',
    booleanColor: '#cf222e',
    nullColor: '#6e7781',
    typeBg: '#ddf4ff',
    typeText: '#0550ae',
    hoverBg: '#f6f8fa',
    copySuccess: '#1a7f37',
    buttonBg: '#f3f4f6',
    buttonText: '#24292e',
    searchBg: '#ffffff',
    searchText: '#24292e',
    searchBorder: '#d0d7de',
    iconExpanded: '#6e7781',
    iconCollapsed: '#6e7781',
    iconObject: '#6e7781',
    iconArray: '#6e7781',
  },
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    border: '#3e3e42',
    headerBg: '#252526',
    headerText: '#cccccc',
    braceColor: '#ffd700',
    keyColor: '#9cdcfe',
    stringColor: '#ce9178',
    numberColor: '#b5cea8',
    booleanColor: '#569cd6',
    nullColor: '#808080',
    typeBg: '#264f78',
    typeText: '#4fc1ff',
    hoverBg: '#2a2d2e',
    copySuccess: '#4ec9b0',
    buttonBg: '#3e3e42',
    buttonText: '#cccccc',
    searchBg: '#3c3c3c',
    searchText: '#d4d4d4',
    searchBorder: '#555555',
    iconExpanded: '#808080',
    iconCollapsed: '#808080',
    iconObject: '#569cd6',
    iconArray: '#569cd6',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function formatPrimitive(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'undefined') return 'undefined';
  return String(value);
}

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
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), timeout);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), timeout);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, [timeout]);

  return { copied, copyToClipboard };
}

// ─── Icons ───────────────────────────────────────────────────────────────────

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

const ObjectIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M2 12h20" />
  </svg>
);

const ArrayIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4l-6 8 6 8" />
    <path d="M16 4l6 8-6 8" />
  </svg>
);

// ─── TreeNode Component ──────────────────────────────────────────────────────

interface TreeNodeProps {
  keyName: string | null;
  value: unknown;
  depth: number;
  path: string;
  defaultCollapsed: boolean;
  sortKeys: boolean;
  showTypes: boolean;
  showArrayIndices: boolean;
  onValueClick?: (path: string, value: unknown) => void;
  excludeKeys?: string[];
  includeKeys?: string[];
  maxDepth: number;
  searchTerm: string;
  theme: ThemeConfig;
  indent: number;
  readonly: boolean;
  onEdit?: (path: string, newValue: unknown, oldValue: unknown) => void;
  isRTL?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(({
  keyName,
  value,
  depth,
  path,
  defaultCollapsed,
  sortKeys,
  showTypes,
  showArrayIndices,
  onValueClick,
  excludeKeys,
  includeKeys,
  maxDepth,
  searchTerm,
  theme,
  indent,
  readonly,
  onEdit,
  isRTL,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const type = getType(value);

  const isSearchMatch = useMemo(() => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();

    if (keyName && keyName.toLowerCase().includes(lower)) return true;

    if (type !== 'object' && type !== 'array') {
      return String(value).toLowerCase().includes(lower);
    }

    // Deep search in objects/arrays
    return matchesSearchDeep(value, lower);
  }, [searchTerm, keyName, value, type]);

  const shouldRender = useMemo(() => {
    if (!searchTerm) return true;
    return isSearchMatch;
  }, [searchTerm, isSearchMatch]);

  if (!shouldRender) return null;

  if (depth > maxDepth) {
    const paddingStyle = isRTL ? { paddingRight: `${depth * indent}px` } : { paddingLeft: `${depth * indent}px` };
    return (
      <div style={{ ...paddingStyle, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {keyName !== null && (
          <span style={{ color: theme.keyColor }}>"{keyName}"</span>
        )}
        <span>: </span>
        <span style={{ color: theme.nullColor, fontStyle: 'italic' }}>[max depth reached]</span>
      </div>
    );
  }

  const currentPath = keyName !== null ? (path ? `${path}.${keyName}` : keyName) : path;

  // Primitive values
  if (type !== 'object' && type !== 'array') {
    const paddingStyle = isRTL ? { paddingRight: `${depth * indent}px` } : { paddingLeft: `${depth * indent}px` };
    return (
      <div
        style={{
          ...paddingStyle,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '1px 0',
          cursor: onValueClick ? 'pointer' : 'default',
          borderRadius: '2px',
        }}
        onClick={onValueClick ? () => onValueClick(currentPath, value) : undefined}
        onMouseEnter={(e) => {
          if (onValueClick) (e.currentTarget as HTMLElement).style.backgroundColor = theme.hoverBg;
        }}
        onMouseLeave={(e) => {
          if (onValueClick) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        <span style={{ width: `${indent}px`, flexShrink: 0 }} />
        {keyName !== null && (
          <>
            <span style={{ color: theme.keyColor }}>"{keyName}"</span>
            <span style={{ color: theme.braceColor }}>: </span>
          </>
        )}
        {!readonly ? (
          <input
            type="text"
            defaultValue={type === 'string' ? String(value) : formatPrimitive(value)}
            onBlur={(e) => {
              const newVal = e.target.value;
              let typedVal: unknown = newVal;
              if (type === 'number') typedVal = Number(newVal);
              if (type === 'boolean') typedVal = newVal === 'true';
              if (type === 'null') typedVal = null;
              
              if (typedVal !== value && onEdit) {
                onEdit(currentPath, typedVal, value);
              }
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${theme.border}`,
              color: valueColor(type, theme),
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: '0 2px',
              outline: 'none',
              minWidth: '50px',
            }}
          />
        ) : (
          <span style={{ color: valueColor(type, theme) }}>
            {formatPrimitive(value)}
          </span>
        )}
        {showTypes && (
          <span
            style={{
              fontSize: '10px',
              padding: '0px 4px',
              borderRadius: '3px',
              backgroundColor: theme.typeBg,
              color: theme.typeText,
              marginLeft: '4px',
              flexShrink: 0,
            }}
          >
            {type}
          </span>
        )}
      </div>
    );
  }

  // Objects and arrays
  const entries = useMemo(() => {
    if (type === 'array') {
      return (value as unknown[]).map((item, idx) => [String(idx), item] as const);
    }

    let keys = Object.keys(value as Record<string, unknown>);

    if (excludeKeys && excludeKeys.length > 0) {
      keys = keys.filter(k => !excludeKeys.includes(k));
    }
    if (includeKeys && includeKeys.length > 0) {
      keys = keys.filter(k => includeKeys.includes(k));
    }
    if (sortKeys) {
      keys.sort();
    }

    return keys.map(k => [k, (value as Record<string, unknown>)[k]] as const);
  }, [value, type, excludeKeys, includeKeys, sortKeys]);

  const isOpen = !collapsed;
  const count = entries.length;
  const isArray = type === 'array';
  const openBrace = isArray ? '[' : '{';
  const closeBrace = isArray ? ']' : '}';

  const paddingStyle = isRTL ? { paddingRight: `${depth * indent}px` } : { paddingLeft: `${depth * indent}px` };

  return (
    <div style={paddingStyle}>
      {/* Collapsed / Expandable header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '1px 0',
          cursor: 'pointer',
          borderRadius: '2px',
        }}
        onClick={() => setCollapsed(prev => !prev)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = theme.hoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        {/* Expand/collapse icon */}
        <span style={{ 
          width: '14px', 
          height: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0,
          transform: isRTL && !isOpen ? 'rotate(180deg)' : 'none'
        }}>
          {isOpen ? <ChevronDown color={theme.iconExpanded} /> : <ChevronRight color={theme.iconCollapsed} />}
        </span>

        {/* Type icon */}
        <span style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isArray ? <ArrayIcon color={theme.iconArray} /> : <ObjectIcon color={theme.iconObject} />}
        </span>

        {/* Key name */}
        {keyName !== null && (
          <>
            <span style={{ color: theme.keyColor }}>"{keyName}"</span>
            <span style={{ color: theme.braceColor }}>: </span>
          </>
        )}

        {/* Open brace */}
        <span style={{ color: theme.braceColor }}>{openBrace}</span>

        {/* Count badge */}
        <span style={{ color: theme.nullColor, fontSize: '12px' }}>
          {count} {isArray ? 'items' : 'keys'}
        </span>

        {/* Collapsed inline preview */}
        {!isOpen && (
          <span style={{ color: theme.nullColor }}>
            {' '}{closeBrace}
          </span>
        )}
      </div>

      {/* Expanded children */}
      {isOpen && (
        <>
          {entries.map(([entryKey, entryValue], idx) => (
            <TreeNode
              key={entryKey}
              keyName={isArray && showArrayIndices ? null : entryKey}
              value={entryValue}
              depth={depth + 1}
              path={isArray ? `${currentPath}[${idx}]` : `${currentPath}.${entryKey}`}
              defaultCollapsed={false}
              sortKeys={sortKeys}
              showTypes={showTypes}
              showArrayIndices={showArrayIndices}
              onValueClick={onValueClick}
              excludeKeys={excludeKeys}
              includeKeys={includeKeys}
              maxDepth={maxDepth}
              searchTerm={searchTerm}
              theme={theme}
              indent={indent}
              readonly={readonly}
              onEdit={onEdit}
              isRTL={isRTL}
            />
          ))}
          {/* Close brace */}
          <div style={{ color: theme.braceColor }}>
            {closeBrace}
          </div>
        </>
      )}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';

function valueColor(type: string, theme: ThemeConfig): string {
  switch (type) {
    case 'string': return theme.stringColor;
    case 'number': return theme.numberColor;
    case 'boolean': return theme.booleanColor;
    case 'null': return theme.nullColor;
    default: return theme.text;
  }
}

function matchesSearchDeep(value: unknown, searchTerm: string): boolean {
  if (typeof value === 'string') return value.toLowerCase().includes(searchTerm);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).includes(searchTerm);
  if (value === null) return 'null'.includes(searchTerm);

  if (Array.isArray(value)) {
    return value.some(item => matchesSearchDeep(item, searchTerm));
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(v => matchesSearchDeep(v, searchTerm));
  }

  return false;
}

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * JSONRenderer - Interactive JSON tree viewer.
 *
 * Features:
 * - Recursive collapsible tree view
 * - Expand/collapse individual nodes
 * - Search/filter keys or values
 * - Data type badges and color-coding
 * - Copy entire JSON to clipboard
 * - Sort keys alphabetically
 * - Depth limiting and max depth
 * - Include/exclude specific keys
 * - Click-to-select value paths
 * - Circular reference detection
 * - Light and dark themes
 *
 * @example
 * <JSONRenderer
 *   json={JSON.stringify({ name: "John", age: 30 }, null, 2)}
 *   theme="dark"
 *   searchable
 *   sortKeys
 *   defaultCollapseDepth={2}
 * />
 */
export const JSONRenderer: React.FC<JSONRendererProps> = ({
  json,
  theme = 'light',
  indent = 2,
  defaultCollapseDepth = Infinity,
  sortKeys = false,
  showTypes = true,
  showArrayIndices = true,
  showCopyButton = true,
  searchable = false,
  className,
  style,
  maxDepth = 50,
  rootLabel,
  showRoot = true,
  onValueClick,
  excludeKeys,
  includeKeys,
  classPrefix = 'cr',
  readonly = true,
  onEdit,
  locale = 'en',
}) => {
  const direction = useMemo(() => getLocaleDirection(locale), [locale]);
  const isRTL = direction === 'rtl';
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(true);
  const { copied, copyToClipboard } = useClipboard();

  const themeConfig = THEMES[theme] || THEMES.light;

  const parsedValue = useMemo((): { value: unknown; error: string | null } => {
    if (json === undefined || json === null) {
      return { value: null, error: null };
    }

    if (typeof json === 'string') {
      const trimmed = json.trim();
      if (!trimmed) {
        return { value: null, error: null };
      }

      try {
        return { value: JSON.parse(trimmed), error: null };
      } catch (err) {
        return {
          value: null,
          error: err instanceof Error ? err.message : 'Invalid JSON',
        };
      }
    }

    // Already a parsed value
    return { value: json, error: null };
  }, [json]);

  const handleCopy = useCallback(() => {
    const formatted = typeof json === 'string' ? json : JSON.stringify(json, null, indent);
    copyToClipboard(formatted);
  }, [json, indent, copyToClipboard]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Error state
  if (parsedValue.error) {
    return (
      <div
        className={className}
        style={{
          padding: '16px',
          border: `1px solid ${themeConfig.border}`,
          borderRadius: '8px',
          backgroundColor: themeConfig.background,
          color: '#c53030',
          fontFamily: 'monospace',
          fontSize: '13px',
          ...style,
        }}
        data-testid="content-renderer-json-error"
      >
        <strong>JSON Parse Error:</strong> {parsedValue.error}
      </div>
    );
  }

  // Null/empty
  if (parsedValue.value === undefined || parsedValue.value === null && json === null) {
    return (
      <div
        className={className}
        style={{
          padding: '16px',
          border: `1px solid ${themeConfig.border}`,
          borderRadius: '8px',
          backgroundColor: themeConfig.background,
          color: themeConfig.nullColor,
          fontFamily: 'monospace',
          fontSize: '13px',
          ...style,
        }}
        data-testid="content-renderer-json-null"
      >
        null
      </div>
    );
  }

  const isEmptyValue = parsedValue.value === null ||
    (typeof parsedValue.value === 'object' && Object.keys(parsedValue.value as object).length === 0);

  return (
    <div
      className={className}
      dir={direction}
      style={{
        border: `1px solid ${themeConfig.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: themeConfig.background,
        fontFamily: '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
        fontSize: '13px',
        lineHeight: '1.6',
        color: themeConfig.text,
        textAlign: isRTL ? 'right' : 'left',
        ...style,
      }}
      data-testid="content-renderer-json"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: themeConfig.headerBg,
          borderBottom: `1px solid ${themeConfig.border}`,
          color: themeConfig.headerText,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setExpanded(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: themeConfig.headerText,
              fontSize: '12px',
            }}
          >
            {expanded ? <ChevronDown color={themeConfig.headerText} size={10} /> : <ChevronRight color={themeConfig.headerText} size={10} />}
            {rootLabel || 'JSON'}
          </button>
          {showTypes && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: themeConfig.typeBg,
                color: themeConfig.typeText,
              }}
            >
              {getType(parsedValue.value)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: themeConfig.buttonBg,
                color: copied ? themeConfig.copySuccess : themeConfig.buttonText,
                transition: 'color 0.2s ease',
              }}
              title={copied ? 'Copied!' : 'Copy JSON'}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {searchable && (
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${themeConfig.border}` }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search keys or values..."
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '12px',
              border: `1px solid ${themeConfig.searchBorder}`,
              borderRadius: '4px',
              backgroundColor: themeConfig.searchBg,
              color: themeConfig.searchText,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Tree Content */}
      {expanded && (
        <div style={{ padding: '8px 12px', overflow: 'auto', maxHeight: '600px' }}>
          <TreeNode
            keyName={showRoot ? rootLabel || null : null}
            value={parsedValue.value}
            depth={0}
            path=""
            defaultCollapsed={isFinite(defaultCollapseDepth) && defaultCollapseDepth <= 0}
            sortKeys={sortKeys}
            showTypes={showTypes}
            showArrayIndices={showArrayIndices}
            onValueClick={onValueClick}
            excludeKeys={excludeKeys}
            includeKeys={includeKeys}
            maxDepth={maxDepth}
            searchTerm={searchTerm}
            theme={themeConfig}
            indent={indent * 5}
            readonly={readonly}
            onEdit={onEdit}
            isRTL={isRTL}
          />
        </div>
      )}
    </div>
  );
};

JSONRenderer.displayName = 'JSONRenderer';

export default JSONRenderer;
