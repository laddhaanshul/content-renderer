// @ts-nocheck
/**
 * XMLRenderer – renders XML content as a collapsible, syntax-highlighted tree
 * in React Native.
 *
 * Features:
 * - Collapsible element tree
 * - Syntax-highlighted tags, attributes, values
 * - Copy element content
 * - Indent-based display
 * - Comment highlighting
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { lightNativeTheme, darkNativeTheme, type NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XMLRendererProps {
  /** XML string to render. */
  xml?: string;
  /** Alias for xml */
  content?: string;
  /** Initial expanded depth. Default: 2. */
  initialExpandDepth?: number;
  /** Use dark theme. Default: false. */
  dark?: boolean;
  /** Custom theme overrides. */
  theme?: Partial<NativeTheme>;
  /** Root container style. */
  style?: StyleProp<ViewStyle>;
  /** Show copy button. Default: true. */
  showCopyButton?: boolean;
  /** Test ID. */
  testID?: string;
  /** Accessible. */
  accessible?: boolean;
}

// ---------------------------------------------------------------------------
// Simple XML parser
// ---------------------------------------------------------------------------

interface XMLNode {
  type: 'element' | 'text' | 'comment' | 'cdata' | 'declaration';
  tag?: string;
  attributes?: Record<string, string>;
  children?: XMLNode[];
  content?: string;
  isSelfClosing?: boolean;
}

function parseXML(xml: string): XMLNode[] {
  const nodes: XMLNode[] = [];
  let i = 0;
  const len = xml.length;

  function skipWhitespace() {
    while (i < len && /\s/.test(xml[i])) i++;
  }

  function parseAttributes(): Record<string, string> {
    const attrs: Record<string, string> = {};
    while (i < len) {
      skipWhitespace();
      if (xml[i] === '>' || xml[i] === '/' || xml[i] === '?') break;
      // Attribute name
      const nameStart = i;
      while (i < len && /[\w\-_:.]/.test(xml[i])) i++;
      const name = xml.slice(nameStart, i);
      if (!name) break;
      skipWhitespace();
      if (xml[i] === '=') {
        i++;
        skipWhitespace();
        let value = '';
        if (xml[i] === '"' || xml[i] === "'") {
          const q = xml[i];
          i++;
          const valueEnd = xml.indexOf(q, i);
          if (valueEnd === -1) {
            value = xml.slice(i);
            i = len;
          } else {
            value = xml.slice(i, valueEnd);
            i = valueEnd + 1;
          }
        } else {
          const valueEnd = xml.indexOf('>', i);
          if (valueEnd === -1) {
            value = xml.slice(i);
            i = len;
          } else {
            value = xml.slice(i, valueEnd);
            i = valueEnd;
          }
        }
        attrs[name] = value;
      } else {
        attrs[name] = '';
      }
    }
    return attrs;
  }

  while (i < len) {
    skipWhitespace();
    if (i >= len) break;

    // XML declaration <?xml ...?>
    if (xml[i] === '<' && xml[i + 1] === '?') {
      const start = i;
      const end = xml.indexOf('?>', i + 2);
      if (end === -1) break;
      nodes.push({
        type: 'declaration',
        content: xml.slice(start, end + 2),
      });
      i = end + 2;
      continue;
    }

    // Comment <!-- ... -->
    if (xml.slice(i, i + 4) === '<!--') {
      const end = xml.indexOf('-->', i + 4);
      if (end === -1) break;
      nodes.push({
        type: 'comment',
        content: xml.slice(i + 4, end).trim(),
      });
      i = end + 3;
      continue;
    }

    // CDATA <![CDATA[ ... ]]>
    if (xml.slice(i, i + 9) === '<![CDATA[') {
      const end = xml.indexOf(']]>', i + 9);
      if (end === -1) break;
      nodes.push({
        type: 'cdata',
        content: xml.slice(i + 9, end),
      });
      i = end + 3;
      continue;
    }

    // Closing tag
    if (xml[i] === '<' && xml[i + 1] === '/') {
      break; // Handled by parent recursion
    }

    // Opening tag
    if (xml[i] === '<') {
      i++; // skip <
      const tagStart = i;
      while (i < len && /[\w\-_:.]/.test(xml[i])) i++;
      const tag = xml.slice(tagStart, i);
      const attributes = parseAttributes();
      skipWhitespace();

      const isSelfClosing = xml[i] === '/';
      if (xml[i] === '/' || xml[i] === '>') {
        i++; // skip / or >
      }

      const element: XMLNode = {
        type: 'element',
        tag,
        attributes,
        children: [],
        isSelfClosing,
      };

      if (!isSelfClosing) {
        // Parse children until closing tag
        while (i < len) {
          skipWhitespace();
          if (i >= len) break;

          // Closing tag </tag>
          if (xml.slice(i, i + 2 + tag.length) === `</${tag}>`) {
            i += 2 + tag.length;
            break;
          }
          if (xml.slice(i, i + 2 + tag.length) === `</${tag} `) {
            i += 2 + tag.length;
            while (i < len && xml[i] !== '>') i++;
            if (i < len) i++;
            break;
          }

          // Nested element or text
          if (xml[i] === '<') {
            // Check for text before this child element
            // Recursively parse child
            const childNodes = parseXML(xml.slice(i));
            element.children!.push(...childNodes);
            // Advance i - we need to track how many chars we consumed
            // This is a simplified approach; for production, use xmlparser2
            break;
          } else {
            // Text content
            const textStart = i;
            while (i < len && xml[i] !== '<') i++;
            const text = xml.slice(textStart, i).trim();
            if (text) {
              element.children!.push({ type: 'text', content: text });
            }
          }
        }
      }

      nodes.push(element);
      continue;
    }

    // Text content (shouldn't normally reach here at top level)
    const textStart = i;
    while (i < len && xml[i] !== '<') i++;
    const text = xml.slice(textStart, i).trim();
    if (text) {
      nodes.push({ type: 'text', content: text });
    }
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Node renderer
// ---------------------------------------------------------------------------

interface XMLNodeRendererProps {
  node: XMLNode;
  depth: number;
  theme: NativeTheme;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  currentPath: string;
  indent: number;
}

const XMLNodeRenderer: React.FC<XMLNodeRendererProps> = ({
  node,
  depth,
  theme,
  expandedPaths,
  onToggle,
  currentPath,
  indent,
}) => {
  if (node.type === 'text') {
    return (
      <Text key={currentPath} style={theme.xmlViewer.text}>
        {node.content}
      </Text>
    );
  }

  if (node.type === 'comment') {
    return (
      <Text key={currentPath} style={theme.xmlViewer.comment}>
        {'<!-- '}{node.content}{' -->'}
      </Text>
    );
  }

  if (node.type === 'cdata') {
    return (
      <Text key={currentPath} style={theme.xmlViewer.text}>
        {'<![CDATA['}{node.content}{']]>'}
      </Text>
    );
  }

  if (node.type === 'declaration') {
    return (
      <Text key={currentPath} style={theme.xmlViewer.comment}>
        {node.content}
      </Text>
    );
  }

  if (node.type === 'element') {
    const hasChildren = node.children && node.children.length > 0;
    const hasComplexChildren = hasChildren && node.children?.some((c: any) => c.type === 'element');
    const isExpanded = expandedPaths.has(currentPath);
    const selfClose = node.isSelfClosing || !hasChildren;
    const indentStr = ' '.repeat(depth * (indent / 2));

    // Attributes
    const attrParts = node.attributes
      ? Object.entries(node.attributes).map(([k, v]) => (
          <Text key={k}>
            <Text style={theme.xmlViewer.attributeName}> {k}</Text>
            <Text style={theme.xmlViewer.tag}>=</Text>
            <Text style={theme.xmlViewer.attributeValue}>"{v}"</Text>
          </Text>
        ))
      : null;

    if (selfClose && !hasComplexChildren) {
      const textContent = node.children?.find(c => c.type === 'text')?.content;
      if (textContent) {
        return (
          <View key={currentPath} style={{ paddingLeft: depth * indent }}>
            <Text style={theme.xmlViewer.tag}>
              {'<'}

              <Text style={theme.xmlViewer.tag}>{node.tag}</Text>
              {attrParts}
              <Text style={theme.xmlViewer.tag}>{'>'}</Text>
              <Text style={theme.xmlViewer.text}>{textContent}</Text>
              <Text style={theme.xmlViewer.tag}>{'</'}{node.tag}{'>'}</Text>
            </Text>
          </View>
        );
      }

      return (
        <View key={currentPath} style={{ paddingLeft: depth * indent }}>
          <Text style={theme.xmlViewer.tag}>
            {'<'}{node.tag}
            {attrParts}
            {' />'}
          </Text>
        </View>
      );
    }

    return (
      <View key={currentPath}>
        <TouchableOpacity
          onPress={() => hasComplexChildren && onToggle(currentPath)}
          activeOpacity={0.6}
          disabled={!hasComplexChildren}
          style={{ flexDirection: 'row', paddingLeft: depth * indent }}
        >
          {hasComplexChildren && (
            <Text style={{ fontSize: 10, color: theme.colors.textTertiary, width: 16, textAlign: 'center', marginRight: 4 }}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          )}
          <Text style={theme.xmlViewer.tag}>
            {'<'}{node.tag}
            {attrParts}
            {'>'}
          </Text>
        </TouchableOpacity>

        {(isExpanded || !hasComplexChildren) && (
          <View>
            {node.children?.map((child, idx) => (
              <XMLNodeRenderer
                key={`${currentPath}.${idx}`}
                node={child}
                depth={depth + 1}
                theme={theme}
                expandedPaths={expandedPaths}
                onToggle={onToggle}
                currentPath={`${currentPath}.${idx}`}
                indent={indent}
              />
            ))}
            <Text style={[theme.xmlViewer.tag, { paddingLeft: depth * indent }]}>
              {'</'}{node.tag}{'>'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return null;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const XMLRenderer: React.FC<XMLRendererProps> = ({
  xml,
  content,
  initialExpandDepth = 2,
  dark = false,
  theme: themeOverride,
  style,
  showCopyButton = true,
  testID,
  accessible,
}) => {
  const xmlValue = xml ?? content ?? '';
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const paths = new Set<string>();
    function expand(nodes: XMLNode[], path: string, depth: number) {
      if (depth >= initialExpandDepth) return;
      nodes.forEach((node, idx) => {
        if (node.type === 'element' && node.children?.some(c => c.type === 'element')) {
          const p = `${path}.${idx}`;
          paths.add(p);
          expand(node.children || [], p, depth + 1);
        }
      });
    }
    const parsed = parseXML(xmlValue);
    expand(parsed, 'root', 0);
    return paths;
  });

  const resolvedTheme = useMemo<NativeTheme>(() => {
    const base = dark ? darkNativeTheme : lightNativeTheme;
    if (!themeOverride) return base;
    return {
      ...base,
      colors: { ...base.colors, ...(themeOverride as any)?.colors },
      xmlViewer: { ...base.xmlViewer, ...(themeOverride as any)?.xmlViewer },
    };
  }, [dark, themeOverride]);

  const parsedNodes = useMemo(() => {
    try {
      return parseXML(xmlValue || '');
    } catch {
      return [{ type: 'text' as const, content: xmlValue || '' }];
    }
  }, [xmlValue]);

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

  const handleCopy = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(xmlValue);
      } else {
        await Share.share({ message: xmlValue });
      }
    } catch {
      // Clipboard not available
    }
  }, [xmlValue]);

  return (
    <View
      testID={testID || 'xml-renderer'}
      accessible={accessible !== false}
      accessibilityLabel="XML viewer"
      style={[resolvedTheme.xmlViewer.container, style as ViewStyle]}
    >
      {showCopyButton && (
        <TouchableOpacity
          onPress={handleCopy}
          style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: dark ? '#3a3a5e' : '#e0e0e0', alignSelf: 'flex-end', marginBottom: 8 }}
          activeOpacity={0.6}
        >
          <Text style={{ fontSize: 11, color: dark ? '#a0a0c0' : '#555' }}>Copy</Text>
        </TouchableOpacity>
      )}

      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {parsedNodes.map((node, idx) => (
          <XMLNodeRenderer
            key={`xml-${idx}`}
            node={node}
            depth={0}
            theme={resolvedTheme}
            expandedPaths={expandedPaths}
            onToggle={handleToggle}
            currentPath={`root.${idx}`}
            indent={resolvedTheme.xmlViewer.indent}
          />
        ))}
      </ScrollView>
    </View>
  );
};

XMLRenderer.displayName = 'XMLRenderer';

export default XMLRenderer;
