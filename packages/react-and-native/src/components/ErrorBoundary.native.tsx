/**
 * ErrorBoundary – React Native error boundary component.
 *
 * Catches JavaScript errors anywhere in its child component tree, logs those
 * errors, and displays a fallback UI instead of crashing the whole app.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, type ViewStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component to render on error. If not provided, renders a default error UI. */
  fallback?: ReactNode;
  /** Custom error renderer function. */
  fallbackRender?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  /** Called when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom error message (overrides default). */
  errorMessage?: string;
  /** Style for the error container. */
  style?: ViewStyle;
  /** Text color for error messages. */
  textColor?: string;
  /** Background color for error container. */
  backgroundColor?: string;
  /** Whether to show the error stack trace in development. Default: true. */
  showStackTrace?: boolean;
  /** Whether to show a "Try Again" button. Default: true. */
  showResetButton?: boolean;
  /** Label for the reset button. Default: "Try Again". */
  resetButtonText?: string;
  /** Test ID. */
  testID?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ---------------------------------------------------------------------------
// Default error UI
// ---------------------------------------------------------------------------

interface DefaultErrorUIProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  errorMessage?: string;
  textColor?: string;
  backgroundColor?: string;
  showStackTrace?: boolean;
  showResetButton?: boolean;
  resetButtonText?: string;
}

const DefaultErrorUI: React.FC<DefaultErrorUIProps> = ({
  error,
  errorInfo,
  onReset,
  errorMessage,
  textColor = '#dc3545',
  backgroundColor = '#fff5f5',
  showStackTrace = __DEV__,
  showResetButton = true,
  resetButtonText = 'Try Again',
}) => {
  return (
    <ScrollView
      style={[styles.errorContainer, { backgroundColor }]}
      contentContainerStyle={styles.errorContent}
    >
      <Text style={[styles.errorIcon, { color: textColor }]}>
        {'\u26A0'}
      </Text>
      <Text style={[styles.errorTitle, { color: textColor }]}>
        {errorMessage || 'Something went wrong'}
      </Text>
      <Text style={[styles.errorMessage, { color: textColor }]}>
        {error.message}
      </Text>

      {showStackTrace && error.stack && (
        <View style={styles.stackTraceContainer}>
          <Text style={styles.stackTraceLabel}>Stack Trace:</Text>
          <ScrollView style={styles.stackTraceScroll}>
            <Text style={styles.stackTraceText} selectable>
              {error.stack}
            </Text>
          </ScrollView>
        </View>
      )}

      {showStackTrace && errorInfo && (
        <View style={styles.stackTraceContainer}>
          <Text style={styles.stackTraceLabel}>Component Stack:</Text>
          <ScrollView style={styles.stackTraceScroll}>
            <Text style={styles.stackTraceText} selectable>
              {errorInfo.componentStack}
            </Text>
          </ScrollView>
        </View>
      )}

      {showResetButton && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={resetButtonText}
        >
          <Text style={styles.resetButtonText}>{resetButtonText}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  stackTraceContainer: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
  stackTraceLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  stackTraceScroll: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
  },
  stackTraceText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#555',
    padding: 8,
    lineHeight: 16,
  },
  resetButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// ErrorBoundary component
// ---------------------------------------------------------------------------

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback render
      if (this.props.fallbackRender) {
        return this.props.fallbackRender(
          this.state.error,
          this.state.errorInfo!,
          this.handleReset,
        );
      }

      // Static fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View testID={this.props.testID || 'error-boundary'}>
          <DefaultErrorUI
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onReset={this.handleReset}
            errorMessage={this.props.errorMessage}
            textColor={this.props.textColor}
            backgroundColor={this.props.backgroundColor}
            showStackTrace={this.props.showStackTrace}
            showResetButton={this.props.showResetButton}
            resetButtonText={this.props.resetButtonText}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
