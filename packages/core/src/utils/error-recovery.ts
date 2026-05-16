// ==========================================
// Error Recovery - Graceful error recovery for content parsers
// ==========================================

import type { ParseError } from '../types';

// ==========================================
// Types
// ==========================================

export interface HTMLRecoveryResult {
  content: string;
  recovered: boolean;
  fixes: string[];
  warnings: string[];
}

export interface JSONRecoveryResult {
  content: string;
  recovered: boolean;
  fixes: string[];
}

export interface MarkdownRecoveryResult {
  content: string;
  recovered: boolean;
  fixes: string[];
}

export interface CSSRecoveryResult {
  content: string;
  recovered: boolean;
  fixes: string[];
}

export interface XMLRecoveryResult {
  content: string;
  recovered: boolean;
  fixes: string[];
}

export interface SanitizedError {
  message: string;
  code?: string;
  line?: number;
  column?: number;
  preview?: string;
  suggestion?: string;
}

// ==========================================
// Void elements (self-closing, no closing tag needed)
// ==========================================

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

// ==========================================
// HTML Error Recovery
// ==========================================

/**
 * Attempt to recover from an HTML parsing error.
 * Strategies: close unclosed tags, remove stray closing tags, fix attributes.
 */
export function recoverFromHTMLError(
  content: string,
  error: ParseError
): HTMLRecoveryResult {
  const fixes: string[] = [];
  const warnings: string[] = [];
  let recovered = false;
  let result = content;

  // Strategy 1: Close unclosed tags
  const unclosedTags = findUnclosedTags(result);
  if (unclosedTags.length > 0) {
    for (const tag of unclosedTags) {
      result += `</${tag}>`;
      fixes.push(`Added missing closing tag </${tag}>`);
    }
    recovered = true;
  }

  // Strategy 2: Remove stray closing tags (closing tags without matching open tag)
  result = removeStrayClosingTags(result, fixes);

  // Strategy 3: Fix malformed attributes (unclosed quotes)
  result = fixMalformedAttributes(result, fixes);

  // Strategy 4: Close unclosed comments
  const openComments = (result.match(/<!--/g) || []).length;
  const closeComments = (result.match(/-->/g) || []).length;
  if (openComments > closeComments) {
    result += '-->';
    fixes.push('Added missing comment close -->');
    recovered = true;
  }

  // Strategy 5: Handle unclosed CDATA sections
  const openCdata = (result.match(/<!\[CDATA\[/g) || []).length;
  const closeCdata = (result.match(/\]\]>/g) || []).length;
  if (openCdata > closeCdata) {
    result += ']]>';
    fixes.push('Added missing CDATA close ]]>');
    recovered = true;
  }

  // Strategy 6: Fix unclosed DOCTYPE
  if (/<!DOCTYPE\s/i.test(result) && !result.match(/<!DOCTYPE\s[^>]*>/i)) {
    result = result.replace(/(<!DOCTYPE\s[^>]*)/i, '$1>');
    fixes.push('Fixed unclosed DOCTYPE declaration');
    recovered = true;
  }

  // Strategy 7: Fix self-closing void elements that have closing tags
  for (const voidTag of VOID_ELEMENTS) {
    const closeTagRegex = new RegExp(`</${voidTag}>`, 'gi');
    const matches = result.match(closeTagRegex);
    if (matches && matches.length > 0) {
      result = result.replace(closeTagRegex, '');
      fixes.push(`Removed invalid closing tag </${voidTag}> (void element)`);
      recovered = true;
    }
  }

  // If no fixes were applied, try basic sanitization
  if (!recovered) {
    // Remove any completely broken tag fragments at the end
    const brokenTagMatch = result.match(/<([a-zA-Z][^>]*)$/);
    if (brokenTagMatch) {
      result = result.slice(0, result.lastIndexOf('<' + brokenTagMatch[1]));
      fixes.push('Removed broken tag fragment at end of content');
      recovered = true;
    }
  }

  return { content: result, recovered, fixes, warnings };
}

// ==========================================
// JSON Error Recovery
// ==========================================

/**
 * Attempt to recover from a JSON parsing error.
 * Strategies: add missing commas, brackets, braces; fix trailing commas; unquote keys.
 */
export function recoverFromJSONError(
  content: string,
  error: ParseError
): JSONRecoveryResult {
  const fixes: string[] = [];
  let recovered = false;
  let result = content.trim();

  // Strategy 1: Add missing closing brackets/braces
  const openBraces = (result.match(/\{/g) || []).length;
  const closeBraces = (result.match(/\}/g) || []).length;
  const openBrackets = (result.match(/\[/g) || []).length;
  const closeBrackets = (result.match(/\]/g) || []).length;

  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    for (let i = 0; i < diff; i++) {
      result += '}';
    }
    fixes.push(`Added ${diff} missing closing brace(s)`);
    recovered = true;
  }
  if (openBrackets > closeBrackets) {
    const diff = openBrackets - closeBrackets;
    for (let i = 0; i < diff; i++) {
      result += ']';
    }
    fixes.push(`Added ${diff} missing closing bracket(s)`);
    recovered = true;
  }

  // Strategy 2: Remove trailing commas before } or ]
  const trailingCommaBeforeBrace = /,\s*}/g;
  const trailingCommaBeforeBracket = /,\s*\]/g;
  let match1 = trailingCommaBeforeBrace.exec(result);
  if (match1) {
    result = result.replace(/,\s*}/g, '}');
    fixes.push('Removed trailing comma before closing brace');
    recovered = true;
  }
  let match2 = trailingCommaBeforeBracket.exec(result);
  if (match2) {
    result = result.replace(/,\s*\]/g, ']');
    fixes.push('Removed trailing comma before closing bracket');
    recovered = true;
  }

  // Strategy 3: Add missing commas between key-value pairs or array elements
  // Between } and { (object properties)
  result = result.replace(/}\s*{/g, (match) => {
    if (!match.includes(',')) {
      recovered = true;
      fixes.push('Added missing comma between object properties');
      return '},{';
    }
    return match;
  });

  // Between } and " (end of object, start of new property)
  const reObjEndQuote = new RegExp('(\\})\\s*("', 'g');
  result = result.replace(reObjEndQuote, (match: string, close: string, quote: string) => {
    // Only add comma if the quote is starting a new key (followed by :)
    const afterQuote = result.slice(result.indexOf(quote));
    if (/^"[^"]*"\s*:/.test(afterQuote)) {
      recovered = true;
      fixes.push('Added missing comma between object entries');
      return close + ',' + quote;
    }
    return match;
  });

  // Between value and key: number/bool/null/string followed by "
  const reValueQuote = new RegExp('([0-9tfn])\\s*("', 'g');
  result = result.replace(reValueQuote, (match: string, charVal: string, quote: string) => {
    recovered = true;
    fixes.push('Added missing comma between value and key');
    return charVal + ',' + quote;
  });

  // Between array elements: } or value followed by [
  result = result.replace(/(\})\s*(\[)/g, (match) => {
    recovered = true;
    fixes.push('Added missing comma before array');
    return '},{';
  });

  // Between ] and value
  result = result.replace(/(\])\s*([0-9tfn"])/g, (match, bracket, next) => {
    recovered = true;
    fixes.push('Added missing comma after array');
    return `${bracket},${next}`;
  });

  // Between string values in arrays: "text" "text"
  result = result.replace(/("\s*)(")/g, (match, end, start) => {
    // Only if the first quote is closing a value (followed by , or ] or })
    const idx = result.indexOf(end + start);
    if (idx > 0) {
      const afterIdx = idx + end.length + start.length;
      const after = result.slice(afterIdx, afterIdx + 20);
      if (after.match(/^\s*"/)) {
        recovered = true;
        fixes.push('Added missing comma between string values');
        return `${end},${start}`;
      }
    }
    return match;
  });

  // Strategy 4: Fix unquoted keys
  result = result.replace(/\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, (match, key) => {
    recovered = true;
    fixes.push(`Quoted unquoted key "${key}"`);
    return `{ "${key}":`;
  });
  result = result.replace(/,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, (match, key) => {
    recovered = true;
    fixes.push(`Quoted unquoted key "${key}"`);
    return `, "${key}":`;
  });

  // Strategy 5: Fix single-quoted strings to double-quoted
  // Only do this if content is not already parseable
  if (!isValidJSON(result)) {
    const before = result;
    result = fixSingleQuotes(result);
    if (result !== before) {
      fixes.push('Converted single-quoted strings to double-quoted strings');
      recovered = true;
    }
  }

  // Strategy 6: Remove comments (// and /* */)
  if (!isValidJSON(result)) {
    const before = result;
    result = result.replace(/\/\/.*$/gm, '');
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    if (result !== before.trim()) {
      result = result.trim();
      fixes.push('Removed JSON comments');
      recovered = true;
    }
  }

  // Verify the result is valid JSON
  if (isValidJSON(result)) {
    // Re-stringify for consistency
    try {
      result = JSON.stringify(JSON.parse(result), null, 2);
    } catch {
      // Keep as-is if re-parsing fails (shouldn't happen)
    }
  }

  return { content: result, recovered, fixes };
}

// ==========================================
// Markdown Error Recovery
// ==========================================

/**
 * Attempt to recover from a Markdown parsing error.
 * Strategies: normalize line endings, fix unclosed code fences, normalize list markers.
 */
export function recoverFromMarkdownError(
  content: string,
  error: ParseError
): MarkdownRecoveryResult {
  const fixes: string[] = [];
  let recovered = false;
  let result = content;

  // Strategy 1: Normalize line endings
  if (result.includes('\r\n')) {
    result = result.replace(/\r\n/g, '\n');
    fixes.push('Normalized CRLF line endings to LF');
    recovered = true;
  } else if (result.includes('\r')) {
    result = result.replace(/\r/g, '\n');
    fixes.push('Normalized CR line endings to LF');
    recovered = true;
  }

  // Strategy 2: Close unclosed fenced code blocks
  const fencedBlockOpen = (result.match(/^```/gm) || []).length;
  const fencedBlockClose = (result.match(/^```$/gm) || []).length;
  if (fencedBlockOpen > fencedBlockClose) {
    const diff = fencedBlockOpen - fencedBlockClose;
    for (let i = 0; i < diff; i++) {
      result += '\n```\n';
    }
    fixes.push(`Closed ${diff} unclosed fenced code block(s)`);
    recovered = true;
  }

  // Strategy 3: Fix unclosed inline code
  // Count backticks - odd number means unclosed
  const backtickCount = (result.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    result += '`';
    fixes.push('Closed unclosed inline code');
    recovered = true;
  }

  // Strategy 4: Fix unclosed bold markers
  const doubleAsteriskCount = (result.match(/\*\*/g) || []).length;
  if (doubleAsteriskCount % 2 !== 0) {
    result += '**';
    fixes.push('Closed unclosed bold marker');
    recovered = true;
  }

  // Strategy 5: Fix unclosed italic markers (single asterisks, but not inside bold)
  // Simple heuristic: count unmatched single asterisks
  const lines = result.split('\n');
  const fixedLines: string[] = [];
  let totalItalicFixes = 0;
  for (const line of lines) {
    let fixedLine = line;
    // Remove bold markers first for counting
    const withoutBold = line.replace(/\*\*/g, '');
    const singleAsterisks = (withoutBold.match(/\*/g) || []).length;
    if (singleAsterisks % 2 !== 0) {
      fixedLine += '*';
      totalItalicFixes++;
    }
    fixedLines.push(fixedLine);
  }
  if (totalItalicFixes > 0) {
    result = fixedLines.join('\n');
    fixes.push(`Closed ${totalItalicFixes} unclosed italic marker(s)`);
    recovered = true;
  }

  // Strategy 6: Fix unclosed links [text](href
  const unclosedLinks = result.match(/\[[^\]]*\]\([^)]*$/gm);
  if (unclosedLinks && unclosedLinks.length > 0) {
    result = result.replace(/\[([^\]]*)\]\(([^)]*)$/gm, '[$1]($2)');
    fixes.push(`Closed ${unclosedLinks.length} unclosed link(s)`);
    recovered = true;
  }

  // Strategy 7: Fix unclosed brackets for link text
  const unclosedBrackets = result.match(/\[[^\]]*$/gm);
  if (unclosedBrackets && unclosedBrackets.length > 0) {
    result = result.replace(/\[([^\]]*)$/gm, '[$1]');
    fixes.push(`Closed ${unclosedBrackets.length} unclosed bracket(s)`);
    recovered = true;
  }

  // Strategy 8: Ensure file ends with newline
  if (result.length > 0 && !result.endsWith('\n')) {
    result += '\n';
    fixes.push('Added trailing newline');
    recovered = true;
  }

  // Strategy 9: Remove excessive blank lines (more than 2 consecutive)
  const beforeBlank = result;
  result = result.replace(/\n{4,}/g, '\n\n\n');
  if (result !== beforeBlank) {
    fixes.push('Collapsed excessive blank lines');
    recovered = true;
  }

  // Strategy 10: Normalize inconsistent list markers in the same list
  result = normalizeListMarkers(result, fixes);

  return { content: result, recovered, fixes };
}

// ==========================================
// CSS Error Recovery
// ==========================================

/**
 * Attempt to recover from a CSS parsing error.
 * Strategies: close unclosed braces, fix missing semicolons, remove broken @ rules.
 */
export function recoverFromCSSError(
  content: string,
  error: ParseError
): CSSRecoveryResult {
  const fixes: string[] = [];
  let recovered = false;
  let result = content;

  // Strategy 1: Close unclosed braces
  const openBraces = (result.match(/\{/g) || []).length;
  const closeBraces = (result.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    for (let i = 0; i < diff; i++) {
      result += '\n}';
    }
    fixes.push(`Added ${diff} missing closing brace(s)`);
    recovered = true;
  }

  // Strategy 2: Fix missing semicolons before closing braces
  result = result.replace(/([^;{}])\s*\}/g, (match, char) => {
    recovered = true;
    fixes.push('Added missing semicolon before closing brace');
    return `${char};\n}`;
  });

  // Strategy 3: Fix missing semicolons between declarations
  // Pattern: property: value (no semicolon) followed by another property
  result = result.replace(/([a-zA-Z-]+\s*:\s*[^;{}]+?)(\s+[a-zA-Z-]+\s*:)/g, (match, decl, next) => {
    recovered = true;
    fixes.push('Added missing semicolon between declarations');
    return `${decl};${next}`;
  });

  // Strategy 4: Close unclosed strings
  const singleQuotes = (result.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    result += "'";
    fixes.push('Closed unclosed single-quoted string');
    recovered = true;
  }
  const doubleQuotes = (result.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    result += '"';
    fixes.push('Closed unclosed double-quoted string');
    recovered = true;
  }

  // Strategy 5: Close unclosed comments
  const openComments = (result.match(/\/\*/g) || []).length;
  const closeComments = (result.match(/\*\//g) || []).length;
  if (openComments > closeComments) {
    result += '*/';
    fixes.push('Added missing comment close */');
    recovered = true;
  }

  // Strategy 6: Remove broken @ rules (e.g., @media without braces)
  const brokenAtRules = result.match(/@(media|keyframes|supports|font-face|import|charset)(?![^{]*\{)/g);
  if (brokenAtRules && brokenAtRules.length > 0) {
    for (const rule of brokenAtRules) {
      result = result.replace(rule, `/* Removed broken: ${rule} */`);
      fixes.push(`Removed broken @ rule: ${rule}`);
      recovered = true;
    }
  }

  // Strategy 7: Fix unclosed parentheses in CSS functions (url(), calc(), etc.)
  const openParens = (result.match(/\(/g) || []).length;
  const closeParens = (result.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    const diff = openParens - closeParens;
    for (let i = 0; i < diff; i++) {
      result += ')';
    }
    fixes.push(`Closed ${diff} unclosed parenthesis/parentheses`);
    recovered = true;
  }

  // Strategy 8: Fix missing colon in declarations (property value without colon)
  result = result.replace(/\b([a-zA-Z-]+)\s+([a-zA-Z-]+\s*:\s*)/g, (match, before, after) => {
    // Only fix if 'before' looks like a property name (not a value or keyword)
    const commonProps = new Set([
      'color', 'background', 'font', 'margin', 'padding', 'border', 'display',
      'width', 'height', 'position', 'top', 'right', 'bottom', 'left',
      'flex', 'grid', 'text', 'line', 'letter', 'word', 'white',
    ]);
    if (commonProps.has(before.toLowerCase()) && !after.includes(':')) {
      recovered = true;
      fixes.push(`Added missing colon after property "${before}"`);
      return `${before}: ${after}`;
    }
    return match;
  });

  // Strategy 9: Ensure file ends with newline
  if (result.length > 0 && !result.endsWith('\n')) {
    result += '\n';
    fixes.push('Added trailing newline');
    recovered = true;
  }

  return { content: result, recovered, fixes };
}

// ==========================================
// XML Error Recovery
// ==========================================

/**
 * Attempt to recover from an XML parsing error.
 * Strategies: balance tags, fix unclosed CDATA/comments, fix attribute quotes.
 */
export function recoverFromXMLError(
  content: string,
  error: ParseError
): XMLRecoveryResult {
  const fixes: string[] = [];
  let recovered = false;
  let result = content;

  // Strategy 1: Fix missing XML declaration
  if (!result.trimStart().startsWith('<?xml')) {
    result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result;
    fixes.push('Added XML declaration');
    recovered = true;
  }

  // Strategy 2: Balance unclosed tags
  const tagStack: string[] = [];
  const tagRegex = /<\/?([a-zA-Z_:][a-zA-Z0-9_.:-]*)[^>]*\/?>/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(result)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1];

    if (fullMatch.startsWith('</')) {
      // Closing tag
      const idx = tagStack.lastIndexOf(tagName);
      if (idx !== -1) {
        tagStack.splice(idx);
      }
    } else if (!fullMatch.endsWith('/>')) {
      // Opening tag (not self-closing)
      tagStack.push(tagName);
    }
  }

  if (tagStack.length > 0) {
    // Close unclosed tags in reverse order
    const closingTags = tagStack.reverse().map((tag) => `</${tag}>`).join('');
    result = result.replace(/(<\/\w+>\s*)?$/, closingTags);
    fixes.push(`Closed ${tagStack.length} unclosed tag(s): ${tagStack.reverse().join(', ')}`);
    recovered = true;
  }

  // Strategy 3: Remove stray closing tags
  const allTags: string[] = [];
  const allCloseTags: string[] = [];
  const openTagRegex = /<([a-zA-Z_:][a-zA-Z0-9_.:-]*)[^>]*(?<!\/)>/g;
  const closeTagRegex = /<\/([a-zA-Z_:][a-zA-Z0-9_.:-]*)>/g;

  let m: RegExpExecArray | null;
  while ((m = openTagRegex.exec(result)) !== null) {
    allTags.push(m[1]);
  }
  while ((m = closeTagRegex.exec(result)) !== null) {
    allCloseTags.push(m[1]);
  }

  // Check for close tags without matching open tags
  for (const closeTag of allCloseTags) {
    if (!allTags.includes(closeTag)) {
      const regex = new RegExp(`</${closeTag}>`, 'g');
      result = result.replace(regex, '');
      fixes.push(`Removed stray closing tag </${closeTag}>`);
      recovered = true;
    }
  }

  // Strategy 4: Fix unclosed CDATA sections
  const openCdata = (result.match(/<!\[CDATA\[/g) || []).length;
  const closeCdata = (result.match(/\]\]>/g) || []).length;
  if (openCdata > closeCdata) {
    result += ']]>';
    fixes.push('Added missing CDATA close ]]>');
    recovered = true;
  }

  // Strategy 5: Fix unclosed comments
  const openComments = (result.match(/<!--/g) || []).length;
  const closeComments = (result.match(/-->/g) || []).length;
  if (openComments > closeComments) {
    result += '-->';
    fixes.push('Added missing comment close -->');
    recovered = true;
  }

  // Strategy 6: Fix unquoted or improperly quoted attributes
  result = result.replace(/<(\w+)([^>]+)>/g, (fullMatch, tagName, attrs) => {
    // Fix attributes without quotes: name=value -> name="value"
    const fixedAttrs = attrs.replace(/(\w+)=([^"'>\s]+)/g, '$1="$2"');
    if (fixedAttrs !== attrs) {
      recovered = true;
      fixes.push('Fixed unquoted attributes');
      return `<${tagName}${fixedAttrs}>`;
    }
    return fullMatch;
  });

  // Strategy 7: Fix unclosed processing instructions
  const openPI = (result.match(/<\?/g) || []).length;
  const closePI = (result.match(/\?>/g) || []).length;
  if (openPI > closePI) {
    result += '?>';
    fixes.push('Added missing processing instruction close ?>');
    recovered = true;
  }

  // Strategy 8: Ensure there's a single root element
  // Try to wrap content in a root element if there are multiple top-level elements
  const stripped = result
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const topLevelElements = stripped.match(/^<([a-zA-Z_:])/g);
  if (topLevelElements && topLevelElements.length > 1) {
    // Multiple root elements found, wrap them
    const xmlDecl = result.match(/<\?xml[^?]*\?>\s*/)?.[0] || '';
    const body = result.replace(xmlDecl, '');
    result = `${xmlDecl}<root>\n${body}\n</root>`;
    fixes.push('Wrapped multiple root elements in <root>');
    recovered = true;
  }

  return { content: result, recovered, fixes };
}

// ==========================================
// Error Sanitization & Fallbacks
// ==========================================

/**
 * Sanitize an error for safe display, removing sensitive information.
 */
export function sanitizeErrorOutput(
  error: Error,
  contentPreview?: string
): SanitizedError {
  const sanitized: SanitizedError = {
    message: error.message || 'An unknown error occurred',
  };

  // Extract code from error name
  if (error.name && error.name !== 'Error') {
    sanitized.code = error.name.replace(/Error$/, '').toUpperCase();
  }

  // Try to extract line and column from message
  const lineColMatch = error.message.match(/line\s+(\d+)/i);
  if (lineColMatch) {
    sanitized.line = parseInt(lineColMatch[1], 10);
  }
  const colMatch = error.message.match(/column\s+(\d+)/i);
  if (colMatch) {
    sanitized.column = parseInt(colMatch[1], 10);
  }

  // Add content preview if provided
  if (contentPreview) {
    const lines = contentPreview.split('\n');
    const lineNum = sanitized.line || 1;
    const startLine = Math.max(0, lineNum - 3);
    const endLine = Math.min(lines.length, lineNum + 2);
    sanitized.preview = lines.slice(startLine, endLine).join('\n');
  }

  // Generate suggestion based on error message
  sanitized.suggestion = generateSuggestion(error.message);

  return sanitized;
}

/**
 * Create a fallback content representation when the original cannot be parsed.
 */
export function createFallbackContent(
  originalContent: string,
  error: Error
): string {
  const sanitized = sanitizeErrorOutput(error, originalContent);
  const errorInfo = [
    `<!-- Content Rendering Error -->`,
    `<div class="content-renderer-error" role="alert">`,
    `  <p><strong>Error:</strong> ${escapeHTML(sanitized.message)}</p>`,
  ];

  if (sanitized.suggestion) {
    errorInfo.push(`  <p><strong>Suggestion:</strong> ${escapeHTML(sanitized.suggestion)}</p>`);
  }

  if (sanitized.preview) {
    errorInfo.push(
      `  <details>`,
      `    <summary>Content Preview</summary>`,
      `    <pre><code>${escapeHTML(sanitized.preview)}</code></pre>`,
      `  </details>`
    );
  }

  errorInfo.push(`</div>`);
  return errorInfo.join('\n');
}

/**
 * Suggest fixes for a parse error based on the error message.
 */
export function suggestFixes(error: ParseError): string[] {
  const suggestions: string[] = [];
  const msg = error.message.toLowerCase();

  // HTML-related errors
  if (msg.includes('unclosed tag') || msg.includes('unexpected closing')) {
    suggestions.push('Check for missing closing tags');
    suggestions.push('Verify that all tags are properly nested');
    suggestions.push('Ensure void elements (br, hr, img, input, etc.) do not have closing tags');
  }
  if (msg.includes('doctype')) {
    suggestions.push('Add <!DOCTYPE html> at the beginning of the document');
  }

  // JSON-related errors
  if (msg.includes('unexpected token') || msg.includes('json')) {
    suggestions.push('Check for trailing commas before } or ]');
    suggestions.push('Ensure all string values use double quotes');
    suggestions.push('Verify all object keys are enclosed in double quotes');
    suggestions.push('Check for missing commas between properties');
  }
  if (msg.includes('unexpected end') || msg.includes('unexpected eof')) {
    suggestions.push('Check for missing closing brackets } or ]');
  }

  // XML-related errors
  if (msg.includes('not well-formed') || msg.includes('xml')) {
    suggestions.push('Ensure all tags are properly closed');
    suggestions.push('Check that attribute values are quoted');
    suggestions.push('Verify there is a single root element');
    suggestions.push('Check for special characters that need to be escaped (<, >, &, etc.)');
  }

  // CSS-related errors
  if (msg.includes('css') || msg.includes('style') || msg.includes('property')) {
    suggestions.push('Check for missing semicolons after declarations');
    suggestions.push('Ensure all braces { } are properly balanced');
    suggestions.push('Verify property names are spelled correctly');
  }

  // Markdown-related errors
  if (msg.includes('markdown') || msg.includes('heading') || msg.includes('list')) {
    suggestions.push('Check for unclosed code fences (```)');
    suggestions.push('Ensure consistent list marker styles');
    suggestions.push('Verify link syntax: [text](url)');
  }

  // Generic suggestions
  if (msg.includes('encoding') || msg.includes('charset')) {
    suggestions.push('Ensure the file encoding is UTF-8');
    suggestions.push('Check for BOM or non-UTF-8 characters');
  }

  if (msg.includes('memory') || msg.includes('too large')) {
    suggestions.push('Try processing a smaller portion of the content');
    suggestions.push('Consider breaking large content into smaller chunks');
  }

  // If no specific suggestions, add generic ones
  if (suggestions.length === 0) {
    suggestions.push('Check the content syntax for errors');
    suggestions.push('Try using a content validator before rendering');
    suggestions.push('Review the error message for specific details');
  }

  return suggestions;
}

// ==========================================
// Internal Helper Functions
// ==========================================

/**
 * Find unclosed tags in HTML content.
 */
function findUnclosedTags(content: string): string[] {
  const stack: string[] = [];
  const regex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();

    if (fullMatch.startsWith('</')) {
      const idx = stack.lastIndexOf(tagName);
      if (idx !== -1) {
        stack.splice(idx);
      }
    } else if (!fullMatch.endsWith('/>') && !VOID_ELEMENTS.has(tagName)) {
      stack.push(tagName);
    }
  }

  return stack;
}

/**
 * Remove closing tags that don't have a matching opening tag.
 */
function removeStrayClosingTags(content: string, fixes: string[]): string {
  const openTags = new Set<string>();
  const regex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();

    if (!fullMatch.startsWith('</') && !fullMatch.endsWith('/>')) {
      openTags.add(tagName);
    }
  }

  let result = content;
  for (const openTag of openTags) {
    // Count open and close occurrences
    const openCount = (result.match(new RegExp(`<${openTag}[^>]*(?<!/)>`, 'g')) || []).length;
    const closeCount = (result.match(new RegExp(`</${openTag}>`, 'g')) || []).length;

    if (closeCount > openCount) {
      const excess = closeCount - openCount;
      let removed = 0;
      result = result.replace(new RegExp(`</${openTag}>`, 'g'), (fullMatch) => {
        if (removed < excess) {
          removed++;
          fixes.push(`Removed stray closing tag </${openTag}>`);
          return '';
        }
        return fullMatch;
      });
    }
  }

  return result;
}

/**
 * Fix malformed attributes (unclosed quotes).
 */
function fixMalformedAttributes(content: string, fixes: string[]): string {
  let result = content;

  // Fix unclosed double quotes in attributes
  result = result.replace(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)(=["'][^"'>]*$)/gm, (match, tag, attrs, broken) => {
    fixes.push(`Fixed unclosed attribute quote in <${tag}>`);
    const quote = broken.startsWith('="') ? '"' : "'";
    return `<${tag}${attrs}${broken}${quote}>`;
  });

  // Fix attributes without quotes: name=value (where value has no spaces/quotes)
  // This is valid in HTML5 but some parsers prefer quoted
  // We leave this as-is since it's technically valid

  return result;
}

/**
 * Normalize list markers in markdown to be consistent within each list.
 */
function normalizeListMarkers(content: string, fixes: string[]): string {
  const lines = content.split('\n');
  let result = lines;
  let i = 0;

  while (i < result.length) {
    const line = result[i];
    const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);

    if (unorderedMatch) {
      const indent = unorderedMatch[1].length;
      const marker = unorderedMatch[2];
      const items: number[] = [i];
      let j = i + 1;

      while (j < result.length) {
        const nextLine = result[j];
        const nextMatch = nextLine.match(/^(\s*)([-*+])\s+(.+)$/);
        if (nextMatch) {
          const nextIndent = nextMatch[1].length;
          if (nextIndent === indent) {
            items.push(j);
            j++;
            continue;
          }
        }
        break;
      }

      // If more than 1 item and inconsistent markers, normalize to first marker
      if (items.length > 1) {
        const markers = items.map((idx) => {
          const m = result[idx].match(/^(\s*)([-*+])\s+/);
          return m?.[2];
        });
        const uniqueMarkers = new Set(markers);
        if (uniqueMarkers.size > 1) {
          for (const idx of items) {
            result[idx] = result[idx].replace(/^(\s*)[-*+](\s+)/, `$1${marker}$2`);
          }
          fixes.push('Normalized inconsistent unordered list markers');
        }
      }

      i = j;
    } else {
      i++;
    }
  }

  return result.join('\n');
}

/**
 * Fix single-quoted strings to double-quoted in JSON content.
 */
function fixSingleQuotes(content: string): string {
  // Replace single-quoted keys: 'key': -> "key":
  let result = content.replace(/'([^']+)'\s*:/g, '"$1":');
  // Replace single-quoted string values: : 'value' -> : "value"
  result = result.replace(/:\s*'([^']*)'/g, ': "$1"');
  // Replace single-quoted array values: 'value', -> "value",
  result = result.replace(/(?<=,\s*)'([^']*)'/g, '"$1"');
  // Replace single-quoted array values at start: ['value' -> ["value"
  result = result.replace(/\[\s*'([^']*)'/g, '["$1"');
  return result;
}

/**
 * Check if a string is valid JSON.
 */
function isValidJSON(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a suggestion based on an error message.
 */
function generateSuggestion(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('unexpected token') && msg.includes('position')) {
    return 'Check for syntax errors at the indicated position in your content.';
  }
  if (msg.includes('unexpected end')) {
    return 'The content appears to be truncated. Check for missing closing characters.';
  }
  if (msg.includes('unclosed tag')) {
    return 'Add the missing closing tag(s) to make the HTML well-formed.';
  }
  if (msg.includes('trailing comma')) {
    return 'Remove the trailing comma before the closing bracket or brace.';
  }
  if (msg.includes('unexpected character')) {
    return 'There may be an invalid character at the indicated position.';
  }
  if (msg.includes('duplicate key')) {
    return 'Remove or rename the duplicate key in your JSON object.';
  }

  return 'Review the error details and check your content for syntax issues.';
}

/**
 * Escape a string for safe inclusion in HTML.
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
