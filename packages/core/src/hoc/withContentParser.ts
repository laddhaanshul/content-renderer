import React, { useState, useCallback } from 'react';
import {
  ContentType,
  ParsedContent,
  ContentParserInjectedProps,
  UseContentParserOptions,
} from '../types';
import { useContentParser } from '../hooks/useContentParser';
import { detectContentType } from '../utils/transform';

export interface WithContentParserOptions extends UseContentParserOptions {
  contentType?: ContentType;
  autoParse?: boolean;
  contentPropName?: string;
}

export function withContentParser<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  hocOptions?: WithContentParserOptions
): React.ComponentType<P & ContentParserInjectedProps> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithParser = React.forwardRef<any, P & ContentParserInjectedProps>(
    (props, ref) => {
      const contentPropName = hocOptions?.contentPropName || 'content';
      const rawContent = (props as any)[contentPropName] as string | undefined;

      const parserOptions: UseContentParserOptions = {
        contentType: hocOptions?.contentType,
        enabled: hocOptions?.autoParse !== false,
        onError: hocOptions?.onError,
        onSuccess: hocOptions?.onSuccess,
        transform: hocOptions?.transform,
      };

      const {
        parsed: parsedContent,
        parse: parseContent,
        isLoading,
        error,
      } = useContentParser(parserOptions);

      // Auto-parse if content is provided
      React.useEffect(() => {
        if (rawContent && hocOptions?.autoParse !== false) {
          const type = hocOptions?.contentType || detectContentType(rawContent);
          parseContent(rawContent);
        }
      }, [rawContent]);

      const handleParseContent = useCallback(
        (content: string, type?: ContentType) => {
          if (type) {
            const opts: UseContentParserOptions = {
              ...parserOptions,
              contentType: type,
            };
            // Create a simple parse call by using the hook's parse
            parseContent(content);
          } else {
            parseContent(content);
          }
        },
        [parseContent, parserOptions]
      );

      const injectedProps: ContentParserInjectedProps = {
        parsedContent,
        parseContent: handleParseContent,
        isParsing: isLoading,
        parseError: error,
      };

      return React.createElement(WrappedComponent, {
        ...props,
        ...injectedProps,
        ref,
      } as any);
    }
  );

  ComponentWithParser.displayName = `withContentParser(${displayName})`;
  return ComponentWithParser as any;
}

export default withContentParser;
