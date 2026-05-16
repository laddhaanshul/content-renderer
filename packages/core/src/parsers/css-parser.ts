import {
  CSSDocument,
  CSSNode,
  CSSRule,
  CSSDeclaration,
  CSSMediaQuery,
  CSSKeyframes,
  ContentMetadata,
  ParseError,
  ParseWarning,
} from '../types';

export interface CSSParseOptions {
  preserveComments?: boolean;
  preserveWhitespace?: boolean;
}

export class CSSParser {
  private options: Required<CSSParseOptions>;

  constructor(options?: CSSParseOptions) {
    this.options = {
      preserveComments: options?.preserveComments ?? true,
      preserveWhitespace: options?.preserveWhitespace ?? false,
    };
  }

  parse(content: string, options?: CSSParseOptions): CSSDocument {
    const opts = { ...this.options, ...(options || {}) };
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    const nodes: CSSNode[] = [];
    const rules: CSSRule[] = [];
    const variables: Record<string, string> = {};
    const mediaQueries: CSSMediaQuery[] = [];
    const keyframes: CSSKeyframes[] = [];

    let pos = 0;
    const len = content.length;

    const self = this;
    function skipWhitespace(): void {
      while (pos < len && /\s/.test(content[pos])) pos++;
    }

    function readUntil(terminator: string): string {
      const start = pos;
      let depth = 1;
      while (pos < len && depth > 0) {
        if (terminator === '}' && content[pos] === '{') depth++;
        else if (content[pos] === terminator) depth--;
        if (depth > 0) pos++;
      }
      return content.slice(start, pos);
    }

    function parseComment(): CSSNode | null {
      if (content.slice(pos, pos + 2) !== '/*') return null;
      const start = pos;
      const end = content.indexOf('*/', pos + 2);
      if (end === -1) {
        errors.push({ message: 'Unclosed CSS comment', severity: 'error', code: 'UNCLOSED_COMMENT' });
        pos = len;
        return null;
      }
      pos = end + 2;
      return {
        type: 'comment',
        content: content.slice(start + 2, end).trim(),
      } as CSSNode;
    }

    function parseDeclaration(): CSSDeclaration | null {
      skipWhitespace();
      const start = pos;

      // Read property
      let property = '';
      while (pos < len && content[pos] !== ':' && content[pos] !== ';' && content[pos] !== '}') {
        property += content[pos];
        pos++;
      }

      property = property.trim();
      if (!property || content[pos] !== ':') {
        pos = start;
        return null;
      }

      pos++; // skip :
      skipWhitespace();

      // Read value
      let value = '';
      while (pos < len && content[pos] !== ';' && content[pos] !== '}') {
        value += content[pos];
        pos++;
      }

      value = value.trim();

      // Skip semicolon
      if (content[pos] === ';') pos++;

      // Check if important
      const important = /\s*!important\s*$/.test(value);
      if (important) {
        value = value.replace(/\s*!important\s*$/, '').trim();
      }

      // Check for CSS custom properties (variables)
      if (property.startsWith('--')) {
        variables[property] = value;
      }

      return { property, value, important };
    }

    function parseDeclarationsBlock(): CSSDeclaration[] {
      pos++; // skip {
      const declarations: CSSDeclaration[] = [];

      while (pos < len && content[pos] !== '}') {
        skipWhitespace();

        // Comment
        if (content.slice(pos, pos + 2) === '/*') {
          const comment = parseComment();
          if (comment && opts.preserveComments) {
            // Comments inside declaration blocks are stored inline
          }
          continue;
        }

        // Nested rule
        if (content[pos] === '@') {
          // Skip nested at-rules inside blocks for simplicity
          const nestedAtRule = parseAtRule();
          if (nestedAtRule) {
            // Store nested at-rule as a node
          }
          continue;
        }

        const decl = parseDeclaration();
        if (decl) {
          declarations.push(decl);
        } else if (content[pos] !== '}') {
          // Only advance if not already at the closing brace
          pos++;
        } else {
          break; // Exit to let the outer check handle the '}'
        }
      }

      if (content[pos] === '}') pos++;
      return declarations;
    }

    function parseSelectors(): string[] {
      let selectorStr = '';
      while (pos < len && content[pos] !== '{' && content[pos] !== ';' && content[pos] !== '}') {
        if (content.slice(pos, pos + 2) === '/*') {
          const comment = parseComment();
          if (comment) continue;
        }
        selectorStr += content[pos];
        pos++;
      }
      return selectorStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    function parseRule(): CSSRule | null {
      // Save position so we can backtrack if selectors are empty
      const savedPos = pos;
      const selectors = parseSelectors();
      if (selectors.length === 0 || content[pos] !== '{') {
        pos = savedPos;
        return null;
      }

      const declarations = parseDeclarationsBlock();
      const rule: CSSRule = { selectors, declarations, specificity: 0 };

      // Calculate specificity for each selector and take the max
      if (selectors.length > 0) {
        rule.specificity = Math.max(...selectors.map(s => self.calculateSpecificity(s)));
      }

      return rule;
    }

    function parseAtRule(): CSSNode | null {
      pos++; // skip @
      const nameStart = pos;
      while (pos < len && /[\w-]/.test(content[pos])) pos++;
      const atRuleName = content.slice(nameStart, pos);
      skipWhitespace();

      if (atRuleName === 'media') {
        // Read media condition
        let condition = '';
        while (pos < len && content[pos] !== '{') {
          condition += content[pos];
          pos++;
        }
        condition = condition.trim();

        // Parse rules inside media query
        pos++; // skip {
        const mediaRules: CSSRule[] = [];
        const mediaChildren: CSSNode[] = [];

        while (pos < len && content[pos] !== '}') {
          skipWhitespace();
          if (content.slice(pos, pos + 2) === '/*') {
            const comment = parseComment();
            if (comment && opts.preserveComments) mediaChildren.push(comment);
            continue;
          }
          if (content[pos] === '@') {
            const nestedAtRule = parseAtRule();
            if (nestedAtRule) mediaChildren.push(nestedAtRule);
            continue;
          }
          const rule = parseRule();
          if (rule) {
            mediaRules.push(rule);
            mediaChildren.push({
              type: 'rule',
              selectors: rule.selectors,
              declarations: rule.declarations,
            });
          } else if (content[pos] !== '}') {
            pos++;
          }
        }

        if (content[pos] === '}') pos++;

        const mediaQuery: CSSMediaQuery = { condition, rules: mediaRules };
        mediaQueries.push(mediaQuery);

        const node: CSSNode = {
          type: 'at-rule',
          media: condition,
          declarations: [],
          children: mediaChildren,
        };
        nodes.push(node);
        return node;
      }

      // Handle keyframes (including vendor-prefixed: @-webkit-keyframes, @-moz-keyframes, etc.)
      if (atRuleName === 'keyframes' || atRuleName.endsWith('-keyframes')) {
        skipWhitespace();
        let name = '';
        while (pos < len && content[pos] !== '{') {
          name += content[pos];
          pos++;
        }
        name = name.trim();

        pos++; // skip opening {
        const frames: { offset: number; declarations: CSSDeclaration[] }[] = [];

        while (pos < len && content[pos] !== '}') {
          skipWhitespace();
          if (pos >= len || content[pos] === '}') break;
          if (content.slice(pos, pos + 2) === '/*') {
            parseComment();
            continue;
          }

          // Parse frame selector (0%, 50%, 100%, from, to)
          let frameSelector = '';
          while (pos < len && content[pos] !== '{' && content[pos] !== '}') {
            frameSelector += content[pos];
            pos++;
          }
          frameSelector = frameSelector.trim();

          if (pos >= len || content[pos] !== '{') break;
          // parseDeclarationsBlock expects to be AT the '{', it skips it internally
          const frameDecls = parseDeclarationsBlock();

          let offset = 0;
          const selectorMatch = frameSelector.match(/(\d+)%/);
          if (selectorMatch) {
            offset = parseInt(selectorMatch[1], 10);
          } else if (frameSelector === 'from') {
            offset = 0;
          } else if (frameSelector === 'to') {
            offset = 100;
          }

          if (frameSelector) {
            frames.push({ offset, declarations: frameDecls });
          }
        }

        if (pos < len && content[pos] === '}') pos++;

        keyframes.push({ name, frames });

        const node: CSSNode = {
          type: 'at-rule',
          value: name,
          declarations: [],
        };
        nodes.push(node);
        return node;
      }

      if (atRuleName === 'import' || atRuleName === 'charset' || atRuleName === 'font-face' || atRuleName === 'namespace') {
        let value = '';
        while (pos < len && content[pos] !== ';' && content[pos] !== '}') {
          value += content[pos];
          pos++;
        }
        if (content[pos] === ';') pos++;

        const node: CSSNode = {
          type: 'at-rule',
          value: value.trim(),
          declarations: [],
        };
        nodes.push(node);
        return node;
      }

      if (atRuleName === 'supports' || atRuleName === 'layer' || atRuleName === 'container') {
        let condition = '';
        while (pos < len && content[pos] !== '{') {
          condition += content[pos];
          pos++;
        }
        condition = condition.trim();

        pos++; // skip {
        const nestedRules: CSSRule[] = [];

        while (pos < len && content[pos] !== '}') {
          skipWhitespace();
          if (content.slice(pos, pos + 2) === '/*') {
            parseComment();
            continue;
          }
          if (content[pos] === '@') {
            parseAtRule();
            continue;
          }
          const rule = parseRule();
          if (rule) nestedRules.push(rule);
          else if (content[pos] !== '}') pos++;
        }

        if (content[pos] === '}') pos++;

        const node: CSSNode = {
          type: 'at-rule',
          media: condition,
          declarations: [],
          children: nestedRules.map((r) => ({
            type: 'rule' as const,
            selectors: r.selectors,
            declarations: r.declarations,
          })),
        };
        nodes.push(node);
        return node;
      }

      // Generic at-rule fallback
      let genericValue = '';
      let braceCount = 1;
      if (content[pos] === '{') {
        pos++;
        while (pos < len && braceCount > 0) {
          if (content[pos] === '{') braceCount++;
          if (content[pos] === '}') braceCount--;
          if (braceCount > 0) genericValue += content[pos];
          pos++;
        }
      } else {
        while (pos < len && content[pos] !== ';' && content[pos] !== '{') {
          genericValue += content[pos];
          pos++;
        }
        if (content[pos] === ';') pos++;
        if (content[pos] === '{') {
          pos++;
          braceCount = 1;
          while (pos < len && braceCount > 0) {
            if (content[pos] === '{') braceCount++;
            if (content[pos] === '}') braceCount--;
            if (braceCount > 0) genericValue += content[pos];
            pos++;
          }
        }
      }

      const node: CSSNode = {
        type: 'at-rule',
        value: genericValue.trim(),
        declarations: [],
      };
      nodes.push(node);
      return node;
    }

    // Main parse loop
    while (pos < len) {
      skipWhitespace();
      if (pos >= len) break;

      if (content.slice(pos, pos + 2) === '/*') {
        const comment = parseComment();
        if (comment && opts.preserveComments) nodes.push(comment);
        continue;
      }

      if (content[pos] === '@') {
        const beforeAt = pos;
        parseAtRule();
        // If parseAtRule didn't advance, skip the '@' to avoid infinite loop
        if (pos === beforeAt) pos++;
        continue;
      }

      // Skip stray closing braces
      if (content[pos] === '}') {
        pos++;
        continue;
      }

      // Handle bare property: value; declarations without a selector block (e.g. vendor prefixes at root)
      // These won't have a '{' so parseRule will return null; emit them as at-rule nodes
      const colon = content.indexOf(':', pos);
      const semi = content.indexOf(';', pos);
      const brace = content.indexOf('{', pos);
      const closeBrace = content.indexOf('}', pos);
      if (
        colon !== -1 &&
        semi !== -1 &&
        colon < semi &&
        (brace === -1 || semi < brace) &&
        (closeBrace === -1 || semi < closeBrace)
      ) {
        const beforeRule = pos;
        const rule = parseRule();
        if (rule) {
          rules.push(rule);
          nodes.push({ type: 'rule', selectors: rule.selectors, declarations: rule.declarations });
        } else {
          // Bare declaration: read to semicolon and emit as a node
          let bareDecl = '';
          while (pos < len && content[pos] !== ';' && content[pos] !== '}') {
            bareDecl += content[pos++];
          }
          if (content[pos] === ';') pos++;
          if (bareDecl.includes(':')) {
            nodes.push({ type: 'at-rule', value: bareDecl.trim(), declarations: [] });
          } else if (pos === beforeRule) {
            pos++;
          }
        }
        continue;
      }

      const beforeRule = pos;
      const rule = parseRule();
      if (rule) {
        rules.push(rule);
        nodes.push({ type: 'rule', selectors: rule.selectors, declarations: rule.declarations });
      } else {
        // parseRule backtracked to beforeRule; advance one char to avoid infinite loop
        if (pos === beforeRule) pos++;
      }
    }

    const metadata: ContentMetadata = {
      size: content.length,
      lineCount: content.split('\n').length,
    };

    return {
      nodes,
      metadata,
      rules,
      variables,
      mediaQueries,
      keyframes,
    };
  }

  private calculateSpecificity(selector: string): number {
    let a = 0; // IDs
    let b = 0; // classes, attributes, pseudo-classes
    let c = 0; // elements, pseudo-elements

    // Remove pseudo-element and pseudo-class for counting
    const cleanSelector = selector.replace(/\s*,\s*/g, ' ');

    // Count IDs
    const idMatches = cleanSelector.match(/#[\w-]+/g);
    a += idMatches ? idMatches.length : 0;

    // Count classes, attributes, pseudo-classes
    const classMatches = cleanSelector.match(/\.[\w-]+/g);
    b += classMatches ? classMatches.length : 0;

    const attrMatches = cleanSelector.match(/\[[^\]]+\]/g);
    b += attrMatches ? attrMatches.length : 0;

    const pseudoClassMatches = cleanSelector.match(/:[\w-]+(?:\([^)]*\))?/g);
    if (pseudoClassMatches) {
      for (const match of pseudoClassMatches) {
        if (match.startsWith('::')) continue;
        b++;
      }
    }

    // Count elements and pseudo-elements
    // Simplified: elements are words not preceded by . or # or [
    const elementMatches = cleanSelector.match(/(?:^|[\s>+~])([a-zA-Z][\w-]*)/g);
    if (elementMatches) {
      for (const match of elementMatches) {
        const name = match.trim().replace(/^[>+~]\s*/, '');
        if (name && !/^(?:before|after|first-letter|first-line|selection|backdrop|marker|spelling-error|grammar-error)$/i.test(name)) {
          c++;
        }
      }
    }

    const pseudoElementMatches = cleanSelector.match(/::[\w-]+/g);
    c += pseudoElementMatches ? pseudoElementMatches.length : 0;

    // Specificity is usually represented as (a, b, c)
    return a * 100 + b * 10 + c;
  }

  serialize(doc: CSSDocument): string {
    let result = '';

    for (const node of doc.nodes) {
      result += this.serializeNode(node);
    }

    return result.trim();
  }

  private serializeNode(node: CSSNode, indent: string = ''): string {
    switch (node.type) {
      case 'comment':
        return `${indent}${(node as any).content || ''}\n`;

      case 'rule': {
        const selectorStr = (node.selectors || []).join(', ');
        const declStr = (node.declarations || [])
          .map((d) => `${indent}  ${d.property}: ${d.value}${d.important ? ' !important' : ''};`)
          .join('\n');
        return `${indent}${selectorStr} {\n${declStr}\n${indent}}\n\n`;
      }

      case 'at-rule': {
        if (node.media && node.children) {
          let result = `${indent}@media ${node.media} {\n`;
          for (const child of node.children) {
            result += this.serializeNode(child, indent + '  ');
          }
          result += `${indent}}\n\n`;
          return result;
        }
        if (node.value) {
          if (node.declarations && node.declarations.length > 0) {
            const declStr = node.declarations
              .map((d) => `${indent}  ${d.property}: ${d.value}${d.important ? ' !important' : ''};`)
              .join('\n');
            return `${indent}@${node.value} {\n${declStr}\n${indent}}\n\n`;
          }
          return `${indent}@${node.value};\n`;
        }
        return '';
      }

      case 'declaration':
        return `${indent}${node.property}: ${node.value}${node.important ? ' !important' : ''};\n`;

      default:
        return '';
    }
  }

  validate(content: string): { valid: boolean; errors: ParseError[]; warnings: ParseWarning[] } {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    if (!content.trim()) {
      errors.push({ message: 'Empty content', severity: 'error', code: 'EMPTY_CONTENT' });
      return { valid: false, errors, warnings };
    }

    // Check balanced braces
    let braceCount = 0;
    let inComment = false;
    let inString: string | null = null;

    for (let i = 0; i < content.length; i++) {
      const ch = content[i];

      if (inComment) {
        if (ch === '*' && content[i + 1] === '/') {
          inComment = false;
          i++;
        }
        continue;
      }

      if (inString) {
        if (ch === inString && content[i - 1] !== '\\') {
          inString = null;
        }
        continue;
      }

      if (ch === '/' && content[i + 1] === '*') {
        inComment = true;
        i++;
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }

      if (ch === '{') braceCount++;
      else if (ch === '}') {
        braceCount--;
        if (braceCount < 0) {
          errors.push({
            message: 'Unmatched closing brace',
            severity: 'error',
            code: 'UNMATCHED_BRACE',
          });
          braceCount = 0;
        }
      }
    }

    if (inComment) {
      errors.push({
        message: 'Unclosed comment',
        severity: 'error',
        code: 'UNCLOSED_COMMENT',
      });
    }

    if (braceCount > 0) {
      errors.push({
        message: `${braceCount} unclosed brace(s)`,
        severity: 'error',
        code: 'UNCLOSED_BRACES',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getVariables(content: string): Record<string, string> {
    const doc = this.parse(content);
    return doc.variables;
  }

  getMediaQueries(content: string): CSSMediaQuery[] {
    const doc = this.parse(content);
    return doc.mediaQueries;
  }

  getKeyframes(content: string): CSSKeyframes[] {
    const doc = this.parse(content);
    return doc.keyframes;
  }

  getRulesBySelector(content: string, selectorPattern: string | RegExp): CSSRule[] {
    const doc = this.parse(content);
    const regex = typeof selectorPattern === 'string' ? new RegExp(selectorPattern) : selectorPattern;
    return doc.rules.filter((rule) => rule.selectors.some((s) => regex.test(s)));
  }

  getDeclarationsByProperty(content: string, property: string): CSSDeclaration[] {
    const doc = this.parse(content);
    const results: CSSDeclaration[] = [];
    for (const rule of doc.rules) {
      for (const decl of rule.declarations) {
        if (decl.property === property) {
          results.push(decl);
        }
      }
    }
    return results;
  }

  minify(content: string): string {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
      .replace(/;}/g, '}') // Remove last semicolons
      .trim();
  }

  format(content: string, indentSize: number = 2): string {
    const doc = this.parse(content, { preserveComments: true });
    const indent = ' '.repeat(indentSize);

    let result = '';
    for (const node of doc.nodes) {
      result += this.serializeNode(node, '');
    }
    return result.trim();
  }
}

export default CSSParser;
