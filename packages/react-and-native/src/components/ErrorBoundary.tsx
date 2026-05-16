// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './ErrorBoundary.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './ErrorBoundary.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const ErrorBoundary = isNative ? NativeComponent : WebComponent;

export default ErrorBoundary;
export { ErrorBoundary };
