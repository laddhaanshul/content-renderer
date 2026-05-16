import {
  MarkdownDocument,
  MarkdownNode,
  MarkdownHeading,
  MarkdownLink,
  MarkdownImage,
  MarkdownCodeBlock,
  MarkdownTable,
  MarkdownFootnote,
  ContentMetadata,
  ParseError,
  ParseWarning,
} from '../types';

export interface MarkdownParseOptions {
  parseFrontmatter?: boolean;
  gfm?: boolean;
  breaks?: boolean;
}

// ---------------------------------------------------------------------------
// Emoji shortcode map (30+ common emojis)
// ---------------------------------------------------------------------------

const EMOJI_MAP: Record<string, string> = {
  ':smile:': '\U0001f604',
  ':grinning:': '\U0001f601',
  ':smiley:': '\U0001f603',
  ':laughing:': '\U0001f602',
  ':wink:': '\U0001f609',
  ':blush:': '\U0001f60a',
  ':heart_eyes:': '\U0001f60d',
  ':kissing_heart:': '\U0001f618',
  ':stuck_out_tongue:': '\U0001f61b',
  ':stuck_out_tongue_winking_eye:': '\U0001f61c',
  ':thinking:': '\U0001f914',
  '+1': '\U0001f44d',
  ':thumbsup:': '\U0001f44d',
  '-1': '\U0001f44e',
  ':thumbsdown:': '\U0001f44e',
  ':clap:': '\U0001f44f',
  ':heart:': '\u2764\ufe0f',
  ':fire:': '\U0001f525',
  ':rocket:': '\U0001f680',
  ':star:': '\u2b50',
  ':sparkles:': '\u2728',
  ':tada:': '\U0001f389',
  ':party:': '\U0001f389',
  ':warning:': '\u26a0\ufe0f',
  ':question:': '\u2753',
  ':exclamation:': '\u2757',
  ':check:': '\u2705',
  ':x:': '\u274c',
  ':cross:': '\u274c',
  ':heavy_check_mark:': '\u2705',
  ':ballot_box_with_check:': '\u2611\ufe0f',
  ':bullet:': '\u2022',
  ':arrow_right:': '\u27a1\ufe0f',
  ':arrow_left:': '\u2b05\ufe0f',
  ':arrow_up:': '\u2b06\ufe0f',
  ':arrow_down:': '\u2b07\ufe0f',
  ':point_up:': '\u261d\ufe0f',
  ':point_right:': '\U0001f449',
  ':point_left:': '\U0001f448',
  ':eyes:': '\U0001f440',
  ':brain:': '\U0001f9e0',
  ':muscle:': '\U0001f4aa',
  ':pray:': '\U0001f64f',
  ':wave:': '\U0001f44b',
  ':ok_hand:': '\U0001f44c',
  ':100:': '\U0001f4af',
  ':zap:': '\u26a1',
  ':package:': '\U0001f4e6',
  ':lock:': '\U0001f512',
  ':unlock:': '\U0001f513',
  ':memo:': '\U0001f4dd',
  ':bulb:': '\U0001f4a1',
  ':link:': '\U0001f517',
  ':mag:': '\U0001f50d',
  ':grey_question:': '\u2754',
  ':grey_exclamation:': '\u2755',
};

export class MarkdownParser {
  private options: Required<MarkdownParseOptions>;

  constructor(options?: MarkdownParseOptions) {
    this.options = {
      parseFrontmatter: options?.parseFrontmatter ?? true,
      gfm: options?.gfm ?? true,
      breaks: options?.breaks ?? false,
    };
  }

  parse(content: string, options?: MarkdownParseOptions): MarkdownDocument {
    const opts = { ...this.options, ...(options || {}) };
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    let frontmatter: Record<string, any> | undefined;
    let body = content;

    // Parse frontmatter
    if (opts.parseFrontmatter) {
      const fmResult = this.parseFrontmatter(content);
      if (fmResult) {
        frontmatter = fmResult.data;
        body = fmResult.remaining;
      }
    }

    // Pre-process: extract reference link definitions, abbreviations, and footnotes
    const { cleanedBody, referenceLinks, abbreviations, footnotes } = this.preProcess(body);

    const lines = cleanedBody.split('\n');
    const nodes: MarkdownNode[] = [];
    const headings: MarkdownHeading[] = [];
    const links: MarkdownLink[] = [];
    const images: MarkdownImage[] = [];
    const codeBlocks: MarkdownCodeBlock[] = [];
    const tables: MarkdownTable[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Fenced code block
      if (line.trim().startsWith('```')) {
        const language = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```

        const codeBlock: MarkdownCodeBlock = {
          language: language || 'text',
          code: codeLines.join('\n'),
        };
        codeBlocks.push(codeBlock);
        nodes.push({
          type: 'code-block',
          language: language || 'text',
          content: codeBlock.code,
        });
        continue;
      }

      // Display math block: $$ ... $$
      if (line.trim().startsWith('$$')) {
        const mathLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('$$')) {
          mathLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
        nodes.push({
          type: 'math-block',
          content: mathLines.join('\n').trim(),
        });
        continue;
      }

      // Heading (ATX style: # heading)
      const headingMatch = line.match(/^(#{1,6})(?:\s+(.*))?$/);
      if (headingMatch) {
        const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
        const text = (headingMatch[2] || '').trim();
        const slug = this.generateSlug(text);
        const inlineChildren = this.parseInline(text, links, images, referenceLinks, abbreviations, footnotes);

        const heading: MarkdownHeading = {
          level,
          text,
          slug,
          children: inlineChildren,
        };
        headings.push(heading);
        nodes.push({
          type: 'heading',
          level,
          content: text,
          children: inlineChildren,
        });
        i++;
        continue;
      }

      // Setext heading (h1 = ===, h2 = ---) - must check before horizontal rule
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (line.trim() && !line.trim().startsWith('#') &&
            (/^={3,}$/.test(nextLine) || /^-{3,}$/.test(nextLine))) {
          const level = nextLine[0] === '=' ? 1 : 2;
          const text = line.trim();
          const slug = this.generateSlug(text);
          const inlineChildren = this.parseInline(text, links, images, referenceLinks, abbreviations, footnotes);
          headings.push({ level: level as 1|2, text, slug, children: inlineChildren });
          nodes.push({ type: 'heading', level: level as 1|2, content: text, children: inlineChildren });
          i += 2;
          continue;
        }
      }

      // Horizontal rule
      if (this.isHorizontalRule(line)) {
        nodes.push({ type: 'horizontal-rule' });
        i++;
        continue;
      }

      // Blockquote
      if (line.trim().startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('>') || (lines[i].trim() === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('>')))) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        const quoteContent = quoteLines.join('\n').trim();
        const quoteChildren = this.parseInline(quoteContent, links, images, referenceLinks, abbreviations, footnotes);
        nodes.push({
          type: 'blockquote',
          content: quoteContent,
          children: quoteChildren,
        });
        continue;
      }

      // Table (GFM)
      if (opts.gfm && this.isTableStart(line, lines[i + 1])) {
        const table = this.parseTable(lines, i);
        tables.push(table);
        nodes.push({
          type: 'table',
          content: '',
          children: table.rows.map((row, rowIndex) => ({
            type: 'table-row' as const,
            children: row.map((cell, cellIndex) => ({
              type: 'table-cell' as const,
              content: cell,
              header: rowIndex === 0,
              align: table.align?.[cellIndex],
            })),
          })),
        });
        i += 2 + table.rows.length; // header + separator + data rows
        continue;
      }

      // Definition list: a line followed by a line starting with `:` (with spaces)
      if (i + 1 < lines.length && this.isDefinitionItem(line, lines[i + 1])) {
        const dlItems = this.parseDefinitionList(lines, i, abbreviations);
        for (const item of dlItems) {
          nodes.push({
            type: 'definition-list',
            term: item.term,
            content: item.definitions.join('\n'),
            children: item.definitions.map(d => ({
              type: 'paragraph' as const,
              content: d,
              children: this.parseInline(d, links, images, referenceLinks, abbreviations, footnotes),
            })),
          });
        }
        i += dlItems.reduce((acc, item) => acc + 1 + item.definitions.length, 0);
        continue;
      }

      // Unordered list
      if (this.isUnorderedListItem(line)) {
        const listResult = this.parseList(lines, i, false, links, images, referenceLinks, abbreviations, footnotes);
        nodes.push(listResult.node);
        links.push(...listResult.links);
        images.push(...listResult.images);
        i = listResult.endIndex;
        continue;
      }

      // Ordered list
      if (this.isOrderedListItem(line)) {
        const listResult = this.parseList(lines, i, true, links, images, referenceLinks, abbreviations, footnotes);
        nodes.push(listResult.node);
        links.push(...listResult.links);
        images.push(...listResult.images);
        i = listResult.endIndex;
        continue;
      }

      // Paragraph
      const paragraphLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '' && !this.isBlockElement(lines[i])) {
        paragraphLines.push(lines[i]);
        i++;
      }

      if (paragraphLines.length === 0) {
        // No lines were consumed: the current line is a block element that wasn't handled above.
        // Skip it to avoid an infinite loop.
        i++;
        continue;
      }

      const paragraphText = paragraphLines.join(opts.breaks ? '\n' : ' ');
      const paragraphChildren = this.parseInline(paragraphText, links, images, referenceLinks, abbreviations, footnotes);
      nodes.push({
        type: 'paragraph',
        content: paragraphText,
        children: paragraphChildren,
      });
    }

    // Append footnote section at the end if there are footnotes
    if (footnotes.size > 0) {
      const footnoteNodes: MarkdownNode[] = [];
      const sortedIds = Array.from(footnotes.keys()).sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });
      for (const id of sortedIds) {
        const fn = footnotes.get(id)!;
        const fnChildren = this.parseInline(fn, links, images, referenceLinks, abbreviations, footnotes);
        footnoteNodes.push({
          type: 'footnote-reference',
          footnoteId: id,
          content: fn,
          children: fnChildren,
        });
      }
      nodes.push({
        type: 'footnote-section',
        content: '',
        children: footnoteNodes,
      });
    }

    const metadata: ContentMetadata = {
      size: content.length,
      lineCount: content.split('\n').length,
      title: frontmatter?.title || (headings.length > 0 ? headings[0].text : undefined),
      description: frontmatter?.description,
      author: frontmatter?.author,
      createdAt: frontmatter?.date || frontmatter?.created,
    };

    if (frontmatter) {
      for (const [key, value] of Object.entries(frontmatter)) {
        if (!(key in metadata)) {
          metadata[key] = value;
        }
      }
    }

    const footnoteList: MarkdownFootnote[] = [];
    for (const [id, fnContent] of footnotes) {
      const fnChildren = this.parseInline(fnContent, links, images, referenceLinks, abbreviations, footnotes);
      footnoteList.push({ id, content: fnContent, children: fnChildren });
    }

    return {
      nodes,
      metadata,
      frontmatter,
      headings,
      links,
      images,
      codeBlocks,
      tables,
      footnotes: footnoteList.length > 0 ? footnoteList : undefined,
      abbreviations: abbreviations.size > 0 ? Object.fromEntries(abbreviations) : undefined,
    };
  }

  // -------------------------------------------------------------------------
  // Pre-processing: extract reference links, abbreviations, and footnotes
  // -------------------------------------------------------------------------

  private preProcess(body: string): {
    cleanedBody: string;
    referenceLinks: Map<string, { href: string; title?: string }>;
    abbreviations: Map<string, string>;
    footnotes: Map<string, string>;
  } {
    const referenceLinks = new Map<string, { href: string; title?: string }>();
    const abbreviations = new Map<string, string>();
    const footnotes = new Map<string, string>();

    const lines = body.split('\n');
    const keepLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Reference link definition: [id]: url "title"
      const refLinkMatch = line.match(/^\[([^\]]+)\]:\s+(\S+)(?:\s+"([^"]*)")?\s*$/);
      if (refLinkMatch && !line.startsWith('[^')) {
        referenceLinks.set(refLinkMatch[1].toLowerCase(), {
          href: refLinkMatch[2],
          title: refLinkMatch[3],
        });
        i++;
        continue;
      }

      // Abbreviation definition: *[abbr]: expansion
      const abbrMatch = line.match(/^\*\[([^\]]+)\]:\s+(.+)$/);
      if (abbrMatch) {
        abbreviations.set(abbrMatch[1], abbrMatch[2].trim());
        i++;
        continue;
      }

      // Footnote definition: [^id]: content
      const footnoteMatch = line.match(/^\[\^([^\]]+)\]:\s+(.+)$/);
      if (footnoteMatch) {
        const fnId = footnoteMatch[1];
        let fnContent = footnoteMatch[2].trim();
        i++;
        // Collect continuation lines (indented by 4 spaces or 1 tab)
        while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || (lines[i].trim() !== '' && lines[i].startsWith(' ')))) {
          fnContent += '\n' + lines[i].replace(/^\s{1,4}/, '').trim();
          i++;
        }
        footnotes.set(fnId, fnContent);
        continue;
      }

      keepLines.push(line);
      i++;
    }

    return { cleanedBody: keepLines.join('\n'), referenceLinks, abbreviations, footnotes };
  }

  // -------------------------------------------------------------------------
  // Frontmatter
  // -------------------------------------------------------------------------

  private parseFrontmatter(content: string): { data: Record<string, any>; remaining: string } | null {
    const lines = content.split('\n');
    if (lines[0]?.trim() !== '---') return null;

    let end = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        end = i;
        break;
      }
    }

    if (end === -1) return null;

    const yamlContent = lines.slice(1, end).join('\n');
    const data = this.parseYaml(yamlContent);
    const remaining = lines.slice(end + 1).join('\n');

    return { data, remaining };
  }

  private parseYaml(yaml: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = yaml.split('\n');
    let currentKey: string | null = null;
    let currentArray: any[] | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const kvMatch = trimmed.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const value = kvMatch[2].trim();

        if (value === '') {
          currentKey = key;
          currentArray = [];
          result[key] = currentArray;
        } else {
          currentKey = null;
          currentArray = null;
          result[key] = this.parseYamlValue(value);
        }
        continue;
      }

      const arrayItemMatch = trimmed.match(/^-\s+(.+)$/);
      if (arrayItemMatch && currentArray) {
        currentArray.push(this.parseYamlValue(arrayItemMatch[1]));
        continue;
      }

      const nestedMatch = trimmed.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
      if (nestedMatch && currentKey && currentArray) {
        (currentArray as any)[nestedMatch[1]] = this.parseYamlValue(nestedMatch[2]);
      }
    }

    return result;
  }

  private parseYamlValue(value: string): any {
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'yes' || value === 'on') return true;
    if (value === 'no' || value === 'off') return false;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map((item) => this.parseYamlValue(item.trim()));
    }
    return value;
  }

  // -------------------------------------------------------------------------
  // Inline parsing (enhanced with 6-parameter signature)
  // -------------------------------------------------------------------------

  private parseInline(
    text: string,
    links: MarkdownLink[],
    images: MarkdownImage[],
    referenceLinks?: Map<string, { href: string; title?: string }>,
    abbreviations?: Map<string, string>,
    footnotes?: Map<string, string>,
  ): MarkdownNode[] {
    const nodes: MarkdownNode[] = [];
    let remaining = text;
    let offset = 0;

    while (remaining.length > 0) {
      // Emoji shortcodes
      const emojiMatch = remaining.match(/^(:[\w+]+:)/);
      if (emojiMatch && EMOJI_MAP[emojiMatch[1]]) {
        nodes.push({ type: 'paragraph', content: EMOJI_MAP[emojiMatch[1]] });
        remaining = remaining.slice(emojiMatch[0].length);
        offset += emojiMatch[0].length;
        continue;
      }

      // Autolink: <https://...> or <email@...>
      const autolinkMatch = remaining.match(/^<(https?:\/\/[^>]+)>/);
      if (autolinkMatch) {
        nodes.push({
          type: 'autolink',
          content: autolinkMatch[1],
          href: autolinkMatch[1],
        });
        remaining = remaining.slice(autolinkMatch[0].length);
        offset += autolinkMatch[0].length;
        continue;
      }

      // Autolink email: <email@example.com>
      const emailAutolinkMatch = remaining.match(/^<([^@\s]+@[^@\s]+\.[a-zA-Z]+)>/);
      if (emailAutolinkMatch) {
        nodes.push({
          type: 'autolink',
          content: emailAutolinkMatch[1],
          href: `mailto:${emailAutolinkMatch[1]}`,
        });
        remaining = remaining.slice(emailAutolinkMatch[0].length);
        offset += emailAutolinkMatch[0].length;
        continue;
      }

      // Footnote reference: [^id]
      const footnoteRefMatch = remaining.match(/^\[\^([^\]]+)\]/);
      if (footnoteRefMatch && footnotes && footnotes.has(footnoteRefMatch[1])) {
        const fnId = footnoteRefMatch[1];
        nodes.push({
          type: 'footnote-reference',
          footnoteId: fnId,
          content: footnotes.get(fnId)!,
        });
        remaining = remaining.slice(footnoteRefMatch[0].length);
        offset += footnoteRefMatch[0].length;
        continue;
      }

      // Image: ![alt](src "title")
      const imageMatch = remaining.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
      if (imageMatch) {
        const [, alt, src, title] = imageMatch;
        const img: MarkdownImage = { alt, src, title };
        images.push(img);
        nodes.push({
          type: 'image',
          alt,
          href: src,
          title,
          content: alt,
        });
        remaining = remaining.slice(imageMatch[0].length);
        offset += imageMatch[0].length;
        continue;
      }

      // Reference-style link: [text][ref-id] or shortcut [text][]
      const refLinkMatch = remaining.match(/^\[([^\]]+)\]\[([^\]]*)\]/);
      if (refLinkMatch) {
        const [, linkText, refId] = refLinkMatch;
        // Try to resolve the reference
        const lookupId = (refId || linkText).toLowerCase();
        const ref = referenceLinks?.get(lookupId);
        if (ref) {
          const link: MarkdownLink = { text: linkText, href: ref.href, title: ref.title };
          links.push(link);
          nodes.push({
            type: 'link',
            content: linkText,
            href: ref.href,
            title: ref.title,
            children: this.parseInline(linkText, [], []),
          });
        } else {
          // Unresolved, keep as text
          nodes.push({ type: 'paragraph', content: refLinkMatch[0] });
        }
        remaining = remaining.slice(refLinkMatch[0].length);
        offset += refLinkMatch[0].length;
        continue;
      }

      // Reference-style link (shortcut): [ref-id] where ref-id matches a definition
      const shortcutRefMatch = remaining.match(/^\[([^\]]+)\](?!\()/);
      if (shortcutRefMatch && referenceLinks?.has(shortcutRefMatch[1].toLowerCase())) {
        const refText = shortcutRefMatch[1];
        const ref = referenceLinks.get(refText.toLowerCase())!;
        const link: MarkdownLink = { text: refText, href: ref.href, title: ref.title };
        links.push(link);
        nodes.push({
          type: 'link',
          content: refText,
          href: ref.href,
          title: ref.title,
          children: this.parseInline(refText, [], []),
        });
        remaining = remaining.slice(shortcutRefMatch[0].length);
        offset += shortcutRefMatch[0].length;
        continue;
      }

      // Link: [text](url "title")
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
      if (linkMatch) {
        const [, linkText, href, title] = linkMatch;
        const link: MarkdownLink = { text: linkText, href, title };
        links.push(link);
        nodes.push({
          type: 'link',
          content: linkText,
          href,
          title,
          children: this.parseInline(linkText, [], []),
        });
        remaining = remaining.slice(linkMatch[0].length);
        offset += linkMatch[0].length;
        continue;
      }

      // Strikethrough: ~~text~~
      const strikeMatch = remaining.match(/^~~(.+?)~~/);
      if (strikeMatch) {
        nodes.push({
          type: 'strikethrough',
          content: strikeMatch[1],
          children: this.parseInline(strikeMatch[1], [], []),
        });
        remaining = remaining.slice(strikeMatch[0].length);
        offset += strikeMatch[0].length;
        continue;
      }

      // Highlight: ==text==
      const highlightMatch = remaining.match(/^==(.+?)==/);
      if (highlightMatch) {
        nodes.push({
          type: 'highlight',
          content: highlightMatch[1],
          children: this.parseInline(highlightMatch[1], [], []),
        });
        remaining = remaining.slice(highlightMatch[0].length);
        offset += highlightMatch[0].length;
        continue;
      }

      // Subscript: ~text~ (single tilde, not double)
      const subscriptMatch = remaining.match(/^~([^~\n]+)~/);
      if (subscriptMatch) {
        nodes.push({
          type: 'subscript',
          content: subscriptMatch[1],
          children: this.parseInline(subscriptMatch[1], [], []),
        });
        remaining = remaining.slice(subscriptMatch[0].length);
        offset += subscriptMatch[0].length;
        continue;
      }

      // Superscript: ^text^
      const superscriptMatch = remaining.match(/^\^([^\^\n]+)\^/);
      if (superscriptMatch) {
        nodes.push({
          type: 'superscript',
          content: superscriptMatch[1],
          children: this.parseInline(superscriptMatch[1], [], []),
        });
        remaining = remaining.slice(superscriptMatch[0].length);
        offset += superscriptMatch[0].length;
        continue;
      }

      // Inline math: $...$ (not $$)
      const inlineMathMatch = remaining.match(/^\$([^\$\n]+)\$/);
      if (inlineMathMatch) {
        nodes.push({
          type: 'math-inline',
          content: inlineMathMatch[1],
        });
        remaining = remaining.slice(inlineMathMatch[0].length);
        offset += inlineMathMatch[0].length;
        continue;
      }

      // Bold + Italic: ***text*** or ___text___
      const boldItalicMatch = remaining.match(/^[*_]{3}(.+?)[*_]{3}/);
      if (boldItalicMatch) {
        nodes.push({
          type: 'bold',
          content: boldItalicMatch[1],
          children: [
            {
              type: 'italic',
              content: boldItalicMatch[1],
            },
          ],
        });
        remaining = remaining.slice(boldItalicMatch[0].length);
        offset += boldItalicMatch[0].length;
        continue;
      }

      // Bold: **text** or __text__
      const boldMatch = remaining.match(/^[*_]{2}(.+?)[*_]{2}/);
      if (boldMatch) {
        nodes.push({
          type: 'bold',
          content: boldMatch[1],
          children: this.parseInline(boldMatch[1], [], []),
        });
        remaining = remaining.slice(boldMatch[0].length);
        offset += boldMatch[0].length;
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^[*_]([^*_]+?)[*_]/);
      if (italicMatch) {
        nodes.push({
          type: 'italic',
          content: italicMatch[1],
        });
        remaining = remaining.slice(italicMatch[0].length);
        offset += italicMatch[0].length;
        continue;
      }

      // Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        nodes.push({
          type: 'code-inline',
          content: codeMatch[1],
        });
        remaining = remaining.slice(codeMatch[0].length);
        offset += codeMatch[0].length;
        continue;
      }

      // Line break (two spaces + newline or explicit <br>)
      const brMatch = remaining.match(/^  \n/);
      if (brMatch) {
        remaining = remaining.slice(brMatch[0].length);
        offset += brMatch[0].length;
        continue;
      }

      // HTML tag
      const htmlMatch = remaining.match(/^<(\w+)[^>]*>/);
      if (htmlMatch) {
        nodes.push({
          type: 'html',
          content: htmlMatch[0],
        });
        remaining = remaining.slice(htmlMatch[0].length);
        offset += htmlMatch[0].length;
        continue;
      }

      // Abbreviation: check if the current word matches an abbreviation
      const abbrWordMatch = remaining.match(/^(\b\w+\b)/);
      if (abbrWordMatch && abbreviations && abbreviations.has(abbrWordMatch[1])) {
        nodes.push({
          type: 'abbreviation',
          content: abbrWordMatch[1],
          abbrTitle: abbreviations.get(abbrWordMatch[1])!,
        });
        remaining = remaining.slice(abbrWordMatch[0].length);
        offset += abbrWordMatch[0].length;
        continue;
      }

      // Plain text - consume until next special character
      const textMatch = remaining.match(/^[^![*_`<~^$:]+/);
      if (textMatch) {
        nodes.push({
          type: 'paragraph',
          content: textMatch[0],
        });
        remaining = remaining.slice(textMatch[0].length);
        offset += textMatch[0].length;
        continue;
      }

      // Consume one character
      remaining = remaining.slice(1);
      offset++;
    }

    return nodes;
  }

  // -------------------------------------------------------------------------
  // Block helpers
  // -------------------------------------------------------------------------

  private isHorizontalRule(line: string): boolean {
    const trimmed = line.trim();
    // Must be ONLY repeated *, -, or _ chars (with optional spaces between)
    // and must contain at least 3 of them. Must not contain other characters.
    return /^(?:\*[ \t]*){3,}$/.test(trimmed) ||
           /^(?:-[ \t]*){3,}$/.test(trimmed) ||
           /^(?:_[ \t]*){3,}$/.test(trimmed);
  }

  private isUnorderedListItem(line: string): boolean {
    return /^[\s]*[-*+]\s+/.test(line);
  }

  private isOrderedListItem(line: string): boolean {
    return /^[\s]*\d+[.)]\s+/.test(line);
  }

  private isBlockElement(line: string): boolean {
    const trimmed = line.trim();
    return (
      trimmed === '' ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('$$') ||
      trimmed.startsWith('---') ||
      this.isHorizontalRule(line) ||
      this.isUnorderedListItem(line) ||
      this.isOrderedListItem(line) ||
      trimmed.startsWith('|') ||
      /^\*\[.+\]:/.test(trimmed) ||
      this.isDefinitionItemStart(line)
    );
  }

  private isDefinitionItem(termLine: string, defLine: string): boolean {
    const termTrimmed = termLine.trim();
    const defTrimmed = defLine.trim();
    // Term must be non-empty text (not a list item, heading, etc.)
    if (termTrimmed === '' || termTrimmed.startsWith('#') || termTrimmed.startsWith('>') ||
        termTrimmed.startsWith('```') || termTrimmed.startsWith('$$') ||
        this.isUnorderedListItem(termLine) || this.isOrderedListItem(termLine)) {
      return false;
    }
    // Definition must start with `:` (possibly indented)
    return /^\s*:\s/.test(defLine);
  }

  private isDefinitionItemStart(line: string): boolean {
    // A definition line starts with `:` (possibly indented)
    return /^\s*:\s/.test(line);
  }

  private parseDefinitionList(
    lines: string[],
    startIndex: number,
    abbreviations?: Map<string, string>,
  ): Array<{ term: string; definitions: string[] }> {
    const items: Array<{ term: string; definitions: string[] }> = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line ends the definition list
      if (trimmed === '') break;

      // Not a definition item start? End the list.
      if (this.isUnorderedListItem(line) || this.isOrderedListItem(line) ||
          trimmed.startsWith('#') || trimmed.startsWith('>') ||
          trimmed.startsWith('```') || trimmed.startsWith('$$')) {
        break;
      }

      // Is this line a term followed by a definition?
      if (i + 1 < lines.length && /^\s*:\s/.test(lines[i + 1])) {
        const term = trimmed;
        i++; // move to definition line
        const definitions: string[] = [];
        while (i < lines.length && /^\s*:\s/.test(lines[i])) {
          definitions.push(lines[i].replace(/^\s*:\s*/, '').trim());
          i++;
        }
        items.push({ term, definitions });
      } else {
        // Skip lines that are not definition items
        i++;
      }
    }

    return items;
  }

  private parseList(
    lines: string[],
    startIndex: number,
    ordered: boolean,
    links: MarkdownLink[],
    images: MarkdownImage[],
    referenceLinks?: Map<string, { href: string; title?: string }>,
    abbreviations?: Map<string, string>,
    footnotes?: Map<string, string>,
  ): { node: MarkdownNode; endIndex: number; links: MarkdownLink[]; images: MarkdownImage[] } {
    const items: MarkdownNode[] = [];
    const collectedLinks: MarkdownLink[] = [];
    const collectedImages: MarkdownImage[] = [];
    let i = startIndex;
    const baseIndent = (lines[startIndex]?.match(/^(\s*)/)?.[1].length || 0);

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '') {
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const nextIndent = (nextLine.match(/^(\s*)/)?.[1].length || 0);
          if (nextIndent > baseIndent && !this.isBlockElement(nextLine)) {
            i++;
            continue;
          }
        }
        break;
      }

      const indent = (line.match(/^(\s*)/)?.[1].length || 0);

      if (indent < baseIndent) break;
      if (indent === baseIndent && !this.isUnorderedListItem(line) && !this.isOrderedListItem(line)) break;

      if (indent === baseIndent) {
        if (ordered && !this.isOrderedListItem(line)) break;
        if (!ordered && !this.isUnorderedListItem(line)) break;

        const itemContent = trimmed.replace(/^[-*+]\s+/, '').replace(/^\d+[.)]\s+/, '');
        const inlineChildren = this.parseInline(itemContent, collectedLinks, collectedImages, referenceLinks, abbreviations, footnotes);

        let nestedItems: MarkdownNode[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          const nextIndent = (nextLine.match(/^(\s*)/)?.[1].length || 0);
          if (nextIndent >= indent + 2 && (this.isUnorderedListItem(nextLine) || this.isOrderedListItem(nextLine))) {
            const isNestedOrdered = this.isOrderedListItem(nextLine);
            const nestedResult = this.parseList(lines, j, isNestedOrdered, links, images, referenceLinks, abbreviations, footnotes);
            nestedItems.push(nestedResult.node);
            collectedLinks.push(...nestedResult.links);
            collectedImages.push(...nestedResult.images);
            j = nestedResult.endIndex;
          } else {
            break;
          }
        }

        const itemNode: MarkdownNode = {
          type: 'list-item',
          content: itemContent,
          children: [...inlineChildren, ...nestedItems],
        };
        items.push(itemNode);
        i = j;
      } else {
        i++;
      }
    }

    const listNode: MarkdownNode = {
      type: 'list',
      ordered,
      children: items,
    };

    return { node: listNode, endIndex: i, links: collectedLinks, images: collectedImages };
  }

  private isTableStart(line: string, nextLine?: string): boolean {
    if (!line.trim().startsWith('|')) return false;
    if (!nextLine) return false;
    return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(nextLine.trim());
  }

  private parseTable(lines: string[], startIndex: number): MarkdownTable {
    const headerLine = lines[startIndex].trim();
    const headers = this.parseTableRow(headerLine);

    const separatorLine = lines[startIndex + 1].trim();
    const align = this.parseTableAlignment(separatorLine);

    const rows: string[][] = [];
    let i = startIndex + 2;
    while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim() !== '|') {
      rows.push(this.parseTableRow(lines[i].trim()));
      i++;
    }

    return { headers, rows, align };
  }

  private parseTableRow(line: string): string[] {
    return line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell, index, array) => !(cell === '' && (index === 0 || index === array.length - 1)));
  }

  private parseTableAlignment(line: string): ('left' | 'center' | 'right')[] {
    const cells = this.parseTableRow(line);
    return cells.map((cell) => {
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      if (cell.startsWith(':')) return 'left';
      return 'left';
    });
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  extractHeadings(content: string): MarkdownHeading[] {
    const doc = this.parse(content);
    return doc.headings;
  }

  extractLinks(content: string): MarkdownLink[] {
    const doc = this.parse(content);
    return doc.links;
  }

  extractImages(content: string): MarkdownImage[] {
    const doc = this.parse(content);
    return doc.images;
  }

  extractTableOfContents(content: string): { level: number; text: string; slug: string }[] {
    const headings = this.extractHeadings(content);
    return headings.map((h) => ({
      level: h.level,
      text: h.text,
      slug: h.slug,
    }));
  }
}

export default MarkdownParser;
