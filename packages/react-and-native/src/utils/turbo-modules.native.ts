// ==========================================
// React Native New Architecture Support
// Fabric + TurboModules codegen specs and bridge compatibility
// ==========================================

// ------------------------------------------
// Types
// ------------------------------------------

/** Result from native parseContent call */
export interface ParsedContent {
  type: string;
  content: string;
  parsed: string;    // JSON-serialized parsed structure
  metadata: string;  // JSON-serialized metadata
  errors: string;    // JSON-serialized error array
  warnings: string;  // JSON-serialized warning array
}

/** Result from native validateContent call */
export interface ValidationResult {
  valid: boolean;
  errors: string;    // JSON-serialized error array
  warnings: string;  // JSON-serialized warning array
}

/** Codegen spec for a Fabric-backed native component */
export interface ContentRendererNativeComponentSpec {
  name: string;
  props: {
    content: string;
    contentType: string;
    sanitize: boolean;
    maxDepth: number;
    theme: string; // JSON-serialized theme object
  };
}

// ------------------------------------------
// TurboModule Spec
// ------------------------------------------

/**
 * TurboModule Spec for content-renderer native operations.
 *
 * In the React Native New Architecture, this spec is consumed by
 * codegen to produce native (Java/Kotlin/ObjC/Swift) interfaces.
 *
 * Usage:
 * ```ts
 * import { createTurboModuleProxy } from './turbo-modules';
 * const ContentRendererModule = createTurboModuleProxy();
 * const result = await ContentRendererModule.parseContent('<h1>Hello</h1>', 'html');
 * ```
 */
export interface Spec {
  /** Parse raw content string into a structured representation. */
  parseContent(content: string, type: string): Promise<ParsedContent>;

  /** Compute resolved CSS styles for a given HTML node against provided rules. */
  computeStyles(htmlNode: string, cssRules: string, options: string): Promise<string>;

  /** Extract structured data (links, images, headings, etc.) from content. */
  extractData(content: string, type: string, extractors: string): Promise<string>;

  /** Validate content and return errors/warnings. */
  validateContent(content: string, type: string): Promise<ValidationResult>;
}

// ------------------------------------------
// Architecture Info
// ------------------------------------------

export interface ArchitectureInfo {
  isNewArch: boolean;
  fabric: boolean;
  turboModules: boolean;
  bridgeless: boolean;
}

// ------------------------------------------
// TurboModule Proxy Factory
// ------------------------------------------

/**
 * Create a TurboModule proxy that calls into the native ContentRendererModule.
 *
 * This uses the same mechanism as `TurboModuleRegistry.getEnforcing<Spec>()`,
 * but wraps the return in a safe fallback when the native module is not linked
 * (e.g., during development without native code or in Expo Go).
 */
export function createTurboModuleProxy(): Spec {
  // Attempt to import from react-native at runtime.
  // We wrap in try/catch so this module can still be loaded in environments
  // where react-native is not available (e.g., unit tests in Node).
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native');
    const TurboModuleRegistry =
      rn.TurboModuleRegistry ||
      rn.default?.TurboModuleRegistry;

    if (TurboModuleRegistry) {
      const module = (TurboModuleRegistry as any).getEnforcing('ContentRendererModule') as Spec;
      if (module) {
        return module;
      }
    }
  } catch {
    // react-native not available; fall through to JS polyfill
  }

  // Fallback: pure JS implementation when native module is unavailable.
  // This ensures the module is usable everywhere, even without native code.
  return createJSPolyfill();
}

// ------------------------------------------
// JS Polyfill (fallback when native module is not linked)
// ------------------------------------------

function createJSPolyfill(): Spec {
  return {
    async parseContent(content: string, type: string): Promise<ParsedContent> {
      // Basic content analysis without a full parser
      const metadata = JSON.stringify({
        size: content.length,
        lineCount: content.split('\n').length,
        type,
      });
      return {
        type,
        content,
        parsed: JSON.stringify({ raw: content, type }),
        metadata,
        errors: JSON.stringify([]),
        warnings: JSON.stringify([]),
      };
    },

    async computeStyles(htmlNode: string, cssRules: string, options: string): Promise<string> {
      // Parse options
      let opts: Record<string, unknown> = {};
      try {
        opts = JSON.parse(options);
      } catch {
        // ignore
      }
      return JSON.stringify({
        node: htmlNode,
        rules: cssRules,
        options: opts,
        computed: {},
      });
    },

    async extractData(content: string, type: string, extractors: string): Promise<string> {
      const extracted: Record<string, unknown> = {
        text: content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        links: [],
        images: [],
        headings: [],
      };

      // Simple regex extraction
      const linkRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi;
      let match: RegExpExecArray | null;
      const links: string[] = [];
      while ((match = linkRegex.exec(content)) !== null) {
        links.push(match[1]);
      }
      extracted.links = links;

      const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
      const headings: any[] = [];
      while ((match = headingRegex.exec(content)) !== null) {
        headings.push({ level: parseInt(match[1], 10), text: match[2].replace(/<[^>]+>/g, '').trim() });
      }
      extracted.headings = headings;

      return JSON.stringify(extracted);
    },

    async validateContent(content: string, type: string): Promise<ValidationResult> {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!content || content.trim().length === 0) {
        errors.push('Content is empty');
      }

      // Type-specific validation
      switch (type) {
        case 'html': {
          // Check for balanced tags
          const openTags: string[] = [];
          const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g;
          let m: RegExpExecArray | null;
          while ((m = tagRegex.exec(content)) !== null) {
            if (m[0].startsWith('</')) {
              const idx = openTags.lastIndexOf(m[1].toLowerCase());
              if (idx !== -1) openTags.splice(idx);
            } else if (!m[0].endsWith('/>')) {
              openTags.push(m[1].toLowerCase());
            }
          }
          if (openTags.length > 0) {
            warnings.push(`Unclosed tags: ${openTags.join(', ')}`);
          }
          break;
        }
        case 'json': {
          try {
            JSON.parse(content);
          } catch (e: any) {
            errors.push(e.message || 'Invalid JSON');
          }
          break;
        }
        case 'css': {
          let braces = 0;
          for (const ch of content) {
            if (ch === '{') braces++;
            if (ch === '}') braces--;
          }
          if (braces !== 0) {
            errors.push(`Unbalanced braces (${braces > 0 ? 'unclosed' : 'extra closing'})`);
          }
          break;
        }
        default:
          break;
      }

      return {
        valid: errors.length === 0,
        errors: JSON.stringify(errors),
        warnings: JSON.stringify(warnings),
      };
    },
  };
}

// ------------------------------------------
// Fabric Renderer Registry
// ------------------------------------------

/** Registry of Fabric-backed native component specs */
const fabricRegistry = new Map<string, ContentRendererNativeComponentSpec>();

/**
 * Get all registered Fabric renderer specs.
 */
export function getFabricRenderers(): Map<string, ContentRendererNativeComponentSpec> {
  return new Map(fabricRegistry);
}

/**
 * Register a Fabric renderer component spec.
 * This is called during app initialization to register native view managers
 * that use the Fabric renderer.
 */
export function registerFabricRenderer(spec: ContentRendererNativeComponentSpec): void {
  fabricRegistry.set(spec.name, spec);
}

/**
 * Check whether the Fabric renderer is enabled in the current environment.
 */
export function isFabricEnabled(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native');
    // In the New Architecture, global.__RCTProfileIsProfiling or
    // NativeFeatureFlags can indicate Fabric. For safety we check
    // the Platform constants.
    const platformConstants = rn.Platform?.constants;
    if (platformConstants) {
      // React Native 0.74+ exposes `fabric` flag
      if ('fabric' in platformConstants) {
        return !!(platformConstants as Record<string, unknown>).fabric;
      }
      // On older versions, the New Architecture is indicated by
      // the presence of `reactNativeVersion` with `newArchEnabled`.
      if (platformConstants.reactNativeVersion?.newArchEnabled) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Get information about the current React Native architecture.
 */
export function getArchitectureInfo(): ArchitectureInfo {
  let isNewArch = false;
  let turboModules = false;
  let bridgeless = false;
  let fabric = false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native');
    const platformConstants = rn.Platform?.constants;

    if (platformConstants) {
      isNewArch = !!(platformConstants as Record<string, unknown>).newArchEnabled;
      fabric = isFabricEnabled();
      turboModules = isNewArch; // TurboModules are part of the New Architecture
      bridgeless = isNewArch;  // Bridgeless mode is part of the New Architecture
    }
  } catch {
    // Not in a React Native environment
  }

  return { isNewArch, fabric, turboModules, bridgeless };
}

// ------------------------------------------
// Native Component Factory
// ------------------------------------------

/**
 * Create a React Native component backed by a Fabric native view.
 *
 * In the New Architecture, native components are described by codegen specs
 * and rendered through Fabric. This factory produces a React component that
 * wraps a native view registered via `registerFabricRenderer`.
 *
 * @param spec - The Fabric component spec describing props
 * @returns A React component that renders the native view
 */
export function createContentRendererComponent(spec: ContentRendererNativeComponentSpec): any {
  // Ensure the spec is registered
  registerFabricRenderer(spec);

  // Attempt to use requireNativeComponent (Fabric-compatible)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native');
    const requireNativeComponent = rn.requireNativeComponent ||
      rn.default?.requireNativeComponent;

    if (requireNativeComponent) {
      const NativeComponent = requireNativeComponent(spec.name);

      // Return a lightweight wrapper component
      const React = require('react');

      const ContentRendererNative = React.forwardRef(function ContentRendererNative(
        props: Record<string, unknown>,
        ref: React.Ref<unknown>
      ) {
        return React.createElement(NativeComponent, {
          ...props,
          ref,
          // Serialize theme if it's an object
          theme: typeof props.theme === 'object' ? JSON.stringify(props.theme) : props.theme,
        });
      });

      ContentRendererNative.displayName = `ContentRenderer(${spec.name})`;
      return ContentRendererNative;
    }
  } catch {
    // Fallback below
  }

  // Fallback: return a simple function component that renders a placeholder
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react');
    const { View, Text } = require('react-native');

    const FallbackComponent = React.forwardRef(function FallbackContentRenderer(
      props: Record<string, unknown>,
      ref: React.Ref<unknown>
    ) {
      const { content, contentType, sanitize, maxDepth, ...rest } = props;
      return React.createElement(
        View,
        { ...rest, ref, testID: 'content-renderer-fallback' },
        React.createElement(
          Text,
          null,
          `[ContentRenderer: ${spec.name}] ${contentType || 'unknown'} (${(content as string)?.length || 0} bytes)`
        )
      );
    });

    FallbackComponent.displayName = `ContentRendererFallback(${spec.name})`;
    return FallbackComponent;
  } catch {
    // Not in a React environment at all
    return () => null;
  }
}

// ------------------------------------------
// Legacy Bridge Compatibility
// ------------------------------------------

interface BridgeModule {
  parseContent: (content: string, type: string) => Promise<unknown>;
  computeStyles: (htmlNode: string, cssRules: string) => Promise<unknown>;
}

/**
 * Create a compatibility layer for the legacy React Native bridge.
 *
 * In the Old Architecture, communication between JS and native happens through
 * the async bridge using `NativeModules`. This layer provides an API identical
 * to the TurboModule spec but routes calls through the legacy bridge when the
 * New Architecture is not available.
 *
 * @returns An object with parseContent and computeStyles methods
 */
export function createBridgeCompatLayer(): {
  parseContent: (content: string, type: string) => Promise<any>;
  computeStyles: (htmlNode: string, cssRules: string) => Promise<any>;
} {
  let nativeModule: BridgeModule | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native');
    const NativeModules = rn.NativeModules || rn.default?.NativeModules;

    if (NativeModules) {
      nativeModule = NativeModules.ContentRendererModule || null;
    }
  } catch {
    // Not in RN environment
  }

  if (nativeModule) {
    return {
      parseContent: (content: string, type: string) =>
        nativeModule!.parseContent(content, type),

      computeStyles: (htmlNode: string, cssRules: string) =>
        nativeModule!.computeStyles(htmlNode, cssRules),
    };
  }

  // Full JS fallback
  const polyfill = createJSPolyfill();
  return {
    parseContent: (content: string, type: string) =>
      polyfill.parseContent(content, type),

    computeStyles: (htmlNode: string, cssRules: string) =>
      polyfill.computeStyles(htmlNode, cssRules, '{}'),
  };
}

// ------------------------------------------
// Codegen Spec Export (for codegen consumption)
// ------------------------------------------

/**
 * Codegen-compatible spec export.
 *
 * When running the React Native codegen CLI, this object is read to generate
 * the native (Java/Kotlin for Android, ObjC/Swift for iOS) interface files.
 *
 * In a real setup you would use the `codegenNativeComponent` or
 * `TurboModuleRegistry.spec` approach. This export is provided for
 * documentation and custom codegen pipelines.
 */
export const CodegenSpec = {
  moduleName: 'ContentRendererModule',
  NativeComponentName: 'ContentRendererView',
  interfaceOnly: false,
  jsName: 'ContentRendererModule',
  methods: {
    parseContent: {
      name: 'parseContent',
      returnType: 'Promise',
      argTypes: ['string', 'string'],
    },
    computeStyles: {
      name: 'computeStyles',
      returnType: 'Promise',
      argTypes: ['string', 'string', 'string'],
    },
    extractData: {
      name: 'extractData',
      returnType: 'Promise',
      argTypes: ['string', 'string', 'string'],
    },
    validateContent: {
      name: 'validateContent',
      returnType: 'Promise',
      argTypes: ['string', 'string'],
    },
  },
} as const;

/**
 * Fabric Codegen spec for the native view component.
 */
export const FabricCodegenSpec: ContentRendererNativeComponentSpec = {
  name: 'ContentRendererView',
  props: {
    content: 'string',
    contentType: 'string',
    sanitize: true,
    maxDepth: 0,
    theme: 'string',
  },
};

// ------------------------------------------
// Built-in Fabric Renderers
// ------------------------------------------

// Register the default HTML renderer spec
registerFabricRenderer({
  name: 'ContentRendererHTMLView',
  props: {
    content: '',
    contentType: 'html',
    sanitize: true,
    maxDepth: 64,
    theme: '{}',
  },
});

// Register the default Markdown renderer spec
registerFabricRenderer({
  name: 'ContentRendererMarkdownView',
  props: {
    content: '',
    contentType: 'markdown',
    sanitize: true,
    maxDepth: 32,
    theme: '{}',
  },
});

// Register the default JSON viewer spec
registerFabricRenderer({
  name: 'ContentRendererJSONView',
  props: {
    content: '',
    contentType: 'json',
    sanitize: false,
    maxDepth: 16,
    theme: '{}',
  },
});
