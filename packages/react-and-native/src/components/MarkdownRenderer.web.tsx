import React, { useMemo } from 'react';
import type { MarkdownRendererProps } from '@laddhaanshul/content-renderer-core';
import { HTMLRenderer } from './HTMLRenderer';
import { CodeRenderer } from './CodeRenderer';

// ═══════════════════════════════════════════════════════════════════════════════
// Markdown-to-HTML Parser (from scratch, no external library)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Inline Parsing Helpers ─────────────────────────────────────────────────

/** Escape HTML special characters */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Process inline markdown: bold, italic, strikethrough, code, links, images, line breaks */
function processInline(text: string, escapeHtmlFlag: boolean): string {
  if (!text) return '';

  // Work on the raw text, applying transformations in order
  let result = text;

  // Code spans (backticks) — process first to prevent inner parsing
  result = result.replace(/(`+)(.+?)\1/g, (_match, backticks, code) => {
    const escaped = escapeHtmlFlag ? escapeHtml(code) : code;
    return `<code>${escaped}</code>`;
  });

  // Images: ![alt](src "title")
  result = result.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_match, alt, src, title) => {
      const altEscaped = escapeHtmlFlag ? escapeHtml(alt) : alt;
      const titleAttr = title ? ` title="${escapeHtmlFlag ? escapeHtml(title) : title}"` : '';
      return `<img src="${escapeHtmlFlag ? escapeHtml(src) : src}" alt="${altEscaped}"${titleAttr} />`;
    }
  );

  // Links: [text](url "title")
  result = result.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_match, linkText, href, title) => {
      const textEscaped = escapeHtmlFlag ? escapeHtml(linkText) : linkText;
      const titleAttr = title ? ` title="${escapeHtmlFlag ? escapeHtml(title) : title}"` : '';
      return `<a href="${escapeHtmlFlag ? escapeHtml(href) : href}"${titleAttr}>${textEscaped}</a>`;
    }
  );

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Bold + Italic: ***text*** or ___text___
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_ (not at word boundaries to avoid conflicts)
  result = result.replace(/(?<!\w)\*(?!\*)(.+?)(?<!\*)\*(?!\w)/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(?!_)(.+?)(?<!_)_(?!\w)/g, '<em>$1</em>');

  // Line breaks: two spaces + newline, or explicit <br>
  result = result.replace(/  \n/g, '<br />\n');

  return result;
}

// ─── Block-Level Parsing ─────────────────────────────────────────────────────

/**
 * Parses a fenced code block starting at position `pos`.
 * Returns the HTML string and the new position after the code block.
 */
function parseFencedCodeBlock(
  lines: string[],
  pos: number,
  escapeHtmlFlag: boolean,
  codeBlockHandler?: (code: string, language: string) => React.ReactNode
): { html: string; newPos: number } {
  // Match opening fence: ```language or ```{.language}
  const fenceMatch = lines[pos].match(/^(`{3,}|~{3,})(\w*)/);
  if (!fenceMatch) {
    return { html: '', newPos: pos + 1 };
  }

  const fenceChar = fenceMatch[1][0];
  const fenceLen = fenceMatch[1].length;
  const language = fenceMatch[2] || '';

  // Collect code lines until closing fence
  const codeLines: string[] = [];
  let i = pos + 1;
  while (i < lines.length) {
    if (lines[i].startsWith(fenceChar.repeat(fenceLen)) && lines[i].trim().length <= fenceLen) {
      i++; // Skip closing fence
      break;
    }
    codeLines.push(lines[i]);
    i++;
  }

  const code = codeLines.join('\n');

  if (codeBlockHandler) {
    // Custom handler — return a placeholder since we return HTML string
    // The caller will need to handle this differently; for now, use default rendering
  }

  const escapedCode = escapeHtml(code);
  const langAttr = language ? ` class="language-${escapeHtml(language)}"` : '';
  const html = `<pre><code${langAttr}>${escapedCode}</code></pre>`;

  return { html, newPos: i };
}

/**
 * Parses an indented code block (4-space indentation).
 */
function parseIndentedCodeBlock(lines: string[], pos: number): { html: string; newPos: number } {
  const codeLines: string[] = [];
  let i = pos;
  while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i] === '')) {
    if (lines[i] === '') {
      codeLines.push('');
    } else {
      codeLines.push(lines[i].replace(/^    /, '').replace(/^\t/, '    '));
    }
    i++;
  }

  const code = codeLines.join('\n');
  const html = `<pre><code>${escapeHtml(code)}</code></pre>`;
  return { html, newPos: i };
}

/**
 * Parses a GFM table starting at position `pos`.
 */
function parseTable(lines: string[], pos: number, escapeHtmlFlag: boolean): { html: string; newPos: number } {
  const headerLine = lines[pos].trim();
  const separatorLine = pos + 1 < lines.length ? lines[pos + 1].trim() : '';

  // Must have a separator row with pipes and dashes
  if (!/^\|?[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)*\|?$/.test(separatorLine)) {
    return { html: '', newPos: pos + 1 };
  }

  // Parse column alignments from separator
  const alignCells = separatorLine.split('|').filter(c => c.trim().length > 0);
  const alignments: ('left' | 'center' | 'right')[] = alignCells.map(cell => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
    if (trimmed.endsWith(':')) return 'right';
    if (trimmed.startsWith(':')) return 'left';
    return 'left';
  });

  // Parse header cells
  const headerCells = headerLine.split('|').map(c => c.trim()).filter(c => c.length > 0);
  // Remove leading/trailing empty from split on pipes at edges
  if (headerLine.startsWith('|')) headerCells.shift();
  if (headerLine.endsWith('|')) headerCells.pop();

  // Parse body rows
  const bodyRows: string[][] = [];
  let i = pos + 2;
  while (i < lines.length && lines[i].trim().length > 0 && lines[i].includes('|')) {
    const rowCells = lines[i].split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (lines[i].trim().startsWith('|')) rowCells.shift();
    if (lines[i].trim().endsWith('|')) rowCells.pop();
    bodyRows.push(rowCells);
    i++;
  }

  // Build HTML table
  let html = '<table>\n<thead>\n<tr>\n';
  headerCells.forEach((cell, idx) => {
    const align = alignments[idx] || 'left';
    const alignAttr = align !== 'left' ? ` style="text-align: ${align}"` : '';
    html += `<th${alignAttr}>${processInline(cell, escapeHtmlFlag)}</th>\n`;
  });
  html += '</tr>\n</thead>\n';

  if (bodyRows.length > 0) {
    html += '<tbody>\n';
    for (const row of bodyRows) {
      html += '<tr>\n';
      row.forEach((cell, idx) => {
        const align = alignments[idx] || 'left';
        const alignAttr = align !== 'left' ? ` style="text-align: ${align}"` : '';
        html += `<td${alignAttr}>${processInline(cell, escapeHtmlFlag)}</td>\n`;
      });
      html += '</tr>\n';
    }
    html += '</tbody>\n';
  }

  html += '</table>';
  return { html, newPos: i };
}

/**
 * Parses a blockquote, handling nested quotes.
 */
function parseBlockquote(
  lines: string[],
  pos: number,
  escapeHtmlFlag: boolean,
  linkTarget?: string
): { html: string; newPos: number } {
  const quoteLines: string[] = [];
  let i = pos;

  while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
    quoteLines.push(lines[i].replace(/^>\s?/, ''));
    i++;
  }

  const innerContent = quoteLines.join('\n');
  const innerHtml = parseMarkdownBlocks(innerContent, escapeHtmlFlag, linkTarget);

  return { html: `<blockquote>\n${innerHtml}\n</blockquote>`, newPos: i };
}

/**
 * Parses an unordered list (with -, *, + markers).
 */
function parseUnorderedList(
  lines: string[],
  pos: number,
  escapeHtmlFlag: boolean,
  linkTarget?: string
): { html: string; newPos: number } {
  const items: string[] = [];
  const subLists: Array<{ indent: number; lines: string[] }> = [];
  let i = pos;
  let currentIndent = -1;

  // Determine the indent of the first item
  if (i < lines.length) {
    const match = lines[i].match(/^(\s*)([-*+])\s/);
    if (match) {
      currentIndent = match[1].length;
    }
  }

  while (i < lines.length) {
    const listMatch = lines[i].match(/^(\s*)([-*+])\s+(.*)/);
    if (listMatch) {
      const indent = listMatch[1].length;
      if (indent === currentIndent) {
        items.push(listMatch[3]);
        i++;
        // Collect continuation lines (multi-line list items)
        while (i < lines.length && lines[i].trim().length > 0 && !lines[i].match(/^\s*[-*+]\s/)) {
          items[items.length - 1] += '\n' + lines[i].trim();
          i++;
        }
      } else if (indent > currentIndent) {
        // Nested list — stop here, the parent handles it
        break;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let html = '<ul>\n';
  for (const item of items) {
    const processed = processInline(item, escapeHtmlFlag);
    html += `<li>${processed}</li>\n`;
  }
  html += '</ul>';

  return { html, newPos: i };
}

/**
 * Parses an ordered list (1., 2., etc.).
 */
function parseOrderedList(
  lines: string[],
  pos: number,
  escapeHtmlFlag: boolean,
  linkTarget?: string
): { html: string; newPos: number } {
  const items: string[] = [];
  let i = pos;
  let currentIndent = -1;

  if (i < lines.length) {
    const match = lines[i].match(/^(\s*)\d+\.\s/);
    if (match) {
      currentIndent = match[1].length;
    }
  }

  while (i < lines.length) {
    const listMatch = lines[i].match(/^(\s*)\d+\.\s+(.*)/);
    if (listMatch) {
      const indent = listMatch[1].length;
      if (indent === currentIndent) {
        items.push(listMatch[2]);
        i++;
        while (i < lines.length && lines[i].trim().length > 0 && !lines[i].match(/^\s*\d+\.\s/)) {
          items[items.length - 1] += '\n' + lines[i].trim();
          i++;
        }
      } else if (indent > currentIndent) {
        break;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let html = '<ol>\n';
  for (const item of items) {
    const processed = processInline(item, escapeHtmlFlag);
    html += `<li>${processed}</li>\n`;
  }
  html += '</ol>';

  return { html, newPos: i };
}

/**
 * Parse task list items (checkboxes in lists).
 */
function processTaskList(text: string, escapeHtmlFlag: boolean): string {
  return text.replace(
    /\[([ xX])\]\s*(.*)/g,
    (_match, checked, label) => {
      const isChecked = checked !== ' ' ? ' checked=""' : '';
      const processedLabel = processInline(label, escapeHtmlFlag);
      return `<li><input type="checkbox" disabled${isChecked} /> ${processedLabel}</li>`;
    }
  );
}

// ─── Main Block Parser ──────────────────────────────────────────────────────

/**
 * Parse markdown content into HTML block by block.
 */
function parseMarkdownBlocks(
  content: string,
  escapeHtmlFlag: boolean,
  linkTarget?: string
): string {
  const lines = content.split('\n');
  const output: string[] = [];
  let i = 0;

  // Track if we're inside a paragraph
  let inParagraph = false;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (inParagraph && paragraphLines.length > 0) {
      const paraText = paragraphLines.join('\n');
      const processed = processInline(paraText, escapeHtmlFlag);
      output.push(`<p>${processed}</p>`);
      paragraphLines = [];
      inParagraph = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line — end current block
    if (trimmed === '') {
      flushParagraph();
      i++;
      continue;
    }

    // Fenced code blocks: ``` or ~~~
    if (/^(`{3,}|~{3,})/.test(trimmed)) {
      flushParagraph();
      const { html, newPos } = parseFencedCodeBlock(lines, i, escapeHtmlFlag);
      output.push(html);
      i = newPos;
      continue;
    }

    // Indented code block (4 spaces)
    if (/^    /.test(line) || /^\t/.test(line)) {
      // Only treat as code if we're not already in a list
      if (!inParagraph) {
        flushParagraph();
        const { html, newPos } = parseIndentedCodeBlock(lines, i);
        output.push(html);
        i = newPos;
        continue;
      }
    }

    // Headings: # to ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const headingText = processInline(headingMatch[2], escapeHtmlFlag);
      output.push(`<h${level}>${headingText}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rules: ---, ***, ___ (with optional spaces)
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(trimmed)) {
      flushParagraph();
      output.push('<hr />');
      i++;
      continue;
    }

    // Blockquote: > prefix
    if (trimmed.startsWith('>')) {
      flushParagraph();
      const { html, newPos } = parseBlockquote(lines, i, escapeHtmlFlag, linkTarget);
      output.push(html);
      i = newPos;
      continue;
    }

    // GFM Table: | ... | with separator row
    if (trimmed.includes('|') && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1]?.trim() || '';
      if (/^\|?[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)*\|?$/.test(nextTrimmed)) {
        flushParagraph();
        const { html, newPos } = parseTable(lines, i, escapeHtmlFlag);
        output.push(html);
        i = newPos;
        continue;
      }
    }

    // Task list: - [ ] or - [x]
    const taskMatch = trimmed.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)/);
    if (taskMatch) {
      flushParagraph();
      const taskItem = processTaskList(trimmed.replace(/^\s*[-*+]\s+/, '- '), escapeHtmlFlag);
      output.push(`<ul>\n${taskItem}\n</ul>`);
      i++;
      continue;
    }

    // Unordered list: -, *, +
    const ulMatch = trimmed.match(/^[-*+]\s+/);
    if (ulMatch && !trimmed.startsWith('---') && !trimmed.startsWith('***')) {
      flushParagraph();
      const { html, newPos } = parseUnorderedList(lines, i, escapeHtmlFlag, linkTarget);
      output.push(html);
      i = newPos;
      continue;
    }

    // Ordered list: 1.
    const olMatch = trimmed.match(/^\d+\.\s+/);
    if (olMatch) {
      flushParagraph();
      const { html, newPos } = parseOrderedList(lines, i, escapeHtmlFlag, linkTarget);
      output.push(html);
      i = newPos;
      continue;
    }

    // Skip HTML blocks if skipHtml is true
    // (handled by caller, not here)

    // Default: paragraph text
    if (inParagraph) {
      paragraphLines.push(trimmed);
    } else {
      inParagraph = true;
      paragraphLines = [trimmed];
    }
    i++;
  }

  // Flush remaining paragraph
  flushParagraph();

  return output.join('\n\n');
}

/**
 * Convert markdown to HTML.
 * This is the main entry point for the markdown parser.
 *
 * Supported syntax:
 * - Headings (# to ######)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Bold + Italic (***text*** or ___text___)
 * - Strikethrough (~~text~~)
 * - Links [text](url "title")
 * - Images ![alt](src "title")
 * - Code inline (`code`)
 * - Fenced code blocks (```language\ncode\n```)
 * - Indented code blocks (4-space indent)
 * - Unordered lists (-, *, +)
 * - Ordered lists (1.)
 * - Nested lists (indented)
 * - Blockquotes (> text)
 * - Nested blockquotes
 * - Horizontal rules (---, ***, ___)
 * - GFM Tables with alignment
 * - Task lists (- [ ] / - [x])
 * - Paragraphs
 * - Line breaks (two trailing spaces + newline)
 * - HTML passthrough (when skipHtml is false)
 */
function parseMarkdownToHTML(content: string, options?: {
  escapeHtml?: boolean;
  skipHtml?: boolean;
  linkTarget?: string;
}): string {
  if (!content || typeof content !== 'string') return '';

  const escapeHtmlFlag = options?.escapeHtml ?? false;
  const skipHtml = options?.skipHtml ?? false;
  const linkTarget = options?.linkTarget;

  // Handle frontmatter (YAML between --- markers)
  let processedContent = content;
  if (processedContent.startsWith('---')) {
    const endOfFrontmatter = processedContent.indexOf('\n---', 3);
    if (endOfFrontmatter !== -1) {
      processedContent = processedContent.substring(endOfFrontmatter + 4).trim();
    }
  }

  // If skipHtml is true, strip HTML tags from the source
  if (skipHtml) {
    processedContent = processedContent.replace(/<[^>]+>/g, '');
  }

  let html = parseMarkdownBlocks(processedContent, escapeHtmlFlag, linkTarget);

  // Add target attribute to links if specified
  if (linkTarget) {
    html = html.replace(/<a href=/g, `<a target="${escapeHtml(linkTarget)}" rel="noopener noreferrer" href=`);
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MarkdownRenderer - Renders Markdown content as rich HTML.
 *
 * Features:
 * - Complete GFM (GitHub Flavored Markdown) support
 * - Headings (h1-h6), bold, italic, strikethrough
 * - Links, images, inline code
 * - Fenced and indented code blocks with syntax highlighting
 * - Unordered and ordered lists with nesting support
 * - Blockquotes (including nested)
 * - Horizontal rules
 * - GFM tables with column alignment
 * - Task lists with checkboxes
 * - Paragraphs and line breaks
 * - Frontmatter stripping (YAML between ---)
 * - HTML sanitization option
 * - Custom component overrides
 * - Link/image handlers
 * - Escape HTML option for user-generated content
 * - Skip HTML blocks option
 * - Accessible rendering
 *
 * @example
 * // Basic usage
 * <MarkdownRenderer content="# Hello\n\nWorld" />
 *
 * @example
 * // With options
 * <MarkdownRenderer
 *   content={markdown}
 *   sanitize
 *   linkHandler={(href) => router.push(href)}
 *   imageHandler={(src) => cdnUrl(src)}
 *   escapeHtml
 * />
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  style,
  theme,
  sanitize = false,
  allowedTags,
  allowedAttributes,
  maxDepth,
  onError,
  onRender,
  fallback,
  loading,
  renderers,
  components,
  linkHandler,
  imageHandler,
  codeBlockHandler,
  tableHandler,
  testID,
  accessible,
  accessibilityLabel,
  // Markdown-specific props
  allowedTypes,
  disallowedTypes,
  unwrapDisallowed,
  plugins,
  sourcePos,
  rawSourcePos,
  escapeHtml = false,
  skipHtml = false,
  linkTarget,
  transformLinkUri,
  transformImageUri,
}) => {
  // Parse markdown to HTML
  const htmlContent = useMemo(() => {
    if (!content || typeof content !== 'string') return '';

    try {
      let processedContent = content;

      // Apply transformLinkUri if provided
      if (transformLinkUri) {
        processedContent = processedContent.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          (match, text, uri) => {
            try {
              const newUri = transformLinkUri(uri);
              return `[${text}](${newUri})`;
            } catch {
              return match;
            }
          }
        );
      }

      // Apply transformImageUri if provided
      if (transformImageUri) {
        processedContent = processedContent.replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          (match, alt, uri) => {
            try {
              const newUri = transformImageUri(uri);
              return `![${alt}](${newUri})`;
            } catch {
              return match;
            }
          }
        );
      }

      return parseMarkdownToHTML(processedContent, {
        escapeHtml,
        skipHtml,
        linkTarget,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      if (process.env.NODE_ENV !== 'production') {
        console.error('[MarkdownRenderer] Failed to parse markdown:', error);
      }
      // Return escaped raw content as fallback
      return `<p>${((): string => {
        const s = content;
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      })()}</p>`;
    }
  }, [content, escapeHtml, skipHtml, linkTarget, transformLinkUri, transformImageUri, onError]);

  // Handle empty content
  if (!content) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  // Default markdown styles
  const defaultStyles: React.CSSProperties = {
    lineHeight: 1.6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#1a202c',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  };

  // Styles for markdown elements (injected via data attributes + wrapper style)
  const mergedStyle: React.CSSProperties = {
    ...defaultStyles,
    ...style,
  };

  // Custom components for markdown elements (passed to HTMLRenderer)
  const markdownComponents = useMemo(() => {
    const customComponents: Record<string, React.ComponentType<Record<string, unknown>>> = {};

    // Merge user-provided components
    if (components) {
      Object.assign(customComponents, components);
    }
    if (renderers) {
      Object.assign(customComponents, renderers);
    }

    // Add code block handler if provided
    if (codeBlockHandler) {
      customComponents['pre'] = ({ children, ...props }: any) => {
        // Extract code from children
        const codeElement = Array.isArray(children)
          ? children.find((c: any) => c?.props?.dangerouslySetInnerHTML || c?.type === 'code')
          : children;

        let codeText = '';
        let lang = '';

        if (React.isValidElement(codeElement) && (codeElement as any).props) {
          const innerChildren = (codeElement as any).props.children;
          if (typeof innerChildren === 'string') {
            codeText = innerChildren;
          }
          const className = (codeElement as any).props.className || '';
          const langMatch = className.match(/language-(\w+)/);
          if (langMatch) lang = langMatch[1];
        }

        if (codeText) {
          return <>{codeBlockHandler(codeText, lang)}</>;
        }

        return <pre {...props}>{children}</pre>;
      };
    }

    // Add table handler if provided
    if (tableHandler) {
      customComponents['table'] = ({ children, ...props }: any) => {
        // Extract table data from children
        const headers: string[] = [];
        const rows: string[][] = [];

        return <>{tableHandler({ headers, rows } as any)}</>;
      };
    }

    return customComponents;
  }, [components, renderers, codeBlockHandler, tableHandler]);

  return (
    <div
      className={className}
      style={mergedStyle}
      data-testid={testID || 'content-renderer-markdown'}
      role={accessible !== false ? 'article' : undefined}
      aria-label={accessibilityLabel || 'Markdown content'}
    >
      <style>{`
        [data-testid="content-renderer-markdown"] h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
        [data-testid="content-renderer-markdown"] h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
        [data-testid="content-renderer-markdown"] h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em; }
        [data-testid="content-renderer-markdown"] h4 { font-size: 1em; font-weight: 600; margin: 1em 0 0.5em; }
        [data-testid="content-renderer-markdown"] h5 { font-size: 0.875em; font-weight: 600; margin: 1em 0 0.5em; }
        [data-testid="content-renderer-markdown"] h6 { font-size: 0.85em; font-weight: 600; margin: 1em 0 0.5em; color: #6a737d; }
        [data-testid="content-renderer-markdown"] p { margin: 0 0 1em; }
        [data-testid="content-renderer-markdown"] a { color: #0366d6; text-decoration: none; }
        [data-testid="content-renderer-markdown"] a:hover { text-decoration: underline; }
        [data-testid="content-renderer-markdown"] strong { font-weight: 600; }
        [data-testid="content-renderer-markdown"] code { font-family: "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace; font-size: 85%; padding: 0.2em 0.4em; margin: 0; background-color: rgba(27, 31, 35, 0.05); border-radius: 3px; }
        [data-testid="content-renderer-markdown"] pre { background-color: #f6f8fa; border-radius: 6px; padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; margin: 0 0 1em; }
        [data-testid="content-renderer-markdown"] pre code { display: inline; max-width: auto; padding: 0; margin: 0; overflow: visible; line-height: inherit; word-wrap: normal; background-color: transparent; border: 0; font-size: 100%; }
        [data-testid="content-renderer-markdown"] blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 0 0 1em; }
        [data-testid="content-renderer-markdown"] blockquote p { margin: 0; }
        [data-testid="content-renderer-markdown"] ul, [data-testid="content-renderer-markdown"] ol { padding-left: 2em; margin: 0 0 1em; }
        [data-testid="content-renderer-markdown"] li { margin: 0.25em 0; }
        [data-testid="content-renderer-markdown"] li > ul, [data-testid="content-renderer-markdown"] li > ol { margin: 0; }
        [data-testid="content-renderer-markdown"] hr { height: 0.25em; padding: 0; margin: 1.5em 0; background-color: #e1e4e8; border: 0; }
        [data-testid="content-renderer-markdown"] table { border-collapse: collapse; width: 100%; margin: 0 0 1em; overflow: auto; }
        [data-testid="content-renderer-markdown"] table th, [data-testid="content-renderer-markdown"] table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
        [data-testid="content-renderer-markdown"] table th { font-weight: 600; background-color: #f6f8fa; }
        [data-testid="content-renderer-markdown"] table tr { background-color: #fff; border-top: 1px solid #c6cbd1; }
        [data-testid="content-renderer-markdown"] table tr:nth-child(2n) { background-color: #f6f8fa; }
        [data-testid="content-renderer-markdown"] img { max-width: 100%; box-sizing: content-box; }
        [data-testid="content-renderer-markdown"] del { color: #6a737d; }
        [data-testid="content-renderer-markdown"] input[type="checkbox"] { margin-right: 0.5em; }
      `}</style>
      <HTMLRenderer
        html={htmlContent}
        sanitize={sanitize}
        components={markdownComponents}
        onLinkClick={(href, e) => {
          linkHandler?.(href, e);
        }}
        fallback={fallback}
        testId={testID || 'content-renderer-markdown-inner'}
      />
    </div>
  );
};

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
