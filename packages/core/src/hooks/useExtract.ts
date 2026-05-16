import { useState, useCallback } from 'react';
import { UseExtractOptions, UseExtractReturn, ExtractedData, ContentType } from '../types';
import { extractAll } from '../utils/extract';
import { detectContentType } from '../utils/transform';

const emptyExtractedData: ExtractedData = {
  text: '',
  links: [],
  images: [],
  scripts: [],
  styles: [],
  meta: [],
  headings: [],
  tables: [],
  forms: [],
  lists: [],
  codeBlocks: [],
  comments: [],
  custom: {},
};

export function useExtract(options?: UseExtractOptions): UseExtractReturn {
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const extract = useCallback(
    (content: string, contentType?: ContentType) => {
      if (options?.enabled === false) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const detectedType = contentType || detectContentType(content);
        const result = extractAll(content, detectedType, options?.options);

        // Filter extractors if specified
        if (options?.extractors && options.extractors.length > 0) {
          const filtered: ExtractedData = { ...emptyExtractedData };
          for (const key of options.extractors) {
            if (key in result) {
              (filtered as any)[key] = (result as any)[key];
            }
          }
          setExtracted(filtered);
        } else {
          setExtracted(result);
        }
      } catch (err: any) {
        setIsError(true);
        setError(err);
        setExtracted(null);
        options?.onError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setExtracted(null);
    setIsLoading(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    extracted,
    isLoading,
    isError,
    error,
    extract,
    reset,
  };
}

export default useExtract;
