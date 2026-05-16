import { ContentType } from '../types';
import { detectContentType } from './transform';

// ==========================================
// Validation Functions
// ==========================================

export function isValidHTML(content: string): boolean {
  if (!content || !content.trim()) return false;

  // Basic HTML structure checks
  const trimmed = content.trim();

  // Must have at least one tag
  if (!/<[a-zA-Z][^>]*>/.test(trimmed)) return false;

  // Check for balanced tags
  let tagCount = 0;
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  const openTagRegex = /<(?!\/)([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)\s*>/g;

  const openTags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = openTagRegex.exec(trimmed)) !== null) {
    const tagName = match[1].toLowerCase();
    if (!voidElements.has(tagName) && !match[0].endsWith('/>')) {
      openTags.push(tagName);
    }
  }

  while ((match = closeTagRegex.exec(trimmed)) !== null) {
    const tagName = match[1].toLowerCase();
    const lastIndex = openTags.lastIndexOf(tagName);
    if (lastIndex !== -1) {
      openTags.splice(lastIndex, 1);
    }
  }

  return openTags.length === 0;
}

export function isValidJSON(content: string): boolean {
  if (!content || !content.trim()) return false;
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

export function isValidXML(content: string): boolean {
  if (!content || !content.trim()) return false;

  const trimmed = content.trim();

  // Must have XML-like structure
  if (!/<[a-zA-Z][^>]*>/.test(trimmed)) return false;

  // Check balanced tags
  const stack: string[] = [];
  let pos = 0;
  const len = trimmed.length;

  while (pos < len) {
    if (trimmed[pos] === '<') {
      // Comment
      if (trimmed.slice(pos, pos + 4) === '<!--') {
        const end = trimmed.indexOf('-->', pos + 4);
        pos = end !== -1 ? end + 3 : len;
        continue;
      }

      // CDATA
      if (trimmed.slice(pos, pos + 9) === '<![CDATA[') {
        const end = trimmed.indexOf(']]>', pos + 9);
        pos = end !== -1 ? end + 3 : len;
        continue;
      }

      // Processing instruction
      if (trimmed[pos + 1] === '?') {
        const end = trimmed.indexOf('?>', pos + 2);
        pos = end !== -1 ? end + 2 : len;
        continue;
      }

      // Declaration
      if (trimmed.slice(pos, pos + 5) === '<?xml') {
        const end = trimmed.indexOf('?>', pos + 5);
        pos = end !== -1 ? end + 2 : len;
        continue;
      }

      // Closing tag
      if (trimmed[pos + 1] === '/') {
        const end = trimmed.indexOf('>', pos + 2);
        if (end === -1) return false;
        const tagName = trimmed.slice(pos + 2, end).trim().split(/\s+/)[0];
        if (stack.length === 0 || stack[stack.length - 1] !== tagName) return false;
        stack.pop();
        pos = end + 1;
        continue;
      }

      // Opening tag
      const end = trimmed.indexOf('>', pos + 1);
      if (end === -1) return false;
      const tagStr = trimmed.slice(pos + 1, end);
      const tagName = tagStr.split(/\s+/)[0];

      if (tagStr.endsWith('/')) {
        // Self-closing
        pos = end + 1;
        continue;
      }

      stack.push(tagName);
      pos = end + 1;
    } else {
      pos++;
    }
  }

  return stack.length === 0;
}

export function isValidCSS(content: string): boolean {
  if (!content || !content.trim()) return false;

  const trimmed = content.trim();

  // Must have at least one rule or at-rule
  if (!/{/.test(trimmed) && !/@import/.test(trimmed) && !/@charset/.test(trimmed)) {
    return false;
  }

  // Check balanced braces
  let braceCount = 0;
  let inComment = false;
  let inString: string | null = null;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (inComment) {
      if (ch === '*' && trimmed[i + 1] === '/') {
        inComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      if (ch === inString && trimmed[i - 1] !== '\\') {
        inString = null;
      }
      continue;
    }

    if (ch === '/' && trimmed[i + 1] === '*') {
      inComment = true;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }

    if (ch === '{') braceCount++;
    else if (ch === '}') braceCount--;
  }

  if (inComment) return false;
  return braceCount === 0;
}

export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'ftp:', 'ftps:', 'mailto:', 'tel:', 'file:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // RFC 5322 compliant email regex (simplified but comprehensive)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;

  // Strip common formatting characters
  const cleaned = phone.replace(/[\s\-()\.+]/g, '');

  // E.164 format: + followed by 7-15 digits
  // Or just digits (national format)
  return /^\+?\d{7,15}$/.test(cleaned);
}

// ==========================================
// Content Type Detection
// ==========================================

export { detectContentType };

// ==========================================
// File Extension Mapping
// ==========================================

const EXTENSION_MAP: Record<string, ContentType> = {
  '.html': 'html',
  '.htm': 'html',
  '.xhtml': 'html5',
  '.html5': 'html5',
  '.json': 'json',
  '.jsonl': 'json',
  '.xml': 'xml',
  '.xsl': 'xml',
  '.xslt': 'xml',
  '.xsd': 'xml',
  '.svg': 'xml',
  '.rss': 'xml',
  '.atom': 'xml',
  '.php': 'php',
  '.phtml': 'php',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.mdx': 'markdown',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css',
  '.txt': 'text',
  '.text': 'text',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.code': 'code',
  '.sh': 'code',
  '.bash': 'code',
  '.zsh': 'code',
  '.py': 'code',
  '.rb': 'code',
  '.go': 'code',
  '.rs': 'code',
  '.java': 'code',
  '.kt': 'code',
  '.swift': 'code',
  '.c': 'code',
  '.cpp': 'code',
  '.h': 'code',
  '.hpp': 'code',
  '.sql': 'code',
  '.graphql': 'code',
  '.gql': 'code',
};

export function getContentTypeFromExtension(filename: string): ContentType {
  if (!filename || typeof filename !== 'string') return 'text';

  const lower = filename.toLowerCase();

  // Check for common compound extensions
  const compoundExtensions = ['.component.ts', '.component.tsx', '.module.ts', '.module.js'];
  for (const ext of compoundExtensions) {
    if (lower.endsWith(ext)) {
      const base = lower.slice(0, -ext.length);
      const baseExt = base.slice(base.lastIndexOf('.'));
      return EXTENSION_MAP[baseExt] || 'code';
    }
  }

  // Get the last extension
  const lastDot = lower.lastIndexOf('.');
  if (lastDot === -1) return 'text';

  const ext = lower.slice(lastDot);
  return EXTENSION_MAP[ext] || 'text';
}

export function getContentTypeFromMIME(mimeType: string): ContentType {
  if (!mimeType || typeof mimeType !== 'string') return 'text';

  const mimeMap: Record<string, ContentType> = {
    'text/html': 'html',
    'application/xhtml+xml': 'html5',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/xml': 'xml',
    'application/rss+xml': 'xml',
    'application/atom+xml': 'xml',
    'image/svg+xml': 'xml',
    'application/x-httpd-php': 'php',
    'text/x-php': 'php',
    'text/markdown': 'markdown',
    'text/css': 'css',
    'text/javascript': 'javascript',
    'application/javascript': 'javascript',
    'text/typescript': 'typescript',
    'application/typescript': 'typescript',
    'text/plain': 'text',
    'application/x-yaml': 'yaml',
    'text/yaml': 'yaml',
  };

  // Handle charset suffix
  const baseMime = mimeType.split(';')[0].trim().toLowerCase();
  return mimeMap[baseMime] || 'text';
}

export function getContentTypeFromHeader(content: string): ContentType {
  const firstLine = content.split('\n')[0]?.trim() || '';

  if (firstLine.startsWith('<!DOCTYPE html') || firstLine.startsWith('<!doctype html')) return 'html5';
  if (firstLine.startsWith('<html')) return 'html5';
  if (firstLine.startsWith('<?xml')) return 'xml';
  if (firstLine.startsWith('<?php')) return 'php';
  if (firstLine.startsWith('---')) return 'markdown';
  if (firstLine.startsWith('{') || firstLine.startsWith('[')) return 'json';
  if (firstLine.startsWith('@charset') || firstLine.startsWith('@import') || /:root\s*\{/.test(firstLine)) return 'css';
  if (firstLine.startsWith('#')) return 'markdown';
  if (firstLine.startsWith('- ') || firstLine.startsWith('* ') || firstLine.startsWith('+ ')) return 'markdown';

  return detectContentType(content);
}
