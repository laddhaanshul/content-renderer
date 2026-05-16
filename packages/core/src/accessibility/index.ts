// ==========================================
// Accessibility Module - Utilities for accessible content rendering
// ==========================================

import type { HTMLNode, HTMLDocument } from '../types';
import { HTMLParser } from '../parsers/html-parser';

// ==========================================
// Types
// ==========================================

export interface AccessibilityOptions {
  lang?: string;
  dir?: 'ltr' | 'rtl';
  labelStrategy?: 'aria-label' | 'aria-labelledby' | 'title';
}

export interface AccessibilityTree {
  role: string;
  label?: string;
  children: AccessibilityTree[];
  properties: Record<string, string>;
}

export interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  rule: string;
  element?: string;
  message: string;
}

export interface HeadingStructure {
  levels: { level: number; text: string; id?: string }[];
  hasSkipLink: boolean;
  isLogical: boolean;
}

export interface ContrastResult {
  ratio: number;
  passes: boolean;
  aa: boolean;
  aaa: boolean;
}

// ==========================================
// ARIA Roles Mapping
// ==========================================

/**
 * Maps HTML tags to their default implicit ARIA roles.
 * Based on the WAI-ARIA specification for implicit ARIA semantics.
 */
export const ARIA_ROLES: Record<string, string[]> = {
  'a': ['link'],
  'area': ['link'],
  'article': ['article'],
  'aside': ['complementary'],
  'body': ['document'],
  'button': ['button'],
  'datalist': ['listbox'],
  'details': ['group'],
  'dialog': ['dialog'],
  'dd': ['definition'],
  'dfn': ['term'],
  'dt': ['term'],
  'fieldset': ['group'],
  'figure': ['figure'],
  'footer': ['contentinfo'],
  'form': ['form'],
  'h1': ['heading'],
  'h2': ['heading'],
  'h3': ['heading'],
  'h4': ['heading'],
  'h5': ['heading'],
  'h6': ['heading'],
  'header': ['banner'],
  'hr': ['separator'],
  'img': ['img'],
  'input': ['textbox'],
  'li': ['listitem'],
  'link': ['link'],
  'main': ['main'],
  'math': ['math'],
  'menu': ['menu'],
  'nav': ['navigation'],
  'ol': ['list'],
  'optgroup': ['group'],
  'option': ['option'],
  'output': ['status'],
  'progress': ['progressbar'],
  'section': ['region'],
  'select': ['listbox'],
  'summary': ['button'],
  'svg': ['graphics-document'],
  'table': ['table'],
  'tbody': ['rowgroup'],
  'td': ['cell'],
  'textarea': ['textbox'],
  'tfoot': ['rowgroup'],
  'th': ['columnheader', 'rowheader', 'cell'],
  'thead': ['rowgroup'],
  'time': ['time'],
  'tr': ['row'],
  'ul': ['list'],
};

/** Standard ARIA landmark roles */
export const ARIA_LANDMARK_ROLES: string[] = [
  'banner',
  'complementary',
  'contentinfo',
  'form',
  'main',
  'navigation',
  'region',
  'search',
];

// Self-closing/void HTML elements that have no children or closing tag
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

// ==========================================
// Functions
// ==========================================

/**
 * Get the default ARIA role for an HTML tag, considering its attributes.
 */
export function getAriaRole(
  tag: string,
  attributes?: Record<string, string>
): string {
  const lowerTag = tag.toLowerCase();

  // Explicit role attribute takes precedence
  if (attributes?.role) {
    return attributes.role;
  }

  // Special attribute-based role overrides
  if (lowerTag === 'input') {
    const inputType = attributes?.type?.toLowerCase();
    switch (inputType) {
      case 'button':
      case 'submit':
      case 'reset':
      case 'image':
        return 'button';
      case 'checkbox':
        return 'checkbox';
      case 'radio':
        return 'radio';
      case 'range':
        return 'slider';
      case 'number':
        return 'spinbutton';
      case 'search':
        return 'searchbox';
      case 'email':
      case 'tel':
      case 'url':
        return 'textbox';
      case 'hidden':
        return 'presentation';
      default:
        return 'textbox';
    }
  }

  if (lowerTag === 'th') {
    if (attributes?.scope === 'row') return 'rowheader';
    return 'columnheader';
  }

  if (lowerTag === 'img') {
    if (attributes?.alt === '' || !attributes?.alt) return 'presentation';
    return 'img';
  }

  if (lowerTag === 'a' || lowerTag === 'area') {
    if (!attributes?.href) return 'generic';
    return 'link';
  }

  if (lowerTag === 'section' && !attributes?.['aria-label'] && !attributes?.['aria-labelledby']) {
    // Section without a label is not a region landmark
    return 'generic';
  }

  // Heading level mapping
  if (/^h[1-6]$/.test(lowerTag)) {
    return 'heading';
  }

  // Look up implicit roles
  const roles = ARIA_ROLES[lowerTag];
  if (roles && roles.length > 0) {
    return roles[0];
  }

  return 'generic';
}

/**
 * Get recommended ARIA attributes for an HTML element.
 */
export function getAriaAttributes(
  tag: string,
  attributes?: Record<string, string>
): Record<string, string> {
  const role = getAriaRole(tag, attributes);
  const ariaAttrs: Record<string, string> = {};
  const lowerTag = tag.toLowerCase();

  // Copy any existing aria attributes
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith('aria-')) {
        ariaAttrs[key] = value;
      }
    }
  }

  // Role-based attribute suggestions
  switch (role) {
    case 'heading': {
      const match = lowerTag.match(/h([1-6])/);
      if (match) {
        ariaAttrs['aria-level'] = match[1];
      }
      break;
    }
    case 'img': {
      if (!ariaAttrs['aria-label'] && !ariaAttrs['aria-labelledby']) {
        const alt = attributes?.alt;
        if (alt && alt !== '') {
          ariaAttrs['aria-label'] = alt;
        }
      }
      break;
    }
    case 'progressbar': {
      if (!ariaAttrs['aria-valuenow'] && attributes?.value !== undefined) {
        ariaAttrs['aria-valuenow'] = attributes.value;
      }
      if (!ariaAttrs['aria-valuemin'] && attributes?.min !== undefined) {
        ariaAttrs['aria-valuemin'] = attributes.min;
      }
      if (!ariaAttrs['aria-valuemax'] && attributes?.max !== undefined) {
        ariaAttrs['aria-valuemax'] = attributes.max;
      }
      break;
    }
    case 'checkbox':
    case 'radio': {
      if (ariaAttrs['aria-checked'] === undefined && attributes?.checked !== undefined) {
        ariaAttrs['aria-checked'] = attributes.checked;
      }
      break;
    }
    case 'slider': {
      if (!ariaAttrs['aria-valuenow'] && attributes?.value !== undefined) {
        ariaAttrs['aria-valuenow'] = attributes.value;
      }
      break;
    }
    case 'searchbox':
    case 'textbox': {
      if (!ariaAttrs['aria-required'] && attributes?.required !== undefined) {
        ariaAttrs['aria-required'] = 'true';
      }
      if (!ariaAttrs['aria-placeholder'] && attributes?.placeholder) {
        ariaAttrs['aria-placeholder'] = attributes.placeholder;
      }
      if (!ariaAttrs['aria-label'] && !ariaAttrs['aria-labelledby'] && attributes?.['aria-label']) {
        ariaAttrs['aria-label'] = attributes['aria-label'];
      }
      break;
    }
    case 'listbox': {
      if (ariaAttrs['aria-multiselectable'] === undefined && lowerTag === 'select' && attributes?.multiple !== undefined) {
        ariaAttrs['aria-multiselectable'] = 'true';
      }
      break;
    }
    case 'link': {
      if (lowerTag === 'a' && attributes?.target === '_blank') {
        ariaAttrs['aria-label'] = ariaAttrs['aria-label']
          ? `${ariaAttrs['aria-label']} (opens in new tab)`
          : 'Opens in new tab';
      }
      break;
    }
    case 'button': {
      if (lowerTag === 'input' && attributes?.type === 'submit' && !ariaAttrs['aria-label']) {
        ariaAttrs['aria-label'] = attributes.value || 'Submit';
      }
      if (lowerTag === 'input' && attributes?.type === 'reset' && !ariaAttrs['aria-label']) {
        ariaAttrs['aria-label'] = attributes.value || 'Reset';
      }
      break;
    }
  }

  // Global attributes
  if (attributes?.lang && !ariaAttrs['aria-label']) {
    // lang is on the element itself, not an aria attr
  }

  return ariaAttrs;
}

/**
 * Generate an accessible label for content within a specific tag.
 */
export function generateAriaLabel(content: string, tag: string): string {
  if (!content || !content.trim()) {
    return '';
  }

  const lowerTag = tag.toLowerCase();
  const text = content
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  // Add context for certain elements
  switch (lowerTag) {
    case 'a':
    case 'area':
      return `Link: ${text}`;
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return text;
    case 'img':
      return `Image: ${text}`;
    case 'table':
      return `Table: ${text}`;
    case 'nav':
      return `Navigation: ${text}`;
    case 'article':
      return `Article: ${text}`;
    case 'section':
      return `Section: ${text}`;
    default:
      return text;
  }
}

/**
 * Generate aria-live attributes for a dynamic content region.
 */
export function generateAriaLive(
  region: 'polite' | 'assertive' | 'off'
): { 'aria-live': string; 'aria-atomic': string } {
  const atomic = region === 'off' ? 'false' : 'true';
  return {
    'aria-live': region === 'off' ? 'off' : region,
    'aria-atomic': atomic,
  };
}

/**
 * Create an accessibility tree from an HTMLNode.
 */
export function createAccessibleTree(
  node: HTMLNode,
  options?: AccessibilityOptions
): AccessibilityTree {
  const role = node.type === 'element' && node.tag
    ? getAriaRole(node.tag, node.attributes)
    : 'text';

  const properties: Record<string, string> = {};

  // Populate properties from node attributes
  if (node.attributes) {
    for (const [key, value] of Object.entries(node.attributes)) {
      if (key.startsWith('aria-') || key === 'role' || key === 'tabindex' || key === 'lang' || key === 'title') {
        properties[key] = value;
      }
    }
  }

  // Apply options
  if (options?.lang) {
    properties['lang'] = options.lang;
  }
  if (options?.dir) {
    properties['dir'] = options.dir;
  }

  // Determine label
  let label: string | undefined;
  if (node.attributes?.['aria-label']) {
    label = node.attributes['aria-label'];
  } else if (node.type === 'text' && node.content) {
    label = node.content.trim();
  } else if (node.type === 'element' && node.tag) {
    const textContent = getTextContent(node);
    if (textContent) {
      label = generateAriaLabel(textContent, node.tag);
    }
  }

  // Build children
  const children: AccessibilityTree[] = [];
  if (node.children) {
    for (const child of node.children) {
      // Skip empty text nodes and comments
      if (child.type === 'comment') continue;
      if (child.type === 'text' && !child.content?.trim()) continue;
      children.push(createAccessibleTree(child, options));
    }
  }

  return {
    role,
    label,
    children,
    properties,
  };
}

/**
 * Validate an accessibility tree for common issues.
 */
export function validateAccessibility(tree: AccessibilityTree): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  function walk(t: AccessibilityTree, path: string) {
    const element = path || t.role;

    // Rule: Images must have alt text
    if (t.role === 'img' && !t.label) {
      issues.push({
        severity: 'error',
        rule: 'img-alt',
        element,
        message: 'Images must have alternate text (alt attribute or aria-label).',
      });
    }

    // Rule: Interactive elements must have accessible names
    if (['button', 'link', 'textbox', 'searchbox', 'checkbox', 'radio', 'slider'].includes(t.role)) {
      if (!t.label && !t.properties['aria-label'] && !t.properties['aria-labelledby']) {
        issues.push({
          severity: 'error',
          rule: 'interactive-name',
          element,
          message: `Interactive element with role "${t.role}" must have an accessible name.`,
        });
      }
    }

    // Rule: ARIA role must be valid
    const validRoles = new Set([
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell',
      'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition',
      'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'generic', 'grid',
      'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem',
      'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation', 'progressbar',
      'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
      'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch',
      'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem', 'text',
    ]);
    if (t.role && !validRoles.has(t.role)) {
      issues.push({
        severity: 'warning',
        rule: 'valid-role',
        element,
        message: `Unknown ARIA role "${t.role}".`,
      });
    }

    // Rule: aria-label should not contain the element's role
    if (t.properties['aria-label']) {
      const roleNames: Record<string, string> = {
        button: 'button', link: 'link', img: 'image', nav: 'navigation',
      };
      const roleName = roleNames[t.role];
      if (roleName) {
        const labelLower = t.properties['aria-label'].toLowerCase();
        if (labelLower === roleName || labelLower.startsWith(roleName + ' ') || labelLower.startsWith(roleName + ':')) {
          issues.push({
            severity: 'warning',
            rule: 'no-redundant-label',
            element,
            message: `Accessible label "${t.properties['aria-label']}" should not include the element's role name "${roleName}". Screen readers already announce the role.`,
          });
        }
      }
    }

    // Rule: Positive tabindex should be avoided
    if (t.properties['tabindex'] && parseInt(t.properties['tabindex'], 10) > 0) {
      issues.push({
        severity: 'warning',
        rule: 'tabindex-positive',
        element,
        message: 'Avoid positive tabindex values. Use 0 or -1 instead to maintain a logical tab order.',
      });
    }

    // Rule: heading levels must not skip (checked later in getHeadingLevels)

    // Recurse into children
    for (const child of t.children) {
      walk(child, `${element} > ${child.role}`);
    }
  }

  walk(tree, '');

  return issues;
}

/**
 * Analyze heading structure of an HTML document.
 */
export function getHeadingLevels(doc: HTMLDocument): HeadingStructure {
  const levels: HeadingStructure['levels'] = [];
  let hasSkipLink = false;
  let isLogical = true;
  let previousLevel = 0;

  function traverse(nodes: HTMLNode[]) {
    for (const node of nodes) {
      if (node.type === 'element' && node.tag) {
        // Check for skip link
        if (node.tag === 'a' && node.attributes?.href === '#main') {
          hasSkipLink = true;
        }

        // Extract headings
        const headingMatch = node.tag.match(/^[hH]([1-6])$/);
        if (headingMatch) {
          const level = parseInt(headingMatch[1], 10);
          const text = getTextContent(node).trim();
          levels.push({
            level,
            text,
            id: node.attributes?.id,
          });

          // Check logical order
          if (previousLevel === 0) {
            // First heading should be h1
            if (level !== 1) {
              isLogical = false;
            }
          } else if (level > previousLevel + 1) {
            // Heading levels should not skip (e.g., h1 -> h3 is bad)
            isLogical = false;
          }
          previousLevel = level;
        }

        if (node.children) {
          traverse(node.children);
        }
      }
    }
  }

  traverse(doc.nodes);
  traverse(doc.body?.children || []);

  // If no headings, consider it logical
  if (levels.length === 0) {
    isLogical = true;
  }

  return { levels, hasSkipLink, isLogical };
}

/**
 * Check color contrast ratio between foreground and background colors.
 * Uses the WCAG 2.0 relative luminance formula.
 */
export function checkColorContrast(
  fg: string,
  bg: string,
  minRatio: number = 4.5
): ContrastResult {
  const fgRGB = parseColor(fg);
  const bgRGB = parseColor(bg);

  if (!fgRGB || !bgRGB) {
    return { ratio: 1, passes: false, aa: false, aaa: false };
  }

  const fgLuminance = relativeLuminance(fgRGB.r, fgRGB.g, fgRGB.b);
  const bgLuminance = relativeLuminance(bgRGB.r, bgRGB.g, bgRGB.b);

  // Contrast ratio formula from WCAG 2.0
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG 2.0 success criteria
  // AA: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold)
  // AAA: 7:1 for normal text, 4.5:1 for large text
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= minRatio,
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
  };
}

/**
 * Generate screen-reader-friendly text from HTML content.
 * Strips tags and adds semantic annotations for screen readers.
 */
export function generateScreenReaderText(html: string): string {
  if (!html) return '';

  const parser = new HTMLParser();
  const doc = parser.parse(html);
  let result = '';

  function walk(nodes: HTMLNode[]) {
    for (const node of nodes) {
      if (node.type === 'text' && node.content) {
        result += node.content;
      } else if (node.type === 'element' && node.tag) {
        const tag = node.tag.toLowerCase();
        const text = getTextContent(node).trim();

        // Add semantic announcements for certain elements
        if (tag === 'img' || tag === 'image') {
          const alt = node.attributes?.alt || '';
          if (alt) {
            result += `[image: ${alt}] `;
          } else {
            result += '[image]';
          }
        } else if (tag === 'a' || tag === 'area') {
          if (text) {
            result += `[link: ${text}] `;
          } else {
            result += '[link]';
          }
        } else if (tag === 'button') {
          if (text) {
            result += `[button: ${text}] `;
          } else {
            result += '[button]';
          }
        } else if (/^h[1-6]$/.test(tag)) {
          result += `\n[${tag.toUpperCase()}] `;
        } else if (tag === 'hr') {
          result += '\n[horizontal rule]\n';
        } else if (tag === 'br') {
          result += '\n';
        } else if (tag === 'table') {
          result += '\n[table start] ';
        } else if (tag === 'tr') {
          result += '\n';
        } else if (tag === 'th') {
          result += `[column header: ${text}]  `;
        } else if (tag === 'td') {
          result += `[cell: ${text}]  `;
        } else if (tag === 'input' || tag === 'select' || tag === 'textarea') {
          const inputType = node.attributes?.type || 'text';
          const label = node.attributes?.['aria-label'] || node.attributes?.placeholder || text || inputType;
          result += `[${inputType} input: ${label}] `;
        } else if (tag === 'nav') {
          result += '\n[navigation start] ';
        } else if (tag === 'main') {
          result += '\n[main content start] ';
        } else if (tag === 'aside') {
          result += '\n[complementary content start] ';
        } else if (tag === 'article') {
          result += '\n[article start] ';
        } else if (tag === 'blockquote') {
          result += `\n[blockquote: ${text}]\n`;
        } else if (tag === 'code' || tag === 'pre') {
          result += `[code: ${text}] `;
        } else if (tag === 'li') {
          result += `• ${text}\n`;
        } else {
          // Default: just recurse
          if (node.children) {
            walk(node.children);
          }
        }

        // Close elements that need it
        if (tag === 'table') {
          result += '[table end]\n';
        } else if (tag === 'nav') {
          result += '[navigation end] ';
        } else if (tag === 'main') {
          result += '[main content end] ';
        } else if (tag === 'aside') {
          result += '[complementary content end] ';
        } else if (tag === 'article') {
          result += '[article end] ';
        }
      }
    }
  }

  walk(doc.nodes);

  // Clean up extra whitespace
  return result
    .replace(/\n{3,}/g, '\n\n')
    .replace(/  +/g, ' ')
    .trim();
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Extract text content from an HTMLNode recursively.
 */
function getTextContent(node: HTMLNode): string {
  if (node.type === 'text') {
    return node.content || '';
  }
  if (!node.children || node.children.length === 0) {
    return '';
  }
  return node.children.map((child) => getTextContent(child)).join('');
}

/**
 * Parse a CSS color string to RGB components.
 * Supports: #rgb, #rrggbb, rgb(), rgba(), and named colors.
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  if (!color || !color.trim()) return null;

  const trimmed = color.trim().toLowerCase();

  // Hex: #rgb or #rrggbb
  if (/^#([0-9a-f]{3,8})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // rgb() or rgba()
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Named colors (basic subset)
  const namedColors: Record<string, { r: number; g: number; b: number }> = {
    'black': { r: 0, g: 0, b: 0 },
    'white': { r: 255, g: 255, b: 255 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'yellow': { r: 255, g: 255, b: 0 },
    'cyan': { r: 0, g: 255, b: 255 },
    'magenta': { r: 255, g: 0, b: 255 },
    'gray': { r: 128, g: 128, b: 128 },
    'grey': { r: 128, g: 128, b: 128 },
    'orange': { r: 255, g: 165, b: 0 },
    'purple': { r: 128, g: 0, b: 128 },
    'pink': { r: 255, g: 192, b: 203 },
    'brown': { r: 165, g: 42, b: 42 },
    'navy': { r: 0, g: 0, b: 128 },
    'teal': { r: 0, g: 128, b: 128 },
    'maroon': { r: 128, g: 0, b: 0 },
    'olive': { r: 128, g: 128, b: 0 },
    'lime': { r: 0, g: 255, b: 0 },
    'aqua': { r: 0, g: 255, b: 255 },
    'silver': { r: 192, g: 192, b: 192 },
    'transparent': { r: 0, g: 0, b: 0 },
  };

  const named = namedColors[trimmed];
  if (named) return named;

  return null;
}

/**
 * Calculate relative luminance per WCAG 2.0 specification.
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
