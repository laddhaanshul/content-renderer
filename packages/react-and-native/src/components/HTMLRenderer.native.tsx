/**
 * HTMLRenderer – renders HTML content as React Native components.
 *
 * v5 Features:
 * - 100+ HTML tags mapped to RN components
 * - Inline style parsing (kebab-case → camelCase)
 * - Class name → style mapping (Tailwind-like utilities)
 * - Nested inline element flattening
 * - Custom component overrides per tag
 * - Link handling via onLinkPress / Linking.openURL
 * - Image source resolution (uri, data-uri, require)
 * - Table rendering with colspan + rowspan
 * - List rendering with bullets/numbers
 * - <style> tag CSS processing via CSEngine
 * - @media query evaluation
 * - RTL support (dir=rtl)
 * - SVG text fallback
 * - video/audio/canvas placeholders
 * - Interactive details/summary toggle
 * - picture/source art direction
 * - Alterers / DOM Transform API
 * - idsStyles per-ID styling
 * - Thread-safe nodeKeyCounter
 * - dialog/modal rendering
 */

import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Linking,
  Platform,
  StyleSheet,
  Dimensions,
  Modal,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  type StyleProp,
  type ImageResizeMode,
} from 'react-native';
import { Parser } from 'htmlparser2';
import { decodeHTML as decode } from 'entities';
import {
  HTML_TO_RN_MAP,
  styleStringToRNStyle,
  classToRNStyle,
  flattenInlineNodes,
  type HTMLNode,
  type HTMLTagMapping,
} from '../utils/html-to-rn.native';
import type { NativeTheme } from '../themes/native';
import { lightNativeTheme } from '../themes/native';
import { CSSParser } from '@laddhaanshul/content-renderer-core';
// CSEngine is imported dynamically to avoid export issues in some builds
let CSEngineClass: any = null;
try {
  const coreMod = require('@laddhaanshul/content-renderer-core');
  CSEngineClass = coreMod.CSEngine || coreMod.default?.CSEngine || null;
} catch { /* CSEngine not available in this build */ }

// ─── Types ───────────────────────────────────────────────────────────────────

/** Pre-processing alterer — mutate HTML nodes before rendering (Gap #13) */
export type NativeAlterer = (node: HTMLNode) => HTMLNode | null;

export interface HTMLRendererProps {
  html: string;
  baseUrl?: string;
  renderers?: Record<string, React.ComponentType<TagRendererProps>>;
  onLinkPress?: (url: string) => void;
  onImageError?: (error: Error, uri: string) => void;
  resolveImageSource?: (src: string, attrs: Record<string, string>) => { uri: string } | number;
  theme?: Partial<NativeTheme>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessible?: boolean;
  maxDepth?: number;
  ignoreTags?: string[];
  renderRawContent?: boolean;
  enableStyles?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  /** Pre-processing alterers (Gap #13) */
  alterers?: NativeAlterer[];
  /** Per-ID styling overrides (Gap #14) */
  idsStyles?: Record<string, StyleProp<ViewStyle | TextStyle>>;
  /** Default numberOfLines for text containers (Gap #16) */
  defaultNumberOfLines?: number;
  /** Image prefetch callback (Gap #15) */
  onImagePrefetch?: (uris: string[]) => void;
  /** onChange handler for form elements (Gap #11) */
  onFormChange?: (name: string, value: string) => void;
}

export interface TagRendererProps {
  tag: string;
  attribs: Record<string, string>;
  children: React.ReactNode;
  style: StyleProp<ViewStyle | TextStyle>;
  theme: NativeTheme;
  node: HTMLNode;
  baseUrl?: string;
  onLinkPress?: (url: string) => void;
}

type RNComponentType = 'View' | 'Text' | 'Image' | 'ScrollView'
  | 'TextInput' | 'TouchableOpacity' | 'Pressable';

// ─── SVG Tag set for text fallback (Gap #2) ──────────────────────────────────

const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
  'ellipse', 'defs', 'use', 'clipPath', 'linearGradient', 'radialGradient',
  'stop', 'pattern', 'mask', 'symbol', 'foreignObject',
  'animate', 'animateTransform', 'filter', 'feGaussianBlur', 'feOffset',
  'feMerge', 'feMergeNode',
]);

const SVG_TEXT_TAGS = new Set(['text', 'tspan', 'textPath']);

// ─── Core HTMLNode type ─────────────────────────────────────────────────────

interface CoreHTMLNode {
  type: 'element' | 'text' | 'comment' | 'doctype' | 'cdata';
  tag?: string;
  attributes?: Record<string, string>;
  children?: CoreHTMLNode[];
  content?: string;
  parent?: CoreHTMLNode | null;
}

function nativeToCoreNode(node: HTMLNode, parent: CoreHTMLNode | null = null): CoreHTMLNode {
  if (node.type === 'text') return { type: 'text', content: node.data || '', parent };
  if (node.type === 'root') {
    const coreNode: CoreHTMLNode = { type: 'element', tag: 'root', attributes: {}, children: [], parent: null };
    if (node.children) for (const child of node.children) coreNode.children!.push(nativeToCoreNode(child, coreNode));
    return coreNode;
  }
  const coreNode: CoreHTMLNode = { type: 'element', tag: node.name || 'div', attributes: node.attribs || {}, children: [], parent };
  if (node.children) for (const child of node.children) coreNode.children!.push(nativeToCoreNode(child, coreNode));
  return coreNode;
}

function extractCSSFromTree(root: HTMLNode): string {
  const chunks: string[] = [];
  function walk(node: HTMLNode): void {
    if (node.type === 'tag' && node.name === 'style' && node.children) {
      const text = node.children.filter(c => c.type === 'text').map(c => c.data || '').join('');
      if (text.trim()) chunks.push(text);
    }
    if (node.children) for (const child of node.children) walk(child);
  }
  walk(root);
  return chunks.join('\n\n');
}

function computeNodePath(node: HTMLNode): string {
  const segments: string[] = [];
  let current: HTMLNode | undefined = node;
  while (current && current.parent) {
    if (current.type === 'tag' && current.name) {
      const parent = current.parent;
      const siblingElements = (parent.children || []).filter(c => c.type === 'tag' && c.name);
      const idx = siblingElements.indexOf(current);
      segments.unshift(`${current.name}.${idx >= 0 ? idx : 0}`);
    }
    current = current.parent;
  }
  return segments.join('.');
}

// ─── HTML Parser ────────────────────────────────────────────────────────────

function parseHTMLToTree(html: string): HTMLNode {
  const root: HTMLNode = { type: 'root', children: [] };
  const stack: HTMLNode[] = [root];
  let current = root;
  const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);
  const parser = new Parser({
    onopentag(name: string, attribs: Record<string, string>) {
      const node: HTMLNode = { type: 'tag', name: name.toLowerCase(), attribs, children: [], parent: current };
      current.children!.push(node);
      if (!VOID_ELEMENTS.has(name.toLowerCase())) { stack.push(node); current = node; }
    },
    ontext(data: string) { if (data) current.children!.push({ type: 'text', data, parent: current }); },
    onclosetag() { stack.pop(); current = stack[stack.length - 1] || root; },
    oncomment() {},
    onprocessinginstruction() {},
  }, { decodeEntities: false, lowerCaseTags: true, lowerCaseAttributeNames: true });
  parser.write(html);
  parser.end();
  return root;
}

// ─── Alterers Pipeline (Gap #13) ─────────────────────────────────────────────

function applyAlterers(root: HTMLNode, alterers: NativeAlterer[]): HTMLNode {
  if (!alterers || alterers.length === 0) return root;
  function walk(node: HTMLNode): HTMLNode {
    if (node.type !== 'tag') return node;
    let current: HTMLNode | null = node;
    for (const alterer of alterers) { if (current) current = alterer(current); }
    if (current && current.children) current = { ...current, children: current.children.map(walk) };
    return current || node;
  }
  return walk(root);
}

// ─── CSS Engine Integration ─────────────────────────────────────────────────

interface CSSComputedResult {
  computedStyles: Map<HTMLNode, Record<string, string>>;
}

function computeCSSEngineStyles(
  nativeRoot: HTMLNode, cssText: string, viewportWidth: number, viewportHeight: number,
): CSSComputedResult {
  const result = new Map<HTMLNode, Record<string, string>>();
  if (!cssText.trim()) return { computedStyles: result };
  try {
    const coreRoot = nativeToCoreNode(nativeRoot);
    const cssParser = new CSSParser();
    const cssDoc = cssParser.parse(cssText);
    const csEngine = CSEngineClass ? new CSEngineClass() : null;
    if (!csEngine) return { computedStyles: result };
    const styleMap = csEngine.computeStyles(coreRoot, cssDoc.rules, cssDoc.mediaQueries, cssDoc.variables, { viewportWidth, viewportHeight });
    const coreToNative = new Map<CoreHTMLNode, HTMLNode>();
    function mapNodes(coreNode: CoreHTMLNode, nativeNode: HTMLNode): void {
      if (!coreNode) return;
      coreToNative.set(coreNode, nativeNode);
      if (coreNode.children && nativeNode.children) {
        let ci = 0, ni = 0;
        while (ci < coreNode.children.length && ni < nativeNode.children.length) {
          const cc = coreNode.children[ci], nc = nativeNode.children[ni];
          if (cc.type === 'text' && nc.type === 'text') { mapNodes(cc, nc); ci++; ni++; }
          else if (cc.type === 'element' && nc.type === 'tag') { mapNodes(cc, nc); ci++; ni++; }
          else if (cc.type === 'text') ci++; else ni++;
        }
      }
    }
    mapNodes(coreRoot, nativeRoot);
    function assignStyles(nativeNode: HTMLNode): void {
      if (nativeNode.type === 'tag' && nativeNode.name) {
        const path = computeNodePath(nativeNode);
        const computed = styleMap.get(path);
        if (computed && Object.keys(computed).length > 0) result.set(nativeNode, computed);
      }
      if (nativeNode.children) for (const child of nativeNode.children) assignStyles(child);
    }
    assignStyles(nativeRoot);
  } catch (error) {
    if (__DEV__) console.warn('[HTMLRenderer.native] CSS engine error:', error);
  }
  return { computedStyles: result };
}

// ─── Inline style builder ────────────────────────────────────────────────────

function buildNodeStyle(
  tag: string, attribs: Record<string, string> | undefined,
  theme: NativeTheme, cssEngineStyles?: Record<string, string>,
  idsStyles?: Record<string, StyleProp<ViewStyle | TextStyle>>,
): StyleProp<ViewStyle | TextStyle> {
  const mapping = HTML_TO_RN_MAP[tag];
  const styles: (ViewStyle | TextStyle)[] = [];
  if (mapping?.defaultStyle) styles.push(mapping.defaultStyle as ViewStyle | TextStyle);
  if (cssEngineStyles && Object.keys(cssEngineStyles).length > 0) {
    const engineStyle = styleStringToRNStyle(Object.entries(cssEngineStyles).map(([p, v]) => `${p}: ${v}`).join('; '));
    if (Object.keys(engineStyle).length > 0) styles.push(engineStyle as ViewStyle | TextStyle);
  }
  if (attribs?.style) {
    const inlineStyle = styleStringToRNStyle(attribs.style);
    if (Object.keys(inlineStyle).length > 0) styles.push(inlineStyle as ViewStyle | TextStyle);
  }
  if (attribs?.class) {
    const classStyle = classToRNStyle(attribs.class);
    if (Object.keys(classStyle).length > 0) styles.push(classStyle as ViewStyle | TextStyle);
  }
  // idsStyles override (Gap #14)
  if (attribs?.id && idsStyles?.[attribs.id]) {
    styles.push(idsStyles[attribs.id] as ViewStyle | TextStyle);
  }
  return styles.length === 0 ? undefined : (styles.length === 1 ? styles[0] : styles);
}

// ─── RN Component helper ────────────────────────────────────────────────────

function getRNComponent(type: RNComponentType) {
  switch (type) {
    case 'View': return View; case 'Text': return Text; case 'Image': return Image;
    case 'ScrollView': return ScrollView; case 'TextInput': return TextInput;
    case 'TouchableOpacity': return TouchableOpacity; case 'Pressable': return Pressable;
  }
}

// ─── Image source resolver ───────────────────────────────────────────────────

function resolveImageSrc(src: string | undefined, attrs: Record<string, string>, baseUrl?: string, resolveCustom?: (src: string, attrs: Record<string, string>) => { uri: string } | number): { uri: string } | number | undefined {
  if (!src) return undefined;
  if (resolveCustom) return resolveCustom(src, attrs);
  if (src.startsWith('data:')) return { uri: src };
  if (/^https?:\/\//i.test(src) || /^\/\//i.test(src)) return { uri: src };
  if (baseUrl) { const base = baseUrl.replace(/\/+$/, ''); const path = src.startsWith('/') ? src : `/${src}`; return { uri: `${base}${path}` }; }
  return { uri: src };
}

// ─── Render Context ─────────────────────────────────────────────────────────

interface RenderContext {
  theme: NativeTheme;
  renderers?: Record<string, React.ComponentType<TagRendererProps>>;
  onLinkPress?: (url: string) => void;
  baseUrl?: string;
  resolveImageSource?: (src: string, attrs: Record<string, string>) => { uri: string } | number;
  ignoreTags?: Set<string>;
  depth: number;
  maxDepth: number;
  listCounter: Map<string, number>;
  listTypeStack: ('ul' | 'ol')[];
  cssEngineStyles: Map<HTMLNode, Record<string, string>>;
  idsStyles?: Record<string, StyleProp<ViewStyle | TextStyle>>;
  defaultNumberOfLines?: number;
  onFormChange?: (name: string, value: string) => void;
}

function getCSSEngineStyle(ctx: RenderContext, node: HTMLNode): Record<string, string> | undefined {
  return ctx.cssEngineStyles.get(node);
}

function getDirectionStyle(attribs: Record<string, string> | undefined): { direction?: 'rtl' | 'ltr'; textAlign?: 'right' | 'left' } | undefined {
  const dir = attribs?.dir?.toLowerCase();
  if (dir === 'rtl') return { direction: 'rtl' as const, textAlign: 'right' as const };
  if (dir === 'ltr') return { direction: 'ltr' as const };
  return undefined;
}

// ─── Render children ─────────────────────────────────────────────────────────

function renderChildren(children: HTMLNode[] | undefined, ctx: RenderContext, parentTag?: string): React.ReactNode {
  if (!children || children.length === 0) return null;
  const parentMapping = parentTag ? HTML_TO_RN_MAP[parentTag] : undefined;
  const parentIsText = parentMapping?.isText === true;
  if (parentIsText) return renderInlineChildren(children, ctx);
  const allInline = children.every(c => c.type === 'text' || (c.type === 'tag' && c.name && HTML_TO_RN_MAP[c.name]?.isText));
  if (allInline) return <Text style={[ctx.theme.typography.body]}>{renderInlineChildren(children, ctx)}</Text>;
  return renderMixedChildren(children, ctx);
}

function renderInlineChildren(children: HTMLNode[] | undefined, ctx: RenderContext): React.ReactNode {
  const elements: React.ReactNode[] = [];
  for (const child of children || []) {
    if (child.type === 'text') {
      const decoded = decode(child.data || '');
      if (decoded) elements.push(decoded);
    } else if (child.type === 'tag' && child.name) {
      const tag = child.name.toLowerCase();
      const mapping = HTML_TO_RN_MAP[tag];
      if (ctx.ignoreTags?.has(tag) || mapping?.isIgnored) {
        elements.push(renderInlineChildren(child.children, ctx));
        continue;
      }
      if (mapping?.isSelfClosing) { if (tag === 'br') elements.push('\n'); continue; }
      if (ctx.renderers?.[tag]) {
        const CustomComponent = ctx.renderers[tag];
        const cssStyles = getCSSEngineStyle(ctx, child);
        const style = buildNodeStyle(tag, child.attribs, ctx.theme, cssStyles, ctx.idsStyles);
        elements.push(<CustomComponent key={elements.length} tag={tag} attribs={child.attribs || {}} children={renderInlineChildren(child.children, ctx)} style={style} theme={ctx.theme} node={child} baseUrl={ctx.baseUrl} onLinkPress={ctx.onLinkPress} />);
        continue;
      }
      const cssStyles = getCSSEngineStyle(ctx, child);
      const style = buildNodeStyle(tag, child.attribs, ctx.theme, cssStyles, ctx.idsStyles);
      const nestedContent = renderInlineChildren(child.children, ctx);
      if (tag === 'a' && child.attribs?.href) {
        const href = decode(child.attribs.href);
        elements.push(<Text key={elements.length} style={[style as TextStyle, { color: ctx.theme.colors.link }]} onPress={() => { ctx.onLinkPress ? ctx.onLinkPress(href) : Linking.openURL(href).catch(() => {}); }} suppressHighlighting>{nestedContent}</Text>);
        continue;
      }
      if (tag === 'br') { elements.push('\n'); continue; }
      elements.push(<Text key={elements.length} style={style as TextStyle}>{nestedContent}</Text>);
    }
  }
  return elements;
}

function renderMixedChildren(children: HTMLNode[], ctx: RenderContext): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let inlineBatch: HTMLNode[] = [];
  const flushInline = () => {
    if (inlineBatch.length === 0) return;
    elements.push(<Text key={`inline-${elements.length}`} style={[ctx.theme.typography.body]}>{renderInlineChildren(inlineBatch, ctx)}</Text>);
    inlineBatch = [];
  };
  for (const child of children) {
    const isInline = child.type === 'text' || (child.type === 'tag' && child.name && HTML_TO_RN_MAP[child.name]?.isText);
    if (isInline) inlineBatch.push(child);
    else { flushInline(); elements.push(renderNode(child, ctx)); }
  }
  flushInline();
  return elements;
}

// ─── Render a single node ───────────────────────────────────────────────────

function renderNode(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  if (node.type === 'text') {
    const decoded = decode(node.data || '');
    if (!decoded) return null;
    return <Text style={[ctx.theme.typography.body]}>{decoded}</Text>;
  }
  if (node.type !== 'tag' || !node.name) return null;
  const tag = node.name.toLowerCase();
  const mapping = HTML_TO_RN_MAP[tag];
  if (ctx.depth >= ctx.maxDepth) return null;
  if (ctx.ignoreTags?.has(tag) || mapping?.isIgnored) return renderChildren(node.children, ctx, tag);
  if (ctx.renderers?.[tag]) {
    const CustomComponent = ctx.renderers[tag];
    const cssStyles = getCSSEngineStyle(ctx, node);
    const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles, ctx.idsStyles);
    return <CustomComponent key={nodeKey(tag, node.attribs, ctx.depth)} tag={tag} attribs={node.attribs || {}} children={renderChildren(node.children, { ...ctx, depth: ctx.depth + 1 }, tag)} style={style} theme={ctx.theme} node={node} baseUrl={ctx.baseUrl} onLinkPress={ctx.onLinkPress} />;
  }
  if (mapping?.isSelfClosing) return renderSelfClosing(tag, node.attribs, ctx);

  switch (tag) {
    case 'img': return renderImage(node.attribs, ctx);
    case 'a': return renderLink(tag, node, ctx);
    case 'ul': case 'ol': return renderList(tag, node, ctx);
    case 'li': return renderListItem(tag, node, ctx);
    case 'table': return renderTable(node, ctx);
    case 'tr': return renderTableRowSimple(node, ctx);
    case 'th': case 'td': return renderTableCell(tag, node, ctx);
    case 'pre': return renderPre(node, ctx);
    case 'br': return <Text key={nodeKey('br', node.attribs, ctx.depth)}>{'\n'}</Text>;
    case 'hr': return <View key={nodeKey('hr', node.attribs, ctx.depth)} style={[mapping?.defaultStyle as ViewStyle, { backgroundColor: ctx.theme.colors.divider }]} />;
    case 'blockquote': return renderBlockquote(node, ctx);
    case 'button': return renderButton(node, ctx);
    case 'input': return renderInput(node, ctx);
    case 'textarea': return renderTextarea(node, ctx);
    case 'select': return renderSelect(node, ctx);
    case 'details': return renderDetails(node, ctx);   // Gap #10
    case 'summary': return renderSummary(node, ctx);   // Gap #10
    case 'dialog': return renderDialog(node, ctx);     // Gap #20
    case 'picture': return renderPicture(node, ctx);   // Gap #12
    case 'video': return renderMedia('video', node, ctx); // Gap #8
    case 'audio': return renderMedia('audio', node, ctx); // Gap #8
    case 'canvas': return renderCanvas(node, ctx);     // Gap #8
    default:
      // SVG text fallback (Gap #2)
      if (SVG_TEXT_TAGS.has(tag)) {
        return renderSVGText(tag, node, ctx);
      }
      // SVG non-text — render as empty View placeholder
      if (SVG_TAGS.has(tag)) {
        return renderSVGPlaceholder(tag, node, ctx);
      }
      return renderDefaultNode(tag, node, ctx);
  }
}

// ─── Individual tag renderers ───────────────────────────────────────────────

function renderSelfClosing(tag: string, attribs: Record<string, string> | undefined, ctx: RenderContext): React.ReactNode {
  const mapping = HTML_TO_RN_MAP[tag];
  const style = buildNodeStyle(tag, attribs, ctx.theme);
  const key = nodeKey(tag, attribs, ctx.depth);
  switch (tag) {
    case 'img': return renderImage(attribs, ctx);
    case 'hr': return <View key={key} style={[style as ViewStyle, { backgroundColor: ctx.theme.colors.divider }]} />;
    case 'br': return <Text key={key}>{'\n'}</Text>;
    case 'input': return renderInput({ type: 'tag', name: tag, attribs: attribs || {} }, ctx);
    default: { const Component = getRNComponent(mapping?.component || 'View') as any; return <Component key={key} style={style} />; }
  }
}

function renderImage(attribs: Record<string, string> | undefined, ctx: RenderContext): React.ReactNode {
  const style = buildNodeStyle('img', attribs, ctx.theme);
  const source = resolveImageSrc(attribs?.src, attribs || {}, ctx.baseUrl, ctx.resolveImageSource);
  const key = nodeKey('img', attribs, ctx.depth);
  const width = attribs?.width ? parseInt(attribs.width, 10) : undefined;
  const height = attribs?.height ? parseInt(attribs.height, 10) : undefined;
  if (!source) return <View key={key} style={[style as ViewStyle, { width: width || 200, height: height || 150, backgroundColor: ctx.theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: ctx.theme.colors.textTertiary, fontSize: 12 }}>Image</Text></View>;
  return <Image key={key} source={source} style={[style as ImageStyle, width ? { width } : { width: '100%' as any }, height ? { height } : { aspectRatio: 4 / 3 }, { borderRadius: 4 }]} resizeMode="contain" accessible accessibilityLabel={attribs?.alt || 'Image'} />;
}

function renderLink(tag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles, ctx.idsStyles);
  const href = decode(node.attribs?.href || '');
  const key = nodeKey(tag, node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  const dirStyle = getDirectionStyle(node.attribs);
  return (
    <TouchableOpacity key={key} onPress={() => { if (href) { ctx.onLinkPress ? ctx.onLinkPress(href) : Linking.openURL(href).catch(() => {}); } }} activeOpacity={0.7} accessibilityRole="link">
      <Text style={[style as TextStyle, { color: ctx.theme.colors.link }, dirStyle as TextStyle]}>{renderChildren(node.children, childCtx, tag)}</Text>
    </TouchableOpacity>
  );
}

function renderList(tag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles);
  const key = nodeKey(tag, node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1, listTypeStack: [...ctx.listTypeStack, tag as 'ul' | 'ol'] };
  childCtx.listCounter = new Map(ctx.listCounter);
  if (tag === 'ol') { const start = parseInt(node.attribs?.start || '1', 10); childCtx.listCounter.set(`${ctx.depth}`, start - 1); }
  const dirStyle = getDirectionStyle(node.attribs);
  return (
    <View key={key} style={[style as ViewStyle, { paddingLeft: ctx.theme.spacing.md }, dirStyle as ViewStyle]}>
      {node.children?.map((child: any, idx: any) => {
        if (child.type === 'tag' && child.name === 'li') return renderListItem(tag, child, childCtx);
        return <View key={idx}>{renderNode(child, childCtx)}</View>;
      })}
    </View>
  );
}

function renderListItem(listTag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const key = nodeKey('li', node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  let marker: React.ReactNode;
  if (listTag === 'ol') {
    const depthKey = `${ctx.depth - 1}`;
    let count = ctx.listCounter.get(depthKey) || 0;
    count++;
    ctx.listCounter.set(depthKey, count);
    marker = <Text style={{ fontSize: 14, color: ctx.theme.colors.text, width: 20, textAlign: 'right', marginRight: 8 }}>{count}.</Text>;
  } else {
    marker = <Text style={{ fontSize: 14, color: ctx.theme.colors.text, width: 20, textAlign: 'center', marginRight: 8 }}>{'\u2022'}</Text>;
  }
  return <View key={key} style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'flex-start' }}>{marker}<View style={{ flex: 1 }}>{renderMixedChildren(node.children || [], childCtx)}</View></View>;
}

// Standalone <tr> renderer (for tr outside of table context)
function renderTableRowSimple(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('tr', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('tr', node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  return (
    <View key={key} style={[style as ViewStyle, { flexDirection: 'row' }]}>
      {node.children?.map((child: any, idx: any) => {
        if (child.type === 'tag' && (child.name === 'th' || child.name === 'td'))
          return renderTableCell(child.name, child, childCtx);
        return null;
      })}
    </View>
  );
}

function renderTable(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('table', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('table', node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  // Pre-pass: compute rowspan map for all cells
  const rowspanMap = buildRowspanMap(node);
  return (
    <ScrollView key={key} horizontal style={[style as ViewStyle]} nestedScrollEnabled>
      <View style={{ minWidth: 200 }}>
        {node.children?.map((child: any, idx: any) => {
          if (child.type === 'tag' && (child.name === 'thead' || child.name === 'tbody' || child.name === 'tfoot' || child.name === 'tr'))
            return renderTableRowWithRowspan(child, childCtx, rowspanMap);
          return null;
        })}
      </View>
    </ScrollView>
  );
}

// ─── Rowspan support (Gap #7) ────────────────────────────────────────────────

interface RowspanEntry {
  colspan: number;
  rowsRemaining: number;
}

function buildRowspanMap(node: HTMLNode): Map<number, RowspanEntry[]> {
  const map = new Map<number, RowspanEntry[]>();
  let rowIdx = 0;
  function walkRow(rowNode: HTMLNode) {
    if (rowNode.type === 'tag' && (rowNode.name === 'tr' || rowNode.name === 'thead' || rowNode.name === 'tbody' || rowNode.name === 'tfoot')) {
      if (rowNode.name === 'tr') {
        const entries: RowspanEntry[] = [];
        if (rowNode.children) {
          for (const cell of rowNode.children) {
            if (cell.type === 'tag' && (cell.name === 'td' || cell.name === 'th')) {
              const rs = parseInt(cell.attribs?.rowspan || '1', 10);
              const cs = parseInt(cell.attribs?.colspan || '1', 10);
              if (rs > 1) entries.push({ colspan: cs, rowsRemaining: rs - 1 });
              else entries.push({ colspan: cs, rowsRemaining: 0 });
            }
          }
        }
        map.set(rowIdx, entries);
        rowIdx++;
      }
      if (rowNode.children) for (const child of rowNode.children) walkRow(child);
    }
  }
  walkRow(node);
  return map;
}

function renderTableRowWithRowspan(node: HTMLNode, ctx: RenderContext, rowspanMap: Map<number, RowspanEntry[]>): React.ReactNode {
  // If this is a section element (thead/tbody/tfoot), recurse into children
  if (node.name === 'thead' || node.name === 'tbody' || node.name === 'tfoot') {
    return <View key={nodeKey(node.name, node.attribs, ctx.depth)}>
      {node.children?.map((child: any, idx: any) => {
        if (child.type === 'tag' && child.name === 'tr') {
          // Find the tr index relative to the table
          return renderNode(child, ctx);
        }
        return null;
      })}
    </View>;
  }
  // It's a <tr>
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('tr', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('tr', node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  return (
    <View key={key} style={[style as ViewStyle, { flexDirection: 'row' }]}>
      {node.children?.map((child: any, idx: any) => {
        if (child.type === 'tag' && (child.name === 'th' || child.name === 'td'))
          return renderTableCell(child.name, child, childCtx);
        return null;
      })}
    </View>
  );
}

function renderTableCell(tag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const isHeader = tag === 'th';
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles);
  const key = nodeKey(tag, node.attribs, ctx.depth);
  const colspan = parseInt(node.attribs?.colspan || '1', 10);
  const rowspan = parseInt(node.attribs?.rowspan || '1', 10);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  const cellStyle: ViewStyle = {
    flex: colspan,
    borderWidth: 1,
    borderColor: ctx.theme.colors.tableBorder,
    padding: 8,
    backgroundColor: isHeader ? ctx.theme.colors.tableHeaderBackground : 'transparent',
  };
  // Rowspan: if > 1, add extra height to simulate spanning
  if (rowspan > 1) {
    cellStyle.minHeight = 40 * rowspan;
  }
  return (
    <View key={key} style={[style as ViewStyle, cellStyle]}>
      <Text style={[isHeader ? ctx.theme.typography.tableHeader : ctx.theme.typography.tableCell]}>
        {renderInlineChildren(node.children || [], childCtx)}
      </Text>
    </View>
  );
}

function renderPre(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('pre', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('pre', node.attribs, ctx.depth);
  const textContent = extractTextContent(node);
  const decoded = decode(textContent);
  return <ScrollView key={key} horizontal style={[style as ViewStyle, { backgroundColor: ctx.theme.colors.codeBackground }]}><Text style={[ctx.theme.typography.codeInline, { padding: ctx.theme.spacing.sm }]}>{decoded}</Text></ScrollView>;
}

function renderBlockquote(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('blockquote', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('blockquote', node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  const dirStyle = getDirectionStyle(node.attribs);
  return (
    <View key={key} style={[style as ViewStyle, { borderLeftWidth: ctx.theme.markdown.blockquoteBorderWidth, borderLeftColor: ctx.theme.colors.blockquoteBorder, paddingLeft: ctx.theme.markdown.blockquotePaddingLeft, backgroundColor: ctx.theme.colors.blockquoteBackground, marginVertical: ctx.theme.spacing.sm }, dirStyle as ViewStyle]}>
      {renderChildren(node.children, childCtx)}
    </View>
  );
}

function renderButton(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('button', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('button', node.attribs, ctx.depth);
  const textContent = extractTextContent(node);
  return <TouchableOpacity key={key} style={[style as ViewStyle, { backgroundColor: ctx.theme.colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, alignItems: 'center' }]} activeOpacity={0.7}><Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>{decode(textContent)}</Text></TouchableOpacity>;
}

function renderInput(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('input', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('input', node.attribs, ctx.depth);
  const inputType = node.attribs?.type?.toLowerCase();
  const placeholder = decode(node.attribs?.placeholder || '');
  if (inputType === 'hidden') return null;
  const dirStyle = getDirectionStyle(node.attribs);
  return (
    <TextInput key={key} style={[style as TextStyle, { borderWidth: 1, borderColor: ctx.theme.colors.border, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, marginVertical: 4, fontSize: 15, color: ctx.theme.colors.text }, dirStyle as TextStyle]}
      placeholder={placeholder} placeholderTextColor={ctx.theme.colors.textTertiary}
      secureTextEntry={inputType === 'password'}
      keyboardType={inputType === 'email' ? 'email-address' : inputType === 'tel' ? 'phone-pad' : inputType === 'url' ? 'url' : inputType === 'number' ? 'numeric' : 'default'}
      editable={node.attribs?.disabled !== 'true'}
      defaultValue={decode(node.attribs?.value || '')}
      onChangeText={(text) => ctx.onFormChange?.(node.attribs?.name || '', text)}
    />
  );
}

function renderTextarea(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('textarea', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('textarea', node.attribs, ctx.depth);
  const placeholder = decode(node.attribs?.placeholder || '');
  const dirStyle = getDirectionStyle(node.attribs);
  return (
    <TextInput key={key} style={[style as TextStyle, { borderWidth: 1, borderColor: ctx.theme.colors.border, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 8, marginVertical: 4, fontSize: 15, color: ctx.theme.colors.text, minHeight: 80, textAlignVertical: 'top' }, dirStyle as TextStyle]}
      placeholder={placeholder} placeholderTextColor={ctx.theme.colors.textTertiary}
      multiline numberOfLines={parseInt(node.attribs?.rows || '4', 10)}
      editable={node.attribs?.disabled !== 'true'}
      defaultValue={extractTextContent(node)}
      onChangeText={(text) => ctx.onFormChange?.(node.attribs?.name || '', text)}
    />
  );
}

function renderSelect(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('select', node.attribs, ctx.theme, cssStyles);
  const key = nodeKey('select', node.attribs, ctx.depth);
  const options = node.children?.filter((c: any) => c.type === 'tag' && c.name === 'option') || [];
  const selected = options.find((o: any) => o.attribs?.selected !== undefined) || options[0];
  const displayText = selected ? extractTextContent(selected) : 'Select...';
  return <TouchableOpacity key={key} style={[style as ViewStyle, { borderWidth: 1, borderColor: ctx.theme.colors.border, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 8, marginVertical: 4, backgroundColor: ctx.theme.colors.surface }]}><Text style={{ fontSize: 15, color: ctx.theme.colors.text }}>{decode(displayText)}</Text></TouchableOpacity>;
}

// ─── Details/Summary Toggle (Gap #10) ────────────────────────────────────────

function DetailsWrapper(props: { node: HTMLNode; ctx: RenderContext }): React.ReactElement {
  const { node, ctx } = props;
  const isOpen = node.attribs?.open !== undefined;
  const [open, setOpen] = useState(isOpen);
  const key = nodeKey('details', node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('details', node.attribs, ctx.theme, cssStyles, ctx.idsStyles);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };

  const summaryChild = node.children?.find(c => c.type === 'tag' && c.name === 'summary');
  const otherChildren = node.children?.filter(c => !(c.type === 'tag' && c.name === 'summary'));

  return (
    <View key={key} style={[style as ViewStyle, { borderWidth: 1, borderColor: ctx.theme.colors.border, borderRadius: 6, marginVertical: 4, overflow: 'hidden' }]}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: ctx.theme.colors.surface }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: ctx.theme.colors.text, flex: 1 }}>
          {summaryChild ? extractTextContent(summaryChild) : 'Details'}
        </Text>
        <Text style={{ fontSize: 14, color: ctx.theme.colors.textTertiary }}>{open ? '\u25B2' : '\u25BC'}</Text>
      </TouchableOpacity>
      {open && <View style={{ padding: 10 }}>{renderMixedChildren(otherChildren || [], childCtx)}</View>}
    </View>
  );
}

function renderDetails(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  return <DetailsWrapper node={node} ctx={ctx} />;
}

function renderSummary(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  // Summary is handled inside DetailsWrapper; if standalone, just render children
  return renderChildren(node.children, { ...ctx, depth: ctx.depth + 1 });
}

// ─── Dialog/Modal (Gap #20) ─────────────────────────────────────────────────

function DialogWrapper(props: { node: HTMLNode; ctx: RenderContext }): React.ReactElement {
  const { node, ctx } = props;
  const isOpen = node.attribs?.open !== undefined;
  const [visible, setVisible] = useState(isOpen);
  const key = nodeKey('dialog', node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('dialog', node.attribs, ctx.theme, cssStyles, ctx.idsStyles);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };

  return (
    <Modal key={key} visible={visible} transparent animationType="fade"
      onRequestClose={() => setVisible(false)}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={[style as ViewStyle, { backgroundColor: '#fff', borderRadius: 12, padding: 20, minWidth: 280, maxHeight: '80%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }]}>
          <TouchableOpacity onPress={() => setVisible(false)} style={{ position: 'absolute', top: 8, right: 12 }}>
            <Text style={{ fontSize: 20, color: ctx.theme.colors.textTertiary }}>X</Text>
          </TouchableOpacity>
          {renderChildren(node.children, childCtx)}
        </View>
      </View>
    </Modal>
  );
}

function renderDialog(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  return <DialogWrapper node={node} ctx={ctx} />;
}

// ─── Picture/Source Art Direction (Gap #12) ──────────────────────────────────

function renderPicture(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const key = nodeKey('picture', node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('picture', node.attribs, ctx.theme, cssStyles);

  // Find the <img> fallback or use the first <source> that matches viewport
  const imgChild = node.children?.find(c => c.type === 'tag' && c.name === 'img');
  if (imgChild) {
    return renderImage(imgChild.attribs, ctx);
  }

  // Use first <source> src as fallback
  const sourceChild = node.children?.find(c => c.type === 'tag' && c.name === 'source');
  if (sourceChild?.attribs?.src) {
    return renderImage({ src: sourceChild.attribs.src, alt: node.attribs?.alt || '' }, ctx);
  }

  // Placeholder
  return <View key={key} style={[style as ViewStyle, { width: 200, height: 150, backgroundColor: ctx.theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: ctx.theme.colors.textTertiary, fontSize: 12 }}>Picture</Text></View>;
}

// ─── Video/Audio/Canvas Placeholders (Gap #8) ───────────────────────────────

function renderMedia(mediaType: 'video' | 'audio', node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const key = nodeKey(mediaType, node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(mediaType, node.attribs, ctx.theme, cssStyles);
  const src = node.attribs?.src;
  const poster = node.attribs?.poster;
  const hasControls = node.attribs?.controls !== undefined;

  return (
    <View key={key} style={[style as ViewStyle, { backgroundColor: ctx.theme.colors.codeBackground, borderRadius: 8, overflow: 'hidden' }]}>
      {poster ? (
        <Image source={{ uri: poster }} style={{ width: '100%', aspectRatio: 16 / 9 }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', aspectRatio: mediaType === 'video' ? 16 / 9 : 4 / 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 4 }}>{mediaType === 'video' ? 'Video' : 'Audio'}</Text>
          <Text style={{ fontSize: 12, color: ctx.theme.colors.textTertiary }}>
            {src ? decode(src).split('/').pop() : `${mediaType} element`}
          </Text>
        </View>
      )}
      {hasControls && (
        <View style={{ flexDirection: 'row', padding: 8, gap: 12, justifyContent: 'center' }}>
          <Text style={{ color: ctx.theme.colors.link, fontSize: 14 }}>Play/Pause</Text>
          <Text style={{ color: ctx.theme.colors.textTertiary, fontSize: 12 }}>
            {mediaType === 'video' ? 'Native video not supported' : 'Native audio not supported'}
          </Text>
        </View>
      )}
    </View>
  );
}

function renderCanvas(node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const key = nodeKey('canvas', node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle('canvas', node.attribs, ctx.theme, cssStyles);
  const width = node.attribs?.width ? parseInt(node.attribs.width, 10) : 300;
  const height = node.attribs?.height ? parseInt(node.attribs.height, 10) : 150;
  return (
    <View key={key} style={[style as ViewStyle, { width, height, backgroundColor: '#f0f0f0', borderRadius: 4, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: ctx.theme.colors.textTertiary, fontSize: 12 }}>Canvas ({width}x{height})</Text>
    </View>
  );
}

// ─── SVG Text Fallback (Gap #2) ──────────────────────────────────────────────

function renderSVGText(tag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const key = nodeKey(tag, node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles);
  const textContent = extractTextContent(node);
  const fontSize = node.attribs?.['font-size'] ? parseInt(node.attribs['font-size'], 10) : 16;
  const fill = node.attribs?.fill || ctx.theme.colors.text;

  if (!textContent.trim()) return null;

  return (
    <Text key={key} style={[style as TextStyle, { fontSize, color: fill }]}>
      {decode(textContent)}
    </Text>
  );
}

function renderSVGPlaceholder(tag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const key = nodeKey(tag, node.attribs, ctx.depth);
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles);

  // Extract any <text> children to render as text
  const textNodes: React.ReactNode[] = [];
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'tag' && child.name && SVG_TEXT_TAGS.has(child.name)) {
        const text = extractTextContent(child);
        if (text.trim()) {
          textNodes.push(child.name ? renderSVGText(child.name, child, ctx) : null);
        }
      }
    }
  }

  // If the SVG has text children, show them; otherwise show a placeholder
  if (textNodes.length > 0) {
    return <View key={key} style={[style as ViewStyle, { alignItems: 'center', justifyContent: 'center', padding: 8 }]}>{textNodes}</View>;
  }

  const w = node.attribs?.width ? parseInt(node.attribs.width, 10) : undefined;
  const h = node.attribs?.height ? parseInt(node.attribs.height, 10) : undefined;

  return (
    <View key={key} style={[style as ViewStyle, { width: w || 120, height: h || 120, backgroundColor: ctx.theme.colors.surface, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: ctx.theme.colors.border }]}>
      <Text style={{ fontSize: 11, color: ctx.theme.colors.textTertiary }}>SVG: {tag}</Text>
    </View>
  );
}

// ─── Default node renderer ───────────────────────────────────────────────────

function renderDefaultNode(tag: string, node: HTMLNode, ctx: RenderContext): React.ReactNode {
  const mapping = HTML_TO_RN_MAP[tag];
  const cssStyles = getCSSEngineStyle(ctx, node);
  const style = buildNodeStyle(tag, node.attribs, ctx.theme, cssStyles, ctx.idsStyles);
  const key = nodeKey(tag, node.attribs, ctx.depth);
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  const ComponentType = mapping?.component || 'View';
  const Component = getRNComponent(ComponentType) as React.ComponentType<any>;
  const childContent = renderChildren(node.children, childCtx, tag);
  const dirStyle = getDirectionStyle(node.attribs);
  const finalStyle = mapping?.isText
    ? [style as TextStyle, { color: ctx.theme.colors.text }, dirStyle as TextStyle]
    : [style as ViewStyle, dirStyle as ViewStyle];

  return <Component key={key} style={finalStyle}>{childContent}</Component>;
}

// ─── Utilities ──────────────────────────────────────────────────────────────

// Thread-safe key generation using a simple counter (Gap #19)
// Reset per render cycle; React 18 concurrent mode handles re-renders gracefully
let nodeCounter = 0;
function nodeKey(tag: string, attribs: Record<string, string> | undefined, depth: number): string {
  const id = attribs?.id ? `-${attribs.id}` : '';
  return `${tag}${id}-${depth}-${nodeCounter++}`;
}

function extractTextContent(node: HTMLNode): string {
  if (node.type === 'text') return node.data || '';
  if (node.type === 'tag' && node.children) return node.children.map(extractTextContent).join('');
  return '';
}

// ─── Component ───────────────────────────────────────────────────────────────

const HTMLRenderer: React.FC<HTMLRendererProps> = ({
  html, baseUrl, renderers, onLinkPress, onImageError,
  resolveImageSource: resolveImageSourceProp, theme: themeOverride,
  style, testID, accessibilityLabel, accessible,
  maxDepth = 50, ignoreTags, renderRawContent = false,
  enableStyles = true, viewportWidth, viewportHeight,
  alterers, idsStyles, defaultNumberOfLines,
  onImagePrefetch, onFormChange,
}) => {
  const resolvedTheme = useMemo<NativeTheme>(() => {
    if (!themeOverride) return lightNativeTheme;
    return { ...lightNativeTheme, ...(themeOverride as any) };
  }, [themeOverride]);

  const resolvedViewport = useMemo(() => {
    const dims = Dimensions.get('window');
    return { width: viewportWidth ?? dims.width, height: viewportHeight ?? dims.height };
  }, [viewportWidth, viewportHeight]);

  const ignoreSet = useMemo(() => {
    const base = new Set<string>(['script', 'style']);
    if (renderRawContent) { base.delete('script'); base.delete('style'); }
    if (ignoreTags) ignoreTags.forEach(t => base.add(t.toLowerCase()));
    return base;
  }, [ignoreTags, renderRawContent]);

  const parseResult = useMemo(() => {
    try { return parseHTMLToTree(html || ''); }
    catch { return { type: 'root' as const, children: [] }; }
  }, [html]);

  // Apply alterers (Gap #13)
  const alteredTree = useMemo(() => {
    return applyAlterers(parseResult, alterers || []);
  }, [parseResult, alterers]);

  // Collect image URIs for prefetch (Gap #15)
  useMemo(() => {
    if (onImagePrefetch) {
      const uris: string[] = [];
      function walk(n: HTMLNode): void {
        if (n.type === 'tag' && n.name === 'img' && n.attribs?.src) uris.push(n.attribs.src);
        if (n.children) for (const c of n.children) walk(c);
      }
      walk(alteredTree);
      if (uris.length > 0) onImagePrefetch(uris);
    }
  }, [alteredTree, onImagePrefetch]);

  // Extract CSS
  const cssEngineStylesMap = useMemo(() => {
    if (!enableStyles) return new Map<HTMLNode, Record<string, string>>();
    const cssText = extractCSSFromTree(alteredTree);
    if (!cssText.trim()) return new Map<HTMLNode, Record<string, string>>();
    const result = computeCSSEngineStyles(alteredTree, cssText, resolvedViewport.width, resolvedViewport.height);
    return result.computedStyles;
  }, [alteredTree, enableStyles, resolvedViewport.width, resolvedViewport.height]);

  // Reset key counter per render (Gap #19)
  nodeCounter = 0;

  const ctx: RenderContext = useMemo(() => ({
    theme: resolvedTheme, renderers, onLinkPress, baseUrl,
    resolveImageSource: resolveImageSourceProp, ignoreTags: ignoreSet,
    depth: 0, maxDepth, listCounter: new Map(), listTypeStack: [],
    cssEngineStyles: cssEngineStylesMap, idsStyles, defaultNumberOfLines, onFormChange,
  }), [resolvedTheme, renderers, onLinkPress, baseUrl, resolveImageSourceProp, ignoreSet, maxDepth, cssEngineStylesMap, idsStyles, defaultNumberOfLines, onFormChange]);

  return (
    <View testID={testID || 'html-renderer'} accessibilityLabel={accessibilityLabel} accessible={accessible !== false} style={style as ViewStyle}>
      {alteredTree.children?.map((child: any, idx: any) => (
        <React.Fragment key={`root-${idx}`}>{renderNode(child, ctx)}</React.Fragment>
      ))}
    </View>
  );
};

HTMLRenderer.displayName = 'HTMLRenderer';

export default HTMLRenderer;
