// ==========================================
// CSS Selector Engine
// ==========================================
// Lean, zero-dependency CSS selector matcher and specificity calculator.
// Supports: universal, type, class, ID, attribute (all 7 operators),
// pseudo-classes (:first-child, :last-child, :nth-child, :not),
// compound selectors, combinators (descendant, child, adjacent, general sibling),
// and comma-separated selector lists.

import type { HTMLNode } from '../types';

// ---- Lightweight selector AST types ----

/** A single simple selector within a compound (e.g. "div", ".foo", "[attr=val]") */
export interface SimpleSelector {
  kind: 'universal' | 'type' | 'class' | 'id' | 'attribute' | 'pseudo';
  /** For type/class/id: the name. For attribute: { name, op?, value? }. For pseudo: { name, arg? } */
  value?: string;
  /** Attribute operator: ~, |, ^, $, *, or exact (undefined) */
  attrOp?: string;
  attrValue?: string;
  /** Pseudo-class name */
  pseudoName?: string;
  /** Pseudo-class argument (e.g. "2n+1" for nth-child) */
  pseudoArg?: string;
}

/** A compound selector is a sequence of simple selectors applied to the same element */
export interface CompoundSelector {
  simpleSelectors: SimpleSelector[];
}

/**
 * A combinator connecting two compound selectors.
 * '' = descendant, '>' = child, '+' = adjacent sibling, '~' = general sibling
 */
export type Combinator = '' | '>' | '+' | '~';

/** A full selector = alternating compounds and combinators, ending with a compound */
export interface SelectorChain {
  compounds: CompoundSelector[];
  combinators: Combinator[];
}

// ---- Element shape accepted by matchSelector ----

export interface SelectorElement {
  tag?: string;
  attributes?: Record<string, string>;
  parent?: SelectorElement | null;
  children?: SelectorElement[];
  type?: string;
  content?: string;
}

// ---- nth-child formula parser ----

interface NthFormula {
  offset: number;
  step: number;
}

const NTH_KEYWORDS: Record<string, NthFormula> = {
  odd: { step: 2, offset: 1 },
  even: { step: 2, offset: 0 },
};

function parseNthExpression(expr: string): NthFormula | null {
  const trimmed = expr.trim().toLowerCase();
  if (NTH_KEYWORDS[trimmed]) return { ...NTH_KEYWORDS[trimmed] };

  // Match patterns: "3", "n", "2n", "2n+1", "-n+3", "n+2", "2n-1"
  const match = trimmed.match(/^([+-]?\d*)n\s*([+-]\s*\d+)?$/i);
  if (match) {
    const stepStr = match[1];
    const step = stepStr === '' || stepStr === '+' ? 1
      : stepStr === '-' ? -1
      : parseInt(stepStr, 10);
    const offset = match[2] ? parseInt(match[2].replace(/\s/g, ''), 10) : 0;
    return { step, offset };
  }

  // Plain number
  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) return { step: 0, offset: num };

  return null;
}

function matchesNth(index: number, formula: NthFormula): boolean {
  // index is 1-based
  if (formula.step === 0) return index === formula.offset;
  const diff = index - formula.offset;
  if (diff === 0) return true;
  if ((diff > 0 && formula.step > 0) || (diff < 0 && formula.step < 0)) {
    return diff % formula.step === 0;
  }
  return false;
}

// ---- Selector string tokeniser ----

/**
 * Tokenise a single (non-comma-separated) selector string into a SelectorChain.
 * e.g. "div.foo > p:first-child[data-x]" =>
 *   compounds: [{simpleSelectors: [{kind:'type',value:'div'},{kind:'class',value:'foo'}]}, ...]
 *   combinators: ['>']
 */
function parseSelectorChain(selector: string): SelectorChain {
  const compounds: CompoundSelector[] = [];
  const combinators: Combinator[] = [];
  let i = 0;
  const len = selector.length;

  function skipWhitespace(): void {
    while (i < len && /\s/.test(selector[i])) i++;
  }

  // Read a single compound selector starting at position i
  function readCompound(): CompoundSelector {
    const simples: SimpleSelector[] = [];

    while (i < len) {
      const ch = selector[i];

      if (ch === ' ' || ch === '>' || ch === '+' || ch === '~' || ch === ',') break;

      if (ch === '*') {
        simples.push({ kind: 'universal' });
        i++;
        continue;
      }

      if (ch === '.') {
        // Class selector
        i++;
        let name = '';
        while (i < len && /[\w-]/.test(selector[i])) { name += selector[i]; i++; }
        simples.push({ kind: 'class', value: name });
        continue;
      }

      if (ch === '#') {
        // ID selector
        i++;
        let name = '';
        while (i < len && /[\w-]/.test(selector[i])) { name += selector[i]; i++; }
        simples.push({ kind: 'id', value: name });
        continue;
      }

      if (ch === '[') {
        // Attribute selector
        i++;
        let attrName = '';
        while (i < len && selector[i] !== '=' && selector[i] !== ']' && selector[i] !== '~' && selector[i] !== '|' && selector[i] !== '^' && selector[i] !== '$' && selector[i] !== '*') {
          attrName += selector[i]; i++;
        }
        attrName = attrName.trim();

        if (i < len && selector[i] === ']') {
          simples.push({ kind: 'attribute', value: attrName });
          i++;
          continue;
        }

        // Determine operator
        let op = '';
        if (i < len && '~|_^$*'.includes(selector[i])) {
          op = selector[i]; i++;
          if (i < len && selector[i] === '=') { op += '='; i++; }
        } else if (i < len && selector[i] === '=') {
          op = '='; i++;
        }

        // Read value (quoted or unquoted)
        let attrValue = '';
        if (i < len && (selector[i] === '"' || selector[i] === "'")) {
          const quote = selector[i]; i++;
          while (i < len && selector[i] !== quote) { attrValue += selector[i]; i++; }
          if (i < len) i++; // skip closing quote
        } else {
          while (i < len && selector[i] !== ']') { attrValue += selector[i]; i++; }
        }
        attrValue = attrValue.trim();

        if (i < len && selector[i] === ']') i++;

        simples.push({ kind: 'attribute', value: attrName, attrOp: op, attrValue });
        continue;
      }

      if (ch === ':') {
        // Pseudo-class
        i++;
        let pseudoName = '';
        while (i < len && /[\w-]/.test(selector[i])) { pseudoName += selector[i]; i++; }

        let pseudoArg: string | undefined;
        if (i < len && selector[i] === '(') {
          i++; // skip (
          let depth = 1;
          pseudoArg = '';
          while (i < len && depth > 0) {
            if (selector[i] === '(') depth++;
            if (selector[i] === ')') depth--;
            if (depth > 0) pseudoArg += selector[i];
            i++;
          }
          pseudoArg = pseudoArg!.trim();
        }

        simples.push({ kind: 'pseudo', pseudoName, pseudoArg });
        continue;
      }

      // Type selector (tag name)
      if (/[a-zA-Z_]/.test(ch) || ch === '-') {
        let tagName = '';
        while (i < len && /[\w-]/.test(selector[i])) { tagName += selector[i]; i++; }
        simples.push({ kind: 'type', value: tagName.toLowerCase() });
        continue;
      }

      // Skip unknown characters
      i++;
    }

    return { simpleSelectors: simples };
  }

  while (i < len) {
    skipWhitespace();
    if (i >= len) break;

    // If we already have compounds, the whitespace we just skipped (or an explicit
    // combinator symbol) separates the previous compound from the next one.
    if (compounds.length > 0) {
      const ch = selector[i];
      if (ch === '>') {
        combinators.push('>');
        i++;
        skipWhitespace();
      } else if (ch === '+') {
        combinators.push('+');
        i++;
        skipWhitespace();
      } else if (ch === '~') {
        combinators.push('~');
        i++;
        skipWhitespace();
      } else if (ch === ',') {
        break; // handled at the top level
      } else {
        // The whitespace we consumed above IS the descendant combinator
        combinators.push('');
      }
    }

    if (i >= len) break;

    const compound = readCompound();
    if (compound.simpleSelectors.length > 0) {
      compounds.push(compound);
    }
  }

  return { compounds, combinators };
}

// ---- Simple selector matching ----

function matchSimpleSelector(el: SelectorElement, sel: SimpleSelector): boolean {
  switch (sel.kind) {
    case 'universal':
      return true;

    case 'type':
      return el.tag != null && el.tag.toLowerCase() === sel.value!.toLowerCase();

    case 'class': {
      const classAttr = el.attributes?.class || '';
      const classes = classAttr.split(/\s+/).filter(Boolean);
      return classes.includes(sel.value!);
    }

    case 'id':
      return (el.attributes?.id || '') === sel.value;

    case 'attribute': {
      const attrVal = sel.value ? (el.attributes as Record<string, string> | undefined)?.[sel.value] ?? undefined : undefined;
      // attrVal is undefined when attribute doesn't exist
      if (sel.attrOp === undefined || sel.attrOp === '') {
        // [attr] — just check existence
        return sel.value != null && el.attributes != null && sel.value in el.attributes;
      }
      if (attrVal === undefined) return false;

      const target = sel.attrValue || '';
      switch (sel.attrOp) {
        case '=':
          return attrVal === target;
        case '~=':
          return attrVal.split(/\s+/).includes(target);
        case '|=':
          return attrVal === target || attrVal.startsWith(target + '-');
        case '^=':
          return attrVal.startsWith(target);
        case '$=':
          return attrVal.endsWith(target);
        case '*=':
          return attrVal.includes(target);
        default:
          return false;
      }
    }

    case 'pseudo':
      return matchPseudoClass(el, sel.pseudoName!, sel.pseudoArg);

    default:
      return false;
  }
}

// ---- Pseudo-class matching ----

function matchPseudoClass(el: SelectorElement, name: string, arg?: string): boolean {
  switch (name.toLowerCase()) {
    case 'first-child': {
      if (!el.parent?.children) return false;
      const siblings = el.parent.children.filter(isElementNode);
      return siblings.length > 0 && siblings[0] === el;
    }

    case 'last-child': {
      if (!el.parent?.children) return false;
      const siblings = el.parent.children.filter(isElementNode);
      return siblings.length > 0 && siblings[siblings.length - 1] === el;
    }

    case 'nth-child': {
      if (!el.parent?.children || arg == null) return false;
      const formula = parseNthExpression(arg);
      if (!formula) return false;
      const siblings = el.parent.children.filter(isElementNode);
      const index = siblings.indexOf(el) + 1; // 1-based
      if (index === 0) return false;
      return matchesNth(index, formula);
    }

    case 'only-child': {
      if (!el.parent?.children) return false;
      return el.parent.children.filter(isElementNode).length === 1;
    }

    case 'root': {
      return el.parent == null || el.parent === undefined;
    }

    case 'empty': {
      if (!el.children) return true;
      return el.children.length === 0;
    }

    case 'not': {
      if (arg == null) return true;
      // Parse the inner selector and negate
      const innerChain = parseSelectorChain(arg);
      return !matchSelectorChain(el, innerChain);
    }

    default:
      // Unknown pseudo-class — conservatively don't match
      return false;
  }
}

function isElementNode(node: SelectorElement): boolean {
  return node.type !== 'text' && node.type !== 'comment';
}

// ---- Compound selector matching (all simples must match) ----

function matchCompound(el: SelectorElement, compound: CompoundSelector): boolean {
  return compound.simpleSelectors.every(s => matchSimpleSelector(el, s));
}

// ---- Full selector chain matching (with combinators) ----

/**
 * Match a SelectorChain against an element.
 * The rightmost compound is the subject; we walk left using combinators.
 */
function matchSelectorChain(el: SelectorElement, chain: SelectorChain): boolean {
  if (chain.compounds.length === 0) return false;

  // Start from the rightmost compound (the subject)
  const subjectIdx = chain.compounds.length - 1;
  if (!matchCompound(el, chain.compounds[subjectIdx])) return false;

  // No combinators means just a single compound
  if (subjectIdx === 0) return true;

  // Walk backwards through combinators
  return matchChainRecursive(el, chain, subjectIdx - 1);
}

function matchChainRecursive(el: SelectorElement, chain: SelectorChain, compoundIdx: number): boolean {
  if (compoundIdx < 0) return true;

  const combinator = chain.combinators[compoundIdx];
  const compound = chain.compounds[compoundIdx];

  switch (combinator) {
    case '': {
      // Descendant — any ancestor
      let ancestor = el.parent;
      while (ancestor) {
        if (matchCompound(ancestor, compound)) {
          if (compoundIdx === 0) return true;
          if (matchChainRecursive(ancestor, chain, compoundIdx - 1)) return true;
        }
        ancestor = ancestor.parent || null;
      }
      return false;
    }

    case '>': {
      // Child — direct parent
      const parent = el.parent;
      if (!parent) return false;
      if (!matchCompound(parent, compound)) return false;
      if (compoundIdx === 0) return true;
      return matchChainRecursive(parent, chain, compoundIdx - 1);
    }

    case '+': {
      // Adjacent sibling — immediately preceding element sibling
      if (!el.parent?.children) return false;
      const siblings = el.parent.children.filter(isElementNode);
      const myIdx = siblings.indexOf(el);
      if (myIdx <= 0) return false;
      const prev = siblings[myIdx - 1];
      if (!matchCompound(prev, compound)) return false;
      if (compoundIdx === 0) return true;
      return matchChainRecursive(prev, chain, compoundIdx - 1);
    }

    case '~': {
      // General sibling — any preceding element sibling
      if (!el.parent?.children) return false;
      const siblings = el.parent.children.filter(isElementNode);
      const myIdx = siblings.indexOf(el);
      for (let j = myIdx - 1; j >= 0; j--) {
        if (matchCompound(siblings[j], compound)) {
          if (compoundIdx === 0) return true;
          if (matchChainRecursive(siblings[j], chain, compoundIdx - 1)) return true;
        }
      }
      return false;
    }

    default:
      return false;
  }
}

// ---- Public API ----

/**
 * Test whether `element` matches the given CSS `selector` string.
 * Supports: *, tag, .class, #id, [attr ops], :pseudo-classes, combinators, commas.
 */
export function matchSelector(
  selector: string,
  element: { tag?: string; attributes?: Record<string, string>; parent?: any; children?: any[] },
): boolean {
  if (!selector.trim()) return false;

  // Split comma-separated selector list
  const selectorList = splitSelectorList(selector);

  // Any one matching is sufficient
  return selectorList.some(s => {
    const chain = parseSelectorChain(s);
    return matchSelectorChain(element as SelectorElement, chain);
  });
}

/**
 * Split a selector string by top-level commas, respecting parentheses and brackets.
 */
function splitSelectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

// ---- Specificity Calculation ----

export interface SpecificityResult {
  /** Inline styles (always 0 for selector specificity) */
  a: number;
  /** Number of ID selectors */
  b: number;
  /** Number of class selectors, attribute selectors, pseudo-classes (except :not internals) */
  c: number;
  /** Number of type selectors and pseudo-elements */
  d: number;
  /** Human-readable string like "0,1,2,3" */
  value: string;
  /** Comparable numeric value */
  numeric: number;
}

/**
 * Calculate the CSS specificity of a selector string.
 * Returns { a, b, c, d, value, numeric }.
 *
 * For comma-separated selectors, returns the highest specificity among the list.
 */
export function calculateSpecificity(selector: string): SpecificityResult {
  const selectorList = splitSelectorList(selector);
  let best: SpecificityResult = { a: 0, b: 0, c: 0, d: 0, value: '0,0,0,0', numeric: 0 };

  for (const sel of selectorList) {
    const chain = parseSelectorChain(sel);
    const spec = calcCompoundChainSpecificity(chain);
    const { b, c, d } = spec;

    const numeric = b * 10000 + c * 100 + d;
    if (numeric > best.numeric) {
      best = { a: 0, b, c, d, value: `0,${b},${c},${d}`, numeric };
    }
  }

  return best;
}

/**
 * Cleanly calculate specificity for a parsed SelectorChain.
 */
function calcCompoundChainSpecificity(chain: SelectorChain): { b: number; c: number; d: number } {
  let b = 0, c = 0, d = 0;

  for (const compound of chain.compounds) {
    for (const simple of compound.simpleSelectors) {
      switch (simple.kind) {
        case 'universal':
          break;
        case 'id':
          b++;
          break;
        case 'class':
          c++;
          break;
        case 'attribute':
          c++;
          break;
        case 'type':
          d++;
          break;
        case 'pseudo': {
          if (simple.pseudoName?.toLowerCase() === 'not' && simple.pseudoArg) {
            // :not() contributes the specificity of its most specific argument
            const innerSpec = calculateSpecificity(simple.pseudoArg);
            b += innerSpec.b;
            c += innerSpec.c;
            d += innerSpec.d;
          } else {
            c++; // other pseudo-classes count at class level
          }
          break;
        }
      }
    }
  }

  return { b, c, d };
}
