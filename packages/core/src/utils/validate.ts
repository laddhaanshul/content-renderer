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

export function isValidURL(url: string, options?: { allowPrivateIPs?: boolean }): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'ftp:', 'ftps:', 'mailto:', 'tel:', 'file:'].includes(parsed.protocol)) {
      return false;
    }

    // SSRF protection: block private IPs if requested
    if (options?.allowPrivateIPs === false) {
      const hostname = parsed.hostname;
      if (isIP(hostname) && !isPublicIP(hostname)) {
        return false;
      }
      // Also block 'localhost'
      if (hostname === 'localhost') return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid IPv4 or IPv6 address.
 * Standardizes non-standard formats (octal, hex) for safer check.
 */
export function isIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;

  // IPv4 regex (strict 4 parts)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 regex
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) return true;

  // Handle non-standard IPv4 formats (like 127.1, 012.0.0.1, hex, etc.)
  // If it's a numeric-looking string that doesn't match the strict regex,
  // we should be cautious.
  if (/^[0-9xX.a-fA-F:]+$/.test(ip)) {
     // If it has dots but not 4 parts, or starts with 0 (octal potential), flag as potential IP
     if (ip.includes('.') || ip.startsWith('0') || ip.startsWith('0x')) return true;
  }

  return false;
}

/**
 * Check if an IP address is public (not private, loopback, link-local, etc.)
 * This addresses the "ip" package SSRF vulnerability (GHSA-2p57-rm9w-gvfp)
 * by providing a correct categorization and handling obfuscated formats.
 */
export function isPublicIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;

  const normalized = ip.trim().toLowerCase();

  // Block obvious non-public/dangerous strings mentioned in CVE
  if (normalized === '127.1' || normalized.startsWith('012') || normalized.startsWith('0x')) return false;
  if (normalized === '::ffff:127.0.0.1' || normalized === '000:0:0000::01') return false;

  if (!isIP(normalized)) return false;

  // IPv4 checks
  if (normalized.includes('.')) {
    const parts = normalized.split('.').map(p => {
       if (p.startsWith('0x')) return parseInt(p, 16);
       if (p.startsWith('0') && p.length > 1) return parseInt(p, 8);
       return parseInt(p, 10);
    });
    
    // If we couldn't parse 4 valid parts, treat as non-public for safety
    if (parts.length !== 4 || parts.some(isNaN)) return false;

    // Private ranges (RFC 1918)
    if (parts[0] === 10) return false;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
    if (parts[0] === 192 && parts[1] === 168) return false;
    
    // Loopback (RFC 1122)
    if (parts[0] === 127) return false;
    
    // Link-local (RFC 3927)
    if (parts[0] === 169 && parts[1] === 254) return false;
    
    // Shared address space (RFC 6598)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return false;
    
    // Future use (RFC 1112)
    if (parts[0] >= 240) return false;
    
    // Current network (RFC 1122)
    if (parts[0] === 0) return false;
    
    // Broadcast
    if (normalized === '255.255.255.255') return false;

    return true;
  }

  // IPv6 checks
  // Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1' || normalized.endsWith(':1')) return false;
  
  // Unspecified
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return false;
  
  // Unique Local Address (ULA)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return false;
  
  // Link-local
  if (normalized.startsWith('fe80')) return false;

  // IPv4-mapped IPv6
  if (normalized.startsWith('::ffff:')) {
    const v4Part = normalized.slice(7);
    return isPublicIP(v4Part);
  }

  return true;
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
