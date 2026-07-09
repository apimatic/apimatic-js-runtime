// Jest's sandbox does not expose Node's TextDecoder/TextEncoder globals
// (available at runtime since Node 11) — bridge them in for tests.
const { TextDecoder, TextEncoder } = require('util');

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
