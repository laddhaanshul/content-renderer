import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { detectContentType } from '@content-renderer/core';
import type { ContentType, BaseRendererProps, ParseError, ParseWarning } from '@content-renderer/core';
import { HTMLRenderer } from './HTMLRenderer';
import { CodeRenderer } from './CodeRenderer';
import { JSONRenderer } from './JSONRenderer';
import { PHPRenderer } from './PHPRenderer';
import { MarkdownRenderer } from './MarkdownRenderer';
import { XMLRenderer } from './XMLRenderer';
import { CSSRenderer } from './CSSRenderer';
import { ErrorBoundary } from './ErrorBoundary';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContentRendererProps extends Omit<BaseRendererProps, 'contentType'> {
  /** Explicit content type, or 'auto' to auto-detect from content */
  contentType?: ContentType | 'auto';
}

// ─── Default Fallbacks ───────────────────────────────────────────────────────

const DEFAULT_FALLBACK: React.ReactNode = (
  <div
    style={{
      padding: 16,
      color: '#999',
      border: '1px dashed #ccc',
      borderRadius: 4,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
    }}
  >
    Unable to render this content.
  </div>
);

const DEFAULT_LOADING: React.ReactNode = (
  <div
    style={{
      padding: 16,
      color: '#666',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
    }}
  >
    Loading content...
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ContentRenderer - Universal content renderer that auto-detects content type
 * and delegates to the appropriate sub-renderer.
 *
 * Features:
 * - Auto-detection of 10+ content types (HTML, JSON, XML, PHP, Markdown, CSS, JS, TS, YAML, plain text)
 * - Manual content type override via `contentType` prop
 * - Unified prop interface mapped to each sub-renderer
 * - Error boundary wrapping with custom fallback
 * - Accessible rendering with ARIA attributes
 * - Memoized for performance
 * - Loading state support
 * - Custom renderer/component overrides
 *
 * @example
 * // Auto-detect content type
 * <ContentRenderer content={someString} />
 *
 * @example
 * // Explicit content type
 * <ContentRenderer content={htmlString} contentType="html" sanitize />
 *
 * @example
 * // With custom fallback and error handling
 * <ContentRenderer
 *   content={content}
 *   onError={(err) => console.error(err)}
 *   fallback={<ErrorDisplay />}
 *   theme="dark"
 * />
 */
export const ContentRenderer: React.FC<ContentRendererProps> = React.memo(({
  content,
  contentType = 'auto',
  className,
  style,
  theme,
  sanitize = true,
  allowedTags,
  allowedAttributes,
  maxDepth,
  onError,
  onRender,
  fallback,
  loading,
  renderers,
  components,
  transform,
  linkHandler,
  imageHandler,
  codeBlockHandler,
  tableHandler,
  testID,
  accessible,
  accessibilityLabel,
}) => {
  const [detectedType, setDetectedType] = useState<ContentType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onRenderRef = useRef(onRender);
  const onErrorRef = useRef(onError);

  // Keep refs in sync without causing re-renders
  useEffect(() => {
    onRenderRef.current = onRender;
  }, [onRender]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Auto-detect content type when mode is 'auto'
  useEffect(() => {
    if (contentType === 'auto' && content) {
      try {
        const detected = detectContentType(content);
        setDetectedType(detected);
        setError(null);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        onErrorRef.current?.(err);
      } finally {
        setIsLoading(false);
      }
    } else if (contentType !== 'auto') {
      setDetectedType(contentType);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [content, contentType]);

  // Build memoized common props passed to sub-renderers
  const commonProps = useMemo(() => ({
    style,
    sanitize,
    allowedTags,
    allowedAttributes,
    maxDepth,
    onError,
    fallback: fallback || DEFAULT_FALLBACK,
    renderers,
    components,
    transform,
    linkHandler,
    imageHandler,
    testID,
    accessible,
    accessibilityLabel,
  }), [
    style, sanitize, allowedTags, allowedAttributes, maxDepth,
    onError, fallback, renderers, components, transform,
    linkHandler, imageHandler, testID, accessible, accessibilityLabel,
  ]);

  // Determine the rendered content based on type
  const renderedContent = useMemo(() => {
    if (!content || !detectedType) return null;

    switch (detectedType) {
      case 'html':
      case 'html5':
        return (
          <HTMLRenderer
            html={content}
            components={commonProps.components as any}
            onLinkClick={(href, e) => commonProps.linkHandler?.(href, e)}
            sanitize={commonProps.sanitize}
            fallback={commonProps.fallback}
            transform={commonProps.transform as any}
            testId={commonProps.testID}
            style={commonProps.style as any}
            className={className}
          />
        );

      case 'json':
        return (
          <JSONRenderer
            json={content}
            data={content}
            theme={(theme as any)?.codeBlock ? 'dark' : 'light'}
            showCopyButton
            searchable
            style={commonProps.style as any}
            className={className}
            testID={commonProps.testID}
          />
        );

      case 'markdown':
        return (
          <MarkdownRenderer
            content={content}
            markdown={content}
            sanitize={commonProps.sanitize}
            linkHandler={commonProps.linkHandler}
            imageHandler={commonProps.imageHandler}
            components={commonProps.components}
            renderers={commonProps.renderers}
            onError={commonProps.onError}
            fallback={commonProps.fallback}
            testID={commonProps.testID}
            accessible={commonProps.accessible}
            accessibilityLabel={commonProps.accessibilityLabel}
          />
        );

      case 'php':
        return (
          <PHPRenderer
            content={content}
            code={content}
            showLineNumbers
            theme={(theme as any)?.codeBlock ? 'monokai' : 'light'}
            onError={commonProps.onError}
            fallback={commonProps.fallback}
            testID={commonProps.testID}
            className={className}
            style={commonProps.style as any}
            accessible={commonProps.accessible}
            accessibilityLabel={commonProps.accessibilityLabel}
          />
        );

      case 'xml':
        return (
          <XMLRenderer
            content={content}
            onError={commonProps.onError}
            fallback={commonProps.fallback}
            testID={commonProps.testID}
            className={className}
            style={commonProps.style as any}
            accessible={commonProps.accessible}
            accessibilityLabel={commonProps.accessibilityLabel}
          />
        );

      case 'css':
        return (
          <CSSRenderer
            content={content}
            onError={commonProps.onError}
            fallback={commonProps.fallback}
            testID={commonProps.testID}
            className={className}
            style={commonProps.style as any}
            accessible={commonProps.accessible}
            accessibilityLabel={commonProps.accessibilityLabel}
          />
        );

      case 'code':
      case 'javascript':
      case 'typescript':
      case 'yaml':
        return (
          <CodeRenderer
            code={content}
            language={detectedType === 'code' ? undefined : detectedType}
            showLineNumbers
            showCopyButton
            theme={(theme as any)?.codeBlock ? 'monokai' : 'github'}
            testID={commonProps.testID}
            className={className}
            style={commonProps.style as any}
          />
        );

      case 'text':
      default:
        return (
          <CodeRenderer
            code={content}
            language="text"
            showLineNumbers={false}
            showCopyButton
            theme="light"
            testID={commonProps.testID}
            className={className}
            style={commonProps.style as any}
          />
        );
    }
  }, [content, detectedType, commonProps, theme, className]);

  // Fire onRender callback after content is rendered
  useEffect(() => {
    if (renderedContent && onRenderRef.current) {
      onRenderRef.current();
    }
  }, [renderedContent]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={className}
        style={style}
        data-testid={testID || 'content-renderer-loading'}
        role={accessible !== false ? 'status' : undefined}
        aria-label={accessibilityLabel}
        aria-busy="true"
      >
        {loading || DEFAULT_LOADING}
      </div>
    );
  }

  // Error state from detection
  if (error) {
    const fallbackNode = fallback || DEFAULT_FALLBACK;
    return (
      <div
        className={className}
        style={style}
        data-testid={testID || 'content-renderer-error'}
        role={accessible !== false ? 'alert' : undefined}
        aria-label={accessibilityLabel || 'Content rendering error'}
      >
        {fallbackNode}
      </div>
    );
  }

  // Empty content
  if (!content) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={fallback || DEFAULT_FALLBACK}
      onError={(err) => {
        onErrorRef.current?.(err);
      }}
    >
      <div
        className={className}
        style={style}
        data-testid={testID || 'content-renderer'}
        role={accessible !== false ? 'region' : undefined}
        aria-label={accessibilityLabel || `Content renderer: ${detectedType || 'auto-detected'}`}
      >
        {renderedContent}
      </div>
    </ErrorBoundary>
  );
});

ContentRenderer.displayName = 'ContentRenderer';

export default ContentRenderer;
