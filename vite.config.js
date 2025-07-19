// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Force everything to use the same three module
      'three': path.resolve(__dirname, 'node_modules/three')
    }
  }
});
