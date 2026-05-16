import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { HTMLRenderer } from './HTMLRenderer.native';
// @ts-ignore
import { HTMLNode } from './HTMLRenderer.native';

export interface StreamingContentRendererProps {
  stream?: any;
  astStream?: any;
  fallback?: React.ReactNode;
  style?: any;
  onStreamStart?: () => void;
  onStreamComplete?: () => void;
  onStreamError?: (error: Error) => void;
}

export const StreamingContentRenderer: React.FC<StreamingContentRendererProps> = ({
  stream,
  astStream,
  fallback,
  style,
  onStreamStart,
  onStreamComplete,
  onStreamError,
}) => {
  const [content, setContent] = useState<string>('');
  const [ast, setAst] = useState<HTMLNode | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentRef = useRef('');
  const astNodesRef = useRef<HTMLNode[]>([]);

  useEffect(() => {
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
      if (!stream || typeof stream.getReader !== 'function') return;
      const reader = stream.getReader();
      // Safe fallback if TextDecoder doesn't exist
      const decode = (v: any) => {
        if (typeof v === 'string') return v;
        if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(v);
        // Fallback for native without TextDecoder
        let str = '';
        for (let i = 0; i < v.length; i++) str += String.fromCharCode(v[i]);
        return str;
      };
      
      try {
        while (isMounted) {
          const { done, value } = await reader.read();
          if (done || !isMounted) break;
          const chunk = decode(value);
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
        try { reader.releaseLock(); } catch (e) {}
      }
    };

    const readAstStream = async () => {
      if (!astStream || typeof astStream.getReader !== 'function') return;
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
        try { reader.releaseLock(); } catch (e) {}
      }
    };

    if (stream) readStream();
    if (astStream) readAstStream();

    return () => {
      isMounted = false;
    };
  }, [stream, astStream]);

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorTitle}>Streaming Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!content && !ast) {
    return <View style={style}>{fallback}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      {ast ? (
        <HTMLRenderer ast={ast} />
      ) : (
        <HTMLRenderer html={content} />
      )}
      {!isComplete && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#6c63ff" />
          <Text style={styles.loadingText}>Streaming...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#ffa39e',
    borderRadius: 8,
  },
  errorTitle: { color: '#cf1322', fontWeight: 'bold', marginBottom: 4 },
  errorMessage: { color: '#cf1322', fontSize: 14 },
  loadingIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 12, opacity: 0.7 },
  loadingText: { marginLeft: 8, fontSize: 12, color: '#666' },
});

export default StreamingContentRenderer;
