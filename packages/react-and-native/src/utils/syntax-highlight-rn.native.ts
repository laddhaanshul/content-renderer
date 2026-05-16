/**
 * React Native syntax highlighting utility.
 *
 * Tokenizes source code and returns arrays of `{text, color}` tokens that
 * can be rendered as `<Text>` elements with appropriate color styles.
 *
 * Supports: JavaScript, TypeScript, HTML, CSS, PHP, JSON, Python, Java, SQL, Bash, XML, Markdown, YAML, Go, Rust, C, C++.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyntaxToken {
  text: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
}

export interface SyntaxTheme {
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  variable: string;
  operator: string;
  type: string;
  tag: string;
  attribute: string;
  attributeValue: string;
  punctuation: string;
  regexp: string;
  constant: string;
  decorator: string;
  plain: string;
}

// ---------------------------------------------------------------------------
// Default themes
// ---------------------------------------------------------------------------

export const LIGHT_SYNTAX_THEME: SyntaxTheme = {
  keyword:      '#d73a49',
  string:       '#032f62',
  number:       '#005cc5',
  comment:      '#6a737d',
  function:     '#6f42c1',
  variable:     '#e36209',
  operator:     '#d73a49',
  type:         '#005cc5',
  tag:          '#22863a',
  attribute:    '#6f42c1',
  attributeValue: '#032f62',
  punctuation:  '#24292e',
  regexp:       '#032f62',
  constant:     '#005cc5',
  decorator:    '#6f42c1',
  plain:        '#24292e',
};

export const DARK_SYNTAX_THEME: SyntaxTheme = {
  keyword:      '#ff7b72',
  string:       '#a5d6ff',
  number:       '#79c0ff',
  comment:      '#8b949e',
  function:     '#d2a8ff',
  variable:     '#ffa657',
  operator:     '#ff7b72',
  type:         '#79c0ff',
  tag:          '#7ee787',
  attribute:    '#d2a8ff',
  attributeValue: '#a5d6ff',
  punctuation:  '#c9d1d9',
  regexp:       '#a5d6ff',
  constant:     '#79c0ff',
  decorator:    '#d2a8ff',
  plain:        '#c9d1d9',
};

// ---------------------------------------------------------------------------
// Language keyword sets
// ---------------------------------------------------------------------------

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
  'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new',
  'of', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield', 'async', 'await',
]);

const TS_KEYWORDS = new Set([
  ...JS_KEYWORDS,
  'type', 'interface', 'enum', 'namespace', 'declare', 'abstract',
  'implements', 'extends', 'readonly', 'keyof', 'infer', 'as', 'is',
  'never', 'unknown', 'string', 'number', 'boolean', 'any', 'void',
  'null', 'undefined', 'symbol', 'bigint', 'object',
]);

const PYTHON_KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not',
  'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  'True', 'False', 'None',
]);

const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto',
  'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long',
  'native', 'new', 'package', 'private', 'protected', 'public', 'return',
  'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
  'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile',
  'while',
]);

const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'insert', 'into', 'update', 'delete', 'create',
  'drop', 'alter', 'table', 'index', 'view', 'join', 'inner', 'outer',
  'left', 'right', 'full', 'on', 'and', 'or', 'not', 'null', 'is', 'in',
  'like', 'between', 'order', 'by', 'group', 'having', 'limit', 'offset',
  'union', 'all', 'as', 'distinct', 'count', 'sum', 'avg', 'min', 'max',
  'exists', 'case', 'when', 'then', 'else', 'end', 'asc', 'desc', 'set',
  'values', 'primary', 'key', 'foreign', 'references', 'constraint',
  'default', 'check', 'unique', 'begin', 'commit', 'rollback', 'grant',
  'revoke', 'truncate', 'if', 'with', 'recursive', 'over', 'partition',
  'window', 'rows', 'range', 'preceding', 'following', 'current', 'row',
]);

const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do',
  'done', 'case', 'esac', 'in', 'function', 'return', 'exit', 'local',
  'export', 'readonly', 'declare', 'typeset', 'unset', 'source', 'alias',
  'echo', 'printf', 'read', 'cd', 'ls', 'rm', 'cp', 'mv', 'mkdir',
  'chmod', 'chown', 'grep', 'sed', 'awk', 'cat', 'find', 'sort', 'uniq',
  'wc', 'head', 'tail', 'cut', 'tr', 'xargs', 'tee', 'true', 'false',
  'test', '[', ']]',
]);

const GO_KEYWORDS = new Set([
  'break', 'case', 'chan', 'const', 'continue', 'default', 'defer',
  'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import',
  'interface', 'map', 'package', 'range', 'return', 'select', 'struct',
  'switch', 'type', 'var',
]);

const RUST_KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn',
  'else', 'enum', 'extern', 'fn', 'for', 'if', 'impl', 'in', 'let',
  'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self',
  'Self', 'static', 'struct', 'super', 'trait', 'type', 'unsafe', 'use',
  'where', 'while',
]);

const C_KEYWORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
  'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
  'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
  'unsigned', 'void', 'volatile', 'while',
]);

const PHP_KEYWORDS = new Set([
  'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch',
  'class', 'clone', 'const', 'continue', 'declare', 'default', 'die',
  'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endswitch',
  'endwhile', 'eval', 'exit', 'extends', 'final', 'finally', 'fn', 'for',
  'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include',
  'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list',
  'match', 'namespace', 'new', 'or', 'print', 'private', 'protected',
  'public', 'require', 'require_once', 'return', 'static', 'switch',
  'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor', 'yield',
  'true', 'false', 'null', 'void', 'int', 'float', 'bool', 'string',
  'self', 'parent',
]);

const YAML_KEYWORDS = new Set([
  'true', 'false', 'null', 'yes', 'no', 'on', 'off',
]);

// ---------------------------------------------------------------------------
// Tokenizer base
// ---------------------------------------------------------------------------

type Language = 'js' | 'ts' | 'html' | 'css' | 'php' | 'json' | 'python'
  | 'java' | 'sql' | 'bash' | 'xml' | 'markdown' | 'yaml' | 'go' | 'rust'
  | 'c' | 'cpp' | 'tsx' | 'jsx' | 'shell' | 'ruby' | 'plaintext';

function getKeywords(lang: Language): Set<string> {
  switch (lang) {
    case 'js':
    case 'jsx':
      return JS_KEYWORDS;
    case 'ts':
    case 'tsx':
      return TS_KEYWORDS;
    case 'python':
      return PYTHON_KEYWORDS;
    case 'java':
      return JAVA_KEYWORDS;
    case 'sql':
      return SQL_KEYWORDS;
    case 'bash':
    case 'shell':
      return BASH_KEYWORDS;
    case 'go':
      return GO_KEYWORDS;
    case 'rust':
      return RUST_KEYWORDS;
    case 'c':
    case 'cpp':
      return C_KEYWORDS;
    case 'php':
      return PHP_KEYWORDS;
    case 'yaml':
      return YAML_KEYWORDS;
    default:
      return JS_KEYWORDS;
  }
}

/**
 * Escape regex special characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Generic tokenizer
// ---------------------------------------------------------------------------

/**
 * Tokenize a line of source code into syntax-highlighted tokens.
 * Returns an array of {text, color} objects.
 */
export function tokenizeLine(
  line: string,
  lang: Language,
  theme: SyntaxTheme = LIGHT_SYNTAX_THEME,
  state?: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const newState: TokenizerState = { ...DEFAULT_STATE, ...state };

  if (lang === 'json') {
    return { tokens: tokenizeJSON(line, theme), state: newState };
  }

  if (lang === 'html' || lang === 'xml') {
    return tokenizeHTML(line, theme, newState);
  }

  if (lang === 'css') {
    return tokenizeCSS(line, theme, newState);
  }

  if (lang === 'php') {
    return tokenizePHP(line, theme, newState);
  }

  if (lang === 'bash' || lang === 'shell') {
    return tokenizeBash(line, theme, newState);
  }

  if (lang === 'python') {
    return tokenizePython(line, theme, newState);
  }

  if (lang === 'sql') {
    return tokenizeSQL(line, theme, newState);
  }

  if (lang === 'yaml') {
    return tokenizeYAML(line, theme);
  }

  if (lang === 'markdown') {
    return tokenizeMarkdown(line, theme);
  }

  // Default: generic tokenizer for JS, TS, Java, Go, Rust, C, C++
  return tokenizeGeneric(line, lang, theme, newState);
}

export interface TokenizerState {
  inBlockComment: boolean;
  inString: string | null;       // "'", '"', '`', or null
  inRegex: boolean;
  inTemplateLiteral: boolean;
  bracketDepth: number;
  parenDepth: number;
}

const DEFAULT_STATE: TokenizerState = {
  inBlockComment: false,
  inString: null,
  inRegex: false,
  inTemplateLiteral: false,
  bracketDepth: 0,
  parenDepth: 0,
};

// ---------------------------------------------------------------------------
// Generic tokenizer (JS, TS, Java, Go, Rust, C, C++)
// ---------------------------------------------------------------------------

function tokenizeGeneric(
  line: string,
  lang: Language,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  const keywords = getKeywords(lang);
  let i = 0;
  const len = line.length;

  while (i < len) {
    // Block comment
    if (state.inBlockComment) {
      const end = line.indexOf('*/', i);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.comment });
        i = len;
        break;
      }
      tokens.push({ text: line.slice(i, end + 2), color: theme.comment });
      i = end + 2;
      state.inBlockComment = false;
      continue;
    }

    // String (single/double/backtick)
    if (state.inString) {
      const quote = state.inString;
      if (quote === '`') {
        // Template literal: handle ${...}
        const dollarIdx = line.indexOf('${', i);
        const endIdx = findStringEnd(line, i, quote);
        if (dollarIdx !== -1 && dollarIdx < endIdx) {
          if (dollarIdx > i) {
            tokens.push({ text: line.slice(i, dollarIdx), color: theme.string });
          }
          state.inString = null;
          state.inTemplateLiteral = true;
          i = dollarIdx + 2;
          state.bracketDepth++;
          continue;
        }
      }
      const end = findStringEnd(line, i, quote);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
        continue;
      }
      tokens.push({ text: line.slice(i, end + 1), color: theme.string });
      i = end + 1;
      state.inString = null;
      continue;
    }

    // Template literal interpolation
    if (state.inTemplateLiteral) {
      // Look for closing }
      let depth = 1;
      let j = i;
      while (j < len && depth > 0) {
        if (line[j] === '{') depth++;
        if (line[j] === '}') depth--;
        if (depth > 0) j++;
      }
      if (depth === 0) {
        // Render the expression inside ${}
        const expr = line.slice(i, j);
        const exprTokens = tokenizeGeneric(expr, lang, theme, { ...DEFAULT_STATE });
        tokens.push(...exprTokens.tokens);
        i = j + 1;
        state.inTemplateLiteral = false;
        state.inString = '`';
        continue;
      }
      tokens.push({ text: line.slice(i), color: theme.plain });
      i = len;
      continue;
    }

    const ch = line[i];

    // Start of block comment
    if (ch === '/' && line[i + 1] === '*') {
      state.inBlockComment = true;
      i += 2;
      continue;
    }

    // Line comment
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Java/C style line comment
    if (lang === 'java' && ch === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Go style line comment
    if (lang === 'go' && ch === '/') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Rust style line comment
    if (lang === 'rust' && ch === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Python-style comment (when used generically)
    if (ch === '#' && (lang === 'python' || lang === 'bash' || lang === 'shell' || lang === 'yaml' || lang === 'ruby')) {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      state.inString = ch;
      i++;
      continue;
    }

    // Numbers
    if (/\d/.test(ch) || (ch === '.' && i + 1 < len && /\d/.test(line[i + 1]))) {
      const numStart = i;
      if (ch === '0' && (line[i + 1] === 'x' || line[i + 1] === 'X' || line[i + 1] === 'b' || line[i + 1] === 'B' || line[i + 1] === 'o' || line[i + 1] === 'O')) {
        i += 2;
      }
      while (i < len && /[\da-fA-F_xXoObBeE.n]/.test(line[i])) i++;
      // Handle type suffixes (f, L, etc.)
      if (i < len && /[fFlLuU]/.test(line[i])) i++;
      tokens.push({ text: line.slice(numStart, i), color: theme.number });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$@]/.test(ch)) {
      const idStart = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) i++;
      const word = line.slice(idStart, i);

      // Check for function call
      if (i < len && line[i] === '(') {
        if (keywords.has(word)) {
          tokens.push({ text: word, color: theme.keyword });
        } else if (isUpperCaseFirst(word)) {
          tokens.push({ text: word, color: theme.type });
        } else {
          tokens.push({ text: word, color: theme.function });
        }
      } else if (keywords.has(word)) {
        tokens.push({ text: word, color: theme.keyword });
      } else if (isUpperCaseFirst(word) || (lang === 'rust' && word[0] === word[0].toUpperCase())) {
        tokens.push({ text: word, color: theme.type });
      } else if (word === 'true' || word === 'false' || word === 'null' || word === 'undefined' || word === 'nil' || word === 'None') {
        tokens.push({ text: word, color: theme.constant });
      } else if (ch === '$' || ch === '@') {
        tokens.push({ text: word, color: theme.variable });
      } else {
        tokens.push({ text: word, color: theme.plain });
      }
      continue;
    }

    // Operators
    if (/[+\-*/%=<>!&|^~?:]/.test(ch)) {
      let opStart = i;
      while (i < len && /[+\-*/%=<>!&|^~?:]/.test(line[i])) i++;
      tokens.push({ text: line.slice(opStart, i), color: theme.operator });
      continue;
    }

    // Punctuation
    if (/[{}()\[\];,.]/.test(ch)) {
      if (ch === '{' && state.inTemplateLiteral) {
        state.bracketDepth++;
      }
      if (ch === '}' && state.inTemplateLiteral) {
        state.bracketDepth--;
        if (state.bracketDepth === 0) {
          state.inTemplateLiteral = false;
          state.inString = '`';
          i++;
          continue;
        }
      }
      tokens.push({ text: ch, color: theme.punctuation });
      i++;
      continue;
    }

    // Decorators / annotations
    if (ch === '@' && lang !== 'java') {
      const decStart = i;
      i++;
      while (i < len && /[a-zA-Z0-9_]/.test(line[i])) i++;
      tokens.push({ text: line.slice(decStart, i), color: theme.decorator });
      continue;
    }

    // Java/C++ annotations: @Annotation
    if (ch === '@' && (lang === 'java' || lang === 'cpp')) {
      const annStart = i;
      i++;
      while (i < len && /[a-zA-Z0-9_]/.test(line[i])) i++;
      tokens.push({ text: line.slice(annStart, i), color: theme.decorator });
      continue;
    }

    // Whitespace and other characters
    tokens.push({ text: ch, color: theme.plain });
    i++;
  }

  return { tokens, state };
}

function isUpperCaseFirst(s: string): boolean {
  return s.length > 0 && s[0] === s[0].toUpperCase() && s[0] !== s[0].toLowerCase();
}

function findStringEnd(line: string, start: number, quote: string): number {
  let i = start;
  const len = line.length;
  while (i < len) {
    if (line[i] === '\\') {
      i += 2;
      continue;
    }
    if (line[i] === quote) return i;
    i++;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// HTML / XML tokenizer
// ---------------------------------------------------------------------------

function tokenizeHTML(
  line: string,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  const len = line.length;

  // Handle multi-line block comments in script/style
  if (state.inBlockComment) {
    const end = line.indexOf('-->', i);
    if (end === -1) {
      tokens.push({ text: line, color: theme.comment });
      return { tokens, state };
    }
    tokens.push({ text: line.slice(0, end + 3), color: theme.comment });
    i = end + 3;
    state.inBlockComment = false;
  }

  while (i < len) {
    // HTML comment
    if (line.slice(i, i + 4) === '<!--') {
      const end = line.indexOf('-->', i + 4);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.comment });
        state.inBlockComment = true;
        return { tokens, state };
      }
      tokens.push({ text: line.slice(i, end + 3), color: theme.comment });
      i = end + 3;
      continue;
    }

    // DOCTYPE
    if (line.slice(i, i + 9).toLowerCase() === '<!doctype') {
      const end = line.indexOf('>', i);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.tag });
        i = len;
        break;
      }
      tokens.push({ text: line.slice(i, end + 1), color: theme.tag });
      i = end + 1;
      continue;
    }

    // Opening tag
    if (line[i] === '<' && line[i + 1] !== '/') {
      const end = line.indexOf('>', i);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.tag });
        i = len;
        break;
      }

      const tagContent = line.slice(i + 1, end);
      const spaceIdx = tagContent.indexOf(' ');

      if (spaceIdx === -1) {
        // Tag name only (no attributes)
        tokens.push({ text: '<', color: theme.punctuation });
        tokens.push({ text: tagContent, color: theme.tag });
        tokens.push({ text: '>', color: theme.punctuation });
      } else {
        const tagName = tagContent.slice(0, spaceIdx);
        const rest = tagContent.slice(spaceIdx + 1);

        tokens.push({ text: '<', color: theme.punctuation });
        tokens.push({ text: tagName, color: theme.tag });

        // Parse attributes
        let j = 0;
        while (j < rest.length) {
          // Skip whitespace
          while (j < rest.length && /\s/.test(rest[j])) {
            tokens.push({ text: rest[j], color: theme.plain });
            j++;
          }
          if (j >= rest.length) break;

          // Attribute name
          const attrStart = j;
          while (j < rest.length && /[a-zA-Z0-9\-_@:.]/.test(rest[j])) j++;
          if (j > attrStart) {
            tokens.push({ text: rest.slice(attrStart, j), color: theme.attribute });
          }

          // Skip whitespace
          while (j < rest.length && /\s/.test(rest[j])) {
            tokens.push({ text: rest[j], color: theme.plain });
            j++;
          }

          // =
          if (j < rest.length && rest[j] === '=') {
            tokens.push({ text: '=', color: theme.operator });
            j++;
          }

          // Skip whitespace
          while (j < rest.length && /\s/.test(rest[j])) {
            tokens.push({ text: rest[j], color: theme.plain });
            j++;
          }

          // Attribute value
          if (j < rest.length) {
            if (rest[j] === '"' || rest[j] === "'") {
              const q = rest[j];
              const valStart = j + 1;
              const valEnd = rest.indexOf(q, valStart);
              if (valEnd === -1) {
                tokens.push({ text: rest.slice(j), color: theme.attributeValue });
                j = rest.length;
              } else {
                tokens.push({ text: rest.slice(j, valEnd + 1), color: theme.attributeValue });
                j = valEnd + 1;
              }
            } else {
              const valStart = j;
              while (j < rest.length && !/[\s>]/.test(rest[j])) j++;
              if (j > valStart) {
                tokens.push({ text: rest.slice(valStart, j), color: theme.attributeValue });
              }
            }
          }
        }

        // Handle self-closing />
        if (rest.endsWith('/')) {
          tokens.push({ text: '/', color: theme.punctuation });
        }
        tokens.push({ text: '>', color: theme.punctuation });
      }
      i = end + 1;
      continue;
    }

    // Closing tag
    if (line[i] === '<' && line[i + 1] === '/') {
      const end = line.indexOf('>', i);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.tag });
        i = len;
        break;
      }
      const tagName = line.slice(i + 2, end).trim();
      tokens.push({ text: '</', color: theme.punctuation });
      tokens.push({ text: tagName, color: theme.tag });
      tokens.push({ text: '>', color: theme.punctuation });
      i = end + 1;
      continue;
    }

    // Entity
    if (line[i] === '&') {
      const semiIdx = line.indexOf(';', i);
      if (semiIdx !== -1 && semiIdx - i < 10) {
        tokens.push({ text: line.slice(i, semiIdx + 1), color: theme.constant });
        i = semiIdx + 1;
        continue;
      }
    }

    // Plain text
    const textStart = i;
    while (i < len && line[i] !== '<' && line[i] !== '&') i++;
    if (i > textStart) {
      tokens.push({ text: line.slice(textStart, i), color: theme.plain });
    }
  }

  return { tokens, state };
}

// ---------------------------------------------------------------------------
// CSS tokenizer
// ---------------------------------------------------------------------------

function tokenizeCSS(
  line: string,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  const len = line.length;

  if (state.inBlockComment) {
    const end = line.indexOf('*/', i);
    if (end === -1) {
      tokens.push({ text: line, color: theme.comment });
      return { tokens, state };
    }
    tokens.push({ text: line.slice(0, end + 2), color: theme.comment });
    i = end + 2;
    state.inBlockComment = false;
  }

  while (i < len) {
    // Block comment
    if (line[i] === '/' && line[i + 1] === '*') {
      state.inBlockComment = true;
      const end = line.indexOf('*/', i + 2);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.comment });
        return { tokens, state };
      }
      tokens.push({ text: line.slice(i, end + 2), color: theme.comment });
      i = end + 2;
      state.inBlockComment = false;
      continue;
    }

    // Line comment (CSS doesn't officially have them but some preprocessors do)
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Strings
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      const end = findStringEnd(line, i + 1, q);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      continue;
    }

    // @-rules
    if (line[i] === '@') {
      const start = i;
      i++;
      while (i < len && /[a-zA-Z\-]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.keyword });
      continue;
    }

    // Selectors (before : or {)
    // Properties (after a word followed by :)
    // Values (after :)

    // Numbers with units
    if (/\d/.test(line[i])) {
      const start = i;
      while (i < len && /[\d.%]/.test(line[i])) i++;
      // Consume unit
      while (i < len && /[a-zA-Z]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Punctuation
    if (line[i] === '{' || line[i] === '}' || line[i] === '(' || line[i] === ')') {
      tokens.push({ text: line[i], color: theme.punctuation });
      i++;
      continue;
    }

    if (line[i] === ':' || line[i] === ';') {
      tokens.push({ text: line[i], color: theme.operator });
      i++;
      continue;
    }

    if (line[i] === ',' || line[i] === '.' || line[i] === '#' || line[i] === '*' || line[i] === '>' || line[i] === '+' || line[i] === '~' || line[i] === '[' || line[i] === ']') {
      tokens.push({ text: line[i], color: theme.punctuation });
      i++;
      continue;
    }

    // Identifiers: property names, selectors, values
    if (/[a-zA-Z\-_]/.test(line[i])) {
      const start = i;
      while (i < len && /[a-zA-Z0-9\-_]/.test(line[i])) i++;
      const word = line.slice(start, i);

      // Check context: is this a property or a value?
      // Look backwards for ':'
      const before = line.slice(0, start).trimEnd();
      if (before.endsWith(':')) {
        // Value context
        tokens.push({ text: word, color: theme.attributeValue });
      } else if (before.endsWith('{') || before === '' || /[},]/.test(before[before.length - 1])) {
        // Selector context
        tokens.push({ text: word, color: theme.tag });
      } else {
        // Property context
        tokens.push({ text: word, color: theme.attribute });
      }
      continue;
    }

    // Hex colors
    if (line[i] === '#') {
      const start = i;
      i++;
      while (i < len && /[a-fA-F0-9]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Whitespace
    tokens.push({ text: line[i], color: theme.plain });
    i++;
  }

  return { tokens, state };
}

// ---------------------------------------------------------------------------
// PHP tokenizer
// ---------------------------------------------------------------------------

function tokenizePHP(
  line: string,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  const keywords = PHP_KEYWORDS;
  let i = 0;
  const len = line.length;

  // Detect PHP mode
  const phpOpen = line.indexOf('<?php');
  if (phpOpen !== -1) {
    if (phpOpen > 0) {
      tokens.push({ text: line.slice(0, phpOpen), color: theme.tag });
    }
    tokens.push({ text: '<?php', color: theme.keyword });
    i = phpOpen + 5;
    // skip whitespace after <?php
    while (i < len && /\s/.test(line[i])) {
      tokens.push({ text: line[i], color: theme.plain });
      i++;
    }
  }

  // Detect closing tag
  const phpClose = line.indexOf('?>');
  const effectiveLen = phpClose !== -1 ? phpClose : len;

  while (i < effectiveLen) {
    // Block comment
    if (state.inBlockComment) {
      const end = line.indexOf('*/', i);
      if (end === -1 || end > effectiveLen) {
        tokens.push({ text: line.slice(i, effectiveLen), color: theme.comment });
        i = effectiveLen;
        break;
      }
      tokens.push({ text: line.slice(i, end + 2), color: theme.comment });
      i = end + 2;
      state.inBlockComment = false;
      continue;
    }

    const ch = line[i];

    // PHP heredoc / nowdoc detection (simplified)

    // Block comment start
    if (ch === '/' && line[i + 1] === '*') {
      state.inBlockComment = true;
      i += 2;
      continue;
    }

    // Line comment //
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i, effectiveLen), color: theme.comment });
      i = effectiveLen;
      break;
    }

    // Line comment #
    if (ch === '#') {
      tokens.push({ text: line.slice(i, effectiveLen), color: theme.comment });
      i = effectiveLen;
      break;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      state.inString = ch;
      const end = findStringEnd(line, i + 1, ch);
      if (end === -1) {
        tokens.push({ text: line.slice(i, effectiveLen), color: theme.string });
        i = effectiveLen;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      state.inString = null;
      continue;
    }

    // Variables $var
    if (ch === '$') {
      const start = i;
      i++;
      while (i < effectiveLen && /[a-zA-Z0-9_]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.variable });
      continue;
    }

    // Numbers
    if (/\d/.test(ch) || (ch === '-' && i + 1 < len && /\d/.test(line[i + 1]))) {
      const start = i;
      if (ch === '-') i++;
      if (i < len && ch === '0' && (line[i] === 'x' || line[i] === 'X')) i += 2;
      while (i < effectiveLen && /[\d.]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Identifiers & keywords
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < effectiveLen && /[a-zA-Z0-9_]/.test(line[i])) i++;
      const word = line.slice(start, i);

      if (keywords.has(word)) {
        tokens.push({ text: word, color: theme.keyword });
      } else if (i < effectiveLen && line[i] === '(') {
        tokens.push({ text: word, color: theme.function });
      } else if (word[0] === word[0].toUpperCase()) {
        tokens.push({ text: word, color: theme.type });
      } else {
        tokens.push({ text: word, color: theme.plain });
      }
      continue;
    }

    // Operators
    if (/[+\-*/%=<>!&|^~?.]/.test(ch)) {
      tokens.push({ text: ch, color: theme.operator });
      i++;
      continue;
    }

    // PHP tags <<<
    if (ch === '<' && line[i + 1] === '<' && line[i + 2] === '<') {
      const start = i;
      while (i < effectiveLen && /[a-zA-Z0-9_'" ]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.string });
      continue;
    }

    // Arrow ->
    if (ch === '-' && line[i + 1] === '>') {
      tokens.push({ text: '->', color: theme.operator });
      i += 2;
      continue;
    }

    // Double colon ::
    if (ch === ':' && line[i + 1] === ':') {
      tokens.push({ text: '::', color: theme.operator });
      i += 2;
      continue;
    }

    // Punctuation
    tokens.push({ text: ch, color: theme.punctuation });
    i++;
  }

  if (phpClose !== -1) {
    tokens.push({ text: '?>', color: theme.keyword });
  }

  return { tokens, state };
}

// ---------------------------------------------------------------------------
// Bash tokenizer
// ---------------------------------------------------------------------------

function tokenizeBash(
  line: string,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  const keywords = BASH_KEYWORDS;
  let i = 0;
  const len = line.length;

  while (i < len) {
    const ch = line[i];

    // Comment
    if (ch === '#') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Strings
    if (ch === '"') {
      const end = findStringEnd(line, i + 1, '"');
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      continue;
    }

    // Single-quoted strings (no escaping)
    if (ch === "'") {
      const end = line.indexOf("'", i + 1);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      continue;
    }

    // Variables
    if (ch === '$') {
      const start = i;
      i++;
      if (i < len && line[i] === '{') {
        i++;
        while (i < len && line[i] !== '}') i++;
        if (i < len) i++;
      } else if (i < len && line[i] === '(') {
        i++;
        while (i < len && line[i] !== ')') i++;
        if (i < len) i++;
      } else {
        while (i < len && /[a-zA-Z0-9_]/.test(line[i])) i++;
      }
      tokens.push({ text: line.slice(start, i), color: theme.variable });
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      const start = i;
      while (i < len && /[\d]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_\-]/.test(line[i])) i++;
      const word = line.slice(start, i);

      if (keywords.has(word)) {
        tokens.push({ text: word, color: theme.keyword });
      } else if (i < len && line[i] === '(') {
        tokens.push({ text: word, color: theme.function });
      } else {
        tokens.push({ text: word, color: theme.plain });
      }
      continue;
    }

    // Operators
    if (/[|&;<>=!]/.test(ch)) {
      tokens.push({ text: ch, color: theme.operator });
      i++;
      continue;
    }

    // Punctuation
    tokens.push({ text: ch, color: theme.punctuation });
    i++;
  }

  return { tokens, state };
}

// ---------------------------------------------------------------------------
// Python tokenizer
// ---------------------------------------------------------------------------

function tokenizePython(
  line: string,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  const keywords = PYTHON_KEYWORDS;
  let i = 0;
  const len = line.length;

  while (i < len) {
    const ch = line[i];

    // Comment
    if (ch === '#') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Decorator
    if (ch === '@' && (i === 0 || line.slice(0, i).trim() === '')) {
      const start = i;
      i++;
      while (i < len && /[a-zA-Z0-9_.]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.decorator });
      continue;
    }

    // f-strings and r-strings
    if ((ch === 'f' || ch === 'r' || ch === 'b' || ch === 'u') && (line[i + 1] === '"' || line[i + 1] === "'") && (i === 0 || /[\s=:,(\[{]/.test(line[i - 1]))) {
      const start = i;
      i++;
      const q = line[i];
      if (line[i + 1] === q && line[i + 2] === q) {
        i += 3;
        const end = line.indexOf(q.repeat(3), i);
        if (end === -1) {
          tokens.push({ text: line.slice(start), color: theme.string });
          i = len;
        } else {
          tokens.push({ text: line.slice(start, end + 3), color: theme.string });
          i = end + 3;
        }
      } else {
        i++;
        const end = findStringEnd(line, i, q);
        if (end === -1) {
          tokens.push({ text: line.slice(start), color: theme.string });
          i = len;
        } else {
          tokens.push({ text: line.slice(start, end + 1), color: theme.string });
          i = end + 1;
        }
      }
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const start = i;
      i++;
      // Triple-quoted strings
      if (line[i] === ch && line[i + 1] === ch) {
        i += 2;
        const triple = ch.repeat(3);
        const end = line.indexOf(triple, i);
        if (end === -1) {
          tokens.push({ text: line.slice(start), color: theme.string });
          i = len;
        } else {
          tokens.push({ text: line.slice(start, end + 3), color: theme.string });
          i = end + 3;
        }
      } else {
        const end = findStringEnd(line, i, ch);
        if (end === -1) {
          tokens.push({ text: line.slice(start), color: theme.string });
          i = len;
        } else {
          tokens.push({ text: line.slice(start, end + 1), color: theme.string });
          i = end + 1;
        }
      }
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      const start = i;
      if (ch === '0' && (line[i + 1] === 'x' || line[i + 1] === 'X' || line[i + 1] === 'o' || line[i + 1] === 'O' || line[i + 1] === 'b' || line[i + 1] === 'B')) {
        i += 2;
      }
      while (i < len && /[\d.eE_]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_]/.test(line[i])) i++;
      const word = line.slice(start, i);

      if (keywords.has(word)) {
        tokens.push({ text: word, color: theme.keyword });
      } else if (i < len && line[i] === '(') {
        tokens.push({ text: word, color: theme.function });
      } else if (word[0] === word[0].toUpperCase() && word !== word.toLowerCase()) {
        tokens.push({ text: word, color: theme.type });
      } else {
        tokens.push({ text: word, color: theme.plain });
      }
      continue;
    }

    // Operators
    if (/[+\-*/%=<>!&|^~@:]/.test(ch)) {
      const start = i;
      while (i < len && /[+\-*/%=<>!&|^~@:]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.operator });
      continue;
    }

    // Punctuation
    tokens.push({ text: ch, color: theme.punctuation });
    i++;
  }

  return { tokens, state };
}

// ---------------------------------------------------------------------------
// SQL tokenizer
// ---------------------------------------------------------------------------

function tokenizeSQL(
  line: string,
  theme: SyntaxTheme,
  state: TokenizerState,
): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  const keywords = SQL_KEYWORDS;
  let i = 0;
  const len = line.length;

  if (state.inBlockComment) {
    const end = line.indexOf('*/', i);
    if (end === -1) {
      tokens.push({ text: line, color: theme.comment });
      return { tokens, state };
    }
    tokens.push({ text: line.slice(0, end + 2), color: theme.comment });
    i = end + 2;
    state.inBlockComment = false;
  }

  while (i < len) {
    const ch = line[i];

    // Block comment
    if (ch === '/' && line[i + 1] === '*') {
      state.inBlockComment = true;
      const end = line.indexOf('*/', i + 2);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.comment });
        return { tokens, state };
      }
      tokens.push({ text: line.slice(i, end + 2), color: theme.comment });
      i = end + 2;
      state.inBlockComment = false;
      continue;
    }

    // Line comment
    if (ch === '-' && line[i + 1] === '-') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Strings
    if (ch === "'") {
      const end = findStringEnd(line, i + 1, "'");
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      continue;
    }

    if (ch === '"') {
      const end = findStringEnd(line, i + 1, '"');
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      const start = i;
      while (i < len && /[\d.]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_]/.test(line[i])) i++;
      const word = line.slice(start, i);

      if (keywords.has(word.toLowerCase())) {
        tokens.push({ text: word, color: theme.keyword, bold: true });
      } else if (i < len && line[i] === '(') {
        tokens.push({ text: word, color: theme.function });
      } else {
        tokens.push({ text: word, color: theme.plain });
      }
      continue;
    }

    // Operators
    if (/[<>=!]/.test(ch)) {
      const start = i;
      while (i < len && /[<>=!]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.operator });
      continue;
    }

    if (/[+\-*/,;]/.test(ch)) {
      tokens.push({ text: ch, color: theme.punctuation });
      i++;
      continue;
    }

    // Placeholder ?
    if (ch === '?') {
      tokens.push({ text: ch, color: theme.constant });
      i++;
      continue;
    }

    tokens.push({ text: ch, color: theme.plain });
    i++;
  }

  return { tokens, state };
}

// ---------------------------------------------------------------------------
// JSON tokenizer
// ---------------------------------------------------------------------------

function tokenizeJSON(line: string, theme: SyntaxTheme): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    const ch = line[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      tokens.push({ text: ch, color: theme.plain });
      i++;
      continue;
    }

    // String
    if (ch === '"') {
      const end = findStringEnd(line, i + 1, '"');
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        const str = line.slice(i, end + 1);
        // Check if this is a key (followed by :)
        const afterStr = line.slice(end + 1).trimStart();
        if (afterStr[0] === ':') {
          tokens.push({ text: str, color: theme.attribute });
        } else {
          tokens.push({ text: str, color: theme.string });
        }
        i = end + 1;
      }
      continue;
    }

    // Numbers
    if (/\d/.test(ch) || ch === '-') {
      const start = i;
      if (ch === '-') i++;
      while (i < len && /[\d.eE+\-]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Booleans and null
    if (ch === 't' && line.slice(i, i + 4) === 'true') {
      tokens.push({ text: 'true', color: theme.constant });
      i += 4;
      continue;
    }
    if (ch === 'f' && line.slice(i, i + 5) === 'false') {
      tokens.push({ text: 'false', color: theme.constant });
      i += 5;
      continue;
    }
    if (ch === 'n' && line.slice(i, i + 4) === 'null') {
      tokens.push({ text: 'null', color: theme.constant });
      i += 4;
      continue;
    }

    // Punctuation
    tokens.push({ text: ch, color: theme.punctuation });
    i++;
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// YAML tokenizer
// ---------------------------------------------------------------------------

function tokenizeYAML(line: string, theme: SyntaxTheme): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  const keywords = YAML_KEYWORDS;
  let i = 0;
  const len = line.length;
  const trimmed = line.trimStart();

  // Document markers
  if (trimmed === '---' || trimmed === '...') {
    tokens.push({ text: line, color: theme.keyword });
    return { tokens, state: DEFAULT_STATE };
  }

  while (i < len) {
    const ch = line[i];

    // Comment
    if (ch === '#') {
      tokens.push({ text: line.slice(i), color: theme.comment });
      i = len;
      break;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const end = findStringEnd(line, i + 1, ch);
      if (end === -1) {
        tokens.push({ text: line.slice(i), color: theme.string });
        i = len;
      } else {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
      }
      continue;
    }

    // Key: before colon (if followed by space or end of line)
    if (ch === ':') {
      tokens.push({ text: ':', color: theme.operator });
      i++;
      continue;
    }

    if (ch === '-' && (i === 0 || line[i - 1] === ' ' || line[i - 1] === '\n')) {
      tokens.push({ text: '-', color: theme.punctuation });
      i++;
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      const start = i;
      while (i < len && /[\d.eE+\-xXob_]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: theme.number });
      continue;
    }

    // Identifiers
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_\-]/.test(line[i])) i++;
      const word = line.slice(start, i);

      if (keywords.has(word)) {
        tokens.push({ text: word, color: theme.constant });
      } else {
        tokens.push({ text: word, color: theme.plain });
      }
      continue;
    }

    tokens.push({ text: ch, color: theme.plain });
    i++;
  }

  return { tokens, state: DEFAULT_STATE };
}

// ---------------------------------------------------------------------------
// Markdown tokenizer
// ---------------------------------------------------------------------------

function tokenizeMarkdown(line: string, theme: SyntaxTheme): { tokens: SyntaxToken[]; state: TokenizerState } {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  const len = line.length;

  // Headings
  const headingMatch = line.match(/^(#{1,6})\s/);
  if (headingMatch) {
    tokens.push({ text: headingMatch[1], color: theme.keyword });
    i = headingMatch[1].length + 1;
  }

  // List markers
  const ulMatch = line.match(/^(\s*)([-*+])\s/);
  const olMatch = line.match(/^(\s*)(\d+\.)\s/);
  if (ulMatch) {
    i += ulMatch[1].length;
    tokens.push({ text: ulMatch[2], color: theme.keyword });
    i += ulMatch[2].length + 1;
  } else if (olMatch) {
    i += olMatch[1].length;
    tokens.push({ text: olMatch[2], color: theme.keyword });
    i += olMatch[2].length + 1;
  }

  // Blockquote
  const bqMatch = line.match(/^>\s?/);
  if (bqMatch) {
    tokens.push({ text: '>', color: theme.keyword });
    i = bqMatch[0].length;
  }

  // Task list
  const taskMatch = line.match(/\[([ xX])\]/);
  if (taskMatch) {
    const idx = line.indexOf(taskMatch[0]);
    if (idx >= i) {
      if (idx > i) tokens.push({ text: line.slice(i, idx), color: theme.plain });
      tokens.push({ text: taskMatch[0], color: theme.keyword });
      i = idx + taskMatch[0].length;
    }
  }

  while (i < len) {
    const ch = line[i];

    // Code span
    if (ch === '`') {
      const end = line.indexOf('`', i + 1);
      if (end !== -1) {
        tokens.push({ text: line.slice(i, end + 1), color: theme.string });
        i = end + 1;
        continue;
      }
    }

    // Bold
    if (ch === '*' && line[i + 1] === '*' && line[i + 2] !== '*') {
      const end = line.indexOf('**', i + 2);
      if (end !== -1) {
        tokens.push({ text: '**', color: theme.keyword });
        i += 2;
        // Content
        const contentEnd = end;
        const content = line.slice(i, contentEnd);
        tokens.push({ text: content, color: theme.plain, bold: true });
        i = contentEnd;
        tokens.push({ text: '**', color: theme.keyword });
        i += 2;
        continue;
      }
    }

    // Italic
    if (ch === '*' && line[i + 1] !== '*') {
      tokens.push({ text: '*', color: theme.keyword });
      i++;
      continue;
    }

    // Links [text](url)
    if (ch === '[') {
      const bracketEnd = line.indexOf(']', i + 1);
      if (bracketEnd !== -1 && line[bracketEnd + 1] === '(') {
        const parenEnd = line.indexOf(')', bracketEnd + 2);
        if (parenEnd !== -1) {
          tokens.push({ text: '[', color: theme.punctuation });
          i++;
          const linkText = line.slice(i, bracketEnd);
          tokens.push({ text: linkText, color: theme.string });
          tokens.push({ text: '](', color: theme.punctuation });
          i = bracketEnd + 2;
          const url = line.slice(i, parenEnd);
          tokens.push({ text: url, color: theme.attributeValue });
          tokens.push({ text: ')', color: theme.punctuation });
          i = parenEnd + 1;
          continue;
        }
      }
    }

    // Image
    if (ch === '!' && line[i + 1] === '[') {
      const bracketEnd = line.indexOf(']', i + 2);
      if (bracketEnd !== -1 && line[bracketEnd + 1] === '(') {
        const parenEnd = line.indexOf(')', bracketEnd + 2);
        if (parenEnd !== -1) {
          tokens.push({ text: '![', color: theme.keyword });
          i += 2;
          const alt = line.slice(i, bracketEnd);
          tokens.push({ text: alt, color: theme.plain });
          tokens.push({ text: '](', color: theme.punctuation });
          i = bracketEnd + 2;
          const url = line.slice(i, parenEnd);
          tokens.push({ text: url, color: theme.attributeValue });
          tokens.push({ text: ')', color: theme.punctuation });
          i = parenEnd + 1;
          continue;
        }
      }
    }

    // Horizontal rule
    if ((ch === '-' || ch === '*') && line.slice(i, i + 3).match(/^[-*]{3}$/)) {
      tokens.push({ text: line.slice(i, i + 3), color: theme.keyword });
      i += 3;
      continue;
    }

    tokens.push({ text: ch, color: theme.plain });
    i++;
  }

  return { tokens, state: DEFAULT_STATE };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Highlight an entire source string.
 * Returns a 2D array (lines × tokens) suitable for rendering.
 */
export function highlightCode(
  code: string,
  lang: Language,
  theme: SyntaxTheme = LIGHT_SYNTAX_THEME,
): SyntaxToken[][] {
  const lines = code.split('\n');
  const result: SyntaxToken[][] = [];
  let state: TokenizerState = { ...DEFAULT_STATE };

  for (const line of lines) {
    const { tokens, state: newState } = tokenizeLine(line, lang, theme, state);
    result.push(tokens);
    state = newState;
  }

  return result;
}

/**
 * Detect language from file extension or language hint.
 */
export function detectLanguage(lang: string): Language {
  const normalized = lang.toLowerCase().trim().replace(/[^a-z0-9+#-]/g, '');

  const MAP: Record<string, Language> = {
    js: 'js', javascript: 'js', jsx: 'jsx', mjs: 'js', cjs: 'js',
    ts: 'ts', typescript: 'ts', tsx: 'tsx',
    html: 'html', htm: 'html', svg: 'html',
    xml: 'xml', xsl: 'xml', xslt: 'xml', rss: 'xml', atom: 'xml',
    css: 'css', scss: 'css', sass: 'css', less: 'css', stylus: 'css',
    php: 'php',
    json: 'json', jsonc: 'json', json5: 'json',
    py: 'python', python: 'python', pyw: 'python',
    java: 'java',
    sql: 'sql', mysql: 'sql', postgresql: 'sql', sqlite: 'sql', psql: 'sql',
    sh: 'bash', bash: 'bash', zsh: 'bash', shell: 'shell',
    yaml: 'yaml', yml: 'yaml',
    go: 'go', golang: 'go',
    rs: 'rust', rust: 'rust',
    c: 'c', h: 'c',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
    md: 'markdown', markdown: 'markdown', mdx: 'markdown',
    rb: 'ruby', ruby: 'ruby',
    swift: 'plaintext',
    kotlin: 'plaintext', kt: 'plaintext',
    dart: 'plaintext',
    r: 'plaintext',
    plaintext: 'plaintext', text: 'plaintext', txt: 'plaintext',
  };

  return MAP[normalized] || 'plaintext';
}
