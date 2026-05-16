// ═══════════════════════════════════════════════════════════════════════════════
// @content-renderer/react-and-native — Native Entry Point
// ═══════════════════════════════════════════════════════════════════════════════
// Native-only entry point used by tsconfig.native.json.
// Exports .native.tsx component variants and native-compatible utilities.

// ─── Components (Native Only) ───────────────────────────────────────────────

export {
  ContentRenderer,
  HTMLRenderer,
  CodeRenderer,
  JSONRenderer,
  PHPRenderer,
  MarkdownRenderer,
  XMLRenderer,
  CSSRenderer,
  ErrorBoundary,
  ContentServiceRenderer,
} from './components/index.native';

export { default } from './components/index.native';

// ─── Utilities (Web-compatible + Native-specific) ───────────────────────────

export {
  styleStringToObject,
  attrToReactProp,
  isBooleanAttribute,
  isVoidElement,
  svgAttrToReact,
  isSVGElement,
  parseAttributes,
  tokenize,
  highlight,
  getSupportedLanguages,
  isLanguageSupported,
  resolveLanguageName,
  tokensToHtml,
  HTML_TO_RN_MAP,
  styleStringToRNStyle,
  classToRNStyle,
  flattenInlineNodes,
  isInlineNode,
  tokenizeLine,
  highlightCode,
  detectLanguage,
  LIGHT_SYNTAX_THEME,
  DARK_SYNTAX_THEME,
  lightNativeTheme,
  darkNativeTheme,
  mergeNativeTheme,
} from './utils/index.native';

export type {
  Token,
  TokenType,
  HTMLTagMappingRN,
  HTMLNodeRN,
  SyntaxToken,
  SyntaxTheme,
  TokenizerState,
  NativeTheme,
  NativeThemeColors,
  NativeThemeTypography,
  NativeThemeSpacing,
  NativeThemeCodeBlock,
  NativeThemeJSONViewer,
  NativeThemeXMLViewer,
  NativeThemeMarkdown,
} from './utils/index.native';

// ─── Re-export All Types from Core ───────────────────────────────────────────

export type {
  ContentType,
  ParsedContent,
  ContentMetadata,
  ParseError,
  ParseWarning,
  HTMLNode as CoreHTMLNode,
  HTMLDocument,
  HTMLElement,
  HTMLTextNode,
  HTMLCommentNode,
  JSONDocument,
  JSONSchema,
  XMLDocument,
  XMLDeclaration,
  XMLNode,
  PHPDocument,
  PHPNode,
  PHPClass,
  PHPFunction,
  PHPParameter,
  PHPProperty,
  MarkdownDocument,
  MarkdownNode,
  MarkdownHeading,
  MarkdownLink,
  MarkdownImage,
  MarkdownCodeBlock,
  MarkdownTable,
  CSSDocument,
  CSSNode,
  CSSRule,
  CSSDeclaration,
  CSSMediaQuery,
  CSSKeyframes,
  ExtractOptions,
  ExtractedData,
  ExtractedLink,
  ExtractedImage,
  ExtractedScript,
  ExtractedStyle,
  ExtractedMeta,
  ExtractedHeading,
  ExtractedTable,
  ExtractedForm,
  ExtractedInput,
  ExtractedList,
  ExtractedCodeBlock,
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  CodeBlockTheme,
  TypographyTheme,
  TypographyScale,
  ContentRendererConfig,
  ParserFunction,
  ContentRendererPlugin,
  BaseRendererProps,
  HTMLRendererProps,
  CodeRendererProps,
  JSONRendererProps,
  PHPRendererProps,
  MarkdownRendererProps,
  UseContentParserOptions,
  UseContentParserReturn,
  UseExtractOptions,
  UseExtractReturn,
  ContentServiceConfig,
  ContentExtractStrategy,
  ContentServiceError,
  ContentServiceResult,
  UseContentServiceReturn,
  ContentServiceRendererProps,
} from '@content-renderer/core';

// ─── Re-export Parsers from Core ─────────────────────────────────────────────

export {
  HTMLParser,
  JSONParser,
  XMLParser,
  PHPParser,
  MarkdownParser,
  CSSParser,
} from '@content-renderer/core';

// ─── Re-export Validation Functions from Core ────────────────────────────────

export {
  isValidHTML,
  isValidJSON,
  isValidXML,
  isValidCSS,
  detectContentType,
} from '@content-renderer/core';

// ─── Re-export Extraction Utilities from Core ────────────────────────────────

export {
  extractAll,
  extractText,
  extractLinks,
  extractImages,
  extractScripts,
  extractStyles,
  extractMeta,
  extractHeadings,
  extractTables,
  extractForms,
  extractLists,
  extractCodeBlocks,
  extractComments,
  extractSEO,
  extractOpenGraph,
  extractTwitterCards,
  extractStructuredData,
  extractFavicon,
  extractCanonical,
} from '@content-renderer/core';

// ─── Re-export Sanitization Utilities from Core ──────────────────────────────

export {
  sanitizeHTML,
  stripTags,
  stripAttributes,
  stripScripts,
  stripStyles,
  escapeHTML,
  unescapeHTML,
} from '@content-renderer/core';

// ─── Re-export Formatting Utilities from Core ───────────────────────────────

export {
  minifyHTML,
  formatHTML,
  formatJSON,
  formatCSS,
  formatXML,
  prettify,
  convertToJSON,
  convertToXML,
} from '@content-renderer/core';

// ─── Re-export Hooks from Core ───────────────────────────────────────────────

export {
  useContentParser,
  useExtract,
  useTheme,
  useContentService,
} from '@content-renderer/core';

// ─── Re-export HOCs from Core ────────────────────────────────────────────────

export {
  withContentParser,
  withExtract,
} from '@content-renderer/core';

// ─── Re-export Providers from Core ───────────────────────────────────────────

export {
  ContentParserProvider,
  useContentRendererConfig,
} from '@content-renderer/core';

// ─── Re-export Themes from Core ──────────────────────────────────────────────

export { lightTheme, darkTheme } from '@content-renderer/core';
