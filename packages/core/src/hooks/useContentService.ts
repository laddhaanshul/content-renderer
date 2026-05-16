import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ContentServiceConfig,
  ContentExtractStrategy,
  ContentServiceError,
  ContentServiceResult,
  UseContentServiceReturn,
  ContentType,
  ParsedContent,
} from '../types';
import { useContentParser } from './useContentParser';
import { detectContentType } from '../utils/transform';

// ==========================================
// Content Extraction Utility
// ==========================================

/**
 * Extract renderable content string from an API response body.
 *
 * Supports multiple strategies for navigating JSON structures and pulling
 * out the actual HTML / Markdown / text content that should be rendered.
 */
export function extractContentFromResponse(
  responseBody: any,
  strategy: ContentExtractStrategy,
  contentField?: string | string[],
): string {
  // If response is already a string, return directly
  if (typeof responseBody === 'string') return responseBody;

  // If response is not an object (number, boolean, null), stringify
  if (responseBody === null || responseBody === undefined) return '';
  if (typeof responseBody !== 'object') return String(responseBody);

  // If it's an array, try to extract from the first element
  if (Array.isArray(responseBody)) {
    if (responseBody.length > 0) {
      return extractContentFromResponse(responseBody[0], strategy, contentField);
    }
    return '[]';
  }

  // --- Strategy: custom ---
  if (strategy === 'custom') {
    // Caller should use transformResponse instead; return stringified as fallback
    return JSON.stringify(responseBody, null, 2);
  }

  // --- Strategy: direct ---
  if (strategy === 'direct') {
    return JSON.stringify(responseBody, null, 2);
  }

  // --- Strategy: json-field ---
  if (strategy === 'json-field' && contentField) {
    const fields = Array.isArray(contentField) ? contentField : [contentField];
    for (const field of fields) {
      const value = getNestedValue(responseBody, field);
      if (value !== undefined) {
        return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      }
    }
    // Field not found, fall through
  }

  // --- Strategy: json-html ---
  if (strategy === 'json-html') {
    const htmlFields = ['html', 'HTML', 'content', 'body', 'htmlContent', 'html_content'];
    for (const field of htmlFields) {
      const value = getNestedValue(responseBody, field);
      if (typeof value === 'string' && value.trim().length > 0) return value;
    }
  }

  // --- Strategy: json-markdown ---
  if (strategy === 'json-markdown') {
    const mdFields = ['markdown', 'Markdown', 'content', 'body', 'md', 'markdownContent', 'markdown_content'];
    for (const field of mdFields) {
      const value = getNestedValue(responseBody, field);
      if (typeof value === 'string' && value.trim().length > 0) return value;
    }
  }

  // --- Strategy: aem ---
  if (strategy === 'aem') {
    // AEM responses typically have nested structures like:
    // { ":type": "...", "html": "...", "jcr:content": { "html": "..." } }
    // or { "content": "...", "html": "..." }
    const aemPaths = [
      'html',
      'content',
      'jcr:content.html',
      '["jcr:content"].html',
      'properties.html',
      'properties.content',
      'data.html',
      'data.content',
    ];
    for (const path of aemPaths) {
      const value = getNestedValue(responseBody, path);
      if (typeof value === 'string' && value.trim().length > 0) return value;
    }
    // Also check the first property that has a string value with HTML tags
    for (const key of Object.keys(responseBody)) {
      if (key.startsWith(':') || key.startsWith('_')) continue;
      const val = responseBody[key];
      if (typeof val === 'string' && (val.includes('<') || val.length > 100)) {
        return val;
      }
    }
  }

  // --- Strategy: headless-cms ---
  if (strategy === 'headless-cms') {
    const cmsFields = [
      'content', 'body', 'html', 'text', 'description',
      'contentHtml', 'content_html', 'contentMarkdown', 'content_markdown',
      'renderedContent', 'rendered_content',
      'fields.content', 'fields.body', 'fields.html',
      'data.content', 'data.body', 'data.html',
      'attributes.content', 'attributes.body',
    ];
    for (const field of cmsFields) {
      const value = getNestedValue(responseBody, field);
      if (typeof value === 'string' && value.trim().length > 0) return value;
    }
  }

  // --- Strategy: json-property ---
  if (strategy === 'json-property') {
    // Find the first string property that looks like content
    for (const key of Object.keys(responseBody)) {
      const val = responseBody[key];
      if (typeof val === 'string' && val.trim().length > 50) {
        return val;
      }
    }
    // Try nested objects
    for (const key of Object.keys(responseBody)) {
      const val = responseBody[key];
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        for (const innerKey of Object.keys(val)) {
          const innerVal = val[innerKey];
          if (typeof innerVal === 'string' && innerVal.trim().length > 50) {
            return innerVal;
          }
        }
      }
    }
  }

  // --- Strategy: auto ---
  if (strategy === 'auto') {
    // First check if contentField is provided
    if (contentField) {
      const fields = Array.isArray(contentField) ? contentField : [contentField];
      for (const field of fields) {
        const value = getNestedValue(responseBody, field);
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
          return extractContentFromResponse(value, 'auto');
        }
      }
    }

    // Check common content fields
    const commonFields = ['html', 'content', 'body', 'text', 'markdown', 'data'];
    for (const field of commonFields) {
      if (responseBody[field] !== undefined) {
        const val = responseBody[field];
        if (typeof val === 'string' && val.trim().length > 0) return val;
        if (typeof val === 'object' && val !== null) {
          return extractContentFromResponse(val, 'auto');
        }
      }
    }

    // If the response has only one string property with significant content, use it
    const stringEntries: Array<[string, string]> = Object.entries(responseBody).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 50,
    );
    if (stringEntries.length === 1) {
      return stringEntries[0][1];
    }
  }

  // Fallback: stringify the entire response
  return JSON.stringify(responseBody, null, 2);
}

/**
 * Navigate a nested object by a dot-separated or bracket-notation path.
 * Supports: "a.b.c", "a[0].b", "a['key'].b", "jcr:content.html"
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;

  // Handle bracket notation: "a[0].b" or "a['key'].b"
  const parts: string[] = [];
  let remaining = path;

  while (remaining.length > 0) {
    // Match bracket notation: [0] or ['key'] or ["key"]
    const bracketMatch = remaining.match(/^\[(['"]?)(.*?)\1\](?:\.?(.*))?$/);
    if (bracketMatch) {
      parts.push(bracketMatch[2]);
      remaining = bracketMatch[3] || '';
      continue;
    }

    // Match dot notation: take first segment before dot
    const dotIndex = remaining.indexOf('.');
    if (dotIndex !== -1) {
      parts.push(remaining.slice(0, dotIndex));
      remaining = remaining.slice(dotIndex + 1);
    } else {
      parts.push(remaining);
      remaining = '';
    }
  }

  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (isNaN(index)) return undefined;
      current = current[index];
    } else if (typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

// ==========================================
// Content Type Detection from Response
// ==========================================

/**
 * Detect content type from HTTP response headers and body.
 * Checks the Content-Type header first, then falls back to body inspection.
 *
 * When `wasExtracted` is true the body has already been pulled out of a JSON
 * envelope, so the outer Content-Type header (e.g. "application/json") must NOT
 * be used to classify the inner content — we always inspect the body directly.
 */
function detectContentTypeFromResponse(
  contentTypeHeader: string | null,
  body: string,
  override?: ContentType,
  wasExtracted: boolean = false,
): ContentType {
  if (override) return override;

  // When content was extracted from a JSON wrapper (e.g. json-html strategy),
  // the Content-Type header describes the outer envelope (application/json),
  // not the inner payload. Skip header detection and inspect the body directly.
  if (wasExtracted) {
    return detectContentType(body);
  }

  // Try to detect from Content-Type header
  if (contentTypeHeader) {
    const header = contentTypeHeader.toLowerCase();

    if (header.includes('text/html')) return 'html';
    if (header.includes('application/json')) {
      // Response IS JSON — but the body we receive here is already the raw
      // body string (before any extraction), so check if it looks like plain JSON.
      try {
        JSON.parse(body);
        return 'json';
      } catch {
        // Not valid JSON despite the header — fall through to body inspection.
      }
    }
    if (header.includes('application/xml') || header.includes('text/xml')) return 'xml';
    if (header.includes('text/css')) return 'css';
    if (header.includes('text/markdown')) return 'markdown';
    if (header.includes('text/plain')) return 'text';
    if (header.includes('application/javascript')) return 'javascript';
    if (header.includes('application/typescript') || header.includes('text/typescript')) return 'typescript';
    if (header.includes('application/x-php') || header.includes('text/x-php')) return 'php';
    if (header.includes('text/yaml') || header.includes('application/x-yaml')) return 'yaml';
  }

  // Fall back to body inspection
  return detectContentType(body);
}




// ==========================================
// Error Factory
// ==========================================

function createContentServiceError(
  message: string,
  options: Partial<ContentServiceError> = {},
): ContentServiceError {
  const error = new Error(message) as ContentServiceError;
  error.isNetworkError = options.isNetworkError ?? false;
  error.isTimeout = options.isTimeout ?? false;
  error.isAborted = options.isAborted ?? false;
  error.status = options.status;
  error.url = options.url;
  error.timestamp = Date.now();
  error.cause = options.cause;
  return error;
}

// ==========================================
// useContentService Hook
// ==========================================

/**
 * React hook for fetching, extracting, and parsing content from API endpoints.
 *
 * @param config - Content service configuration
 * @returns Hook state with result, loading/error states, and control methods
 *
 * @example
 * ```tsx
 * const { content, isLoading, error, fetchContent } = useContentService({
 *   url: '/api/page-content',
 *   extractStrategy: 'aem',
 * });
 * ```
 */
export function useContentService(config?: ContentServiceConfig): UseContentServiceReturn {
  const {
    url: configUrl,
    fetcher,
    headers,
    credentials,
    mode,
    cache,
    requestInit,
    contentType: contentTypeOverride,
    extractStrategy = 'auto',
    contentField,
    maxContentLength = 5 * 1024 * 1024, // 5MB default
    timeout = 30000,
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
    refetchInterval = 0,
    retry: retryEnabled = false,
    retryCount = 3,
    retryDelay = 1000,
    transformResponse,
    onError,
    onRequest,
    onSuccess,
  } = config || {};

  // State
  const [result, setResult] = useState<ContentServiceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ContentServiceError | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string | undefined>(configUrl);
  const lastConfigRef = useRef<ContentServiceConfig | undefined>(config);
  const retryCountRef = useRef(0);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Keep config ref in sync
  useEffect(() => {
    lastConfigRef.current = config;
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  // Content parser hook
  const contentParser = useContentParser({
    contentType: contentTypeOverride,
    onError: () => { },
  });

  // Abort method
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (mountedRef.current) {
      setIsLoading(false);
    }
  }, []);

  // Reset method
  const reset = useCallback(() => {
    if (mountedRef.current) {
      setResult(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      setIsFetched(false);
      retryCountRef.current = 0;
      contentParser.reset();
    }
  }, [contentParser]);

  // Core fetch logic
  const fetchContent = useCallback(
    async (overrideUrl?: string, overrideOptions?: Partial<ContentServiceConfig>) => {
      const effectiveUrl = overrideUrl || lastConfigRef.current?.url || configUrl;
      if (!effectiveUrl) return;

      // Guard: skip URLs that are not fetchable (about:, data:, javascript:, etc.)
      // This prevents RCTNetworking errors in React Native and similar issues in web.
      // Users who need these schemes should provide a custom `fetcher`.
      if (/^(about|data|javascript|blob|chrome|edge):/i.test(effectiveUrl)) {
        return;
      }

      const mergedConfig = { ...lastConfigRef.current, ...overrideOptions };

      // Abort any in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (mountedRef.current) {
        setIsLoading(true);
        setIsError(false);
        setError(null);
      }

      onRequest?.(effectiveUrl);

      const startTime = Date.now();

      try {
        // Build request options
        const fetchOptions: RequestInit = {
          ...mergedConfig.requestInit,
          headers: mergedConfig.headers || headers,
          credentials: mergedConfig.credentials || credentials,
          mode: mergedConfig.mode || mode,
          signal: controller.signal,
        };
        if (mergedConfig.cache || cache) {
          (fetchOptions as any).cache = mergedConfig.cache || cache;
        }

        // Execute fetch
        let response: Response;
        const effectiveFetcher = mergedConfig.fetcher || fetcher;
        if (effectiveFetcher) {
          response = await effectiveFetcher(effectiveUrl, fetchOptions);
        } else {
          const defaultFetch = (globalThis as any).fetch;
          response = await defaultFetch(effectiveUrl, fetchOptions);
        }

        // Handle non-OK responses
        if (!response.ok) {
          const err = createContentServiceError(
            `HTTP error ${response.status}: ${response.statusText}`,
            {
              status: response.status,
              url: effectiveUrl,
              isNetworkError: false,
            },
          );
          throw err;
        }

        // Get response body as text
        const rawBody = await response.text();
        const effectiveMaxContent = mergedConfig.maxContentLength ?? maxContentLength;

        if (rawBody.length > effectiveMaxContent) {
          throw createContentServiceError(
            `Content length (${rawBody.length} bytes) exceeds maximum (${effectiveMaxContent} bytes)`,
            { url: effectiveUrl },
          );
        }

        // Detect content type from headers
        const contentTypeHeader = response.headers.get('Content-Type');
        const effectiveContentTypeOverride = mergedConfig.contentType ?? contentTypeOverride;

        // Parse response body to detect if JSON
        let parsedBody: any = rawBody;
        let wasExtracted = false;

        try {
          parsedBody = JSON.parse(rawBody);
          // It's JSON - extract content using strategy
          const strategy = mergedConfig.extractStrategy ?? extractStrategy;
          const fields = mergedConfig.contentField ?? contentField;

          let extractedContent: string;

          const effectiveTransform = mergedConfig.transformResponse ?? transformResponse;
          if (strategy === 'custom' && effectiveTransform) {
            const transformed = effectiveTransform(parsedBody);
            extractedContent = typeof transformed === 'string'
              ? transformed
              : extractContentFromResponse(transformed, 'auto');
          } else {
            extractedContent = extractContentFromResponse(parsedBody, strategy, fields);
          }

          wasExtracted = extractedContent !== rawBody;

          // Detect content type of the extracted content.
          // Pass wasExtracted so the detector ignores the outer JSON header
          // when we've already pulled the inner payload (html, markdown, etc.).
          const detectedType = detectContentTypeFromResponse(
            contentTypeHeader,
            extractedContent,
            effectiveContentTypeOverride,
            wasExtracted,
          );

          const duration = Date.now() - startTime;

          // Collect response headers
          const respHeaders: Record<string, string> = {};
          response.headers.forEach((value: string, key: string) => {
            respHeaders[key] = value;
          });

          // Build result
          const serviceResult: ContentServiceResult = {
            content: extractedContent,
            contentType: detectedType,
            parsed: null,
            responseUrl: response.url,
            status: response.status,
            headers: respHeaders,
            contentLength: extractedContent.length,
            timestamp: Date.now(),
            duration,
            wasExtracted,
          };

          // Parse the content
          contentParser.parse(extractedContent);
          serviceResult.parsed = contentParser.parsed;

          if (mountedRef.current) {
            retryCountRef.current = 0;
            setResult(serviceResult);
            setIsLoading(false);
            setIsFetched(true);
            onSuccess?.(serviceResult);
          }
        } catch (jsonParseErr) {
          // Response is not JSON, use raw body
          const detectedType = detectContentTypeFromResponse(
            contentTypeHeader,
            rawBody,
            effectiveContentTypeOverride,
            false,
          );


          const duration = Date.now() - startTime;

          const respHeaders: Record<string, string> = {};
          response.headers.forEach((value: string, key: string) => {
            respHeaders[key] = value;
          });

          const serviceResult: ContentServiceResult = {
            content: rawBody,
            contentType: detectedType,
            parsed: null,
            responseUrl: response.url,
            status: response.status,
            headers: respHeaders,
            contentLength: rawBody.length,
            timestamp: Date.now(),
            duration,
            wasExtracted: false,
          };

          // Parse the content
          contentParser.parse(rawBody);
          serviceResult.parsed = contentParser.parsed;

          if (mountedRef.current) {
            retryCountRef.current = 0;
            setResult(serviceResult);
            setIsLoading(false);
            setIsFetched(true);
            onSuccess?.(serviceResult);
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          // Aborted - don't set error state
          return;
        }

        let serviceError: ContentServiceError;

        if (err && err.isNetworkError !== undefined) {
          // Already a ContentServiceError
          serviceError = err;
        } else {
          // Create from unknown error
          const isNetworkError = !err?.status && err?.name !== 'AbortError';
          serviceError = createContentServiceError(
            err?.message || 'Failed to fetch content',
            {
              url: effectiveUrl,
              isNetworkError,
              isTimeout: err?.name === 'TimeoutError' || false,
              isAborted: false,
              cause: err,
            },
          );
        }

        // Retry logic
        const shouldRetry = mergedConfig.retry ?? retryEnabled;
        const maxRetries = mergedConfig.retryCount ?? retryCount;
        const retryDelayMs = mergedConfig.retryDelay ?? retryDelay;

        if (shouldRetry && retryCountRef.current < maxRetries && !serviceError.isAborted) {
          retryCountRef.current++;
          const delay = retryDelayMs * Math.pow(2, retryCountRef.current - 1); // Exponential backoff

          if (mountedRef.current) {
            setIsLoading(false);
            setTimeout(() => {
              if (mountedRef.current) {
                fetchContent(overrideUrl, overrideOptions);
              }
            }, delay);
          }
          return;
        }

        if (mountedRef.current) {
          setError(serviceError);
          setIsError(true);
          setIsLoading(false);
          setIsFetched(true);
          onError?.(serviceError);
        }
      }
    },
    [
      configUrl, fetcher, headers, credentials, mode, cache,
      contentTypeOverride, extractStrategy, contentField, maxContentLength,
      timeout, retryEnabled, retryCount, retryDelay,
      transformResponse, onError, onRequest, onSuccess,
      contentParser,
    ],
  );

  // Retry method
  const retry = useCallback(() => {
    retryCountRef.current = 0;
    fetchContent();
  }, [fetchContent]);

  // Fetch on mount if URL is provided
  useEffect(() => {
    if (configUrl) {
      lastUrlRef.current = configUrl;
      fetchContent();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      fetchContent();
    };

    // Check for browser environment
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined') {
      const win = (globalThis as any).window as any;
      win.addEventListener('focus', handleFocus);
      return () => win.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus, fetchContent]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      fetchContent();
    };

    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined') {
      const win = (globalThis as any).window as any;
      win.addEventListener('online', handleOnline);
      return () => win.removeEventListener('online', handleOnline);
    }
  }, [refetchOnReconnect, fetchContent]);

  // Polling interval
  useEffect(() => {
    if (refetchInterval <= 0 || !configUrl) return;

    pollingTimerRef.current = setInterval(() => {
      fetchContent();
    }, refetchInterval);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [refetchInterval, configUrl, fetchContent]);

  return {
    result,
    content: result?.content ?? null,
    contentType: result?.contentType ?? null,
    parsed: result?.parsed ?? contentParser.parsed,
    isLoading,
    isError,
    error,
    isFetched,
    fetchContent,
    reset,
    retry,
    abort,
  };
}

export default useContentService;
