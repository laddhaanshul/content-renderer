// ==========================================
// Content Renderer - Plugin Manager
// ==========================================

import { ContentType, ParsedContent, HTMLNode, MarkdownNode, MarkdownDocument, ContentMetadata } from '../types';

// ==========================================
// Plugin Types
// ==========================================

/**
 * All available plugin hooks in the content rendering lifecycle.
 * - `beforeParse`: Runs before content is parsed. Receives raw string content.
 * - `afterParse`: Runs after content is parsed. Receives the ParsedContent result.
 * - `beforeRender`: Runs before content is rendered to output. Receives the parsed content.
 * - `afterRender`: Runs after rendering is complete. Receives the rendered output.
 * - `transformNode`: Runs for each node during tree traversal. Receives the AST node.
 * - `extractData`: Runs during data extraction phase. Receives the extraction context.
 */
export type PluginHook =
  | 'beforeParse'
  | 'afterParse'
  | 'beforeRender'
  | 'afterRender'
  | 'transformNode'
  | 'extractData';

/**
 * Plugin lifecycle phases for ordering initialization and teardown.
 */
export type PluginLifecycle = 'init' | 'run' | 'destroy';

/**
 * Plugin priority constants for common use cases.
 * Higher values run first. Default priority is 0.
 */
export const PluginPriority = {
  /** Critical plugins that must run first (e.g., security sanitization) */
  CRITICAL: 1000,
  /** High priority plugins (e.g., content validation) */
  HIGH: 100,
  /** Normal priority (default) */
  NORMAL: 0,
  /** Low priority plugins (e.g., analytics, logging) */
  LOW: -100,
  /** Last-resort plugins (e.g., fallback handlers) */
  LAST: -1000,
} as const;

/**
 * Context passed through the hook execution pipeline.
 * Allows plugins to communicate and share data via the shared `data` object.
 */
export interface PluginHookContext<T = any> {
  /** The content being processed (varies by hook) */
  content: T;
  /** The content type being processed */
  contentType: ContentType;
  /** Plugin name that is currently running */
  pluginName?: string;
  /** Shared data bag for inter-plugin communication */
  data: Record<string, any>;
  /** Whether processing should be aborted */
  aborted: boolean;
  /** Abort reason if aborted */
  abortReason?: string;
  /** Accumulated warnings from plugins */
  warnings: string[];
  /** Metadata extracted or enriched by plugins */
  metadata: ContentMetadata;
}

/**
 * Event types for inter-plugin communication.
 */
export type PluginEventType =
  | 'plugin:registered'
  | 'plugin:unregistered'
  | 'plugin:enabled'
  | 'plugin:disabled'
  | 'plugin:error'
  | 'hook:before'
  | 'hook:after'
  | 'hook:error';

/**
 * Event listener callback type.
 */
export type PluginEventListener = (event: PluginEvent) => void;

/**
 * Event emitted by the plugin system.
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginName?: string;
  hook?: PluginHook;
  timestamp: number;
  data?: any;
  error?: Error;
}

/**
 * Result of validating a plugin definition.
 */
export interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Definition of a plugin that can be registered with the PluginManager.
 *
 * @example
 * ```typescript
 * const myPlugin: PluginDefinition = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   description: 'My custom content processing plugin',
 *   priority: PluginPriority.NORMAL,
 *   contentType: ['markdown', 'html'],
 *   hooks: {
 *     beforeParse(content: string) {
 *       return content.replace(/\t/g, '  ');
 *     },
 *     afterParse(parsed: ParsedContent) {
 *       parsed.metadata.customField = 'processed';
 *       return parsed;
 *     },
 *   },
 *   init() {
 *     console.log('Plugin initialized');
 *   },
 *   destroy() {
 *     console.log('Plugin cleaned up');
 *   },
 * };
 * ```
 */
export interface PluginDefinition {
  /** Unique plugin name (required) */
  name: string;
  /** Semantic version string (required) */
  version: string;
  /** Human-readable description of the plugin */
  description?: string;
  /**
   * Plugin execution priority. Higher values run first.
   * Use `PluginPriority` constants or custom numbers. Default: 0.
   */
  priority?: number;
  /** Whether the plugin is enabled upon registration. Default: true */
  enabled?: boolean;
  /** Content types this plugin applies to. Omit for all types. */
  contentType?: ContentType | ContentType[];
  /** Hook functions the plugin implements */
  hooks: Partial<Record<PluginHook, (...args: any[]) => any>>;
  /** Called once when the plugin manager initializes all plugins */
  init?: () => void | Promise<void>;
  /** Called once when the plugin manager destroys all plugins */
  destroy?: () => void | Promise<void>;
}

/**
 * Options for configuring the PluginManager.
 */
export interface PluginManagerOptions {
  /** Maximum number of plugins allowed. Default: 50 */
  maxPlugins?: number;
  /** Log hook executions and plugin lifecycle events to console */
  verbose?: boolean;
  /** Continue running remaining plugins when one throws an error. Default: true */
  continueOnError?: boolean;
  /** Maximum execution time per hook in ms. 0 = no limit. Default: 0 */
  hookTimeout?: number;
}

// ==========================================
// Plugin Manager
// ==========================================

/**
 * A comprehensive plugin manager supporting registration, lifecycle management,
 * prioritized hook execution, inter-plugin communication, and async support.
 *
 * @example
 * ```typescript
 * const manager = new PluginManager({ verbose: true, maxPlugins: 100 });
 *
 * manager.register(myPlugin);
 * manager.register(builtInPlugins.sanitizePlugin);
 *
 * await manager.initAll();
 *
 * const processed = await manager.runHook('beforeParse', rawContent, 'markdown');
 * // ... parse content ...
 * const enriched = await manager.runHook('afterParse', parsed, 'markdown');
 *
 * await manager.destroyAll();
 * ```
 */
export class PluginManager {
  private plugins: Map<string, PluginDefinition>;
  private hooks: Map<PluginHook, Set<string>>;
  private options: PluginManagerOptions;
  private eventListeners: Map<PluginEventType, Set<PluginEventListener>>;
  private initializedPlugins: Set<string>;
  private destroyed: boolean;

  constructor(options?: PluginManagerOptions) {
    this.plugins = new Map();
    this.hooks = new Map();
    this.eventListeners = new Map();
    this.initializedPlugins = new Set();
    this.destroyed = false;

    this.options = {
      maxPlugins: options?.maxPlugins ?? 50,
      verbose: options?.verbose ?? false,
      continueOnError: options?.continueOnError ?? true,
      hookTimeout: options?.hookTimeout ?? 0,
    };

    // Initialize hook sets
    const allHooks: PluginHook[] = [
      'beforeParse', 'afterParse', 'beforeRender', 'afterRender',
      'transformNode', 'extractData',
    ];
    for (const hook of allHooks) {
      this.hooks.set(hook, new Set());
    }

    this.log('PluginManager initialized with options:', this.options);
  }

  // ==========================================
  // Registration
  // ==========================================

  /**
   * Register a new plugin. Validates the plugin before registration.
   * Throws if validation fails, max plugins reached, or name already exists.
   */
  register(plugin: PluginDefinition): void {
    this.assertNotDestroyed();

    // Validate
    const validation = this.validatePlugin(plugin);
    if (!validation.valid) {
      throw new Error(
        `Plugin "${plugin.name}" validation failed:\n  ${validation.errors.join('\n  ')}`
      );
    }

    // Check max plugins
    if (this.plugins.size >= this.options.maxPlugins!) {
      throw new Error(
        `Maximum number of plugins (${this.options.maxPlugins}) reached. Cannot register "${plugin.name}".`
      );
    }

    // Check duplicate name
    if (this.plugins.has(plugin.name)) {
      throw new Error(
        `Plugin "${plugin.name}" is already registered. Unregister it first or use a different name.`
      );
    }

    // Store the plugin with defaults applied
    const finalizedPlugin: PluginDefinition = {
      ...plugin,
      priority: plugin.priority ?? PluginPriority.NORMAL,
      enabled: plugin.enabled !== false,
    };

    this.plugins.set(plugin.name, finalizedPlugin);

    // Register hook references
    for (const [hook, fn] of Object.entries(plugin.hooks)) {
      if (fn != null && this.hooks.has(hook as PluginHook)) {
        this.hooks.get(hook as PluginHook)!.add(plugin.name);
      }
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      this.log(`Plugin "${plugin.name}" warnings:`, validation.warnings);
    }

    this.log(`Plugin "${plugin.name}" v${plugin.version} registered (priority: ${finalizedPlugin.priority})`);
    this.emitEvent({
      type: 'plugin:registered',
      pluginName: plugin.name,
      timestamp: Date.now(),
      data: { version: plugin.version, priority: finalizedPlugin.priority },
    });
  }

  /**
   * Unregister a plugin by name. Calls its destroy method if it was initialized.
   * Returns true if the plugin was found and removed.
   */
  unregister(name: string): boolean {
    this.assertNotDestroyed();
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return false;
    }

    // Clean up if initialized
    if (this.initializedPlugins.has(name) && plugin.destroy) {
      try {
        const result = plugin.destroy();
        if (result instanceof Promise) {
          result.catch((err) => {
            this.log(`Error destroying plugin "${name}":`, err);
          });
        }
      } catch (err) {
        this.log(`Error destroying plugin "${name}":`, err);
      }
    }

    // Remove from all hook sets
    for (const hookSet of this.hooks.values()) {
      hookSet.delete(name);
    }

    this.initializedPlugins.delete(name);
    this.plugins.delete(name);

    this.log(`Plugin "${name}" unregistered`);
    this.emitEvent({
      type: 'plugin:unregistered',
      pluginName: name,
      timestamp: Date.now(),
    });

    return true;
  }

  // ==========================================
  // Query
  // ==========================================

  /** Get a plugin by name */
  getPlugin(name: string): PluginDefinition | undefined {
    return this.plugins.get(name);
  }

  /** Get all registered plugins, sorted by priority (highest first) */
  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values()).sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
  }

  /** Check if a plugin with the given name is registered */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /** Get the number of registered plugins */
  get pluginCount(): number {
    return this.plugins.size;
  }

  /** Get plugins filtered by content type */
  getPluginsForContentType(contentType: ContentType): PluginDefinition[] {
    return this.getAllPlugins().filter((plugin) => {
      if (!plugin.contentType) return true;
      const types = Array.isArray(plugin.contentType)
        ? plugin.contentType
        : [plugin.contentType];
      return types.includes(contentType);
    });
  }

  /** Get plugins that implement a specific hook */
  getPluginsForHook(hook: PluginHook): PluginDefinition[] {
    const names = this.hooks.get(hook) ?? new Set();
    return Array.from(names)
      .map((name) => this.plugins.get(name)!)
      .filter(Boolean)
      .filter((p) => p.enabled !== false)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  // ==========================================
  // Enable / Disable
  // ==========================================

  /** Enable a plugin by name. Returns true if found and was disabled. */
  enablePlugin(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;
    if (plugin.enabled) return false;

    plugin.enabled = true;
    this.log(`Plugin "${name}" enabled`);
    this.emitEvent({
      type: 'plugin:enabled',
      pluginName: name,
      timestamp: Date.now(),
    });
    return true;
  }

  /** Disable a plugin by name. Returns true if found and was enabled. */
  disablePlugin(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;
    if (!plugin.enabled) return false;

    plugin.enabled = false;
    this.log(`Plugin "${name}" disabled`);
    this.emitEvent({
      type: 'plugin:disabled',
      pluginName: name,
      timestamp: Date.now(),
    });
    return true;
  }

  // ==========================================
  // Hook Execution
  // ==========================================

  /**
   * Run all plugins that implement the given hook, in priority order.
   * The result of each plugin is passed to the next plugin (pipeline pattern).
   * If a plugin returns undefined/null, the previous value is passed through.
   *
   * @param hook - The hook to execute
   * @param context - The content/context to process
   * @param contentType - Optional content type to filter applicable plugins
   * @returns The processed content after all plugins have run
   */
  async runHook<T>(hook: PluginHook, context: T, contentType?: ContentType): Promise<T> {
    this.assertNotDestroyed();

    this.emitEvent({
      type: 'hook:before',
      hook,
      timestamp: Date.now(),
      data: { contentType },
    });

    // Build hook context
    const hookContext: PluginHookContext<T> = {
      content: context,
      contentType: contentType ?? 'text',
      data: {},
      aborted: false,
      warnings: [],
      metadata: {},
    };

    // Get applicable plugins sorted by priority
    let applicablePlugins = this.getPluginsForHook(hook);

    // Filter by content type if provided
    if (contentType) {
      applicablePlugins = applicablePlugins.filter((plugin) => {
        if (!plugin.contentType) return true;
        const types = Array.isArray(plugin.contentType)
          ? plugin.contentType
          : [plugin.contentType];
        return types.includes(contentType);
      });
    }

    if (applicablePlugins.length === 0) {
      this.log(`No plugins registered for hook "${hook}"${contentType ? ` (contentType: ${contentType})` : ''}`);
      return context;
    }

    this.log(
      `Running hook "${hook}" with ${applicablePlugins.length} plugin(s): ` +
        applicablePlugins.map((p) => `${p.name}(${p.priority})`).join(', ')
    );

    let result: T = context;

    for (const plugin of applicablePlugins) {
      const hookFn = plugin.hooks[hook];
      if (!hookFn) continue;

      try {
        // Execute with optional timeout
        const pluginResult = this.options.hookTimeout! > 0
          ? await this.executeWithTimeout(hookFn, result, plugin, this.options.hookTimeout!)
          : await Promise.resolve(hookFn(result, hookContext));

        // Update context content reference
        hookContext.pluginName = plugin.name;

        // Only update result if the plugin returned a non-null/non-undefined value
        if (pluginResult !== undefined && pluginResult !== null) {
          result = pluginResult as T;
          hookContext.content = result;
        }

        // Check if the plugin signalled abort
        if (hookContext.aborted) {
          this.log(
            `Plugin "${plugin.name}" aborted hook "${hook}". Reason: ${hookContext.abortReason ?? 'unknown'}`
          );
          break;
        }

        this.log(`Plugin "${plugin.name}" completed hook "${hook}" successfully`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.log(`Plugin "${plugin.name}" error on hook "${hook}":`, err.message);

        this.emitEvent({
          type: 'plugin:error',
          pluginName: plugin.name,
          hook,
          timestamp: Date.now(),
          error: err,
        });

        this.emitEvent({
          type: 'hook:error',
          hook,
          timestamp: Date.now(),
          data: { pluginName: plugin.name },
          error: err,
        });

        if (!this.options.continueOnError) {
          throw err;
        }

        hookContext.warnings.push(`Plugin "${plugin.name}" failed on "${hook}": ${err.message}`);
      }
    }

    // Copy any data/warnings from hook context to result if applicable
    if (result && typeof result === 'object' && 'metadata' in (result as any)) {
      const enriched = result as any;
      if (hookContext.metadata && Object.keys(hookContext.metadata).length > 0) {
        enriched.metadata = { ...enriched.metadata, ...hookContext.metadata };
      }
    }

    this.emitEvent({
      type: 'hook:after',
      hook,
      timestamp: Date.now(),
      data: {
        contentType,
        pluginCount: applicablePlugins.length,
        warnings: hookContext.warnings,
        aborted: hookContext.aborted,
      },
    });

    return result;
  }

  // ==========================================
  // Lifecycle
  // ==========================================

  /**
   * Initialize all registered plugins in priority order.
   * Calls each plugin's `init()` method if defined.
   */
  async initAll(): Promise<void> {
    this.assertNotDestroyed();
    this.log('Initializing all plugins...');

    const plugins = this.getAllPlugins();
    const errors: Array<{ name: string; error: Error }> = [];

    for (const plugin of plugins) {
      if (!plugin.enabled || !plugin.init) continue;

      try {
        await Promise.resolve(plugin.init());
        this.initializedPlugins.add(plugin.name);
        this.log(`Plugin "${plugin.name}" initialized`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.log(`Plugin "${plugin.name}" init error:`, err.message);
        errors.push({ name: plugin.name, error: err });
        this.emitEvent({
          type: 'plugin:error',
          pluginName: plugin.name,
          timestamp: Date.now(),
          error: err,
        });

        if (!this.options.continueOnError) {
          throw err;
        }
      }
    }

    if (errors.length > 0 && this.options.verbose) {
      console.warn(
        `[PluginManager] ${errors.length} plugin(s) failed to initialize: ` +
          errors.map((e) => `${e.name}: ${e.error.message}`).join(', ')
      );
    }

    this.log(`Initialization complete. ${this.initializedPlugins.size} plugin(s) ready.`);
  }

  /**
   * Destroy all registered plugins in reverse priority order.
   * Calls each plugin's `destroy()` method if it was initialized.
   */
  async destroyAll(): Promise<void> {
    this.log('Destroying all plugins...');

    // Destroy in reverse priority order (lowest priority first)
    const plugins = this.getAllPlugins().reverse();
    const errors: Array<{ name: string; error: Error }> = [];

    for (const plugin of plugins) {
      if (!this.initializedPlugins.has(plugin.name) || !plugin.destroy) continue;

      try {
        await Promise.resolve(plugin.destroy());
        this.initializedPlugins.delete(plugin.name);
        this.log(`Plugin "${plugin.name}" destroyed`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.log(`Plugin "${plugin.name}" destroy error:`, err.message);
        errors.push({ name: plugin.name, error: err });
      }
    }

    this.destroyed = true;

    if (errors.length > 0 && this.options.verbose) {
      console.warn(
        `[PluginManager] ${errors.length} plugin(s) failed to destroy: ` +
          errors.map((e) => `${e.name}: ${e.error.message}`).join(', ')
      );
    }

    this.log('All plugins destroyed. PluginManager is now inactive.');
  }

  /** Remove all plugins without destroying them. Use destroyAll() for clean teardown. */
  clear(): void {
    this.plugins.clear();
    this.initializedPlugins.clear();
    for (const hookSet of this.hooks.values()) {
      hookSet.clear();
    }
    this.log('All plugins cleared');
  }

  // ==========================================
  // Event System (inter-plugin communication)
  // ==========================================

  /**
   * Subscribe to plugin system events.
   * Returns an unsubscribe function.
   */
  on(event: PluginEventType, listener: PluginEventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);

    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  /**
   * Subscribe to a plugin system event for one invocation only.
   * Automatically unsubscribes after the first event.
   */
  once(event: PluginEventType, listener: PluginEventListener): () => void {
    const wrapper: PluginEventListener = (evt) => {
      unsubscribe();
      listener(evt);
    };
    const unsubscribe = this.on(event, wrapper);
    return unsubscribe;
  }

  /** Remove all event listeners, or all listeners for a specific event type */
  off(event?: PluginEventType): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  private emitEvent(event: PluginEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (!listeners || listeners.size === 0) return;

    for (const listener of listeners) {
      try {
        listener(event);
      } catch (err) {
        // Event listener errors should not break the plugin system
        if (this.options.verbose) {
          console.warn(
            `[PluginManager] Event listener error for "${event.type}":`,
            err
          );
        }
      }
    }
  }

  // ==========================================
  // Validation
  // ==========================================

  /**
   * Validate a plugin definition before registration.
   * Checks for required fields, valid content types, valid hooks, etc.
   */
  validatePlugin(plugin: PluginDefinition): PluginValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Name validation
    if (!plugin.name || typeof plugin.name !== 'string') {
      errors.push('Plugin must have a non-empty "name" string.');
    } else if (plugin.name.length > 100) {
      errors.push('Plugin name must be 100 characters or less.');
    } else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(plugin.name)) {
      errors.push(
        'Plugin name must start with a letter and contain only letters, numbers, hyphens, and underscores.'
      );
    }

    // Version validation
    if (!plugin.version || typeof plugin.version !== 'string') {
      errors.push('Plugin must have a non-empty "version" string.');
    } else if (!/^\d+\.\d+\.\d+/.test(plugin.version)) {
      warnings.push(
        `Version "${plugin.version}" does not follow semver (e.g., "1.0.0").`
      );
    }

    // Hooks validation
    if (!plugin.hooks || typeof plugin.hooks !== 'object' || Object.keys(plugin.hooks).length === 0) {
      warnings.push('Plugin has no hooks defined. It will not participate in any lifecycle events.');
    } else {
      const validHooks: string[] = [
        'beforeParse', 'afterParse', 'beforeRender', 'afterRender',
        'transformNode', 'extractData',
      ];
      for (const hookName of Object.keys(plugin.hooks)) {
        if (!validHooks.includes(hookName)) {
          errors.push(`Unknown hook "${hookName}". Valid hooks: ${validHooks.join(', ')}`);
        } else if (typeof plugin.hooks[hookName as PluginHook] !== 'function') {
          errors.push(`Hook "${hookName}" must be a function.`);
        }
      }
    }

    // Content type validation
    if (plugin.contentType !== undefined) {
      const validTypes: string[] = [
        'html', 'html5', 'json', 'xml', 'php', 'markdown', 'text', 'code',
        'css', 'javascript', 'typescript', 'yaml',
      ];
      const types = Array.isArray(plugin.contentType)
        ? plugin.contentType
        : [plugin.contentType];

      for (const type of types) {
        if (!validTypes.includes(type)) {
          errors.push(`Invalid content type "${type}". Valid types: ${validTypes.join(', ')}`);
        }
      }
    }

    // Priority validation
    if (plugin.priority !== undefined && typeof plugin.priority !== 'number') {
      errors.push('Priority must be a number if specified.');
    }

    // Description warning
    if (!plugin.description) {
      warnings.push('Plugin has no description. Adding one is recommended for discoverability.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ==========================================
  // Utilities
  // ==========================================

  /** Execute a function with a timeout. Throws on timeout. */
  private async executeWithTimeout<T>(
    fn: (...args: any[]) => any,
    arg: T,
    plugin: PluginDefinition,
    timeoutMs: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(
          `Plugin "${plugin.name}" hook timed out after ${timeoutMs}ms`
        ));
      }, timeoutMs);

      Promise.resolve(fn(arg))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /** Assert the manager hasn't been destroyed */
  private assertNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error(
        'PluginManager has been destroyed. Create a new instance to continue.'
      );
    }
  }

  /** Conditional logging */
  private log(...args: any[]): void {
    if (this.options.verbose) {
      console.log('[PluginManager]', ...args);
    }
  }
}
