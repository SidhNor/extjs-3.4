// Option 1: Minimal mock
globalThis.Ext = globalThis.Ext || {};

// Option 2: Load real ExtJS
// import './ext-all-debug'
require('./adapter/ext/ext-base-debug.js');
require('./ext-all-debug.js'); // if you bundled it previously


globalThis.window = globalThis;
globalThis.document = window.document;
