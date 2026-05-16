import React, { createContext, useContext } from 'react';
import { ContentRendererConfig, ContentType } from '../types';
import { lightTheme } from '../themes';

const defaultConfig: ContentRendererConfig = {
  theme: lightTheme,
  defaultContentType: 'html',
  maxRenderDepth: 100,
  sanitizeHTML: true,
  allowedTags: undefined,
  allowedAttributes: undefined,
  linkHandler: undefined,
  imageHandler: undefined,
  errorHandler: undefined,
  loadingFallback: undefined,
  customParsers: {},
  plugins: [],
};

const ContentRendererConfigContext = createContext<ContentRendererConfig>(defaultConfig);

function deepMergeConfig(
  base: ContentRendererConfig,
  override: Partial<ContentRendererConfig>
): ContentRendererConfig {
  const result: ContentRendererConfig = { ...base };

  for (const key of Object.keys(override) as Array<keyof ContentRendererConfig>) {
    const overrideValue = override[key];
    if (overrideValue !== undefined) {
      if (
        key === 'theme' &&
        overrideValue &&
        typeof overrideValue === 'object' &&
        base.theme &&
        typeof base.theme === 'object'
      ) {
        result.theme = deepMergeObject(base.theme, overrideValue as any);
      } else if (
        key === 'allowedAttributes' &&
        overrideValue &&
        typeof overrideValue === 'object' &&
        base.allowedAttributes &&
        typeof base.allowedAttributes === 'object'
      ) {
        result.allowedAttributes = { ...base.allowedAttributes, ...overrideValue } as any;
      } else if (
        key === 'customParsers' &&
        overrideValue &&
        typeof overrideValue === 'object' &&
        base.customParsers &&
        typeof base.customParsers === 'object'
      ) {
        result.customParsers = { ...base.customParsers, ...overrideValue } as any;
      } else if (
        key === 'plugins' &&
        Array.isArray(overrideValue)
      ) {
        result.plugins = [...(base.plugins || []), ...overrideValue] as any;
      } else {
        (result as any)[key] = overrideValue;
      }
    }
  }

  return result;
}

function deepMergeObject<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      (result as any)[key] = deepMergeObject(targetValue, sourceValue as any);
    } else if (sourceValue !== undefined) {
      (result as any)[key] = sourceValue;
    }
  }
  return result;
}

interface ContentParserProviderProps {
  config: Partial<ContentRendererConfig>;
  children: React.ReactNode;
}

export function ContentParserProvider({
  config,
  children,
}: ContentParserProviderProps): JSX.Element {
  const mergedConfig = deepMergeConfig(defaultConfig, config);

  return React.createElement(
    ContentRendererConfigContext.Provider,
    { value: mergedConfig },
    children
  );
}

export function useContentRendererConfig(): ContentRendererConfig {
  return useContext(ContentRendererConfigContext);
}

export { ContentRendererConfigContext };
export default ContentParserProvider;
