// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './HTMLRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './HTMLRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const HTMLRenderer = isNative ? NativeComponent : WebComponent;

export default HTMLRenderer;
export { HTMLRenderer };
