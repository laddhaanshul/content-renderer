import {
  JSONDocument,
  JSONSchema,
  JSONDiffResult,
  JSONChange,
  JSONPathValue,
  ContentMetadata,
  ParseError,
  ParseWarning,
} from '../types';

export class JSONParser {
  parse(content: string, options?: { reviver?: (key: string, value: any) => any }): JSONDocument {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    let root: any = null;
    let type: JSONDocument['type'] = 'null';

    try {
      root = JSON.parse(content, options?.reviver);
      type = this.inferType(root);
    } catch (e: any) {
      errors.push({
        message: e.message || 'Failed to parse JSON',
        severity: 'error',
        code: 'PARSE_ERROR',
      });
      root = null;
      type = 'null';
    }

    const metadata: ContentMetadata = {
      size: content.length,
      lineCount: content.split('\n').length,
      encoding: 'utf-8',
    };

    const schema = this.inferSchema(root);

    return { root, type, metadata, schema };
  }

  validate(content: string): { valid: boolean; errors: ParseError[]; warnings: ParseWarning[] } {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    if (!content.trim()) {
      errors.push({
        message: 'Empty content',
        severity: 'error',
        code: 'EMPTY_CONTENT',
      });
      return { valid: false, errors, warnings };
    }

    try {
      const parsed = JSON.parse(content);
      this.validateStructure(parsed, '$', errors, warnings, new Set());
    } catch (e: any) {
      errors.push({
        message: e.message || 'Failed to parse JSON',
        severity: 'error',
        code: 'PARSE_ERROR',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateStructure(
    value: any,
    path: string,
    errors: ParseError[],
    warnings: ParseWarning[],
    visited: Set<any>
  ): void {
    if (value === null || typeof value !== 'object') return;

    if (visited.has(value)) {
      warnings.push({
        message: `Circular reference detected at ${path}`,
        severity: 'warning',
        code: 'CIRCULAR_REFERENCE',
      });
      return;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        this.validateStructure(item, `${path}[${index}]`, errors, warnings, visited);
      });
    } else {
      for (const key of Object.keys(value)) {
        this.validateStructure(value[key], `${path}.${key}`, errors, warnings, visited);
      }
    }
  }

  inferSchema(value: any): JSONSchema | undefined {
    if (value === null || value === undefined) return undefined;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: 'array' };
      }
      const itemSchemas = value.map((item) => this.inferSchema(item)).filter(Boolean) as JSONSchema[];
      const merged: JSONSchema = { type: 'array' };
      if (itemSchemas.length > 0) {
        merged.items = this.mergeSchemas(itemSchemas);
      }
      return merged;
    }

    if (typeof value === 'object') {
      const properties: Record<string, JSONSchema> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(value)) {
        const propSchema = this.inferSchema(val);
        if (propSchema) {
          properties[key] = propSchema;
          required.push(key);
        }
      }
      return { type: 'object', properties, required };
    }

    return { type: typeof value };
  }

  private mergeSchemas(schemas: JSONSchema[]): JSONSchema {
    if (schemas.length === 0) return {};
    if (schemas.length === 1) return schemas[0];

    const merged: JSONSchema = { type: schemas[0].type };
    if (schemas[0].properties) {
      const allProps: Record<string, JSONSchema> = {};
      for (const schema of schemas) {
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            allProps[key] = propSchema;
          }
        }
      }
      merged.properties = allProps;
    }
    return merged;
  }

  private inferType(value: any): JSONDocument['type'] {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value as JSONDocument['type'];
  }

  queryPath(root: any, path: string): any {
    if (!path || path === '$') return root;
    if (!path.startsWith('$')) {
      throw new Error('JSONPath must start with $');
    }

    const parts = this.tokenizePath(path.slice(1));
    let current = root;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;

      if (part.type === 'property') {
        if (typeof current !== 'object' || Array.isArray(current)) return undefined;
        current = (current as any)[part.value];
      } else if (part.type === 'index') {
        if (!Array.isArray(current)) return undefined;
        current = (current as any)[part.value];
      } else if (part.type === 'wildcard') {
        if (Array.isArray(current)) {
          current = current;
        } else if (typeof current === 'object' && current !== null) {
          current = Object.values(current);
        } else {
          return undefined;
        }
      } else if (part.type === 'recursive') {
        const results: any[] = [];
        this.collectRecursive(current, part.value, results);
        current = results;
      }
    }

    return current;
  }

  private tokenizePath(path: string): Array<{ type: string; value: string }> {
    const tokens: Array<{ type: string; value: string }> = [];
    let i = 0;

    while (i < path.length) {
      if (path[i] === '.') {
        i++;
        if (i < path.length && path[i] === '.') {
          i++;
          // Recursive descent
          let name = '';
          while (i < path.length && path[i] !== '.' && path[i] !== '[') {
            name += path[i];
            i++;
          }
          tokens.push({ type: 'recursive', value: name });
        } else if (i < path.length && path[i] === '*') {
          i++;
          tokens.push({ type: 'wildcard', value: '*' });
        } else {
          let name = '';
          while (i < path.length && path[i] !== '.' && path[i] !== '[') {
            name += path[i];
            i++;
          }
          if (name) {
            tokens.push({ type: 'property', value: name });
          }
        }
      } else if (path[i] === '[') {
        i++;
        if (i < path.length && path[i] === '*') {
          i++;
          tokens.push({ type: 'wildcard', value: '*' });
        } else {
          let content = '';
          let inQuotes = false;
          const quoteChar = path[i] === '"' || path[i] === "'" ? path[i] : null;
          if (quoteChar) {
            inQuotes = true;
            i++;
          }
          while (i < path.length) {
            if (inQuotes) {
              if (path[i] === quoteChar) {
                i++;
                break;
              }
            } else {
              if (path[i] === ']') {
                i++;
                break;
              }
            }
            content += path[i];
            i++;
          }
          if (/^\d+$/.test(content)) {
            tokens.push({ type: 'index', value: content });
          } else {
            tokens.push({ type: 'property', value: content.replace(/^["']|["']$/g, '') });
          }
        }
      } else {
        i++;
      }
    }

    return tokens;
  }

  private collectRecursive(root: any, key: string, results: any[]): void {
    if (root === null || root === undefined) return;

    if (typeof root === 'object') {
      if (Array.isArray(root)) {
        for (const item of root) {
          this.collectRecursive(item, key, results);
        }
      } else {
        for (const [k, v] of Object.entries(root)) {
          if (k === key) {
            results.push(v);
          }
          this.collectRecursive(v, key, results);
        }
      }
    }
  }

  format(value: any, indent: number = 2): string {
    return JSON.stringify(value, null, indent);
  }

  minify(value: any): string {
    return JSON.stringify(value);
  }

  diff(obj1: any, obj2: any, path: string = '$'): JSONDiffResult {
    const added: JSONPathValue[] = [];
    const removed: JSONPathValue[] = [];
    const changed: JSONChange[] = [];
    const unchanged: string[] = [];
    const visited = new Set<string>();

    this.collectDiff(obj1, obj2, path, added, removed, changed, unchanged, visited);
    return { added, removed, changed, unchanged };
  }

  private collectDiff(
    obj1: any,
    obj2: any,
    path: string,
    added: JSONPathValue[],
    removed: JSONPathValue[],
    changed: JSONChange[],
    unchanged: string[],
    visited: Set<string>
  ): void {
    if (visited.has(path)) return;
    visited.add(path);

    if (obj1 === obj2) {
      unchanged.push(path);
      return;
    }

    if (obj1 === null || obj1 === undefined) {
      added.push({ path, value: obj2 });
      return;
    }

    if (obj2 === null || obj2 === undefined) {
      removed.push({ path, value: obj1 });
      return;
    }

    if (typeof obj1 !== typeof obj2) {
      changed.push({ path, oldValue: obj1, newValue: obj2 });
      return;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      const maxLen = Math.max(obj1.length, obj2.length);
      for (let i = 0; i < maxLen; i++) {
        this.collectDiff(obj1[i], obj2[i], `${path}[${i}]`, added, removed, changed, unchanged, visited);
      }
      return;
    }

    if (typeof obj1 === 'object') {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      for (const key of allKeys) {
        const childPath = `${path}.${key}`;
        if (!(key in obj1)) {
          added.push({ path: childPath, value: obj2[key] });
        } else if (!(key in obj2)) {
          removed.push({ path: childPath, value: obj1[key] });
        } else {
          this.collectDiff(obj1[key], obj2[key], childPath, added, removed, changed, unchanged, visited);
        }
      }
      return;
    }

    // Primitive types that differ
    changed.push({ path, oldValue: obj1, newValue: obj2 });
  }

  extractPaths(value: any, prefix: string = '$', maxDepth: number = 20): Record<string, any> {
    const result: Record<string, any> = {};
    this.collectPaths(value, prefix, result, 0, maxDepth);
    return result;
  }

  private collectPaths(
    value: any,
    path: string,
    result: Record<string, any>,
    depth: number,
    maxDepth: number
  ): void {
    if (depth >= maxDepth || value === null || typeof value !== 'object') {
      result[path] = value;
      return;
    }

    result[path] = Array.isArray(value) ? '[Array]' : '[Object]';

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        this.collectPaths(item, `${path}[${index}]`, result, depth + 1, maxDepth);
      });
    } else {
      for (const [key, val] of Object.entries(value)) {
        this.collectPaths(val, `${path}.${key}`, result, depth + 1, maxDepth);
      }
    }
  }

  flatten(value: any, separator: string = '.'): Record<string, any> {
    const result: Record<string, any> = {};
    this.flattenObject(value, '', result, separator, new Set());
    return result;
  }

  private flattenObject(
    value: any,
    prefix: string,
    result: Record<string, any>,
    separator: string,
    visited: Set<any>
  ): void {
    if (value === null || typeof value !== 'object') {
      result[prefix] = value;
      return;
    }

    if (visited.has(value)) {
      result[prefix] = '[Circular]';
      return;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const key = prefix ? `${prefix}[${index}]` : `[${index}]`;
        this.flattenObject(item, key, result, separator, visited);
      });
    } else {
      for (const [key, val] of Object.entries(value)) {
        const newKey = prefix ? `${prefix}${separator}${key}` : key;
        this.flattenObject(val, newKey, result, separator, visited);
      }
    }
  }

  unflatten(flat: Record<string, any>, separator: string = '.'): any {
    const result: any = {};

    for (const [path, value] of Object.entries(flat)) {
      const parts = path.split(separator);
      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const arrayMatch = part.match(/^\[(\d+)\]$/);
        if (arrayMatch) {
          const index = parseInt(arrayMatch[1], 10);
          if (!Array.isArray(current)) {
            current = [];
            const parent = this.getParent(result, parts.slice(0, i));
            if (parent !== undefined) {
              const lastKey = parts[i - 1];
              if (lastKey) {
                parent[lastKey] = current;
              }
            }
          }
          while (current.length <= index) {
            current.push({});
          }
          current = current[index];
        } else {
          if (!(part in current)) {
            current[part] = {};
          }
          current = current[part];
        }
      }

      const lastPart = parts[parts.length - 1];
      const lastArrayMatch = lastPart.match(/^\[(\d+)\]$/);
      if (lastArrayMatch) {
        const index = parseInt(lastArrayMatch[1], 10);
        if (!Array.isArray(current)) current = [];
        current[index] = value;
      } else {
        current[lastPart] = value;
      }
    }

    return result;
  }

  private getParent(obj: any, parts: string[]): any {
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  sortByKeys(value: any, deep: boolean = true): any {
    if (value === null || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
      return deep ? value.map((item) => this.sortByKeys(item, deep)) : value;
    }

    const sorted: Record<string, any> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = deep ? this.sortByKeys(value[key], deep) : value[key];
    }
    return sorted;
  }

  deepClone(value: any): any {
    return JSON.parse(JSON.stringify(value));
  }

  getTypes(root: any, path: string = '$'): Record<string, string> {
    const types: Record<string, string> = {};
    this.collectTypes(root, path, types, new Set());
    return types;
  }

  private collectTypes(value: any, path: string, types: Record<string, string>, visited: Set<any>): void {
    if (value === null) {
      types[path] = 'null';
      return;
    }
    if (typeof value !== 'object') {
      types[path] = typeof value;
      return;
    }
    if (visited.has(value)) {
      types[path] = '[Circular]';
      return;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      types[path] = 'array';
      value.forEach((item, index) => {
        this.collectTypes(item, `${path}[${index}]`, types, visited);
      });
    } else {
      types[path] = 'object';
      for (const [key, val] of Object.entries(value)) {
        this.collectTypes(val, `${path}.${key}`, types, visited);
      }
    }
  }
}

export default JSONParser;
