// ═══════════════════════════════════════════════════════════════════════════════
// @laddhaanshul/content-renderer — Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════════
// Unified package supporting both React DOM (web) and React Native (mobile).
// Components auto-select the correct implementation via .web.tsx / .native.tsx
// platform extensions.

// ─── Components (Platform-Aware) ────────────────────────────────────────────

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
} from './components';

export { default } from './components';

// ─── Web Utilities (React DOM) ──────────────────────────────────────────────

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
} from './utils';

export type { Token, TokenType } from './utils';

// ─── Native Utilities (React Native) ────────────────────────────────────────

export {
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
} from './utils';

export type {
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
} from './utils';

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
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export Parsers from Core ─────────────────────────────────────────────

export {
  HTMLParser,
  JSONParser,
  XMLParser,
  PHPParser,
  MarkdownParser,
  CSSParser,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export Validation Functions from Core ────────────────────────────────

export {
  isValidHTML,
  isValidJSON,
  isValidXML,
  isValidCSS,
  detectContentType,
} from '@laddhaanshul/content-renderer-core';

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
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export Sanitization Utilities from Core ──────────────────────────────

export {
  sanitizeHTML,
  stripTags,
  stripAttributes,
  stripScripts,
  stripStyles,
  escapeHTML,
  unescapeHTML,
} from '@laddhaanshul/content-renderer-core';

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
} from '@laddhaanshul/content-renderer-core';

// ─── Content Service ─────────────────────────────────────────────────────────

// (ContentServiceRenderer is exported above with the platform-aware components)

// ─── Re-export Hooks from Core ───────────────────────────────────────────────

export {
  useContentParser,
  useExtract,
  useTheme,
  useContentService,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export HOCs from Core ────────────────────────────────────────────────

export {
  withContentParser,
  withExtract,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export Providers from Core ───────────────────────────────────────────

export {
  ContentParserProvider,
  useContentRendererConfig,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export Themes from Core ──────────────────────────────────────────────

export { lightTheme, darkTheme } from '@laddhaanshul/content-renderer-core';

// ─── Re-export Plugin System from Core ──────────────────────────────────────

export { PluginManager } from '@laddhaanshul/content-renderer-core';
export type { PluginHook, PluginDefinition, PluginManagerOptions } from '@laddhaanshul/content-renderer-core';
export {
  lineNumbersPlugin,
  sanitizePlugin,
  tocPlugin,
  metaEnricherPlugin,
  linkRewritePlugin,
  imageProxyPlugin,
  emojiPlugin,
  headingAnchorPlugin,
} from '@laddhaanshul/content-renderer-core';
export {
  createLineNumbersPlugin,
  createSanitizePlugin,
  createTocPlugin,
  createMetaEnricherPlugin,
  createLinkRewritePlugin,
  createImageProxyPlugin,
  createEmojiPlugin,
  createHeadingAnchorPlugin,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export Accessibility from Core ──────────────────────────────────────

export {
  ARIA_ROLES,
  ARIA_LANDMARK_ROLES,
  getAriaRole,
  getAriaAttributes,
  generateAriaLabel,
  generateAriaLive,
  createAccessibleTree,
  validateAccessibility,
  getHeadingLevels,
  checkColorContrast,
  generateScreenReaderText,
} from '@laddhaanshul/content-renderer-core';
export type {
  AccessibilityOptions,
  AccessibilityTree,
  AccessibilityIssue,
  HeadingStructure,
  ContrastResult,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export SSR Utilities from Core ──────────────────────────────────────

export {
  renderToString,
  renderToStaticMarkup,
  extractMetadataForSSR,
  generateHeadTags,
  generateStructuredData,
  createSSRContent,
  isServer,
  isClient,
} from '@laddhaanshul/content-renderer-core';
export type { SSRRenderOptions, SSRMetadata } from '@laddhaanshul/content-renderer-core';

// ─── Re-export Error Recovery from Core ─────────────────────────────────────

export {
  recoverFromHTMLError,
  recoverFromJSONError,
  recoverFromMarkdownError,
  recoverFromCSSError,
  recoverFromXMLError,
  sanitizeErrorOutput,
  createFallbackContent,
  suggestFixes,
} from '@laddhaanshul/content-renderer-core';

// ─── Re-export i18n from Core ───────────────────────────────────────────────

export {
  SUPPORTED_LOCALES,
  RTL_LOCALES,
  UI_STRINGS,
  isRTL,
  getDirection,
  getLocaleDirection,
  formatNumber,
  formatDate,
  getLocalizedText,
  setLocaleMessages,
  loadLocale,
  createI18nContext,
  pluralize,
  interpolate,
  loadTranslationsFromFile,
  addLocale,
  getTranslationsForKey,
  formatCurrency,
} from '@laddhaanshul/content-renderer-core';
export type { I18nOptions, I18nContext, TranslationData } from '@laddhaanshul/content-renderer-core';

// ─── Re-export PDF Export from Core ─────────────────────────────────────────

export {
  contentToPrintableHTML,
  generatePDFStyles,
  createPDFBlob,
  downloadPDF,
  previewPDF,
  getContentForPDF,
  contentToCanvasHTML,
  generatePageCSS,
  splitContentForPages,
  tableToPrintHTML,
} from '@laddhaanshul/content-renderer-core';
export type { PDFExportOptions, PDFContent, PDFPageOptions } from '@laddhaanshul/content-renderer-core';

// ─── New Components ────────────────────────────────────────────────────────

export { DiffRenderer } from './components/DiffRenderer';
export type { DiffRendererProps } from './components/DiffRenderer';
export { VirtualizedCodeRenderer } from './components/VirtualizedCodeRenderer';
export type { VirtualizedCodeRendererProps } from './components/VirtualizedCodeRenderer';

// ─── Extended Syntax Support from Core ─────────────────────────────────────

export { EXTENDED_LANGUAGES, getLanguageDefinition, getLanguageExtensions, getAllLanguageNames } from '@laddhaanshul/content-renderer-core';
export type { LanguageDefinition } from '@laddhaanshul/content-renderer-core';
export { THEME_REGISTRY, getTheme, getAllThemeNames, createCustomTheme } from '@laddhaanshul/content-renderer-core';
export type { SyntaxTheme as CoreSyntaxTheme } from '@laddhaanshul/content-renderer-core';

// ─── JSONPath from Core ────────────────────────────────────────────────────

export { queryPath, queryPathSingle, parseJSONPath } from '@laddhaanshul/content-renderer-core';
export type { JSONPathSegment } from '@laddhaanshul/content-renderer-core';

// ─── Diff Engine from Core ─────────────────────────────────────────────────

export { createDiff, createUnifiedDiff, computeLineChanges, applyDiff } from '@laddhaanshul/content-renderer-core';
export type { DiffLine as CoreDiffLine, DiffResult } from '@laddhaanshul/content-renderer-core';

// ─── Enhanced Sanitization from Core ───────────────────────────────────────

export { sanitizeHTMLWithOptions, sanitizeSVG, sanitizeMathML, stripEventHandlers, stripDataAttributes, isSafeHTML, DEFAULT_ALLOWED_TAGS, DEFAULT_ALLOWED_ATTRIBUTES } from '@laddhaanshul/content-renderer-core';
export type { SanitizeOptions } from '@laddhaanshul/content-renderer-core';

// ─── Worker Support ────────────────────────────────────────────────────────

export { createHighlightWorker, highlightInWorker, highlightOnce } from './utils/syntax-highlight-worker';
export type { WorkerMessage, WorkerResult, HighlightToken } from './utils/syntax-highlight-worker';

// ─── Animation Hooks ────────────────────────────────────────────────────────

export {
  useFadeIn,
  useSlideIn,
  useCollapseAnimation,
  useThemeTransition,
  useScrollAnimation,
  useTypewriter,
  animateNumber,
  createStaggerAnimation,
  getTransitionCSS,
} from './utils/animations';
export type { EasingFunction } from './utils/animations';
