/**
 * MarkdownRenderer – renders Markdown content as React Native components.
 *
 * Parses Markdown inline using a custom lightweight parser and maps each
 * block/inline element to appropriate RN components (Text, View,
 * TouchableOpacity, Image, ScrollView, etc.).
 *
 * Features:
 * - Headings (h1-h6) with theme-driven typography
 * - Bold, italic, strikethrough, code inline
 * - Links (TouchableOpacity + Text)
 * - Images
 * - Unordered & ordered lists (nested)
 * - Task lists (checkbox)
 * - Code blocks (fenced, with language hint)
 * - Blockquotes (nested)
 * - Tables
 * - Horizontal rules
 * - Thematic breaks
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import CodeRenderer from './CodeRenderer';
import { lightNativeTheme, darkNativeTheme, type NativeTheme } from '../themes/native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarkdownRendererProps {
  /** Raw Markdown string. */
  markdown?: string;
  /** Content string (alias for markdown). */
  content?: string;
  /** Called when a link is pressed. */
  onLinkPress?: (url: string) => void;
  /** Use dark theme. Default: false. */
  dark?: boolean;
  /** Custom native theme overrides. */
  theme?: Partial<NativeTheme>;
  /** Root container style. */
  style?: StyleProp<ViewStyle>;
  /** Test ID. */
  testID?: string;
  /** Accessible. */
  accessible?: boolean;
  /** Accessibility label. */
  accessibilityLabel?: string;
  /** Max image width. Default: 300. */
  maxImageWidth?: number;
  /** Enable or disable specific features. */
  features?: {
    /** Render headings. Default: true */
    headings?: boolean;
    /** Render images. Default: true */
    images?: boolean;
    /** Render tables. Default: true */
    tables?: boolean;
    /** Render HTML blocks. Default: false */
    html?: boolean;
    /** Render task lists. Default: true */
    taskLists?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Parsed block types
// ---------------------------------------------------------------------------

type BlockType =
  | 'heading'
  | 'paragraph'
  | 'code_block'
  | 'blockquote'
  | 'unordered_list'
  | 'ordered_list'
  | 'table'
  | 'hr'
  | 'html_block'
  | 'empty';

interface MarkdownBlock {
  type: BlockType;
  level?: number;
  content?: string;
  language?: string;
  children?: MarkdownBlock[];
  items?: ListItem[];
  rows?: string[][];
  isHeaderRow?: boolean;
  text?: string;
}

interface ListItem {
  content: string;
  items?: ListItem[];
  checked?: boolean;
  task?: boolean;
}

// ---------------------------------------------------------------------------
// Lightweight Markdown parser
// ---------------------------------------------------------------------------

function parseMarkdown(md: string): MarkdownBlock[] {
  const lines = md.split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Empty line
    if (trimmed === '') {
      i++;
      continue;
    }

    // Heading: # h1, ## h2, etc.
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Fenced code block: ```lang
    const codeFenceMatch = trimmed.match(/^(`{3,}|~{3,})(\w*)\s*$/);
    if (codeFenceMatch) {
      const fence = codeFenceMatch[1];
      const lang = codeFenceMatch[2] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[0])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing fence
      blocks.push({
        type: 'code_block',
        content: codeLines.join('\n'),
        language: lang,
      });
      continue;
    }

    // Indented code block (4 spaces or 1 tab)
    if (line.startsWith('    ') || line.startsWith('\t')) {
      const codeLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].trim() === '')) {
        if (lines[i].trim() === '' && i + 1 < lines.length && !(lines[i + 1].startsWith('    ') || lines[i + 1].startsWith('\t'))) break;
        codeLines.push(lines[i].replace(/^( {4}|\t)/, ''));
        i++;
      }
      blocks.push({
        type: 'code_block',
        content: codeLines.join('\n'),
      });
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Table
    if (trimmed.includes('|') && trimmed.trim().startsWith('|')) {
      const tableRows: string[][] = [];
      let isHeader = true;

      while (i < lines.length) {
        const tLine = lines[i].trim();
        if (!tLine.startsWith('|')) break;

        // Check for separator row
        if (isHeader && /^\|?\s*[-:]+[-| :]*$/.test(tLine)) {
          i++;
          isHeader = false;
          continue;
        }

        const cells = tLine
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(c => c.trim());
        tableRows.push(cells);
        i++;
      }

      if (tableRows.length > 0) {
        blocks.push({
          type: 'table',
          rows: tableRows,
          isHeaderRow: tableRows.length > 1,
        });
      }
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const bqLines: string[] = [];
      while (i < lines.length) {
        const bqLine = lines[i];
        if (bqLine.trimStart().startsWith('>')) {
          bqLines.push(bqLine.trimStart().replace(/^>\s?/, ''));
          i++;
        } else if (bqLine.trim() === '' && i + 1 < lines.length && lines[i + 1].trimStart().startsWith('>')) {
          bqLines.push('');
          i++;
        } else {
          break;
        }
      }
      const nestedBlocks = parseMarkdown(bqLines.join('\n'));
      blocks.push({
        type: 'blockquote',
        children: nestedBlocks,
      });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      const items = parseListItem(lines, i, 'ul');
      blocks.push({ type: 'unordered_list', items: items.items });
      i = items.nextLine;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = parseListItem(lines, i, 'ol');
      blocks.push({ type: 'ordered_list', items: items.items });
      i = items.nextLine;
      continue;
    }

    // HTML block (simplified)
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      blocks.push({ type: 'html_block', text: trimmed });
      i++;
      continue;
    }

    // Paragraph (default)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const pLine = lines[i];
      if (pLine.trim() === '') break;
      if (pLine.trimStart().match(/^#{1,6}\s/)) break;
      if (pLine.trimStart().startsWith('```')) break;
      if (pLine.trimStart().startsWith('>')) break;
      if (pLine.trimStart().match(/^[-*+]\s/)) break;
      if (pLine.trimStart().match(/^\d+\.\s/)) break;
      if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(pLine.trim())) break;
      paraLines.push(pLine);
      i++;
    }
    blocks.push({
      type: 'paragraph',
      content: paraLines.join('\n'),
    });
  }

  return blocks;
}

function parseListItem(
  lines: string[],
  startLine: number,
  listType: 'ul' | 'ol',
): { items: ListItem[]; nextLine: number } {
  const items: ListItem[] = [];
  let i = startLine;
  const pattern = listType === 'ul' ? /^([-*+])\s/ : /^(\d+\.)\s/;

  while (i < lines.length) {
    const trimmed = lines[i].trimStart();
    const match = trimmed.match(pattern);
    if (!match) break;

    const indent = lines[i].length - lines[i].trimStart().length;
    let content = trimmed.replace(pattern, '');

    // Task list: - [x] or - [ ]
    let checked = false;
    let isTask = false;
    const taskMatch = content.match(/^\[([ xX])\]\s/);
    if (taskMatch) {
      isTask = true;
      checked = taskMatch[1].toLowerCase() === 'x';
      content = content.replace(taskMatch[0], '');
    }

    // Collect multi-line content
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      const nextIndent = nextLine.length - nextLine.trimStart().length;
      if (nextLine.trim() === '') {
        // Check if next non-empty line is still part of this item
        if (i + 1 < lines.length) {
          const peekIndent = lines[i + 1].length - lines[i + 1].trimStart().length;
          if (peekIndent > indent || lines[i + 1].trim().match(pattern)) {
            i++;
            continue;
          }
        }
        break;
      }
      if (nextIndent <= indent) break;
      content += '\n' + nextLine.trim();
      i++;
    }

    // Check for nested sub-lists in content
    const subItems: ListItem[] = [];
    const contentLines = content.split('\n');
    const mainContent: string[] = [];
    let j = 0;
    while (j < contentLines.length) {
      const cLine = contentLines[j].trim();
      const subMatch = cLine.match(listType === 'ul' ? /^[-*+]\s/ : /^\d+\.\s/);
      if (subMatch) {
        const subResult = parseListItem(contentLines, j, listType);
        subItems.push(...subResult.items);
        j = subResult.nextLine;
      } else {
        mainContent.push(cLine);
        j++;
      }
    }

    items.push({
      content: mainContent.join('\n'),
      items: subItems.length > 0 ? subItems : undefined,
      checked: isTask ? checked : undefined,
      task: isTask || undefined,
    });
  }

  return { items, nextLine: i };
}

// ---------------------------------------------------------------------------
// Inline text parser
// ---------------------------------------------------------------------------

interface InlineSegment {
  type: 'text' | 'bold' | 'italic' | 'code' | 'strikethrough' | 'link' | 'image' | 'linebreak';
  content: string;
  href?: string;
  alt?: string;
  children?: InlineSegment[];
}

function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Bold: **text**
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        segments.push({ type: 'bold', content: inner, children: parseInline(inner) });
        i = end + 2;
        continue;
      }
    }

    // Italic: *text* (not preceded or followed by *)
    if (text[i] === '*' && text[i + 1] !== '*' && (i === 0 || text[i - 1] !== '*')) {
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && text[end + 1] !== '*') {
        const inner = text.slice(i + 1, end);
        segments.push({ type: 'italic', content: inner, children: parseInline(inner) });
        i = end + 1;
        continue;
      }
    }

    // Italic: _text_
    if (text[i] === '_' && text[i + 1] !== '_') {
      const end = text.indexOf('_', i + 1);
      if (end !== -1) {
        const inner = text.slice(i + 1, end);
        segments.push({ type: 'italic', content: inner, children: parseInline(inner) });
        i = end + 1;
        continue;
      }
    }

    // Strikethrough: ~~text~~
    if (text[i] === '~' && text[i + 1] === '~') {
      const end = text.indexOf('~~', i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        segments.push({ type: 'strikethrough', content: inner, children: parseInline(inner) });
        i = end + 2;
        continue;
      }
    }

    // Inline code: `text`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        segments.push({ type: 'code', content: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Image: ![alt](url)
    if (text[i] === '!' && text[i + 1] === '[') {
      const altEnd = text.indexOf(']', i + 2);
      if (altEnd !== -1 && text[altEnd + 1] === '(') {
        const urlEnd = text.indexOf(')', altEnd + 2);
        if (urlEnd !== -1) {
          segments.push({
            type: 'image',
            alt: text.slice(i + 2, altEnd),
            content: text.slice(altEnd + 2, urlEnd),
          });
          i = urlEnd + 1;
          continue;
        }
      }
    }

    // Link: [text](url)
    if (text[i] === '[') {
      const textEnd = text.indexOf(']', i + 1);
      if (textEnd !== -1 && text[textEnd + 1] === '(') {
        const urlEnd = text.indexOf(')', textEnd + 2);
        if (urlEnd !== -1) {
          segments.push({
            type: 'link',
            content: text.slice(i + 1, textEnd),
            href: text.slice(textEnd + 2, urlEnd),
            children: parseInline(text.slice(i + 1, textEnd)),
          });
          i = urlEnd + 1;
          continue;
        }
      }
      // Link without URL: [text]
      if (textEnd !== -1) {
        segments.push({
          type: 'text',
          content: text.slice(i, textEnd + 1),
        });
        i = textEnd + 1;
        continue;
      }
    }

    // Line break: two spaces + newline, or <br>
    if (text[i] === ' ' && text[i + 1] === ' ' && text[i + 2] === '\n') {
      segments.push({ type: 'linebreak', content: '' });
      i += 3;
      continue;
    }
    if (text[i] === '<' && text.slice(i, i + 4).toLowerCase() === '<br>') {
      segments.push({ type: 'linebreak', content: '' });
      i += 4;
      continue;
    }

    // Escape characters
    if (text[i] === '\\' && i + 1 < len) {
      segments.push({ type: 'text', content: text[i + 1] });
      i += 2;
      continue;
    }

    // Regular text: consume until next special character
    const start = i;
    while (i < len && !['*', '_', '~', '`', '[', '!', '\\', '<'].includes(text[i])) {
      i++;
    }
    if (i > start) {
      segments.push({ type: 'text', content: text.slice(start, i) });
    } else {
      // Single character that didn't match any pattern
      segments.push({ type: 'text', content: text[i] });
      i++;
    }
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Inline segment renderer
// ---------------------------------------------------------------------------

function renderInlineSegments(
  segments: InlineSegment[],
  theme: NativeTheme,
  onLinkPress?: (url: string) => void,
  maxImageWidth: number = 300,
  features?: MarkdownRendererProps['features'],
): React.ReactNode {
  return segments.map((seg, idx) => {
    switch (seg.type) {
      case 'text':
        return <Text key={idx}>{seg.content}</Text>;

      case 'bold':
        return (
          <Text key={idx} style={{ fontWeight: 'bold' }}>
            {renderInlineSegments(seg.children || parseInline(seg.content), theme, onLinkPress, maxImageWidth, features)}
          </Text>
        );

      case 'italic':
        return (
          <Text key={idx} style={{ fontStyle: 'italic' }}>
            {renderInlineSegments(seg.children || parseInline(seg.content), theme, onLinkPress, maxImageWidth, features)}
          </Text>
        );

      case 'strikethrough':
        return (
          <Text key={idx} style={{ textDecorationLine: 'line-through' }}>
            {renderInlineSegments(seg.children || parseInline(seg.content), theme, onLinkPress, maxImageWidth, features)}
          </Text>
        );

      case 'code':
        return (
          <Text key={idx} style={theme.typography.codeInline}>
            {seg.content}
          </Text>
        );

      case 'link':
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              if (seg.href) {
                if (onLinkPress) {
                  onLinkPress(seg.href);
                } else {
                  Linking.openURL(seg.href).catch(() => {});
                }
              }
            }}
            activeOpacity={0.7}
            accessibilityRole="link"
          >
            <Text style={{ color: theme.colors.link, textDecorationLine: 'underline' }}>
              {renderInlineSegments(seg.children || [{ type: 'text', content: seg.content }], theme, onLinkPress, maxImageWidth, features)}
            </Text>
          </TouchableOpacity>
        );

      case 'image':
        if (features?.images === false) {
          return (
            <Text key={idx} style={{ color: theme.colors.textTertiary, fontStyle: 'italic' }}>
              [{seg.alt || 'image'}]
            </Text>
          );
        }
        return (
          <Image
            key={idx}
            source={{ uri: seg.content }}
            style={{ width: maxImageWidth, height: maxImageWidth * 0.6, borderRadius: 4, marginVertical: 4 }}
            resizeMode="contain"
            accessible
            accessibilityLabel={seg.alt || 'Image'}
          />
        );

      case 'linebreak':
        return <Text key={idx}>{'\n'}</Text>;

      default:
        return <Text key={idx}>{seg.content}</Text>;
    }
  });
}

// ---------------------------------------------------------------------------
// Block renderers
// ---------------------------------------------------------------------------

function renderBlock(
  block: MarkdownBlock,
  theme: NativeTheme,
  onLinkPress?: (url: string) => void,
  maxImageWidth?: number,
  features?: MarkdownRendererProps['features'],
): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const level = block.level || 1;
      if (features?.headings === false) {
        return (
          <Text key={`h${level}`} style={[theme.typography.body, { fontWeight: 'bold' }]}>
            {renderInlineSegments(parseInline(block.content || ''), theme, onLinkPress, maxImageWidth, features)}
          </Text>
        );
      }
      const headingStyle = (theme.typography as any)[`h${level}`] || theme.typography.h6;
      return (
        <Text key={`h${level}`} style={headingStyle}>
          {renderInlineSegments(parseInline(block.content || ''), theme, onLinkPress, maxImageWidth, features)}
        </Text>
      );
    }

    case 'paragraph':
      return (
        <Text key={`p-${block.content?.slice(0, 20)}`} style={[theme.typography.body, { marginBottom: theme.markdown.paragraphMarginBottom }]}>
          {renderInlineSegments(parseInline(block.content || ''), theme, onLinkPress, maxImageWidth, features)}
        </Text>
      );

    case 'code_block':
      return (
        <CodeRenderer
          key={`code-${block.language || 'text'}-${block.content?.slice(0, 20)}`}
          code={block.content || ''}
          language={block.language}
          dark={theme.isDark}
          theme={theme as any}
          showLineNumbers={true}
        />
      );

    case 'blockquote':
      return (
        <View
          key={`bq-${block.children?.length || 0}`}
          style={{
            borderLeftWidth: theme.markdown.blockquoteBorderWidth,
            borderLeftColor: theme.colors.blockquoteBorder,
            paddingLeft: theme.markdown.blockquotePaddingLeft,
            backgroundColor: theme.colors.blockquoteBackground,
            marginVertical: theme.spacing.sm,
          }}
        >
          {block.children?.map((child, idx) => (
            <React.Fragment key={idx}>
              {renderBlock(child, theme, onLinkPress, maxImageWidth, features)}
            </React.Fragment>
          ))}
        </View>
      );

    case 'unordered_list':
      return renderList(block.items, theme, 'ul', 0, onLinkPress, maxImageWidth, features);

    case 'ordered_list':
      return renderList(block.items, theme, 'ol', 0, onLinkPress, maxImageWidth, features);

    case 'table':
      if (features?.tables === false) {
        return (
          <Text key="table-disabled" style={{ color: theme.colors.textTertiary, fontStyle: 'italic', marginVertical: 4 }}>
            [Table not rendered]
          </Text>
        );
      }
      return renderTable(block.rows || [], block.isHeaderRow || false, theme);

    case 'hr':
      return (
        <View
          key="hr"
          style={{
            height: theme.markdown.hrHeight,
            backgroundColor: theme.colors.divider,
            marginVertical: theme.markdown.hrMargin,
          }}
        />
      );

    case 'html_block':
      if (features?.html === true) {
        return (
          <Text key={`html-${block.text?.slice(0, 20)}`} style={[theme.typography.codeInline, { marginVertical: 4 }]}>
            {block.text}
          </Text>
        );
      }
      return null;

    default:
      return null;
  }
}

function renderList(
  items: ListItem[] | undefined,
  theme: NativeTheme,
  listType: 'ul' | 'ol',
  startIndex: number,
  onLinkPress?: (url: string) => void,
  maxImageWidth?: number,
  features?: MarkdownRendererProps['features'],
): React.ReactNode {
  if (!items || items.length === 0) return null;

  return (
    <View key={`${listType}-${startIndex}`} style={{ marginBottom: theme.spacing.sm }}>
      {items.map((item, idx) => {
        const num = startIndex + idx + 1;
        const marker = listType === 'ol'
          ? <Text style={{ width: 20, textAlign: 'right', marginRight: 8, fontSize: 14, color: theme.colors.text }}>{num}.</Text>
          : <Text style={{ width: 20, textAlign: 'center', marginRight: 8, fontSize: 14, color: theme.colors.text }}>{'\u2022'}</Text>;

        const isTask = item.task;
        const checkbox = isTask ? (
          <TouchableOpacity
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              borderWidth: 1.5,
              borderColor: item.checked ? theme.colors.accent : theme.colors.border,
              backgroundColor: item.checked ? theme.colors.accent : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
              marginTop: 2,
            }}
            activeOpacity={0.6}
          >
            {item.checked && (
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{'\u2713'}</Text>
            )}
          </TouchableOpacity>
        ) : null;

        const contentStyle = item.checked ? { textDecorationLine: 'line-through' as const, opacity: 0.6 } : undefined;

        return (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
            {checkbox || marker}
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.listItem, contentStyle]}>
                {renderInlineSegments(parseInline(item.content), theme, onLinkPress, maxImageWidth, features)}
              </Text>
              {item.items && item.items.length > 0 && renderList(item.items, theme, listType, 0, onLinkPress, maxImageWidth, features)}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function renderTable(rows: string[][], hasHeader: boolean, theme: NativeTheme): React.ReactNode {
  return (
    <ScrollView key="table" horizontal nestedScrollEnabled>
      <View style={{ borderWidth: 1, borderColor: theme.colors.tableBorder, borderRadius: 4, marginVertical: 8 }}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.tableBorder }}>
            {row.map((cell, cellIdx) => (
              <View
                key={cellIdx}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRightWidth: cellIdx < row.length - 1 ? 1 : 0,
                  borderRightColor: theme.colors.tableBorder,
                  backgroundColor: rowIdx === 0 && hasHeader ? theme.colors.tableHeaderBackground : 'transparent',
                  minWidth: 80,
                }}
              >
                <Text style={rowIdx === 0 && hasHeader ? theme.typography.tableHeader : theme.typography.tableCell}>
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown,
  content,
  onLinkPress,
  dark = false,
  theme: themeOverride,
  style,
  testID,
  accessible,
  accessibilityLabel,
  maxImageWidth = 300,
  features,
}) => {
  const resolvedTheme = useMemo<NativeTheme>(() => {
    const base = dark ? darkNativeTheme : lightNativeTheme;
    if (!themeOverride) return base;
    return {
      ...base,
      colors: { ...base.colors, ...(themeOverride as any)?.colors },
      typography: { ...base.typography, ...(themeOverride as any)?.typography },
      markdown: { ...base.markdown, ...(themeOverride as any)?.markdown },
    };
  }, [dark, themeOverride]);

  const source = markdown || content || '';

  const blocks = useMemo(() => {
    try {
      return parseMarkdown(source);
    } catch {
      return [{ type: 'paragraph' as const, content: source }];
    }
  }, [source]);

  const mergedFeatures = useMemo(() => ({
    headings: true,
    images: true,
    tables: true,
    html: false,
    taskLists: true,
    ...features,
  }), [features]);

  return (
    <View
      testID={testID || 'markdown-renderer'}
      accessible={accessible !== false}
      accessibilityLabel={accessibilityLabel || 'Markdown content'}
      style={[{ padding: 4 }, style as ViewStyle]}
    >
      {blocks.map((block, idx) => (
        <View key={idx}>
          {renderBlock(block, resolvedTheme, onLinkPress, maxImageWidth, mergedFeatures)}
        </View>
      ))}
    </View>
  );
};

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
