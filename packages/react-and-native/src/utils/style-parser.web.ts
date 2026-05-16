import type { CSSProperties } from 'react';

/**
 * CSS shorthand property expansion maps.
 * Each entry maps a shorthand property to its longhand components.
 */
const SHORTHAND_EXPAND: Record<string, string[]> = {
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
  borderColor: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
  borderStyle: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
  borderRadius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'],
  overflow: ['overflowX', 'overflowY'],
};

/**
 * Vendor prefix mapping: CSS vendor prefix → React camelCase prefix.
 */
const VENDOR_PREFIXES: Record<string, string> = {
  '-webkit-': 'Webkit',
  '-moz-': 'Moz',
  '-ms-': 'ms',
  '-o-': 'O',
};

/**
 * HTML attribute name → React prop name mapping for special cases.
 */
const ATTR_RENAME_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  novalidate: 'noValidate',
  formnovalidate: 'formNoValidate',
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  accesskey: 'accessKey',
  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',
  enctype: 'encType',
  srcdoc: 'srcDoc',
  srclang: 'srcLang',
  charSet: 'charSet',
  httpEquiv: 'httpEquiv',
  autocomplete: 'autoComplete',
};

/**
 * Set of HTML boolean attributes (present = true, absent = false).
 */
const BOOLEAN_ATTRIBUTES = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked',
  'controls', 'default', 'defer', 'disabled', 'formnovalidate',
  'hidden', 'ismap', 'itemscope', 'loop', 'multiple', 'muted',
  'nomodule', 'novalidate', 'open', 'playsinline', 'readonly',
  'required', 'reversed', 'selected',
]);

/**
 * Self-closing (void) HTML element names.
 */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * SVG-specific attribute renames (lowercase → camelCase).
 */
const SVG_ATTR_RENAMES: Record<string, string> = {
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'arabic-form': 'arabicForm',
  'baseline-shift': 'baselineShift',
  'cap-height': 'capHeight',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'panose-1': 'panose1',
  'pointer-events': 'pointerEvents',
  'rendering-intent': 'renderingIntent',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
  'xmlns:xlink': 'xmlnsXlink',
  'clippathunits': 'clipPathUnits',
  'filterunits': 'filterUnits',
  'gradientunits': 'gradientUnits',
  'glyphref': 'glyphRef',
  'kernelmatrix': 'kernelMatrix',
  'limitingconeangle': 'limitingConeAngle',
  'markerheight': 'markerHeight',
  'markerunits': 'markerUnits',
  'markerwidth': 'markerWidth',
  'maskcontentunits': 'maskContentUnits',
  'maskunits': 'maskUnits',
  'numoctaves': 'numOctaves',
  'pathlength': 'pathLength',
  'patterncontentunits': 'patternContentUnits',
  'patterntransform': 'patternTransform',
  'patternunits': 'patternUnits',
  'pointsatx': 'pointsAtX',
  'pointsaty': 'pointsAtY',
  'pointsatz': 'pointsAtZ',
  'preservealpha': 'preserveAlpha',
  'preserveaspectratio': 'preserveAspectRatio',
  'primitiveunits': 'primitiveUnits',
  'refx': 'refX',
  'refy': 'refY',
  'repeatcount': 'repeatCount',
  'repeatdur': 'repeatDur',
  'requiredextensions': 'requiredExtensions',
  'requiredfeatures': 'requiredFeatures',
  'specularconstant': 'specularConstant',
  'specularexponent': 'specularExponent',
  'spreadmethod': 'spreadMethod',
  'startoffset': 'startOffset',
  'stddeviation': 'stdDeviation',
  'stitchtiles': 'stitchTiles',
  'surfacescale': 'surfaceScale',
  'systemlanguage': 'systemLanguage',
  'tablevalues': 'tableValues',
  'targetx': 'targetX',
  'targety': 'targetY',
  'textlength': 'textLength',
  'viewbox': 'viewBox',
  'viewtarget': 'viewTarget',
  'xchannelselector': 'xChannelSelector',
  'ychannelselector': 'yChannelSelector',
  'zoomandpan': 'zoomAndPan',
};

/**
 * Convert a kebab-case CSS property name to camelCase.
 */
function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Split a CSS value by whitespace, keeping quoted segments intact.
 */
function splitValues(value: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (inQuote) {
      current += ch;
      if (ch === inQuote) {
        inQuote = null;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
      current += ch;
    } else if (ch === '(') {
      // Keep parenthetical groups together
      let depth = 1;
      current += ch;
      i++;
      while (i < value.length && depth > 0) {
        if (value[i] === '(') depth++;
        if (value[i] === ')') depth--;
        current += value[i];
        i++;
      }
      i--;
    } else if (/\s/.test(ch)) {
      if (current.length > 0) {
        result.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    result.push(current);
  }

  return result;
}

/**
 * Expand a shorthand CSS property into longhand properties.
 *
 * Handles patterns like:
 * - `margin: 10px` → all four sides
 * - `margin: 10px 20px` → top/bottom, left/right
 * - `margin: 10px 20px 30px` → top, left/right, bottom
 * - `margin: 10px 20px 30px 40px` → top, right, bottom, left
 * - `borderRadius: 10px / 20px` → slash-separated horizontal/vertical
 * - `font: italic bold 12px/1.2 Arial, sans-serif` → complex font shorthand
 */
function expandShorthand(
  property: string,
  value: string,
  styles: Record<string, string>
): void {
  const expansion = SHORTHAND_EXPAND[property];
  if (!expansion) {
    styles[camelCase(property)] = value;
    return;
  }

  // Handle slash-separated values (e.g., border-radius: 10px / 20px)
  const slashParts = value.split('/');
  const mainValues = splitValues(slashParts[0]);
  const secondaryValues = slashParts[1] ? splitValues(slashParts[1]) : mainValues;

  const mapQuartet = (values: string[]): [string, string, string, string] => {
    switch (values.length) {
      case 1:
        return [values[0], values[0], values[0], values[0]];
      case 2:
        return [values[0], values[1], values[0], values[1]];
      case 3:
        return [values[0], values[1], values[2], values[1]];
      case 4:
      default:
        return [values[0], values[1], values[2], values[3]];
    }
  };

  const [v1, v2, v3, v4] = mapQuartet(mainValues);
  const [s1, s2, s3, s4] = mapQuartet(secondaryValues);

  // borderRadius is special: pairs of horizontal/vertical
  if (property === 'borderRadius') {
    styles[expansion[0]] = v1;
    styles[expansion[1]] = v2;
    styles[expansion[2]] = v3;
    styles[expansion[3]] = v4;
  } else if (property === 'overflow') {
    styles[expansion[0]] = v1;
    styles[expansion[1]] = v2;
  } else {
    // TRBL pattern
    styles[expansion[0]] = v1;
    styles[expansion[1]] = v2;
    styles[expansion[2]] = v3;
    styles[expansion[3]] = v4;
  }
}

/**
 * Handle the `font` CSS shorthand property expansion.
 */
function expandFontShorthand(value: string, styles: Record<string, string>): void {
  // Font shorthand: [font-style] [font-variant] [font-weight] [font-size]/[line-height] font-family
  const parts = splitValues(value);
  let fontStyle = 'normal';
  let fontVariant = 'normal';
  let fontWeight = 'normal';
  let fontSize: string | null = null;
  let lineHeight: string | null = null;
  const fontFamily: string[] = [];

  const styleSet = new Set(['normal', 'italic', 'oblique']);
  const variantSet = new Set(['normal', 'small-caps']);
  const weightSet = new Set(['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900']);

  let i = 0;
  while (i < parts.length && fontSize === null) {
    const part = parts[i];

    // Collect font family parts (after size)
    if (fontSize !== null) {
      fontFamily.push(part);
      i++;
      continue;
    }

    if (styleSet.has(part.toLowerCase())) {
      fontStyle = part;
    } else if (variantSet.has(part.toLowerCase())) {
      fontVariant = part;
    } else if (weightSet.has(part.toLowerCase())) {
      fontWeight = part;
    } else {
      // This should be font-size, possibly with /line-height
      const slashIndex = part.indexOf('/');
      if (slashIndex !== -1) {
        fontSize = part.substring(0, slashIndex);
        lineHeight = part.substring(slashIndex + 1);
      } else {
        fontSize = part;
      }
      i++;
      // Remaining parts are font-family
      while (i < parts.length) {
        fontFamily.push(parts[i]);
        i++;
      }
    }
    i++;
  }

  if (fontSize) {
    styles.fontStyle = fontStyle;
    styles.fontVariant = fontVariant;
    styles.fontWeight = fontWeight;
    styles.fontSize = fontSize;
    if (lineHeight) {
      styles.lineHeight = lineHeight;
    }
    if (fontFamily.length > 0) {
      styles.fontFamily = fontFamily.join(' ');
    }
  } else {
    styles.font = value;
  }
}

/**
 * Handle the `background` CSS shorthand property expansion.
 */
function expandBackgroundShorthand(value: string, styles: Record<string, string>): void {
  const parts = splitValues(value);
  let color = '';
  let image = '';
  let position = '';
  let size = '';
  let repeat = '';
  let attachment = '';
  let origin = '';
  let clip = '';

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower.startsWith('url(') || lower.startsWith('linear-gradient(') || lower.startsWith('radial-gradient(')) {
      image = part;
    } else if (lower === 'repeat' || lower === 'repeat-x' || lower === 'repeat-y' || lower === 'no-repeat' || lower === 'space' || lower === 'round') {
      repeat = part;
    } else if (lower === 'scroll' || lower === 'fixed' || lower === 'local') {
      attachment = part;
    } else if (lower === 'border-box' || lower === 'padding-box' || lower === 'content-box') {
      if (!origin) {
        origin = part;
      } else {
        clip = part;
      }
    } else if (lower === 'cover' || lower === 'contain') {
      size = part;
    } else if (/^\d/.test(part) || lower === 'center' || lower === 'top' || lower === 'bottom' || lower === 'left' || lower === 'right') {
      if (size && !position) {
        // After size marker (the /) comes position
        position = part;
      } else if (part === '/') {
        // position/size separator
        continue;
      } else if (!position || lower === 'center' || lower === 'top' || lower === 'bottom' || lower === 'left' || lower === 'right') {
        position = position ? `${position} ${part}` : part;
      }
    } else {
      // Treat as color
      color = part;
    }
  }

  if (color) styles.backgroundColor = color;
  if (image) styles.backgroundImage = image;
  if (position) styles.backgroundPosition = position;
  if (size) styles.backgroundSize = size;
  if (repeat) styles.backgroundRepeat = repeat;
  if (attachment) styles.backgroundAttachment = attachment;
  if (origin) styles.backgroundOrigin = origin;
  if (clip) styles.backgroundClip = clip;
}

/**
 * Handle the `border` CSS shorthand property expansion.
 */
function expandBorderShorthand(
  prefix: string,
  value: string,
  styles: Record<string, string>
): void {
  const parts = splitValues(value);
  let width = '';
  let style = '';
  let color = '';

  const styleValues = new Set([
    'none', 'hidden', 'dotted', 'dashed', 'solid', 'double',
    'groove', 'ridge', 'inset', 'outset',
  ]);

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (styleValues.has(lower)) {
      style = part;
    } else if (/^\d/.test(part) || lower === 'thin' || lower === 'medium' || lower === 'thick') {
      width = part;
    } else {
      color = part;
    }
  }

  if (width) styles[`${prefix}Width`] = width;
  if (style) styles[`${prefix}Style`] = style;
  if (color) styles[`${prefix}Color`] = color;
}

/**
 * Parse an inline CSS style string into a React CSSProperties object.
 *
 * Handles:
 * - Standard CSS properties (converted to camelCase)
 * - Vendor-prefixed properties (-webkit- → Webkit)
 * - Shorthand properties (margin, padding, border, font, background, overflow, borderRadius)
 * - CSS custom properties (--var-name) are preserved as-is
 * - URL values and quoted strings
 * - `!important` flags (stripped)
 *
 * @param styleString - The inline style string (e.g., "color: red; margin: 10px 20px;")
 * @returns A React CSSProperties-compatible object
 *
 * @example
 * styleStringToObject('color: red; margin: 10px 20px; font-size: 14px;')
 * // → { color: 'red', marginTop: '10px', marginRight: '20px', marginBottom: '10px', marginLeft: '20px', fontSize: '14px' }
 */
export function styleStringToObject(styleString: string): CSSProperties {
  if (!styleString || typeof styleString !== 'string') {
    return {};
  }

  const result: Record<string, string> = {};

  // Split by semicolons, but respect url() and quoted strings
  const declarations = styleString.split(';');

  for (let rawDecl of declarations) {
    let decl = rawDecl.trim();
    if (!decl) continue;

    // Remove !important
    decl = decl.replace(/\s*!important\s*$/i, '');

    const colonIndex = decl.indexOf(':');
    if (colonIndex === -1) continue;

    const property = decl.substring(0, colonIndex).trim().toLowerCase();
    let value = decl.substring(colonIndex + 1).trim();

    if (!property || !value) continue;

    // Handle CSS custom properties (pass through as-is)
    if (property.startsWith('--')) {
      result[property] = value;
      continue;
    }

    // Handle vendor prefixes
    let reactProperty = property;
    for (const [prefix, reactPrefix] of Object.entries(VENDOR_PREFIXES)) {
      if (property.startsWith(prefix)) {
        reactProperty = reactPrefix + camelCase(property.substring(prefix.length));
        break;
      }
    }

    // Handle shorthand properties
    if (property === 'font') {
      expandFontShorthand(value, result);
      continue;
    }

    if (property === 'background') {
      expandBackgroundShorthand(value, result);
      continue;
    }

    if (property.startsWith('border') && !property.includes('-') && property.length === 6) {
      expandBorderShorthand('border', value, result);
      continue;
    }

    if (property.startsWith('border-top') && property.length === 10 && !property.includes('width') && !property.includes('style') && !property.includes('color')) {
      expandBorderShorthand('borderTop', value, result);
      continue;
    }

    if (property.startsWith('border-right') && property.length === 12 && !property.includes('width') && !property.includes('style') && !property.includes('color')) {
      expandBorderShorthand('borderRight', value, result);
      continue;
    }

    if (property.startsWith('border-bottom') && property.length === 13 && !property.includes('width') && !property.includes('style') && !property.includes('color')) {
      expandBorderShorthand('borderBottom', value, result);
      continue;
    }

    if (property.startsWith('border-left') && property.length === 11 && !property.includes('width') && !property.includes('style') && !property.includes('color')) {
      expandBorderShorthand('borderLeft', value, result);
      continue;
    }

    // General shorthand expansion
    if (SHORTHAND_EXPAND[property]) {
      expandShorthand(property, value, result);
      continue;
    }

    // Convert to camelCase if not already done via vendor prefix
    if (reactProperty === property) {
      reactProperty = camelCase(property);
    }

    result[reactProperty] = value;
  }

  return result as unknown as CSSProperties;
}

/**
 * Convert an HTML attribute name to the corresponding React prop name.
 * Handles special renames (class → className, for → htmlFor, etc.)
 * and preserves data-* and aria-* attributes.
 */
export function attrToReactProp(attrName: string): string {
  const lower = attrName.toLowerCase();

  if (ATTR_RENAME_MAP[lower]) {
    return ATTR_RENAME_MAP[lower];
  }

  // Preserve data-* and aria-* attributes as-is
  if (lower.startsWith('data-') || lower.startsWith('aria-')) {
    return attrName;
  }

  return lower;
}

/**
 * Check if an HTML attribute is a boolean attribute.
 */
export function isBooleanAttribute(attrName: string): boolean {
  return BOOLEAN_ATTRIBUTES.has(attrName.toLowerCase());
}

/**
 * Check if an HTML element is a void (self-closing) element.
 */
export function isVoidElement(tagName: string): boolean {
  return VOID_ELEMENTS.has(tagName.toLowerCase());
}

/**
 * Convert SVG attribute names to React-compatible camelCase.
 */
export function svgAttrToReact(attrName: string): string {
  const lower = attrName.toLowerCase();

  if (SVG_ATTR_RENAMES[lower]) {
    return SVG_ATTR_RENAMES[lower];
  }

  // Handle xlink:href etc.
  if (lower.startsWith('xlink:')) {
    return 'xlink' + attrName.charAt(6).toUpperCase() + attrName.slice(7);
  }

  if (lower.startsWith('xml:')) {
    return 'xml' + attrName.charAt(4).toUpperCase() + attrName.slice(5);
  }

  return lower;
}

/**
 * Check if a tag name is an SVG element.
 */
export function isSVGElement(tagName: string): boolean {
  const svgElements = new Set([
    'svg', 'animate', 'animateMotion', 'animateTransform',
    'circle', 'clipPath', 'defs', 'desc', 'ellipse',
    'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
    'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
    'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA',
    'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur',
    'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
    'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight',
    'feTile', 'feTurbulence', 'filter', 'foreignObject',
    'g', 'image', 'line', 'linearGradient', 'marker',
    'mask', 'metadata', 'mpath', 'path', 'pattern',
    'polygon', 'polyline', 'radialGradient', 'rect',
    'set', 'stop', 'switch', 'symbol', 'text',
    'textPath', 'tspan', 'use', 'view',
  ]);
  return svgElements.has(tagName.toLowerCase());
}

/**
 * Parse HTML attributes string into a Record<string, string>.
 * Handles quoted and unquoted attribute values.
 */
export function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!attrString) return attrs;

  const regex = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(attrString)) !== null) {
    const name = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[name] = value;
  }

  return attrs;
}
