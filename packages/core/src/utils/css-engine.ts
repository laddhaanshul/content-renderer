// ==========================================
// CSS Cascade Engine
// ==========================================
// Walks an HTML node tree, matches CSS rules via the selector engine,
// applies the cascade (specificity → source order → !important),
// resolves CSS variables (var()), evaluates basic calc() expressions,
// evaluates @media queries against viewport dimensions, and returns
// computed styles for every element node keyed by path (e.g. "div.0.p.2").

import type { HTMLNode, CSSRule, CSSMediaQuery, CSSDeclaration } from '../types';
import { matchSelector, calculateSpecificity } from './css-selector';

// ---- Public options ----

export interface CSEngineOptions {
  /** Viewport width in px (default 1024) */
  viewportWidth?: number;
  /** Viewport height in px (default 768) */
  viewportHeight?: number;
  /** Device pixel ratio (default 1) */
  pixelRatio?: number;
  /** Parent element width in px — used when resolving % in calc() (default = viewportWidth) */
  parentWidth?: number;
}

/** Flat map of CSS property → computed value */
export type ComputedStyle = Record<string, string>;

// ---- Internal: a rule entry paired with its specificity and source order ----

interface MatchedRule {
  selector: string;
  specificity: { a: number; b: number; c: number; d: number; numeric: number };
  declarations: CSSDeclaration[];
  sourceOrder: number; // lower = appears earlier in the stylesheet
}

// ---- CSS Engine class ----

export class CSEngine {
  private readonly defaultViewportWidth = 1024;
  private readonly defaultViewportHeight = 768;

  /**
   * Compute styles for every element node in the HTML tree.
   *
   * @param root          The root HTMLNode of the tree
   * @param rules         Top-level CSS rules (from CSSParser)
   * @param mediaQueries  @media query blocks (from CSSParser)
   * @param variables     CSS custom properties (from CSSParser)
   * @param options       Viewport / parent dimensions
   * @returns A Map keyed by path ("div.0.p.2") → computed style record
   */
  computeStyles(
    root: HTMLNode,
    rules: CSSRule[],
    mediaQueries: CSSMediaQuery[],
    variables: Record<string, string>,
    options?: CSEngineOptions,
  ): Map<string, ComputedStyle> {
    const vpWidth = options?.viewportWidth ?? this.defaultViewportWidth;
    const vpHeight = options?.viewportHeight ?? this.defaultViewportHeight;
    const pixelRatio = options?.pixelRatio ?? 1;
    const parentWidth = options?.parentWidth ?? vpWidth;

    const result = new Map<string, ComputedStyle>();

    // Merge variables from the options into a mutable copy
    const resolvedVars: Record<string, string> = { ...variables };

    // 1. Filter media-query rules to only include those that match the viewport
    const activeRules = this.collectActiveRules(rules, mediaQueries, vpWidth, vpHeight, pixelRatio);

    // 2. Walk the tree and compute styles for every element node
    this.walkTree(root, '', activeRules, resolvedVars, parentWidth, result);

    return result;
  }

  // ---- Media query evaluation ----

  /**
   * Collect all CSS rules whose media query (if any) matches the viewport.
   * Non-media rules are always included.
   */
  private collectActiveRules(
    rules: CSSRule[],
    mediaQueries: CSSMediaQuery[],
    vpWidth: number,
    vpHeight: number,
    pixelRatio: number,
  ): CSSRule[] {
    const active: CSSRule[] = [...rules];

    for (const mq of mediaQueries) {
      if (this.evaluateMediaQuery(mq.condition, vpWidth, vpHeight, pixelRatio)) {
        active.push(...mq.rules);
      }
    }

    return active;
  }

  /**
   * Evaluate a @media condition string against viewport dimensions.
   * Supports: (min/max)-width, (min/max)-height, orientation, and basic pixel-ratio.
   * Handles AND (comma-separated = OR, space-separated keywords within a feature = AND).
   */
  evaluateMediaQuery(
    condition: string,
    vpWidth: number,
    vpHeight: number,
    pixelRatio: number,
  ): boolean {
    // Normalise
    const cond = condition.trim().toLowerCase();
    if (!cond || cond === 'all' || cond === 'screen') return true;

    // Split by comma — each part is an OR group
    const orGroups = cond.split(',').map(g => g.trim()).filter(Boolean);

    return orGroups.some(group => this.evaluateMediaGroup(group, vpWidth, vpHeight, pixelRatio));
  }

  private evaluateMediaGroup(
    group: string,
    vpWidth: number,
    vpHeight: number,
    pixelRatio: number,
  ): boolean {
    // Within a group, split by "and" keywords
    const parts = group.split(/\s+and\s+/).map(p => p.trim()).filter(Boolean);

    return parts.every(part => this.evaluateMediaFeature(part, vpWidth, vpHeight, pixelRatio));
  }

  private evaluateMediaFeature(
    feature: string,
    vpWidth: number,
    vpHeight: number,
    pixelRatio: number,
  ): boolean {
    const f = feature.trim().replace(/^\(/, '').replace(/\)$/, '').trim();

    // Orientation
    if (f === 'orientation: landscape') return vpWidth >= vpHeight;
    if (f === 'orientation: portrait') return vpHeight > vpWidth;

    // Parse (min/max)-<property>: <value>
    const match = f.match(/^(min-|max-)(width|height|device-width|device-height|resolution)\s*:\s*(.+)$/);
    if (!match) {
      // Simple equality: "width: 800px"
      const eqMatch = f.match(/^(width|height)\s*:\s*(.+)$/);
      if (eqMatch) {
        const prop = eqMatch[1];
        const val = this.parseMediaLength(eqMatch[2], pixelRatio);
        return prop === 'width' ? vpWidth === val : vpHeight === val;
      }
      // Unknown feature — conservatively include
      return true;
    }

    const [, minMax, prop, rawVal] = match;
    const val = this.parseMediaLength(rawVal, pixelRatio);
    const ref = this.getMediaRef(prop, vpWidth, vpHeight, pixelRatio);

    if (minMax === 'min-') return ref >= val;
    return ref <= val; // max-
  }

  private getMediaRef(prop: string, w: number, h: number, dpr: number): number {
    switch (prop) {
      case 'width': case 'device-width': return w;
      case 'height': case 'device-height': return h;
      case 'resolution': return dpr;
      default: return w;
    }
  }

  /**
   * Parse a media-query length value (px, em, rem, dpi, dppx) to a number.
   * For simplicity, em/rem are treated as 16px, dpi is kept as-is.
   */
  private parseMediaLength(raw: string, dpr: number): number {
    const s = raw.trim().toLowerCase();
    if (s.endsWith('px')) return parseFloat(s);
    if (s.endsWith('em') || s.endsWith('rem')) return parseFloat(s) * 16;
    if (s.endsWith('dppx')) return parseFloat(s);
    if (s.endsWith('dpi')) return parseFloat(s) / 96;
    return parseFloat(s) || 0;
  }

  // ---- Tree walk ----

  /**
   * Recursively walk the HTML tree, compute styles for each element node,
   * and store the result in `out`.
   */
  private walkTree(
    node: HTMLNode,
    path: string,
    rules: CSSRule[],
    variables: Record<string, string>,
    parentWidth: number,
    out: Map<string, ComputedStyle>,
    childIndex: number = 0,
  ): void {
    if (node.type !== 'element') {
      // Still recurse into children of non-element nodes (edge case)
      if (node.children) {
        node.children.forEach((child, idx) =>
          this.walkTree(child, path, rules, variables, parentWidth, out, idx),
        );
      }
      return;
    }

    // Build path key for this element
    const tag = node.tag || 'unknown';
    const myPath = path ? `${path}.${tag}.${childIndex}` : `${tag}.${childIndex}`;

    // 1. Collect all rules that match this element
    const matched = this.collectMatchingRules(node, rules);

    // 2. Apply the cascade: sort by specificity then source order, then merge
    const computed = this.applyCascade(matched);

    // 3. Merge inline styles (from the style attribute) — these have highest specificity
    const inlineStyles = this.parseInlineStyle(node);
    if (Object.keys(inlineStyles).length > 0) {
      // Inline styles override everything except !important from other rules
      // (In practice inline !important beats everything; we simplify: inline always wins
      //  unless a rule has !important, which is handled in cascade already)
      for (const [prop, val] of Object.entries(inlineStyles)) {
        if (!computed[`${prop}__important`]) {
          computed[prop] = val;
        }
      }
    }

    // Clean internal markers
    for (const key of Object.keys(computed)) {
      if (key.endsWith('__important')) {
        delete computed[key];
      }
    }

    // 4. Resolve CSS variables (var())
    this.resolveVariables(computed, variables);

    // 5. Evaluate calc() expressions
    this.resolveCalc(computed, parentWidth);

    // 6. Store
    out.set(myPath, computed);

    // 7. Recurse into children
    if (node.children) {
      const elementChildren = node.children.map((child, idx) => ({ child, idx }));
      elementChildren.forEach(({ child, idx }) => {
        this.walkTree(child, myPath, rules, variables, parentWidth, out, idx);
      });
    }
  }

  // ---- Rule matching ----

  /**
   * Find all CSS rules whose selectors match the given element.
   */
  private collectMatchingRules(node: HTMLNode, rules: CSSRule[]): MatchedRule[] {
    const matched: MatchedRule[] = [];

    rules.forEach((rule, ruleIdx) => {
      for (const selector of rule.selectors) {
        if (matchSelector(selector, node)) {
          const spec = calculateSpecificity(selector);
          matched.push({
            selector,
            specificity: { a: 1, b: spec.b, c: spec.c, d: spec.d, numeric: spec.numeric },
            declarations: rule.declarations,
            sourceOrder: ruleIdx,
          });
          // Only add once per rule (first matching selector wins for specificity,
          // but we keep all selectors matched for completeness)
          break;
        }
      }
    });

    return matched;
  }

  // ---- Cascade ----

  /**
   * Apply the CSS cascade: sort matched rules, then merge declarations.
   * Rules with !important are handled by storing an internal marker.
   */
  private applyCascade(matched: MatchedRule[]): ComputedStyle {
    // Sort by: !important (desc), specificity numeric (desc), source order (asc)
    // We group by property after sorting.
    const result: ComputedStyle = {};

    // Build a flat list of (property, value, important, specificityNumeric, sourceOrder)
    interface DeclarationEntry {
      property: string;
      value: string;
      important: boolean;
      specNumeric: number;
      sourceOrder: number;
    }

    const entries: DeclarationEntry[] = [];
    for (const mr of matched) {
      for (const decl of mr.declarations) {
        entries.push({
          property: decl.property,
          value: decl.value,
          important: decl.important,
          specNumeric: mr.specificity.numeric,
          sourceOrder: mr.sourceOrder,
        });
      }
    }

    // Group by property
    const byProperty = new Map<string, DeclarationEntry[]>();
    for (const entry of entries) {
      const list = byProperty.get(entry.property) || [];
      list.push(entry);
      byProperty.set(entry.property, list);
    }

    // For each property, pick the winning declaration
    byProperty.forEach((list, prop) => {
      // Separate important and normal
      const important = list.filter((e: DeclarationEntry) => e.important);
      const normal = list.filter((e: DeclarationEntry) => !e.important);

      // Sort helper: higher specificity first, then later source order
      const sortDesc = (a: DeclarationEntry, b: DeclarationEntry) => {
        if (b.specNumeric !== a.specNumeric) return b.specNumeric - a.specNumeric;
        return b.sourceOrder - a.sourceOrder;
      };

      important.sort(sortDesc);
      normal.sort(sortDesc);

      // If any !important declaration exists, it wins over all normal
      const winner = important.length > 0 ? important[0] : normal[0];
      result[prop] = winner.value;

      if (winner.important) {
        result[`${prop}__important`] = '1';
      }
    });

    return result;
  }

  // ---- Inline style parsing ----

  /**
   * Parse the `style` attribute of an element into a property map.
   */
  private parseInlineStyle(node: HTMLNode): Record<string, string> {
    const styleStr = node.attributes?.style;
    if (!styleStr) return {};

    const result: Record<string, string> = {};
    // Split by semicolons, then by colon
    const declarations = styleStr.split(';');
    for (const decl of declarations) {
      const trimmed = decl.trim();
      if (!trimmed) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const prop = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim();
      // Check for !important
      if (/\s*!important\s*$/.test(val)) {
        result[prop] = val.replace(/\s*!important\s*$/, '').trim();
        result[`${prop}__important`] = '1';
      } else {
        result[prop] = val;
      }
    }
    return result;
  }

  // ---- CSS variable resolution ----

  /**
   * Resolve var() references in computed style values.
   * Handles fallback values: var(--name, fallback).
   * Iterates until no more var() references remain (supports nested vars).
   */
  private resolveVariables(computed: ComputedStyle, variables: Record<string, string>): void {
    const MAX_ITERATIONS = 10; // prevent infinite loops from cyclic vars
    let iteration = 0;

    let changed = true;
    while (changed && iteration < MAX_ITERATIONS) {
      changed = false;
      iteration++;

      for (const prop of Object.keys(computed)) {
        if (prop.endsWith('__important')) continue;
        const value = computed[prop];
        const resolved = this.resolveVarRefs(value, variables, computed);
        if (resolved !== value) {
          computed[prop] = resolved;
          changed = true;
        }
      }
    }
  }

  /**
   * Resolve all var() references in a single value string.
   */
  private resolveVarRefs(
    value: string,
    variables: Record<string, string>,
    computed: ComputedStyle,
  ): string {
    const varPattern = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*?))?\s*\)/g;
    return value.replace(varPattern, (_match, varName: string, fallback?: string) => {
      // Look up: variables dict first, then current computed styles
      const resolved =
        computed[varName] ??
        variables[varName] ??
        (fallback !== undefined ? fallback : '');
      return this.resolveVarRefs(resolved, variables, computed); // resolve nested
    });
  }

  // ---- calc() evaluation ----

  /**
   * Evaluate calc() expressions in computed style values.
   * Supports basic arithmetic: calc(100% - 20px), calc(50% + 10px), calc(2 * 100px).
   * The % is resolved relative to parentWidth.
   */
  private resolveCalc(computed: ComputedStyle, parentWidth: number): void {
    for (const prop of Object.keys(computed)) {
      if (prop.endsWith('__important')) continue;
      const value = computed[prop];
      if (/\bcalc\(/.test(value)) {
        computed[prop] = this.evaluateCalc(value, parentWidth);
      }
    }
  }

  /**
   * Evaluate a value containing calc() expressions.
   * Handles nested calc() and multiple calc() segments (e.g. "calc(50%) calc(20px)").
   */
  private evaluateCalc(value: string, parentWidth: number): string {
    // Replace all calc(...) occurrences
    return value.replace(/calc\(([^)]*)\)/gi, (_match, inner: string) => {
      const result = this.evaluateCalcExpression(inner, parentWidth);
      // If we got a clean number, format nicely
      if (result !== null) {
        // Determine unit from the original expression
        const unit = this.detectUnit(inner);
        const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(2);
        return `${formatted}${unit}`;
      }
      return value; // fallback: return original
    });
  }

  /**
   * Evaluate the inner expression of a calc().
   * Parses values with units (px, %, em, rem) and performs +, -, *, / operations.
   */
  private evaluateCalcExpression(expr: string, parentWidth: number): number | null {
    // Tokenise: numbers (with optional unit), operators (+, -, *, /), whitespace
    const tokens = this.tokeniseCalcExpr(expr);
    if (tokens.length === 0) return null;

    // Convert tokens to numeric values (in px)
    const values: number[] = [];
    const ops: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim();
      if (!token) continue;

      if (token === '+' || token === '-') {
        ops.push(token);
      } else if (token === '*' || token === '/') {
        ops.push(token);
      } else {
        // Value token — convert to px
        const num = this.parseCalcValue(token, parentWidth);
        if (num === null) return null;
        values.push(num);
      }
    }

    // Evaluate: handle * and / first (higher precedence), then + and -
    if (values.length === 0) return null;
    if (values.length === 1) return values[0];

    // Apply multiplication and division first
    let i = 0;
    const mulDivValues: number[] = [values[0]];
    const mulDivOps: string[] = [];

    for (let j = 0; j < ops.length; j++) {
      if (ops[j] === '*') {
        const last = mulDivValues.pop()!;
        mulDivValues.push(last * values[j + 1]);
      } else if (ops[j] === '/') {
        const last = mulDivValues.pop()!;
        const divisor = values[j + 1];
        mulDivValues.push(divisor !== 0 ? last / divisor : 0);
      } else {
        mulDivOps.push(ops[j]);
        mulDivValues.push(values[j + 1]);
      }
    }

    // Now apply + and - left to right
    let result = mulDivValues[0];
    for (let j = 0; j < mulDivOps.length; j++) {
      if (mulDivOps[j] === '+') {
        result += mulDivValues[j + 1];
      } else {
        result -= mulDivValues[j + 1];
      }
    }

    return result;
  }

  /**
   * Tokenise a calc() inner expression into alternating value and operator tokens.
   */
  private tokeniseCalcExpr(expr: string): string[] {
    const tokens: string[] = [];
    let current = '';

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
        // Check if this is a sign for a number (e.g. "-20px" at start or after an operator)
        const isSign = (current.trim() === '' && (ch === '-' || ch === '+'));
        if (isSign) {
          current += ch;
        } else {
          if (current.trim()) tokens.push(current.trim());
          tokens.push(ch);
          current = '';
        }
      } else if (ch === ' ' || ch === '\t') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += ch;
      }
    }

    if (current.trim()) tokens.push(current.trim());
    return tokens;
  }

  /**
   * Parse a single calc value token (e.g. "100%", "20px", "2em", "1.5rem", "50") to px.
   */
  private parseCalcValue(token: string, parentWidth: number): number | null {
    const t = token.trim().toLowerCase();
    if (t.endsWith('%')) {
      const num = parseFloat(t);
      return isNaN(num) ? null : (num / 100) * parentWidth;
    }
    if (t.endsWith('px')) {
      return parseFloat(t);
    }
    if (t.endsWith('em') || t.endsWith('rem')) {
      const num = parseFloat(t);
      return isNaN(num) ? null : num * 16;
    }
    // Bare number
    const num = parseFloat(t);
    return isNaN(num) ? null : num;
  }

  /**
   * Detect the predominant unit in a calc expression for output formatting.
   * Returns 'px' by default.
   */
  private detectUnit(expr: string): string {
    if (expr.includes('%')) return '%';
    if (expr.includes('em')) return 'em';
    if (expr.includes('rem')) return 'rem';
    return 'px';
  }
}
