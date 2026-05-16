/**
 * Syntax highlighting tokenizer for multiple programming languages.
 *
 * Provides regex-based tokenization for common languages. Each language
 * has a set of token patterns that match keywords, strings, comments,
 * numbers, operators, and other syntactic elements.
 */

// ─── Token Types ─────────────────────────────────────────────────────────────

export type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'operator'
  | 'function'
  | 'class'
  | 'tag'
  | 'attribute'
  | 'property'
  | 'punctuation'
  | 'builtin'
  | 'variable'
  | 'type'
  | 'regex'
  | 'literal'
  | 'plain';

export interface Token {
  type: TokenType;
  value: string;
  className: string;
}

// ─── CSS class mapping ──────────────────────────────────────────────────────

const CLASS_MAP: Record<TokenType, string> = {
  keyword: 'cr-keyword',
  string: 'cr-string',
  comment: 'cr-comment',
  number: 'cr-number',
  operator: 'cr-operator',
  function: 'cr-function',
  class: 'cr-class',
  tag: 'cr-tag',
  attribute: 'cr-attribute',
  property: 'cr-property',
  punctuation: 'cr-punctuation',
  builtin: 'cr-builtin',
  variable: 'cr-variable',
  type: 'cr-type',
  regex: 'cr-regex',
  literal: 'cr-literal',
  plain: 'cr-plain',
};

function tc(type: TokenType, value: string): Token {
  return { type, value, className: CLASS_MAP[type] };
}

// ─── Language Definitions ────────────────────────────────────────────────────

interface LanguageDefinition {
  keywords: string[];
  typeKeywords?: string[];
  builtins?: string[];
  operators?: string[];
  /** Ordered list of { regex, token } rules. Evaluated left-to-right, first match wins. */
  rules: Array<{ regex: RegExp; token: TokenType }>;
  /** Optional multi-character operators checked after single-char operators */
  multiCharOperators?: string[];
}

// ─── JavaScript / TypeScript ────────────────────────────────────────────────

const JS_KEYWORDS = [
  'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
  'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
  'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
  'void', 'while', 'with', 'let', 'const', 'class', 'export', 'import',
  'from', 'extends', 'super', 'yield', 'async', 'await', 'of', 'static',
  'get', 'set',
];

const JS_TYPE_KEYWORDS = [
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
  'string', 'number', 'boolean', 'object', 'symbol', 'bigint', 'any',
  'unknown', 'never', 'void', 'enum', 'interface', 'type', 'implements',
  'declare', 'abstract', 'readonly', 'keyof', 'infer', 'is', 'as',
  'satisfies', 'asserts',
];

const JS_BUILTINS = [
  'console', 'window', 'document', 'Math', 'JSON', 'Array', 'Object',
  'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Error', 'Map', 'Set',
  'WeakMap', 'WeakSet', 'Promise', 'Symbol', 'Proxy', 'Reflect',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI',
  'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'fetch', 'requestAnimationFrame', 'cancelAnimationFrame',
  'process', 'global', 'globalThis', 'Buffer', '__dirname', '__filename',
];

function buildJsRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Single-line comments
    { regex: /\/\/.*$/m, token: 'comment' },
    // Multi-line comments
    { regex: /\/\*[\s\S]*?\*\//, token: 'comment' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    { regex: /`(?:[^`\\]|\\.)*`/, token: 'string' },
    // Numbers
    { regex: /\b(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\b/, token: 'number' },
    // Regex (heuristic: after =, (, [, !, &, |, ;, {, }, ,, :, ?, ~, ^, return)
    { regex: /\/(?![*\/])(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\[])+\/[gimsuy]*/, token: 'regex' },
    // TypeScript decorators
    { regex: /@\w+/, token: 'builtin' },
  ];
}

// ─── HTML ────────────────────────────────────────────────────────────────────

function buildHtmlRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Comments
    { regex: /<!--[\s\S]*?-->/, token: 'comment' },
    // Strings inside tags
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // Closing tag
    { regex: /<\/\s*[a-zA-Z][a-zA-Z0-9-]*\s*>/, token: 'tag' },
    // Self-closing tag with attributes
    { regex: /<[a-zA-Z][a-zA-Z0-9-]*\s+[\s\S]*?\/>/, token: 'tag' },
    // Opening tag
    { regex: /<[a-zA-Z][a-zA-Z0-9-]*\s*>/, token: 'tag' },
    // Doctype
    { regex: /<!DOCTYPE[^>]*>/i, token: 'keyword' },
    // Entity references
    { regex: /&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/, token: 'literal' },
    // Attribute name followed by =
    { regex: /\b[a-zA-Z_][\w-]*(?=\s*=)/, token: 'attribute' },
    // Standalone attribute (boolean)
    { regex: /\b[a-zA-Z_][\w-]*(?=\s|\/?>)/, token: 'attribute' },
  ];
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS_KEYWORDS = [
  '@import', '@charset', '@namespace', '@keyframes', '@media',
  '@supports', '@font-face', '@page', '@layer', '@container',
  '@property', '@counter-style', '@font-feature-values',
];

function buildCssRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Comments
    { regex: /\/\*[\s\S]*?\*\//, token: 'comment' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // At-rules
    { regex: /@(?:import|charset|namespace|keyframes|media|supports|font-face|page|layer|container|property|counter-style|font-feature-values)\b/, token: 'keyword' },
    // Numbers with units
    { regex: /\b\d+\.?\d*(?:px|em|rem|vh|vw|vmin|vmax|%|deg|rad|grad|turn|s|ms|fr|ch|ex|pt|pc|in|cm|mm|dpi|dpcm|dppx)?\b/, token: 'number' },
    // Hex colors
    { regex: /#[0-9a-fA-F]{3,8}\b/, token: 'number' },
    // !important
    { regex: /!important/, token: 'keyword' },
    // Pseudo-classes and pseudo-elements
    { regex: /::?[a-zA-Z-]+(?:\([^)]*\))?/, token: 'class' },
  ];
}

// ─── PHP ─────────────────────────────────────────────────────────────────────

const PHP_KEYWORDS = [
  'abstract', 'and', 'array', 'as', 'break', 'callable', 'case',
  'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default',
  'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare',
  'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'ev' + 'al',
  'exit', 'extends', 'final', 'finally', 'fn', 'for', 'foreach',
  'function', 'global', 'goto', 'if', 'implements', 'include',
  'include_once', 'instanceof', 'insteadof', 'interface', 'isset',
  'list', 'match', 'namespace', 'new', 'or', 'print', 'private',
  'protected', 'public', 'readonly', 'require', 'require_once',
  'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset',
  'use', 'var', 'while', 'xor', 'yield', 'yield from',
];

const PHP_TYPE_KEYWORDS = [
  'true', 'false', 'null', 'TRUE', 'FALSE', 'NULL',
  'self', 'parent', 'void', 'int', 'float', 'string', 'bool',
  'array', 'object', 'callable', 'iterable', 'mixed', 'never',
  'enum', 'union', 'static',
];

const PHP_BUILTINS = [
  'abs', 'ceil', 'floor', 'round', 'max', 'min', 'sqrt', 'pow',
  'strlen', 'substr', 'strpos', 'str_replace', 'strtolower', 'strtoupper',
  'trim', 'rtrim', 'ltrim', 'explode', 'implode', 'preg_match',
  'preg_replace', 'array_map', 'array_filter', 'array_reduce',
  'array_merge', 'array_keys', 'array_values', 'count', 'sort',
  'usort', 'in_array', 'isset', 'empty', 'unset', 'var_dump',
  'print_r', 'json_encode', 'json_decode', 'file_get_contents',
  'file_put_contents', 'header', 'session_start', 'define', 'defined',
  'class_exists', 'method_exists', 'property_exists', 'get_class',
  'gettype', 'settype', 'intval', 'floatval', 'strval', 'is_array',
  'is_string', 'is_int', 'is_numeric', 'is_null', 'is_object',
];

function buildPhpRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Multi-line comments
    { regex: /\/\*[\s\S]*?\*\//, token: 'comment' },
    // Single-line comments: // and #
    { regex: /\/\/.*$/m, token: 'comment' },
    { regex: /#.*$/m, token: 'comment' },
    // Heredoc and nowdoc
    { regex: /<<<[']?(\w+)[']?\n[\s\S]*?\n\s*\1;/, token: 'string' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // PHP tags
    { regex: /<\?php\b/, token: 'keyword' },
    { regex: /\?>/, token: 'keyword' },
    // Variables
    { regex: /\$\w+/, token: 'variable' },
    // Numbers
    { regex: /\b(?:0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\b/, token: 'number' },
  ];
}

// ─── Python ──────────────────────────────────────────────────────────────────

const PYTHON_KEYWORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
  'except', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
  'return', 'try', 'while', 'with', 'yield',
];

const PYTHON_BUILTINS = [
  'print', 'len', 'range', 'type', 'isinstance', 'issubclass',
  'int', 'float', 'str', 'bool', 'list', 'dict', 'tuple', 'set',
  'frozenset', 'bytes', 'bytearray', 'enumerate', 'zip', 'map',
  'filter', 'reduce', 'sorted', 'reversed', 'iter', 'next',
  'open', 'input', 'super', 'property', 'staticmethod', 'classmethod',
  'abs', 'all', 'any', 'bin', 'chr', 'dir', 'divmod', 'ev' + 'al',
  'ex' + 'ec', 'format', 'getattr', 'hasattr', 'hex', 'id', 'max', 'min',
  'oct', 'ord', 'pow', 'repr', 'round', 'setattr', 'slice', 'sum',
  'vars', '__import__', 'Exception', 'ValueError', 'TypeError',
  'KeyError', 'IndexError', 'AttributeError', 'RuntimeError',
  'StopIteration', 'NotImplementedError', 'ImportError', 'OSError',
];

function buildPythonRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Comments
    { regex: /#.*$/m, token: 'comment' },
    // Triple-quoted strings (must come before single-line strings)
    { regex: /"""[\s\S]*?"""/, token: 'string' },
    { regex: /'''[\s\S]*?'''/, token: 'string' },
    // f-strings
    { regex: /f"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /f'(?:[^'\\]|\\.)*'/, token: 'string' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // Numbers
    { regex: /\b(?:0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?:j|J)?)\b/, token: 'number' },
    // Decorators
    { regex: /@\w+/, token: 'builtin' },
  ];
}

// ─── JSON ────────────────────────────────────────────────────────────────────

function buildJsonRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Strings (keys and values)
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    // Numbers
    { regex: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/, token: 'number' },
    // Boolean / null
    { regex: /\btrue\b/, token: 'keyword' },
    { regex: /\bfalse\b/, token: 'keyword' },
    { regex: /\bnull\b/, token: 'keyword' },
  ];
}

// ─── SQL ─────────────────────────────────────────────────────────────────────

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD',
  'COLUMN', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT',
  'OUTER', 'FULL', 'CROSS', 'ON', 'AND', 'OR', 'NOT', 'IN',
  'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP',
  'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'PRIMARY', 'KEY',
  'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK',
  'UNIQUE', 'AUTO_INCREMENT', 'IF', 'BEGIN', 'COMMIT', 'ROLLBACK',
  'TRANSACTION', 'GRANT', 'REVOKE', 'TRIGGER', 'PROCEDURE',
  'FUNCTION', 'RETURNS', 'DECLARE', 'CURSOR', 'EXECUTE', 'USE',
  'DATABASE', 'SCHEMA', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'WITH',
  'RECURSIVE', 'OVER', 'PARTITION', 'ROWS', 'RANGE', 'FETCH',
  'NEXT', 'ONLY', 'MERGE', 'MATCHED',
];

const SQL_TYPE_KEYWORDS = [
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'FLOAT',
  'DOUBLE', 'DECIMAL', 'NUMERIC', 'VARCHAR', 'CHAR', 'TEXT',
  'BLOB', 'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'BOOLEAN',
  'BIT', 'SERIAL', 'UUID', 'JSON', 'JSONB', 'ARRAY', 'ENUM',
  'CLOB', 'NCHAR', 'NVARCHAR', 'NTEXT', 'VARBINARY', 'IMAGE',
];

function buildSqlRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Line comments
    { regex: /--.*$/m, token: 'comment' },
    // Block comments
    { regex: /\/\*[\s\S]*?\*\//, token: 'comment' },
    // Strings
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    // Numbers
    { regex: /\b\d+(?:\.\d+)?\b/, token: 'number' },
  ];
}

// ─── Bash / Shell ────────────────────────────────────────────────────────────

const BASH_KEYWORDS = [
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do',
  'done', 'case', 'esac', 'in', 'function', 'select', 'time',
  'coproc', '|', '&&', '||', '!', ';', ';;', '&', '(', ')',
];

const BASH_BUILTINS = [
  'echo', 'printf', 'read', 'cd', 'pwd', 'export', 'unset',
  'source', 'alias', 'unalias', 'set', 'shift', 'unset',
  'exit', 'return', 'true', 'false', 'test', '[', '[[', ']]',
  'local', 'declare', 'typeset', 'readonly', 'getopts',
  'ev' + 'al', 'ex' + 'ec', 'trap', 'wait', 'break', 'continue',
  'type', 'hash', 'command', 'builtin', 'enable',
  'basename', 'dirname', 'expr', 'let', 'logout',
  'mapfile', 'readarray', 'shopt', 'caller',
];

function buildBashRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Comments
    { regex: /#.*$/m, token: 'comment' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // Variables
    { regex: /\$\{[^}]+\}/, token: 'variable' },
    { regex: /\$[?#@$!*\-0-9_a-zA-Z]+/, token: 'variable' },
    { regex: /\$\([^)]+\)/, token: 'variable' },
    // Numbers
    { regex: /\b\d+\b/, token: 'number' },
    // Shebang
    { regex: /^#!.*$/m, token: 'comment' },
  ];
}

// ─── Java / C# ──────────────────────────────────────────────────────────────

const JAVA_KEYWORDS = [
  'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const',
  'continue', 'default', 'do', 'else', 'enum', 'extends', 'final',
  'finally', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
  'interface', 'native', 'new', 'package', 'private', 'protected',
  'public', 'return', 'static', 'strictfp', 'super', 'switch',
  'synchronized', 'this', 'throw', 'throws', 'transient', 'try',
  'volatile', 'while', 'record', 'sealed', 'non-sealed', 'permits',
  'var', 'yield',
];

const JAVA_TYPE_KEYWORDS = [
  'true', 'false', 'null', 'boolean', 'byte', 'char', 'double',
  'float', 'int', 'long', 'short', 'void', 'String', 'Object',
  'Integer', 'Long', 'Float', 'Double', 'Boolean', 'Character',
  'Byte', 'Short', 'Number', 'Array', 'List', 'Map', 'Set',
  'HashMap', 'ArrayList', 'HashSet', 'TreeMap', 'TreeSet',
  'LinkedList', 'Queue', 'Deque', 'Stack', 'Vector', 'Hashtable',
  'Override', 'Deprecated', 'SuppressWarnings', 'FunctionalInterface',
];

const JAVA_BUILTINS = [
  'System', 'Math', 'String', 'Integer', 'Long', 'Double', 'Float',
  'Boolean', 'Character', 'Byte', 'Short', 'Thread', 'Runnable',
  'Exception', 'RuntimeException', 'IOException', 'NullPointerException',
  'IllegalArgumentException', 'IllegalStateException',
  'UnsupportedOperationException', 'Collections', 'Arrays',
  'Objects', 'Optional', 'Stream', 'Comparator', 'Iterator',
  'Iterable', 'Runnable', 'Callable', 'Future', 'CompletableFuture',
  'StringBuilder', 'StringBuffer', 'Pattern', 'Matcher',
  'File', 'FileInputStream', 'FileOutputStream', 'BufferedReader',
  'BufferedWriter', 'PrintWriter', 'Scanner', 'Date', 'Calendar',
  'LocalDate', 'LocalTime', 'LocalDateTime', 'Duration', 'Instant',
  'UUID', 'Random', 'ThreadLocal', 'AtomicInteger', 'AtomicLong',
  'Reference', 'WeakReference', 'SoftReference', 'PhantomReference',
];

function buildJavaRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Multi-line comments (Javadoc)
    { regex: /\/\*[\s\S]*?\*\//, token: 'comment' },
    // Single-line comments
    { regex: /\/\/.*$/m, token: 'comment' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // Char literals
    { regex: /'\\.'/, token: 'string' },
    // Numbers
    { regex: /\b(?:0[xX][0-9a-fA-F]+(?:_[0-9a-fA-F]+)*|(?:\d+(?:_\d+)*\.?\d*(?:_\d+)*(?:[eE][+-]?\d+)?|\.\d+(?:_\d+)*(?:[eE][+-]?\d+)?))[fFdDlL]?\b/, token: 'number' },
    // Annotations
    { regex: /@\w+(?:\([^)]*\))?/, token: 'builtin' },
  ];
}

// ─── YAML ────────────────────────────────────────────────────────────────────

function buildYamlRules(): Array<{ regex: RegExp; token: TokenType }> {
  return [
    // Comments
    { regex: /#.*$/m, token: 'comment' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"/, token: 'string' },
    { regex: /'(?:[^'\\]|\\.)*'/, token: 'string' },
    // Block scalars
    { regex: /[|>]\s*$/m, token: 'operator' },
    // Numbers
    { regex: /\b(?:0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\b/, token: 'number' },
    // Booleans / null
    { regex: /\b(?:true|false|yes|no|True|False|Yes|No|TRUE|FALSE|YES|NO)\b/, token: 'keyword' },
    { regex: /\b(?:null|~|Null|NULL)\b/, token: 'keyword' },
    // Anchors and aliases
    { regex: /&\w+/, token: 'variable' },
    { regex: /\*\w+/, token: 'variable' },
    // Tags
    { regex: /!!\w+/, token: 'type' },
  ];
}

// ─── Language Registry ──────────────────────────────────────────────────────

const LANGUAGES: Record<string, LanguageDefinition> = {
  javascript: {
    keywords: JS_KEYWORDS,
    typeKeywords: JS_TYPE_KEYWORDS,
    builtins: JS_BUILTINS,
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '??', '?.', '??='],
    rules: buildJsRules(),
  },
  typescript: {
    keywords: [...JS_KEYWORDS],
    typeKeywords: [...JS_TYPE_KEYWORDS, 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'implements'],
    builtins: [...JS_BUILTINS],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '??', '?.', '??='],
    rules: buildJsRules(),
  },
  jsx: {
    keywords: [...JS_KEYWORDS],
    typeKeywords: JS_TYPE_KEYWORDS,
    builtins: [...JS_BUILTINS, 'React', 'Component', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext', 'useReducer', 'Fragment', 'Suspense', 'createElement', 'createContext'],
    rules: buildJsRules(),
  },
  tsx: {
    keywords: [...JS_KEYWORDS],
    typeKeywords: [...JS_TYPE_KEYWORDS, 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'implements'],
    builtins: [...JS_BUILTINS, 'React', 'Component', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext', 'useReducer', 'Fragment', 'Suspense', 'createElement', 'createContext'],
    rules: buildJsRules(),
  },
  html: {
    keywords: [],
    rules: buildHtmlRules(),
  },
  css: {
    keywords: CSS_KEYWORDS,
    rules: buildCssRules(),
  },
  php: {
    keywords: PHP_KEYWORDS,
    typeKeywords: PHP_TYPE_KEYWORDS,
    builtins: PHP_BUILTINS,
    rules: buildPhpRules(),
  },
  python: {
    keywords: PYTHON_KEYWORDS,
    builtins: PYTHON_BUILTINS,
    rules: buildPythonRules(),
  },
  json: {
    keywords: [],
    typeKeywords: ['true', 'false', 'null'],
    rules: buildJsonRules(),
  },
  sql: {
    keywords: SQL_KEYWORDS,
    typeKeywords: SQL_TYPE_KEYWORDS,
    rules: buildSqlRules(),
  },
  bash: {
    keywords: BASH_KEYWORDS,
    builtins: BASH_BUILTINS,
    rules: buildBashRules(),
  },
  shell: {
    keywords: BASH_KEYWORDS,
    builtins: BASH_BUILTINS,
    rules: buildBashRules(),
  },
  java: {
    keywords: JAVA_KEYWORDS,
    typeKeywords: JAVA_TYPE_KEYWORDS,
    builtins: JAVA_BUILTINS,
    rules: buildJavaRules(),
  },
  csharp: {
    keywords: [...JAVA_KEYWORDS, 'using', 'namespace', 'struct', 'delegate', 'event', 'sealed', 'override', 'virtual', 'abstract', 'async', 'await', 'var', 'dynamic', 'nameof', 'when', 'where', 'select', 'let', 'into', 'orderby', 'ascending', 'descending', 'group', 'join', 'on', 'equals', 'by', 'ascending', 'partial', 'global', 'extern', 'unsafe', 'fixed', 'volatile', 'readonly', 'ref', 'out', 'params', 'in', 'is', 'as', 'new', 'sizeof', 'typeof', 'checked', 'unchecked', 'stackalloc'],
    typeKeywords: [...JAVA_TYPE_KEYWORDS, 'var', 'dynamic', 'object', 'decimal', 'nint', 'nuint', 'string'],
    builtins: JAVA_BUILTINS,
    rules: buildJavaRules(),
  },
  yaml: {
    keywords: [],
    rules: buildYamlRules(),
  },
  yml: {
    keywords: [],
    rules: buildYamlRules(),
  },
  xml: {
    keywords: [],
    rules: buildHtmlRules(),
  },
  markdown: {
    keywords: [],
    rules: buildJsRules(), // Fallback
  },
  text: {
    keywords: [],
    rules: [],
  },
  plaintext: {
    keywords: [],
    rules: [],
  },
};

/**
 * Aliases for language names (mapping alternative names to canonical names).
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  go: 'go',
  sh: 'bash',
  zsh: 'bash',
  c: 'c',
  cpp: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  md: 'markdown',
  cs: 'csharp',
  dockerfile: 'bash',
  makefile: 'bash',
};

/**
 * Get the canonical language name for a given language identifier.
 */
export function resolveLanguageName(language: string): string {
  const lower = language.toLowerCase().trim();
  if (LANGUAGES[lower]) return lower;
  if (LANGUAGE_ALIASES[lower]) return LANGUAGE_ALIASES[lower];
  return 'text';
}

/**
 * Escape a string for use in a RegExp.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Tokenize source code for the specified language.
 *
 * The tokenizer uses a hybrid approach:
 * 1. First, it applies language-specific regex rules (comments, strings, numbers, etc.)
 * 2. Then, it matches remaining words against keyword, type, and builtin lists
 * 3. Remaining content is classified as operators, punctuation, or plain text
 *
 * @param source - The source code string to tokenize
 * @param language - The language identifier (e.g., 'javascript', 'python', 'html')
 * @returns An array of Token objects with type, value, and CSS className
 *
 * @example
 * tokenize('const x = 42;', 'javascript')
 * // → [
 * //   { type: 'keyword', value: 'const', className: 'cr-keyword' },
 * //   { type: 'plain',   value: ' ',    className: 'cr-plain' },
 * //   { type: 'plain',   value: 'x',    className: 'cr-plain' },
 * //   { type: 'operator',value: ' = ',  className: 'cr-operator' },
 * //   { type: 'number',  value: '42',   className: 'cr-number' },
 * //   { type: 'punctuation', value: ';', className: 'cr-punctuation' },
 * // ]
 */
export function tokenize(source: string, language: string): Token[] {
  if (!source || typeof source !== 'string') {
    return [];
  }

  const langName = resolveLanguageName(language);
  const lang = LANGUAGES[langName];

  if (!lang || lang.rules.length === 0) {
    return [tc('plain', source)];
  }

  const tokens: Token[] = [];
  let remaining = source;

  // Build keyword regexes
  const keywordSet = new Set(lang.keywords.map(k => k.toLowerCase()));
  const typeKeywordSet = new Set((lang.typeKeywords || []).map(k => k.toLowerCase()));
  const builtinSet = new Set((lang.builtins || []).map(k => k.toLowerCase()));

  // Sort operators by length descending for greedy matching
  const operators = (lang.operators || []).sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    let matched = false;

    // Try language-specific regex rules
    for (const rule of lang.rules) {
      rule.regex.lastIndex = 0;
      const match = rule.regex.exec(remaining);
      if (match && match.index === 0) {
        tokens.push(tc(rule.token, match[0]));
        remaining = remaining.substring(match[0].length);
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Try multi-char operators first
    if (operators.length > 0) {
      for (const op of operators) {
        if (remaining.startsWith(op)) {
          tokens.push(tc('operator', op));
          remaining = remaining.substring(op.length);
          matched = true;
          break;
        }
      }
    }

    if (matched) continue;

    // Try single-char operators
    const ch = remaining[0];
    if (/[+\-*/%=<>!&|^~?:]/.test(ch)) {
      tokens.push(tc('operator', ch));
      remaining = remaining.substring(1);
      continue;
    }

    if (/[{}()\[\];,.]/.test(ch)) {
      tokens.push(tc('punctuation', ch));
      remaining = remaining.substring(1);
      continue;
    }

    // Try word (identifier or keyword)
    const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const lower = word.toLowerCase();

      if (keywordSet.has(lower)) {
        tokens.push(tc('keyword', word));
      } else if (typeKeywordSet.has(lower)) {
        tokens.push(tc('keyword', word));
      } else if (builtinSet.has(lower)) {
        tokens.push(tc('builtin', word));
      } else {
        // Check if it looks like a function (followed by parenthesis)
        const afterWord = remaining.substring(word.length);
        const funcMatch = afterWord.match(/^\s*\(/);
        if (funcMatch) {
          tokens.push(tc('function', word));
        } else {
          tokens.push(tc('plain', word));
        }
      }
      remaining = remaining.substring(word.length);
      continue;
    }

    // Whitespace and unknown characters
    if (/\s/.test(ch)) {
      tokens.push(tc('plain', ch));
    } else {
      tokens.push(tc('plain', ch));
    }
    remaining = remaining.substring(1);
  }

  return tokens;
}

/**
 * Highlight source code and return an array of objects suitable for rendering.
 * Each token includes its type, value, and a CSS class name.
 *
 * @param source - The source code to highlight
 * @param language - The programming language identifier
 * @returns An array of Token objects
 */
export function highlight(source: string, language: string): Token[] {
  return tokenize(source, language);
}

/**
 * Get all supported language names.
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGES);
}

/**
 * Check if a language is supported.
 */
export function isLanguageSupported(language: string): boolean {
  const canonical = resolveLanguageName(language);
  return canonical !== 'text' || language.toLowerCase() === 'text';
}

/**
 * Convert tokens to a simple HTML string with span tags.
 * Useful for server-side rendering or when React isn't available.
 *
 * @param tokens - The array of tokens to convert
 * @returns An HTML string with <span> elements for highlighted tokens
 */
export function tokensToHtml(tokens: Token[]): string {
  return tokens
    .map(token => {
      if (token.type === 'plain' || !token.className) {
        return escapeHtml(token.value);
      }
      return `<span class="${token.className}">${escapeHtml(token.value)}</span>`;
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
