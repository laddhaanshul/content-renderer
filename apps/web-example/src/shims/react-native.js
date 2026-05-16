/**
 * react-native web shim
 * Provides web-compatible implementations of react-native APIs
 * used by the cross-platform components in @content-renderer/react-and-native.
 */
import React from 'react';

// ─── Basic Components ────────────────────────────────────────────────────────

const NoOpComponent = React.forwardRef((props, ref) => React.createElement('div', { ...props, ref }));

export const View = React.forwardRef((props, ref) => React.createElement('div', { ...props, ref }));
export const Text = React.forwardRef((props, ref) => React.createElement('span', { ...props, ref }));
export const ScrollView = React.forwardRef((props, ref) => React.createElement('div', { ...props, ref, style: { overflow: 'auto', ...props.style } }));
export const Image = React.forwardRef((props, ref) => React.createElement('img', props));
export const TouchableOpacity = React.forwardRef((props, ref) => React.createElement('button', { ...props, ref, style: { background: 'none', border: 'none', cursor: 'pointer', ...props.style } }));
export const TouchableHighlight = TouchableOpacity;
export const TouchableWithoutFeedback = TouchableOpacity;
export const Pressable = TouchableOpacity;
export const TextInput = React.forwardRef((props, ref) => React.createElement('input', { ...props, ref }));
export const ActivityIndicator = () => React.createElement('div', { style: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #ccc', borderTopColor: '#333', animation: 'spin 1s linear infinite' } });
export const FlatList = NoOpComponent;
export const SectionList = NoOpComponent;
export const SafeAreaView = View;
export const Modal = NoOpComponent;
export const Switch = () => React.createElement('input', { type: 'checkbox' });
export const RefreshControl = NoOpComponent;
export const KeyboardAvoidingView = View;
export const StatusBar = { currentHeight: 0, setBackgroundColor: () => {}, setBarStyle: () => {}, setHidden: () => {}, setTranslucent: () => {} };

// ─── Platform ─────────────────────────────────────────────────────────────────

export const Platform = {
  OS: 'web',
  select: (spec) => spec.web ?? spec.default,
  Version: 0,
  isTesting: false,
};

// ─── StyleSheet ──────────────────────────────────────────────────────────────

export const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return undefined;
    if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean));
    return style;
  },
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
};

// ─── Dimensions ──────────────────────────────────────────────────────────────

export const Dimensions = {
  get: (dim) => {
    if (dim === 'window') {
      return {
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
        scale: 1, fontScale: 1
      };
    }
    if (dim === 'screen') {
      return {
        width: typeof window !== 'undefined' ? window.screen.width : 1024,
        height: typeof window !== 'undefined' ? window.screen.height : 768,
        scale: 1, fontScale: 1
      };
    }
    return { width: 0, height: 0, scale: 1, fontScale: 1 };
  },
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// ─── Appearance ──────────────────────────────────────────────────────────────

export const Appearance = {
  getColorScheme: () => 'light',
  addChangeListener: () => ({ remove: () => {} }),
};

// ─── PixelRatio ──────────────────────────────────────────────────────────────

export const PixelRatio = {
  get: () => typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size) => size * (typeof window !== 'undefined' ? window.devicePixelRatio : 1),
  roundToNearestPixel: (size) => Math.round(size),
};

// ─── AccessibilityInfo ───────────────────────────────────────────────────────

export const AccessibilityInfo = {
  isScreenReaderEnabled: Promise.resolve(false),
  announceForAccessibility: () => {},
  isBoldTextEnabled: Promise.resolve(false),
  isGrayscaleEnabled: Promise.resolve(false),
  isInvertColorsEnabled: Promise.resolve(false),
  isReduceMotionEnabled: Promise.resolve(false),
  isReduceTransparencyEnabled: Promise.resolve(false),
  setAccessibilityFocus: () => {},
  sendAccessibilityEvent: () => {},
};

// ─── NativeModules ──────────────────────────────────────────────────────────

export const NativeModules = {};

// ─── AppRegistry ────────────────────────────────────────────────────────────

export const AppRegistry = {
  registerComponent: () => {},
  registerRunnable: () => {},
  getAppKeys: () => [],
};

// ─── LogBox ─────────────────────────────────────────────────────────────────

export const LogBox = {
  ignoreLogs: () => {},
  ignoreAllLogs: () => {},
};

// ─── Alert ──────────────────────────────────────────────────────────────────

export const Alert = {
  alert: (title, msg) => {
    if (typeof window !== 'undefined') window.alert(msg || title);
  },
};

// ─── Linking ────────────────────────────────────────────────────────────────

export const Linking = {
  openURL: (url) => {
    if (typeof window !== 'undefined') window.open(url, '_blank');
    return Promise.resolve();
  },
  canOpenURL: () => Promise.resolve(true),
  getInitialURL: () => Promise.resolve(null),
  addEventListener: () => ({ remove: () => {} }),
};

// ─── Share ──────────────────────────────────────────────────────────────────

export const Share = {
  share: (opts) => Promise.resolve({ action: 'shared' }),
};

// ─── Types & Styles ──────────────────────────────────────────────────────────

export const TextStyle = Object;
export const ViewStyle = Object;
export const ImageStyle = Object;
export const StyleProp = Object;
export const ImageResizeMode = { contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center', repeat: 'repeat' };
export const FlatListProps = Object;
export const ListRenderItemInfo = Object;

export default {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
  SectionList,
  SafeAreaView,
  Modal,
  Switch,
  RefreshControl,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
  StyleSheet,
  Dimensions,
  Appearance,
  PixelRatio,
  AccessibilityInfo,
  NativeModules,
  AppRegistry,
  LogBox,
  Alert,
  Linking,
  Share,
};
