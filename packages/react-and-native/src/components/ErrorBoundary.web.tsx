import React from 'react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, errorInfo: React.ErrorInfo) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * React Error Boundary component that catches runtime errors in its child tree.
 *
 * Features:
 * - Renders custom fallback UI when an error is caught
 * - Supports both static fallback ReactNode and dynamic fallback function
 * - Optional error callback for logging/reporting
 * - Provides a "retry" mechanism via resetting state
 * - Accessible error display with proper ARIA attributes
 *
 * @example
 * // Static fallback
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // Dynamic fallback with error details
 * <ErrorBoundary fallback={(error) => <ErrorDisplay error={error} />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const { error, errorInfo } = this.state;

      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(error, errorInfo!);
        }
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            padding: '16px',
            margin: '8px 0',
            border: '1px solid #e53e3e',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
            color: '#c53030',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong style={{ fontSize: '16px' }}>⚠ Rendering Error</strong>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                border: '1px solid #e53e3e',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#c53030',
              }}
            >
              Retry
            </button>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Error:</strong> {error.message}
          </div>
          {error.stack && (
            <details style={{ marginBottom: '8px' }}>
              <summary style={{ cursor: 'pointer', opacity: 0.7 }}>Stack Trace</summary>
              <pre
                style={{
                  marginTop: '4px',
                  padding: '8px',
                  backgroundColor: '#fed7d7',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.stack}
              </pre>
            </details>
          )}
          {errorInfo && errorInfo.componentStack && (
            <details>
              <summary style={{ cursor: 'pointer', opacity: 0.7 }}>Component Stack</summary>
              <pre
                style={{
                  marginTop: '4px',
                  padding: '8px',
                  backgroundColor: '#fed7d7',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
