/**
 * Syntax Highlighting Theme Definitions
 *
 * Provides 12 curated syntax highlighting themes with real hex colors sourced from
 * actual popular editor themes. Each theme defines colors for all major syntax token
 * types to ensure comprehensive and visually consistent code highlighting.
 *
 * Themes included:
 * - GitHub Light / Dark
 * - Monokai
 * - Dracula
 * - Solarized Light / Dark
 * - Nord
 * - One Dark
 * - VS Code Light
 * - Vitesse Dark
 * - Night Owl
 * - Tokyo Night
 */

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface SyntaxTheme {
  /** Human-readable theme name */
  name: string;
  /** Whether this is a light or dark theme */
  type: 'light' | 'dark';
  /** Editor / code block background */
  background: string;
  /** Default text (foreground) color */
  foreground: string;
  /** Keywords: if, else, return, const, let, import, etc. */
  keyword: string;
  /** String literals: "hello", 'world', `template` */
  string: string;
  /** Numeric literals: 42, 3.14, 0xFF */
  number: string;
  /** Comments: // line, /* block *\/ */
  comment: string;
  /** Function / method names */
  function: string;
  /** Class / struct / interface names */
  className: string;
  /** Type annotations: string, number, boolean, custom types */
  typeName: string;
  /** Operators: +, -, ===, &&, ||, ?? */
  operator: string;
  /** Punctuation: (, ), {, }, [, ], ;, ,, . */
  punctuation: string;
  /** Variable identifiers */
  variable: string;
  /** Constants: PI, MAX_VALUE, etc. */
  constant: string;
  /** HTML / JSX tags: <div>, <span>, <Component> */
  tag: string;
  /** HTML / JSX attributes: class=, id=, href= */
  attribute: string;
  /** Attribute values */
  value: string;
  /** Regular expression literals */
  regex: string;
  /** Built-in functions / globals: console, Math, require */
  builtin: string;
  /** Decorators: @Component, @Injectable, @deprecated */
  decorator: string;
  /** Meta information: #! shebang, import paths, etc. */
  meta: string;
  /** Object property keys */
  property: string;
  /** Boolean literals: true, false */
  boolean: string;
  /** Null-like keywords: null, undefined, nil, None */
  nullKeyword: string;
  /** Symbol / atom literals (Ruby, Elixir, etc.) */
  symbol: string;
  /** CSS selectors: .class, #id, :pseudo, element */
  selector: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GitHub Light — the default light theme on github.com
 *
 * Clean and high-contrast with muted accent colors.
 */
export const githubLightTheme: SyntaxTheme = {
  name: 'GitHub Light',
  type: 'light',
  background: '#ffffff',
  foreground: '#24292e',
  keyword: '#d73a49',
  string: '#032f62',
  number: '#005cc5',
  comment: '#6a737d',
  function: '#6f42c1',
  className: '#005cc5',
  typeName: '#005cc5',
  operator: '#d73a49',
  punctuation: '#24292e',
  variable: '#24292e',
  constant: '#005cc5',
  tag: '#22863a',
  attribute: '#6f42c1',
  value: '#032f62',
  regex: '#032f62',
  builtin: '#005cc5',
  decorator: '#6f42c1',
  meta: '#6a737d',
  property: '#005cc5',
  boolean: '#005cc5',
  nullKeyword: '#005cc5',
  symbol: '#e36209',
  selector: '#6f42c1',
};

/**
 * GitHub Dark — the default dark theme on github.com
 *
 * Soft pastels on a deep navy background.
 */
export const githubDarkTheme: SyntaxTheme = {
  name: 'GitHub Dark',
  type: 'dark',
  background: '#0d1117',
  foreground: '#c9d1d9',
  keyword: '#ff7b72',
  string: '#a5d6ff',
  number: '#79c0ff',
  comment: '#8b949e',
  function: '#d2a8ff',
  className: '#79c0ff',
  typeName: '#79c0ff',
  operator: '#ff7b72',
  punctuation: '#c9d1d9',
  variable: '#ffa657',
  constant: '#79c0ff',
  tag: '#7ee787',
  attribute: '#79c0ff',
  value: '#a5d6ff',
  regex: '#a5d6ff',
  builtin: '#ffa657',
  decorator: '#d2a8ff',
  meta: '#8b949e',
  property: '#79c0ff',
  boolean: '#79c0ff',
  nullKeyword: '#79c0ff',
  symbol: '#ffa657',
  selector: '#7ee787',
};

/**
 * Monokai — the iconic dark theme for Sublime Text / TextMate
 *
 * Bold, saturated colors on a warm dark background.
 */
export const monokaiTheme: SyntaxTheme = {
  name: 'Monokai',
  type: 'dark',
  background: '#272822',
  foreground: '#f8f8f2',
  keyword: '#f92672',
  string: '#e6db74',
  number: '#ae81ff',
  comment: '#75715e',
  function: '#a6e22e',
  className: '#66d9ef',
  typeName: '#66d9ef',
  operator: '#f92672',
  punctuation: '#f8f8f2',
  variable: '#f8f8f2',
  constant: '#66d9ef',
  tag: '#f92672',
  attribute: '#a6e22e',
  value: '#e6db74',
  regex: '#e6db74',
  builtin: '#66d9ef',
  decorator: '#a6e22e',
  meta: '#75715e',
  property: '#a6e22e',
  boolean: '#ae81ff',
  nullKeyword: '#ae81ff',
  symbol: '#ae81ff',
  selector: '#a6e22e',
};

/**
 * Dracula — a popular dark theme inspired by the official Dracula color scheme
 *
 * Vivid, high-saturation palette on a deep purple-black background.
 */
export const draculaTheme: SyntaxTheme = {
  name: 'Dracula',
  type: 'dark',
  background: '#282a36',
  foreground: '#f8f8f2',
  keyword: '#ff79c6',
  string: '#f1fa8c',
  number: '#bd93f9',
  comment: '#6272a4',
  function: '#50fa7b',
  className: '#8be9fd',
  typeName: '#8be9fd',
  operator: '#ff79c6',
  punctuation: '#f8f8f2',
  variable: '#f8f8f2',
  constant: '#bd93f9',
  tag: '#ff79c6',
  attribute: '#50fa7b',
  value: '#f1fa8c',
  regex: '#f1fa8c',
  builtin: '#8be9fd',
  decorator: '#50fa7b',
  meta: '#6272a4',
  property: '#8be9fd',
  boolean: '#bd93f9',
  nullKeyword: '#bd93f9',
  symbol: '#bd93f9',
  selector: '#50fa7b',
};

/**
 * Solarized Light — the light variant of Solarized by Ethan Schoonover
 *
 * Warm, cream-toned background with carefully calibrated contrast ratios.
 */
export const solarizedLightTheme: SyntaxTheme = {
  name: 'Solarized Light',
  type: 'light',
  background: '#fdf6e3',
  foreground: '#657b83',
  keyword: '#859900',
  string: '#2aa198',
  number: '#d33682',
  comment: '#93a1a1',
  function: '#268bd2',
  className: '#268bd2',
  typeName: '#b58900',
  operator: '#859900',
  punctuation: '#657b83',
  variable: '#657b83',
  constant: '#cb4b16',
  tag: '#268bd2',
  attribute: '#b58900',
  value: '#2aa198',
  regex: '#dc322f',
  builtin: '#b58900',
  decorator: '#6c71c4',
  meta: '#93a1a1',
  property: '#268bd2',
  boolean: '#cb4b16',
  nullKeyword: '#d33682',
  symbol: '#cb4b16',
  selector: '#859900',
};

/**
 * Solarized Dark — the dark variant of Solarized by Ethan Schoonover
 *
 * Deep blue-gray background with the same balanced, warm palette.
 */
export const solarizedDarkTheme: SyntaxTheme = {
  name: 'Solarized Dark',
  type: 'dark',
  background: '#002b36',
  foreground: '#839496',
  keyword: '#859900',
  string: '#2aa198',
  number: '#d33682',
  comment: '#586e75',
  function: '#268bd2',
  className: '#268bd2',
  typeName: '#b58900',
  operator: '#859900',
  punctuation: '#839496',
  variable: '#839496',
  constant: '#cb4b16',
  tag: '#268bd2',
  attribute: '#b58900',
  value: '#2aa198',
  regex: '#dc322f',
  builtin: '#b58900',
  decorator: '#6c71c4',
  meta: '#586e75',
  property: '#268bd2',
  boolean: '#cb4b16',
  nullKeyword: '#d33682',
  symbol: '#cb4b16',
  selector: '#859900',
};

/**
 * Nord — an arctic, north-bluish color palette by Arctic Ice Studio
 *
 * Cool, muted tones on a polar night background.
 */
export const nordTheme: SyntaxTheme = {
  name: 'Nord',
  type: 'dark',
  background: '#2e3440',
  foreground: '#d8dee9',
  keyword: '#81a1c1',
  string: '#a3be8c',
  number: '#b48ead',
  comment: '#616e88',
  function: '#88c0d0',
  className: '#8fbcbb',
  typeName: '#8fbcbb',
  operator: '#81a1c1',
  punctuation: '#eceff4',
  variable: '#d8dee9',
  constant: '#81a1c1',
  tag: '#81a1c1',
  attribute: '#8fbcbb',
  value: '#a3be8c',
  regex: '#ebcb8b',
  builtin: '#88c0d0',
  decorator: '#8fbcbb',
  meta: '#616e88',
  property: '#88c0d0',
  boolean: '#81a1c1',
  nullKeyword: '#81a1c1',
  symbol: '#b48ead',
  selector: '#81a1c1',
};

/**
 * One Dark — Atom's default dark theme, now popular everywhere
 *
 * Rich, well-balanced colors on a charcoal background.
 */
export const oneDarkTheme: SyntaxTheme = {
  name: 'One Dark',
  type: 'dark',
  background: '#282c34',
  foreground: '#abb2bf',
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  comment: '#5c6370',
  function: '#61afef',
  className: '#e5c07b',
  typeName: '#e5c07b',
  operator: '#56b6c2',
  punctuation: '#abb2bf',
  variable: '#e06c75',
  constant: '#d19a66',
  tag: '#e06c75',
  attribute: '#d19a66',
  value: '#98c379',
  regex: '#98c379',
  builtin: '#e5c07b',
  decorator: '#c678dd',
  meta: '#5c6370',
  property: '#e06c75',
  boolean: '#d19a66',
  nullKeyword: '#d19a66',
  symbol: '#56b6c2',
  selector: '#e06c75',
};

/**
 * VS Code Light — Visual Studio Code's default light theme
 *
 * Classic IDE colors with strong contrast on white.
 */
export const vscodeLightTheme: SyntaxTheme = {
  name: 'VS Code Light',
  type: 'light',
  background: '#ffffff',
  foreground: '#000000',
  keyword: '#0000ff',
  string: '#a31515',
  number: '#098658',
  comment: '#008000',
  function: '#795e26',
  className: '#267f99',
  typeName: '#267f99',
  operator: '#000000',
  punctuation: '#000000',
  variable: '#001080',
  constant: '#0000ff',
  tag: '#800000',
  attribute: '#e50000',
  value: '#a31515',
  regex: '#811f3f',
  builtin: '#267f99',
  decorator: '#795e26',
  meta: '#008000',
  property: '#001080',
  boolean: '#0000ff',
  nullKeyword: '#0000ff',
  symbol: '#098658',
  selector: '#800000',
};

/**
 * Vitesse Dark — Anthony Fu's popular VS Code theme
 *
 * Soft, muted earthy tones on a near-black background.
 */
export const vitesseDarkTheme: SyntaxTheme = {
  name: 'Vitesse Dark',
  type: 'dark',
  background: '#121212',
  foreground: '#dbd7ca',
  keyword: '#cb7676',
  string: '#c98a7d',
  number: '#4c9a91',
  comment: '#5c6370',
  function: '#80a665',
  className: '#5da9a6',
  typeName: '#5da9a6',
  operator: '#cb7676',
  punctuation: '#666670',
  variable: '#bd976a',
  constant: '#4c9a91',
  tag: '#cb7676',
  attribute: '#c4a259',
  value: '#c98a7d',
  regex: '#c98a7d',
  builtin: '#5da9a6',
  decorator: '#bd976a',
  meta: '#5c6370',
  property: '#bd976a',
  boolean: '#4c9a91',
  nullKeyword: '#4c9a91',
  symbol: '#4c9a91',
  selector: '#cb7676',
};

/**
 * Night Owl — Sarah Drasner's dark theme for VS Code
 *
 * Rich blues and purples on a deep midnight background.
 */
export const nightOwlTheme: SyntaxTheme = {
  name: 'Night Owl',
  type: 'dark',
  background: '#011627',
  foreground: '#d6deeb',
  keyword: '#c792ea',
  string: '#ecc48d',
  number: '#f78c6c',
  comment: '#637777',
  function: '#82aaff',
  className: '#ffcb8b',
  typeName: '#ffcb8b',
  operator: '#c792ea',
  punctuation: '#d6deeb',
  variable: '#d6deeb',
  constant: '#f78c6c',
  tag: '#caece6',
  attribute: '#ffcb8b',
  value: '#ecc48d',
  regex: '#ecc48d',
  builtin: '#82aaff',
  decorator: '#c792ea',
  meta: '#637777',
  property: '#80cbc4',
  boolean: '#ff5874',
  nullKeyword: '#ff5874',
  symbol: '#c792ea',
  selector: '#c792ea',
};

/**
 * Tokyo Night — a modern dark theme inspired by Tokyo's neon-lit nightscape
 *
 * Soft purples and blues on a deep blue-black background.
 */
export const tokyoNightTheme: SyntaxTheme = {
  name: 'Tokyo Night',
  type: 'dark',
  background: '#1a1b26',
  foreground: '#a9b1d6',
  keyword: '#bb9af7',
  string: '#9ece6a',
  number: '#ff9e64',
  comment: '#565f89',
  function: '#7aa2f7',
  className: '#7dcfff',
  typeName: '#7dcfff',
  operator: '#89ddff',
  punctuation: '#9aa5ce',
  variable: '#c0caf5',
  constant: '#ff9e64',
  tag: '#f7768e',
  attribute: '#7dcfff',
  value: '#9ece6a',
  regex: '#b4f9f8',
  builtin: '#7aa2f7',
  decorator: '#bb9af7',
  meta: '#565f89',
  property: '#73daca',
  boolean: '#bb9af7',
  nullKeyword: '#bb9af7',
  symbol: '#ff9e64',
  selector: '#bb9af7',
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme Registry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registry mapping theme names (lowercased, space-dashed) to their full `SyntaxTheme` objects.
 *
 * @example
 * ```ts
 * const theme = THEME_REGISTRY['github-light'];
 * console.log(theme.background); // '#ffffff'
 * ```
 */
export const THEME_REGISTRY: Record<string, SyntaxTheme> = {
  'github-light': githubLightTheme,
  'github-dark': githubDarkTheme,
  monokai: monokaiTheme,
  dracula: draculaTheme,
  'solarized-light': solarizedLightTheme,
  'solarized-dark': solarizedDarkTheme,
  nord: nordTheme,
  'one-dark': oneDarkTheme,
  'vscode-light': vscodeLightTheme,
  'vitesse-dark': vitesseDarkTheme,
  'night-owl': nightOwlTheme,
  'tokyo-night': tokyoNightTheme,
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve a theme by its registry key.
 *
 * The lookup is case-insensitive and normalises spaces to hyphens, so both
 * `"GitHub Light"` and `"github-light"` resolve to the same theme.
 *
 * @param name - Theme registry key or display name
 * @returns The matching `SyntaxTheme`, or `undefined` if not found
 *
 * @example
 * ```ts
 * const theme = getTheme('monokai');
 * const same  = getTheme('Monokai');       // works too
 * ```
 */
export function getTheme(name: string): SyntaxTheme | undefined {
  const normalised = name.toLowerCase().replace(/\s+/g, '-');
  return THEME_REGISTRY[normalised];
}

/**
 * Return an array of all registered theme display names.
 *
 * @example
 * ```ts
 * const names = getAllThemeNames();
 * // ['GitHub Light', 'GitHub Dark', 'Monokai', ...]
 * ```
 */
export function getAllThemeNames(): string[] {
  return Object.values(THEME_REGISTRY).map((theme) => theme.name);
}

/**
 * Create a custom theme by merging partial overrides onto a base theme.
 *
 * If no base theme is provided, `githubLightTheme` is used as the default.
 * Only the keys present in `overrides` will be replaced; everything else is
 * inherited from the base theme.
 *
 * @param overrides - A partial `SyntaxTheme` with the properties to override
 * @param base - Optional base theme to extend from (defaults to `githubLightTheme`)
 * @returns A new `SyntaxTheme` with overrides applied
 *
 * @example
 * ```ts
 * const myTheme = createCustomTheme(
 *   { background: '#1e1e1e', foreground: '#d4d4d4', name: 'My Custom Dark' },
 *   githubDarkTheme,
 * );
 * ```
 */
export function createCustomTheme(
  overrides: Partial<SyntaxTheme>,
  base: SyntaxTheme = githubLightTheme,
): SyntaxTheme {
  return { ...base, ...overrides };
}
