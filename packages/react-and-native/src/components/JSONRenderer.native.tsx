// @ts-nocheck
/**
 * JSONRenderer – renders JSON data as a collapsible tree in React Native.
 *
 * Features:
 * - Recursive collapsible tree view
 * - Expand/collapse with animated toggle
 * - Type indicators with colored dots
 * - Copy value to clipboard
 * - Search/filter (optional)
 * - Circular reference handling
 * - Depth limiting
 * - Large array virtualization hint
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Share,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { lightNativeTheme, darkNativeTheme, type NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JSONRendererProps {
  /** JSON data to render (object, array, string, number, etc.) */
  json?: unknown;
  /** Alias for json */
  data?: unknown;
  /** Alias for json */
  content?: unknown;
  /** Initial root label. Default: "root". */
  rootName?: string;
  /** Starting expanded depth. Default: 2. */
  initialExpandDepth?: number;
  /** Maximum depth to render. Default: 20. */
  maxDepth?: number;
  /** Show types next to values. Default: true. */
  showTypes?: boolean;
  /** Enable copy button. Default: true. */
  showCopyButton?: boolean;
  /** Enable search/filter. Default: false. */
  searchable?: boolean;
  /** Use dark theme. Default: false. */
  dark?: boolean;
  /** Custom native theme overrides. */
  theme?: Partial<NativeTheme>;
  /** Root container style. */
  style?: StyleProp<ViewStyle>;
  /** Test ID. */
  testID?: string;
  /** Accessible. */
  accessible?: boolean;
  /** Accessibility label. */
  accessibilityLabel?: string;
  /** Number of items to render before showing "… N more" */
  collapseAfter?: number;
  /** Sort object keys alphabetically. Default: false. */
  sortKeys?: boolean;
  /** Whether the tree is read-only. Default: true. */
  readonly?: boolean;
  /** Callback for when a value is edited. */
  onEdit?: (path: string, newValue: any, oldValue: any) => void;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface CircularRef {
  __circular__: true;
  ref: string;
}

// ---------------------------------------------------------------------------
// Circular reference detection
// ---------------------------------------------------------------------------

function stringifySafe(data: unknown, seen?: WeakSet<object>): string {
  try {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);
    return JSON.stringify(data, (_, value) => {
      if (typeof value === 'object' && value !== null) {
        if (!seen) seen = new WeakSet();
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      return value;
    });
  } catch {
    return '[Unable to stringify]';
  }
}

// ---------------------------------------------------------------------------
// Value renderer
// ---------------------------------------------------------------------------

interface ValueNodeProps {
  value: JsonValue | CircularRef;
  isLast: boolean;
  depth: number;
  theme: NativeTheme;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  currentPath: string;
  showTypes: boolean;
  maxDepth: number;
  collapseAfter: number;
  sortKeys: boolean;
  readonly: boolean;
  onEdit?: (path: string, newValue: any, oldValue: any) => void;
}

const INDENT = 16;

function isObject(v: unknown): v is { [key: string]: JsonValue } {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isArray(v: unknown): v is JsonValue[] {
  return Array.isArray(v);
}

function getTypeColor(type: string, theme: NativeTheme): string {
  switch (type) {
    case 'string': return theme.jsonViewer.stringVal.color as string;
    case 'number': return theme.jsonViewer.numberVal.color as string;
    case 'boolean': return theme.jsonViewer.booleanVal.color as string;
    case 'null': return theme.jsonViewer.nullVal.color as string;
    default: return theme.jsonViewer.keyText.color as string;
  }
}

function getTypeIndicator(value: JsonValue): { label: string; color: string } {
  if (value === null) return { label: 'null', color: '' };
  if (Array.isArray(value)) return { label: `Array(${value.length})`, color: '' };
  if (typeof value === 'object') return { label: `Object{${Object.keys(value).length}}`, color: '' };
  if (typeof value === 'string') return { label: 'String', color: '' };
  if (typeof value === 'number') return { label: 'Number', color: '' };
  if (typeof value === 'boolean') return { label: 'Boolean', color: '' };
  return { label: 'Unknown', color: '' };
}

const ValueNode: React.FC<ValueNodeProps> = ({
  value,
  isLast,
  depth,
  theme,
  expandedPaths,
  onToggle,
  currentPath,
  showTypes,
  maxDepth,
  collapseAfter,
  sortKeys,
  readonly,
  onEdit,
}) => {
  const isExpanded = expandedPaths.has(currentPath);
  const atMaxDepth = depth >= maxDepth;
  const [editValue, setEditValue] = useState(String(value));

  const handleBlur = () => {
    if (readonly || !onEdit) return;
    let newValue: any = editValue;
    if (value === null) {
      if (editValue.toLowerCase() === 'null') newValue = null;
    } else if (typeof value === 'number') {
      newValue = parseFloat(editValue);
      if (isNaN(newValue)) newValue = value;
    } else if (typeof value === 'boolean') {
      newValue = editValue.toLowerCase() === 'true';
    }
    
    if (newValue !== value) {
      onEdit(currentPath, newValue, value);
    }
  };

  if (value === null || typeof value !== 'object') {
    const isStr = typeof value === 'string';
    const style = value === null
      ? theme.jsonViewer.nullVal
      : typeof value === 'string'
        ? theme.jsonViewer.stringVal
        : typeof value === 'number'
          ? theme.jsonViewer.numberVal
          : theme.jsonViewer.booleanVal;

    if (!readonly) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isStr && <Text style={style}>"</Text>}
          <TextInput
            style={[style, { fontSize: 13, padding: 0, minWidth: 40 }]}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleBlur}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isStr && <Text style={style}>"</Text>}
          {!isLast && <Text style={theme.jsonViewer.bracket}>,</Text>}
        </View>
      );
    }

    const displayValue = isStr ? `"${value}"` : String(value);

    return (
      <Text style={[style, { fontSize: 13 }]}>
        {displayValue}
        {isLast ? '' : ','}
        {showTypes ? (
          <Text style={{ fontSize: 10, color: theme.colors.textTertiary, marginLeft: 4 }}>
            {value === null ? 'null' : typeof value}
          </Text>
        ) : null}
      </Text>
    );
  }

  const isArr = Array.isArray(value);
  const entries = isArr
    ? (value as JsonValue[]).map((v, i) => [String(i), v] as [string, JsonValue])
    : Object.entries(value as { [key: string]: JsonValue });

  if (sortKeys && !isArr) {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  const openBracket = isArr ? '[' : '{';
  const closeBracket = isArr ? ']' : '}';
  const childCount = entries.length;
  const isLarge = childCount > (collapseAfter || 100);

  return (
    <View>
      {/* Header line */}
      <TouchableOpacity
        onPress={() => onToggle(currentPath)}
        activeOpacity={0.6}
        disabled={atMaxDepth}
        style={{ flexDirection: 'row', alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${currentPath}`}
      >
        {/* Chevron */}
        {!atMaxDepth && (
          <Text style={{ fontSize: 10, color: theme.colors.textTertiary, width: 16, textAlign: 'center', marginRight: 4 }}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        )}

        {/* Type info */}
        <Text style={theme.jsonViewer.bracket}>
          {openBracket}
        </Text>

        {showTypes && (
          <Text style={{ fontSize: 10, color: theme.colors.textTertiary, marginLeft: 4 }}>
            {isArr ? `Array(${childCount})` : `{${childCount} keys}`}
          </Text>
        )}

        {!isExpanded && (
          <Text style={theme.jsonViewer.bracket}>
            {' '}{closeBracket}{isLast ? '' : ','}
          </Text>
        )}
      </TouchableOpacity>

      {/* Children */}
      {isExpanded && !atMaxDepth && (
        <View style={{ paddingLeft: INDENT }}>
          {entries.map(([key, val], idx) => {
            const childPath = `${currentPath}.${key}`;
            const childIsLast = idx === childCount - 1;

            if (isLarge && idx >= collapseAfter!) {
              if (idx === collapseAfter) {
                return (
                  <Text key="more" style={{ fontSize: 11, color: theme.colors.textTertiary, fontStyle: 'italic', marginBottom: 2 }}>
                    … {childCount - collapseAfter} more item{childCount - collapseAfter !== 1 ? 's' : ''}
                  </Text>
                );
              }
              return null;
            }

            return (
              <View key={key} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 1 }}>
                {/* Key */}
                {!isArr && (
                  <Text style={theme.jsonViewer.keyText}>
                    "{key}"
                  </Text>
                )}
                {!isArr && (
                  <Text style={[theme.jsonViewer.bracket, { marginRight: 4 }]}>
                    :
                  </Text>
                )}

                {/* Value */}
                <ValueNode
                  value={val}
                  isLast={childIsLast}
                  depth={depth + 1}
                  theme={theme}
                  expandedPaths={expandedPaths}
                  onToggle={onToggle}
                  currentPath={childPath}
                  showTypes={showTypes}
                  maxDepth={maxDepth}
                  collapseAfter={collapseAfter}
                  sortKeys={sortKeys}
                  readonly={readonly}
                  onEdit={onEdit}
                />
              </View>
            );
          })}
          <Text style={theme.jsonViewer.bracket}>
            {closeBracket}{isLast ? '' : ','}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const JSONRenderer: React.FC<JSONRendererProps> = ({
  json,
  rootName = 'root',
  initialExpandDepth = 2,
  maxDepth = 20,
  showTypes = true,
  showCopyButton = true,
  searchable = false,
  dark = false,
  theme: themeOverride,
  style,
  testID,
  accessible,
  accessibilityLabel,
  collapseAfter = 100,
  sortKeys = false,
  readonly = true,
  onEdit,
  data: dataAlias,
  content: contentAlias,
}) => {
  const jsonValue = json ?? dataAlias ?? contentAlias;
  const processedData = useMemo(() => {
    if (typeof jsonValue === 'string') {
      try {
        return JSON.parse(jsonValue);
      } catch {
        return jsonValue;
      }
    }
    return jsonValue;
  }, [jsonValue]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const paths = new Set<string>();
    function expandObject(value: unknown, path: string, depth: number) {
      if (depth >= initialExpandDepth) return;
      if (isObject(value)) {
        paths.add(path);
        for (const key of Object.keys(value as object)) {
          expandObject((value as any)[key], `${path}.${key}`, depth + 1);
        }
      } else if (isArray(value)) {
        paths.add(path);
        (value as any[]).forEach((v, i) => expandObject(v, `${path}.${i}`, depth + 1));
      }
    }
    expandObject(processedData, rootName, 0);
    return paths;
  });

  const resolvedTheme = useMemo<NativeTheme>(() => {
    const base = dark ? darkNativeTheme : lightNativeTheme;
    if (!themeOverride) return base;
    return {
      ...base,
      colors: { ...base.colors, ...(themeOverride as any)?.colors },
      jsonViewer: { ...base.jsonViewer, ...(themeOverride as any)?.jsonViewer },
    };
  }, [dark, themeOverride]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const paths = new Set<string>();
    function expandAll(value: unknown, path: string) {
      if (isObject(value)) {
        paths.add(path);
        for (const key of Object.keys(value)) {
          expandAll(value[key], `${path}.${key}`);
        }
      } else if (isArray(value)) {
        paths.add(path);
        value.forEach((v, i) => expandAll(v, `${path}.${i}`));
      }
    }
    expandAll(processedData, rootName);
    setExpandedPaths(paths);
  }, [processedData, rootName]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const handleCopy = useCallback(async () => {
    const text = stringifySafe(processedData);
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        await Share.share({ message: text });
      }
    } catch {
      // Clipboard might not be available
    }
  }, [processedData]);

  // Filter: if search query, only show matching paths
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return processedData;
    const query = searchQuery.trim().toLowerCase();
    return filterJSON(processedData, query);
  }, [processedData, searchQuery]);

  return (
    <View
      testID={testID || 'json-renderer'}
      accessible={accessible !== false}
      accessibilityLabel={accessibilityLabel || `JSON viewer: ${rootName}`}
      style={[resolvedTheme.jsonViewer.container, style as ViewStyle]}
    >
      {/* Toolbar */}
      {(showCopyButton || searchable) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
          {showCopyButton && (
            <TouchableOpacity
              onPress={handleCopy}
              style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: dark ? '#3a3a5e' : '#e0e0e0' }}
              activeOpacity={0.6}
            >
              <Text style={{ fontSize: 11, color: dark ? '#a0a0c0' : '#555' }}>Copy</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleExpandAll}
            style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: dark ? '#3a3a5e' : '#e0e0e0' }}
            activeOpacity={0.6}
          >
            <Text style={{ fontSize: 11, color: dark ? '#a0a0c0' : '#555' }}>Expand</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCollapseAll}
            style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: dark ? '#3a3a5e' : '#e0e0e0' }}
            activeOpacity={0.6}
          >
            <Text style={{ fontSize: 11, color: dark ? '#a0a0c0' : '#555' }}>Collapse</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search */}
      {searchable && (
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: dark ? '#3a3a5e' : '#ddd',
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 6,
            marginBottom: 8,
            fontSize: 14,
            color: dark ? '#e0e0f0' : '#333',
            backgroundColor: dark ? '#1e1e2e' : '#fff',
          }}
          placeholder="Search keys..."
          placeholderTextColor={dark ? '#707090' : '#aaa'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      {/* Tree */}
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 }}>
          <Text style={themeOverride?.jsonViewer?.keyText || resolvedTheme.jsonViewer.keyText}>
            "{rootName}"
          </Text>
          <Text style={[resolvedTheme.jsonViewer.bracket, { marginRight: 4 }]}>:</Text>
        </View>
        <ValueNode
          value={filteredData as JsonValue}
          isLast={true}
          depth={0}
          theme={resolvedTheme}
          expandedPaths={expandedPaths}
          onToggle={handleToggle}
          currentPath={rootName}
          showTypes={showTypes}
          maxDepth={maxDepth}
          collapseAfter={collapseAfter}
          sortKeys={sortKeys}
          readonly={readonly}
          onEdit={onEdit}
        />
      </ScrollView>
    </View>
  );
};

JSONRenderer.displayName = 'JSONRenderer';

// ---------------------------------------------------------------------------
// JSON filter helper
// ---------------------------------------------------------------------------

function filterJSON(data: unknown, query: string): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return data.toLowerCase().includes(query) ? data : undefined;
  if (typeof data === 'number' || typeof data === 'boolean') return data;

  if (Array.isArray(data)) {
    return data.map(item => filterJSON(item, query)).filter(item => item !== undefined);
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (key.toLowerCase().includes(query)) {
        result[key] = value;
      } else {
        const filtered = filterJSON(value, query);
        if (filtered !== undefined) {
          result[key] = filtered;
        }
      }
    }
    return result;
  }

  return data;
}

export default JSONRenderer;
