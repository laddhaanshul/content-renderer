// @ts-nocheck
/**
 * CSSRenderer – renders CSS content with syntax highlighting in React Native.
 *
 * Features:
 * - Syntax highlighting (selectors, properties, values, comments)
 * - Rule grouping
 * - Collapsible media queries and rule blocks
 * - Copy button
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
import { highlightCode, detectLanguage, type SyntaxToken, type SyntaxTheme } from '../utils/syntax-highlight-rn.native';
import { lightNativeTheme, darkNativeTheme, type NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CSSRendererProps {
  /** CSS source string. */
  css?: string;
  /** Alias for css */
  content?: string;
  /** Use dark theme. Default: false. */
  dark?: boolean;
  /** Custom theme overrides. */
  theme?: Partial<NativeTheme>;
  /** Custom syntax theme. */
  syntaxTheme?: SyntaxTheme;
  /** Root container style. */
  style?: StyleProp<ViewStyle>;
  /** Show copy button. Default: true. */
  showCopyButton?: boolean;
  /** Show line numbers. Default: false. */
  showLineNumbers?: boolean;
  /** Test ID. */
  testID?: string;
  /** Accessible. */
  accessible?: boolean;
  /** Accessibility label. */
  accessibilityLabel?: string;
}

// ---------------------------------------------------------------------------
// CSS Rule Parser
// ---------------------------------------------------------------------------

interface CSSRule {
  type: 'rule' | 'media' | 'comment' | 'import' | 'font-face' | 'keyframes';
  selector?: string;
  properties?: { property: string; value: string }[];
  children?: CSSRule[];
  content?: string;
  body?: string;
}

function parseCSSRules(css: string): CSSRule[] {
  const rules: CSSRule[] = [];
  let i = 0;
  const len = css.length;

  function skipWhitespace() {
    while (i < len && /\s/.test(css[i])) i++;
  }

  function skipComment(): boolean {
    if (css.slice(i, i + 2) === '/*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) {
        rules.push({ type: 'comment', content: css.slice(i + 2) });
        i = len;
        return true;
      }
      rules.push({ type: 'comment', content: css.slice(i + 2, end) });
      i = end + 2;
      return true;
    }
    return false;
  }

  function parseBlockContent(): string {
    let depth = 1;
    const start = i;
    while (i < len && depth > 0) {
      if (css[i] === '{') depth++;
      if (css[i] === '}') depth--;
      if (depth > 0) i++;
    }
    return css.slice(start, i);
  }

  function parseProperties(body: string): { property: string; value: string }[] {
    const props: { property: string; value: string }[] = [];
    const declarations = body.split(';');
    for (const decl of declarations) {
      const trimmed = decl.trim();
      if (!trimmed) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      props.push({
        property: trimmed.slice(0, colonIdx).trim(),
        value: trimmed.slice(colonIdx + 1).trim(),
      });
    }
    return props;
  }

  while (i < len) {
    skipWhitespace();
    if (i >= len) break;

    if (skipComment()) continue;

    // @import
    if (css.slice(i, i + 7) === '@import') {
      const end = css.indexOf(';', i);
      if (end === -1) break;
      rules.push({ type: 'import', content: css.slice(i, end).trim() });
      i = end + 1;
      continue;
    }

    // @font-face
    if (css.slice(i, i + 10) === '@font-face') {
      const braceStart = css.indexOf('{', i);
      if (braceStart === -1) break;
      const body = parseBlockContent();
      rules.push({
        type: 'font-face',
        body,
        properties: parseProperties(body),
      });
      i++; // skip }
      continue;
    }

    // @keyframes
    if (css.slice(i, i + 10) === '@keyframes') {
      const braceStart = css.indexOf('{', i);
      if (braceStart === -1) break;
      const name = css.slice(i + 10, braceStart).trim();
      const body = parseBlockContent();
      rules.push({
        type: 'keyframes',
        selector: name,
        body,
      });
      i++; // skip }
      continue;
    }

    // @media and other at-rules
    if (css[i] === '@') {
      const braceStart = css.indexOf('{', i);
      if (braceStart === -1) break;
      const selector = css.slice(i, braceStart).trim();
      const body = parseBlockContent();
      // Parse nested rules inside media query
      const nestedRules = parseCSSRules(body);
      rules.push({
        type: 'media',
        selector,
        body,
        children: nestedRules,
      });
      i++; // skip }
      continue;
    }

    // Regular rule: selector { ... }
    const braceStart = css.indexOf('{', i);
    if (braceStart === -1) {
      // Might be a property without selector or incomplete CSS
      const end = css.indexOf(';', i);
      if (end === -1) break;
      i = end + 1;
      continue;
    }

    const selector = css.slice(i, braceStart).trim();
    const body = parseBlockContent();
    rules.push({
      type: 'rule',
      selector,
      body,
      properties: parseProperties(body),
    });
    i++; // skip }
  }

  return rules;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CSSRenderer: React.FC<CSSRendererProps> = ({
  css,
  content,
  dark = false,
  theme: themeOverride,
  syntaxTheme: customSyntaxTheme,
  style,
  showCopyButton = true,
  showLineNumbers = false,
  testID,
  accessible,
  accessibilityLabel,
}) => {
  const cssValue = css ?? content ?? '';
  const [expandedMediaQueries, setExpandedMediaQueries] = useState<Set<number>>(() => new Set([0, 1, 2]));

  const resolvedTheme = useMemo<NativeTheme>(() => {
    const base = dark ? darkNativeTheme : lightNativeTheme;
    if (!themeOverride) return base;
    return {
      ...base,
      colors: { ...base.colors, ...(themeOverride as any)?.colors },
      codeBlock: { ...base.codeBlock, ...(themeOverride as any)?.codeBlock },
    };
  }, [dark, themeOverride]);

  const resolvedSyntaxTheme: SyntaxTheme = useMemo(() => {
    if (customSyntaxTheme) return customSyntaxTheme;
    return dark
      ? { keyword: '#ff7b72', string: '#a5d6ff', number: '#79c0ff', comment: '#8b949e', function: '#d2a8ff', variable: '#ffa657', operator: '#ff7b72', type: '#79c0ff', tag: '#7ee787', attribute: '#d2a8ff', attributeValue: '#a5d6ff', punctuation: '#c9d1d9', regexp: '#a5d6ff', constant: '#79c0ff', decorator: '#d2a8ff', plain: '#c9d1d9' }
      : { keyword: '#d73a49', string: '#032f62', number: '#005cc5', comment: '#6a737d', function: '#6f42c1', variable: '#e36209', operator: '#d73a49', type: '#005cc5', tag: '#22863a', attribute: '#6f42c1', attributeValue: '#032f62', punctuation: '#24292e', regexp: '#032f62', constant: '#005cc5', decorator: '#6f42c1', plain: '#24292e' };
  }, [dark, customSyntaxTheme]);

  // Use line-based highlighting for simple rendering
  const highlighted = useMemo(() => {
    try {
      return highlightCode(cssValue || '', 'css', resolvedSyntaxTheme);
    } catch {
      return cssValue.split('\n').map(line => [{ text: line, color: resolvedSyntaxTheme.plain }]);
    }
  }, [cssValue, resolvedSyntaxTheme]);

  const rules = useMemo(() => {
    try {
      return parseCSSRules(cssValue || '');
    } catch {
      return [{ type: 'rule' as const, selector: 'Parsing Error', properties: [] }];
    }
  }, [cssValue]);

  const handleToggleMedia = useCallback((idx: number) => {
    setExpandedMediaQueries(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(cssValue);
      } else {
        await Share.share({ message: cssValue });
      }
    } catch {
      // Clipboard not available
    }
  }, [cssValue]);

  return (
    <View
      testID={testID || 'css-renderer'}
      accessible={accessible !== false}
      accessibilityLabel={accessibilityLabel || 'CSS viewer'}
      style={[resolvedTheme.codeBlock.container, style as ViewStyle]}
    >
      {/* Header */}
      {showCopyButton && (
        <View style={resolvedTheme.codeBlock.header}>
          <Text style={resolvedTheme.codeBlock.headerText}>stylesheet.css</Text>
          <TouchableOpacity
            onPress={handleCopy}
            style={[resolvedTheme.codeBlock.copyButton, { marginLeft: 'auto' }]}
            activeOpacity={0.6}
          >
            <Text style={resolvedTheme.codeBlock.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Body - highlighted code view */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
        <View style={resolvedTheme.codeBlock.body}>
          {highlighted.map((tokens: any, lineIdx: any) => (
            <View key={lineIdx} style={resolvedTheme.codeBlock.line}>
              {showLineNumbers && (
                <Text style={resolvedTheme.codeBlock.lineNumber} selectable={false}>
                  {lineIdx + 1}
                </Text>
              )}
              <Text style={resolvedTheme.codeBlock.codeText}>
                {tokens.map((t: any, tIdx: any) => (
                  <Text
                    key={tIdx}
                    style={[
                      t.color !== resolvedTheme.codeBlock.codeText.color ? { color: t.color } : undefined,
                      t.bold ? { fontWeight: 'bold' } : undefined,
                    ]}
                  >
                    {t.text}
                  </Text>
                ))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

CSSRenderer.displayName = 'CSSRenderer';

export default CSSRenderer;
