import { Parser as HtmlParser2, Handler } from 'htmlparser2';
import {
  HTMLNode,
  HTMLDocument,
  HTMLParseOptions,
  ValidationResult,
  ParseError,
  ParseWarning,
  ContentMetadata,
} from '../types';

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function isVoidElement(tag: string): boolean {
  return VOID_ELEMENTS.has(tag.toLowerCase());
}

function createNode(type: HTMLNode['type'], parent: HTMLNode | null = null): HTMLNode {
  return {
    type,
    parent,
    children: [],
    attributes: {},
    selfClosing: false,
  };
}

export class HTMLParser {
  private options: Required<HTMLParseOptions>;

  constructor(options?: HTMLParseOptions) {
    this.options = {
      lowercaseTags: options?.lowercaseTags ?? true,
      lowercaseAttributeNames: options?.lowercaseAttributeNames ?? true,
      recognizeSelfClosing: options?.recognizeSelfClosing ?? true,
      decodeEntities: options?.decodeEntities ?? true,
      withStartIndices: options?.withStartIndices ?? false,
      withEndIndices: options?.withEndIndices ?? false,
    };
  }

  parse(content: string, options?: HTMLParseOptions): HTMLDocument {
    const mergedOptions = { ...this.options, ...(options || {}) };
    const doc: HTMLDocument = {
      nodes: [],
      metadata: {
        size: content.length,
        lineCount: content.split('\n').length,
      },
      doctype: undefined,
    };
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    const stack: HTMLNode[] = [];
    const dummyRoot: HTMLNode = { type: 'element', tag: 'root', children: [], attributes: {}, parent: null };
    let currentParent: HTMLNode = dummyRoot;
    stack.push(dummyRoot);

    const handler: Partial<Handler> = {
      onopentag(name: string, attribs: Record<string, string>) {
        const tagName = mergedOptions.lowercaseTags ? name.toLowerCase() : name;
        const normalizedAttribs: Record<string, string> = {};
        for (const [key, value] of Object.entries(attribs)) {
          const attrName = mergedOptions.lowercaseAttributeNames ? key.toLowerCase() : key;
          normalizedAttribs[attrName] = value;
        }

        const node: HTMLNode = {
          type: 'element',
          tag: tagName,
          attributes: normalizedAttribs,
          children: [],
          parent: currentParent,
          selfClosing: isVoidElement(tagName),
        };

        currentParent.children!.push(node);
        if (!isVoidElement(tagName)) {
          stack.push(node);
          currentParent = node;
        }

        if (tagName === 'html') {
          doc.html = node;
        } else if (tagName === 'head') {
          doc.head = node;
        } else if (tagName === 'body') {
          doc.body = node;
        }
      },

      onclosetag(name: string) {
        const tagName = mergedOptions.lowercaseTags ? name.toLowerCase() : name;
        if (stack.length > 1) {
          const top = stack[stack.length - 1];
          if (top.tag === tagName) {
            stack.pop();
            currentParent = stack[stack.length - 1];
          } else {
            warnings.push({
              message: `Mismatched closing tag: expected </${top.tag}> but found </${tagName}>`,
              severity: 'warning',
              code: 'MISMATCHED_CLOSE_TAG',
            });
            while (stack.length > 1) {
              stack.pop();
              const candidate = stack[stack.length - 1];
              if (candidate.tag === tagName) {
                stack.pop();
                currentParent = stack[stack.length - 1];
                break;
              }
            }
          }
        }
      },

      ontext(text: string) {
        const node: HTMLNode = {
          type: 'text',
          content: text,
          parent: currentParent,
        };
        currentParent.children!.push(node);
      },

      oncomment(data: string) {
        const node: HTMLNode = {
          type: 'comment',
          content: data,
          parent: currentParent,
        };
        currentParent.children!.push(node);
      },

      onprocessinginstruction(name: string, data: string) {
        if (name.toLowerCase() === '!doctype' || name.toLowerCase() === 'doctype') {
          const match = data.match(/doctype\s+(.+)/i);
          const doctype = match ? match[1] : 'html';
          doc.doctype = doctype;
          doc.metadata.doctype = doctype;
        }
      },

      onerror(error: any) {
        errors.push({
          message: error.toString(),
          severity: 'error',
          code: 'PARSE_ERROR',
        });
      },

      onend() {
        if (stack.length > 1) {
          warnings.push({
            message: 'Unclosed tags remain at end of document',
            severity: 'warning',
            code: 'UNCLOSED_TAGS',
          });
        }
      },
    };

    const parser = new HtmlParser2(handler, {
      lowerCaseTags: mergedOptions.lowercaseTags,
      lowerCaseAttributeNames: mergedOptions.lowercaseAttributeNames,
      recognizeSelfClosing: mergedOptions.recognizeSelfClosing,
      decodeEntities: mergedOptions.decodeEntities,
    });

    parser.write(content);
    parser.end();

    doc.nodes = dummyRoot.children || [];

    // Extract metadata
    const parsedDoctype = doc.doctype;
    doc.metadata = this.extractMetadata(doc);
    doc.metadata.doctype = parsedDoctype || doc.metadata.doctype;
    doc.metadata.size = content.length;
    doc.metadata.lineCount = content.split('\n').length;
    doc.doctype = parsedDoctype;

    return doc;
  }

  parseFragment(content: string, options?: HTMLParseOptions): HTMLNode[] {
    const doc = this.parse(content, options);
    return doc.nodes;
  }

  validate(content: string): ValidationResult {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    // Check basic structure
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      errors.push({
        message: 'Empty content',
        severity: 'error',
        code: 'EMPTY_CONTENT',
      });
      return { valid: false, errors, warnings };
    }

    // Check for balanced tags
    const openTags: string[] = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const tagName = match[1].toLowerCase();

      if (fullMatch.startsWith('</')) {
        if (isVoidElement(tagName)) {
          warnings.push({
            message: `Void element ${tagName} should not have a closing tag`,
            severity: 'warning',
            code: 'VOID_CLOSE_TAG',
          });
        } else {
          const lastOpen = openTags.lastIndexOf(tagName);
          if (lastOpen === -1) {
            errors.push({
              message: `Unexpected closing tag </${tagName}>`,
              severity: 'error',
              code: 'UNEXPECTED_CLOSE',
            });
          } else {
            // Check nesting
            const after = openTags.slice(lastOpen + 1);
            for (const unclosed of after) {
              warnings.push({
                message: `Unclosed tag <${unclosed}> before </${tagName}>`,
                severity: 'warning',
                code: 'UNCLOSED_TAG',
              });
            }
            openTags.splice(lastOpen);
          }
        }
      } else if (!fullMatch.endsWith('/>') && !isVoidElement(tagName)) {
        openTags.push(tagName);
      }
    }

    for (const unclosed of openTags) {
      errors.push({
        message: `Unclosed tag <${unclosed}>`,
        severity: 'error',
        code: 'UNCLOSED_TAG',
      });
    }

    // Check doctype
    if (!trimmed.toLowerCase().startsWith('<!doctype html') && !trimmed.toLowerCase().startsWith('<html')) {
      warnings.push({
        message: 'Missing <!DOCTYPE html> declaration',
        severity: 'info',
        code: 'MISSING_DOCTYPE',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  serialize(node: HTMLNode | HTMLDocument): string {
    if (!node) return '';
    if ('nodes' in node) {
      // HTMLDocument
      let result = '';
      if (node.doctype) {
        result += `<!DOCTYPE ${node.doctype}>\n`;
      }
      for (const child of node.nodes) {
        result += this.serialize(child);
      }
      return result;
    }
    return this.serializeNode(node as HTMLNode);
  }

  private serializeNode(node: HTMLNode): string {
    switch (node.type) {
      case 'element': {
        const tag = node.tag || 'div';
        let attrs = '';
        if (node.attributes) {
          for (const [key, value] of Object.entries(node.attributes)) {
            if (value === '') {
              attrs += ` ${key}`;
            } else {
              attrs += ` ${key}="${this.escapeAttr(value)}"`;
            }
          }
        }
        if (node.selfClosing || isVoidElement(tag)) {
          return `<${tag}${attrs} />`;
        }
        let inner = '';
        if (node.children) {
          for (const child of node.children) {
            inner += this.serializeNode(child);
          }
        }
        return `<${tag}${attrs}>${inner}</${tag}>`;
      }
      case 'text':
        return node.content || '';
      case 'comment':
        return `<!--${node.content || ''}-->`;
      case 'doctype':
        return `<!DOCTYPE ${node.content || 'html'}>`;
      case 'cdata':
        return `<![CDATA[${node.content || ''}]]>`;
      default:
        return '';
    }
  }

  private escapeAttr(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  querySelector(root: HTMLNode, selector: string): HTMLNode | null {
    const results = this.querySelectorAll(root, selector);
    return results.length > 0 ? results[0] : null;
  }

  querySelectorAll(root: HTMLNode, selector: string): HTMLNode[] {
    const results: HTMLNode[] = [];
    this.traverse(root, (node) => {
      if (this.matchesSelector(node, selector)) {
        results.push(node);
      }
    });
    return results;
  }

  private matchesSelector(node: HTMLNode, selector: string): boolean {
    const segments = selector.trim().split(/\s+/);
    if (segments.length > 1) {
      // Handle descendant selector (space)
      // Check if current node matches the last segment
      if (!this.matchesSimpleSelector(node, segments[segments.length - 1])) {
        return false;
      }
      // Check if any ancestor matches the previous segments
      let currentParent = node.parent;
      let segmentIndex = segments.length - 2;
      while (currentParent && segmentIndex >= 0) {
        if (this.matchesSimpleSelector(currentParent, segments[segmentIndex])) {
          segmentIndex--;
        }
        currentParent = currentParent.parent;
      }
      return segmentIndex === -1;
    }
    return this.matchesSimpleSelector(node, selector.trim());
  }

  private matchesSimpleSelector(node: HTMLNode, selector: string): boolean {
    const cleanSelector = selector.trim();

    // ID selector
    if (cleanSelector.startsWith('#')) {
      const id = cleanSelector.slice(1);
      return node.type === 'element' && node.attributes?.id === id;
    }

    // Class selector
    if (cleanSelector.startsWith('.')) {
      const className = cleanSelector.slice(1);
      if (node.type === 'element' && node.attributes?.class) {
        const classes = node.attributes.class.split(/\s+/);
        return classes.includes(className);
      }
      return false;
    }

    // Tag selector
    if (node.type === 'element' && node.tag === cleanSelector.toLowerCase()) {
      return true;
    }

    // Attribute selectors
    const attrMatch = cleanSelector.match(/^\[([^\]=~|*^$]+)(?:([~|*^$]?=)([^\]]+))?\]$/);
    if (attrMatch) {
      const [, attrName, operator, attrValue] = attrMatch;
      if (!node.attributes) return false;
      const val = node.attributes[attrName];
      if (!operator) return attrName in node.attributes;
      const unquoted = attrValue?.replace(/^["']|["']$/g, '') || '';
      switch (operator) {
        case '=': return val === unquoted;
        case '~=': return val ? val.split(/\s+/).includes(unquoted) : false;
        case '|=': return val === unquoted || val?.startsWith(unquoted + '-');
        case '^=': return val?.startsWith(unquoted) || false;
        case '$=': return val?.endsWith(unquoted) || false;
        case '*=': return val?.includes(unquoted) || false;
        default: return false;
      }
    }

    // Compound selector (tag.class or tag#id)
    const compoundMatch = cleanSelector.match(/^([a-zA-Z][a-zA-Z0-9]*)([#.][a-zA-Z0-9_-]+)$/);
    if (compoundMatch) {
      const [, tag, qualifier] = compoundMatch;
      if (node.type !== 'element' || node.tag !== tag.toLowerCase()) return false;
      if (qualifier.startsWith('#')) {
        return node.attributes?.id === qualifier.slice(1);
      }
      if (qualifier.startsWith('.')) {
        const cls = qualifier.slice(1);
        return node.attributes?.class?.split(/\s+/).includes(cls) || false;
      }
    }

    return false;
  }

  private traverse(node: HTMLNode, callback: (node: HTMLNode) => void): void {
    callback(node);
    if (node.children) {
      for (const child of node.children) {
        this.traverse(child, callback);
      }
    }
  }

  getElementById(root: HTMLNode, id: string): HTMLNode | null {
    let result: HTMLNode | null = null;
    this.traverse(root, (node) => {
      if (!result && node.type === 'element' && node.attributes?.id === id) {
        result = node;
      }
    });
    return result;
  }

  getElementsByClassName(root: HTMLNode, className: string): HTMLNode[] {
    return this.querySelectorAll(root, '.' + className);
  }

  getElementsByTagName(root: HTMLNode, tagName: string): HTMLNode[] {
    return this.querySelectorAll(root, tagName.toLowerCase());
  }

  getAttribute(node: HTMLNode, name: string): string | null {
    if (node.attributes && name in node.attributes) {
      return node.attributes[name];
    }
    return null;
  }

  hasAttribute(node: HTMLNode, name: string): boolean {
    return node.attributes ? name in node.attributes : false;
  }

  setTextContent(node: HTMLNode, content: string): void {
    node.children = [];
    const textNode: HTMLNode = {
      type: 'text',
      content,
      parent: node,
    };
    node.children.push(textNode);
  }

  getTextContent(node: HTMLNode): string {
    if (node.type === 'text') {
      return node.content || '';
    }
    if (!node.children || node.children.length === 0) {
      return '';
    }
    return node.children.map((child) => this.getTextContent(child)).join('');
  }

  getInnerHTML(node: HTMLNode): string {
    if (!node.children) return '';
    return node.children.map((child) => this.serializeNode(child)).join('');
  }

  getOuterHTML(node: HTMLNode): string {
    return this.serializeNode(node);
  }

  removeNode(node: HTMLNode): void {
    if (node.parent && node.parent.children) {
      const index = node.parent.children.indexOf(node);
      if (index !== -1) {
        node.parent.children.splice(index, 1);
        node.parent = null;
      }
    }
  }

  insertBefore(parent: HTMLNode, newNode: HTMLNode, referenceNode?: HTMLNode): void {
    if (!parent.children) parent.children = [];
    newNode.parent = parent;
    if (referenceNode) {
      const index = parent.children.indexOf(referenceNode);
      if (index !== -1) {
        parent.children.splice(index, 0, newNode);
      } else {
        parent.children.push(newNode);
      }
    } else {
      parent.children.push(newNode);
    }
  }

  appendChild(parent: HTMLNode, child: HTMLNode): void {
    if (!parent.children) parent.children = [];
    child.parent = parent;
    parent.children.push(child);
  }

  cloneNode(node: HTMLNode, deep: boolean = false): HTMLNode {
    const clone: HTMLNode = {
      type: node.type,
      tag: node.tag,
      attributes: node.attributes ? { ...node.attributes } : undefined,
      content: node.content,
      namespace: node.namespace,
      selfClosing: node.selfClosing,
      parent: null,
      children: deep && node.children
        ? node.children.map((child) => this.cloneNode(child, true))
        : [],
    };
    if (clone.children) {
      for (const child of clone.children) {
        child.parent = clone;
      }
    }
    return clone;
  }

  private extractMetadata(doc: HTMLDocument): ContentMetadata {
    const meta: ContentMetadata = {};

    // Find head element
    const head = doc.head;
    if (!head) return meta;

    // Extract title
    const titleNode = this.findChildByTag(head, 'title');
    if (titleNode) {
      meta.title = this.getTextContent(titleNode);
    }

    // Extract meta tags
    const metaNodes = this.findChildrenByTag(head, 'meta');
    for (const metaNode of metaNodes) {
      const name = metaNode.attributes?.name;
      const content = metaNode.attributes?.content;
      const charset = metaNode.attributes?.charset;
      const httpEquiv = metaNode.attributes?.['http-equiv'];
      const property = metaNode.attributes?.property;

      if (charset) {
        meta.charset = charset;
      } else if (name === 'description') {
        meta.description = content;
      } else if (name === 'author') {
        meta.author = content;
      } else if (name === 'language') {
        meta.language = content;
      } else if (property) {
        meta[property] = content;
      } else if (name) {
        meta[name] = content;
      }
    }

    // Extract language from html tag
    if (doc.html?.attributes?.lang) {
      meta.language = doc.html.attributes.lang;
    }

    return meta;
  }

  private findChildByTag(parent: HTMLNode, tagName: string): HTMLNode | null {
    if (!parent.children) return null;
    for (const child of parent.children) {
      if (child.type === 'element' && child.tag === tagName) {
        return child;
      }
    }
    return null;
  }

  private findChildrenByTag(parent: HTMLNode, tagName: string): HTMLNode[] {
    if (!parent.children) return [];
    return parent.children.filter(
      (child) => child.type === 'element' && child.tag === tagName
    );
  }
}

export default HTMLParser;
