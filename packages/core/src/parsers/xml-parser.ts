import {
  XMLDocument,
  XMLDeclaration,
  XMLNode,
  ContentMetadata,
  ParseError,
  ParseWarning,
  ValidationResult,
} from '../types';

export interface XMLParseOptions {
  preserveWhitespace?: boolean;
  preserveComments?: boolean;
  stripNamespaces?: boolean;
  attributeNamePrefix?: string;
}

export class XMLParser {
  private options: Required<XMLParseOptions>;

  constructor(options?: XMLParseOptions) {
    this.options = {
      preserveWhitespace: options?.preserveWhitespace ?? false,
      preserveComments: options?.preserveComments ?? true,
      stripNamespaces: options?.stripNamespaces ?? false,
      attributeNamePrefix: options?.attributeNamePrefix ?? '@',
    };
  }

  parse(content: string, options?: XMLParseOptions): XMLDocument {
    const opts = { ...this.options, ...(options || {}) };
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    let declaration: XMLDeclaration | undefined;
    const allNodes: XMLNode[] = [];

    let pos = 0;
    const len = content.length;

    function skipWhitespace(): void {
      while (pos < len && /\s/.test(content[pos])) pos++;
    }

    function readUntil(char: string): string {
      const start = pos;
      while (pos < len && content[pos] !== char) pos++;
      return content.slice(start, pos);
    }

    function readName(): string {
      let name = '';
      while (pos < len && /[\w:.-]/.test(content[pos])) {
        name += content[pos];
        pos++;
      }
      return name;
    }

    function parseAttributes(): Record<string, string> {
      const attrs: Record<string, string> = {};
      skipWhitespace();
      while (pos < len && content[pos] !== '>' && content[pos] !== '/' && !(content[pos] === '?' && content[pos + 1] === '>')) {
        const name = readName();
        if (!name) break;
        skipWhitespace();
        let value = '';
        if (content[pos] === '=') {
          pos++;
          skipWhitespace();
          const quote = content[pos];
          if (quote === '"' || quote === "'") {
            pos++;
            value = readUntil(quote);
            pos++; // skip closing quote
          } else {
            value = readName();
          }
        }
        attrs[name] = value;
        skipWhitespace();
      }
      return attrs;
    }

    function parseText(): XMLNode {
      const start = pos;
      while (pos < len && content[pos] !== '<') pos++;
      return {
        type: 'text',
        content: content.slice(start, pos),
      };
    }

    function parseComment(): XMLNode {
      pos += 4; // skip <!--
      const start = pos;
      while (pos < len && !(content[pos] === '-' && content[pos + 1] === '-' && content[pos + 2] === '>')) {
        pos++;
      }
      const commentContent = content.slice(start, pos);
      pos += 3; // skip -->
      return {
        type: 'comment',
        content: commentContent,
      };
    }

    function parseCDATA(): XMLNode {
      pos += 9; // skip <![CDATA[
      const start = pos;
      while (pos < len && !(content[pos] === ']' && content[pos + 1] === ']' && content[pos + 2] === '>')) {
        pos++;
      }
      const cdataContent = content.slice(start, pos);
      pos += 3; // skip ]]>
      return {
        type: 'cdata',
        content: cdataContent,
      };
    }

    function parseProcessingInstruction(): XMLNode {
      pos += 2; // skip <?
      const name = readName();
      const attrs = parseAttributes();
      if (content[pos] === '?' && content[pos + 1] === '>') pos += 2;
      return {
        type: 'processing-instruction',
        name,
        attributes: attrs,
      };
    }

    function parseElement(): XMLNode {
      pos++; // skip <
      const name = readName();

      let prefix: string | undefined;
      let localName = name;
      if (opts.stripNamespaces && name.includes(':')) {
        prefix = name.split(':')[0];
        localName = name.split(':').slice(1).join(':');
      } else if (name.includes(':')) {
        prefix = name.split(':')[0];
      }

      const attributes = parseAttributes();
      const children: XMLNode[] = [];

      let selfClosing = false;
      if (content[pos] === '/') {
        selfClosing = true;
        pos += 2; // skip />
      } else if (content[pos] === '>') {
        pos++; // skip >
        // Parse children until closing tag
        while (pos < len) {
          if (content[pos] === '<') {
            if (content[pos + 1] === '/') {
              // Closing tag
              pos += 2;
              const closingName = readName();
              pos++; // skip >
              break;
            } else if (content[pos + 1] === '!' && content[pos + 2] === '-' && content[pos + 3] === '-') {
              children.push(parseComment());
            } else if (content[pos + 1] === '!' && content.slice(pos + 2, pos + 9) === '[CDATA[') {
              children.push(parseCDATA());
            } else {
              children.push(parseElement());
            }
          } else {
            const textNode = parseText();
            if (opts.preserveWhitespace || (textNode.content as string).trim()) {
              children.push(textNode);
            }
          }
        }
      }

      const node: XMLNode = {
        type: 'element',
        name: opts.stripNamespaces ? localName : name,
        attributes,
        children,
        prefix,
        namespace: prefix || undefined,
      };

      for (const child of children) {
        child.parent = node;
      }

      return node;
    }

    // Parse declaration <?xml ...?>
    if (content.startsWith('<?xml')) {
      pos += 5; // skip <?xml
      const declAttrs = parseAttributes();
      if (content[pos] === '?' && content[pos + 1] === '>') pos += 2;

      declaration = {
        version: declAttrs.version || '1.0',
        encoding: declAttrs.encoding,
        standalone: declAttrs.standalone === 'yes' ? true : declAttrs.standalone === 'no' ? false : undefined,
        attributes: declAttrs,
      };
    }

    // Parse root and child nodes
    while (pos < len) {
      if (content[pos] === '<') {
        if (content[pos + 1] === '!' && content[pos + 2] === '-' && content[pos + 3] === '-') {
          allNodes.push(parseComment());
        } else if (content[pos + 1] === '!' && content.slice(pos + 2, pos + 9) === '[CDATA[') {
          allNodes.push(parseCDATA());
        } else if (content[pos + 1] === '?') {
          allNodes.push(parseProcessingInstruction());
        } else {
          allNodes.push(parseElement());
        }
      } else {
        const textNode = parseText();
        if (opts.preserveWhitespace || (textNode.content as string).trim()) {
          allNodes.push(textNode);
        }
      }
    }

    const root = allNodes.find((n) => n.type === 'element') || {
      type: 'text',
      content: '',
    } as XMLNode;

    const metadata: ContentMetadata = {
      size: content.length,
      lineCount: content.split('\n').length,
      encoding: declaration?.encoding || 'utf-8',
      version: declaration?.version,
    };

    return { declaration, root, nodes: allNodes, metadata };
  }

  validate(content: string): ValidationResult {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    if (!content.trim()) {
      errors.push({ message: 'Empty content', severity: 'error', code: 'EMPTY_CONTENT' });
      return { valid: false, errors, warnings };
    }

    const stack: string[] = [];
    let pos = 0;
    const len = content.length;

    while (pos < len) {
      if (content[pos] === '<') {
        if (content[pos + 1] === '!' && content[pos + 2] === '-' && content[pos + 3] === '-') {
          // Comment - find end
          const end = content.indexOf('-->', pos + 4);
          pos = end !== -1 ? end + 3 : len;
          continue;
        }
        if (content[pos + 1] === '!' && content.slice(pos + 2, pos + 9) === '[CDATA[') {
          const end = content.indexOf(']]>', pos + 9);
          pos = end !== -1 ? end + 3 : len;
          continue;
        }
        if (content[pos + 1] === '?') {
          const end = content.indexOf('?>', pos + 2);
          pos = end !== -1 ? end + 2 : len;
          continue;
        }

        if (content[pos + 1] === '/') {
          // Closing tag
          pos += 2;
          const nameMatch = content.slice(pos).match(/^[\w:.-]+/);
          if (!nameMatch) {
            errors.push({ message: `Invalid closing tag at position ${pos}`, severity: 'error', code: 'INVALID_CLOSE_TAG' });
            pos++;
            continue;
          }
          const name = nameMatch[0];
          pos += name.length;
          const gtPos = content.indexOf('>', pos);
          pos = gtPos !== -1 ? gtPos + 1 : len;

          if (stack.length === 0) {
            errors.push({ message: `Unexpected closing tag </${name}>`, severity: 'error', code: 'UNEXPECTED_CLOSE' });
          } else {
            const lastOpen = stack.pop()!;
            if (lastOpen !== name) {
              errors.push({
                message: `Mismatched tags: expected </${lastOpen}> but found </${name}>`,
                severity: 'error',
                code: 'MISMATCHED_TAGS',
              });
            }
          }
        } else if (content[pos + 1] === '?') {
          // Processing instruction
          const end = content.indexOf('?>', pos + 2);
          pos = end !== -1 ? end + 2 : len;
        } else {
          // Opening tag
          pos++;
          const nameMatch = content.slice(pos).match(/^[\w:.-]+/);
          if (!nameMatch) {
            pos++;
            continue;
          }
          const name = nameMatch[0];
          pos += name.length;

          // Skip attributes
          while (pos < len && content[pos] !== '>' && !(content[pos] === '/' && content[pos + 1] === '>')) {
            pos++;
          }

          if (content[pos] === '/' && content[pos + 1] === '>') {
            pos += 2; // self-closing
          } else if (content[pos] === '>') {
            pos++;
            stack.push(name);
          }
        }
      } else {
        pos++;
      }
    }

    for (const unclosed of stack) {
      errors.push({
        message: `Unclosed tag <${unclosed}>`,
        severity: 'error',
        code: 'UNCLOSED_TAG',
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  serialize(node: XMLNode | XMLDocument): string {
    if ('declaration' in node && 'root' in node) {
      let result = '';
      if (node.declaration) {
        result += `<?xml version="${node.declaration.version}"`;
        if (node.declaration.encoding) result += ` encoding="${node.declaration.encoding}"`;
        if (node.declaration.standalone !== undefined) result += ` standalone="${node.declaration.standalone ? 'yes' : 'no'}"`;
        result += '?>\n';
      }
      for (const child of node.nodes) {
        result += this.serializeNode(child);
      }
      return result;
    }
    return this.serializeNode(node as XMLNode);
  }

  private serializeNode(node: XMLNode, indent: string = ''): string {
    switch (node.type) {
      case 'element': {
        const name = node.prefix ? `${node.prefix}:${node.name}` : node.name;
        let attrs = '';
        if (node.attributes) {
          for (const [key, value] of Object.entries(node.attributes)) {
            attrs += ` ${key}="${this.escapeAttr(value)}"`;
          }
        }

        if (!node.children || node.children.length === 0) {
          return `${indent}<${name}${attrs} />`;
        }

        const hasOnlyText = node.children.length === 1 && node.children[0].type === 'text';
        if (hasOnlyText) {
          const textContent = node.children[0].content || '';
          return `${indent}<${name}${attrs}>${textContent}</${name}>`;
        }

        let inner = '';
        for (const child of node.children) {
          inner += this.serializeNode(child, indent + '  ') + '\n';
        }
        return `${indent}<${name}${attrs}>\n${inner}${indent}</${name}>`;
      }
      case 'text':
        return (node.content || '').trim();
      case 'comment':
        return `${indent}<!--${node.content || ''}-->`;
      case 'cdata':
        return `${indent}<![CDATA[${node.content || ''}]]>`;
      case 'processing-instruction':
        return `${indent}<?${node.name || ''}${node.attributes ? ' ' + this.formatAttributes(node.attributes) : ''}?>`;
      default:
        return '';
    }
  }

  private formatAttributes(attrs: Record<string, string>): string {
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  private escapeAttr(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  queryXPath(root: XMLNode, path: string): XMLNode[] {
    const parts = this.parseXPath(path);
    return this.evaluateXPath(root, parts);
  }

  private parseXPath(path: string): string[] {
    const trimmed = path.trim();
    if (trimmed === '/') return [''];
    if (trimmed.startsWith('/')) {
      return trimmed.slice(1).split('/').filter(Boolean);
    }
    return trimmed.split('/').filter(Boolean);
  }

  private evaluateXPath(root: XMLNode, parts: string[]): XMLNode[] {
    if (parts.length === 0) return [root];

    const [first, ...rest] = parts;
    let candidates: XMLNode[] = [];

    if (first === '') {
      candidates = [root];
    } else if (first === '*') {
      candidates = this.getAllDescendants(root);
    } else if (first.startsWith('@')) {
      // Attribute access - return attribute value as text node
      const attrName = first.slice(1);
      if (root.attributes && attrName in root.attributes) {
        return [{ type: 'text', content: root.attributes[attrName] }];
      }
      return [];
    } else if (first.includes('[@')) {
      // Predicate: tagName[@attr='value']
      const match = first.match(/^([^\[]+)\[@(\w+)='([^']*)'\]$/);
      if (match) {
        const [, tagName, attrName, attrValue] = match;
        candidates = this.findChildrenByTag(root, tagName).filter(
          (n) => n.attributes && n.attributes[attrName] === attrValue
        );
      }
    } else {
      candidates = this.findChildrenByTag(root, first);
    }

    if (rest.length === 0) return candidates;

    const results: XMLNode[] = [];
    for (const candidate of candidates) {
      results.push(...this.evaluateXPath(candidate, rest));
    }
    return results;
  }

  private getAllDescendants(node: XMLNode): XMLNode[] {
    const result: XMLNode[] = [];
    if (node.children) {
      for (const child of node.children) {
        result.push(child);
        result.push(...this.getAllDescendants(child));
      }
    }
    return result;
  }

  getElementByName(root: XMLNode, name: string): XMLNode | null {
    if (root.name === name) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = this.getElementByName(child, name);
        if (found) return found;
      }
    }
    return null;
  }

  findChildrenByTag(parent: XMLNode, tagName: string): XMLNode[] {
    if (!parent.children) return [];
    return parent.children.filter((n) => n.type === 'element' && n.name === tagName);
  }

  getTextContent(node: XMLNode): string {
    if (node.type === 'text') return node.content || '';
    if (node.type === 'cdata') return node.content || '';
    if (!node.children || node.children.length === 0) return '';
    return node.children.map((child) => this.getTextContent(child)).join('');
  }

  getAttributeValue(node: XMLNode, name: string): string | null {
    return node.attributes?.[name] ?? null;
  }

  toObject(node: XMLNode): any {
    if (node.type === 'text') return node.content || '';
    if (node.type === 'cdata') return node.content || '';
    if (node.type === 'comment') return null;

    if (node.type === 'element') {
      if (!node.children || node.children.length === 0) {
        // Return attributes if no children, or empty string
        if (node.attributes && Object.keys(node.attributes).length > 0) {
          const result: any = {};
          for (const [key, value] of Object.entries(node.attributes)) {
            result[`${this.options.attributeNamePrefix}${key}`] = value;
          }
          return result;
        }
        return '';
      }

      const hasOnlyText = node.children.length === 1 && node.children[0].type === 'text';
      if (hasOnlyText) {
        const text = node.children[0].content || '';
        if (node.attributes && Object.keys(node.attributes).length > 0) {
          const result: any = { '#text': text };
          for (const [key, value] of Object.entries(node.attributes)) {
            result[`${this.options.attributeNamePrefix}${key}`] = value;
          }
          return result;
        }
        return text;
      }

      // Multiple children - could be mixed content or array
      const hasElementChildren = node.children.some((c) => c.type === 'element');
      if (!hasElementChildren) {
        return node.children.map((c) => this.getTextContent(c)).join('');
      }

      const result: any = {};
      const arrayChildren: Record<string, XMLNode[]> = {};

      for (const child of node.children) {
        if (child.type === 'element' && child.name) {
          if (arrayChildren[child.name]) {
            arrayChildren[child.name].push(child);
          } else {
            arrayChildren[child.name] = [child];
          }
        }
      }

      for (const [key, children] of Object.entries(arrayChildren)) {
        if (children.length === 1) {
          result[key] = this.toObject(children[0]);
        } else {
          result[key] = children.map((c) => this.toObject(c));
        }
      }

      if (node.attributes && Object.keys(node.attributes).length > 0) {
        for (const [key, value] of Object.entries(node.attributes)) {
          result[`${this.options.attributeNamePrefix}${key}`] = value;
        }
      }

      return result;
    }

    return null;
  }
}

export default XMLParser;
