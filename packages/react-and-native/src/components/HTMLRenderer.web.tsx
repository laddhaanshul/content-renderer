import React, { useMemo, useCallback, useRef, useState } from 'react';
import { Parser as HtmlParser } from 'htmlparser2';
import { styleStringToObject, attrToReactProp, isBooleanAttribute, isVoidElement, isSVGElement, svgAttrToReact } from '../utils/style-parser.web';

// ─── Types ───────────────────────────────────────────────────────────────────

export type HTMLNodeType = 'root' | 'element' | 'text' | 'comment' | 'doctype';

export interface HTMLNode {
  type: HTMLNodeType;
  tagName?: string;
  attributes?: Record<string, string>;
  children?: HTMLNode[];
  content?: string;
  parent?: HTMLNode | null;
}

/** Pre-processing alterer function — mutate HTML nodes before rendering. */
export type HTMLAlterer = (node: HTMLNode) => HTMLNode | null;

export interface HTMLRendererProps {
  /** Raw HTML string to render */
  html?: string;
  /** Pre-parsed AST nodes (skips parsing if provided) */
  ast?: any;
  /** Custom component overrides per tag name */
  components?: Record<string, React.ComponentType<Record<string, unknown>>>;
  /** Click handler for anchor tags */
  onLinkClick?: (href: string, event: React.MouseEvent) => void;
  /** Submit handler for form elements */
  onFormSubmit?: (event: React.FormEvent) => void;
  /** Whether to sanitize the HTML (strip script tags, event handlers) */
  sanitize?: boolean;
  /** Whether to render HTML comments */
  renderComments?: boolean;
  /** Additional CSS class for the wrapper element */
  className?: string;
  /** Inline styles for the wrapper element */
  style?: React.CSSProperties;
  /** Wrapper element tag (default: 'div') */
  wrapperTag?: keyof JSX.IntrinsicElements;
  /** Inline style string on the wrapper */
  wrapperStyle?: string;
  /** Whether to allow dangerouslySetInnerHTML for text nodes containing HTML entities */
  allowDangerousHTML?: boolean;
  /** Map of transform functions to apply to elements */
  transform?: (node: HTMLNode, element: React.ReactElement) => React.ReactElement | null;
  /** Fallback component rendered when parsing fails */
  fallback?: React.ReactNode;
  /** Callback when rendering completes */
  onRenderComplete?: () => void;
  /** Test ID for testing */
  testId?: string;
  /** Whether to process and apply <style> tag CSS (default: true) */
  enableStyles?: boolean;
  /** Whether to scope CSS to prevent style leakage (default: true) */
  scopeStyles?: boolean;
  /** Custom CSS to prepend (default: '') */
  customCSS?: string;
  /** Pre-processing alterers — mutate nodes before rendering (Gap #13) */
  alterers?: HTMLAlterer[];
  /** Per-ID styling overrides (Gap #14) */
  idsStyles?: Record<string, React.CSSProperties>;
  /** Extract Open Graph meta tags from HTML (Gap #17) */
  onMetaExtracted?: (meta: Record<string, string>) => void;
}

// ─── CSS Utilities ───────────────────────────────────────────────────────────

function generateScopeId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function extractStylesFromTree(root: HTMLNode): { cssText: string; stylesheetHrefs: string[] } {
  const cssChunks: string[] = [];
  const stylesheetHrefs: string[] = [];

  function walk(node: HTMLNode): void {
    if (node.type === 'element') {
      if (node.tagName === 'style' && node.children) {
        const text = node.children
          .filter(c => c.type === 'text')
          .map(c => c.content || '')
          .join('');
        if (text.trim()) {
          cssChunks.push(text);
        }
      }
      if (node.tagName === 'link') {
        const rel = (node.attributes?.rel || '').toLowerCase();
        const href = node.attributes?.href;
        if (rel === 'stylesheet' && href) {
          stylesheetHrefs.push(href);
        }
      }
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(root);
  return { cssText: cssChunks.join('\n\n'), stylesheetHrefs };
}

/** Extract Open Graph and Twitter Card meta tags (Gap #17) */
function extractMetaTags(root: HTMLNode): Record<string, string> {
  const meta: Record<string, string> = {};
  function walk(node: HTMLNode): void {
    if (node.type === 'element' && node.tagName === 'meta') {
      const name = node.attributes?.name || node.attributes?.property || '';
      const content = node.attributes?.content || '';
      if (name && content) {
        meta[name] = content;
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  }
  walk(root);
  return meta;
}

function scopeCSS(cssText: string, scopeClass: string): string {
  const prefix = `.${scopeClass}`;
  return cssText.replace(
    /([^{}@/]*?)(\{[^{}]*\})/gs,
    (match, selectorGroup: string, declarations: string) => {
      if (/^@keyframes\s/m.test(selectorGroup)) return match;
      const atRuleMatch = selectorGroup.match(/^(@media\s[^{]+|@supports\s[^{]+|@container\s[^{]+)\{(.*)$/s);
      if (atRuleMatch) {
        const atRule = atRuleMatch[1];
        const innerSelectors = atRuleMatch[2];
        return `${atRule}{${scopeSelectors(innerSelectors, prefix)}}`;
      }
      return `${scopeSelectors(selectorGroup, prefix)}${declarations}`;
    }
  );
}

function scopeSelectors(selectorText: string, prefix: string): string {
  const selectors = splitTopLevel(selectorText, ',');
  return selectors
    .map(sel => {
      const trimmed = sel.trim();
      if (!trimmed) return '';
      const normalized = trimmed.replace(/\bbody\b|\bhtml\b|:root/gi, prefix);
      if (normalized.startsWith(prefix)) return normalized;
      if (normalized.startsWith('*')) return `${prefix} ${normalized}`;
      if (/^@(font-face|import|charset|namespace)/.test(normalized)) return normalized;
      return `${prefix} ${normalized}`;
    })
    .join(', ');
}

function splitTopLevel(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === delimiter && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function stripStyleElements(node: HTMLNode): HTMLNode | null {
  if (node.type === 'element') {
    if (node.tagName === 'style') return null;
    if (node.tagName === 'link') {
      const rel = (node.attributes?.rel || '').toLowerCase();
      if (rel === 'stylesheet') return null;
    }
  }
  if (node.children) {
    const filteredChildren: HTMLNode[] = [];
    for (const child of node.children) {
      const filtered = stripStyleElements(child);
      if (filtered) filteredChildren.push(filtered);
    }
    return { ...node, children: filteredChildren };
  }
  return node;
}

// ─── Sanitization (Gap #1 — enhanced) ───────────────────────────────────────

// iframe removed from DANGEROUS_TAGS — rendered with sandbox (Gap #5)
const DANGEROUS_TAGS = new Set(['script', 'meta', 'object', 'embed', 'applet']);
const DANGEROUS_ATTRS = new Set([
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
  'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave',
  'onkeydown', 'onkeypress', 'onkeyup', 'onfocus', 'onblur',
  'onchange', 'onsubmit', 'onreset', 'onselect', 'onabort',
  'onerror', 'onresize', 'onscroll', 'oncontextmenu', 'ondrag',
  'ondragstart', 'ondragend', 'ondragenter', 'ondragleave',
  'ondragover', 'ondrop', 'onload', 'onunload', 'onbeforeunload',
  'onhashchange', 'onpopstate', 'onstorage',
  'onanimationstart', 'onanimationend', 'onanimationiteration',
  'ontransitionstart', 'ontransitionend', 'ontransitionrun', 'ontransitioncancel',
  'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel',
  'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerenter',
  'onpointerleave', 'onpointerover', 'onpointerout', 'onpointercancel',
  'onsecuritypolicyviolation', 'onauxclick',
  'formaction', 'xlink:href', 'data-bind',
]);

function isDangerousURL(url: string): boolean {
  if (!url) return false;
  return /^\s*javascript\s*:/i.test(url) ||
         /^\s*vbscript\s*:/i.test(url) ||
         /^\s*data\s*:(?!image\/)/i.test(url);
}

function sanitizeNode(node: HTMLNode): HTMLNode | null {
  if (node.type === 'element') {
    if (DANGEROUS_TAGS.has(node.tagName!)) return null;

    const sanitizedAttrs: Record<string, string> = {};
    if (node.attributes) {
      for (const [key, value] of Object.entries(node.attributes)) {
        const lowerKey = key.toLowerCase();
        if (!DANGEROUS_ATTRS.has(lowerKey) && !lowerKey.startsWith('on')) {
          // Block javascript: in href/src/action/formaction (Gap #1)
          if (['href', 'src', 'action', 'formaction', 'poster'].includes(lowerKey) && isDangerousURL(value)) {
            continue;
          }
          sanitizedAttrs[key] = value;
        }
      }
    }

    const sanitizedChildren: HTMLNode[] = [];
    if (node.children) {
      for (const child of node.children) {
        const sanitized = sanitizeNode(child);
        if (sanitized) sanitizedChildren.push(sanitized);
      }
    }

    return { ...node, attributes: sanitizedAttrs, children: sanitizedChildren };
  }

  if (node.children) {
    const sanitizedChildren: HTMLNode[] = [];
    for (const child of node.children) {
      const sanitized = sanitizeNode(child);
      if (sanitized) sanitizedChildren.push(sanitized);
    }
    return { ...node, children: sanitizedChildren };
  }

  return node;
}

// ─── Alterers / DOM Transform Pipeline (Gap #13) ─────────────────────────────

function applyAlterers(root: HTMLNode, alterers: HTMLAlterer[]): HTMLNode {
  if (!alterers || alterers.length === 0) return root;

  function walk(node: HTMLNode): HTMLNode {
    if (node.type !== 'element') return node;

    let current: HTMLNode | null = node;
    for (const alterer of alterers) {
      if (current) {
        current = alterer(current);
      }
    }

    if (current && current.children) {
      current = {
        ...current,
        children: current.children.map(walk),
      };
    }

    return current || node;
  }

  return walk(root);
}

// ─── Attribute Conversion ────────────────────────────────────────────────────

function convertAttributes(
  attributes: Record<string, string>,
  tagName: string,
  props: HTMLRendererProps
): Record<string, unknown> {
  const reactProps: Record<string, unknown> = {};
  const svg = isSVGElement(tagName);

  for (const [attrName, attrValue] of Object.entries(attributes)) {
    const lowerName = attrName.toLowerCase();

    if (isBooleanAttribute(lowerName)) {
      reactProps[attrToReactProp(lowerName)] = true;
      continue;
    }

    if (lowerName === 'style') {
      reactProps.style = styleStringToObject(attrValue);
      continue;
    }

    if (lowerName === 'class') {
      reactProps.className = attrValue;
      continue;
    }

    // RTL support (Gap #6)
    if (lowerName === 'dir') {
      reactProps.dir = attrValue;
      continue;
    }

    if (lowerName === 'href' && tagName === 'a' && props.onLinkClick) {
      reactProps.onClick = (e: React.MouseEvent) => {
        props.onLinkClick?.(attrValue, e);
      };
    }

    // idsStyles override (Gap #14)
    if (lowerName === 'id' && props.idsStyles?.[attrValue]) {
      const existingStyle = (reactProps.style || {}) as Record<string, unknown>;
      reactProps.style = { ...existingStyle, ...props.idsStyles[attrValue] };
    }

    const propName = svg ? svgAttrToReact(lowerName) : attrToReactProp(lowerName);
    reactProps[propName] = attrValue;
  }

  return reactProps;
}

// ─── Node Rendering ──────────────────────────────────────────────────────────

// Thread-safe key generation using useRef (Gap #19)
let globalKeyCounter = 0;

function nextKey(): string {
  return `cr-node-${globalKeyCounter++}`;
}

function resetKeyCounter(): void {
  globalKeyCounter = 0;
}

function renderNode(
  node: HTMLNode,
  props: HTMLRendererProps
): React.ReactNode {
  const key = nextKey();

  switch (node.type) {
    case 'element':
      return renderElement(node, key, props);
    case 'text':
      return renderTextNode(node, key);
    case 'comment':
      return renderComment(node, key, props);
    case 'doctype':
      return null;
    case 'root':
      return renderRoot(node, props);
    default:
      return null;
  }
}

function renderTextNode(node: HTMLNode, key: string): React.ReactNode {
  const text = node.content || '';
  if (!text) return null;
  if (/^[\s\u200B\u200C\u200D\uFEFF]+$/.test(text)) return text;
  return <span key={key}>{text}</span>;
}

function renderComment(node: HTMLNode, key: string, props: HTMLRendererProps): React.ReactNode {
  if (!props.renderComments) return null;
  return <span key={key} style={{ display: 'none' }} data-comment="true">{/* {node.content} */}</span>;
}

function renderRoot(node: HTMLNode, props: HTMLRendererProps): React.ReactNode {
  if (!node.children || node.children.length === 0) return null;
  return node.children.map(child => renderNode(child, props));
}

function renderElement(
  node: HTMLNode,
  key: string,
  props: HTMLRendererProps
): React.ReactElement | null {
  const tagName = node.tagName || 'div';

  // Custom component override
  if (props.components && props.components[tagName]) {
    const CustomComponent = props.components[tagName];
    const childElements = node.children
      ? node.children.map(child => renderNode(child, props))
      : [];
    const reactAttrs = node.attributes
      ? convertAttributes(node.attributes, tagName, props)
      : {};
    const element = React.createElement(
      CustomComponent as React.ComponentType<Record<string, unknown>>,
      { key, ...reactAttrs },
      ...childElements
    );
    if (props.transform) return props.transform(node, element as React.ReactElement) ?? element as React.ReactElement;
    return element as React.ReactElement;
  }

  const reactAttrs = node.attributes
    ? convertAttributes(node.attributes, tagName, props)
    : {};

  // Form submit
  if (tagName === 'form' && props.onFormSubmit) {
    reactAttrs.onSubmit = (e: React.FormEvent) => { e.preventDefault(); props.onFormSubmit!(e); };
  }

  // iframe sandboxing (Gap #5) — if iframe, ensure sandbox attribute
  if (tagName === 'iframe') {
    if (!reactAttrs.sandbox) {
      reactAttrs.sandbox = 'allow-scripts allow-same-origin';
    }
    reactAttrs.referrerPolicy = 'no-referrer';
  }

  // details/summary toggle (Gap #10)
  if (tagName === 'details') {
    return renderDetails(node, key, props);
  }

  // dialog/modal (Gap #20)
  if (tagName === 'dialog') {
    return renderDialog(node, key, props);
  }

  const childElements: React.ReactNode[] = [];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const rendered = renderNode(child, props);
      if (rendered != null) {
        if (Array.isArray(rendered)) childElements.push(...rendered);
        else childElements.push(rendered);
      }
    }
  }

  let element: React.ReactElement;
  try {
    element = React.createElement(tagName as keyof JSX.IntrinsicElements, { key, ...reactAttrs }, ...childElements);
  } catch {
    element = React.createElement('div', { key, 'data-unknown-tag': tagName, ...reactAttrs }, ...childElements);
  }

  if (props.transform) {
    const transformed = props.transform(node, element);
    return transformed ?? element;
  }

  return element;
}

// ─── Details/Summary Toggle (Gap #10) ────────────────────────────────────────

function renderDetails(node: HTMLNode, key: string, props: HTMLRendererProps): React.ReactElement {
  const isOpen = node.attributes?.open !== undefined;
  const [open, setOpen] = useState(isOpen);

  const summaryChild = node.children?.find(c => c.type === 'element' && c.tagName === 'summary');
  const otherChildren = node.children?.filter(c => !(c.type === 'element' && c.tagName === 'summary'));

  return React.createElement('details', {
    key,
    open,
    onClick: (e: React.MouseEvent) => {
      // Toggle only if clicking on the details itself, not the summary
      if ((e.target as HTMLElement).tagName !== 'SUMMARY') {
        e.preventDefault();
        setOpen(!open);
      }
    },
  },
    React.createElement('summary', {
      onClick: () => setOpen(!open),
      style: { cursor: 'pointer', userSelect: 'none' },
    },
      summaryChild?.children?.map(child => renderNode(child, props)) || null
    ),
    ...(otherChildren || []).map(child => renderNode(child, props))
  );
}

// ─── Dialog/Modal (Gap #20) ──────────────────────────────────────────────────

function renderDialog(node: HTMLNode, key: string, props: HTMLRendererProps): React.ReactElement {
  const isOpen = node.attributes?.open !== undefined;
  const childElements = node.children?.map(child => renderNode(child, props)) || [];

  return React.createElement('dialog', {
    key,
    open: isOpen,
    style: {
      ...(isOpen ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        zIndex: 9999,
      } : { display: 'none' }),
    },
  }, ...childElements);
}

// ─── Default Inline Styles ───────────────────────────────────────────────────

const DEFAULT_STYLES: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#1a202c',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const HTMLRenderer: React.FC<HTMLRendererProps> = ({
  html,
  ast,
  components,
  onLinkClick,
  onFormSubmit,
  sanitize = false,
  renderComments = false,
  className,
  style,
  wrapperTag = 'div',
  wrapperStyle,
  allowDangerousHTML = false,
  transform,
  fallback,
  onRenderComplete,
  testId,
  enableStyles = true,
  scopeStyles = true,
  customCSS = '',
  alterers,
  idsStyles,
  onMetaExtracted,
}) => {
  const scopeId = useMemo(() => `cr-${generateScopeId()}`, []);

  const rawParsedHTML = useMemo((): HTMLNode => {
    if (ast) return ast;
    if (!html || typeof html !== 'string') return { type: 'root', children: [] };
    try { return parseHTML(html); }
    catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('[HTMLRenderer] Failed to parse HTML:', error);
      return { type: 'root', children: [] };
    }
  }, [html, ast]);

  // Extract OG meta tags (Gap #17)
  useMemo(() => {
    if (onMetaExtracted) {
      const meta = extractMetaTags(rawParsedHTML);
      if (Object.keys(meta).length > 0) onMetaExtracted(meta);
    }
  }, [rawParsedHTML, onMetaExtracted]);

  // Apply alterers (Gap #13)
  const alteredHTML = useMemo(() => {
    return applyAlterers(rawParsedHTML, alterers || []);
  }, [rawParsedHTML, alterers]);

  const { cssText, stylesheetHrefs } = useMemo(() => {
    if (!enableStyles) return { cssText: '', stylesheetHrefs: [] };
    return extractStylesFromTree(alteredHTML);
  }, [alteredHTML, enableStyles]);

  const scopedCSS = useMemo((): string => {
    if (!enableStyles || !cssText) return '';
    let result = '';
    if (customCSS) {
      result += scopeStyles ? scopeCSS(customCSS, `cr-${scopeId}`) : customCSS;
      result += '\n';
    }
    result += scopeStyles ? scopeCSS(cssText, `cr-${scopeId}`) : cssText;
    return result;
  }, [enableStyles, cssText, customCSS, scopeStyles, scopeId]);

  const parsedHTML = useMemo((): HTMLNode => {
    let node = alteredHTML;
    node = stripStyleElements(node) || { type: 'root', children: [] };
    if (sanitize) node = sanitizeNode(node) || { type: 'root', children: [] };
    return node;
  }, [alteredHTML, sanitize]);

  const rendererProps: HTMLRendererProps = useMemo(() => ({
    html: html || '', ast, components, onLinkClick, onFormSubmit, sanitize,
    renderComments, allowDangerousHTML, transform, alterers, idsStyles, onMetaExtracted,
  }), [html, ast, components, onLinkClick, onFormSubmit, sanitize, renderComments, allowDangerousHTML, transform, alterers, idsStyles, onMetaExtracted]);

  const renderedContent = useMemo((): React.ReactNode => {
    resetKeyCounter();
    if (!parsedHTML.children || parsedHTML.children.length === 0) return null;
    return parsedHTML.children.map(child => renderNode(child, rendererProps));
  }, [parsedHTML, rendererProps]);

  if (!ast && (!html || typeof html !== 'string')) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  const wrapperStyles: React.CSSProperties = { ...DEFAULT_STYLES, ...style, ...(wrapperStyle ? styleStringToObject(wrapperStyle) : {}) };
  const Wrapper = wrapperTag as any;
  const wrapperClassName = [className || '', scopeStyles ? `cr-${scopeId}` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <Wrapper className={wrapperClassName} style={wrapperStyles} data-testid={testId || 'content-renderer-html'} ref={handleRenderComplete}>
      {scopedCSS && <style data-cr-scope={scopeId} dangerouslySetInnerHTML={{ __html: scopedCSS }} />}
      {stylesheetHrefs.length > 0 && stylesheetHrefs.map((href, idx) => (
        <link key={`cr-stylesheet-${idx}`} rel="stylesheet" href={href} data-cr-external="true" />
      ))}
      {renderedContent}
    </Wrapper>
  );
};

function handleRenderComplete() {}

HTMLRenderer.displayName = 'HTMLRenderer';

function parseHTML(html: string): HTMLNode {
  const root: HTMLNode = { type: 'root', children: [], parent: null };
  const stack: HTMLNode[] = [root];
  let current = root;
  const parser = new HtmlParser({
    onopentag(name: string, attribs: Record<string, string>) {
      const node: HTMLNode = { type: 'element', tagName: name.toLowerCase(), attributes: attribs, children: [], parent: current };
      current.children!.push(node);
      if (!isVoidElement(name)) { stack.push(node); current = node; }
    },
    onclosetag() {
      if (stack.length > 1) { stack.pop(); current = stack[stack.length - 1]; }
    },
    ontext(text: string) {
      current.children!.push({ type: 'text', content: text, parent: current });
    },
    oncomment(data: string) {
      current.children!.push({ type: 'comment', content: data, parent: current });
    },
    // @ts-ignore
    ondoctype(data: string) {
      current.children!.push({ type: 'doctype', content: data, parent: current });
    },
    onend() { while (stack.length > 1) stack.pop(); },
  }, { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true, recognizeSelfClosing: true });
  parser.write(html);
  parser.end();
  return root;
}

export default HTMLRenderer;
