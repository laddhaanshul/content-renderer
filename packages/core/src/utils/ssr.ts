// ==========================================
// SSR / Next.js Utilities
// Server-side rendering helpers for content rendering
// ==========================================

import type { ContentType, Theme } from '../types';
import { HTMLParser } from '../parsers/html-parser';
import { sanitizeHTML } from './sanitize';
import { extractSEO, extractHeadings } from './extract';
import { slugify, truncate } from './transform';

// ==========================================
// Types
// ==========================================

export interface SSRRenderOptions {
  contentType?: ContentType;
  sanitize?: boolean;
  theme?: Partial<Theme>;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  viewport?: { width: number; height: number };
}

export interface SSRMetadata {
  title: string;
  description: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  canonical?: string;
  structuredData?: object;
  viewport?: string;
  charset?: string;
  language?: string;
}

// ==========================================
// Core SSR Functions
// ==========================================

/**
 * Render content to an HTML string for SSR.
 * Uses the HTML parser to parse and re-serialize content.
 */
export function renderToString(
  content: string,
  options?: SSRRenderOptions
): string {
  if (!content) return '';

  const { contentType, sanitize, lang, dir } = options || {};

  // If content is already HTML-like, parse and re-serialize
  if (contentType === 'html' || contentType === 'html5' || isHTMLContent(content)) {
    let processedContent = content;

    if (sanitize) {
      processedContent = sanitizeHTML(processedContent);
    }

    const parser = new HTMLParser();
    const doc = parser.parse(processedContent);

    // Inject lang and dir attributes on the html element
    if (doc.html && doc.html.attributes) {
      if (lang) doc.html.attributes['lang'] = lang;
      if (dir) doc.html.attributes['dir'] = dir;
    }

    return parser.serialize(doc);
  }

  // For non-HTML content, wrap in a div
  const escapedContent = escapeForHTML(content);
  const attrs: string[] = [];
  if (lang) attrs.push(`lang="${lang}"`);
  if (dir) attrs.push(`dir="${dir}"`);
  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

  return `<div${attrStr}>${escapedContent}</div>`;
}

/**
 * Render content to static markup (no React hydration markers).
 */
export function renderToStaticMarkup(
  content: string,
  options?: SSRRenderOptions
): string {
  const html = renderToString(content, options);

  // Remove any potential React data attributes
  return html
    .replace(/\s+data-reactroot=""/g, '')
    .replace(/\s+data-reactid="[^"]*"/g, '')
    .replace(/\s+data-react-checksum="[^"]*"/g, '');
}

/**
 * Extract SSR metadata from content.
 * Uses the existing extraction utilities to build metadata.
 */
export function extractMetadataForSSR(
  content: string,
  type?: ContentType
): SSRMetadata {
  const metadata: SSRMetadata = {
    title: '',
    description: '',
    ogTags: {},
    twitterTags: {},
  };

  if (!content) return metadata;

  const contentType = type || detectContentTypeFromContent(content);

  if (contentType === 'html' || contentType === 'html5') {
    try {
      const seo = extractSEO(content);

      metadata.title = seo.title || '';
      metadata.description = seo.description || '';
      metadata.canonical = seo.canonical || undefined;
      metadata.charset = seo.charset || 'utf-8';
      metadata.language = seo.language || undefined;
      metadata.viewport = seo.viewport || 'width=device-width, initial-scale=1';

      // Extract Open Graph tags
      metadata.ogTags = {
        'og:title': seo.ogTitle,
        'og:description': seo.ogDescription,
        'og:image': seo.ogImage,
        'og:url': seo.ogUrl,
        'og:type': seo.ogType,
      };

      // Extract Twitter Card tags
      metadata.twitterTags = {
        'twitter:card': seo.twitterCard,
        'twitter:title': seo.twitterTitle,
        'twitter:description': seo.twitterDescription,
        'twitter:image': seo.twitterImage,
      };

      // Remove empty values
      metadata.ogTags = Object.fromEntries(
        Object.entries(metadata.ogTags).filter(([, v]) => v)
      );
      metadata.twitterTags = Object.fromEntries(
        Object.entries(metadata.twitterTags).filter(([, v]) => v)
      );
    } catch {
      // Fallback: extract title from first heading
      const headings = extractHeadings(content, 'html');
      if (headings.length > 0) {
        metadata.title = headings[0].text;
      }
    }
  } else if (contentType === 'markdown') {
    // For markdown, extract the first heading as title and first paragraph as description
    const lines = content.split('\n');
    for (const line of lines) {
      const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headingMatch && !metadata.title) {
        metadata.title = headingMatch[1].trim();
        continue;
      }
      if (!metadata.description && line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
        metadata.description = truncate(line.trim(), 160);
      }
      if (metadata.title && metadata.description) break;
    }
    metadata.charset = 'utf-8';
    metadata.viewport = 'width=device-width, initial-scale=1';
  } else {
    // For JSON, XML, CSS, code, etc.
    metadata.title = contentType ? `Content Renderer - ${contentType}` : 'Content Renderer';
    metadata.description = `${contentType || 'Text'} content`;
    metadata.charset = 'utf-8';
    metadata.viewport = 'width=device-width, initial-scale=1';
  }

  return metadata;
}

/**
 * Generate HTML <head> tag content from SSR metadata.
 */
export function generateHeadTags(metadata: SSRMetadata): string {
  const tags: string[] = [];

  // Charset
  if (metadata.charset) {
    tags.push(`<meta charset="${metadata.charset}" />`);
  }

  // Viewport
  if (metadata.viewport) {
    tags.push(`<meta name="viewport" content="${escapeAttr(metadata.viewport)}" />`);
  }

  // Language
  if (metadata.language) {
    tags.push(`<meta name="language" content="${escapeAttr(metadata.language)}" />`);
  }

  // Title
  if (metadata.title) {
    tags.push(`<title>${escapeHTMLContent(metadata.title)}</title>`);
  }

  // Description
  if (metadata.description) {
    tags.push(`<meta name="description" content="${escapeAttr(metadata.description)}" />`);
  }

  // Canonical
  if (metadata.canonical) {
    tags.push(`<link rel="canonical" href="${escapeAttr(metadata.canonical)}" />`);
  }

  // Open Graph tags
  for (const [property, content] of Object.entries(metadata.ogTags)) {
    tags.push(`<meta property="${escapeAttr(property)}" content="${escapeAttr(content)}" />`);
  }

  // Twitter Card tags
  for (const [name, content] of Object.entries(metadata.twitterTags)) {
    tags.push(`<meta name="${escapeAttr(name)}" content="${escapeAttr(content)}" />`);
  }

  // Structured Data
  if (metadata.structuredData) {
    const jsonLd = JSON.stringify(metadata.structuredData);
    tags.push(`<script type="application/ld+json">${escapeHTMLContent(jsonLd)}</script>`);
  }

  return tags.join('\n  ');
}

/**
 * Generate JSON-LD structured data from SSR metadata.
 */
export function generateStructuredData(metadata: SSRMetadata): string {
  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metadata.title,
    description: metadata.description,
    inLanguage: metadata.language || 'en',
  };

  if (metadata.canonical) {
    structuredData.url = metadata.canonical;
  }

  if (metadata.ogTags['og:image']) {
    structuredData.image = metadata.ogTags['og:image'];
  }

  // Merge with any existing structured data
  if (metadata.structuredData) {
    Object.assign(structuredData, metadata.structuredData);
  }

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Create a complete SSR content bundle with HTML, head, and metadata.
 */
export function createSSRContent(
  content: string,
  options?: SSRRenderOptions
): { html: string; head: string; metadata: SSRMetadata } {
  const contentType = options?.contentType || detectContentTypeFromContent(content);
  const metadata = extractMetadataForSSR(content, contentType);
  const head = generateHeadTags(metadata);
  const html = renderToString(content, options);

  return { html, head, metadata };
}

/**
 * Check if the current execution environment is server-side.
 */
export function isServer(): boolean {
  return (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test')
  );
}

/**
 * Check if the current execution environment is client-side (browser).
 */
export function isClient(): boolean {
  return !isServer();
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Detect content type from content string.
 */
function detectContentTypeFromContent(content: string): ContentType {
  const trimmed = content.trim();

  if (!trimmed) return 'text';

  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return 'html5';
  }
  if (/<[a-zA-Z][^>]*>[\s\S]*<\/[a-zA-Z]+>/i.test(trimmed) &&
      /<(div|span|p|a|img|ul|ol|li|h[1-6]|table|form|head|body|html)[\s>]/i.test(trimmed)) {
    return 'html';
  }

  if (/^\s*[\[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }

  if (/^\s*<\?xml/i.test(trimmed)) {
    return 'xml';
  }

  if (/^#{1,6}\s+/m.test(trimmed) || /^\s*[-*+]\s+/m.test(trimmed) || /^\s*```/m.test(trimmed)) {
    return 'markdown';
  }

  if (/^\s*<\?php/i.test(trimmed)) {
    return 'php';
  }

  return 'text';
}

/**
 * Check if content appears to be HTML.
 */
function isHTMLContent(content: string): boolean {
  const type = detectContentTypeFromContent(content);
  return type === 'html' || type === 'html5';
}

/**
 * Escape content for safe inclusion in HTML attribute values.
 */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape content for safe inclusion as HTML text content.
 */
function escapeHTMLContent(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape content for safe inclusion as HTML body text.
 */
function escapeForHTML(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
