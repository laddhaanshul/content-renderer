import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useContentService } from '@content-renderer/core';
import type {
  ContentServiceRendererProps,
  ContentServiceError,
  ContentServiceConfig,
} from '@content-renderer/core';
import { ContentRenderer } from './ContentRenderer';

// ─── Default UI States ──────────────────────────────────────────────────────

const DEFAULT_LOADING: React.ReactNode = (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      color: '#666',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
    }}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: 8, animation: 'spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    Loading content...
  </div>
);

const DEFAULT_ERROR_RENDERER = (error: ContentServiceError, retry: () => void) => (
  <div
    role="alert"
    style={{
      padding: 16,
      color: '#dc3545',
      border: '1px solid #f5c6cb',
      borderRadius: 4,
      backgroundColor: '#f8d7da',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
    }}
  >
    <div style={{ fontWeight: 600, marginBottom: 8 }}>
      Failed to load content
    </div>
    <div style={{ marginBottom: 8, opacity: 0.8 }}>
      {error.message}
      {error.status && (
        <span> (HTTP {error.status})</span>
      )}
    </div>
    <button
      onClick={retry}
      style={{
        padding: '6px 12px',
        border: '1px solid #dc3545',
        borderRadius: 4,
        backgroundColor: 'white',
        color: '#dc3545',
        cursor: 'pointer',
        fontSize: 13,
      }}
    >
      Retry
    </button>
  </div>
);

// ─── Keyframe injection for spinner ──────────────────────────────────────────

const STYLE_ID = 'content-service-renderer-styles';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * ContentServiceRenderer — Fetches content from a URL and renders it.
 *
 * Handles loading states (with configurable delay + skeleton), error states
 * (with retry), and delegates the actual rendering to `ContentRenderer` once
 * content is available. Supports debounced refetching via `fetchKey`.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ContentServiceRenderer url="/api/page" />
 *
 * // AEM content
 * <ContentServiceRenderer
 *   url="https://example.com/content/jcr:content"
 *   config={{ extractStrategy: 'aem', credentials: 'include' }}
 * />
 *
 * // Headless CMS
 * <ContentServiceRenderer
 *   url="/api/posts/1"
 *   config={{ extractStrategy: 'headless-cms', contentField: 'content' }}
 *   fetchKey={postId}
 * />
 * ```
 */
export const ContentServiceRenderer: React.FC<ContentServiceRendererProps> = React.memo(({
  url,
  config,
  loading,
  errorRenderer,
  fallback,
  fetchOnMount = true,
  loadingDelay = 200,
  skeleton,
  onLoad,
  onLoadError,
  fetchKey,
  fetchDebounce = 0,
  className,
  style,
  sanitize = true,
  allowedTags,
  allowedAttributes,
  maxDepth,
  onError,
  onRender,
  components,
  renderers,
  transform,
  linkHandler,
  imageHandler,
  testID,
  accessible,
  accessibilityLabel,
  ...rest
}) => {
  // Inject animation styles on mount
  useEffect(() => { injectStyles(); }, []);

  // Track whether we've waited past the loading delay
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build the full config for the hook
  const serviceConfig = useMemo<ContentServiceConfig>(() => ({
    url,
    ...config,
    onSuccess: (result) => {
      onLoad?.(result);
      config?.onSuccess?.(result);
    },
    onError: (err) => {
      onLoadError?.(err);
      config?.onError?.(err);
    },
  }), [url, config, onLoad, onLoadError]);

  // Use the content service hook
  const {
    result,
    content,
    contentType,
    parsed,
    isLoading,
    isError,
    error,
    isFetched,
    fetchContent,
    retry,
    abort,
  } = useContentService(serviceConfig);

  // Handle fetchOnMount
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (fetchOnMount && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchContent();
    }
  }, [fetchOnMount, fetchContent]);

  // Refetch when fetchKey changes (with optional debounce)
  const prevFetchKeyRef = useRef(fetchKey);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevFetchKeyRef.current !== fetchKey && fetchKey !== undefined) {
      prevFetchKeyRef.current = fetchKey;

      if (fetchDebounce > 0) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          fetchContent();
        }, fetchDebounce);
      } else {
        fetchContent();
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchKey, fetchDebounce, fetchContent]);

  // Manage loading delay / skeleton display
  useEffect(() => {
    if (isLoading) {
      setShowLoading(false);
      loadingTimerRef.current = setTimeout(() => {
        setShowLoading(true);
      }, loadingDelay);
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [isLoading, loadingDelay]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  // ─── Render: Loading state ─────────────────────────────────────────────
  if (isLoading) {
    if (!showLoading && skeleton) {
      return (
        <div
          className={className}
          style={style}
          data-testid={testID || 'content-service-renderer-skeleton'}
          role={accessible !== false ? 'status' : undefined}
          aria-label={accessibilityLabel || 'Loading content'}
          aria-busy="true"
        >
          {skeleton}
        </div>
      );
    }

    if (showLoading) {
      return (
        <div
          className={className}
          style={style}
          data-testid={testID || 'content-service-renderer-loading'}
          role={accessible !== false ? 'status' : undefined}
          aria-label={accessibilityLabel || 'Loading content'}
          aria-busy="true"
        >
          {loading || DEFAULT_LOADING}
        </div>
      );
    }

    // Before loadingDelay, render nothing (or skeleton)
    return skeleton ? (
      <div
        className={className}
        style={style}
        data-testid={testID || 'content-service-renderer-skeleton'}
        role={accessible !== false ? 'status' : undefined}
        aria-label={accessibilityLabel || 'Loading content'}
        aria-busy="true"
      >
        {skeleton}
      </div>
    ) : null;
  }

  // ─── Render: Error state ──────────────────────────────────────────────
  if (isError && error) {
    const errorNode = errorRenderer
      ? errorRenderer(error, handleRetry)
      : DEFAULT_ERROR_RENDERER(error, handleRetry);

    return (
      <div
        className={className}
        style={style}
        data-testid={testID || 'content-service-renderer-error'}
        role={accessible !== false ? 'alert' : undefined}
        aria-label={accessibilityLabel || 'Content loading error'}
      >
        {errorNode}
      </div>
    );
  }

  // ─── Render: Fetched but empty ────────────────────────────────────────
  if (isFetched && !content) {
    if (fallback) {
      return (
        <div
          className={className}
          style={style}
          data-testid={testID || 'content-service-renderer-fallback'}
        >
          {fallback}
        </div>
      );
    }
    return null;
  }

  // ─── Render: Content ──────────────────────────────────────────────────
  if (content && result) {
    return (
      <div
        className={className}
        style={style}
        data-testid={testID || 'content-service-renderer'}
        role={accessible !== false ? 'region' : undefined}
        aria-label={
          accessibilityLabel ||
          `Rendered content from ${result.responseUrl || url}`
        }
      >
        <ContentRenderer
          content={content}
          contentType={contentType || 'auto'}
          sanitize={sanitize}
          allowedTags={allowedTags}
          allowedAttributes={allowedAttributes}
          maxDepth={maxDepth}
          onError={onError}
          onRender={onRender}
          components={components}
          renderers={renderers}
          transform={transform}
          linkHandler={linkHandler}
          imageHandler={imageHandler}
          testID={testID ? `${testID}-content` : undefined}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
        />
      </div>
    );
  }

  // ─── Render: Idle (not yet fetched) ───────────────────────────────────
  return null;
});

ContentServiceRenderer.displayName = 'ContentServiceRenderer';

export default ContentServiceRenderer;
