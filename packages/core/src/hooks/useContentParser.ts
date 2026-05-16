import { useState, useCallback } from 'react';
import {
  UseContentParserOptions,
  UseContentParserReturn,
  ParsedContent,
  ContentType,
  ParseError,
  ParseWarning,
  ContentMetadata,
} from '../types';
import { HTMLParser } from '../parsers/html-parser';
import { JSONParser } from '../parsers/json-parser';
import { XMLParser } from '../parsers/xml-parser';
import { PHPParser } from '../parsers/php-parser';
import { MarkdownParser } from '../parsers/markdown-parser';
import { CSSParser } from '../parsers/css-parser';
import { detectContentType } from '../utils/transform';

const htmlParser = new HTMLParser();
const jsonParser = new JSONParser();
const xmlParser = new XMLParser();
const phpParser = new PHPParser();
const markdownParser = new MarkdownParser();
const cssParser = new CSSParser();

function parseContent(content: string, contentType: ContentType): ParsedContent {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  try {
    switch (contentType) {
      case 'html':
      case 'html5': {
        const doc = htmlParser.parse(content);
        return {
          type: contentType,
          content,
          parsed: doc,
          metadata: doc.metadata,
          errors: [],
          warnings: [],
        };
      }
      case 'json': {
        const doc = jsonParser.parse(content);
        return {
          type: contentType,
          content,
          parsed: doc,
          metadata: doc.metadata,
          errors: [],
          warnings: [],
        };
      }
      case 'xml': {
        const doc = xmlParser.parse(content);
        return {
          type: contentType,
          content,
          parsed: doc,
          metadata: doc.metadata,
          errors: [],
          warnings: [],
        };
      }
      case 'php': {
        const doc = phpParser.parse(content);
        return {
          type: contentType,
          content,
          parsed: doc,
          metadata: doc.metadata,
          errors: [],
          warnings: [],
        };
      }
      case 'markdown': {
        const doc = markdownParser.parse(content);
        return {
          type: contentType,
          content,
          parsed: doc,
          metadata: doc.metadata,
          errors: [],
          warnings: [],
        };
      }
      case 'css': {
        const doc = cssParser.parse(content);
        return {
          type: contentType,
          content,
          parsed: doc,
          metadata: doc.metadata,
          errors: [],
          warnings: [],
        };
      }
      default: {
        return {
          type: contentType,
          content,
          parsed: content,
          metadata: {
            size: content.length,
            lineCount: content.split('\n').length,
          },
          errors: [],
          warnings: [],
        };
      }
    }
  } catch (error: any) {
    return {
      type: contentType,
      content,
      parsed: null,
      metadata: {},
      errors: [
        {
          message: error.message || 'Failed to parse content',
          severity: 'error',
          code: 'PARSE_ERROR',
        },
      ],
      warnings,
    };
  }
}

export function useContentParser(options?: UseContentParserOptions): UseContentParserReturn {
  const [parsed, setParsed] = useState<ParsedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastContent, setLastContent] = useState<string>('');

  const parse = useCallback(
    (content: string) => {
      if (options?.enabled === false) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);
      setLastContent(content);

      try {
        const contentType =
          options?.contentType || detectContentType(content);
        const result = parseContent(content, contentType);

        setParsed(result);

        if (result.errors.length > 0) {
          setIsError(true);
          setError(new Error(result.errors.map((e) => e.message).join(', ')));
          options?.onError?.(new Error(result.errors.map((e) => e.message).join(', ')));
        } else {
          options?.onSuccess?.(result);
        }
      } catch (err: any) {
        setIsError(true);
        setError(err);
        setParsed(null);
        options?.onError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setParsed(null);
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setLastContent('');
  }, []);

  const refetch = useCallback(() => {
    if (lastContent) {
      parse(lastContent);
    }
  }, [lastContent, parse]);

  const data = parsed ? (options?.transform ? options.transform(parsed) : parsed.parsed) : null;
  const metadata = parsed?.metadata || null;
  const errors = parsed?.errors || [];
  const warnings = parsed?.warnings || [];

  return {
    parsed,
    data,
    metadata,
    errors,
    warnings,
    isLoading,
    isError,
    error,
    parse,
    reset,
    refetch,
  };
}

export default useContentParser;
