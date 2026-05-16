/**
 * HTML to Markdown converter.
 * Converts HTML content to clean Markdown text.
 * Supports: headings, paragraphs, bold, italic, code, links, images,
 * lists, tables, blockquotes, hr, br, and basic inline elements.
 */

export interface HTMLToMarkdownOptions {
  /** Heading style: 'atx' (#) or 'setext' (=== ---) */
  headingStyle?: 'atx' | 'setext';
  /** Bullet character for unordered lists */
  bullet?: '-' | '*' | '+';
  /** Code block style: 'fenced' (```) or 'indented' (4 spaces) */
  codeBlockStyle?: 'fenced' | 'indented';
  /** Fence character for fenced code blocks */
  fence?: '```' | '~~~';
  /** Horizontal rule style */
  hr?: '---' | '***' | '___';
  /** Whether to preserve emphasis markers in output */
  emDelimiter?: '*' | '_';
  /** Whether to preserve strong markers in output */
  strongDelimiter?: '**' | '__';
}

const DEFAULT_OPTIONS: Required<HTMLToMarkdownOptions> = {
  headingStyle: 'atx',
  bullet: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  hr: '---',
  emDelimiter: '*',
  strongDelimiter: '**',
};

/**
 * Convert HTML string to Markdown.
 */
export function htmlToMarkdown(html: string, options?: HTMLToMarkdownOptions): string {
  if (!html || typeof html !== 'string') return '';

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Remove scripts, styles, and their content
  let result = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Process block-level elements first, then inline
  result = convertHeadings(result, opts);
  result = convertHR(result, opts);
  result = convertCodeBlocks(result, opts);
  result = convertBlockquotes(result);
  result = convertLists(result, opts);
  result = convertTables(result);
  result = convertParagraphs(result);
  result = convertInlineElements(result, opts);
  result = convertImages(result);
  result = convertLinks(result);
  result = cleanupWhitespace(result);

  return result.trim();
}

function convertHeadings(html: string, opts: Required<HTMLToMarkdownOptions>): string {
  if (opts.headingStyle === 'setext') {
    // h1 and h2 → setext style
    html = html.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => {
      const text = convertInlineElements(content, opts).trim();
      return `${text}\n${'='.repeat(text.length)}\n\n`;
    });
    html = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => {
      const text = convertInlineElements(content, opts).trim();
      return `${text}\n${'-'.repeat(text.length)}\n\n`;
    });
    // h3-h6 → ATX style
    for (let i = 3; i <= 6; i++) {
      const hash = '#'.repeat(i);
      const regex = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
      html = html.replace(regex, (_, content) => {
        return `${hash} ${convertInlineElements(content, opts).trim()}\n\n`;
      });
    }
  } else {
    for (let i = 1; i <= 6; i++) {
      const hash = '#'.repeat(i);
      const regex = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
      html = html.replace(regex, (_, content) => {
        return `${hash} ${convertInlineElements(content, opts).trim()}\n\n`;
      });
    }
  }
  return html;
}

function convertHR(html: string, opts: Required<HTMLToMarkdownOptions>): string {
  return html.replace(/<hr\s*\/?>/gi, `\n\n${opts.hr}\n\n`);
}

function convertCodeBlocks(html: string, opts: Required<HTMLToMarkdownOptions>): string {
  // <pre><code> blocks
  html = html.replace(/<pre[^>]*><code[^>]*class="[^"]*language-(\w+)[^"]*"[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, lang, code) => {
      const decoded = decodeEntities(code);
      if (opts.codeBlockStyle === 'fenced') {
        return `\n\n${opts.fence}${lang}\n${decoded.trimEnd()}\n${opts.fence}\n\n`;
      }
      return `\n\n${decoded.trimEnd().split('\n').map(l => '    ' + l).join('\n')}\n\n`;
    });
  html = html.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, code) => {
      const decoded = decodeEntities(code);
      if (opts.codeBlockStyle === 'fenced') {
        return `\n\n${opts.fence}\n${decoded.trimEnd()}\n${opts.fence}\n\n`;
      }
      return `\n\n${decoded.trimEnd().split('\n').map(l => '    ' + l).join('\n')}\n\n`;
    });
  // Standalone <pre>
  html = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_, code) => {
      const decoded = decodeEntities(code);
      if (opts.codeBlockStyle === 'fenced') {
        return `\n\n${opts.fence}\n${decoded.trimEnd()}\n${opts.fence}\n\n`;
      }
      return `\n\n${decoded.trimEnd().split('\n').map(l => '    ' + l).join('\n')}\n\n`;
    });
  return html;
}

function convertBlockquotes(html: string): string {
  return html.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const text = content
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n> ')
      .replace(/<[^>]+>/g, '')
      .trim();
    return `\n\n${text.split('\n').map(l => `> ${l}`).join('\n')}\n\n`;
  });
}

function convertLists(html: string, opts: Required<HTMLToMarkdownOptions>): string {
  // Unordered lists
  html = html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = extractListItems(content, opts, false);
    return `\n${items}\n`;
  });
  // Ordered lists
  html = html.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = extractListItems(content, opts, true);
    return `\n${items}\n`;
  });
  return html;
}

function extractListItems(content: string, opts: Required<HTMLToMarkdownOptions>, ordered: boolean): string {
  const items: string[] = [];
  const regex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  let idx = 1;
  while ((match = regex.exec(content)) !== null) {
    const itemContent = match[1]
      .replace(/<br\s*\/?>/gi, '\n  ')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (ordered) {
      items.push(`${idx}. ${itemContent}`);
      idx++;
    } else {
      items.push(`${opts.bullet} ${itemContent}`);
    }
  }
  return items.join('\n');
}

function convertTables(html: string): string {
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, content) => {
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(content)) !== null) {
      const cells: string[] = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      rows.push(cells);
    }

    if (rows.length === 0) return '';

    // Determine column widths
    const colCount = Math.max(...rows.map(r => r.length));
    const colWidths: number[] = [];
    for (let c = 0; c < colCount; c++) {
      let maxLen = 3; // minimum width
      for (const row of rows) {
        if (row[c] && row[c].length > maxLen) maxLen = row[c].length;
      }
      colWidths.push(Math.min(maxLen, 30));
    }

    const padRight = (str: string, len: number) => str + ' '.repeat(Math.max(0, len - str.length));

    let md = '\n';
    // Header
    const header = rows[0] || [];
    md += '| ' + header.map((c, i) => padRight(c, colWidths[i] || 3)).join(' | ') + ' |\n';
    // Separator
    md += '| ' + colWidths.map(w => '-'.repeat(w)).join(' | ') + ' |\n';
    // Data rows
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      md += '| ' + row.map((c, i) => padRight(c, colWidths[i] || 3)).join(' | ') + ' |\n';
    }

    return md;
  });
}

function convertParagraphs(html: string): string {
  // Remove surrounding <p> tags, keeping content with double newlines
  html = html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  // Convert <br> to newline
  html = html.replace(/<br\s*\/?>/gi, '\n');
  // Remove remaining tags
  html = html.replace(/<div[^>]*>/gi, '\n');
  html = html.replace(/<\/div>/gi, '\n');
  html = html.replace(/<section[^>]*>/gi, '\n');
  html = html.replace(/<\/section>/gi, '\n');
  return html;
}

function convertInlineElements(html: string, opts: Required<HTMLToMarkdownOptions>): string {
  // Bold
  html = html.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, `${opts.strongDelimiter}$2${opts.strongDelimiter}`);
  // Italic
  html = html.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, `${opts.emDelimiter}$2${opts.emDelimiter}`);
  // Del/strikethrough
  html = html.replace(/<(del|s|strike)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~');
  // Inline code
  html = html.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  // Subscript
  html = html.replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, '~$1~');
  // Superscript
  html = html.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, '^$1^');
  // Mark/highlight
  html = html.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '==$1==');
  return html;
}

function convertImages(html: string): string {
  return html.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi,
    (_, src, alt) => `![${alt}](${src})`);
  html = html.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi,
    (_, alt, src) => `![${alt}](${src})`);
  html = html.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi,
    (_, src) => `![](${src})`);
  return html;
}

function convertLinks(html: string): string {
  return html.replace(/<a[^>]*href=["']([^"']*)["'][^>]*title=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, title, text) => `[${text}](${href} "${title}")`);
  html = html.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, text) => `[${text}](${href})`);
  return html;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function cleanupWhitespace(text: string): string {
  // Remove excessive blank lines (more than 2)
  text = text.replace(/\n{3,}/g, '\n\n');
  // Remove trailing whitespace on lines
  text = text.split('\n').map(l => l.trimEnd()).join('\n');
  return text;
}

export default htmlToMarkdown;
