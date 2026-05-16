// ─── Platform-Aware Utility Exports ─────────────────────────────────────────

// Web utilities (React DOM)
export {
  styleStringToObject,
  attrToReactProp,
  isBooleanAttribute,
  isVoidElement,
  svgAttrToReact,
  isSVGElement,
  parseAttributes,
} from './style-parser.web';

export {
  tokenize,
  highlight,
  getSupportedLanguages,
  isLanguageSupported,
  resolveLanguageName,
  tokensToHtml,
} from './syntax-highlight.web';

export type { Token, TokenType } from './syntax-highlight.web';

// Native utilities (React Native)
export {
  HTML_TO_RN_MAP,
  styleStringToRNStyle,
  classToRNStyle,
  flattenInlineNodes,
  isInlineNode,
} from './html-to-rn.native';

export type { HTMLTagMapping as HTMLTagMappingRN, HTMLNode as HTMLNodeRN } from './html-to-rn.native';

export {
  tokenizeLine,
  highlightCode,
  detectLanguage,
  LIGHT_SYNTAX_THEME,
  DARK_SYNTAX_THEME,
} from './syntax-highlight-rn.native';

export type {
  SyntaxToken,
  SyntaxTheme,
  TokenizerState,
} from './syntax-highlight-rn.native';

// Themes (native)
export {
  lightNativeTheme,
  darkNativeTheme,
  mergeNativeTheme,
} from '../themes';

export type {
  NativeTheme,
  NativeThemeColors,
  NativeThemeTypography,
  NativeThemeSpacing,
  NativeThemeCodeBlock,
  NativeThemeJSONViewer,
  NativeThemeXMLViewer,
  NativeThemeMarkdown,
} from '../themes';
