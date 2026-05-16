// ==========================================
// PDF Export Utilities
// Converts rendered content to printable HTML,
// generates PDF-friendly styles, and provides
// download/preview using the browser print API.
// ==========================================

import type { ContentType } from '../types';

// ------------------------------------------
// Types
// ------------------------------------------

export interface PDFExportOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  header?: string;
  footer?: string;
  includeStyles?: boolean;
  includeMetadata?: boolean;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  colors?: {
    text: string;
    background: string;
    link: string;
    code: string;
    heading: string;
  };
  codeTheme?: 'light' | 'dark';
  embedImages?: boolean;
  imageQuality?: number;
}

export interface PDFContent {
  html: string;
  styles: string;
  metadata: {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    pageSize: string;
    orientation: string;
  };
}

// ------------------------------------------
// Default Options
// ------------------------------------------

const defaultOptions: Required<PDFExportOptions> = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
  header: '',
  footer: '',
  includeStyles: true,
  includeMetadata: true,
  title: 'Document',
  author: '',
  subject: '',
  keywords: '',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 12,
  lineHeight: 1.6,
  colors: {
    text: '#1f2937',
    background: '#ffffff',
    link: '#2563eb',
    code: '#f3f4f6',
    heading: '#111827',
  },
  codeTheme: 'light',
  embedImages: true,
  imageQuality: 0.85,
};

// Page sizes in mm
const pageSizes: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
};

// ------------------------------------------
// contentToPrintableHTML
// ------------------------------------------

/**
 * Convert raw content into a full, self-contained printable HTML document
 * suitable for PDF generation via the browser's print API.
 */
export function contentToPrintableHTML(
  content: string,
  options?: PDFExportOptions
): string {
  const opts = { ...defaultOptions, ...options };
  const page = pageSizes[opts.pageSize] || pageSizes.A4;

  // Determine effective page dimensions
  const isLandscape = opts.orientation === 'landscape';
  const pageWidth = isLandscape ? page.height : page.width;
  const pageHeight = isLandscape ? page.width : page.height;

  // Detect content type from raw content
  const detectedType = detectContentFormat(content);

  // Convert content to clean HTML body
  const bodyHTML = convertContentToBodyHTML(content, detectedType, opts);

  // Build metadata tags
  const metaTags: string[] = [];
  if (opts.title) metaTags.push(`    <title>${escapeHTML(opts.title)}</title>`);
  if (opts.author) metaTags.push(`    <meta name="author" content="${escapeHTML(opts.author)}">`);
  if (opts.subject) metaTags.push(`    <meta name="subject" content="${escapeHTML(opts.subject)}">`);
  if (opts.keywords) metaTags.push(`    <meta name="keywords" content="${escapeHTML(opts.keywords)}">`);

  // Build the header
  const headerHTML = opts.header
    ? `<div class="pdf-header">${opts.header}</div>`
    : '';

  // Build the footer
  const footerHTML = opts.footer
    ? `<div class="pdf-footer">${opts.footer}</div>`
    : `<div class="pdf-footer pdf-page-number"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${metaTags.join('\n')}
  <style>
${generatePDFStyles(opts)}
  </style>
</head>
<body>
  <div class="pdf-page" style="width: ${pageWidth}mm; min-height: ${pageHeight}mm;">
    ${headerHTML}
    <div class="pdf-content">
${bodyHTML}
    </div>
    ${footerHTML}
  </div>
  <script>
    // Auto-add page numbers if footer has the marker class
    window.addEventListener('DOMContentLoaded', function() {
      var footers = document.querySelectorAll('.pdf-page-number');
      footers.forEach(function(el) {
        el.textContent = 'Page ' + (window.__pageCounter || 1);
      });
    });
    // Print trigger helper
    window.addEventListener('afterprint', function() {
      document.title = '${escapeHTML(opts.title)}';
    });
  </script>
</body>
</html>`;
}

// ------------------------------------------
// generatePDFStyles
// ------------------------------------------

/**
 * Generate a complete CSS stylesheet for PDF output, including
 * @media print rules, typography, code blocks, tables, and page layout.
 */
export function generatePDFStyles(options?: PDFExportOptions): string {
  const opts = { ...defaultOptions, ...options };
  const page = pageSizes[opts.pageSize] || pageSizes.A4;
  const isLandscape = opts.orientation === 'landscape';
  const pageWidth = isLandscape ? page.height : page.width;
  const pageHeight = isLandscape ? page.width : page.height;

  const { colors, fontSize, lineHeight, fontFamily, margins, codeTheme } = opts;

  const codeBg = codeTheme === 'dark' ? '#1e293b' : colors.code;
  const codeColor = codeTheme === 'dark' ? '#e2e8f0' : colors.text;

  return `
    /* ============================================= */
    /* PDF Export Styles                              */
    /* ============================================= */

    @page {
      size: ${opts.pageSize} ${opts.orientation};
      margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: ${pageWidth}mm;
      background: ${colors.background};
      color: ${colors.text};
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Page layout */
    .pdf-page {
      position: relative;
      padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
      background: ${colors.background};
      page-break-after: always;
    }

    .pdf-page:last-child {
      page-break-after: auto;
    }

    /* Header and Footer */
    .pdf-header {
      text-align: center;
      font-size: ${fontSize - 2}px;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .pdf-footer {
      text-align: center;
      font-size: ${fontSize - 2}px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      margin-top: 16px;
    }

    /* Content area */
    .pdf-content {
      min-height: calc(${pageHeight}mm - ${margins.top} - ${margins.bottom} - 40px);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: ${colors.heading};
      line-height: 1.3;
      margin-top: 1.2em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1 { font-size: ${fontSize * 2}px; font-weight: 700; }
    h2 { font-size: ${fontSize * 1.5}px; font-weight: 600; }
    h3 { font-size: ${fontSize * 1.25}px; font-weight: 600; }
    h4 { font-size: ${fontSize * 1.1}px; font-weight: 600; }
    h5 { font-size: ${fontSize}px; font-weight: 600; }
    h6 { font-size: ${fontSize * 0.9}px; font-weight: 600; color: #6b7280; }

    p {
      margin: 0 0 ${fontSize}px;
      orphans: 3;
      widows: 3;
    }

    /* Links */
    a {
      color: ${colors.link};
      text-decoration: underline;
    }

    a[href^="http"]::after {
      content: " (" attr(href) ")";
      font-size: 0.8em;
      color: #9ca3af;
    }

    /* Lists */
    ul, ol {
      padding-left: 2em;
      margin: 0 0 ${fontSize}px;
    }

    li {
      margin-bottom: 0.25em;
    }

    /* Blockquotes */
    blockquote {
      border-left: 3px solid #d1d5db;
      margin: ${fontSize}px 0;
      padding: 8px 16px;
      color: #6b7280;
      background: #f9fafb;
      page-break-inside: avoid;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: ${fontSize}px 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      text-align: left;
      font-size: ${fontSize - 1}px;
    }

    th {
      background: #f3f4f6;
      font-weight: 600;
    }

    tr {
      page-break-inside: avoid;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      page-break-inside: avoid;
    }

    /* Code blocks */
    pre {
      background: ${codeBg};
      color: ${codeColor};
      padding: 12px 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: "Fira Code", "JetBrains Mono", "Consolas", monospace;
      font-size: ${fontSize - 1}px;
      line-height: 1.5;
      page-break-inside: avoid;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    code {
      font-family: "Fira Code", "JetBrains Mono", "Consolas", monospace;
      font-size: 0.9em;
    }

    :not(pre) > code {
      background: ${codeBg};
      color: ${codeColor};
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Inline styles */
    strong, b { font-weight: 700; }
    em, i { font-style: italic; }
    del, s { text-decoration: line-through; color: #9ca3af; }
    mark { background: #fef08a; padding: 1px 4px; border-radius: 2px; }

    /* Horizontal rules */
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: ${fontSize * 2}px 0;
    }

    /* Figures */
    figure {
      margin: ${fontSize * 2}px 0;
      text-align: center;
    }

    figcaption {
      font-size: ${fontSize - 1}px;
      color: #6b7280;
      margin-top: 8px;
    }

    /* Form elements (show as text for PDF) */
    input, select, textarea, button {
      border: 1px solid #d1d5db;
      padding: 4px 8px;
      font-size: ${fontSize - 1}px;
    }

    /* Print-specific overrides */
    @media print {
      html, body {
        width: ${pageWidth}mm;
      }

      .pdf-page {
        margin: 0;
        padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
        page-break-after: always;
        page-break-inside: avoid;
      }

      .pdf-page:last-child {
        page-break-after: auto;
      }

      .no-print {
        display: none !important;
      }

      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        break-after: avoid-page;
      }

      p, li, blockquote, pre, table, figure, img {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      a[href^="http"]::after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
        color: #9ca3af;
      }

      img {
        max-width: 100% !important;
      }

      pre {
        white-space: pre-wrap !important;
      }
    }

    /* Screen-only controls (hidden when printing) */
    .pdf-controls {
      display: block;
      text-align: center;
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 16px;
    }

    @media print {
      .pdf-controls {
        display: none !important;
      }
    }
  `;
}

// ------------------------------------------
// createPDFBlob
// ------------------------------------------

/**
 * Create a Blob from printable HTML content.
 * Uses the Blob API to generate a file that can be downloaded or previewed.
 */
export async function createPDFBlob(html: string): Promise<Blob> {
  // Create a blob from the HTML string
  // Note: This creates an HTML blob, not a true PDF binary.
  // To get a true PDF, the browser's print-to-PDF functionality should be used.
  return new Blob([html], {
    type: 'text/html;charset=utf-8',
  });
}

// ------------------------------------------
// downloadPDF
// ------------------------------------------

/**
 * Generate a printable HTML document and trigger a download.
 * Falls back to opening a print dialog if direct blob download
 * is not sufficient.
 */
export async function downloadPDF(
  content: string,
  filename?: string,
  options?: PDFExportOptions
): Promise<void> {
  const opts = { ...defaultOptions, ...options };
  const html = contentToPrintableHTML(content, opts);
  const blob = await createPDFBlob(html);
  const url = URL.createObjectURL(blob);

  const fileName = filename || `${sanitizeFilename(opts.title || 'document')}.html`;

  // Try to download the blob directly
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch {
    // Fallback: open in new tab (user can print from there)
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        win.print();
      });
    }
  }
}

// ------------------------------------------
// previewPDF
// ------------------------------------------

/**
 * Open a printable preview of the content in a new browser tab/window.
 * The user can then use Ctrl+P / Cmd+P to save as PDF.
 */
export function previewPDF(
  content: string,
  options?: PDFExportOptions
): void {
  const opts = { ...defaultOptions, ...options };
  const html = contentToPrintableHTML(content, opts);

  // Create a blob URL and open in a new tab
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');

  if (win) {
    // Auto-trigger print dialog after the page loads
    win.addEventListener('load', () => {
      setTimeout(() => {
        win.print();
      }, 500);
    });
  }
}

// ------------------------------------------
// getContentForPDF
// ------------------------------------------

/**
 * Get the complete content package (HTML + styles + metadata) for PDF generation.
 * This can be passed to an external PDF generation service or library.
 */
export function getContentForPDF(
  content: string,
  type: ContentType,
  options?: PDFExportOptions
): PDFContent {
  const opts = { ...defaultOptions, ...options };

  const detectedType = type || detectContentFormat(content);
  const bodyHTML = convertContentToBodyHTML(content, detectedType, opts);
  const styles = generatePDFStyles(opts);

  return {
    html: bodyHTML,
    styles,
    metadata: {
      title: opts.title || 'Document',
      author: opts.author || '',
      subject: opts.subject || '',
      keywords: opts.keywords || '',
      pageSize: opts.pageSize,
      orientation: opts.orientation,
    },
  };
}

// ==========================================
// Internal Helpers
// ==========================================

/**
 * Detect content format from raw content string.
 */
function detectContentFormat(content: string): ContentType {
  const trimmed = content.trim();

  // HTML
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) {
    return 'html';
  }

  // XML
  if (trimmed.startsWith('<?xml')) {
    return 'xml';
  }

  // JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }

  // PHP
  if (trimmed.startsWith('<?php')) {
    return 'php';
  }

  // Markdown heuristics
  if (/^#{1,6}\s+/m.test(trimmed) || /\[.+\]\(.+\)/.test(trimmed)) {
    return 'markdown';
  }

  // CSS heuristics
  if (/^([.#@:]?\w[\w-]*)\s*\{[^}]*\}/m.test(trimmed) || trimmed.includes(':root')) {
    return 'css';
  }

  // Default to HTML (will render as plain text if not HTML)
  return 'html';
}

/**
 * Convert content to clean HTML body content.
 */
function convertContentToBodyHTML(
  content: string,
  type: ContentType,
  options: Required<PDFExportOptions>
): string {
  switch (type) {
    case 'html':
    case 'html5':
      return sanitizeHTMLForPDF(content, options);

    case 'markdown':
      return markdownToPrintableHTML(content, options);

    case 'json':
      return jsonToPrintableHTML(content, options);

    case 'xml':
      return xmlToPrintableHTML(content, options);

    case 'css':
      return cssToPrintableHTML(content, options);

    case 'php':
      return codeToPrintableHTML(content, 'php', options);

    case 'code':
    case 'javascript':
    case 'typescript':
    case 'yaml':
      return codeToPrintableHTML(content, type, options);

    default:
      // Treat as plain text
      return `<pre>${escapeHTML(content)}</pre>`;
  }
}

/**
 * Sanitize raw HTML for PDF output.
 * Strips scripts, dangerous attributes, and normalizes structure.
 */
function sanitizeHTMLForPDF(html: string, options: Required<PDFExportOptions>): string {
  let cleaned = html;

  // Remove script tags and their content
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove noscript tags
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  // Remove style tags (we inject our own)
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove meta tags (not needed in PDF body)
  cleaned = cleaned.replace(/<meta[^>]*\/?>/gi, '');
  // Remove link tags (stylesheets, favicons)
  cleaned = cleaned.replace(/<link[^>]*\/?>/gi, '');
  // Remove event handlers
  cleaned = cleaned.replace(/\s(on\w+)="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s(on\w+)='[^']*'/gi, '');
  // Remove javascript: URLs
  cleaned = cleaned.replace(/href="javascript:[^"]*"/gi, 'href="#"');
  cleaned = cleaned.replace(/href='javascript:[^']*'/gi, 'href="#"');

  // If the content has a full HTML document, extract just the body
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    cleaned = bodyMatch[1];
  }

  return cleaned.trim();
}

/**
 * Convert Markdown content to printable HTML.
 * Uses a lightweight regex-based approach.
 */
function markdownToPrintableHTML(md: string, options: Required<PDFExportOptions>): string {
  let html = md;

  // Escape HTML entities (but preserve our generated tags)
  html = escapeHTML(html);

  // Code blocks (must be done before other replacements)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const language = lang || 'text';
    const unescaped = unescapeHTML(code.trim());
    return `<pre><code class="language-${language}">${unescaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Blockquotes
  html = html.replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');

  // Unordered lists
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Paragraphs (wrap standalone lines)
  html = html.replace(/^(?!<[a-z/])(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<blockquote>\s*<\/blockquote>/g, '');

  return html.trim();
}

/**
 * Convert JSON to a readable HTML representation.
 */
function jsonToPrintableHTML(json: string, options: Required<PDFExportOptions>): string {
  try {
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);
    const escaped = escapeHTML(formatted);
    return `<h1>JSON Data</h1><pre><code class="language-json">${escaped}</code></pre>`;
  } catch {
    return `<p><strong>Invalid JSON content</strong></p><pre>${escapeHTML(json)}</pre>`;
  }
}

/**
 * Convert XML to a readable HTML representation.
 */
function xmlToPrintableHTML(xml: string, _options: Required<PDFExportOptions>): string {
  const escaped = escapeHTML(xml);
  return `<pre><code class="language-xml">${escaped}</code></pre>`;
}

/**
 * Convert CSS to a readable HTML representation.
 */
function cssToPrintableHTML(css: string, _options: Required<PDFExportOptions>): string {
  const escaped = escapeHTML(css);
  return `<h1>CSS Stylesheet</h1><pre><code class="language-css">${escaped}</code></pre>`;
}

/**
 * Convert code content to a printable HTML pre block.
 */
function codeToPrintableHTML(
  code: string,
  language: string,
  _options: Required<PDFExportOptions>
): string {
  const escaped = escapeHTML(code);
  return `<pre><code class="language-${language}">${escaped}</code></pre>`;
}

// ------------------------------------------
// Utility Functions
// ------------------------------------------

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescapeHTML(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

// ------------------------------------------
// Enhanced PDF Functions (html2canvas-style)
// ------------------------------------------

/** Options for canvas-based page rendering */
export interface PDFPageOptions {
  width: number;
  height: number;
  margins: { top: number; right: number; bottom: number; left: number };
  scale?: number;
  backgroundColor?: string;
}

/** Convert content to a canvas-ready HTML snippet for html2canvas integration */
export function contentToCanvasHTML(
  content: string,
  options?: PDFPageOptions
): string {
  const w = options?.width || 794;
  const h = options?.height || 1123;
  const m = options?.margins || { top: 20, right: 20, bottom: 20, left: 20 };
  const bg = options?.backgroundColor || '#ffffff';
  const scale = options?.scale || 2;
  return '<div style="position:relative;width:' + w + 'px;height:' + h + 'px;' +
    'padding:' + m.top + 'px ' + m.right + 'px ' + m.bottom + 'px ' + m.left + 'px;' +
    'background:' + bg + ';overflow:hidden;transform:scale(' + scale + ');transform-origin:top left;">' +
    content + '</div>';
}

/** Generate CSS for a specific page layout for multi-page canvas rendering */
export function generatePageCSS(options?: PDFPageOptions): string {
  const w = options?.width || 794;
  const h = options?.height || 1123;
  const m = options?.margins || { top: 20, right: 20, bottom: 20, left: 20 };
  const bg = options?.backgroundColor || '#ffffff';
  return '.pdf-canvas-page{position:relative;width:' + w + 'px;min-height:' + h + 'px;' +
    'padding:' + m.top + 'px ' + m.right + 'px ' + m.bottom + 'px ' + m.left + 'px;' +
    'background:' + bg + ';overflow:hidden;box-sizing:border-box;}';
}

/** Split content HTML into page-sized chunks based on estimated height */
export function splitContentForPages(
  html: string,
  pageHeight?: number,
  margins?: { top: number; right: number; bottom: number; left: number }
): string[] {
  const ph = pageHeight || 1123;
  const m = margins || { top: 20, right: 20, bottom: 20, left: 20 };
  const usableHeight = ph - m.top - m.bottom;
  const charsPerLine = 80;
  const charsPerPage = (usableHeight / 24) * charsPerLine;
  if (html.length <= charsPerPage) return [html];
  const pages: string[] = [];
  let remaining = html;
  while (remaining.length > 0) {
    if (remaining.length <= charsPerPage) { pages.push(remaining); break; }
    let splitAt = remaining.lastIndexOf('</p>', charsPerPage);
    if (splitAt === -1 || splitAt < charsPerPage * 0.5) {
      splitAt = remaining.lastIndexOf('</div>', charsPerPage);
    }
    if (splitAt === -1 || splitAt < charsPerPage * 0.5) {
      splitAt = remaining.lastIndexOf('<br', charsPerPage);
    }
    if (splitAt === -1 || splitAt < charsPerPage * 0.5) {
      splitAt = charsPerPage;
    }
    pages.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  return pages;
}

/** Convert an HTML table to print-optimized HTML with page-break rules */
export function tableToPrintHTML(tableHTML: string): string {
  return '<div class="print-table-container" style="overflow-x:auto;page-break-inside:avoid;">' +
    tableHTML + '</div>';
}
