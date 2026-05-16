import {
  ContentType,
  ExtractOptions,
  ExtractedData,
  ExtractedLink,
  ExtractedImage,
  ExtractedScript,
  ExtractedStyle,
  ExtractedMeta,
  ExtractedHeading,
  ExtractedTable,
  ExtractedForm,
  ExtractedInput,
  ExtractedList,
  ExtractedCodeBlock,
  SEOMetadata,
} from '../types';
import { HTMLParser } from '../parsers/html-parser';
import { MarkdownParser } from '../parsers/markdown-parser';

const htmlParser = new HTMLParser();
const markdownParser = new MarkdownParser();

export function extractAll(content: string, contentType: ContentType, options?: ExtractOptions): ExtractedData {
  const emptyData: ExtractedData = {
    text: '',
    links: [],
    images: [],
    scripts: [],
    styles: [],
    meta: [],
    headings: [],
    tables: [],
    forms: [],
    lists: [],
    codeBlocks: [],
    comments: [],
    custom: {},
  };

  if (!content || !content.trim()) return { ...emptyData, text: '' };

  switch (contentType) {
    case 'html':
    case 'html5':
      return extractHTMLAll(content, options);
    case 'markdown':
      return extractMarkdownAll(content, options);
    case 'json':
      return { ...emptyData, text: extractText(content, contentType) };
    case 'xml':
      return { ...emptyData, text: extractText(content, contentType) };
    case 'php':
      return extractPHPAll(content, options);
    case 'css':
      return extractCSSAll(content, options);
    default:
      return { ...emptyData, text: extractText(content, contentType) };
  }
}

function extractHTMLAll(content: string, options?: ExtractOptions): ExtractedData {
  return {
    text: extractText(content, 'html'),
    links: extractLinks(content, 'html'),
    images: extractImages(content, 'html'),
    scripts: extractScripts(content, 'html'),
    styles: extractStyles(content, 'html'),
    meta: extractMeta(content, 'html'),
    headings: extractHeadings(content, 'html'),
    tables: extractTables(content, 'html'),
    forms: extractForms(content, 'html'),
    lists: extractLists(content, 'html'),
    codeBlocks: extractCodeBlocks(content, 'html'),
    comments: extractComments(content, 'html'),
    custom: {},
  };
}

function extractMarkdownAll(content: string, options?: ExtractOptions): ExtractedData {
  const doc = markdownParser.parse(content);
  return {
    text: extractText(content, 'markdown'),
    links: doc.links.map((l) => ({
      href: l.href,
      text: l.text,
      title: l.title,
      isExternal: l.href.startsWith('http'),
      isAnchor: l.href.startsWith('#'),
    })),
    images: doc.images.map((i) => ({
      src: i.src,
      alt: i.alt,
      title: i.title,
    })),
    scripts: [],
    styles: [],
    meta: [],
    headings: doc.headings.map((h) => ({ level: h.level, text: h.text, id: h.slug })),
    tables: doc.tables.map((t) => ({ headers: t.headers, rows: t.rows })),
    forms: [],
    lists: extractListsFromMarkdown(content),
    codeBlocks: doc.codeBlocks.map((cb) => ({
      language: cb.language,
      code: cb.code,
    })),
    comments: [],
    custom: doc.frontmatter || {},
  };
}

function extractPHPAll(content: string, options?: ExtractOptions): ExtractedData {
  return {
    text: extractText(content, 'php'),
    links: extractLinks(content, 'php'),
    images: [],
    scripts: [],
    styles: [],
    meta: [],
    headings: [],
    tables: [],
    forms: [],
    lists: [],
    codeBlocks: [],
    comments: extractComments(content, 'php'),
    custom: {},
  };
}

function extractCSSAll(content: string, options?: ExtractOptions): ExtractedData {
  return {
    text: extractText(content, 'css'),
    links: [],
    images: [],
    scripts: [],
    styles: [{ content, type: 'text/css' }],
    meta: [],
    headings: [],
    tables: [],
    forms: [],
    lists: [],
    codeBlocks: [{ language: 'css', code: content }],
    comments: extractComments(content, 'css'),
    custom: {},
  };
}

export function extractText(content: string, contentType: ContentType): string {
  if (!content) return '';

  switch (contentType) {
    case 'html':
    case 'html5': {
      return content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }
    case 'markdown': {
      return content
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
        .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/---+/g, '')
        .replace(/\|/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    case 'php': {
      return content
        .replace(/<\?php/g, '')
        .replace(/\?>/g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/#.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\$\w+/g, '')
        .replace(/["'][^"']*["']/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    case 'css': {
      return content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/@[^{]+\{/g, '')
        .replace(/[^{}]+\{/g, '')
        .replace(/\}/g, '')
        .trim();
    }
    default:
      return content.trim();
  }
}

export function extractLinks(content: string, contentType?: ContentType): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  if (!content) return links;

  const isExternal = (href: string): boolean => /^https?:\/\//.test(href);
  const isAnchor = (href: string): boolean => href.startsWith('#');

  // HTML link tags
  const linkRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const titleMatch = match[0].match(/title=["']([^"']*)["']/);
    const targetMatch = match[0].match(/target=["']([^"']*)["']/);
    const relMatch = match[0].match(/rel=["']([^"']*)["']/);
    links.push({
      href,
      text,
      title: titleMatch?.[1],
      target: targetMatch?.[1],
      rel: relMatch?.[1],
      isExternal: isExternal(href),
      isAnchor: isAnchor(href),
    });
  }

  // Markdown links
  const mdLinkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const href = match[2];
    links.push({
      href,
      text: match[1],
      title: match[3],
      isExternal: isExternal(href),
      isAnchor: isAnchor(href),
    });
  }

  // CSS url() links
  const cssUrlRegex = /url\(["']?([^"')]+)["']?\)/g;
  while ((match = cssUrlRegex.exec(content)) !== null) {
    links.push({
      href: match[1],
      text: match[1],
      isExternal: isExternal(match[1]),
      isAnchor: false,
    });
  }

  return links;
}

export function extractImages(content: string, contentType?: ContentType): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  if (!content) return images;

  // HTML img tags
  const imgRegex = /<img\s+([^>]+)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(content)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']*)["']/);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/);
    const titleMatch = attrs.match(/title=["']([^"']*)["']/);
    const widthMatch = attrs.match(/width=["'](\d+)["']/);
    const heightMatch = attrs.match(/height=["'](\d+)["']/);
    const srcsetMatch = attrs.match(/srcset=["']([^"']*)["']/);
    const loadingMatch = attrs.match(/loading=["']([^"']*)["']/);

    if (srcMatch) {
      images.push({
        src: srcMatch[1],
        alt: altMatch?.[1],
        title: titleMatch?.[1],
        width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
        height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
        srcset: srcsetMatch?.[1],
        loading: loadingMatch?.[1],
      });
    }
  }

  // Markdown images
  const mdImgRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  while ((match = mdImgRegex.exec(content)) !== null) {
    images.push({
      src: match[2],
      alt: match[1] || undefined,
      title: match[3],
    });
  }

  // CSS background-image
  const cssBgRegex = /background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = cssBgRegex.exec(content)) !== null) {
    images.push({ src: match[1] });
  }

  return images;
}

export function extractScripts(content: string, contentType?: ContentType): ExtractedScript[] {
  const scripts: ExtractedScript[] = [];
  if (!content) return scripts;

  // Inline scripts
  const inlineScriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = inlineScriptRegex.exec(content)) !== null) {
    const attrs = match[1];
    const typeMatch = attrs.match(/type=["']([^"']*)["']/);
    const srcMatch = attrs.match(/src=["']([^"']*)["']/);
    const asyncAttr = /async/.test(attrs);
    const deferAttr = /defer/.test(attrs);
    const type = typeMatch?.[1];
    const isModule = type === 'module' || type === 'text/javascript';

    scripts.push({
      content: match[2].trim(),
      type: type || undefined,
      src: srcMatch?.[1],
      async: asyncAttr,
      defer: deferAttr,
      isModule,
    });
  }

  // Script tags with src only
  const srcOnlyRegex = /<script\s+[^>]*src=["']([^"']*)["'][^>]*><\/script>/gi;
  while ((match = srcOnlyRegex.exec(content)) !== null) {
    const attrs = match[0];
    const typeMatch = attrs.match(/type=["']([^"']*)["']/);
    scripts.push({
      content: '',
      type: typeMatch?.[1],
      src: match[1],
      async: /async/.test(attrs),
      defer: /defer/.test(attrs),
      isModule: typeMatch?.[1] === 'module',
    });
  }

  return scripts;
}

export function extractStyles(content: string, contentType?: ContentType): ExtractedStyle[] {
  const styles: ExtractedStyle[] = [];
  if (!content) return styles;

  // Inline style tags
  const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  while ((match = styleRegex.exec(content)) !== null) {
    const attrs = match[1];
    const mediaMatch = attrs.match(/media=["']([^"']*)["']/);
    const typeMatch = attrs.match(/type=["']([^"']*)["']/);
    styles.push({
      content: match[2].trim(),
      media: mediaMatch?.[1],
      type: typeMatch?.[1],
    });
  }

  // Link tags for stylesheets
  const linkCssRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;
  while ((match = linkCssRegex.exec(content)) !== null) {
    const hrefMatch = match[0].match(/href=["']([^"']*)["']/);
    const mediaMatch = match[0].match(/media=["']([^"']*)["']/);
    if (hrefMatch) {
      styles.push({
        content: `/* External: ${hrefMatch[1]} */`,
        media: mediaMatch?.[1],
        type: 'text/css',
      });
    }
  }

  return styles;
}

export function extractMeta(content: string, contentType?: ContentType): ExtractedMeta[] {
  const metas: ExtractedMeta[] = [];
  if (!content) return metas;

  const metaRegex = /<meta\s+([^>]+)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = metaRegex.exec(content)) !== null) {
    const attrs = match[1];
    const nameMatch = attrs.match(/name=["']([^"']*)["']/);
    const contentMatch = attrs.match(/content=["']([^"']*)["']/);
    const propertyMatch = attrs.match(/property=["']([^"']*)["']/);
    const charsetMatch = attrs.match(/charset=["']([^"']*)["']/);
    const httpEquivMatch = attrs.match(/http-equiv=["']([^"']*)["']/);

    metas.push({
      name: nameMatch?.[1],
      content: contentMatch?.[1] || '',
      property: propertyMatch?.[1],
      charset: charsetMatch?.[1],
      httpEquiv: httpEquivMatch?.[1],
    });
  }

  return metas;
}

export function extractHeadings(content: string, contentType?: ContentType): ExtractedHeading[] {
  const headings: ExtractedHeading[] = [];
  if (!content) return headings;

  // HTML headings - more robust regex for id attribute
  const headingRegex = /<h([1-6])\b[^>]*?id=["']([^"']*)["'][^>]*>([\s\S]*?)<\/h[1-6]>|<h([1-6])\b[^>]*?>([\s\S]*?)<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    if (match[1]) {
      // First pattern match (with ID)
      const level = parseInt(match[1], 10);
      const id = match[2];
      const text = match[3].replace(/<[^>]+>/g, '').trim();
      headings.push({ level, text, id });
    } else {
      // Second pattern match (no ID in regex, but check again in attrs)
      const level = parseInt(match[4], 10);
      const text = match[5].replace(/<[^>]+>/g, '').trim();
      const idMatch = match[0].match(/\bid=["']([^"']*)["']/i);
      headings.push({ level, text, id: idMatch?.[1] });
    }
  }

  // Markdown headings
  const mdHeadingRegex = /^(#{1,6})\s+(.+)$/gm;
  while ((match = mdHeadingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push({ level, text, id });
  }

  // Sort by position
  return headings.sort((a, b) => {
    const posA = content.indexOf(a.text);
    const posB = content.indexOf(b.text);
    return posA - posB;
  });
}

export function extractTables(content: string, contentType?: ContentType): ExtractedTable[] {
  const tables: ExtractedTable[] = [];
  if (!content) return tables;

  // HTML tables
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(content)) !== null) {
    const tableContent = match[1];
    const headers: string[] = [];
    const rows: string[][] = [];
    let caption: string | undefined;

    // Extract caption
    const captionMatch = tableContent.match(/<caption[^>]*>([\s\S]*?)<\/caption>/i);
    if (captionMatch) {
      caption = captionMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // Extract headers from th or first tr
    const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
    const headerCells: string[] = [];
    while ((match = thRegex.exec(tableContent)) !== null) {
      headerCells.push(match[1].replace(/<[^>]+>/g, '').trim());
    }
    if (headerCells.length > 0) {
      headers.push(...headerCells);
    }

    // Extract rows from tr
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let firstRow = true;
    while ((match = trRegex.exec(tableContent)) !== null) {
      const trContent = match[1];
      const cells: string[] = [];

      const tdRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = tdRegex.exec(trContent)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
      }

      if (firstRow && headers.length === 0 && cells.length > 0) {
        headers.push(...cells);
        firstRow = false;
      } else {
        // Skip adding the first row if it was already used as headers
        if (firstRow && headers.length > 0 && JSON.stringify(cells) === JSON.stringify(headers)) {
          firstRow = false;
          continue;
        }
        rows.push(cells);
        firstRow = false;
      }
    }

    tables.push({ headers, rows, caption });
  }

  // Markdown tables
  const lines = content.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].includes('|') && i + 1 < lines.length && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(lines[i + 1].trim())) {
      const headerLine = lines[i];
      const separatorLine = lines[i + 1];
      const headers = headerLine.split('|').map((c) => c.trim()).filter(Boolean);
      const dataRows: string[][] = [];

      i += 2;
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map((c) => c.trim()).filter(Boolean);
        dataRows.push(cells);
        i++;
      }

      tables.push({ headers, rows: dataRows });
    } else {
      i++;
    }
  }

  return tables;
}

export function extractForms(content: string, contentType?: ContentType): ExtractedForm[] {
  const forms: ExtractedForm[] = [];
  if (!content) return forms;

  const formRegex = /<form([^>]*)>([\s\S]*?)<\/form>/gi;
  let match: RegExpExecArray | null;
  while ((match = formRegex.exec(content)) !== null) {
    const attrs = match[1];
    const actionMatch = attrs.match(/action=["']([^"']*)["']/);
    const methodMatch = attrs.match(/method=["']([^"']*)["']/i);
    const idMatch = attrs.match(/id=["']([^"']*)["']/);
    const nameMatch = attrs.match(/name=["']([^"']*)["']/);

    const inputs: ExtractedInput[] = [];
    const formContent = match[2];

    // Extract labels for correlation
    const labels: Record<string, string> = {};
    const labelRegex = /<label[^>]*(?:for=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/label>/gi;
    let labelMatch: RegExpExecArray | null;
    while ((labelMatch = labelRegex.exec(formContent)) !== null) {
      const htmlFor = labelMatch[1];
      const labelText = labelMatch[2].replace(/<[^>]+>/g, '').trim();
      if (htmlFor) {
        labels[htmlFor] = labelText;
      }
    }

    // Extract inputs
    const inputRegex = /<input\s+([^>]+)\/?>/gi;
    let inputMatch: RegExpExecArray | null;
    while ((inputMatch = inputRegex.exec(formContent)) !== null) {
      const inputAttrs = inputMatch[1];
      const typeMatch = inputAttrs.match(/type=["']([^"']*)["']/i);
      const nameM = inputAttrs.match(/name=["']([^"']*)["']/);
      const idM = inputAttrs.match(/id=["']([^"']*)["']/);
      const valueM = inputAttrs.match(/value=["']([^"']*)["']/);
      const placeholderM = inputAttrs.match(/placeholder=["']([^"']*)["']/);

      inputs.push({
        type: typeMatch?.[1] || 'text',
        name: nameM?.[1],
        id: idM?.[1],
        value: valueM?.[1],
        placeholder: placeholderM?.[1],
        required: /required/.test(inputAttrs),
        label: idM?.[1] ? labels[idM[1]] : undefined,
      });
    }

    // Extract textareas
    const textareaRegex = /<textarea\s+([^>]+)>([\s\S]*?)<\/textarea>/gi;
    while ((inputMatch = textareaRegex.exec(formContent)) !== null) {
      const taAttrs = inputMatch[1];
      const nameM = taAttrs.match(/name=["']([^"']*)["']/);
      const idM = taAttrs.match(/id=["']([^"']*)["']/);
      const placeholderM = taAttrs.match(/placeholder=["']([^"']*)["']/);

      inputs.push({
        type: 'textarea',
        name: nameM?.[1],
        id: idM?.[1],
        value: inputMatch[2].trim(),
        placeholder: placeholderM?.[1],
        required: /required/.test(taAttrs),
        label: idM?.[1] ? labels[idM?.[1]] : undefined,
      });
    }

    // Extract selects
    const selectRegex = /<select\s+([^>]+)>([\s\S]*?)<\/select>/gi;
    while ((inputMatch = selectRegex.exec(formContent)) !== null) {
      const selAttrs = inputMatch[1];
      const nameM = selAttrs.match(/name=["']([^"']*)["']/);
      const idM = selAttrs.match(/id=["']([^"']*)["']/);

      inputs.push({
        type: 'select',
        name: nameM?.[1],
        id: idM?.[1],
        value: undefined,
        required: /required/.test(selAttrs),
        label: idM?.[1] ? labels[idM?.[1]] : undefined,
      });
    }

    forms.push({
      action: actionMatch?.[1],
      method: methodMatch?.[1],
      inputs,
      id: idMatch?.[1],
      name: nameMatch?.[1],
    });
  }

  return forms;
}

export function extractLists(content: string, contentType?: ContentType): ExtractedList[] {
  const lists: ExtractedList[] = [];
  if (!content) return lists;

  if (contentType === 'markdown') {
    return extractListsFromMarkdown(content);
  }

  // HTML lists
  const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
  let match: RegExpExecArray | null;
  while ((match = ulRegex.exec(content)) !== null) {
    const items = extractListItems(match[1]);
    lists.push({ ordered: false, items, depth: 1 });
  }

  const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
  while ((match = olRegex.exec(content)) !== null) {
    const items = extractListItems(match[1]);
    lists.push({ ordered: true, items, depth: 1 });
  }

  return lists;
}

function extractListItems(html: string): string[] {
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html)) !== null) {
    items.push(match[1].replace(/<[^>]+>/g, '').trim());
  }
  return items;
}

function extractListsFromMarkdown(content: string): ExtractedList[] {
  const lists: ExtractedList[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    const orderedMatch = line.match(/^(\s*)\d+[.)]\s+(.+)$/);

    if (unorderedMatch || orderedMatch) {
      const isOrdered = !!orderedMatch;
      const indent = (unorderedMatch || orderedMatch)![1].length;
      const items: string[] = [];
      const depth = Math.floor(indent / 2) + 1;

      while (i < lines.length) {
        const currentLine = lines[i];
        const currentIndent = (currentLine.match(/^(\s*)/)?.[1].length || 0);
        const uMatch = currentLine.match(/^\s*[-*+]\s+(.+)$/);
        const oMatch = currentLine.match(/^\s*\d+[.)]\s+(.+)$/);

        if (currentIndent < indent || (currentIndent === indent && !uMatch && !oMatch)) {
          break;
        }
        if (uMatch) {
          items.push(uMatch[1]);
        } else if (oMatch) {
          items.push(oMatch[1]);
        } else if (currentIndent > indent) {
          // Continuation of previous item
          const lastItem = items[items.length - 1];
          if (lastItem) {
            items[items.length - 1] = lastItem + ' ' + currentLine.trim();
          }
        }
        i++;
      }

      lists.push({ ordered: isOrdered, items, depth });
    } else {
      i++;
    }
  }

  return lists;
}

export function extractCodeBlocks(content: string, contentType?: ContentType): ExtractedCodeBlock[] {
  const blocks: ExtractedCodeBlock[] = [];
  if (!content) return blocks;

  // HTML code and pre tags
  const codeRegex = /<code(?:\s+class=["'](?:language-|highlight-)?(\w+)["'])?[^>]*>([\s\S]*?)<\/code>/gi;
  let match: RegExpExecArray | null;
  while ((match = codeRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || '',
      code: match[2]
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"'),
      className: match[1] ? `language-${match[1]}` : undefined,
    });
  }

  const preRegex = /<pre(?:\s+class=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/pre>/gi;
  while ((match = preRegex.exec(content)) !== null) {
    const className = match[1] || '';
    const langMatch = className.match(/(?:language-|highlight-)(\w+)/);
    blocks.push({
      language: langMatch?.[1] || '',
      code: match[2].replace(/<[^>]+>/g, ''),
      className,
    });
  }

  // Markdown fenced code blocks
  const fencedRegex = /```(\w*)\n([\s\S]*?)```/g;
  while ((match = fencedRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
      className: match[1] ? `language-${match[1]}` : undefined,
    });
  }

  return blocks;
}

export function extractComments(content: string, contentType?: ContentType): string[] {
  const comments: string[] = [];
  if (!content) return comments;

  // HTML comments
  const htmlCommentRegex = /<!--([\s\S]*?)-->/g;
  let match: RegExpExecArray | null;
  while ((match = htmlCommentRegex.exec(content)) !== null) {
    comments.push(match[1].trim());
  }

  // CSS comments
  const cssCommentRegex = /\/\*([\s\S]*?)\*\//g;
  while ((match = cssCommentRegex.exec(content)) !== null) {
    comments.push(match[1].trim());
  }

  // JavaScript/PHP single-line comments
  const singleLineRegex = /\/\/(.*)$/gm;
  while ((match = singleLineRegex.exec(content)) !== null) {
    const trimmed = match[1].trim();
    if (trimmed) comments.push(trimmed);
  }

  // Hash comments (PHP, Ruby, etc.)
  const hashCommentRegex = /#([^#\n].*)$/gm;
  while ((match = hashCommentRegex.exec(content)) !== null) {
    // Skip shebang and color codes
    const trimmed = match[1].trim();
    if (trimmed && !trimmed.startsWith('!')) {
      comments.push(trimmed);
    }
  }

  return comments;
}

export function extractClasses(content: string): string[] {
  const classes = new Set<string>();
  if (!content) return [];

  const classRegex = /class=["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = classRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((c) => {
      if (c.trim()) classes.add(c.trim());
    });
  }

  return Array.from(classes);
}

export function extractIds(content: string): string[] {
  const ids: string[] = [];
  if (!content) return [];

  const idRegex = /id=["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = idRegex.exec(content)) !== null) {
    if (match[1].trim()) ids.push(match[1].trim());
  }

  return ids;
}

export function extractAttributes(content: string, attributeName: string): string[] {
  const values: string[] = [];
  if (!content) return [];

  const regex = new RegExp(`${attributeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=["']([^"']*)["']`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    values.push(match[1]);
  }

  return values;
}

export function extractByTag(content: string, tagName: string): string[] {
  const results: string[] = [];
  if (!content) return [];

  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    results.push(match[1].trim());
  }

  return results;
}

export function extractDataAttributes(content: string): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  if (!content) return [];

  const tagRegex = /<(\w+)(\s+[^>]+?)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(content)) !== null) {
    const attrs = match[2];
    const dataAttrs: Record<string, string> = {};
    const dataRegex = /data-([\w-]+)=["']([^"']*)["']/gi;
    let dataMatch: RegExpExecArray | null;
    let hasDataAttr = false;
    while ((dataMatch = dataRegex.exec(attrs)) !== null) {
      dataAttrs[dataMatch[1]] = dataMatch[2];
      hasDataAttr = true;
    }
    if (hasDataAttr) {
      results.push(dataAttrs);
    }
  }

  return results;
}

export function extractSEO(content: string): SEOMetadata {
  const metas = extractMeta(content, 'html');
  const headings = extractHeadings(content, 'html');
  const links = extractLinks(content, 'html');

  const getMeta = (name: string): string | undefined =>
    metas.find((m) => m.name === name)?.content;
  const getProperty = (property: string): string | undefined =>
    metas.find((m) => m.property === property || m.name === property)?.content;
  const getCharset = (): string =>
    metas.find((m) => m.charset)?.charset || 'utf-8';

  const ogTitle = getProperty('og:title') || '';
  const ogDescription = getProperty('og:description') || '';
  const ogImage = getProperty('og:image') || '';
  const ogUrl = getProperty('og:url') || '';
  const ogType = getProperty('og:type') || 'website';

  const twitterCard = getProperty('twitter:card') || 'summary';
  const twitterTitle = getProperty('twitter:title') || ogTitle;
  const twitterDescription = getProperty('twitter:description') || ogDescription;
  const twitterImage = getProperty('twitter:image') || ogImage;

  const keywords = (getMeta('keywords') || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const canonical = links.find((l) => l.rel === 'canonical')?.href || null;

  return {
    title: ogTitle || getMeta('title') || headings.find((h) => h.level === 1)?.text || '',
    description: ogDescription || getMeta('description') || '',
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    robots: getMeta('robots') || '',
    author: getMeta('author') || '',
    favicon: extractFavicon(content),
    language: getMeta('language') || '',
    charset: getCharset(),
    viewport: getMeta('viewport') || '',
  };
}

export function extractStructuredData(content: string): object[] {
  const results: object[] = [];
  if (!content) return results;

  const regex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      results.push(json);
    } catch {
      // Skip malformed JSON-LD
    }
  }

  return results;
}

export function extractOpenGraph(content: string): Record<string, string> {
  const metas = extractMeta(content, 'html');
  const ogProps: Record<string, string> = {};

  for (const meta of metas) {
    if (meta.property && meta.property.startsWith('og:')) {
      ogProps[meta.property] = meta.content;
    }
  }

  return ogProps;
}

export function extractTwitterCards(content: string): Record<string, string> {
  const metas = extractMeta(content, 'html');
  const twitterProps: Record<string, string> = {};

  for (const meta of metas) {
    if (meta.property && meta.property.startsWith('twitter:')) {
      twitterProps[meta.property] = meta.content;
    }
    if (meta.name && meta.name.startsWith('twitter:')) {
      twitterProps[meta.name] = meta.content;
    }
  }

  return twitterProps;
}

export function extractFavicon(content: string): string | null {
  if (!content) return null;

  // Check link rel="icon"
  const linkRegex = /<link\s+[^>]*rel=["'](?:shortcut\s+icon|icon|apple-touch-icon)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(content)) !== null) {
    const hrefMatch = match[0].match(/href=["']([^"']*)["']/);
    if (hrefMatch) return hrefMatch[1];
  }

  // Default favicon location
  return '/favicon.ico';
}

export function extractCanonical(content: string): string | null {
  if (!content) return null;

  const links = extractLinks(content, 'html');
  const canonical = links.find((l) => l.rel === 'canonical');
  if (canonical) return canonical.href;

  const linkRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*>/gi;
  const match = linkRegex.exec(content);
  if (match) {
    const hrefMatch = match[0].match(/href=["']([^"']*)["']/i);
    if (hrefMatch) return hrefMatch[1];
  }

  return null;
}
