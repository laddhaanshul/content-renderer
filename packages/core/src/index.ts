// ==========================================
// @content-renderer/core - Main Entry Point
// ==========================================

// Types
export * from './types';

// Parsers
export { HTMLParser } from './parsers/html-parser';
export { JSONParser } from './parsers/json-parser';
export { XMLParser } from './parsers/xml-parser';
export type { XMLParseOptions } from './parsers/xml-parser';
export { PHPParser } from './parsers/php-parser';
export type { PHPParseOptions } from './parsers/php-parser';
export { MarkdownParser } from './parsers/markdown-parser';
export type { MarkdownParseOptions } from './parsers/markdown-parser';
export { CSSParser } from './parsers/css-parser';
export type { CSSParseOptions } from './parsers/css-parser';

// Utilities
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
  extractClasses,
  extractIds,
  extractAttributes,
  extractByTag,
  extractDataAttributes,
  extractSEO,
  extractStructuredData,
  extractOpenGraph,
  extractTwitterCards,
  extractFavicon,
  extractCanonical,
} from './utils/extract';

export {
  sanitizeHTML,
  stripTags,
  stripAttributes,
  stripScripts,
  stripStyles,
  escapeHTML,
  unescapeHTML,
  encodeEntities,
  decodeEntities,
} from './utils/sanitize';
export type { SanitizeOptions } from './utils/sanitize';

export {
  minifyHTML,
  minifyCSS,
  minifyJSON,
  minifyXML,
  formatHTML,
  formatCSS,
  formatJSON,
  formatXML,
  prettify,
  convertToJSON,
  convertToXML,
  convertToMarkdown,
  truncate,
  slugify,
  camelCase,
  kebabCase,
  snakeCase,
  pascalCase,
  titleCase,
  capitalize,
  detectContentType,
} from './utils/transform';

// CSS Engine
export { CSEngine } from './utils/css-engine';
export type { CSEngineOptions, ComputedStyle } from './utils/css-engine';
export { matchSelector, calculateSpecificity } from './utils/css-selector';
export type { SpecificityResult } from './utils/css-selector';

export {
  isValidHTML,
  isValidJSON,
  isValidXML,
  isValidCSS,
  isValidURL,
  isValidEmail,
  isValidPhoneNumber,
  getContentTypeFromExtension,
  getContentTypeFromMIME,
  getContentTypeFromHeader,
} from './utils/validate';

// Hooks
export { useContentParser } from './hooks/useContentParser';
export { useExtract } from './hooks/useExtract';
export { useTheme, useThemeContext, ThemeContext } from './hooks/useTheme';

// HOCs
export { withContentParser } from './hoc/withContentParser';
export type { WithContentParserOptions } from './hoc/withContentParser';
export { withExtract } from './hoc/withExtract';
export type { WithExtractOptions } from './hoc/withExtract';

// Content Service Hook
export { useContentService } from './hooks/useContentService';
export type {
  ContentServiceConfig,
  ContentExtractStrategy,
  ContentServiceError,
  ContentServiceResult,
  UseContentServiceReturn,
  ContentServiceRendererProps,
} from './types';

// Providers
export {
  ContentParserProvider,
  useContentRendererConfig,
  ContentRendererConfigContext,
} from './providers/ContentParserProvider';

// Themes
export { lightTheme, darkTheme } from './themes';

// ==========================================
// Plugin System
// ==========================================
export { PluginManager, PluginPriority } from './plugins';
export type {
  PluginHook,
  PluginDefinition,
  PluginManagerOptions,
  PluginValidationResult,
  PluginEvent,
  PluginEventListener,
  PluginEventType,
  PluginHookContext,
  PluginLifecycle,
} from './plugins';
export {
  builtInPlugins,
  lineNumbersPlugin,
  sanitizePlugin,
  tocPlugin,
  metaEnricherPlugin,
  linkRewritePlugin,
  imageProxyPlugin,
  emojiPlugin,
  headingAnchorPlugin,
} from './plugins';
export {
  createLineNumbersPlugin,
  createSanitizePlugin,
  createTocPlugin,
  createMetaEnricherPlugin,
  createLinkRewritePlugin,
  createImageProxyPlugin,
  createEmojiPlugin,
  createHeadingAnchorPlugin,
} from './plugins';

// ==========================================
// Accessibility
// ==========================================
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
} from './accessibility';
export type {
  AccessibilityOptions,
  AccessibilityTree,
  AccessibilityIssue,
  HeadingStructure,
  ContrastResult,
} from './accessibility';

// ==========================================
// SSR / Next.js Utilities
// ==========================================
export {
  renderToString,
  renderToStaticMarkup,
  extractMetadataForSSR,
  generateHeadTags,
  generateStructuredData,
  createSSRContent,
  isServer,
  isClient,
} from './utils/ssr';
export type {
  SSRRenderOptions,
  SSRMetadata,
} from './utils/ssr';

// ==========================================
// Error Recovery
// ==========================================
export {
  recoverFromHTMLError,
  recoverFromJSONError,
  recoverFromMarkdownError,
  recoverFromCSSError,
  recoverFromXMLError,
  sanitizeErrorOutput,
  createFallbackContent,
  suggestFixes,
} from './utils/error-recovery';
export type {
  HTMLRecoveryResult,
  JSONRecoveryResult,
  MarkdownRecoveryResult,
  CSSRecoveryResult,
  XMLRecoveryResult,
  SanitizedError,
} from './utils/error-recovery';

// ==========================================
// i18n / RTL Support
// ==========================================
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
} from './i18n';
export type {
  I18nOptions,
  I18nContext,
  TranslationData,
} from './i18n';

// ==========================================
// PDF Export
// ==========================================
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
} from './utils/pdf-export';
export type {
  PDFExportOptions,
  PDFContent,
  PDFPageOptions,
} from './utils/pdf-export';

// ==========================================
// Extended Syntax Languages (56 languages)
// ==========================================
export { EXTENDED_LANGUAGES, getLanguageDefinition, getLanguageExtensions, getAllLanguageNames } from './utils/syntax-languages';
export type { LanguageDefinition } from './utils/syntax-languages';

// ==========================================
// Extended Syntax Themes (12 themes)
// ==========================================
export { THEME_REGISTRY, getTheme, getAllThemeNames, createCustomTheme } from './utils/syntax-themes';
export type { SyntaxTheme } from './utils/syntax-themes';

// ==========================================
// JSONPath Queries
// ==========================================
export { queryPath, queryPathSingle, parseJSONPath } from './utils/json-path';
export type { JSONPathSegment } from './utils/json-path';

// ==========================================
// Diff Engine
// ==========================================
export { createDiff, createUnifiedDiff, computeLineChanges, applyDiff } from './utils/diff-engine';
export type { DiffLine, DiffResult } from './utils/diff-engine';

// ==========================================
// Enhanced Sanitization
// ==========================================
export { sanitizeHTMLWithOptions, sanitizeSVG, sanitizeMathML, stripEventHandlers, stripDataAttributes, isSafeHTML, DEFAULT_ALLOWED_TAGS, DEFAULT_ALLOWED_ATTRIBUTES } from './utils/sanitize';
