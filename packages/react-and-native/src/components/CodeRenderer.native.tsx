/**
 * CodeRenderer – renders source code with syntax highlighting in React Native.
 *
 * Features:
 * - Syntax highlighting for 15+ languages using tokenizer-based approach
 * - Line numbers (toggleable)
 * - Copy-to-clipboard button
 * - Light / dark themes
 * - Word wrap toggle
 * - File name header
 * - Monospace font rendering
 * - Custom theme support
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import {
  highlightCode,
  detectLanguage,
  LIGHT_SYNTAX_THEME,
  DARK_SYNTAX_THEME,
  type SyntaxTheme,
  type SyntaxToken,
} from '../utils/syntax-highlight-rn.native';
import { lightNativeTheme, darkNativeTheme, type NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CodeRendererProps {
  /** Source code string. */
  code: string;
  /** Language identifier (e.g. "js", "python", "html"). Auto-detected if omitted. */
  language?: string;
  /** Display filename in header. */
  fileName?: string;
  /** Show line numbers. Default: true. */
  showLineNumbers?: boolean;
  /** Enable word wrap. Default: false. */
  wrapLines?: boolean;
  /** Show the copy-to-clipboard button. Default: true. */
  showCopyButton?: boolean;
  /** Starting line number. Default: 1. */
  startLineNumber?: number;
  /** Highlight specific line numbers. */
  highlightLines?: number[];
  /** Maximum height before scrolling. Undefined = no max. */
  maxHeight?: number;
  /** Use dark theme. Default: false. */
  dark?: boolean;
  /** Custom syntax theme (overrides dark/light). */
  syntaxTheme?: SyntaxTheme;
  /** Custom native theme overrides. */
  theme?: Partial<NativeTheme>;
  /** Root container style. */
  style?: StyleProp<ViewStyle>;
  /** Code text style override. */
  codeStyle?: StyleProp<TextStyle>;
  /** Line number style override. */
  lineNumberStyle?: StyleProp<TextStyle>;
  /** Test ID. */
  testID?: string;
  /** Accessible flag. */
  accessible?: boolean;
  /** Accessibility label. */
  accessibilityLabel?: string;
}

// ---------------------------------------------------------------------------
// Clipboard helper
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && (globalThis as any).Clipboard?.setString) {
      (globalThis as any).Clipboard.setString(text);
      return true;
    }
    if (Platform.OS === 'ios' && (globalThis as any).Clipboard?.setString) {
      (globalThis as any).Clipboard.setString(text);
      return true;
    }
    // Fallback: use Share API
    await Share.share({ message: text });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Token rendering
// ---------------------------------------------------------------------------

function renderTokenRow(
  tokens: SyntaxToken[],
  textStyle: TextStyle,
): React.ReactNode {
  if (tokens.length === 0) return null;

  // If single token, render directly
  if (tokens.length === 1) {
    const t = tokens[0];
    return (
      <Text
        key={0}
        style={[
          textStyle,
          { color: t.color },
          t.bold ? { fontWeight: 'bold' } : undefined,
          t.italic ? { fontStyle: 'italic' } : undefined,
        ]}
      >
        {t.text}
      </Text>
    );
  }

  // Multiple tokens → nested Text elements
  return tokens.map((t, idx) => (
    <Text
      key={idx}
      style={[
        t.color !== textStyle.color ? { color: t.color } : undefined,
        t.bold ? { fontWeight: 'bold' } : undefined,
        t.italic ? { fontStyle: 'italic' } : undefined,
      ]}
    >
      {t.text}
    </Text>
  ));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CodeRenderer: React.FC<CodeRendererProps> = ({
  code,
  language: languageProp,
  fileName,
  showLineNumbers = true,
  wrapLines = false,
  showCopyButton = true,
  startLineNumber = 1,
  highlightLines,
  maxHeight,
  dark = false,
  syntaxTheme: customSyntaxTheme,
  theme: themeOverride,
  style,
  codeStyle,
  lineNumberStyle,
  testID,
  accessible,
  accessibilityLabel,
}) => {
  const [copied, setCopied] = useState(false);

  const resolvedTheme = useMemo<NativeTheme>(() => {
    const base = dark ? darkNativeTheme : lightNativeTheme;
    if (!themeOverride) return base;
    return {
      ...base,
      colors: { ...base.colors, ...(themeOverride as any)?.colors },
      typography: { ...base.typography, ...(themeOverride as any)?.typography },
      codeBlock: { ...base.codeBlock, ...(themeOverride as any)?.codeBlock },
    };
  }, [dark, themeOverride]);

  const resolvedSyntaxTheme = useMemo<SyntaxTheme>(() => {
    if (customSyntaxTheme) return customSyntaxTheme;
    return dark ? DARK_SYNTAX_THEME : LIGHT_SYNTAX_THEME;
  }, [dark, customSyntaxTheme]);

  const lang = useMemo(() => {
    if (!languageProp) {
      // Try to detect from fileName
      if (fileName) {
        const ext = fileName.split('.').pop() || '';
        return detectLanguage(ext);
      }
      return 'plaintext';
    }
    return detectLanguage(languageProp);
  }, [languageProp, fileName]);

  const highlighted = useMemo(() => {
    try {
      return highlightCode(code || '', lang, resolvedSyntaxTheme);
    } catch {
      // Fallback: plain text
      return code.split('\n').map(line => [{ text: line, color: resolvedSyntaxTheme.plain }]);
    }
  }, [code, lang, resolvedSyntaxTheme]);

  const highlightSet = useMemo(() => {
    if (!highlightLines) return null;
    return new Set(highlightLines);
  }, [highlightLines]);

  const lines = highlighted;
  const lineCount = lines.length;
  const lineNumberWidth = useMemo(() => {
    return Math.max(String(startLineNumber + lineCount - 1).length * 8 + 12, 32);
  }, [startLineNumber, lineCount]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code || '');
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const baseCodeTextStyle: TextStyle = {
    fontSize: 13,
    fontFamily: resolvedTheme.typography.monoFontFamily,
    lineHeight: 20,
    color: resolvedTheme.codeBlock.codeText.color,
    ...(codeStyle as TextStyle || {}),
  };

  const baseLineNumberStyle: TextStyle = {
    fontSize: 13,
    fontFamily: resolvedTheme.typography.monoFontFamily,
    color: resolvedTheme.codeBlock.lineNumber.color,
    width: lineNumberWidth,
    textAlign: 'right' as any,
    marginRight: 12,
    ...(lineNumberStyle as TextStyle || {}),
  };

  const showHeader = fileName || showCopyButton;

  return (
    <View
      testID={testID || 'code-renderer'}
      accessible={accessible !== false}
      accessibilityLabel={accessibilityLabel || `Code block${fileName ? `: ${fileName}` : ''}`}
      style={[
        resolvedTheme.codeBlock.container,
        style as ViewStyle,
      ]}
    >
      {/* Header */}
      {showHeader && (
        <View style={resolvedTheme.codeBlock.header}>
          {fileName && (
            <Text style={resolvedTheme.codeBlock.headerText} numberOfLines={1}>
              {fileName}
            </Text>
          )}
          {showCopyButton && (
            <TouchableOpacity
              style={[resolvedTheme.codeBlock.copyButton, { marginLeft: 'auto' }]}
              onPress={handleCopy}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Copied!' : 'Copy code'}
            >
              <Text style={resolvedTheme.codeBlock.copyButtonText}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Code body */}
      <ScrollView
        horizontal={!wrapLines}
        showsHorizontalScrollIndicator={false}
        style={[resolvedTheme.codeBlock.scrollContainer, maxHeight ? { maxHeight } : undefined]}
        nestedScrollEnabled
      >
        <View style={resolvedTheme.codeBlock.body}>
          {lines.map((tokens: any, lineIdx: any) => {
            const lineNum = startLineNumber + lineIdx;
            const isHighlighted = highlightSet?.has(lineNum);

            return (
              <View
                key={lineIdx}
                style={[
                  resolvedTheme.codeBlock.line,
                  isHighlighted ? { backgroundColor: resolvedTheme.colors.selection } : undefined,
                ]}
              >
                {showLineNumbers && (
                  <Text
                    style={[
                      baseLineNumberStyle,
                      isHighlighted ? { color: resolvedTheme.colors.text } : undefined,
                    ]}
                    selectable={false}
                  >
                    {lineNum}
                  </Text>
                )}
                <Text style={baseCodeTextStyle}>
                  {renderTokenRow(tokens, baseCodeTextStyle)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;
