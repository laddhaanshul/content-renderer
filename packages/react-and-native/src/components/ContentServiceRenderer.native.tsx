/**
 * ContentServiceRenderer – React Native component that fetches content from a
 * URL and renders it using the appropriate sub-renderer.
 *
 * Supports loading states with configurable delay + skeleton, error states with
 * retry, and debounced refetching via `fetchKey`.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { useContentService } from '@content-renderer/core';
import type {
  ContentServiceRendererProps,
  ContentServiceError,
  ContentServiceConfig,
} from '@content-renderer/core';
import ContentRenderer from './ContentRenderer.native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentServiceRendererStyle {
  container?: ViewStyle;
  loadingContainer?: ViewStyle;
  loadingText?: TextStyle;
  errorContainer?: ViewStyle;
  errorTitle?: TextStyle;
  errorMessage?: TextStyle;
  retryButton?: ViewStyle;
  retryButtonText?: TextStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ContentServiceRenderer for React Native.
 *
 * Fetches content from a URL using `useContentService` and renders it with the
 * appropriate renderer (HTML, Markdown, JSON, Code, etc.).
 *
 * @example
 * ```tsx
 * <ContentServiceRenderer
 *   url="https://api.example.com/page"
 *   config={{ extractStrategy: 'headless-cms' }}
 *   fetchKey={pageId}
 * />
 * ```
 */
export const ContentServiceRenderer: React.FC<
  ContentServiceRendererProps & { rendererStyle?: ContentServiceRendererStyle }
> = React.memo(({
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
  rendererStyle,
  ...rest
}) => {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  // Merge styles
  const containerStyle = useMemo(() => [
    style as ViewStyle,
    rendererStyle?.container,
  ] as ViewStyle[], [style, rendererStyle?.container]);

  // ─── Render: Loading state ─────────────────────────────────────────────
  if (isLoading) {
    if (!showLoading && skeleton) {
      return (
        <View
          testID={testID || 'content-service-renderer-skeleton'}
          accessible={accessible !== false}
          accessibilityLabel={accessibilityLabel || 'Loading content'}
          style={containerStyle}
        >
          {skeleton}
        </View>
      );
    }

    if (showLoading) {
      if (loading) {
        return (
          <View
            testID={testID || 'content-service-renderer-loading'}
            accessible={accessible !== false}
            accessibilityLabel={accessibilityLabel || 'Loading content'}
            style={[rendererStyle?.loadingContainer, containerStyle]}
          >
            {loading}
          </View>
        );
      }

      return (
        <View
          testID={testID || 'content-service-renderer-loading'}
          accessible={accessible !== false}
          accessibilityLabel={accessibilityLabel || 'Loading content'}
          style={[
            { alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 120 },
            rendererStyle?.loadingContainer,
            containerStyle,
          ]}
        >
          <ActivityIndicator size="small" color="#666" />
          <Text style={[{ marginTop: 12, color: '#666', fontSize: 14 }, rendererStyle?.loadingText]}>
            Loading content...
          </Text>
        </View>
      );
    }

    // Before loadingDelay
    return skeleton ? (
      <View
        testID={testID || 'content-service-renderer-skeleton'}
        accessible={accessible !== false}
        accessibilityLabel={accessibilityLabel || 'Loading content'}
        style={containerStyle}
      >
        {skeleton}
      </View>
    ) : null;
  }

  // ─── Render: Error state ──────────────────────────────────────────────
  if (isError && error) {
    if (errorRenderer) {
      return (
        <View
          testID={testID || 'content-service-renderer-error'}
          accessible={accessible !== false}
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel || 'Content loading error'}
          style={containerStyle}
        >
          {errorRenderer(error, handleRetry)}
        </View>
      );
    }

    return (
      <View
        testID={testID || 'content-service-renderer-error'}
        accessible={accessible !== false}
        accessibilityRole="alert"
        accessibilityLabel={accessibilityLabel || 'Content loading error'}
        style={[
          {
            padding: 16,
            backgroundColor: '#f8d7da',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#f5c6cb',
          },
          rendererStyle?.errorContainer,
          containerStyle,
        ]}
      >
        <Text style={[{ fontWeight: '600', color: '#dc3545', fontSize: 15, marginBottom: 8 }, rendererStyle?.errorTitle]}>
          Failed to load content
        </Text>
        <Text style={[{ color: '#dc3545', fontSize: 13, opacity: 0.85, marginBottom: 12 }, rendererStyle?.errorMessage]}>
          {error.message}
          {error.status ? ` (HTTP ${error.status})` : ''}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          style={[
            {
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: 'white',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#dc3545',
              alignSelf: 'flex-start',
            },
            rendererStyle?.retryButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[{ color: '#dc3545', fontSize: 13 }, rendererStyle?.retryButtonText]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render: Fetched but empty ────────────────────────────────────────
  if (isFetched && !content) {
    if (fallback) {
      return (
        <View testID={testID || 'content-service-renderer-fallback'} style={containerStyle}>
          {fallback}
        </View>
      );
    }
    return null;
  }

  // ─── Render: Content ──────────────────────────────────────────────────
  if (content && result) {
    return (
      <View
        testID={testID || 'content-service-renderer'}
        accessible={accessible !== false}
        accessibilityLabel={
          accessibilityLabel ||
          `Rendered content from ${result.responseUrl || url}`
        }
        style={containerStyle}
      >
        <ContentRenderer
          content={content}
          contentType={(contentType as any) || 'auto'}
          onError={onError}
          fallback={fallback}
          testID={testID ? `${testID}-content` : undefined}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          onLinkPress={
            linkHandler
              ? (href: string) => linkHandler(href)
              : undefined
          }
        />
      </View>
    );
  }

  // ─── Render: Idle ─────────────────────────────────────────────────────
  return null;
});

ContentServiceRenderer.displayName = 'ContentServiceRenderer';

export default ContentServiceRenderer;
