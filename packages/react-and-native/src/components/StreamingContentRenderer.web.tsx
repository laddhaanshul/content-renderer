import React, { useState, useEffect, useRef } from 'react';
import { HTMLRenderer } from './HTMLRenderer.web';
import type { HTMLNode } from './HTMLRenderer.web';

export interface StreamingContentRendererProps {
  stream?: ReadableStream<Uint8Array> | null;
  astStream?: ReadableStream<HTMLNode> | null;
  fallback?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onStreamStart?: () => void;
  onStreamComplete?: () => void;
  onStreamError?: (error: Error) => void;
}

export const StreamingContentRenderer: React.FC<StreamingContentRendererProps> = ({
  stream,
  astStream,
  fallback,
  className,
  style,
  onStreamStart,
  onStreamComplete,
  onStreamError,
}) => {
  const [content, setContent] = useState<string>('');
  const [ast, setAst] = useState<HTMLNode | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures in the async loop
  const contentRef = useRef('');
  const astNodesRef = useRef<HTMLNode[]>([]);

  useEffect(() => {
    console.log('[StreamingRenderer] Effect running. Stream:', !!stream, 'AST:', !!astStream);
    if (!stream && !astStream) {
      setContent('');
      setAst(null);
      setIsComplete(false);
      setError(null);
      contentRef.current = '';
      astNodesRef.current = [];
      return;
    }

    let isMounted = true;
    onStreamStart?.();

    const readStream = async () => {
      if (!stream) return;
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      try {
        while (isMounted) {
          const { done, value } = await reader.read();
          if (done || !isMounted) break;
          const chunk = typeof value === 'string' ? value : decoder.decode(value, { stream: true });
          contentRef.current += chunk;
          setContent(contentRef.current);
        }
        if (isMounted) {
          setIsComplete(true);
          onStreamComplete?.();
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          onStreamError?.(err);
        }
      } finally {
        reader.releaseLock();
      }
    };

    const readAstStream = async () => {
      if (!astStream) return;
      const reader = astStream.getReader();
      try {
        while (isMounted) {
          const { done, value } = await reader.read();
          if (done || !isMounted) break;
          astNodesRef.current.push(value);
          setAst({ type: 'root', children: [...astNodesRef.current] });
        }
        if (isMounted) {
          setIsComplete(true);
          onStreamComplete?.();
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          onStreamError?.(err);
        }
      } finally {
        reader.releaseLock();
      }
    };

    if (stream) readStream();
    if (astStream) readAstStream();

    return () => {
      isMounted = false;
    };
  }, [stream, astStream]);

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!content && !ast) {
    return <div className={className} style={style}>{fallback || 'Ready to stream...'}</div>;
  }

  return (
    <div className={className} style={{ ...style, border: '1px solid #6c63ff', minHeight: '100px', padding: '10px' }}>
      {ast ? <HTMLRenderer ast={ast} /> : <HTMLRenderer html={content} />}
      {!isComplete && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
          Streaming... (Chunks: {content.length} bytes)
        </div>
      )}
    </div>
  );
};

export default StreamingContentRenderer;
