import { decode as entitiesDecode, encode as entitiesEncode } from 'entities';

export const DEFAULT_ALLOWED_TAGS = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
  'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
  'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div',
  'colgroup', 'data', 'dd', 'del', 'details', 'dfn', 'dialog', 'div',
  'dl', 'dt', 'em', 'figcaption', 'figure', 'footer',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
  'i', 'iframe', 'img', 'ins', 'kbd', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol',
  'output', 'p', 'param', 'picture', 'pre', 'progress',
  'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'slot',
  'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table',
  'tbody', 'td', 'template', 'tfoot', 'th', 'thead', 'time', 'title',
  'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
  // SVG elements
  'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
  'ellipse', 'text', 'tspan', 'textPath', 'defs', 'use', 'clipPath',
  'linearGradient', 'radialGradient', 'stop', 'pattern', 'mask',
  'symbol', 'foreignObject', 'image', 'animate', 'animateTransform',
]);

export const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel', 'name', 'download'],
  'img': ['src', 'alt', 'title', 'width', 'height', 'loading', 'srcset', 'sizes', 'crossorigin'],
  'td': ['colspan', 'rowspan', 'headers'],
  'th': ['colspan', 'rowspan', 'headers', 'scope'],
  'ol': ['start', 'type', 'reversed'],
  'li': ['value'],
  'blockquote': ['cite'],
  'q': ['cite'],
  'time': ['datetime'],
  'abbr': ['title'],
  'details': ['open'],
  'form': ['action', 'method', 'enctype', 'name', 'target', 'novalidate'],
  'input': ['type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly',
           'checked', 'min', 'max', 'step', 'pattern', 'maxlength', 'minlength',
           'autocomplete', 'autofocus', 'form', 'formaction', 'formmethod'],
  'select': ['name', 'required', 'disabled', 'multiple', 'size', 'form'],
  'option': ['value', 'selected', 'disabled', 'label'],
  'textarea': ['name', 'required', 'disabled', 'readonly', 'placeholder', 'rows', 'cols',
              'maxlength', 'minlength', 'form', 'wrap'],
  'button': ['type', 'name', 'value', 'disabled', 'form', 'formaction', 'formmethod'],
  'label': ['for'],
  'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'sandbox', 'loading', 'srcdoc'],
  'source': ['src', 'type', 'media', 'sizes', 'srcset'],
  'track': ['src', 'kind', 'srclang', 'label', 'default'],
  'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height',
            'preload', 'playsinline'],
  'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],
  'meta': ['name', 'content', 'charset', 'http-equiv', 'property'],
  'link': ['rel', 'href', 'type', 'media', 'sizes', 'hreflang', 'as', 'crossorigin'],
  'col': ['span'],
  'colgroup': ['span'],
  'table': ['border', 'cellpadding', 'cellspacing'],
  // SVG attributes
  'svg': ['viewBox', 'width', 'height', 'xmlns', 'preserveAspectRatio', 'fill', 'stroke'],
  'g': ['transform', 'fill', 'stroke', 'opacity'],
  'path': ['d', 'fill', 'stroke', 'stroke-width', 'transform', 'opacity'],
  'circle': ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
  'rect': ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width'],
  'line': ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'],
  'polyline': ['points', 'fill', 'stroke', 'stroke-width'],
  'polygon': ['points', 'fill', 'stroke', 'stroke-width'],
  'ellipse': ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke', 'stroke-width'],
  'text': ['x', 'y', 'fill', 'font-size', 'font-family', 'text-anchor', 'dominant-baseline'],
  'tspan': ['x', 'y', 'fill', 'font-size', 'font-weight'],
  'defs': [],
  'use': ['href', 'xlink:href'],
  'clipPath': ['id', 'clipPathUnits'],
  'linearGradient': ['id', 'x1', 'y1', 'x2', 'y2', 'gradientUnits'],
  'radialGradient': ['id', 'cx', 'cy', 'r', 'fx', 'fy', 'gradientUnits'],
  'stop': ['offset', 'stop-color', 'stop-opacity'],
  'pattern': ['id', 'x', 'y', 'width', 'height', 'patternUnits'],
  'mask': ['id', 'x', 'y', 'width', 'height', 'maskUnits'],
  'symbol': ['id', 'viewBox'],
  'foreignObject': ['x', 'y', 'width', 'height'],
  'animate': ['attributeName', 'from', 'to', 'dur', 'repeatCount'],
  'animateTransform': ['attributeName', 'type', 'from', 'to', 'dur', 'repeatCount'],
  '*': ['id', 'class', 'style', 'role', 'aria-*', 'data-*', 'tabindex', 'title',
        'hidden', 'dir', 'lang', 'translate', 'draggable', 'spellcheck'],
};

const DANGEROUS_TAGS = new Set([
  'script', 'noscript', 'object', 'embed', 'applet', 'frame', 'frameset',
]);

const DANGEROUS_ATTRIBUTES = new Set([
  // Mouse events
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
  'onmousemove', 'onmouseenter', 'onmouseleave', 'oncontextmenu', 'onwheel',
  // Keyboard events
  'onkeydown', 'onkeyup', 'onkeypress',
  // Focus events
  'onfocus', 'onblur', 'onfocusin', 'onfocusout',
  // Form events
  'onsubmit', 'onreset', 'onchange', 'onselect', 'oninput', 'oninvalid',
  // Drag events
  'ondrag', 'ondragstart', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover',
  'ondrop',
  // Clipboard events
  'oncopy', 'oncut', 'onpaste', 'onbeforecopy', 'onbeforecut',
  'onbeforepaste', 'onaftercopy', 'onaftercut', 'onafterpaste',
  // Animation events
  'onanimationstart', 'onanimationend', 'onanimationiteration',
  // Transition events
  'ontransitionstart', 'ontransitionend', 'ontransitionrun', 'ontransitioncancel',
  // Touch events
  'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel',
  // Pointer events
  'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerenter',
  'onpointerleave', 'onpointerover', 'onpointerout', 'onpointercancel',
  'ongotpointercapture', 'onlostpointercapture',
  // Media events
  'onloadstart', 'onprogress', 'onsuspend', 'onabort', 'onemptied',
  'onstalled', 'onloadedmetadata', 'onloadeddata', 'oncanplay', 'oncanplaythrough',
  'onplaying', 'onwaiting', 'onseeking', 'onseeked', 'ontimeupdate', 'onended',
  'ondurationchange', 'onplay', 'onpause', 'onvolumechange',
  // Window events
  'onload', 'onunload', 'onerror', 'onresize', 'onscroll',
  'onbeforeunload', 'onhashchange', 'onpopstate', 'onstorage',
  'onmessage', 'onmessageerror',
  'onoffline', 'ononline', 'onpagehide', 'onpageshow',
  // Security
  'onsecuritypolicyviolation', 'onauxclick',
  // Other
  'formaction', 'xlink:href', 'data-bind', 'v-bind', 'ng-click', 'nsonclick',
]);

/**
 * Dangerous URL schemes that can execute JavaScript.
 */
const DANGEROUS_URL_SCHEMES = [
  /^\s*javascript\s*:/i,
  /^\s*vbscript\s*:/i,
  /^\s*data\s*:(?!image\/(png|gif|jpeg|jpg|svg\+xml|webp|avif|bmp|ico))/i,
];

/**
 * Check if a URL value is dangerous.
 */
function isDangerousURL(url: string): boolean {
  if (!url) return false;
  return DANGEROUS_URL_SCHEMES.some(pattern => pattern.test(url));
}

/**
 * Validate a data: URI — only allow safe image MIME types.
 */
function isSafeDataURI(value: string): boolean {
  if (!value || !value.startsWith('data:')) return false;
  // Allow image/* MIME types
  return /^data:image\/(png|gif|jpeg|jpg|svg\+xml|webp|avif|bmp|ico|tiff);/i.test(value);
}

/**
 * Protect against DOM clobbering by checking for dangerous name/id attributes.
 * Elements with name="submit" or id="form" can shadow DOM properties.
 */
function isDOMClobberingRisk(tagName: string, attrName: string, attrValue: string): boolean {
  if (attrName !== 'name' && attrName !== 'id') return false;
  const dangerousNames = ['submit', 'action', 'form', 'input', 'hidden', 'results', 'securitypolicyviolation'];
  return dangerousNames.includes(attrValue.toLowerCase());
}

export interface SanitizeOptions {
  allowedTags?: string[];
  disallowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  disallowedAttributes?: string[];
  allowScripts?: boolean;
  allowStyles?: boolean;
  allowComments?: boolean;
  allowDangerousTags?: boolean;
  allowIframes?: boolean;
  allowSVG?: boolean;
  stripTags?: string[];
}

export function sanitizeHTML(
  content: string,
  options?: SanitizeOptions
): string {
  if (!content) return '';

  const allowedTags = new Set(
    options?.allowedTags || Array.from(DEFAULT_ALLOWED_TAGS)
  );

  const disallowedTags = new Set(options?.disallowedTags || []);
  const allowedAttributes = options?.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES;
  const disallowedAttributes = new Set(options?.disallowedAttributes || []);

  if (!options?.allowDangerousTags) {
    for (const tag of DANGEROUS_TAGS) {
      allowedTags.delete(tag);
      disallowedTags.add(tag);
    }
  }

  if (!options?.allowScripts) {
    disallowedTags.add('script');
    disallowedTags.add('noscript');
    allowedTags.delete('script');
    allowedTags.delete('noscript');
  }

  if (!options?.allowStyles) {
    disallowedTags.add('style');
    allowedTags.delete('style');
  }

  if (options?.allowScripts) {
    allowedTags.add('script');
    disallowedTags.delete('script');
  }

  if (options?.allowStyles) {
    allowedTags.add('style');
    disallowedTags.delete('style');
  }

  if (!options?.allowIframes) {
    disallowedTags.add('iframe');
    allowedTags.delete('iframe');
  }

  if (!options?.allowSVG) {
    const svgTags = ['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
      'ellipse', 'text', 'tspan', 'textPath', 'defs', 'use', 'clipPath',
      'linearGradient', 'radialGradient', 'stop', 'pattern', 'mask',
      'symbol', 'foreignObject', 'animate', 'animateTransform'];
    for (const tag of svgTags) {
      disallowedTags.add(tag);
      allowedTags.delete(tag);
    }
  }

  // Process content
  let result = content;

  // Strip comments if not allowed
  if (!options?.allowComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Parse and rebuild HTML
  result = processHTMLTags(result, {
    allowedTags,
    disallowedTags,
    allowedAttributes,
    disallowedAttributes,
    stripTags: new Set(options?.stripTags || []),
    allowComments: !!options?.allowComments,
  });

  return result;
}

function processHTMLTags(
  content: string,
  config: {
    allowedTags: Set<string>;
    disallowedTags: Set<string>;
    allowedAttributes: Record<string, string[]>;
    disallowedAttributes: Set<string>;
    stripTags: Set<string>;
    allowComments: boolean;
  }
): string {
  let result = '';
  let i = 0;
  const len = content.length;

  while (i < len) {
    if (content[i] === '<') {
      // Check for closing tag
      if (content[i + 1] === '/') {
        const end = content.indexOf('>', i);
        if (end === -1) {
          result += content.slice(i);
          break;
        }
        const tagName = content.slice(i + 2, end).trim().split(/\s+/)[0].toLowerCase();
        i = end + 1;

        if (config.disallowedTags.has(tagName) || config.stripTags.has(tagName)) {
          continue; // Strip tag but keep content
        }
        if (config.allowedTags.has(tagName)) {
          result += `</${tagName}>`;
        }
        // Otherwise strip the tag entirely
        continue;
      }

      // Check for comment (already handled above, but safety)
      if (content.slice(i, i + 4) === '<!--') {
        const end = content.indexOf('-->', i);
        if (end === -1) {
          if (config.allowComments) result += content.slice(i);
          break;
        }
        if (config.allowComments) {
          result += content.slice(i, end + 3);
        }
        i = end + 3;
        continue;
      }

      // Opening tag or self-closing
      const end = content.indexOf('>', i);
      if (end === -1) {
        result += content.slice(i);
        break;
      }

      const tagContent = content.slice(i + 1, end);
      const isSelfClosing = tagContent.endsWith('/');
      const cleanTagContent = isSelfClosing ? tagContent.slice(0, -1) : tagContent;
      const parts = cleanTagContent.split(/\s+/);
      const tagName = parts[0].toLowerCase();
      const attrsStr = parts.slice(1).join(' ');

      i = end + 1;

      if (config.disallowedTags.has(tagName) || config.stripTags.has(tagName)) {
        continue; // Strip tag, keep inner content
      }

      if (!config.allowedTags.has(tagName)) {
        continue; // Strip unknown tags
      }

      // Filter attributes
      const filteredAttrs = filterAttributes(tagName, attrsStr, config);
      const attrStr = filteredAttrs ? ' ' + filteredAttrs : '';
      const close = isSelfClosing ? ' /' : '';

      result += `<${tagName}${attrStr}${close}>`;
    } else {
      result += content[i];
      i++;
    }
  }

  return result;
}

function filterAttributes(
  tagName: string,
  attrsStr: string,
  config: {
    allowedAttributes: Record<string, string[]>;
    disallowedAttributes: Set<string>;
  }
): string {
  if (!attrsStr.trim()) return '';

  const attrs: string[] = [];
  let i = 0;
  const len = attrsStr.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(attrsStr[i])) i++;
    if (i >= len) break;

    // Read attribute name
    const nameStart = i;
    while (i < len && !/[\s=]/.test(attrsStr[i])) i++;
    const name = attrsStr.slice(nameStart, i).toLowerCase();

    // Skip whitespace
    while (i < len && /\s/.test(attrsStr[i])) i++;

    // Check for value
    let value: string | null = null;
    if (i < len && attrsStr[i] === '=') {
      i++;
      // Skip whitespace
      while (i < len && /\s/.test(attrsStr[i])) i++;

      if (i < len && (attrsStr[i] === '"' || attrsStr[i] === "'")) {
        const quote = attrsStr[i];
        i++;
        const valueStart = i;
        while (i < len && attrsStr[i] !== quote) i++;
        value = attrsStr.slice(valueStart, i);
        if (i < len) i++; // skip closing quote
      } else {
        const valueStart = i;
        while (i < len && !/\s/.test(attrsStr[i])) i++;
        value = attrsStr.slice(valueStart, i);
      }
    }

    // Check if attribute is allowed
    if (isAttributeAllowed(tagName, name, config)) {
      // Sanitize value
      const sanitizedValue = sanitizeAttributeValue(tagName, name, value);
      if (sanitizedValue === null) continue;

      // Check for dangerous URLs
      if (name === 'href' || name === 'src' || name === 'action' ||
          name === 'formaction' || name === 'poster' || name === 'data') {
        if (isDangerousURL(sanitizedValue)) continue;
      }

      // DOM clobbering check
      if (value && isDOMClobberingRisk(tagName, name, value)) continue;

      if (value !== null) {
        attrs.push(`${name}="${sanitizedValue}"`);
      } else {
        attrs.push(name);
      }
    }
  }

  return attrs.join(' ');
}

function isAttributeAllowed(
  tagName: string,
  attrName: string,
  config: {
    allowedAttributes: Record<string, string[]>;
    disallowedAttributes: Set<string>;
  }
): boolean {
  // Check event handlers and dangerous attributes
  if (DANGEROUS_ATTRIBUTES.has(attrName)) return false;
  if (attrName.startsWith('on')) return false;
  if (config.disallowedAttributes.has(attrName)) return false;

  // Check against allowed attributes for the tag
  const tagAllowed = config.allowedAttributes[tagName] || [];
  const globalAllowed = config.allowedAttributes['*'] || [];

  // Support wildcards
  if (tagAllowed.includes(attrName)) return true;
  if (globalAllowed.includes(attrName)) return true;

  // Check for pattern matches like aria-* and data-*
  if (attrName.startsWith('aria-') && (tagAllowed.includes('aria-*') || globalAllowed.includes('aria-*'))) {
    return true;
  }
  if (attrName.startsWith('data-') && (tagAllowed.includes('data-*') || globalAllowed.includes('data-*'))) {
    return true;
  }

  return false;
}

function sanitizeAttributeValue(tagName: string, name: string, value: string | null): string | null {
  if (value === null) return null;

  // Remove javascript: URLs from all URL-bearing attributes
  const urlAttributes = ['href', 'src', 'action', 'formaction', 'poster', 'data', 'xlink:href'];
  if (urlAttributes.includes(name) && isDangerousURL(value)) {
    return null;
  }

  // For href specifically, block data: URIs (only allow in src for images)
  if (name === 'href' && /^\s*data\s*:/i.test(value)) {
    return null;
  }

  // For src on img/source/video/audio, validate data: URIs are safe
  if (name === 'src' && value.startsWith('data:') && !isSafeDataURI(value)) {
    return null;
  }

  // For iframe src, block data: URIs entirely
  if (tagName === 'iframe' && name === 'src' && value.startsWith('data:')) {
    return null;
  }

  return value;
}

export function stripTags(content: string, tags?: string[]): string {
  if (!content) return '';
  if (!tags || tags.length === 0) {
    return content.replace(/<[^>]+>/g, '');
  }

  let result = content;
  for (const tag of tags) {
    const regex = new RegExp(`<${tag}[^>]*>`, 'gi');
    result = result.replace(regex, '');
    const closeRegex = new RegExp(`</${tag}>`, 'gi');
    result = result.replace(closeRegex, '');
  }
  return result;
}

export function stripAttributes(content: string, attributes?: string[]): string {
  if (!content) return '';

  if (!attributes || attributes.length === 0) {
    return content.replace(/<(\w+)(\s+[^>]+)>/g, (match, tagName) => {
      return `<${tagName}>`;
    });
  }

  let result = content;
  for (const attr of attributes) {
    const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s+${escapedAttr}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`, 'gi');
    result = result.replace(regex, '');
  }
  return result;
}

export function stripScripts(content: string): string {
  if (!content) return '';
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*\S+/gi, '');
}

export function stripStyles(content: string): string {
  if (!content) return '';
  return content
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*rel=["']stylesheet["'][^>]*\/?>/gi, '')
    .replace(/\s+style\s*=\s*["'][^"']*["']/gi, '');
}

export function escapeHTML(content: string): string {
  if (!content) return '';
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function unescapeHTML(content: string): string {
  if (!content) return '';
  return content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export function encodeEntities(content: string): string {
  if (!content) return '';
  return (entitiesEncode as any)(content, { mode: 'nonUTF', level: 'xml' });
}

export function decodeEntities(content: string): string {
  if (!content) return '';
  try {
    return entitiesDecode(content);
  } catch {
    return unescapeHTML(content);
  }
}


// ==========================================
// Enhanced Sanitize Functions
// ==========================================

/**
 * Sanitize HTML with extended options including custom allowed lists.
 */
export function sanitizeHTMLWithOptions(
  content: string,
  options?: SanitizeOptions
): string {
  return sanitizeHTML(content, options);
}

/**
 * Sanitize SVG content - remove script elements and dangerous attributes.
 */
export function sanitizeSVG(svgContent: string): string {
  if (!svgContent) return '';
  let result = svgContent;
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<script[^>]*\/?>/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
  result = result.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  return result;
}

/**
 * Sanitize MathML content - remove script elements and dangerous attributes.
 */
export function sanitizeMathML(mathmlContent: string): string {
  if (!mathmlContent) return '';
  let result = mathmlContent;
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<script[^>]*\/?>/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
  result = result.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  return result;
}

/**
 * Strip all event handler attributes from HTML content.
 */
export function stripEventHandlers(content: string): string {
  if (!content) return '';
  return content.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
}

/**
 * Strip all data-* attributes from HTML content.
 */
export function stripDataAttributes(content: string): string {
  if (!content) return '';
  return content.replace(/\s+data-[\w-]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
}

/**
 * Check if HTML content is safe (no scripts, no dangerous URLs, no event handlers).
 */
export function isSafeHTML(content: string): boolean {
  if (!content) return true;
  if (/<script/i.test(content)) return false;
  if (/javascript\s*:/i.test(content)) return false;
  if (/vbscript\s*:/i.test(content)) return false;
  if (/\son\w+\s*=/i.test(content)) return false;
  if (/data\s*:(?!image\/)/i.test(content)) return false;
  return true;
}
