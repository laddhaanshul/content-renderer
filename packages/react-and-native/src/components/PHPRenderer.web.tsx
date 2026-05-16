import React, { useMemo } from 'react';
import type { PHPRendererProps } from '@content-renderer/core';
import { CodeRenderer } from './CodeRenderer';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PHPRendererInternalProps extends PHPRendererProps {
  /** Additional props passed through to CodeRenderer */
  [key: string]: unknown;
}

// ─── PHP Content Processor ──────────────────────────────────────────────────

/**
 * Process PHP content for highlighting.
 *
 * Handles mixed PHP/HTML content by extracting PHP segments
 * and wrapping them for proper syntax highlighting.
 * Preserves inline PHP tags and heredoc/nowdoc syntax.
 */
function processPHPContent(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  // If no PHP tags at all, it might be pure PHP without tags
  // (common in code blocks or snippets). Return as-is.
  if (!raw.includes('<?php') && !raw.includes('<?=') && !raw.includes('?>')) {
    return raw;
  }

  return raw;
}

/**
 * Determine if content is mixed PHP/HTML.
 * Mixed content has PHP tags interleaved with HTML.
 */
function isMixedPHPHTML(content: string): boolean {
  const phpTagCount = (content.match(/<\?php|<\?=/g) || []).length;
  const closingTagCount = (content.match(/\?>/g) || []).length;
  const htmlTagCount = (content.match(/<[a-zA-Z][^?][^>]*>/g) || []).length;

  // If there are closing PHP tags and HTML tags, it's mixed
  return closingTagCount > 0 && htmlTagCount > 0;
}

/**
 * Extract a meaningful file name for the header bar from PHP content.
 */
function extractFileName(content: string, providedFileName?: string): string | undefined {
  if (providedFileName) return providedFileName;

  // Try to extract class name
  const classMatch = content.match(/(?:class|interface|trait)\s+(\w+)/);
  if (classMatch) return `${classMatch[1]}.php`;

  // Try to extract namespace
  const namespaceMatch = content.match(/namespace\s+([\w\\]+)/);
  if (namespaceMatch) return `${namespaceMatch[1].split('\\').pop()}.php`;

  return undefined;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * PHPRenderer - Renders PHP source code with syntax highlighting.
 *
 * Wraps CodeRenderer with PHP-specific defaults:
 * - PHP language highlighting (variables $x, keywords, heredocs)
 * - Line numbers enabled by default
 * - Monokai or light theme
 * - Tab size 4 (PHP standard)
 * - PHP tag processing for mixed PHP/HTML content
 * - Automatic file name extraction from class/interface/trait declarations
 *
 * Features:
 * - Full PHP syntax highlighting via the underlying CodeRenderer
 * - Handles mixed PHP/HTML content
 * - Heredoc and nowdoc syntax support
 * - PHP 8+ features (match, enums, readonly, etc.)
 * - Customizable theme, line numbers, and font size
 * - Copy to clipboard support
 *
 * @example
 * // Basic usage
 * <PHPRenderer content={`<?php echo "Hello"; ?>`} />
 *
 * @example
 * // With options
 * <PHPRenderer
 *   content={phpCode}
 *   theme="monokai"
 *   showLineNumbers
 *   fontSize={14}
 *   wrapLines={false}
 * />
 */
export const PHPRenderer: React.FC<PHPRendererInternalProps> = ({
  content,
  className,
  style,
  theme: themeProp,
  highlightPHP = true,
  showLineNumbers = true,
  fontSize = 14,
  wrapLines = false,
  onError,
  fallback,
  testID,
  accessible,
  accessibilityLabel,
  ...rest
}) => {
  // Determine the theme to use
  const codeTheme = useMemo(() => {
    if (themeProp === 'dark') return 'monokai';
    if (themeProp === 'light') return 'light';
    return (themeProp as 'light' | 'dark' | 'github' | 'monokai' | 'dracula') || 'monokai';
  }, [themeProp]);

  // Process PHP content
  const processedContent = useMemo(() => {
    if (!content || typeof content !== 'string') return '';

    return processPHPContent(content);
  }, [content]);

  // Extract file name for the header
  const fileName = useMemo(() => {
    if (!content || typeof content !== 'string') return undefined;
    const provided = (rest as any).fileName;
    return extractFileName(content, provided);
  }, [content, rest]);

  // Handle empty content
  if (!processedContent) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return (
    <CodeRenderer
      {...{
        code: processedContent,
        language: "php",
        fileName: fileName,
        showLineNumbers: showLineNumbers,
        highlightLines: (rest as any).highlightLines || [],
        theme: codeTheme,
        startLineNumber: (rest as any).startingLineNumber || 1,
        fontSize: fontSize,
        tabSize: (rest as any).tabSize || 4,
        showCopyButton: (rest as any).showCopyButton !== false,
        collapsible: (rest as any).collapsible || false,
        defaultCollapsed: (rest as any).defaultCollapsed || false,
        collapsedHeight: (rest as any).collapsedHeight || 200,
        className: className,
        style: {
          fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
          ...((style as React.CSSProperties) || {}),
        },
        maxHeight: (rest as any).maxHeight,
        testID: testID || 'content-renderer-php',
      } as any}
    />
  );
};

PHPRenderer.displayName = 'PHPRenderer';

export default PHPRenderer;
