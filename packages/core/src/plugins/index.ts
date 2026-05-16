// ==========================================
// @laddhaanshul/content-renderer-core - Plugins
// ==========================================

// Plugin Manager
export {
  PluginManager,
  PluginPriority,
} from './plugin-manager';

export type {
  PluginHook,
  PluginLifecycle,
  PluginDefinition,
  PluginManagerOptions,
  PluginHookContext,
  PluginEventType,
  PluginEventListener,
  PluginEvent,
  PluginValidationResult,
} from './plugin-manager';

// Built-in Plugins
export {
  lineNumbersPlugin,
  createLineNumbersPlugin,
  sanitizePlugin,
  createSanitizePlugin,
  tocPlugin,
  createTocPlugin,
  metaEnricherPlugin,
  createMetaEnricherPlugin,
  linkRewritePlugin,
  createLinkRewritePlugin,
  imageProxyPlugin,
  createImageProxyPlugin,
  emojiPlugin,
  createEmojiPlugin,
  headingAnchorPlugin,
  createHeadingAnchorPlugin,
  builtInPlugins,
} from './built-in-plugins';
