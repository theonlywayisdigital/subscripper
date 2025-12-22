// Polyfill for import.meta in environments that don't support it
if (typeof globalThis !== 'undefined' && !globalThis.import_meta_url) {
  globalThis.import_meta_url = '';
}
