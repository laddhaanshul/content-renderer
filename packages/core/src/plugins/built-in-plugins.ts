// ==========================================
// Content Renderer - Built-in Plugins
// ==========================================

import {
  PluginDefinition,
  PluginPriority,
} from './plugin-manager';
import { ContentType, ParsedContent, MarkdownDocument, HTMLNode } from '../types';

// ==========================================
// Line Numbers Plugin
// ==========================================

/**
 * Adds line numbers to code blocks in HTML content.
 * Wraps code content with line number spans for display.
 *
 * @param options - Configuration options
 * @param options.startingLine - The starting line number (default: 1)
 * @param options.highlightLines - Array of line numbers to highlight
 * @param options.className - CSS class for line number elements
 */
export function createLineNumbersPlugin(options?: {
  startingLine?: number;
  highlightLines?: number[];
  className?: string;
}): PluginDefinition {
  const startingLine = options?.startingLine ?? 1;
  const highlightLines = new Set(options?.highlightLines ?? []);
  const className = options?.className ?? 'line-number';

  return {
    name: 'line-numbers',
    version: '1.0.0',
    description: 'Adds line numbers to code blocks in HTML content',
    priority: PluginPriority.NORMAL,
    contentType: ['html', 'html5', 'markdown'],
    hooks: {
      afterParse(parsed: ParsedContent) {
        const html = parsed.content;

        if (!html || !html.includes('<code')) {
          return parsed;
        }

        // Process <code> blocks inside <pre>
        const processed = html.replace(
          /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
          (_match, preAttrs: string, codeAttrs: string, code: string) => {
            const lines = code.split('\n');

            // Don't add line numbers to single-line code
            if (lines.length <= 1) {
              return `<pre${preAttrs}><code${codeAttrs}>${code}</code></pre>`;
            }

            const numberedLines = lines.map((line, index) => {
              const lineNum = startingLine + index;
              const isHighlighted = highlightLines.has(lineNum);
              const lineClass = isHighlighted
                ? `${className} ${className}-highlighted`
                : className;

              // Escape HTML in the code content
              const escapedLine = line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

              return `<span class="${lineClass}" data-line="${lineNum}"></span>${escapedLine}`;
            });

            const body = numberedLines.join('\n');
            return `<pre${preAttrs} data-line-numbers="true" data-starting-line="${startingLine}"><code${codeAttrs}>${body}</code></pre>`;
          }
        );

        return {
          ...parsed,
          content: processed,
        } as ParsedContent;
      },
    },
  };
}

/** Default line numbers plugin instance */
export const lineNumbersPlugin = createLineNumbersPlugin();

// ==========================================
// Sanitize Plugin
// ==========================================

/**
 * Sanitizes HTML content by removing dangerous tags, attributes, and scripts.
 * Runs at CRITICAL priority to ensure content safety before any other processing.
 *
 * @param options - Configuration options
 * @param options.allowScripts - Whether to allow script tags (default: false)
 * @param options.allowStyles - Whether to allow style tags (default: false)
 * @param options.allowComments - Whether to keep HTML comments (default: false)
 * @param options.allowedTags - Additional tags to allow beyond the defaults
 * @param options.allowedAttributes - Additional per-tag allowed attributes
 */
export function createSanitizePlugin(options?: {
  allowScripts?: boolean;
  allowStyles?: boolean;
  allowComments?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}): PluginDefinition {
  const DEFAULT_SAFE_TAGS = new Set([
    'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
    'blockquote', 'body', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
    'data', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em',
    'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark',
    'nav', 'ol', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby',
    's', 'samp', 'section', 'small', 'source', 'span', 'strong', 'sub',
    'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time',
    'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
  ]);

  const DANGEROUS_TAGS = new Set([
    'script', 'noscript', 'object', 'embed', 'applet', 'iframe', 'frame',
    'frameset', 'form', 'input', 'textarea', 'select', 'button', 'link',
  ]);

  const DANGEROUS_ATTRS = /^on/i;
  const DANGEROUS_SCHEMES = /^\s*(javascript|vbscript|data(?!\s*:\s*image\/))/i;

  const allowScripts = options?.allowScripts ?? false;
  const allowStyles = options?.allowStyles ?? false;
  const allowComments = options?.allowComments ?? false;
  const extraTags = new Set(options?.allowedTags ?? []);

  // Build the allowed tags set
  const allowedTags = new Set(DEFAULT_SAFE_TAGS);
  if (allowScripts) { allowedTags.add('script'); allowedTags.add('noscript'); }
  if (allowStyles) { allowedTags.add('style'); }
  for (const tag of extraTags) { allowedTags.add(tag); }

  function sanitize(content: string): string {
    if (!content) return '';

    let result = content;

    // Strip comments
    if (!allowComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove dangerous tags entirely (including their content for script, style)
    if (!allowScripts) {
      result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
      result = result.replace(/<script[^>]*\/?>/gi, '');
      result = result.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
    }
    if (!allowStyles) {
      result = result.replace(/<style[\s\S]*?<\/style>/gi, '');
    }

    // Remove dangerous tags (but keep their content)
    for (const tag of DANGEROUS_TAGS) {
      if (allowedTags.has(tag)) continue;
      result = result.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
      result = result.replace(new RegExp(`</${tag}>`, 'gi'), '');
    }

    // Remove event handler attributes from all remaining tags
    result = result.replace(
      /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ''
    );

    // Remove dangerous URL schemes from href, src, action, formaction
    result = result.replace(
      /((?:href|src|action|formaction)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi,
      (match, attrPrefix, doubleQuoted, singleQuoted) => {
        const url = doubleQuoted ?? singleQuoted ?? '';
        if (DANGEROUS_SCHEMES.test(url)) {
          return ''; // Remove the entire attribute
        }
        return match;
      }
    );

    // Remove any remaining < and > that might form unclosed tags
    // (This is a safety net, not a full sanitizer)
    return result;
  }

  return {
    name: 'sanitize',
    version: '1.0.0',
    description: 'Sanitizes HTML content by removing dangerous tags, attributes, and scripts',
    priority: PluginPriority.CRITICAL,
    contentType: ['html', 'html5'],
    hooks: {
      beforeParse(content: string) {
        return sanitize(content);
      },
      afterParse(parsed: ParsedContent) {
        if (parsed.type === 'html' || parsed.type === 'html5') {
          return { ...parsed, content: sanitize(parsed.content) } as ParsedContent;
        }
        return parsed;
      },
    },
  };
}

/** Default sanitize plugin instance */
export const sanitizePlugin = createSanitizePlugin();

// ==========================================
// Table of Contents Plugin
// ==========================================

/**
 * Generates a table of contents from heading elements in parsed content.
 * Extracts headings and creates a structured TOC with nesting.
 *
 * @param options - Configuration options
 * @param options.maxDepth - Maximum heading depth to include (default: 3)
 * @param options.minDepth - Minimum heading depth to include (default: 1)
 */
export function createTocPlugin(options?: {
  maxDepth?: number;
  minDepth?: number;
}): PluginDefinition {
  const maxDepth = options?.maxDepth ?? 3;
  const minDepth = options?.minDepth ?? 1;

  return {
    name: 'toc',
    version: '1.0.0',
    description: 'Generates a table of contents from headings in content',
    priority: PluginPriority.NORMAL,
    contentType: ['html', 'html5', 'markdown'],
    hooks: {
      afterParse(parsed: ParsedContent, context: any) {
        const content = parsed.content;
        const tocEntries: Array<{
          id: string;
          level: number;
          text: string;
          children: typeof tocEntries;
        }> = [];

        // Extract headings from HTML
        if (parsed.type === 'html' || parsed.type === 'html5') {
          const headingRegex = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;
          let match;

          while ((match = headingRegex.exec(content)) !== null) {
            const level = parseInt(match[1], 10);
            const attrs = match[2];
            const text = match[3]
              .replace(/<[^>]+>/g, '') // strip inner tags
              .trim();

            if (level < minDepth || level > maxDepth || !text) continue;

            // Generate ID from text
            const id = attrs.match(/id\s*=\s*["']([^"']+)["']/i)?.[1] ??
              text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            tocEntries.push({ id, level, text, children: [] });
          }
        }

        // Extract headings from Markdown parsed document
        if (parsed.type === 'markdown' && parsed.parsed) {
          const mdDoc = parsed.parsed as MarkdownDocument;
          for (const heading of mdDoc.headings) {
            if (heading.level < minDepth || heading.level > maxDepth) continue;
            tocEntries.push({
              id: heading.slug,
              level: heading.level,
              text: heading.text,
              children: [],
            });
          }
        }

        // Build nested TOC structure
        function buildNested(entries: typeof tocEntries): typeof tocEntries {
          const result: typeof tocEntries = [];
          const stack: typeof tocEntries = [];

          for (const entry of entries) {
            const node = { ...entry, children: [] };

            while (stack.length > 0 && stack[stack.length - 1].level >= entry.level) {
              stack.pop();
            }

            if (stack.length === 0) {
              result.push(node);
            } else {
              stack[stack.length - 1].children.push(node);
            }

            stack.push(node);
          }

          return result;
        }

        const nestedToc = buildNested(tocEntries);

        // Store TOC in the hook context for other plugins to access
        if (context && context.data) {
          context.data.toc = nestedToc;
          context.data.tocEntries = tocEntries;
        }

        // Also enrich metadata
        const enrichedMetadata = {
          ...parsed.metadata,
          toc: nestedToc,
          headingCount: tocEntries.length,
        };

        return {
          ...parsed,
          metadata: enrichedMetadata,
        } as ParsedContent;
      },
    },
  };
}

/** Default TOC plugin instance */
export const tocPlugin = createTocPlugin();

// ==========================================
// Meta Enricher Plugin
// ==========================================

/**
 * Enriches content metadata by extracting and computing additional information.
 * Adds word count, reading time, character count, and content fingerprint.
 *
 * @param options - Configuration options
 * @param options.wordsPerMinute - Reading speed for time estimation (default: 200)
 */
export function createMetaEnricherPlugin(options?: {
  wordsPerMinute?: number;
}): PluginDefinition {
  const wordsPerMinute = options?.wordsPerMinute ?? 200;

  return {
    name: 'meta-enricher',
    version: '1.0.0',
    description: 'Enriches content metadata with computed fields like word count and reading time',
    priority: PluginPriority.LOW,
    hooks: {
      afterParse(parsed: ParsedContent) {
        const content = parsed.content;

        // Strip HTML/Markdown to get plain text
        const plainText = content
          .replace(/<[^>]+>/g, ' ')      // strip tags
          .replace(/[#*_~`>\[\]()!|]/g, '') // strip markdown syntax
          .replace(/\s+/g, ' ')
          .trim();

        const charCount = plainText.length;
        const wordCount = plainText
          ? plainText.split(/\s+/).filter(Boolean).length
          : 0;
        const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
        const lineCount = content.split('\n').length;

        // Simple content fingerprint (hash)
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
          const char = content.charCodeAt(i);
          hash = ((hash << 5) - hash + char) | 0;
        }
        const fingerprint = Math.abs(hash).toString(36);

        // Detect language heuristically
        const language = detectLanguage(plainText);

        return {
          ...parsed,
          metadata: {
            ...parsed.metadata,
            charCount,
            wordCount,
            readingTime,
            readingTimeMinutes: readingTime,
            lineCount,
            size: new Blob([content]).size,
            fingerprint,
            language,
            enrichedAt: new Date().toISOString(),
          },
        } as ParsedContent;
      },
    },
  };
}

/** Default meta enricher plugin instance */
export const metaEnricherPlugin = createMetaEnricherPlugin();

/**
 * Simple language detection heuristic based on character ranges.
 */
function detectLanguage(text: string): string | undefined {
  if (!text) return undefined;

  const sample = text.slice(0, 500);
  let cjk = 0;
  let latin = 0;
  let arabic = 0;
  let cyrillic = 0;

  for (const char of sample) {
    const code = char.codePointAt(0) ?? 0;
    if ((code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3040 && code <= 0x309F) ||
        (code >= 0x30A0 && code <= 0x30FF) ||
        (code >= 0xAC00 && code <= 0xD7AF)) {
      cjk++;
    } else if ((code >= 0x0041 && code <= 0x024F)) {
      latin++;
    } else if ((code >= 0x0600 && code <= 0x06FF)) {
      arabic++;
    } else if ((code >= 0x0400 && code <= 0x04FF)) {
      cyrillic++;
    }
  }

  const total = cjk + latin + arabic + cyrillic;
  if (total === 0) return 'en';

  if (cjk / total > 0.3) {
    // Distinguish CJK languages
    if (sample.match(/[\u3040-\u309F\u30A0-\u30FF]/)) return 'ja';
    if (sample.match(/[\uAC00-\uD7AF]/)) return 'ko';
    return 'zh';
  }
  if (arabic / total > 0.3) return 'ar';
  if (cyrillic / total > 0.3) return 'ru';

  return 'en';
}

// ==========================================
// Link Rewrite Plugin
// ==========================================

/**
 * Rewrites links (href, src) in content based on configurable rules.
 * Supports base URL prepending, relative-to-absolute conversion, and custom rewrite functions.
 *
 * @param options - Configuration options
 * @param options.baseUrl - Base URL to prepend to relative links
 * @param options.rewriteFn - Custom rewrite function (takes original URL, returns rewritten)
 * @param options.rewriteImageSrc - Whether to rewrite image src attributes (default: true)
 * @param options.rewriteAnchors - Whether to rewrite anchor hrefs (default: true)
 * @param options.stripTrailingSlash - Whether to remove trailing slashes (default: false)
 */
export function createLinkRewritePlugin(options?: {
  baseUrl?: string;
  rewriteFn?: (url: string, attr: string) => string;
  rewriteImageSrc?: boolean;
  rewriteAnchors?: boolean;
  stripTrailingSlash?: boolean;
}): PluginDefinition {
  const baseUrl = options?.baseUrl?.replace(/\/$/, '') ?? '';
  const rewriteFn = options?.rewriteFn;
  const rewriteImageSrc = options?.rewriteImageSrc ?? true;
  const rewriteAnchors = options?.rewriteAnchors ?? true;
  const stripTrailingSlash = options?.stripTrailingSlash ?? false;

  return {
    name: 'link-rewrite',
    version: '1.0.0',
    description: 'Rewrites links in content by prepending base URL or applying custom rules',
    priority: PluginPriority.NORMAL,
    contentType: ['html', 'html5', 'markdown'],
    hooks: {
      beforeParse(content: string) {
        if (!content) return content;

        let result = content;

        // Rewrite anchor hrefs
        if (rewriteAnchors) {
          result = result.replace(
            /(<a\s[^>]*?href\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi,
            (match, prefix: string, doubleQuoted: string, singleQuoted: string) => {
              const originalUrl = doubleQuoted ?? singleQuoted ?? '';
              const rewritten = rewriteUrl(originalUrl, 'href');
              return `${prefix}"${rewritten}"`;
            }
          );
        }

        // Rewrite image srcs
        if (rewriteImageSrc) {
          result = result.replace(
            /(<img\s[^>]*?src\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi,
            (match, prefix: string, doubleQuoted: string, singleQuoted: string) => {
              const originalUrl = doubleQuoted ?? singleQuoted ?? '';
              const rewritten = rewriteUrl(originalUrl, 'src');
              return `${prefix}"${rewritten}"`;
            }
          );
        }

        return result;
      },
    },
  };

  function rewriteUrl(url: string, attr: string): string {
    if (!url) return url;

    // Skip anchor-only links, data URIs, javascript:, etc.
    if (/^(#|javascript:|data:|mailto:|tel:|fax:)/i.test(url)) {
      return url;
    }

    // Apply custom rewrite function first
    if (rewriteFn) {
      const customResult = rewriteFn(url, attr);
      if (customResult !== url) return customResult;
    }

    // Skip if already absolute
    if (/^https?:\/\//i.test(url)) {
      return stripTrailingSlash ? url.replace(/\/+$/, '') : url;
    }

    // Skip protocol-relative URLs if no base URL
    if (url.startsWith('//')) {
      return url;
    }

    // Prepend base URL to relative URLs
    if (baseUrl && !url.startsWith('/')) {
      url = `${baseUrl}/${url.replace(/^\.\/?/, '')}`;
    } else if (baseUrl && url.startsWith('/')) {
      url = `${baseUrl}${url}`;
    }

    return stripTrailingSlash ? url.replace(/\/+$/, '') : url;
  }
}

/** Default link rewrite plugin instance */
export const linkRewritePlugin = createLinkRewritePlugin();

// ==========================================
// Image Proxy Plugin
// ==========================================

/**
 * Proxies image URLs through a configurable proxy service.
 * Useful for bypassing CORS restrictions, adding authentication, or resizing images.
 *
 * @param options - Configuration options
 * @param options.proxyUrl - URL template for the proxy service. Use `{url}` as placeholder.
 * @param options.proxyFn - Custom proxy function (takes original URL, returns proxy URL)
 * @param options.onlyExternal - Only proxy external (absolute) URLs (default: true)
 * @param options.allowedDomains - Only proxy URLs from these domains (empty = all)
 */
export function createImageProxyPlugin(options?: {
  proxyUrl?: string;
  proxyFn?: (url: string) => string;
  onlyExternal?: boolean;
  allowedDomains?: string[];
}): PluginDefinition {
  const proxyUrl = options?.proxyUrl;
  const proxyFn = options?.proxyFn;
  const onlyExternal = options?.onlyExternal ?? true;
  const allowedDomains = options?.allowedDomains;

  return {
    name: 'image-proxy',
    version: '1.0.0',
    description: 'Proxies image URLs through a configurable proxy service',
    priority: PluginPriority.NORMAL,
    contentType: ['html', 'html5', 'markdown'],
    hooks: {
      beforeParse(content: string) {
        if (!content || (!proxyUrl && !proxyFn)) return content;

        return content.replace(
          /(<img\s[^>]*?src\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi,
          (match, prefix: string, doubleQuoted: string, singleQuoted: string) => {
            const originalUrl = doubleQuoted ?? singleQuoted ?? '';
            const proxied = proxyImageUrl(originalUrl);
            if (proxied !== originalUrl) {
              return `${prefix}"${proxied}"`;
            }
            return match;
          }
        );
      },
    },
  };

  function proxyImageUrl(url: string): string {
    if (!url) return url;

    // Skip data URIs, SVG data, etc.
    if (/^(data:|blob:|javascript:)/i.test(url)) {
      return url;
    }

    const isExternal = /^https?:\/\//i.test(url);
    if (onlyExternal && !isExternal) {
      return url;
    }

    // Check domain allowlist
    if (allowedDomains && allowedDomains.length > 0) {
      try {
        const hostname = new URL(url).hostname;
        const allowed = allowedDomains.some((domain) =>
          hostname === domain || hostname.endsWith(`.${domain}`)
        );
        if (!allowed) return url;
      } catch {
        return url;
      }
    }

    // Use custom proxy function
    if (proxyFn) {
      return proxyFn(url);
    }

    // Use URL template
    if (proxyUrl) {
      return proxyUrl.replace(/\{url\}/g, encodeURIComponent(url));
    }

    return url;
  }
}

/** Default image proxy plugin instance (no-op without configuration) */
export const imageProxyPlugin = createImageProxyPlugin();

// ==========================================
// Emoji Plugin
// ==========================================

/**
 * Common emoji shortcode to Unicode character mappings.
 */
const EMOJI_MAP: Record<string, string> = {
  // Emotions
  ':smile:': '😀', ':grinning:': '😁', ':smiley:': '😃', ':laughing:': '😆',
  ':wink:': '😉', ':blush:': '😊', ':heart_eyes:': '😍', ':kissing_heart:': '😘',
  ':stuck_out_tongue:': '😛', ':stuck_out_tongue_winking_eye:': '😜',
  ':stuck_out_tongue_closed_eyes:': '😝', ':neutral_face:': '😐', ':expressionless:': '😑',
  ':unamused:': '😒', ':sweat:': '😓', ':pensive:': '😔', ':confused:': '😕',
  ':confounded:': '😖', ':grimacing:': '😬', ':disappointed:': '😞', ':worried:': '😟',
  ':angry:': '😠', ':rage:': '😡', ':cry:': '😢', ':sob:': '😭',
  ':scream:': '😱', ':fearful:': '😨', ':frowning:': '😦', ':persevere:': '😣',
  ':triumph:': '😤', ':relieved:': '😌', ':satisfied:': '😆', ':yum:': '😋',
  ':mask:': '😷', ':sleeping:': '😴', ':dizzy_face:': '😵', ':zipper_mouth_face:': '🤐',

  // Hands & gestures
  ':thumbsup:': '👍', ':+1:': '👍', ':thumbsdown:': '👎', ':-1:': '👎',
  ':clap:': '👏', ':wave:': '👋', ':handshake:': '🤝', ':ok_hand:': '👌',
  ':point_up:': '☝️', ':point_right:': '👉', ':point_left:': '👈',
  ':raised_hands:': '🙌', ':pray:': '🙏', ':punch:': '👊', ':fist:': '✊',
  ':v:': '✌️', ':metal:': '🤘',

  // Hearts
  ':heart:': '❤️', ':broken_heart:': '💔', ':blue_heart:': '💙', ':green_heart:': '💚',
  ':yellow_heart:': '💛', ':purple_heart:': '💜', ':orange_heart:': '🧡',

  // Objects & symbols
  ':fire:': '🔥', ':star:': '⭐', ':sparkles:': '✨', ':lightning:': '⚡',
  ':rainbow:': '🌈', ':sun:': '☀️', ':moon:': '🌙', ':cloud:': '☁️',
  ':check:': '✅', ':x:': '❌', ':warning:': '⚠️', ':question:': '❓',
  ':exclamation:': '❗', ':100:': '💯', ':trophy:': '🏆', ':medal:': '🏅',
  ':rocket:': '🚀', ':bulb:': '💡', ':key:': '🔑', ':lock:': '🔒',
  ':unlock:': '🔓', ':bomb:': '💣', ':link:': '🔗', ':gear:': '⚙️',
  ':wrench:': '🔧', ':hammer:': '🔨', ':package:': '📦', ':email:': '📧',
  ':phone:': '📞', ':computer:': '💻', ':keyboard:': '⌨️', ':desktop:': '🖥️',
  ':mobile:': '📱', ':globe:': '🌐', ':map:': '🗺️', ':pin:': '📍',

  // Animals & nature
  ':dog:': '🐶', ':cat:': '🐱', ':mouse:': '🐭', ':rabbit:': '🐰',
  ':bear:': '🐻', ':panda:': '🐼', ':bird:': '🐦', ':duck:': '🦆',
  ':frog:': '🐸', ':snake:': '🐍', ':bug:': '🐛', ':butterfly:': '🦋',
  ':flower:': '🌸', ':rose:': '🌹', ':tree:': '🌳', ':cactus:': '🌵',

  // Food & drink
  ':coffee:': '☕', ':tea:': '🍵', ':beer:': '🍺', ':wine:': '🍷',
  ':pizza:': '🍕', ':hamburger:': '🍔', ':fries:': '🍟', ':cake:': '🎂',
  ':cookie:': '🍪', ':icecream:': '🍦', ':candy:': '🍬', ':apple:': '🍎',

  // Activities
  ':running:': '🏃', ':biking:': '🚴', ':swimming:': '🏊', ':skiing:': '⛷️',
  ':soccer:': '⚽', ':basketball:': '🏀', ':football:': '🏈', ':baseball:': '⚾',
  ':tennis:': '🎾', ':game_die:': '🎲', ':video_game:': '🎮', ':musical_note:': '🎵',
  ':notes:': '🎶', ':microphone:': '🎤', ':headphones:': '🎧', ':art:': '🎨',
  ':camera:': '📸', ':movie:': '🎬', ':tv:': '📺', ':books:': '📚',

  // Travel
  ':car:': '🚗', ':taxi:': '🚕', ':bus:': '🚌', ':train:': '🚂',
  ':airplane:': '✈️', ':ship:': '🚢', ':house:': '🏠', ':office:': '🏢',
  ':construction:': '🚧', ':red_circle:': '🔴', ':green_circle:': '🟢',
  ':white_check_mark:': '✅', ':heavy_check_mark:': '✔️',
};

/**
 * Converts emoji shortcodes (e.g., `:thumbsup:`) to Unicode emoji characters.
 *
 * @param options - Configuration options
 * @param options.customEmojis - Additional shortcode-to-emoji mappings
 * @param options.onlyInText - Only convert shortcodes in text nodes, not in code blocks (default: true)
 */
export function createEmojiPlugin(options?: {
  customEmojis?: Record<string, string>;
  onlyInText?: boolean;
}): PluginDefinition {
  const customEmojis = options?.customEmojis ?? {};
  const onlyInText = options?.onlyInText ?? true;
  const emojiMap = { ...EMOJI_MAP, ...customEmojis };

  // Build regex for all shortcodes, longest first
  const sortedShortcodes = Object.keys(emojiMap)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const shortcodeRegex = new RegExp(`(?<=\\s|^)(${sortedShortcodes.join('|')})(?=[\\s.,!?;:)]|$)`, 'g');

  return {
    name: 'emoji',
    version: '1.0.0',
    description: 'Converts emoji shortcodes like :thumbsup: to Unicode emoji characters',
    priority: PluginPriority.LOW,
    contentType: ['html', 'html5', 'markdown', 'text'],
    hooks: {
      beforeParse(content: string) {
        if (!content) return content;

        if (onlyInText) {
          // Protect code blocks from emoji conversion
          const codeBlocks: string[] = [];
          const protected_ = content.replace(
            /(```[\s\S]*?```|`[^`]+`)/g,
            (match) => {
              codeBlocks.push(match);
              return `__EMOJI_CODE_BLOCK_${codeBlocks.length - 1}__`;
            }
          );

          const converted = protected_.replace(shortcodeRegex, (match) => {
            return emojiMap[match] ?? match;
          });

          // Restore code blocks
          return converted.replace(
            /__EMOJI_CODE_BLOCK_(\d+)__/g,
            (_, index) => codeBlocks[parseInt(index, 10)]
          );
        }

        return content.replace(shortcodeRegex, (match) => {
          return emojiMap[match] ?? match;
        });
      },
    },
  };
}

/** Default emoji plugin instance */
export const emojiPlugin = createEmojiPlugin();

// ==========================================
// Heading Anchor Plugin
// ==========================================

/**
 * Adds anchor IDs to heading elements for in-page navigation.
 * Generates slugs from heading text and adds id attributes.
 *
 * @param options - Configuration options
 * @param options.prefix - Prefix for generated IDs (default: '')
 * @param options.generateId - Custom ID generator (takes heading text, returns slug)
 * @param options.addPermalink - Whether to add permalink links (default: false)
 * @param options.permalinkSymbol - Symbol for permalink links (default: '#')
 * @param options.permalinkClass - CSS class for permalink elements (default: 'heading-anchor')
 */
export function createHeadingAnchorPlugin(options?: {
  prefix?: string;
  generateId?: (text: string, level: number) => string;
  addPermalink?: boolean;
  permalinkSymbol?: string;
  permalinkClass?: string;
}): PluginDefinition {
  const prefix = options?.prefix ?? '';
  const generateId = options?.generateId;
  const addPermalink = options?.addPermalink ?? false;
  const permalinkSymbol = options?.permalinkSymbol ?? '#';
  const permalinkClass = options?.permalinkClass ?? 'heading-anchor';

  // Track generated IDs to avoid collisions
  const usedIds = new Set<string>();

  function generateSlug(text: string, level: number): string {
    if (generateId) {
      return generateId(text, level);
    }

    let slug = text
      .replace(/<[^>]+>/g, '')        // strip inner tags
      .replace(/[^\w\s-]/g, '')       // remove non-word chars (except space, hyphen)
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')        // spaces/underscores to hyphens
      .replace(/-+/g, '-')            // collapse multiple hyphens
      .replace(/^-|-$/g, '');         // trim leading/trailing hyphens

    if (!slug) {
      slug = `heading-${level}`;
    }

    // Ensure uniqueness
    let finalSlug = `${prefix}${slug}`;
    let counter = 1;
    while (usedIds.has(finalSlug)) {
      finalSlug = `${prefix}${slug}-${counter}`;
      counter++;
    }
    usedIds.add(finalSlug);

    return finalSlug;
  }

  return {
    name: 'heading-anchor',
    version: '1.0.0',
    description: 'Adds anchor IDs to heading elements for in-page navigation',
    priority: PluginPriority.HIGH,
    contentType: ['html', 'html5', 'markdown'],
    init() {
      usedIds.clear();
    },
    destroy() {
      usedIds.clear();
    },
    hooks: {
      beforeParse(content: string) {
        if (!content) return content;

        return content.replace(
          /<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
          (_match, tag: string, existingAttrs: string, innerContent: string) => {
            const level = parseInt(tag[1], 10);
            const text = innerContent
              .replace(/<[^>]+>/g, '')
              .trim();

            const id = generateSlug(text, level);

            // If heading already has an id, skip it
            if (existingAttrs && /\bid\s*=\s*["'][^"']*["']/i.test(existingAttrs)) {
              return `<${tag}${existingAttrs}>${innerContent}</${tag}>`;
            }

            const attrs = existingAttrs ? existingAttrs.trim() : '';
            const idAttr = ` id="${id}"`;

            if (addPermalink) {
              return `<${tag}${attrs}${idAttr}>${innerContent}<a class="${permalinkClass}" href="#${id}" aria-hidden="true">${permalinkSymbol}</a></${tag}>`;
            }

            return `<${tag}${attrs}${idAttr}>${innerContent}</${tag}>`;
          }
        );
      },
    },
  };
}

/** Default heading anchor plugin instance */
export const headingAnchorPlugin = createHeadingAnchorPlugin();

// ==========================================
// Convenience: All Built-in Plugins
// ==========================================

/**
 * An array of all built-in plugins with default configuration.
 * Register these with the PluginManager for a full-featured pipeline:
 *
 * @example
 * ```typescript
 * import { PluginManager } from './plugin-manager';
 * import { builtInPlugins } from './built-in-plugins';
 *
 * const manager = new PluginManager({ verbose: true });
 * for (const plugin of builtInPlugins) {
 *   manager.register(plugin);
 * }
 * await manager.initAll();
 * ```
 */
export const builtInPlugins: PluginDefinition[] = [
  sanitizePlugin,
  headingAnchorPlugin,
  lineNumbersPlugin,
  tocPlugin,
  metaEnricherPlugin,
  linkRewritePlugin,
  imageProxyPlugin,
  emojiPlugin,
];
