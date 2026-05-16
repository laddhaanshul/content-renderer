// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './CodeRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './CodeRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const CodeRenderer = isNative ? NativeComponent : WebComponent;

export default CodeRenderer;
export { CodeRenderer };
