import { ContentType } from '../types';
import { CSSParser } from '../parsers/css-parser';

const cssParser = new CSSParser();

// ==========================================
// Minification Functions
// ==========================================

export function minifyHTML(content: string): string {
  if (!content) return '';
  return content
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '') // Remove comments except IE conditionals
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
    .replace(/^\s+|\s+$/gm, '') // Trim lines
    .replace(/\n/g, '') // Remove newlines
    .replace(/\t/g, ' ') // Tabs to spaces
    .replace(/\s+/g, ' ') // Final collapse
    .trim();
}

export function minifyCSS(content: string): string {
  if (!content) return '';
  return cssParser.minify(content);
}

export function minifyJSON(content: string): string {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed);
  } catch {
    // If not valid JSON, try to collapse whitespace
    return content
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}[\]:,])\s*/g, '$1')
      .trim();
  }
}

export function minifyXML(content: string): string {
  if (!content) return '';
  return content
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s{2,}/g, ' ') // Collapse spaces
    .replace(/\n/g, '') // Remove newlines
    .replace(/\t/g, ' ') // Tabs to spaces
    .trim();
}

// ==========================================
// Formatting Functions
// ==========================================

export function formatHTML(content: string, indentSize: number = 2): string {
  if (!content) return '';
  const indent = ' '.repeat(indentSize);
  let formatted = '';
  let depth = 0;
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  // Remove existing formatting
  const flat = content
    .replace(/>\s+</g, '><')
    .trim();

  const tokens = tokenizeHTML(flat);

  for (const token of tokens) {
    if (token.type === 'tag') {
      const tagName = token.content.replace(/[<>/!]/g, '').split(/\s+/)[0].toLowerCase();

      if (token.content.startsWith('</')) {
        depth = Math.max(0, depth - 1);
        formatted += indent.repeat(depth) + token.content + '\n';
      } else if (token.content.endsWith('/>') || voidElements.has(tagName)) {
        formatted += indent.repeat(depth) + token.content + '\n';
      } else if (token.content.startsWith('<!') || token.content.startsWith('<?')) {
        formatted += indent.repeat(depth) + token.content + '\n';
      } else {
        formatted += indent.repeat(depth) + token.content + '\n';
        // Check if next non-text token is a closing tag
        depth++;
      }
    } else if (token.type === 'text') {
      const trimmed = token.content.trim();
      if (trimmed) {
        formatted += indent.repeat(depth) + trimmed + '\n';
      }
    }
  }

  return formatted.trim();
}

function tokenizeHTML(html: string): Array<{ type: 'tag' | 'text'; content: string }> {
  const tokens: Array<{ type: 'tag' | 'text'; content: string }> = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] === '<') {
      // Comment
      if (html.slice(i, i + 4) === '<!--') {
        const end = html.indexOf('-->', i + 4);
        if (end !== -1) {
          tokens.push({ type: 'tag', content: html.slice(i, end + 3) });
          i = end + 3;
          continue;
        }
      }

      // Tag
      const end = html.indexOf('>', i);
      if (end !== -1) {
        tokens.push({ type: 'tag', content: html.slice(i, end + 1) });
        i = end + 1;
        continue;
      }

      // Unclosed tag
      tokens.push({ type: 'tag', content: html.slice(i) });
      break;
    } else {
      // Text
      const end = html.indexOf('<', i);
      if (end !== -1) {
        tokens.push({ type: 'text', content: html.slice(i, end) });
        i = end;
      } else {
        tokens.push({ type: 'text', content: html.slice(i) });
        break;
      }
    }
  }

  return tokens;
}

export function formatCSS(content: string, indentSize: number = 2): string {
  if (!content) return '';
  return cssParser.format(content, indentSize);
}

export function formatJSON(content: string, indentSize: number = 2): string {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, indentSize);
  } catch {
    return content;
  }
}

export function formatXML(content: string, indentSize: number = 2): string {
  if (!content) return '';
  const indent = ' '.repeat(indentSize);
  let formatted = '';
  let depth = 0;

  // Normalize
  const flat = content
    .replace(/>\s+</g, '><')
    .replace(/<!--[\s\S]*?-->/g, (match) => match.replace(/\s+/g, ' '))
    .trim();

  const tokens = tokenizeHTML(flat); // Reuse HTML tokenizer for XML

  for (const token of tokens) {
    if (token.type === 'tag') {
      const cleaned = token.content.trim();

      if (cleaned.startsWith('</')) {
        depth = Math.max(0, depth - 1);
        formatted += indent.repeat(depth) + cleaned + '\n';
      } else if (cleaned.endsWith('/>')) {
        formatted += indent.repeat(depth) + cleaned + '\n';
      } else if (cleaned.startsWith('<?') || cleaned.startsWith('<!')) {
        formatted += indent.repeat(depth) + cleaned + '\n';
      } else {
        formatted += indent.repeat(depth) + cleaned + '\n';
        depth++;
      }
    } else if (token.type === 'text') {
      const trimmed = token.content.trim();
      if (trimmed) {
        formatted += indent.repeat(depth) + trimmed + '\n';
      }
    }
  }

  return formatted.trim();
}

export function prettify(content: string, indentSize: number = 2): string {
  const type = detectContentType(content);
  switch (type) {
    case 'html':
    case 'html5':
      return formatHTML(content, indentSize);
    case 'css':
      return formatCSS(content, indentSize);
    case 'json':
      return formatJSON(content, indentSize);
    case 'xml':
      return formatXML(content, indentSize);
    case 'php':
    case 'javascript':
    case 'typescript':
      return content; // Return as-is for code
    case 'markdown':
      return content; // Return as-is for markdown
    default:
      return content;
  }
}

// ==========================================
// Conversion Functions
// ==========================================

export function convertToJSON(content: string, fromType: ContentType): string {
  switch (fromType) {
    case 'xml':
      return xmlToJSON(content);
    case 'markdown':
      return markdownToJSON(content);
    case 'css':
      return cssToJSON(content);
    case 'html':
    case 'html5':
      return htmlToJSON(content);
    default:
      try {
        JSON.parse(content);
        return formatJSON(content);
      } catch {
        return JSON.stringify({ raw: content }, null, 2);
      }
  }
}

function xmlToJSON(xml: string): string {
  try {
    const { XMLParser: XMLP } = require('../parsers/xml-parser');
    const parser = new XMLP();
    const doc = parser.parse(xml);
    const obj = parser.toObject(doc.root);
    return JSON.stringify(obj, null, 2);
  } catch {
    return JSON.stringify({ error: 'Failed to parse XML' }, null, 2);
  }
}

function markdownToJSON(content: string): string {
  try {
    const { MarkdownParser } = require('../parsers/markdown-parser');
    const parser = new MarkdownParser();
    const doc = parser.parse(content);

    const result: any = {
      metadata: doc.metadata,
      headings: doc.headings.map((h: any) => ({ level: h.level, text: h.text, slug: h.slug })),
      links: doc.links,
      images: doc.images,
      tables: doc.tables,
      codeBlocks: doc.codeBlocks,
    };

    if (doc.frontmatter) {
      result.frontmatter = doc.frontmatter;
    }

    return JSON.stringify(result, null, 2);
  } catch {
    return JSON.stringify({ raw: content }, null, 2);
  }
}

function cssToJSON(content: string): string {
  try {
    const doc = cssParser.parse(content);
    const result = {
      variables: doc.variables,
      rules: doc.rules.map((r) => ({
        selectors: r.selectors,
        declarations: Object.fromEntries(
          r.declarations.map((d) => [d.property, d.value])
        ),
      })),
      mediaQueries: doc.mediaQueries.map((m) => ({
        condition: m.condition,
        rules: m.rules.map((r) => ({
          selectors: r.selectors,
          declarations: Object.fromEntries(
            r.declarations.map((d) => [d.property, d.value])
          ),
        })),
      })),
    };
    return JSON.stringify(result, null, 2);
  } catch {
    return JSON.stringify({ error: 'Failed to parse CSS' }, null, 2);
  }
}

function htmlToJSON(content: string): string {
  try {
    const { HTMLParser } = require('../parsers/html-parser');
    const parser = new HTMLParser();
    const doc = parser.parse(content);
    return JSON.stringify({
      doctype: doc.doctype,
      metadata: doc.metadata,
    }, null, 2);
  } catch {
    return JSON.stringify({ raw: content }, null, 2);
  }
}

export function convertToXML(content: string, fromType: ContentType): string {
  switch (fromType) {
    case 'json':
      return jsonToXML(content);
    case 'html':
    case 'html5':
      return content; // HTML is already XML-like
    default:
      return `<?xml version="1.0" encoding="UTF-8"?>\n<content>\n  ${escapeForXML(content)}\n</content>`;
  }
}

function jsonToXML(json: string): string {
  try {
    const obj = JSON.parse(json);
    return objectToXML(obj, 'root', 0);
  } catch {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <error>Invalid JSON</error>\n</root>`;
  }
}

function objectToXML(obj: any, tagName: string, depth: number): string {
  const indent = '  '.repeat(depth);
  const childIndent = '  '.repeat(depth + 1);

  if (obj === null || obj === undefined) {
    return `${indent}<${tagName}/>`;
  }

  if (typeof obj !== 'object') {
    return `${indent}<${tagName}>${escapeForXML(String(obj))}</${tagName}>`;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objectToXML(item, 'item', depth)).join('\n');
  }

  let xml = `${indent}<${tagName}>\n`;
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (typeof value === 'object' && value !== null) {
      xml += objectToXML(value, safeKey, depth + 1) + '\n';
    } else {
      xml += `${childIndent}<${safeKey}>${escapeForXML(String(value ?? ''))}</${safeKey}>\n`;
    }
  }
  xml += `${indent}</${tagName}>`;
  return xml;
}

function escapeForXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function convertToMarkdown(content: string, fromType: ContentType): string {
  switch (fromType) {
    case 'html':
    case 'html5':
      return htmlToMarkdown(content);
    case 'json':
      return jsonToMarkdown(content);
    case 'xml':
      return xmlToMarkdown(content);
    default:
      return content;
  }
}

function htmlToMarkdown(html: string): string {
  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '###### $1\n\n');

  // Bold, italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Links
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)');

  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*class=["'](?:language-)?(\w+)["'][^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```$1\n$2\n```');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Paragraphs and blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');

  // Strikethrough
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~');

  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // Clean up entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

function jsonToMarkdown(json: string): string {
  try {
    const obj = JSON.parse(json);
    return objectToMarkdown(obj, 0);
  } catch {
    return '```json\n' + json + '\n```';
  }
}

function objectToMarkdown(obj: any, depth: number): string {
  const indent = '  '.repeat(depth);

  if (obj === null || obj === undefined) {
    return `${indent}- \`null\`\n`;
  }

  if (typeof obj !== 'object') {
    return `${indent}- \`${typeof obj}: ${String(obj)}\`\n`;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objectToMarkdown(item, depth)).join('');
  }

  let md = '';
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      md += `${indent}- **${key}**:\n`;
      md += objectToMarkdown(value, depth + 1);
    } else if (Array.isArray(value)) {
      md += `${indent}- **${key}**: ${JSON.stringify(value)}\n`;
    } else {
      md += `${indent}- **${key}**: \`${String(value)}\`\n`;
    }
  }
  return md;
}

function xmlToMarkdown(xml: string): string {
  // Simple conversion: convert to HTML then to Markdown
  let html = xml
    .replace(/<\?xml[^?]*\?>/g, '') // Remove XML declaration
    .replace(/\/>/g, '>'); // Convert self-closing to regular tags
  return htmlToMarkdown(html);
}

// ==========================================
// String Utility Functions
// ==========================================

export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .trim();
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
    .trim();
}

export function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

export function titleCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================
// Content Type Detection
// ==========================================

export function detectContentType(content: string): ContentType {
  const trimmed = content.trim();

  if (!trimmed) return 'text';

  // HTML
  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return 'html5';
  }
  if (/<[a-zA-Z][^>]*>[\s\S]*<\/[a-zA-Z]+>/i.test(trimmed) &&
      /<(div|span|p|a|img|ul|ol|li|h[1-6]|table|form|input|head|body|html)[\s>]/i.test(trimmed)) {
    return 'html';
  }

  // JSON
  if (/^\s*[\[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }

  // XML
  if (/^\s*<\?xml/i.test(trimmed) || /^\s*<[\w-]+[^>]*>[\s\S]*<\/[\w-]+>\s*$/.test(trimmed)) {
    return 'xml';
  }

  // PHP
  if (/^\s*<\?php/i.test(trimmed) || /^\s*<\?=/i.test(trimmed)) {
    return 'php';
  }
  if (/function\s+\w+\s*\(|class\s+\w+|\$\w+\s*=|->|=>/.test(trimmed) && /<\?php|<\?=|\?>/.test(trimmed)) {
    return 'php';
  }

  // CSS
  if (/^[\s\S]*\{[\s\S]*\}[\s\S]*$/.test(trimmed) &&
      /@media|@import|@font-face|@keyframes|@charset|:root|--[\w-]+|#[\w-]+\s*\{|[\w-]+\s*:\s*[\w-]+/.test(trimmed)) {
    return 'css';
  }

  // Markdown
  if (/^#{1,6}\s+/m.test(trimmed) || /^\s*[-*+]\s+/m.test(trimmed) || /^\s*```/m.test(trimmed)) {
    return 'markdown';
  }
  if (/\[([^\]]+)\]\([^)]+\)/.test(trimmed) && /#{1,6}\s+/.test(trimmed)) {
    return 'markdown';
  }

  // TypeScript
  if (/: (string|number|boolean|void|any|never|unknown|null|undefined|object|Array|Promise|Record|Map|Set)/.test(trimmed) &&
      (/(interface|type|enum|generic|as\s+)/.test(trimmed) || /<\w+>/.test(trimmed))) {
    return 'typescript';
  }

  // JavaScript
  if (/(const|let|var)\s+\w+\s*=|function\s+\w+|=>\s*{|import\s+.*from\s+['"]|export\s+(default\s+)?/.test(trimmed)) {
    return 'javascript';
  }

  // YAML
  if (/^\w[\w-]*\s*:/m.test(trimmed) && /^\s*-\s+\w/m.test(trimmed)) {
    return 'yaml';
  }

  return 'text';
}

/**
 * Updates a value at a nested path in an object or array.
 * Path format: "root.key.0.subkey"
 * Returns a new object/array with the value updated (immutable).
 */
export function updateNestedValue(obj: any, path: string, newValue: any): any {
  if (!path || path === 'root') return newValue;

  const parts = path.startsWith('root.') ? path.slice(5).split('.') : path.split('.');
  
  function update(current: any, pathParts: string[]): any {
    if (pathParts.length === 0) return newValue;

    const [head, ...tail] = pathParts;
    
    if (Array.isArray(current)) {
      const index = parseInt(head, 10);
      const newArray = [...current];
      newArray[index] = update(current[index], tail);
      return newArray;
    } else if (typeof current === 'object' && current !== null) {
      return {
        ...current,
        [head]: update(current[head], tail),
      };
    }
    
    return current;
  }

  return update(obj, parts);
}
