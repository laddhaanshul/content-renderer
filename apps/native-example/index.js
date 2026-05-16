import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Ensure process is also available (some libraries expect it)
if (typeof global.process === 'undefined') {
  global.process = require('process');
} else {
  global.process.browser = true;
}

import 'expo-router/entry';
