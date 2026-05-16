// Platform-aware component: picks .web or .native implementation
// @ts-ignore
import { Platform, StyleSheet } from 'react-native';

// Web (React DOM) implementation
import WebComponent from './XMLRenderer.web';

// Native (React Native) implementation
// @ts-ignore
import NativeComponent from './XMLRenderer.native';

const isNative = typeof Platform !== 'undefined' && Platform.OS !== 'web';

const XMLRenderer = (isNative ? NativeComponent : WebComponent) as any;

export default XMLRenderer;
export { XMLRenderer };
