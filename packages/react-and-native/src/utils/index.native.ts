// ─── Native-Only Utility Exports ────────────────────────────────────────────
// Exports all native-compatible utilities for React Native builds.
// style-parser.web.ts and syntax-highlight.web.ts are pure JS (no DOM APIs)
// so they're safe to include in the native build.

// Web utilities (pure JS, no DOM dependency)
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

// Native utilities (React Native specific)
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

// Native themes
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
// Turbo Module Utilities (Native Architecture support)
export {
  createTurboModuleProxy,
  createBridgeCompatLayer,
  isFabricEnabled,
  getArchitectureInfo,
  registerFabricRenderer,
  getFabricRenderers,
  createContentRendererComponent,
  CodegenSpec,
  FabricCodegenSpec,
} from './turbo-modules.native';

export type {
  ParsedContent,
  ValidationResult,
  ContentRendererNativeComponentSpec,
  Spec as TurboModuleSpec,
  ArchitectureInfo,
} from './turbo-modules.native';
