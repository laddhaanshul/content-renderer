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
} from './extract';

export {
  sanitizeHTML,
  sanitizeHTMLWithOptions,
  sanitizeSVG,
  sanitizeMathML,
  stripEventHandlers,
  stripDataAttributes,
  isSafeHTML,
  stripTags,
  stripAttributes,
  stripScripts,
  stripStyles,
  escapeHTML,
  unescapeHTML,
  encodeEntities,
  decodeEntities,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_ALLOWED_ATTRIBUTES,
} from './sanitize';
export type { SanitizeOptions } from './sanitize';

// Extended syntax languages (56 languages)
export { EXTENDED_LANGUAGES, getLanguageDefinition, getLanguageExtensions, getAllLanguageNames } from './syntax-languages';
export type { LanguageDefinition } from './syntax-languages';

// Extended syntax themes (12 themes)
export { THEME_REGISTRY, getTheme, getAllThemeNames, createCustomTheme } from './syntax-themes';
export type { SyntaxTheme } from './syntax-themes';

export {
  queryPath,
  queryPathSingle,
  parseJSONPath,
} from './json-path';
export type {
  JSONPathSegment,
  JSONPathChildSegment,
  JSONPathRecursiveSegment,
  JSONPathIndexSegment,
  JSONPathWildcardSegment,
  JSONPathSliceSegment,
  JSONPathFilterSegment,
} from './json-path';

export {
  createDiff,
  createUnifiedDiff,
  computeLineChanges,
  applyDiff,
} from './diff-engine';
export type { DiffLine, DiffResult } from './diff-engine';

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
} from './transform';

export {
  isValidHTML,
  isValidJSON,
  isValidXML,
  isValidCSS,
  isValidURL,
  isValidEmail,
  isValidPhoneNumber,
  isIP,
  isPublicIP,
  getContentTypeFromExtension,
  getContentTypeFromMIME,
  getContentTypeFromHeader,
} from './validate';

