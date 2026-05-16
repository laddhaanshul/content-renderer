/**
 * JSONPath Query Engine
 *
 * A comprehensive JSONPath implementation supporting standard JSONPath syntax
 * including root access, child access, recursive descent, array indexing,
 * slicing, wildcards, and filter expressions.
 *
 * @module json-path
 *
 * @example
 * // Basic child access
 * const data = { store: { book: [{ title: "A" }, { title: "B" }] } };
 * queryPath(data, '$.store.book'); // [{ title: "A" }, { title: "B" }]
 *
 * @example
 * // Recursive descent
 * queryPath(data, '$..price'); // [8.95, 12.99, 8.99, 22.99]
 *
 * @example
 * // Array index
 * queryPath(data, '$.store.book[0]'); // [{ title: "A" }]
 *
 * @example
 * // Wildcard
 * queryPath(data, '$.store.book[*].title'); // ["A", "B"]
 *
 * @example
 * // Array slicing
 * queryPath(data, '$.store.book[0:2]'); // first two books
 *
 * @example
 * // Filter expressions
 * queryPath(data, '$.store.book[?(@.price < 10)]'); // books under $10
 * queryPath(data, '$.store.book[?(@.category == "fiction")]'); // fiction books
 * queryPath(data, '$.store.book[?(@.author =~ /Norton/i)]'); // regex match
 *
 * @example
 * // Using queryPathSingle
 * queryPathSingle(data, '$.store.book[0].title'); // "A"
 *
 * @example
 * // Parsing path without executing
 * parseJSONPath('$.store..book[?(@.price > 10)]');
 * // => [
 * //   { type: 'root' },
 * //   { type: 'child', key: 'store' },
 * //   { type: 'recursive' },
 * //   { type: 'child', key: 'book' },
 * //   { type: 'filter', expression: '@.price > 10' }
 * // ]
 *
 * @example
 * // Complex real-world usage
 * const apiResponse = {
 *   users: [
 *     { id: 1, name: "Alice", posts: [{ id: 101, likes: 5 }, { id: 102, likes: 3 }] },
 *     { id: 2, name: "Bob", posts: [{ id: 103, likes: 8 }] },
 *     { id: 3, name: "Charlie", posts: [] }
 *   ]
 * };
 * queryPath(apiResponse, '$..posts[?(@.likes >= 5)]');
 * // => [{ id: 101, likes: 5 }, { id: 103, likes: 8 }]
 * queryPath(apiResponse, '$.users[*].name');
 * // => ["Alice", "Bob", "Charlie"]
 * queryPath(apiResponse, '$.users[?(@.posts.length > 0)].name');
 * // => ["Alice", "Bob"]
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JSONPathChildSegment {
  type: 'child';
  key: string;
}

export interface JSONPathRecursiveSegment {
  type: 'recursive';
}

export interface JSONPathIndexSegment {
  type: 'index';
  index: number;
}

export interface JSONPathWildcardSegment {
  type: 'wildcard';
}

export interface JSONPathSliceSegment {
  type: 'slice';
  start: number;
  end?: number;
  step?: number;
}

export interface JSONPathFilterSegment {
  type: 'filter';
  expression: string;
}

export type JSONPathSegment =
  | JSONPathChildSegment
  | JSONPathRecursiveSegment
  | JSONPathIndexSegment
  | JSONPathWildcardSegment
  | JSONPathSliceSegment
  | JSONPathFilterSegment;

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parses a JSONPath string into an array of typed segments.
 *
 * @param path - The JSONPath string to parse (e.g. `$.store.book[0]`)
 * @returns Array of parsed `JSONPathSegment` objects
 * @throws {Error} If the path is empty or malformed
 */
export function parseJSONPath(path: string): JSONPathSegment[] {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error('JSONPath string cannot be empty');
  }

  const segments: JSONPathSegment[] = [];
  let pos = 0;

  // Must start with `$` (root reference)
  if (trimmed[pos] === '$') {
    pos++;
  }

  while (pos < trimmed.length) {
    const ch = trimmed[pos];

    if (ch === '.') {
      pos++;
      // Check for recursive descent `..`
      if (pos < trimmed.length && trimmed[pos] === '.') {
        segments.push({ type: 'recursive' });
        pos++;
      } else {
        // Child access — read the key
        const key = readIdentifier(trimmed, pos);
        if (!key) {
          throw new Error(`Expected property name after '.' at position ${pos}`);
        }
        segments.push({ type: 'child', key });
        pos += key.length;
      }
    } else if (ch === '[') {
      pos++;
      const segment = parseBracketSegment(trimmed, pos);
      if (segment) {
        segments.push(segment);
      }
      // pos is advanced inside parseBracketSegment
      const closingBracket = trimmed.indexOf(']', pos);
      if (closingBracket === -1) {
        throw new Error(`Unclosed bracket at position ${pos - 1}`);
      }
      pos = closingBracket + 1;
    } else {
      // If we're here and haven't started, try treating the whole thing as a key
      // e.g. "store" (no leading $)
      if (segments.length === 0) {
        const key = readIdentifier(trimmed, pos);
        if (key) {
          segments.push({ type: 'child', key });
          pos += key.length;
        } else {
          throw new Error(`Unexpected character '${ch}' at position ${pos}`);
        }
      } else {
        throw new Error(`Unexpected character '${ch}' at position ${pos}`);
      }
    }
  }

  return segments;
}

/**
 * Reads an identifier (property key) from the path starting at `pos`.
 * Handles both unquoted keys and dot-separated bracket notation keys.
 */
function readIdentifier(path: string, pos: number): string | null {
  let end = pos;
  while (end < path.length && isIdentifierChar(path[end])) {
    end++;
  }
  if (end === pos) return null;
  return path.slice(pos, end);
}

function isIdentifierChar(ch: string): boolean {
  // Allow alphanumeric, underscore, hyphen (common in JSON keys)
  return (
    (ch >= 'a' && ch <= 'z') ||
    (ch >= 'A' && ch <= 'Z') ||
    (ch >= '0' && ch <= '9') ||
    ch === '_' ||
    ch === '-'
  );
}

/**
 * Parses the content inside square brackets `[...]`.
 * Returns the parsed segment and advances `pos` past the consumed content
 * (the caller handles the closing `]`).
 */
function parseBracketSegment(
  path: string,
  pos: number
): JSONPathSegment | null {
  if (pos >= path.length) {
    throw new Error('Unexpected end of path inside bracket expression');
  }

  const ch = path[pos];

  // Wildcard: [*]
  if (ch === '*') {
    pos++;
    return { type: 'wildcard' };
  }

  // Filter: [?(...)]
  if (ch === '?' && pos + 1 < path.length && path[pos + 1] === '(') {
    pos += 2;
    let depth = 1;
    let filterPos = pos;
    while (filterPos < path.length && depth > 0) {
      if (path[filterPos] === '(') depth++;
      if (path[filterPos] === ')') depth--;
      if (depth > 0) filterPos++;
    }
    const expression = path.slice(pos, filterPos).trim();
    // Note: we don't advance pos to filterPos+1 here because the caller
    // finds the closing `]`. Instead we manually update via the returned segment.
    return { type: 'filter', expression };
  }

  // Try to read as a number (index) or slice
  // Gather content until we hit `]`
  let contentEnd = pos;
  while (contentEnd < path.length && path[contentEnd] !== ']') {
    contentEnd++;
  }
  const content = path.slice(pos, contentEnd).trim();

  // Check for quoted key: ['key'] or ["key"]
  if (
    (content.startsWith("'") && content.endsWith("'")) ||
    (content.startsWith('"') && content.endsWith('"'))
  ) {
    const key = content.slice(1, -1);
    return { type: 'child', key };
  }

  // Check for slice notation [start:end] or [start:end:step]
  if (content.includes(':')) {
    return parseSliceSegment(content);
  }

  // Simple index
  const index = parseInt(content, 10);
  if (!isNaN(index)) {
    return { type: 'index', index };
  }

  // Treat as identifier key
  if (content && isIdentifierChar(content[0])) {
    return { type: 'child', key: content };
  }

  throw new Error(`Invalid bracket expression '[${content}]'`);
}

/**
 * Parses slice notation: `start:end` or `start:end:step`
 */
function parseSliceSegment(content: string): JSONPathSliceSegment {
  const parts = content.split(':').map((p) => p.trim());
  const start = parts[0] !== '' ? parseInt(parts[0], 10) : 0;
  const endRaw = parts[1] !== '' ? parseInt(parts[1], 10) : undefined;
  const step = parts[2] !== undefined && parts[2] !== '' ? parseInt(parts[2], 10) : undefined;

  if (isNaN(start)) {
    throw new Error(`Invalid slice start '${parts[0]}'`);
  }
  if (endRaw !== undefined && isNaN(endRaw)) {
    throw new Error(`Invalid slice end '${parts[1]}'`);
  }
  if (step !== undefined && (isNaN(step) || step === 0)) {
    throw new Error(`Invalid slice step '${parts[2]}', must be non-zero`);
  }

  return { type: 'slice', start, end: endRaw, step };
}

// ---------------------------------------------------------------------------
// Filter Expression Evaluator
// ---------------------------------------------------------------------------

type FilterValue = string | number | boolean | null | undefined;
type FilterFn = (current: unknown, parent: unknown) => boolean;

/**
 * Parses and compiles a filter expression string like `@.price < 10`
 * into a predicate function.
 */
function compileFilter(expression: string): FilterFn {
  const trimmed = expression.trim();

  // Try to match binary operators (longest first to avoid ambiguity)
  const operators = [
    { op: '=~', regex: /([^!=<>~]+)\s*=~\s*(.+)/ },
    { op: '==', regex: /([^!=<>]+)\s*==\s*(.+)/ },
    { op: '!=', regex: /([^!=<>]+)\s*!=\s*(.+)/ },
    { op: '<=', regex: /([^<>]+)\s*<=\s*(.+)/ },
    { op: '>=', regex: /([^<>]+)\s*>=\s*(.+)/ },
    { op: '<', regex: /([^<>]+)\s*<\s*(.+)/ },
    { op: '>', regex: /([^<>]+)\s*>\s*(.+)/ },
  ];

  for (const { op, regex } of operators) {
    const match = trimmed.match(regex);
    if (match) {
      const leftExpr = match[1].trim();
      const rightExpr = match[2].trim();
      return createBinaryFilter(leftExpr, op, rightExpr);
    }
  }

  // Boolean existence check: @.field evaluates truthiness
  return (_current: unknown) => {
    const val = resolveValue(trimmed, _current);
    return !!val;
  };
}

function createBinaryFilter(
  leftExpr: string,
  operator: string,
  rightExpr: string
): FilterFn {
  return (current: unknown): boolean => {
    const leftVal = resolveValue(leftExpr, current);
    const rightVal = resolveValue(rightExpr, current);

    // Handle regex match
    if (operator === '=~') {
      if (typeof rightVal !== 'string' && typeof leftVal !== 'string') return false;
      const pattern = typeof rightVal === 'string' ? rightVal : String(leftVal);
      const testStr = typeof rightVal === 'string' ? String(leftVal) : String(rightVal);
      try {
        // Strip surrounding slashes if present: /pattern/flags
        const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
        const re = regexMatch
          ? new RegExp(regexMatch[1], regexMatch[2])
          : new RegExp(pattern);
        return re.test(testStr);
      } catch {
        return false;
      }
    }

    // Coerce to comparable types
    const l = toComparable(leftVal);
    const r = toComparable(rightVal);

    switch (operator) {
      case '==':
        return l === r;
      case '!=':
        return l !== r;
      case '<':
        return l < r;
      case '>':
        return l > r;
      case '<=':
        return l <= r;
      case '>=':
        return l >= r;
      default:
        return false;
    }
  };
}

/**
 * Resolves a value expression relative to the current context (`@`).
 * Handles:
 *  - `@.foo.bar` — path relative to current element
 *  - `$.foo` — path relative to root (stored in closure or ignored)
 *  - `"string literal"` — quoted strings
 *  - number literals
 *  - `true` / `false` / `null`
 */
function resolveValue(expr: string, current: unknown): FilterValue {
  const trimmed = expr.trim();

  // Null literal
  if (trimmed === 'null') return null;

  // Boolean literals
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // String literals (single or double quoted)
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Path expression starting with @
  if (trimmed.startsWith('@')) {
    return resolvePathExpression(trimmed, current);
  }

  // Fall back to string
  return trimmed;
}

/**
 * Resolves a dot-separated path like `@.price` or `@.author.name` against
 * the current element.
 */
function resolvePathExpression(pathExpr: string, current: unknown): FilterValue {
  const parts = pathExpr.split('.').filter(Boolean);
  // Skip the leading `@`
  let value: unknown = current;
  for (let i = 1; i < parts.length; i++) {
    const key = parts[i];
    if (value == null) return null;
    if (key === 'length' && Array.isArray(value)) {
      value = value.length;
    } else if (typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  return value as FilterValue;
}

/**
 * Coerces a value for comparison purposes.
 */
function toComparable(val: FilterValue): number | string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'number') return val;
  return String(val);
}

// ---------------------------------------------------------------------------
// Query Engine
// ---------------------------------------------------------------------------

/**
 * Queries `data` using a JSONPath expression and returns all matching values.
 *
 * @param data - The root JSON data to query
 * @param path - A JSONPath expression string
 * @returns Array of all matching values (empty array if no matches)
 *
 * @example
 * const store = {
 *   store: {
 *     book: [
 *       { title: "Sayings", price: 8.95, category: "reference" },
 *       { title: "Moby Dick", price: 12.99, category: "fiction" },
 *     ],
 *     bicycle: { color: "red", price: 19.95 }
 *   }
 * };
 *
 * queryPath(store, '$.store.book[*].title');
 * // => ["Sayings", "Moby Dick"]
 *
 * queryPath(store, '$.store..price');
 * // => [8.95, 12.99, 19.95]
 *
 * queryPath(store, '$.store.book[?(@.category == "fiction")].title');
 * // => ["Moby Dick"]
 */
export function queryPath(data: unknown, path: string): unknown[] {
  const segments = parseJSONPath(path);
  let results: unknown[] = [data];

  for (const segment of segments) {
    results = applySegment(results, segment);
  }

  return results;
}

/**
 * Queries `data` using a JSONPath expression and returns the first match.
 * Returns `undefined` if no matches are found.
 *
 * @param data - The root JSON data to query
 * @param path - A JSONPath expression string
 * @returns The first matching value, or `undefined`
 *
 * @example
 * queryPathSingle({ a: { b: 42 } }, '$.a.b'); // 42
 * queryPathSingle({ a: [] }, '$.a.b'); // undefined
 */
export function queryPathSingle(data: unknown, path: string): unknown {
  const results = queryPath(data, path);
  return results.length > 0 ? results[0] : undefined;
}

/**
 * Applies a single JSONPath segment to an array of current values,
 * producing the next set of matched values.
 */
function applySegment(values: unknown[], segment: JSONPathSegment): unknown[] {
  switch (segment.type) {
    case 'child':
      return applyChild(values, segment.key);
    case 'recursive':
      return applyRecursive(values);
    case 'index':
      return applyIndex(values, segment.index);
    case 'wildcard':
      return applyWildcard(values);
    case 'slice':
      return applySlice(values, segment);
    case 'filter':
      return applyFilter(values, segment.expression);
    default:
      return values;
  }
}

function applyChild(values: unknown[], key: string): unknown[] {
  const results: unknown[] = [];
  for (const val of values) {
    if (val != null && typeof val === 'object') {
      if (Array.isArray(val)) {
        // If accessing by key on an array, try numeric index
        const idx = parseInt(key, 10);
        if (!isNaN(idx) && idx >= 0 && idx < val.length) {
          results.push(val[idx]);
        }
      } else {
        const obj = val as Record<string, unknown>;
        if (key in obj) {
          results.push(obj[key]);
        }
      }
    }
  }
  return results;
}

/**
 * Recursive descent: collects all values at every depth and then
 * applies the *next* segment to each. But since we process segment-by-segment,
 * we collect all nested values so the next segment can match at any depth.
 */
function applyRecursive(values: unknown[]): unknown[] {
  const results: unknown[] = [...values];
  const stack = [...values];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current != null && typeof current === 'object') {
      if (Array.isArray(current)) {
        for (const item of current) {
          results.push(item);
          if (item != null && typeof item === 'object') {
            stack.push(item);
          }
        }
      } else {
        const obj = current as Record<string, unknown>;
        for (const key of Object.keys(obj)) {
          const child = obj[key];
          results.push(child);
          if (child != null && typeof child === 'object') {
            stack.push(child);
          }
        }
      }
    }
  }

  return results;
}

function applyIndex(values: unknown[], index: number): unknown[] {
  const results: unknown[] = [];
  for (const val of values) {
    if (Array.isArray(val)) {
      // Support negative indices
      const normalizedIdx =
        index < 0 ? val.length + index : index;
      if (normalizedIdx >= 0 && normalizedIdx < val.length) {
        results.push(val[normalizedIdx]);
      }
    } else if (val != null && typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (String(index) in obj) {
        results.push(obj[String(index)]);
      }
    }
  }
  return results;
}

function applyWildcard(values: unknown[]): unknown[] {
  const results: unknown[] = [];
  for (const val of values) {
    if (Array.isArray(val)) {
      results.push(...val);
    } else if (val != null && typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        results.push(obj[key]);
      }
    }
  }
  return results;
}

function applySlice(values: unknown[], slice: JSONPathSliceSegment): unknown[] {
  const results: unknown[] = [];
  const { start, end, step = 1 } = slice;

  for (const val of values) {
    if (Array.isArray(val)) {
      const len = val.length;
      // Normalize negative indices
      const normStart = start < 0 ? Math.max(0, len + start) : Math.min(start, len);
      const normEnd =
        end === undefined
          ? (step > 0 ? len : 0)
          : end < 0
            ? Math.max(0, len + end)
            : Math.min(end, len);

      if (step > 0) {
        for (let i = normStart; i < normEnd; i += step) {
          results.push(val[i]);
        }
      } else {
        for (let i = normStart; i > normEnd; i += step) {
          results.push(val[i]);
        }
      }
    }
  }
  return results;
}

function applyFilter(values: unknown[], expression: string): unknown[] {
  const predicate = compileFilter(expression);
  const results: unknown[] = [];

  for (const val of values) {
    if (Array.isArray(val)) {
      for (const item of val) {
        if (predicate(item, val)) {
          results.push(item);
        }
      }
    } else if (val != null && typeof val === 'object') {
      // Can filter objects too — the item is each value of the object
      const obj = val as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        const child = obj[key];
        if (predicate(child, val)) {
          results.push(child);
        }
      }
    }
  }

  return results;
}
