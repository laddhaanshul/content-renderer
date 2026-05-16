// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './JSONRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './JSONRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const JSONRenderer = isNative ? NativeComponent : WebComponent;

export default JSONRenderer;
export { JSONRenderer };
