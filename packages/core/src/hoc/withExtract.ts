import React, { useState, useCallback } from 'react';
import {
  ContentType,
  ExtractedData,
  ExtractInjectedProps,
  UseExtractOptions,
} from '../types';
import { useExtract } from '../hooks/useExtract';
import { detectContentType } from '../utils/transform';

export interface WithExtractOptions extends UseExtractOptions {
  contentType?: ContentType;
  autoExtract?: boolean;
  contentPropName?: string;
}

export function withExtract<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  hocOptions?: WithExtractOptions
): React.ComponentType<P & ExtractInjectedProps> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithExtract = React.forwardRef<any, P & ExtractInjectedProps>(
    (props, ref) => {
      const contentPropName = hocOptions?.contentPropName || 'content';
      const rawContent = (props as any)[contentPropName] as string | undefined;

      const extractOptions: UseExtractOptions = {
        enabled: hocOptions?.autoExtract !== false,
        extractors: hocOptions?.extractors,
        options: hocOptions?.options,
        onError: hocOptions?.onError,
      };

      const {
        extracted: extractedData,
        extract: extractData,
        isLoading,
        error,
      } = useExtract(extractOptions);

      // Auto-extract if content is provided
      React.useEffect(() => {
        if (rawContent && hocOptions?.autoExtract !== false) {
          const type = hocOptions?.contentType || detectContentType(rawContent);
          extractData(rawContent);
        }
      }, [rawContent]);

      const handleExtractData = useCallback(
        (content: string, type?: ContentType) => {
          extractData(content);
        },
        [extractData]
      );

      const injectedProps: ExtractInjectedProps = {
        extractedData,
        extractData: handleExtractData,
        isExtracting: isLoading,
        extractError: error,
      };

      return React.createElement(WrappedComponent, {
        ...props,
        ...injectedProps,
        ref,
      } as any);
    }
  );

  ComponentWithExtract.displayName = `withExtract(${displayName})`;
  return ComponentWithExtract as any;
}

export default withExtract;
