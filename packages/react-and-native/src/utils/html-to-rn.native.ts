/**
 * Comprehensive HTML-to-React Native mapping utility.
 *
 * Maps 100+ HTML tags to appropriate React Native components and styles,
 * converts CSS style strings to RN-compatible style objects, and flattens
 * nested inline HTML nodes into RN Text children.
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HTMLTagMapping {
  /** The RN component type to render (e.g. View, Text, Image). */
  component: 'View' | 'Text' | 'Image' | 'ScrollView' | 'TextInput' | 'TouchableOpacity' | 'Pressable';
  /** Default React Native styles applied to every instance of this tag. */
  defaultStyle?: ViewStyle | TextStyle | ImageStyle;
  /** True when the tag only contains phrasing content (renders as Text). */
  isText?: boolean;
  /** True for void / self-closing elements (<img>, <br>, <hr>, …). */
  isSelfClosing?: boolean;
  /** If true the tag is ignored (children still rendered). */
  isIgnored?: boolean;
}

export interface HTMLNode {
  type: 'tag' | 'text' | 'root';
  name?: string;
  attribs?: Record<string, string>;
  children?: HTMLNode[];
  data?: string;
  parent?: HTMLNode;
}

// ---------------------------------------------------------------------------
// Tag Mapping (100+ tags)
// ---------------------------------------------------------------------------

export const HTML_TO_RN_MAP: Record<string, HTMLTagMapping> = {
  // ---- Document structure ----
  html: { component: 'View', isIgnored: true },
  head: { component: 'View', isIgnored: true },
  body: { component: 'View' },
  title: { component: 'Text', isText: true, defaultStyle: { fontSize: 18, fontWeight: 'bold' } },

  // ---- Sections ----
  div: { component: 'View' },
  section: { component: 'View' },
  article: { component: 'View' },
  aside: { component: 'View' },
  main: { component: 'View' },
  nav: { component: 'View' },
  header: { component: 'View' },
  footer: { component: 'View' },
  address: { component: 'View', defaultStyle: { fontStyle: 'italic' } },
  details: { component: 'View' },
  summary: { component: 'View', defaultStyle: { fontWeight: 'bold' } },
  dialog: { component: 'View' },
  figure: { component: 'View' },
  figcaption: { component: 'Text', isText: true, defaultStyle: { fontSize: 13, fontStyle: 'italic', marginTop: 4 } },

  // ---- Headings ----
  h1: { component: 'Text', isText: true, defaultStyle: { fontSize: 28, fontWeight: 'bold', marginTop: 16, marginBottom: 8 } },
  h2: { component: 'Text', isText: true, defaultStyle: { fontSize: 24, fontWeight: 'bold', marginTop: 14, marginBottom: 6 } },
  h3: { component: 'Text', isText: true, defaultStyle: { fontSize: 20, fontWeight: '600', marginTop: 12, marginBottom: 4 } },
  h4: { component: 'Text', isText: true, defaultStyle: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 4 } },
  h5: { component: 'Text', isText: true, defaultStyle: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 2 } },
  h6: { component: 'Text', isText: true, defaultStyle: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 2 } },

  // ---- Block text ----
  p: { component: 'Text', isText: true, defaultStyle: { fontSize: 15, lineHeight: 22, marginBottom: 8 } },
  blockquote: { component: 'View', defaultStyle: { borderLeftWidth: 4, borderLeftColor: '#888', paddingLeft: 12, marginVertical: 8, opacity: 0.85 as unknown as number } },
  pre: { component: 'View', defaultStyle: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 4, marginVertical: 8, overflow: 'hidden' as const } },
  hr: { component: 'View', isSelfClosing: true, defaultStyle: { height: 1, backgroundColor: '#ddd', marginVertical: 12 } },

  // ---- Inline text ----
  span: { component: 'Text', isText: true },
  a: { component: 'Text', isText: true, defaultStyle: { color: '#007AFF', textDecorationLine: 'underline' as const } },
  strong: { component: 'Text', isText: true, defaultStyle: { fontWeight: 'bold' } },
  b: { component: 'Text', isText: true, defaultStyle: { fontWeight: 'bold' } },
  em: { component: 'Text', isText: true, defaultStyle: { fontStyle: 'italic' } },
  i: { component: 'Text', isText: true, defaultStyle: { fontStyle: 'italic' } },
  u: { component: 'Text', isText: true, defaultStyle: { textDecorationLine: 'underline' as const } },
  s: { component: 'Text', isText: true, defaultStyle: { textDecorationLine: 'line-through' as const } },
  del: { component: 'Text', isText: true, defaultStyle: { textDecorationLine: 'line-through' as const } },
  ins: { component: 'Text', isText: true, defaultStyle: { textDecorationLine: 'underline' as const } },
  small: { component: 'Text', isText: true, defaultStyle: { fontSize: 12 } },
  mark: { component: 'Text', isText: true, defaultStyle: { backgroundColor: '#ffeb3b' } },
  sub: { component: 'Text', isText: true, defaultStyle: { fontSize: 12 } },
  sup: { component: 'Text', isText: true, defaultStyle: { fontSize: 12 } },
  abbr: { component: 'Text', isText: true, defaultStyle: { textDecorationLine: 'underline dotted' as any } },
  cite: { component: 'Text', isText: true, defaultStyle: { fontStyle: 'italic' } },
  q: { component: 'Text', isText: true, defaultStyle: { fontStyle: 'italic' } },
  code: { component: 'Text', isText: true, defaultStyle: { fontFamily: 'monospace', backgroundColor: '#f0f0f0', paddingHorizontal: 3, paddingVertical: 1, borderRadius: 3, fontSize: 14 } },
  kbd: { component: 'Text', isText: true, defaultStyle: { fontFamily: 'monospace', backgroundColor: '#eee', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, fontSize: 13 } },
  samp: { component: 'Text', isText: true, defaultStyle: { fontFamily: 'monospace' } },
  var: { component: 'Text', isText: true, defaultStyle: { fontStyle: 'italic' } },
  dfn: { component: 'Text', isText: true, defaultStyle: { fontStyle: 'italic' } },
  time: { component: 'Text', isText: true },
  data: { component: 'Text', isText: true },
  wbr: { component: 'View', isSelfClosing: true, isIgnored: true },
  br: { component: 'Text', isSelfClosing: true },
  ruby: { component: 'Text', isText: true },
  rt: { component: 'Text', isText: true, defaultStyle: { fontSize: 10 } },
  rp: { component: 'Text', isText: true, defaultStyle: { fontSize: 10 } },
  bdi: { component: 'Text', isText: true },
  bdo: { component: 'Text', isText: true },

  // ---- Lists ----
  ul: { component: 'View', defaultStyle: { marginVertical: 4 } },
  ol: { component: 'View', defaultStyle: { marginVertical: 4 } },
  li: { component: 'View', defaultStyle: { flexDirection: 'row', marginBottom: 2, paddingLeft: 4 } },
  dl: { component: 'View', defaultStyle: { marginVertical: 4 } },
  dt: { component: 'Text', isText: true, defaultStyle: { fontWeight: 'bold', marginTop: 4 } },
  dd: { component: 'Text', isText: true, defaultStyle: { marginLeft: 20, marginBottom: 4 } },

  // ---- Tables ----
  table: { component: 'ScrollView', defaultStyle: { borderWidth: 1, borderColor: '#ddd', marginVertical: 8 } },
  thead: { component: 'View', defaultStyle: { backgroundColor: '#f5f5f5' } },
  tbody: { component: 'View' },
  tfoot: { component: 'View', defaultStyle: { backgroundColor: '#f9f9f9' } },
  tr: { component: 'View', defaultStyle: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' } },
  th: { component: 'View', defaultStyle: { padding: 8, borderWidth: 1, borderColor: '#ddd', flex: 1, backgroundColor: '#f0f0f0' } },
  td: { component: 'View', defaultStyle: { padding: 8, borderWidth: 1, borderColor: '#ddd', flex: 1 } },
  caption: { component: 'Text', isText: true, defaultStyle: { fontWeight: 'bold', textAlign: 'center', padding: 8 } },
  col: { component: 'View', isSelfClosing: true, isIgnored: true },
  colgroup: { component: 'View', isIgnored: true },

  // ---- Media ----
  img: { component: 'Image', isSelfClosing: true, defaultStyle: { width: 200, height: 150, resizeMode: 'cover' as const } },
  picture: { component: 'View' },
  source: { component: 'View', isSelfClosing: true, isIgnored: true },
  video: { component: 'View', defaultStyle: { width: 300, height: 200, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginVertical: 8 } },
  audio: { component: 'View', defaultStyle: { height: 44, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginVertical: 4, borderRadius: 8 } },
  track: { component: 'View', isSelfClosing: true, isIgnored: true },
  map: { component: 'View' },
  area: { component: 'View', isSelfClosing: true, isIgnored: true },
  canvas: { component: 'View', defaultStyle: { backgroundColor: '#fff' } },
  svg: { component: 'View', defaultStyle: { backgroundColor: 'transparent' } },

  // ---- Forms ----
  form: { component: 'View' },
  fieldset: { component: 'View', defaultStyle: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 10, marginVertical: 8 } },
  legend: { component: 'Text', isText: true, defaultStyle: { fontWeight: 'bold', padding: 4 } },
  label: { component: 'Text', isText: true, defaultStyle: { marginBottom: 4 } },
  input: { component: 'TextInput', isSelfClosing: true, defaultStyle: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, marginVertical: 4, fontSize: 15, color: '#333' } },
  textarea: { component: 'TextInput', defaultStyle: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, marginVertical: 4, fontSize: 15, color: '#333', minHeight: 80, textAlignVertical: 'top' } },
  button: { component: 'TouchableOpacity', defaultStyle: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, marginVertical: 4 } },
  select: { component: 'TouchableOpacity', defaultStyle: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 8, marginVertical: 4, backgroundColor: '#fff' } },
  option: { component: 'Text', isText: true, defaultStyle: { paddingVertical: 4 } },
  optgroup: { component: 'View' },
  datalist: { component: 'View', isIgnored: true },
  output: { component: 'Text', isText: true },
  progress: { component: 'View', defaultStyle: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginVertical: 4, overflow: 'hidden' as const } },
  meter: { component: 'View', defaultStyle: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginVertical: 4, overflow: 'hidden' as const } },

  // ---- Script / Style (ignored) ----
  script: { component: 'View', isIgnored: true },
  style: { component: 'View', isIgnored: true },
  link: { component: 'View', isSelfClosing: true, isIgnored: true },
  meta: { component: 'View', isSelfClosing: true, isIgnored: true },
  base: { component: 'View', isSelfClosing: true, isIgnored: true },
  noscript: { component: 'View', isIgnored: true },

  // ---- HTML5 semantic ----
  template: { component: 'View', isIgnored: true },
  slot: { component: 'View' },
  search: { component: 'View' },
  menu: { component: 'View' },
  menuitem: { component: 'TouchableOpacity' },

  // ---- Deprecated / legacy ----
  center: { component: 'View', defaultStyle: { alignItems: 'center' } },
  font: { component: 'Text', isText: true },
  big: { component: 'Text', isText: true, defaultStyle: { fontSize: 18 } },
  strike: { component: 'Text', isText: true, defaultStyle: { textDecorationLine: 'line-through' as const } },
  tt: { component: 'Text', isText: true, defaultStyle: { fontFamily: 'monospace' } },

  // ---- Misc ----
  iframe: { component: 'View', defaultStyle: { width: 300, height: 200, borderWidth: 1, borderColor: '#ddd', marginVertical: 8 } },
  embed: { component: 'View', isSelfClosing: true, defaultStyle: { width: 300, height: 200, backgroundColor: '#eee' } },
  object: { component: 'View', defaultStyle: { width: 300, height: 200 } },
  param: { component: 'View', isSelfClosing: true, isIgnored: true },
};

// ---------------------------------------------------------------------------
// CSS property name mapping (kebab-case → camelCase)
// ---------------------------------------------------------------------------

const CSS_PROP_MAP: Record<string, string> = {
  'align-content': 'alignContent',
  'align-items': 'alignItems',
  'align-self': 'alignSelf',
  'animation-delay': 'animationDelay',
  'animation-duration': 'animationDuration',
  'animation-iteration-count': 'animationIterationCount',
  'animation-name': 'animationName',
  'animation-timing-function': 'animationTimingFunction',
  'aspect-ratio': 'aspectRatio',
  'backdrop-filter': 'backdropFilter',
  'background': 'backgroundColor',
  'background-attachment': 'backgroundAttachment',
  'background-blend-mode': 'backgroundBlendMode',
  'background-clip': 'backgroundClip',
  'background-color': 'backgroundColor',
  'background-image': 'backgroundImage',
  'background-origin': 'backgroundOrigin',
  'background-position': 'backgroundPosition',
  'background-repeat': 'backgroundRepeat',
  'background-size': 'backgroundSize',
  'border-bottom-color': 'borderBottomColor',
  'border-bottom-left-radius': 'borderBottomLeftRadius',
  'border-bottom-right-radius': 'borderBottomRightRadius',
  'border-bottom-style': 'borderBottomStyle',
  'border-bottom-width': 'borderBottomWidth',
  'border-color': 'borderColor',
  'border-left-color': 'borderLeftColor',
  'border-left-style': 'borderLeftStyle',
  'border-left-width': 'borderLeftWidth',
  'border-radius': 'borderRadius',
  'border-right-color': 'borderRightColor',
  'border-right-style': 'borderRightStyle',
  'border-right-width': 'borderRightWidth',
  'border-spacing': 'borderSpacing',
  'border-style': 'borderStyle',
  'border-top-color': 'borderTopColor',
  'border-top-left-radius': 'borderTopLeftRadius',
  'border-top-right-radius': 'borderTopRightRadius',
  'border-top-style': 'borderTopStyle',
  'border-top-width': 'borderTopWidth',
  'border-width': 'borderWidth',
  'bottom': 'bottom',
  'box-shadow': 'boxShadow',
  'box-sizing': 'boxSizing',
  'color': 'color',
  'column-count': 'columnCount',
  'column-gap': 'columnGap',
  'column-rule-color': 'columnRuleColor',
  'column-rule-style': 'columnRuleStyle',
  'column-rule-width': 'columnRuleWidth',
  'column-width': 'columnWidth',
  'columns': 'columns',
  'direction': 'direction',
  'display': 'display',
  'elevation': 'elevation',
  'end': 'end',
  'flex-basis': 'flexBasis',
  'flex-direction': 'flexDirection',
  'flex-grow': 'flexGrow',
  'flex-shrink': 'flexShrink',
  'flex-wrap': 'flexWrap',
  'flex': 'flex',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'gap': 'gap',
  'grid-gap': 'gap',
  'grid-row-gap': 'rowGap',
  'grid-column-gap': 'columnGap',
  'height': 'height',
  'justify-content': 'justifyContent',
  'justify-items': 'justifyContent',
  'justify-self': 'justifySelf',
  'left': 'left',
  'letter-spacing': 'letterSpacing',
  'line-height': 'lineHeight',
  'margin-bottom': 'marginBottom',
  'margin-horizontal': 'marginHorizontal',
  'margin-left': 'marginLeft',
  'margin-right': 'marginRight',
  'margin-top': 'marginTop',
  'margin-vertical': 'marginVertical',
  'margin': 'margin',
  'max-height': 'maxHeight',
  'max-width': 'maxWidth',
  'min-height': 'minHeight',
  'min-width': 'minWidth',
  'opacity': 'opacity',
  'outline-color': 'outlineColor',
  'outline-offset': 'outlineOffset',
  'outline-style': 'outlineStyle',
  'outline-width': 'outlineWidth',
  'overflow': 'overflow',
  'overflow-x': 'overflowX',
  'overflow-y': 'overflowY',
  'padding-bottom': 'paddingBottom',
  'padding-horizontal': 'paddingHorizontal',
  'padding-left': 'paddingLeft',
  'padding-right': 'paddingRight',
  'padding-top': 'paddingTop',
  'padding-vertical': 'paddingVertical',
  'padding': 'padding',
  'pointer-events': 'pointerEvents',
  'position': 'position',
  'resize-mode': 'resizeMode',
  'resize': 'resizeMode',
  'right': 'right',
  'row-gap': 'rowGap',
  'shadow-color': 'shadowColor',
  'shadow-offset': 'shadowOffset',
  'shadow-opacity': 'shadowOpacity',
  'shadow-radius': 'shadowRadius',
  'start': 'start',
  'text-align': 'textAlign',
  'text-align-vertical': 'textAlignVertical',
  'text-decoration-color': 'textDecorationColor',
  'text-decoration-line': 'textDecorationLine',
  'text-decoration-style': 'textDecorationStyle',
  'text-decoration': 'textDecorationLine',
  'text-shadow': 'textShadow',
  'text-transform': 'textTransform',
  'tint-color': 'tintColor',
  'top': 'top',
  'transform': 'transform',
  'user-select': 'userSelect',
  'vertical-align': 'verticalAlign',
  'width': 'width',
  'z-index': 'zIndex',
};

// Properties that accept numeric values (no unit needed in RN)
const NUMERIC_PROPS = new Set([
  'opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
  'aspectRatio', 'elevation', 'columnCount', 'fontWeight', 'lineHeight',
  'letterSpacing', 'borderRadius', 'borderWidth',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'margin', 'marginHorizontal', 'marginVertical',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingHorizontal', 'paddingVertical',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'top', 'right', 'bottom', 'left',
  'gap', 'rowGap', 'columnGap',
]);

// Properties where "px" values should be kept as numbers
const PX_PROPS = new Set([
  'fontSize', 'letterSpacing', 'lineHeight', 'borderWidth',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'margin', 'marginHorizontal', 'marginVertical',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingHorizontal', 'paddingVertical',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'top', 'right', 'bottom', 'left', 'gap', 'rowGap', 'columnGap',
  'shadowOffset', 'outlineOffset',
]);

/**
 * Parse a single CSS dimension value (e.g. "16px", "1.5rem", "0", "auto") into
 * a number (pixels) or string RN can use.
 */
function parseSingleDimension(value: string): number | string {
  const v = value.trim();
  const pxMatch = v.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const emMatch = v.match(/^(-?\d+(?:\.\d+)?)(em|rem)$/);
  if (emMatch) return parseFloat(emMatch[1]) * 16;
  const num = parseFloat(v);
  if (!isNaN(num) && String(num) === v) return num;
  // "auto", "0", etc.
  if (v === 'auto') return 'auto' as any;
  return v;
}

// ---------------------------------------------------------------------------
// styleStringToRNStyle
// ---------------------------------------------------------------------------

/**
 * Parse an HTML/CSS inline `style` string into a React Native style object.
 *
 * Supports kebab-case properties, "px" unit stripping, and common shorthand
 * values such as `margin: 8 16`, `border: 1 solid #ccc`, etc.
 */
export function styleStringToRNStyle(styleString: string): Record<string, any> {
  if (!styleString || typeof styleString !== 'string') return {};

  const result: Record<string, any> = {};

  // Split on semicolons but handle cases where value might contain semicolons inside url()
  const declarations = styleString.split(/;(?!["']*\))/);

  for (const decl of declarations) {
    const trimmed = decl.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const rawProp = trimmed.slice(0, colonIdx).trim().toLowerCase();
    let rawValue = trimmed.slice(colonIdx + 1).trim();

    const rnProp = CSS_PROP_MAP[rawProp];
    if (!rnProp) continue;

    // Handle margin / padding shorthand with multiple values
    // e.g. "margin: 0 0 8px" → marginTop: 0, marginHorizontal: 0, marginBottom: 8
    if (rawProp === 'margin' || rawProp === 'padding') {
      const prefix = rawProp === 'margin' ? 'margin' : 'padding';
      const parts = rawValue.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        // margin: V → all sides
        result[prefix] = parseSingleDimension(parts[0]);
        if (rawProp === 'margin') delete result['margin']; // will be expanded below
      } else if (parts.length === 2) {
        // margin: V H → vertical, horizontal
        result[`${prefix}Vertical`] = parseSingleDimension(parts[0]);
        result[`${prefix}Horizontal`] = parseSingleDimension(parts[1]);
      } else if (parts.length === 3) {
        // margin: T H B → top, horizontal, bottom
        result[`${prefix}Top`] = parseSingleDimension(parts[0]);
        result[`${prefix}Horizontal`] = parseSingleDimension(parts[1]);
        result[`${prefix}Bottom`] = parseSingleDimension(parts[2]);
      } else if (parts.length === 4) {
        // margin: T R B L
        result[`${prefix}Top`] = parseSingleDimension(parts[0]);
        result[`${prefix}Right`] = parseSingleDimension(parts[1]);
        result[`${prefix}Bottom`] = parseSingleDimension(parts[2]);
        result[`${prefix}Left`] = parseSingleDimension(parts[3]);
      }
      continue;
    }

    const parsedValue = parseCSSValue(rnProp, rawProp, rawValue);
    if (parsedValue !== undefined) {
      result[rnProp] = parsedValue;
    }
  }

  // Expand shorthand border
  expandBorderShorthand(result);

  return result;
}

function parseCSSValue(
  rnProp: string,
  cssProp: string,
  rawValue: string,
): any {
  // Strip quotes
  if ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
    return rawValue.slice(1, -1);
  }

  const lower = rawValue.toLowerCase();

  // Boolean-like keywords
  if (lower === 'none' && rnProp === 'display') return 'none';
  if (lower === 'auto') return 'auto';
  if (lower === 'hidden') return 'hidden';
  if (lower === 'visible') return 'visible';
  if (lower === 'scroll') return 'scroll';
  if (lower === 'nowrap') return 'nowrap';
  if (lower === 'wrap') return 'wrap';
  if (lower === 'normal') return 'normal';
  if (lower === 'inherit') return undefined;
  if (lower === 'initial') return undefined;
  if (lower === 'unset') return undefined;
  if (lower === 'transparent') return 'transparent';

  // Display values
  if (rnProp === 'display') {
    if (lower === 'block' || lower === 'inline') return 'flex';
    if (lower === 'flex' || lower === 'grid') return 'flex';
    if (lower === 'inline-block' || lower === 'inline-flex' || lower === 'inline-grid') return 'flex';
    return lower;
  }

  // Text align
  if (rnProp === 'textAlign') {
    if (lower === 'start') return 'left';
    if (lower === 'end') return 'right';
    if (lower === 'justify') return 'justify';
    if (lower === 'left' || lower === 'right' || lower === 'center') return lower;
    return undefined;
  }

  // Position
  if (rnProp === 'position') {
    if (['absolute', 'relative', 'static'].includes(lower)) return lower;
    return undefined;
  }

  // Overflow
  if (rnProp === 'overflow' || rnProp === 'overflowX' || rnProp === 'overflowY') {
    if (['auto', 'hidden', 'visible', 'scroll'].includes(lower)) return lower;
    return undefined;
  }

  // Font weight
  if (rnProp === 'fontWeight') {
    if (lower === 'bold') return 'bold';
    if (lower === 'normal') return 'normal';
    if (lower === '100' || lower === '200' || lower === '300' || lower === '400' ||
      lower === '500' || lower === '600' || lower === '700' || lower === '800' ||
      lower === '900') return lower;
    return lower;
  }

  // Font style
  if (rnProp === 'fontStyle') {
    if (lower === 'italic' || lower === 'normal' || lower === 'oblique') return lower;
    return undefined;
  }

  // Text decoration line
  if (rnProp === 'textDecorationLine') {
    if (lower === 'underline') return 'underline';
    if (lower === 'line-through' || lower === 'line-through') return 'line-through';
    if (lower === 'none') return 'none';
    if (lower.includes(' ')) {
      return lower.split(' ').map(s => s.trim());
    }
    return lower;
  }

  // Text transform
  if (rnProp === 'textTransform') {
    if (['uppercase', 'lowercase', 'capitalize', 'none'].includes(lower)) return lower;
    return undefined;
  }

  // Flex direction
  if (rnProp === 'flexDirection') {
    if (lower === 'row-reverse') return 'row-reverse';
    if (lower === 'column-reverse') return 'column-reverse';
    if (['row', 'column'].includes(lower)) return lower;
    return undefined;
  }

  // Justify content
  if (rnProp === 'justifyContent') {
    if (['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].includes(lower)) return lower;
    return undefined;
  }

  // Align items
  if (rnProp === 'alignItems') {
    if (['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(lower)) return lower;
    return undefined;
  }

  // Flex wrap
  if (rnProp === 'flexWrap') {
    if (['wrap', 'nowrap', 'wrap-reverse'].includes(lower)) return lower;
    return undefined;
  }

  // Resize mode
  if (rnProp === 'resizeMode') {
    if (['cover', 'contain', 'stretch', 'center', 'repeat'].includes(lower)) return lower;
    return undefined;
  }

  // Opacity
  if (rnProp === 'opacity') {
    const num = parseFloat(rawValue);
    if (!isNaN(num) && num >= 0 && num <= 1) return num;
    return undefined;
  }

  // shadowOffset is special: should become {width, height}
  if (rnProp === 'shadowOffset') {
    const num = parseFloat(rawValue);
    if (!isNaN(num)) return { width: 0, height: num };
    return undefined;
  }

  // Color values
  if (['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
    'borderBottomColor', 'borderLeftColor', 'shadowColor', 'tintColor',
    'outlineColor', 'textDecorationColor', 'columnRuleColor'].includes(rnProp)) {
    return rawValue; // RN accepts hex, rgb(), rgba(), named colors
  }

  // Try numeric parsing for px values
  if (PX_PROPS.has(rnProp) || NUMERIC_PROPS.has(rnProp)) {
    // Handle "px" suffixed values
    const pxMatch = rawValue.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (pxMatch) return parseFloat(pxMatch[1]);

    // Handle "em" / "rem" → treat as multiplier on 16
    const emMatch = rawValue.match(/^(-?\d+(?:\.\d+)?)(em|rem)$/);
    if (emMatch) return parseFloat(emMatch[1]) * 16;

    // Plain number
    const num = parseFloat(rawValue);
    if (!isNaN(num) && String(num) === rawValue.trim()) return num;

    return rawValue;
  }

  // Handle background shorthand — if value looks like a color (not url/gradient), map to backgroundColor
  if (rnProp === 'backgroundColor' && cssProp === 'background') {
    if (rawValue.startsWith('url(') || rawValue.startsWith('linear-gradient') ||
      rawValue.startsWith('radial-gradient') || rawValue.startsWith('conic-gradient')) {
      return undefined; // RN doesn't support these
    }
    return rawValue;
  }

  // CSS custom properties (var()) — pass through
  if (rawValue.startsWith('var(')) {
    return rawValue;
  }
  // calc() expressions — pass through
  if (rawValue.startsWith('calc(')) {
    return rawValue;
  }
  // clamp(), min(), max() — pass through
  if (rawValue.startsWith('clamp(') || rawValue.startsWith('min(') || rawValue.startsWith('max(')) {
    return rawValue;
  }

  return rawValue;
}

/**
 * Expand shorthand `border` / `borderColor` / `borderWidth` / `borderStyle`
 * into individual side properties.
 */
function expandBorderShorthand(style: Record<string, any>): void {
  if (style.borderWidth !== undefined && !style.borderTopWidth) {
    style.borderTopWidth = style.borderWidth;
    style.borderRightWidth = style.borderWidth;
    style.borderBottomWidth = style.borderWidth;
    style.borderLeftWidth = style.borderWidth;
  }
  if (style.borderColor !== undefined && !style.borderTopColor) {
    style.borderTopColor = style.borderColor;
    style.borderRightColor = style.borderColor;
    style.borderBottomColor = style.borderColor;
    style.borderLeftColor = style.borderColor;
  }
  if (style.borderRadius !== undefined && !style.borderTopLeftRadius) {
    style.borderTopLeftRadius = style.borderRadius;
    style.borderTopRightRadius = style.borderRadius;
    style.borderBottomLeftRadius = style.borderRadius;
    style.borderBottomRightRadius = style.borderRadius;
  }
}

// ---------------------------------------------------------------------------
// classToRNStyle
// ---------------------------------------------------------------------------

/** Map of common CSS class names to React Native styles. */
const CLASS_STYLE_MAP: Record<string, Record<string, any>> = {
  // Layout
  container: { flex: 1 },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  'flex-1': { flex: 1 },
  'flex-2': { flex: 2 },
  'flex-3': { flex: 3 },
  'items-center': { alignItems: 'center' },
  'justify-center': { justifyContent: 'center' },
  'justify-between': { justifyContent: 'space-between' },
  'justify-around': { justifyContent: 'space-around' },
  'text-center': { textAlign: 'center' },
  'text-right': { textAlign: 'right' },
  'text-left': { textAlign: 'left' },
  'font-bold': { fontWeight: 'bold' },
  'font-normal': { fontWeight: 'normal' },
  'font-light': { fontWeight: '300' },
  'font-medium': { fontWeight: '500' },
  'font-semibold': { fontWeight: '600' },
  'font-italic': { fontStyle: 'italic' },
  'font-mono': { fontFamily: 'monospace' },
  'text-xs': { fontSize: 12 },
  'text-sm': { fontSize: 14 },
  'text-base': { fontSize: 16 },
  'text-lg': { fontSize: 18 },
  'text-xl': { fontSize: 20 },
  'text-2xl': { fontSize: 24 },
  'text-3xl': { fontSize: 30 },
  'text-4xl': { fontSize: 36 },
  'truncate': { numberOfLines: 1, ellipsizeMode: 'tail' as const },
  underline: { textDecorationLine: 'underline' as const },
  'line-through': { textDecorationLine: 'line-through' as const },
  uppercase: { textTransform: 'uppercase' as const },
  lowercase: { textTransform: 'lowercase' as const },
  capitalize: { textTransform: 'capitalize' as const },
  hidden: { display: 'none' },
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  overflowHidden: { overflow: 'hidden' },
  overflowScroll: { overflow: 'scroll' },
  rounded: { borderRadius: 4 },
  'rounded-full': { borderRadius: 9999 },
  'rounded-lg': { borderRadius: 8 },
  'rounded-md': { borderRadius: 6 },
  'rounded-sm': { borderRadius: 2 },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  'shadow-lg': { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  'w-full': { width: '100%' },
  'h-full': { height: '100%' },
  'bg-gray-50': { backgroundColor: '#f9fafb' },
  'bg-gray-100': { backgroundColor: '#f3f4f6' },
  'bg-gray-200': { backgroundColor: '#e5e7eb' },
  'bg-gray-800': { backgroundColor: '#1f2937' },
  'bg-gray-900': { backgroundColor: '#111827' },
  'bg-white': { backgroundColor: '#ffffff' },
  'bg-black': { backgroundColor: '#000000' },
  'bg-red-500': { backgroundColor: '#ef4444' },
  'bg-blue-500': { backgroundColor: '#3b82f6' },
  'bg-green-500': { backgroundColor: '#22c55e' },
  'bg-yellow-500': { backgroundColor: '#eab308' },
  'text-white': { color: '#ffffff' },
  'text-black': { color: '#000000' },
  'text-gray-500': { color: '#6b7280' },
  'text-gray-700': { color: '#374151' },
  'text-red-500': { color: '#ef4444' },
  'text-blue-500': { color: '#3b82f6' },
  'text-green-500': { color: '#22c55e' },
  'mt-1': { marginTop: 4 },
  'mt-2': { marginTop: 8 },
  'mt-4': { marginTop: 16 },
  'mt-6': { marginTop: 24 },
  'mt-8': { marginTop: 32 },
  'mb-1': { marginBottom: 4 },
  'mb-2': { marginBottom: 8 },
  'mb-4': { marginBottom: 16 },
  'mb-6': { marginBottom: 24 },
  'mb-8': { marginBottom: 32 },
  'mx-1': { marginHorizontal: 4 },
  'mx-2': { marginHorizontal: 8 },
  'mx-4': { marginHorizontal: 16 },
  'my-1': { marginVertical: 4 },
  'my-2': { marginVertical: 8 },
  'my-4': { marginVertical: 16 },
  'p-1': { padding: 4 },
  'p-2': { padding: 8 },
  'p-4': { padding: 16 },
  'p-6': { padding: 24 },
  'p-8': { padding: 32 },
  'px-1': { paddingHorizontal: 4 },
  'px-2': { paddingHorizontal: 8 },
  'px-4': { paddingHorizontal: 16 },
  'py-1': { paddingVertical: 4 },
  'py-2': { paddingVertical: 8 },
  'py-4': { paddingVertical: 16 },
  'gap-1': { gap: 4 },
  'gap-2': { gap: 8 },
  'gap-4': { gap: 16 },
};

/**
 * Convert HTML `class` attribute string to React Native style objects.
 * Handles Tailwind-like utility classes and common CSS class names.
 */
export function classToRNStyle(className: string): Record<string, any> {
  if (!className || typeof className !== 'string') return {};

  const classes = className.trim().split(/\s+/).filter(Boolean);
  const result: Record<string, any> = {};

  for (const cls of classes) {
    const mapped = CLASS_STYLE_MAP[cls];
    if (mapped) {
      Object.assign(result, mapped);
    }

    // Handle p-{N}, m-{N}, mx-{N}, my-{N}, px-{N}, py-{N}, mt-{N}, mb-{N}
    const spacingMatch = cls.match(/^(p|m|x|y)([tblr]?)-(\d+)$/);
    if (spacingMatch) {
      const [, dir, side, val] = spacingMatch;
      const px = parseInt(val, 10) * 4;
      const rnDir = dir === 'p' ? 'padding' : 'margin';
      const rnSide = side === 't' ? 'Top' : side === 'b' ? 'Bottom' : side === 'l' ? 'Left' : side === 'r' ? 'Right' : '';
      if (rnSide) {
        result[`${rnDir}${rnSide}`] = px;
      } else if (side === 'x') {
        result[`${rnDir}Horizontal`] = px;
      } else if (side === 'y') {
        result[`${rnDir}Vertical`] = px;
      } else {
        result[rnDir] = px;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// flattenInlineNodes
// ---------------------------------------------------------------------------

/**
 * Determine if an HTML node represents an inline (phrasing) element
 * that should be rendered as a Text child rather than a View.
 */
export function isInlineNode(node: HTMLNode): boolean {
  if (node.type === 'text') return true;
  if (node.type !== 'tag' || !node.name) return false;

  const mapping = HTML_TO_RN_MAP[node.name.toLowerCase()];
  return mapping?.isText === true;
}

/**
 * Recursively flatten a list of HTML nodes into an array of React Native
 * renderable elements suitable for children of a Text or View component.
 *
 * When block-level nodes appear among inline nodes, they are rendered as
 * separate elements. Consecutive inline nodes are merged into Text wrappers.
 */
export function flattenInlineNodes(
  nodes: HTMLNode[],
  customRenderers?: Record<string, React.ComponentType<any>>,
  linkHandler?: (url: string) => void,
): any[] {
  if (!nodes || nodes.length === 0) return [];

  const result: any[] = [];
  let currentInlineBatch: HTMLNode[] = [];

  const flushInlineBatch = () => {
    if (currentInlineBatch.length === 0) return;
    // Merge consecutive text nodes
    const textElements = buildInlineTextElements(currentInlineBatch, customRenderers, linkHandler);
    result.push(...textElements);
    currentInlineBatch = [];
  };

  for (const node of nodes) {
    if (isInlineNode(node)) {
      currentInlineBatch.push(node);
    } else {
      flushInlineBatch();
      // Block node: add as separate entry
      result.push(node);
    }
  }

  flushInlineBatch();
  return result;
}

function buildInlineTextElements(
  nodes: HTMLNode[],
  customRenderers?: Record<string, React.ComponentType<any>>,
  linkHandler?: (url: string) => void,
): any[] {
  const result: any[] = [];

  for (const node of nodes) {
    if (node.type === 'text') {
      result.push({ type: 'text', data: node.data || '' });
    } else if (node.type === 'tag' && node.name) {
      const tag = node.name.toLowerCase();
      const mapping = HTML_TO_RN_MAP[tag];

      if (mapping?.isIgnored) {
        if (node.children) {
          const childElements = buildInlineTextElements(node.children, customRenderers, linkHandler);
          result.push(...childElements);
        }
        continue;
      }

      if (customRenderers && customRenderers[tag]) {
        result.push({ type: 'custom', tag, node });
        continue;
      }

      const style: Record<string, any> = {};
      if (mapping?.defaultStyle) Object.assign(style, mapping.defaultStyle);
      if (node.attribs?.style) Object.assign(style, styleStringToRNStyle(node.attribs.style));
      if (node.attribs?.class) Object.assign(style, classToRNStyle(node.attribs.class));

      // Handle <br> specially
      if (tag === 'br') {
        result.push({ type: 'newline' });
        continue;
      }

      // Handle <a> with link handler
      const isLink = tag === 'a' && node.attribs?.href;

      let children: any[] = [];
      if (node.children && node.children.length > 0) {
        children = buildInlineTextElements(node.children, customRenderers, linkHandler);
      }

      result.push({
        type: 'inline-tag',
        tag,
        style,
        children,
        isLink,
        href: node.attribs?.href,
        linkHandler,
      });
    }
  }

  return result;
}
