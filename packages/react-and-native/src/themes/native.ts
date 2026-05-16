/**
 * React Native-specific rendering themes.
 *
 * All colors are expressed as hex strings compatible with React Native's
 * StyleSheet and color props. Each theme defines typography, spacing,
 * code block styles, and component-level overrides as ViewStyle / TextStyle
 * objects.
 */

import { Platform, TextStyle, ViewStyle } from 'react-native';
import type { SyntaxTheme } from '../utils/syntax-highlight-rn.native';

// ---------------------------------------------------------------------------
// Theme shape
// ---------------------------------------------------------------------------

export interface NativeThemeColors {
  /** Primary background. */
  background: string;
  /** Surface / card background. */
  surface: string;
  /** Primary text color. */
  text: string;
  /** Secondary / muted text. */
  textSecondary: string;
  /** Tertiary / disabled text. */
  textTertiary: string;
  /** Accent / brand color (links, highlights). */
  accent: string;
  /** Border color. */
  border: string;
  /** Divider color. */
  divider: string;
  /** Error color. */
  error: string;
  /** Success color. */
  success: string;
  /** Warning color. */
  warning: string;
  /** Code block background. */
  codeBackground: string;
  /** Code block text. */
  codeText: string;
  /** Code block border. */
  codeBorder: string;
  /** Blockquote background. */
  blockquoteBackground: string;
  /** Blockquote border. */
  blockquoteBorder: string;
  /** Table header background. */
  tableHeaderBackground: string;
  /** Table border. */
  tableBorder: string;
  /** Selection / highlight background. */
  selection: string;
  /** Link color. */
  link: string;
}

export interface NativeThemeTypography {
  /** H1 style. */
  h1: TextStyle;
  /** H2 style. */
  h2: TextStyle;
  /** H3 style. */
  h3: TextStyle;
  /** H4 style. */
  h4: TextStyle;
  /** H5 style. */
  h5: TextStyle;
  /** H6 style. */
  h6: TextStyle;
  /** Body text. */
  body: TextStyle;
  /** Small text. */
  small: TextStyle;
  /** Code inline. */
  codeInline: TextStyle;
  /** Link text. */
  link: TextStyle;
  /** Blockquote text. */
  blockquote: TextStyle;
  /** List item text. */
  listItem: TextStyle;
  /** Table header text. */
  tableHeader: TextStyle;
  /** Table cell text. */
  tableCell: TextStyle;
  /** Caption text. */
  caption: TextStyle;
  /** Monospace font family. */
  monoFontFamily: string;
  /** Default font family. */
  fontFamily: string;
}

export interface NativeThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface NativeThemeCodeBlock {
  container: ViewStyle;
  header: ViewStyle;
  headerText: TextStyle;
  body: ViewStyle;
  line: ViewStyle;
  lineNumber: TextStyle;
  codeText: TextStyle;
  copyButton: ViewStyle;
  copyButtonText: TextStyle;
  scrollContainer: ViewStyle;
}

export interface NativeThemeJSONViewer {
  container: ViewStyle;
  keyText: TextStyle;
  stringVal: TextStyle;
  numberVal: TextStyle;
  booleanVal: TextStyle;
  nullVal: TextStyle;
  bracket: TextStyle;
  indent: number;
  maxDepth: number;
}

export interface NativeThemeXMLViewer {
  container: ViewStyle;
  tag: TextStyle;
  attributeName: TextStyle;
  attributeValue: TextStyle;
  text: TextStyle;
  comment: TextStyle;
  indent: number;
}

export interface NativeThemeMarkdown {
  headingMarginTop: number;
  headingMarginBottom: number;
  paragraphMarginBottom: number;
  listIndent: number;
  blockquoteBorderWidth: number;
  blockquotePaddingLeft: number;
  hrHeight: number;
  hrMargin: number;
  codeBlockBorderRadius: number;
  linkColor: string;
}

export interface NativeTheme {
  name: string;
  isDark: boolean;
  colors: NativeThemeColors;
  typography: NativeThemeTypography;
  spacing: NativeThemeSpacing;
  codeBlock: NativeThemeCodeBlock;
  jsonViewer: NativeThemeJSONViewer;
  xmlViewer: NativeThemeXMLViewer;
  markdown: NativeThemeMarkdown;
  syntaxTheme: SyntaxTheme;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultFontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const monoFontFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

// ---------------------------------------------------------------------------
// Light Theme
// ---------------------------------------------------------------------------

export const lightNativeTheme: NativeTheme = {
  name: 'light',
  isDark: false,
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#1a1a2e',
    textSecondary: '#4a4a6a',
    textTertiary: '#8888a8',
    accent: '#007AFF',
    border: '#e0e0e0',
    divider: '#e8e8e8',
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    codeBackground: '#f5f5f5',
    codeText: '#333333',
    codeBorder: '#e0e0e0',
    blockquoteBackground: '#f9f9f9',
    blockquoteBorder: '#6a737d',
    tableHeaderBackground: '#f0f0f0',
    tableBorder: '#ddd',
    selection: 'rgba(0, 122, 255, 0.2)',
    link: '#007AFF',
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1a1a2e',
      lineHeight: 36,
      marginTop: 24,
      marginBottom: 12,
      fontFamily: defaultFontFamily,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1a1a2e',
      lineHeight: 32,
      marginTop: 20,
      marginBottom: 10,
      fontFamily: defaultFontFamily,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1a1a2e',
      lineHeight: 28,
      marginTop: 16,
      marginBottom: 8,
      fontFamily: defaultFontFamily,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1a1a2e',
      lineHeight: 24,
      marginTop: 14,
      marginBottom: 6,
      fontFamily: defaultFontFamily,
    },
    h5: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a1a2e',
      lineHeight: 22,
      marginTop: 12,
      marginBottom: 4,
      fontFamily: defaultFontFamily,
    },
    h6: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4a4a6a',
      lineHeight: 20,
      marginTop: 10,
      marginBottom: 4,
      fontFamily: defaultFontFamily,
    },
    body: {
      fontSize: 15,
      color: '#1a1a2e',
      lineHeight: 22,
      fontFamily: defaultFontFamily,
    },
    small: {
      fontSize: 12,
      color: '#4a4a6a',
      lineHeight: 16,
      fontFamily: defaultFontFamily,
    },
    codeInline: {
      fontSize: 14,
      fontFamily: monoFontFamily,
      backgroundColor: '#f0f0f0',
      color: '#333333',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 3,
    },
    link: {
      fontSize: 15,
      color: '#007AFF',
      textDecorationLine: 'underline' as const,
      fontFamily: defaultFontFamily,
    },
    blockquote: {
      fontSize: 15,
      color: '#4a4a6a',
      lineHeight: 22,
      fontStyle: 'italic',
      fontFamily: defaultFontFamily,
    },
    listItem: {
      fontSize: 15,
      color: '#1a1a2e',
      lineHeight: 22,
      fontFamily: defaultFontFamily,
    },
    tableHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1a1a2e',
      fontFamily: defaultFontFamily,
    },
    tableCell: {
      fontSize: 14,
      color: '#1a1a2e',
      fontFamily: defaultFontFamily,
    },
    caption: {
      fontSize: 13,
      color: '#4a4a6a',
      fontStyle: 'italic',
      textAlign: 'center',
      fontFamily: defaultFontFamily,
    },
    monoFontFamily,
    fontFamily: defaultFontFamily,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  codeBlock: {
    container: {
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      marginVertical: 8,
      overflow: 'hidden' as const,
    },
    header: {
      backgroundColor: '#e8e8e8',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#d0d0d0',
      flexDirection: 'row',
      justifyContent: 'space-between' as any,
      alignItems: 'center',
    },
    headerText: {
      fontSize: 12,
      color: '#555',
      fontFamily: monoFontFamily,
      fontWeight: '600',
    },
    body: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#f8f8f8',
    },
    line: {
      flexDirection: 'row',
      minHeight: 20,
    },
    lineNumber: {
      fontSize: 13,
      color: '#aaa',
      fontFamily: monoFontFamily,
      width: 40,
      textAlign: 'right',
      marginRight: 12,
      userSelect: 'none' as any,
    },
    codeText: {
      fontSize: 13,
      color: '#333',
      fontFamily: monoFontFamily,
      lineHeight: 20,
    },
    copyButton: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: '#e0e0e0',
    },
    copyButtonText: {
      fontSize: 11,
      color: '#555',
      fontFamily: defaultFontFamily,
      fontWeight: '500',
    },
    scrollContainer: {
      backgroundColor: '#f8f8f8',
    },
  },
  jsonViewer: {
    container: {
      backgroundColor: '#fafafa',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    keyText: {
      fontSize: 14,
      color: '#6f42c1',
      fontFamily: monoFontFamily,
    },
    stringVal: {
      fontSize: 14,
      color: '#032f62',
      fontFamily: monoFontFamily,
    },
    numberVal: {
      fontSize: 14,
      color: '#005cc5',
      fontFamily: monoFontFamily,
    },
    booleanVal: {
      fontSize: 14,
      color: '#d73a49',
      fontFamily: monoFontFamily,
    },
    nullVal: {
      fontSize: 14,
      color: '#6a737d',
      fontFamily: monoFontFamily,
      fontStyle: 'italic',
    },
    bracket: {
      fontSize: 14,
      color: '#333',
      fontFamily: monoFontFamily,
    },
    indent: 16,
    maxDepth: 20,
  },
  xmlViewer: {
    container: {
      backgroundColor: '#fafafa',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    tag: {
      fontSize: 14,
      color: '#22863a',
      fontFamily: monoFontFamily,
    },
    attributeName: {
      fontSize: 14,
      color: '#6f42c1',
      fontFamily: monoFontFamily,
    },
    attributeValue: {
      fontSize: 14,
      color: '#032f62',
      fontFamily: monoFontFamily,
    },
    text: {
      fontSize: 14,
      color: '#333',
      fontFamily: monoFontFamily,
    },
    comment: {
      fontSize: 14,
      color: '#6a737d',
      fontFamily: monoFontFamily,
    },
    indent: 16,
  },
  markdown: {
    headingMarginTop: 20,
    headingMarginBottom: 10,
    paragraphMarginBottom: 12,
    listIndent: 20,
    blockquoteBorderWidth: 3,
    blockquotePaddingLeft: 12,
    hrHeight: 1,
    hrMargin: 16,
    codeBlockBorderRadius: 6,
    linkColor: '#007AFF',
  },
  syntaxTheme: {
    keyword: '#d73a49',
    string: '#032f62',
    number: '#005cc5',
    comment: '#6a737d',
    function: '#6f42c1',
    variable: '#e36209',
    operator: '#d73a49',
    type: '#005cc5',
    tag: '#22863a',
    attribute: '#6f42c1',
    attributeValue: '#032f62',
    punctuation: '#24292e',
    regexp: '#032f62',
    constant: '#005cc5',
    decorator: '#6f42c1',
    plain: '#24292e',
  },
};

// ---------------------------------------------------------------------------
// Dark Theme
// ---------------------------------------------------------------------------

export const darkNativeTheme: NativeTheme = {
  name: 'dark',
  isDark: true,
  colors: {
    background: '#1e1e2e',
    surface: '#2a2a3e',
    text: '#e0e0f0',
    textSecondary: '#a0a0c0',
    textTertiary: '#707090',
    accent: '#5b9aff',
    border: '#3a3a5e',
    divider: '#333355',
    error: '#ff6b6b',
    success: '#51cf66',
    warning: '#ffd43b',
    codeBackground: '#282840',
    codeText: '#e0e0f0',
    codeBorder: '#3a3a5e',
    blockquoteBackground: '#252540',
    blockquoteBorder: '#5a5a7a',
    tableHeaderBackground: '#2e2e48',
    tableBorder: '#3a3a5e',
    selection: 'rgba(91, 154, 255, 0.3)',
    link: '#5b9aff',
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#e0e0f0',
      lineHeight: 36,
      marginTop: 24,
      marginBottom: 12,
      fontFamily: defaultFontFamily,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#e0e0f0',
      lineHeight: 32,
      marginTop: 20,
      marginBottom: 10,
      fontFamily: defaultFontFamily,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#e0e0f0',
      lineHeight: 28,
      marginTop: 16,
      marginBottom: 8,
      fontFamily: defaultFontFamily,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      color: '#e0e0f0',
      lineHeight: 24,
      marginTop: 14,
      marginBottom: 6,
      fontFamily: defaultFontFamily,
    },
    h5: {
      fontSize: 16,
      fontWeight: '600',
      color: '#c0c0e0',
      lineHeight: 22,
      marginTop: 12,
      marginBottom: 4,
      fontFamily: defaultFontFamily,
    },
    h6: {
      fontSize: 14,
      fontWeight: '600',
      color: '#a0a0c0',
      lineHeight: 20,
      marginTop: 10,
      marginBottom: 4,
      fontFamily: defaultFontFamily,
    },
    body: {
      fontSize: 15,
      color: '#e0e0f0',
      lineHeight: 22,
      fontFamily: defaultFontFamily,
    },
    small: {
      fontSize: 12,
      color: '#a0a0c0',
      lineHeight: 16,
      fontFamily: defaultFontFamily,
    },
    codeInline: {
      fontSize: 14,
      fontFamily: monoFontFamily,
      backgroundColor: '#333355',
      color: '#e0e0f0',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 3,
    },
    link: {
      fontSize: 15,
      color: '#5b9aff',
      textDecorationLine: 'underline' as const,
      fontFamily: defaultFontFamily,
    },
    blockquote: {
      fontSize: 15,
      color: '#a0a0c0',
      lineHeight: 22,
      fontStyle: 'italic',
      fontFamily: defaultFontFamily,
    },
    listItem: {
      fontSize: 15,
      color: '#e0e0f0',
      lineHeight: 22,
      fontFamily: defaultFontFamily,
    },
    tableHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#e0e0f0',
      fontFamily: defaultFontFamily,
    },
    tableCell: {
      fontSize: 14,
      color: '#e0e0f0',
      fontFamily: defaultFontFamily,
    },
    caption: {
      fontSize: 13,
      color: '#a0a0c0',
      fontStyle: 'italic',
      textAlign: 'center',
      fontFamily: defaultFontFamily,
    },
    monoFontFamily,
    fontFamily: defaultFontFamily,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  codeBlock: {
    container: {
      backgroundColor: '#282840',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#3a3a5e',
      marginVertical: 8,
      overflow: 'hidden' as const,
    },
    header: {
      backgroundColor: '#222240',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#3a3a5e',
      flexDirection: 'row',
      justifyContent: 'space-between' as any,
      alignItems: 'center',
    },
    headerText: {
      fontSize: 12,
      color: '#8888aa',
      fontFamily: monoFontFamily,
      fontWeight: '600',
    },
    body: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#282840',
    },
    line: {
      flexDirection: 'row',
      minHeight: 20,
    },
    lineNumber: {
      fontSize: 13,
      color: '#555577',
      fontFamily: monoFontFamily,
      width: 40,
      textAlign: 'right',
      marginRight: 12,
      userSelect: 'none' as any,
    },
    codeText: {
      fontSize: 13,
      color: '#e0e0f0',
      fontFamily: monoFontFamily,
      lineHeight: 20,
    },
    copyButton: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: '#3a3a5e',
    },
    copyButtonText: {
      fontSize: 11,
      color: '#a0a0c0',
      fontFamily: defaultFontFamily,
      fontWeight: '500',
    },
    scrollContainer: {
      backgroundColor: '#282840',
    },
  },
  jsonViewer: {
    container: {
      backgroundColor: '#252540',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#3a3a5e',
    },
    keyText: {
      fontSize: 14,
      color: '#d2a8ff',
      fontFamily: monoFontFamily,
    },
    stringVal: {
      fontSize: 14,
      color: '#a5d6ff',
      fontFamily: monoFontFamily,
    },
    numberVal: {
      fontSize: 14,
      color: '#79c0ff',
      fontFamily: monoFontFamily,
    },
    booleanVal: {
      fontSize: 14,
      color: '#ff7b72',
      fontFamily: monoFontFamily,
    },
    nullVal: {
      fontSize: 14,
      color: '#8b949e',
      fontFamily: monoFontFamily,
      fontStyle: 'italic',
    },
    bracket: {
      fontSize: 14,
      color: '#c9d1d9',
      fontFamily: monoFontFamily,
    },
    indent: 16,
    maxDepth: 20,
  },
  xmlViewer: {
    container: {
      backgroundColor: '#252540',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#3a3a5e',
    },
    tag: {
      fontSize: 14,
      color: '#7ee787',
      fontFamily: monoFontFamily,
    },
    attributeName: {
      fontSize: 14,
      color: '#d2a8ff',
      fontFamily: monoFontFamily,
    },
    attributeValue: {
      fontSize: 14,
      color: '#a5d6ff',
      fontFamily: monoFontFamily,
    },
    text: {
      fontSize: 14,
      color: '#c9d1d9',
      fontFamily: monoFontFamily,
    },
    comment: {
      fontSize: 14,
      color: '#8b949e',
      fontFamily: monoFontFamily,
    },
    indent: 16,
  },
  markdown: {
    headingMarginTop: 20,
    headingMarginBottom: 10,
    paragraphMarginBottom: 12,
    listIndent: 20,
    blockquoteBorderWidth: 3,
    blockquotePaddingLeft: 12,
    hrHeight: 1,
    hrMargin: 16,
    codeBlockBorderRadius: 6,
    linkColor: '#5b9aff',
  },
  syntaxTheme: {
    keyword: '#ff7b72',
    string: '#a5d6ff',
    number: '#79c0ff',
    comment: '#8b949e',
    function: '#d2a8ff',
    variable: '#ffa657',
    operator: '#ff7b72',
    type: '#79c0ff',
    tag: '#7ee787',
    attribute: '#d2a8ff',
    attributeValue: '#a5d6ff',
    punctuation: '#c9d1d9',
    regexp: '#a5d6ff',
    constant: '#79c0ff',
    decorator: '#d2a8ff',
    plain: '#c9d1d9',
  },
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Merge a partial theme override into a base theme.
 * Shallow-merges each top-level section.
 */
export function mergeNativeTheme(
  base: NativeTheme,
  overrides: Partial<DeepPartial<NativeTheme>>,
): NativeTheme {
  const result = { ...base };

  if (overrides.colors) {
    result.colors = { ...base.colors, ...overrides.colors };
  }
  if (overrides.typography) {
    result.typography = { ...base.typography, ...(overrides.typography as any) };
  }
  if (overrides.spacing) {
    result.spacing = { ...base.spacing, ...overrides.spacing };
  }
  if (overrides.codeBlock) {
    result.codeBlock = { ...base.codeBlock, ...(overrides.codeBlock as any) };
  }
  if (overrides.jsonViewer) {
    result.jsonViewer = { ...base.jsonViewer, ...(overrides.jsonViewer as any) };
  }
  if (overrides.xmlViewer) {
    result.xmlViewer = { ...base.xmlViewer, ...(overrides.xmlViewer as any) };
  }
  if (overrides.markdown) {
    result.markdown = { ...base.markdown, ...overrides.markdown };
  }
  if (overrides.syntaxTheme) {
    result.syntaxTheme = { ...base.syntaxTheme, ...overrides.syntaxTheme };
  }

  return result;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
