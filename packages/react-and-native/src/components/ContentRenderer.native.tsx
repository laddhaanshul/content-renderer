/**
 * ContentRenderer – universal content rendering component for React Native.
 *
 * Auto-detects the content type and delegates to the appropriate sub-renderer:
 * - HTML → HTMLRenderer
 * - Markdown → MarkdownRenderer
 * - JSON → JSONRenderer
 * - XML → XMLRenderer
 * - CSS → CSSRenderer
 * - PHP/Code → CodeRenderer
 * - Plain text → Text
 *
 * Wraps everything in an ErrorBoundary for safe rendering.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  type ViewStyle,
  type StyleProp,
} from 'react-native';

import ErrorBoundary from './ErrorBoundary';
import HTMLRenderer from './HTMLRenderer';
import CodeRenderer from './CodeRenderer';
import JSONRenderer from './JSONRenderer';
import MarkdownRenderer from './MarkdownRenderer';
import XMLRenderer from './XMLRenderer';
import CSSRenderer from './CSSRenderer';
import PHPRenderer from './PHPRenderer';
import { lightNativeTheme, darkNativeTheme, type NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContentType = 'html' | 'html5' | 'xhtml' | 'markdown' | 'json' | 'xml' | 'css' | 'php'
  | 'javascript' | 'typescript' | 'python' | 'java' | 'code' | 'text' | 'auto'
  | 'jsx' | 'tsx' | 'sql' | 'bash' | 'yaml' | 'go' | 'rust' | 'c' | 'cpp';

export interface ContentRendererProps {
  /** Content string to render. */
  content: string;
  /** Explicit content type. Use 'auto' for auto-detection. */
  contentType?: ContentType;
  /** Use dark theme. Default: false. */
  dark?: boolean;
  /** Custom native theme overrides. */
  theme?: Partial<NativeTheme>;
  /** Root container style. */
  style?: StyleProp<ViewStyle>;
  /** Called when rendering fails. */
  onError?: (error: Error) => void;
  /** Fallback to render on error. */
  fallback?: React.ReactNode;
  /** Loading indicator to show. */
  loading?: React.ReactNode;
  /** Test ID. */
  testID?: string;
  /** Accessible. */
  accessible?: boolean;
  /** Accessibility label. */
  accessibilityLabel?: string;
  /** Link press handler (for HTML & Markdown). */
  onLinkPress?: (url: string) => void;
  /** Show line numbers for code blocks. Default: true. */
  showLineNumbers?: boolean;
  /** Max image width. Default: 300. */
  maxImageWidth?: number;
}

// ---------------------------------------------------------------------------
// Content type detection
// ---------------------------------------------------------------------------

/**
 * Detect the content type from a string of content.
 * Uses heuristics: looks for common patterns in the first few hundred characters.
 */
export function detectContentType(content: string): ContentType {
  if (!content || typeof content !== 'string') return 'text';
  const trimmed = content.trim();

  // HTML: starts with < and contains HTML-like tags
  if (/^\s*<(!doctype|html|head|body|div|span|p|table|ul|ol|li|a|img|form|h[1-6]|section|article|header|footer|nav)/i.test(trimmed)) {
    return 'html';
  }

  // XML: starts with <?xml or < and has XML-like structure
  if (/^\s*<\?xml/i.test(trimmed) || (trimmed.startsWith('<') && !/^\s*<(!doctype|html)/i.test(trimmed) && /<\/[\w:-]+>\s*$/.test(trimmed))) {
    return 'xml';
  }

  // JSON: starts with { or [
  if (/^\s*[{[]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Could still be JSON with trailing content, check more carefully
      const firstChar = trimmed[0];
      const lastChar = trimmed[trimmed.length - 1];
      if ((firstChar === '{' && lastChar === '}') || (firstChar === '[' && lastChar === ']')) {
        // Attempt partial parse
        try {
          // Try parsing with lenient mode
          JSON.parse(trimmed.replace(/,\s*([}\]])/g, '$1'));
          return 'json';
        } catch {
          // Not JSON
        }
      }
    }
  }

  // Markdown: common patterns
  const mdPatterns = [
    /^#{1,6}\s/m,           // headings
    /^[-*+]\s/m,            // unordered list
    /^\d+\.\s/m,            // ordered list
    /^>\s/m,                // blockquote
    /^```/m,                // fenced code block
    /\[.+\]\(.+\)/,        // links
    /^---\s*$/m,            // horizontal rule / YAML front matter
    /^\|.+\|$/m,            // table
  ];
  let mdScore = 0;
  for (const pattern of mdPatterns) {
    if (pattern.test(trimmed.slice(0, 500))) mdScore++;
  }
  if (mdScore >= 2) return 'markdown';

  // PHP: starts with <?php
  if (/^\s*<\?php/i.test(trimmed)) {
    return 'php';
  }

  // CSS: patterns like selector { property: value; }
  if (/^[\w\s.#\[\]:,>*+~]+\s*\{[^}]*:\s*[^;]+;/m.test(trimmed.slice(0, 300))) {
    return 'css';
  }

  // SQL
  if (/^\s*(select|insert|update|delete|create|drop|alter|with)\s/i.test(trimmed)) {
    return 'sql';
  }

  // YAML
  if (/^---\s*\n[\w]/.test(trimmed) || /^\w+:\s*\n\s{2,}\w+:/m.test(trimmed.slice(0, 300))) {
    return 'yaml';
  }

  // Code detection by shebang or language-specific patterns
  if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh') || trimmed.startsWith('#!/usr/bin/env bash')) {
    return 'bash';
  }
  if (trimmed.startsWith('#!/usr/bin/env python')) {
    return 'python';
  }

  // JavaScript / TypeScript by common keywords
  const jsKeywords = ['function ', 'const ', 'let ', 'var ', 'import ', 'export ', 'class ', '=>', 'async ', 'await '];
  const tsKeywords = [': string', ': number', ': boolean', 'interface ', 'type ', 'enum ', '<T>', 'as ', 'readonly '];

  let jsScore = 0;
  for (const kw of jsKeywords) {
    if (trimmed.includes(kw)) jsScore++;
  }
  if (/^\s*(import |export |const |let |var |function |class |\/\/)/m.test(trimmed.slice(0, 100))) jsScore += 2;
  if (jsScore >= 3) return 'javascript';

  let tsScore = 0;
  for (const kw of tsKeywords) {
    if (trimmed.includes(kw)) tsScore++;
  }
  if (tsScore >= 2) return 'typescript';

  // Default to text
  return 'text';
}

// ---------------------------------------------------------------------------
// Map content type → language hint for CodeRenderer
// ---------------------------------------------------------------------------

function getLanguageForCodeType(contentType: ContentType): string | undefined {
  const map: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    python: 'python',
    java: 'java',
    sql: 'sql',
    bash: 'bash',
    yaml: 'yaml',
    go: 'go',
    rust: 'rust',
    c: 'c',
    cpp: 'cpp',
    php: 'php',
    code: 'plaintext',
  };
  return map[contentType];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  contentType: contentTypeProp = 'auto',
  dark = false,
  theme: themeOverride,
  style,
  onError,
  fallback,
  loading,
  testID,
  accessible,
  accessibilityLabel,
  onLinkPress,
  showLineNumbers = true,
  maxImageWidth = 300,
}) => {
  const resolvedTheme = useMemo<NativeTheme>(() => {
    const base = dark ? darkNativeTheme : lightNativeTheme;
    if (!themeOverride) return base;
    // Shallow merge
    return {
      ...base,
      colors: { ...base.colors, ...(themeOverride as any)?.colors },
      typography: { ...base.typography, ...(themeOverride as any)?.typography },
      spacing: { ...base.spacing, ...(themeOverride as any)?.spacing },
      codeBlock: { ...base.codeBlock, ...(themeOverride as any)?.codeBlock },
    };
  }, [dark, themeOverride]);


  const detectedType = useMemo<ContentType>(() => {
    if (contentTypeProp === 'auto') {
      return detectContentType(content);
    }
    return contentTypeProp;
  }, [content, contentTypeProp]);

  const handleError = useCallback((error: Error) => {
    if (onError) onError(error);
    if (__DEV__) {
      console.error(`[ContentRenderer] Error rendering ${detectedType}:`, error);
    }
  }, [onError, detectedType]);

  const renderContent = (): React.ReactNode => {
    // Handle empty content
    if (!content || !content.trim()) {
      return null;
    }

    switch (detectedType) {
      case 'html':
      case 'html5':
      case 'xhtml':
        return (

          <HTMLRenderer
            html={content}
            onLinkPress={onLinkPress}
            theme={resolvedTheme as any}
            maxDepth={50}
            testID={`${testID}-html`}
          />
        );

      case 'markdown':
        return (
          <MarkdownRenderer
            markdown={content}
            content={content}
            onLinkPress={onLinkPress}
            dark={dark}
            theme={resolvedTheme as any}
            maxImageWidth={maxImageWidth}
            testID={`${testID}-markdown`}
          />
        );

      case 'json': {
        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch {
          // If parse fails, render as code
          return (
            <CodeRenderer
              code={content}
              language="json"
              dark={dark}
              theme={resolvedTheme as any}
              showLineNumbers={showLineNumbers}
              testID={`${testID}-json-code`}
            />
          );
        }
        return (
          <JSONRenderer
            json={parsed}
            dark={dark}
            theme={resolvedTheme as any}
            showCopyButton={true}
            searchable={true}
            testID={`${testID}-json`}
          />
        );
      }

      case 'xml':
        return (
          <XMLRenderer
            xml={content}
            dark={dark}
            theme={resolvedTheme as any}
            testID={`${testID}-xml`}
          />
        );

      case 'css':
        return (
          <CSSRenderer
            css={content}
            dark={dark}
            theme={resolvedTheme as any}
            showCopyButton={true}
            showLineNumbers={showLineNumbers}
            testID={`${testID}-css`}
          />
        );

      case 'php':
        return (
          <PHPRenderer
            code={content}
            content={content}
            language="php"
            dark={dark}
            theme={resolvedTheme as any}
            showLineNumbers={showLineNumbers}
            testID={`${testID}-php`}
          />
        );


      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
      case 'python':
      case 'java':
      case 'sql':
      case 'bash':
      case 'yaml':
      case 'go':
      case 'rust':
      case 'c':
      case 'cpp':
      case 'code':
        return (
          <CodeRenderer
            code={content}
            language={getLanguageForCodeType(detectedType)}
            dark={dark}
            theme={resolvedTheme as any}
            showLineNumbers={showLineNumbers}
            testID={`${testID}-code`}
          />
        );

      case 'text':
      default:
        return (
          <ScrollView testID={`${testID}-text`} nestedScrollEnabled>
            <Text style={[resolvedTheme.typography.body, { padding: 4 }]}>
              {content}
            </Text>
          </ScrollView>
        );
    }
  };

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      testID={`${testID}-error-boundary`}
    >
      <View
        testID={testID || 'content-renderer'}
        accessible={accessible !== false}
        accessibilityLabel={accessibilityLabel || `${detectedType} content`}
        style={[style as ViewStyle]}
      >
        {renderContent()}
      </View>
    </ErrorBoundary>
  );
};

ContentRenderer.displayName = 'ContentRenderer';

export default ContentRenderer;
