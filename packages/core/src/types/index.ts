// ==========================================
// Content Renderer - Core Types
// ==========================================

import * as React from 'react';

// Base content types
export type ContentType = 'html' | 'html5' | 'json' | 'xml' | 'php' | 'markdown' | 'text' | 'code' | 'css' | 'javascript' | 'typescript' | 'yaml';

export interface ParsedContent<T = any> {
  type: ContentType;
  content: string;
  parsed: T;
  metadata: ContentMetadata;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ContentMetadata {
  title?: string;
  description?: string;
  language?: string;
  encoding?: string;
  charset?: string;
  version?: string;
  doctype?: string;
  author?: string;
  createdAt?: string;
  modifiedAt?: string;
  size?: number;
  lineCount?: number;
  [key: string]: any;
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'fatal';
  code?: string;
  context?: string;
}

export interface ParseWarning {
  message: string;
  line?: number;
  column?: number;
  severity: 'warning' | 'info';
  code?: string;
  context?: string;
}

// HTML/HTML5 Types
export interface HTMLNode {
  type: 'element' | 'text' | 'comment' | 'doctype' | 'cdata';
  tag?: string;
  attributes?: Record<string, string>;
  children?: HTMLNode[];
  content?: string;
  parent?: HTMLNode | null;
  namespace?: string;
  selfClosing?: boolean;
}

export interface HTMLDocument {
  doctype?: string;
  html?: HTMLNode;
  head?: HTMLNode;
  body?: HTMLNode;
  nodes: HTMLNode[];
  metadata: ContentMetadata;
}

export interface HTMLElement extends HTMLNode {
  type: 'element';
  tag: string;
  attributes: Record<string, string>;
  children: HTMLNode[];
}

export interface HTMLTextNode extends HTMLNode {
  type: 'text';
  content: string;
}

export interface HTMLCommentNode extends HTMLNode {
  type: 'comment';
  content: string;
}

// JSON Types
export interface JSONDocument {
  root: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  metadata: ContentMetadata;
  schema?: JSONSchema;
}

export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  description?: string;
  [key: string]: any;
}

// XML Types
export interface XMLDocument {
  declaration?: XMLDeclaration;
  root: XMLNode;
  nodes: XMLNode[];
  metadata: ContentMetadata;
}

export interface XMLDeclaration {
  version: string;
  encoding?: string;
  standalone?: boolean;
  attributes?: Record<string, string>;
}

export interface XMLNode {
  type: 'element' | 'text' | 'comment' | 'cdata' | 'processing-instruction';
  name?: string;
  attributes?: Record<string, string>;
  children?: XMLNode[];
  content?: string;
  parent?: XMLNode | null;
  namespace?: string;
  prefix?: string;
}

// PHP Types
export interface PHPDocument {
  nodes: PHPNode[];
  metadata: ContentMetadata;
  namespace?: string;
  uses: string[];
  classes: PHPClass[];
  functions: PHPFunction[];
  variables: string[];
}

export interface PHPNode {
  type: 'class' | 'function' | 'variable' | 'echo' | 'include' | 'require' | 'comment' | 'text' | 'expression' | 'control-structure' | 'namespace' | 'use';
  name?: string;
  value?: string;
  children?: PHPNode[];
  content?: string;
  attributes?: Record<string, any>;
  line?: number;
}

export interface PHPClass {
  name: string;
  namespace?: string;
  parent?: string;
  interfaces?: string[];
  methods: PHPFunction[];
  properties: PHPProperty[];
  constants: Record<string, any>;
  isAbstract: boolean;
  isFinal: boolean;
  docComment?: string;
}

export interface PHPFunction {
  name: string;
  parameters: PHPParameter[];
  returnType?: string;
  visibility?: 'public' | 'private' | 'protected' | 'static';
  isStatic: boolean;
  isAbstract: boolean;
  isFinal: boolean;
  body?: string;
  docComment?: string;
}

export interface PHPParameter {
  name: string;
  type?: string;
  defaultValue?: any;
  isNullable: boolean;
  isPassedByReference: boolean;
  hasTypeDeclaration: boolean;
}

export interface PHPProperty {
  name: string;
  type?: string;
  defaultValue?: any;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  docComment?: string;
}

// Markdown Types
export interface MarkdownDocument {
  nodes: MarkdownNode[];
  metadata: ContentMetadata;
  frontmatter?: Record<string, any>;
  headings: MarkdownHeading[];
  links: MarkdownLink[];
  images: MarkdownImage[];
  codeBlocks: MarkdownCodeBlock[];
  tables: MarkdownTable[];
  footnotes?: MarkdownFootnote[];
  abbreviations?: Record<string, string>;
}

export interface MarkdownNode {
  type: 'heading' | 'paragraph' | 'list' | 'list-item' | 'code-block' | 'code-inline' | 'link' | 'image' | 'bold' | 'italic' | 'strikethrough' | 'blockquote' | 'horizontal-rule' | 'table' | 'table-row' | 'table-cell' | 'html' | 'thematic-break' | 'footnote-reference' | 'footnote-section' | 'definition-list' | 'definition-item' | 'abbreviation' | 'math-block' | 'math-inline' | 'subscript' | 'superscript' | 'highlight' | 'autolink';
  content?: string;
  children?: MarkdownNode[];
  level?: number;
  ordered?: boolean;
  language?: string;
  href?: string;
  alt?: string;
  title?: string;
  align?: 'left' | 'center' | 'right';
  header?: boolean;
  /** Footnote reference ID (e.g. '1' for [^1]) */
  footnoteId?: string;
  /** Definition list term */
  term?: string;
  /** Abbreviation title/expanded text */
  abbrTitle?: string;
}

export interface MarkdownHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  slug: string;
  children: MarkdownNode[];
}

export interface MarkdownLink {
  text: string;
  href: string;
  title?: string;
}

export interface MarkdownImage {
  alt: string;
  src: string;
  title?: string;
}

export interface MarkdownCodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface MarkdownTable {
  headers: string[];
  rows: string[][];
  align?: ('left' | 'center' | 'right')[];
}



export interface MarkdownFootnote {
  id: string;
  content: string;
  children: MarkdownNode[];
}

export interface MarkdownDefinitionList {
  items: MarkdownDefinitionItem[];
}

export interface MarkdownDefinitionItem {
  term: string;
  definitions: string[];
}

// CSS Types
export interface CSSDocument {
  nodes: CSSNode[];
  metadata: ContentMetadata;
  rules: CSSRule[];
  variables: Record<string, string>;
  mediaQueries: CSSMediaQuery[];
  keyframes: CSSKeyframes[];
}

export interface CSSNode {
  type: 'rule' | 'at-rule' | 'declaration' | 'comment' | 'selector' | 'value';
  selectors?: string[];
  declarations?: CSSDeclaration[];
  property?: string;
  value?: string;
  important?: boolean;
  media?: string;
  children?: CSSNode[];
}

export interface CSSRule {
  selectors: string[];
  declarations: CSSDeclaration[];
  specificity?: number;
}

export interface CSSDeclaration {
  property: string;
  value: string;
  important: boolean;
}

export interface CSSMediaQuery {
  condition: string;
  rules: CSSRule[];
}

export interface CSSKeyframes {
  name: string;
  frames: { offset: number; declarations: CSSDeclaration[] }[];
}

// Extract utilities types
export interface ExtractOptions {
  includeMetadata?: boolean;
  includeAttributes?: boolean;
  includeChildren?: boolean;
  maxDepth?: number;
  filter?: (node: any) => boolean;
  transform?: (node: any) => any;
}

export interface ExtractedData {
  text: string;
  links: ExtractedLink[];
  images: ExtractedImage[];
  scripts: ExtractedScript[];
  styles: ExtractedStyle[];
  meta: ExtractedMeta[];
  headings: ExtractedHeading[];
  tables: ExtractedTable[];
  forms: ExtractedForm[];
  lists: ExtractedList[];
  codeBlocks: ExtractedCodeBlock[];
  comments: string[];
  custom: Record<string, any>;
}

export interface ExtractedLink {
  href: string;
  text: string;
  title?: string;
  target?: string;
  rel?: string;
  isExternal: boolean;
  isAnchor: boolean;
}

export interface ExtractedImage {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  srcset?: string;
  loading?: string;
}

export interface ExtractedScript {
  content: string;
  type?: string;
  src?: string;
  async: boolean;
  defer: boolean;
  isModule: boolean;
}

export interface ExtractedStyle {
  content: string;
  media?: string;
  type?: string;
}

export interface ExtractedMeta {
  name?: string;
  content: string;
  property?: string;
  charset?: string;
  httpEquiv?: string;
}

export interface ExtractedHeading {
  level: number;
  text: string;
  id?: string;
}

export interface ExtractedTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ExtractedForm {
  action?: string;
  method?: string;
  inputs: ExtractedInput[];
  id?: string;
  name?: string;
}

export interface ExtractedInput {
  type: string;
  name?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  required: boolean;
  label?: string;
}

export interface ExtractedList {
  ordered: boolean;
  items: string[];
  depth: number;
}

export interface ExtractedCodeBlock {
  language: string;
  code: string;
  className?: string;
}

// Theme types
export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  codeBlock: CodeBlockTheme;
  typography: TypographyTheme;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  link: string;
  codeBackground: string;
  codeText: string;
}

export interface ThemeFonts {
  body: string;
  heading: string;
  mono: string;
  serif: string;
  sansSerif: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface CodeBlockTheme {
  background: string;
  text: string;
  lineNumber: string;
  selection: string;
  headerBackground: string;
  headerText: string;
  border: string;
}

export interface TypographyTheme {
  h1: TypographyScale;
  h2: TypographyScale;
  h3: TypographyScale;
  h4: TypographyScale;
  h5: TypographyScale;
  h6: TypographyScale;
  body: TypographyScale;
  code: TypographyScale;
  small: TypographyScale;
}

export interface TypographyScale {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

// Provider types
export interface ContentRendererConfig {
  theme?: Theme;
  defaultContentType?: ContentType;
  maxRenderDepth?: number;
  sanitizeHTML?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  linkHandler?: (href: string) => void;
  imageHandler?: (src: string) => string;
  errorHandler?: (error: Error, content: string) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  customParsers?: Record<string, ParserFunction>;
  plugins?: ContentRendererPlugin[];
}

export type ParserFunction = (content: string, options?: any) => ParsedContent;

export interface ContentRendererPlugin {
  name: string;
  version: string;
  contentType?: ContentType;
  parse?: ParserFunction;
  render?: (parsed: ParsedContent, options?: any) => any;
  beforeParse?: (content: string) => string;
  afterParse?: (parsed: ParsedContent) => ParsedContent;
}

// Hook types
export interface UseContentParserOptions {
  contentType?: ContentType;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (parsed: ParsedContent) => void;
  transform?: (parsed: ParsedContent) => any;
}

export interface UseContentParserReturn {
  parsed: ParsedContent | null;
  data: any;
  metadata: ContentMetadata | null;
  errors: ParseError[];
  warnings: ParseWarning[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  parse: (content: string) => void;
  reset: () => void;
  refetch: () => void;
}

export interface UseExtractOptions {
  enabled?: boolean;
  extractors?: (keyof ExtractedData)[];
  options?: ExtractOptions;
  onError?: (error: Error) => void;
}

export interface UseExtractReturn {
  extracted: ExtractedData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  extract: (content: string) => void;
  reset: () => void;
}

// React types (shared)
export interface BaseRendererProps {
  content: string;
  contentType?: ContentType;
  className?: string;
  style?: React.CSSProperties;
  theme?: Partial<Theme>;
  sanitize?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxDepth?: number;
  onError?: (error: Error) => void;
  onRender?: () => void;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  renderers?: Record<string, React.ComponentType<any>>;
  components?: Record<string, React.ComponentType<any>>;
  transform?: (node: any) => any;
  linkHandler?: (href: string, e?: any) => void;
  imageHandler?: (src: string, alt?: string) => string | Promise<string>;
  codeBlockHandler?: (code: string, language: string) => React.ReactNode;
  tableHandler?: (table: ExtractedTable) => React.ReactNode;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export interface HTMLRendererProps extends BaseRendererProps {
  contentType?: 'html' | 'html5';
  renderAs?: 'div' | 'span' | 'article' | 'section' | 'fragment';
  allowedSchemes?: string[];
  allowDangerousHtml?: boolean;
  stripComments?: boolean;
  preserveWhitespace?: boolean;
}

// @ts-ignore
export interface CodeRendererProps extends BaseRendererProps {
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  theme?: 'light' | 'dark' | 'monokai' | 'dracula' | 'github' | 'vscode';
  wrapLines?: boolean;
  startingLineNumber?: number;
  fontSize?: number;
  tabSize?: number;
}

export interface JSONRendererProps extends BaseRendererProps {
  /** JSON data to render (object, array, or string) */
  json?: any;
  indent?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  maxCollapsedDepth?: number;
  showDataTypes?: boolean;
  highlightMatches?: string[];
  copyToClipboard?: boolean;
  sortKeys?: boolean;
  filterKeys?: string[];
  readonly?: boolean;
  onEdit?: (path: string, newValue: any, oldValue: any) => void;
}

// @ts-ignore
export interface PHPRendererProps extends BaseRendererProps {
  highlightPHP?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  wrapLines?: boolean;
  theme?: 'light' | 'dark' | 'monokai';
}

export interface MarkdownRendererProps extends BaseRendererProps {
  /** Raw Markdown string (alias for content) */
  markdown?: string;
  allowedTypes?: string[];
  disallowedTypes?: string[];
  unwrapDisallowed?: boolean;
  renderers?: Record<string, React.ComponentType<any>>;
  plugins?: any[];
  sourcePos?: boolean;
  rawSourcePos?: boolean;
  escapeHtml?: boolean;
  skipHtml?: boolean;
  linkTarget?: string;
  transformLinkUri?: (uri: string) => string;
  transformImageUri?: (uri: string) => string;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ParseError[];
  warnings: ParseWarning[];
}

// HTML Parser options
export interface HTMLParseOptions {
  lowercaseTags?: boolean;
  lowercaseAttributeNames?: boolean;
  recognizeSelfClosing?: boolean;
  decodeEntities?: boolean;
  withStartIndices?: boolean;
  withEndIndices?: boolean;
}

// SEO metadata type
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical: string | null;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: string;
  author: string;
  favicon: string | null;
  language: string;
  charset: string;
  viewport: string;
}

// HOC injected props
export interface ContentParserInjectedProps {
  parsedContent: ParsedContent | null;
  parseContent: (content: string, type?: ContentType) => void;
  isParsing: boolean;
  parseError: Error | null;
}

export interface ExtractInjectedProps {
  extractedData: ExtractedData | null;
  extractData: (content: string, type?: ContentType) => void;
  isExtracting: boolean;
  extractError: Error | null;
}

// JSON diff types
export interface JSONDiffResult {
  added: JSONPathValue[];
  removed: JSONPathValue[];
  changed: JSONChange[];
  unchanged: string[];
}

export interface JSONPathValue {
  path: string;
  value: any;
}

export interface JSONChange {
  path: string;
  oldValue: any;
  newValue: any;
}

// CSS specificity calculator types
export interface SpecificityResult {
  a: number; // inline styles
  b: number; // IDs
  c: number; // classes, attributes, pseudo-classes
  d: number; // elements, pseudo-elements
  value: string;
  numeric: number;
}

// ==========================================
// Content Service Types
// ==========================================

/** Configuration for fetching content from an API endpoint */
export interface ContentServiceConfig {
  /** URL to fetch content from */
  url?: string;
  /** Custom fetch function (overrides url) */
  fetcher?: (url: string, options?: RequestInit) => Promise<Response>;
  /** HTTP headers for the request */
  headers?: Record<string, string>;
  /** Request credentials mode */
  credentials?: 'omit' | 'same-origin' | 'include';
  /** Request mode */
  mode?: 'cors' | 'navigate' | 'no-cors' | 'same-origin';
  /** Request cache mode */
  cache?: 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload';
  /** Custom request init options */
  requestInit?: Omit<RequestInit, 'headers' | 'credentials' | 'mode' | 'cache'>;
  /** Content type override - if not provided, auto-detected from response */
  contentType?: ContentType;
  /** Strategy for extracting content from API response */
  extractStrategy?: ContentExtractStrategy;
  /** Field name(s) to look for in JSON responses */
  contentField?: string | string[];
  /** Maximum content length to render (bytes) */
  maxContentLength?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to refetch on window focus */
  refetchOnWindowFocus?: boolean;
  /** Whether to refetch on reconnect */
  refetchOnReconnect?: boolean;
  /** Polling interval in milliseconds (0 = no polling) */
  refetchInterval?: number;
  /** Whether to retry failed requests */
  retry?: boolean;
  /** Number of retry attempts */
  retryCount?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
  /** Whether to deduplicate concurrent requests */
  dedupe?: boolean;
  /** Cache time in milliseconds (0 = no cache) */
  cacheTime?: number;
  /** Custom response transformer */
  transformResponse?: (response: any) => any;
  /** Custom error handler */
  onError?: (error: ContentServiceError) => void;
  /** Called before request */
  onRequest?: (url: string) => void;
  /** Called after successful fetch */
  onSuccess?: (data: ContentServiceResult) => void;
}

/** Strategy for extracting renderable content from an API response */
export type ContentExtractStrategy =
  | 'auto'           // Auto-detect: if string -> use directly; if JSON -> find content field
  | 'direct'         // Response body is the content string directly
  | 'json-html'      // JSON response with an HTML content field
  | 'json-markdown'  // JSON response with a Markdown content field
  | 'json-field'     // JSON response, extract value at contentField path
  | 'json-property'  // JSON response, extract first string property value
  | 'aem'            // AEM-style response: extract 'html' or 'content' from nested structure
  | 'headless-cms'   // Headless CMS: extract from common fields (content, body, html, text)
  | 'custom';        // Use transformResponse

/** Content service error with metadata */
export interface ContentServiceError extends Error {
  /** HTTP status code (if applicable) */
  status?: number;
  /** Whether the error is a network error */
  isNetworkError: boolean;
  /** Whether the error is a timeout */
  isTimeout: boolean;
  /** Whether the request was aborted */
  isAborted: boolean;
  /** URL that caused the error */
  url?: string;
  /** Timestamp of the error */
  timestamp: number;
  /** Original error cause */
  cause?: Error;
}

/** Result of a content service fetch */
export interface ContentServiceResult {
  /** The raw response content string */
  content: string;
  /** The detected or specified content type */
  contentType: ContentType;
  /** The parsed content */
  parsed: ParsedContent | null;
  /** Response URL (may differ from request URL after redirects) */
  responseUrl?: string;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Content length in bytes */
  contentLength: number;
  /** Timestamp of the fetch */
  timestamp: number;
  /** Duration of the fetch in ms */
  duration: number;
  /** Whether the content was extracted from a JSON wrapper */
  wasExtracted: boolean;
}

/** State returned by useContentService hook */
export interface UseContentServiceReturn {
  /** The content service result (null when idle/loading) */
  result: ContentServiceResult | null;
  /** Renderable content string (null when idle/loading) */
  content: string | null;
  /** Detected content type */
  contentType: ContentType | null;
  /** Parsed content */
  parsed: ParsedContent | null;
  /** Whether a fetch is in progress */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** The error (if any) */
  error: ContentServiceError | null;
  /** Whether data has been fetched at least once */
  isFetched: boolean;
  /** Manually trigger a fetch */
  fetchContent: (overrideUrl?: string, overrideOptions?: Partial<ContentServiceConfig>) => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
  /** Retry the last failed fetch */
  retry: () => void;
  /** Abort the current fetch */
  abort: () => void;
}

/** Props for ContentServiceRenderer component */
export interface ContentServiceRendererProps extends Omit<BaseRendererProps, 'content'> {
  /** URL to fetch content from */
  url: string;
  /** Content service configuration */
  config?: Partial<ContentServiceConfig>;
  /** Loading component */
  loading?: React.ReactNode;
  /** Error renderer */
  errorRenderer?: (error: ContentServiceError, retry: () => void) => React.ReactNode;
  /** Fallback when no content */
  fallback?: React.ReactNode;
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;
  /** Delay before showing loading state (ms) */
  loadingDelay?: number;
  /** Skeleton component (shown during loadingDelay) */
  skeleton?: React.ReactNode;
  /** Callback when content is successfully loaded */
  onLoad?: (result: ContentServiceResult) => void;
  /** Callback when fetch fails */
  onLoadError?: (error: ContentServiceError) => void;
  /** Refetch trigger key - changes trigger refetch */
  fetchKey?: string | number;
  /** Debounce refetch interval (ms) */
  fetchDebounce?: number;
}
