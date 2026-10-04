import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { copyFileSync } from 'node:fs';

export default defineConfig({
  base: './',
  plugins: [{ name: 'masal-browser-modules', enforce: 'pre', transform(code, id) {
    if (!/[/\\]src[/\\]js[/\\].*\.js$/.test(id)) return;
    // Keep Node's legacy test exports out of the browser bundle so every
    // business module initializes eagerly in its declared import order.
    return code
      .replace(/if\(typeof module!=='undefined'\)(?:module\.exports=[^;]+|require\([^;]+\));/g, '')
      .replace(/typeof require==='function'\?require\('[^']+'\):null/g, 'null');
  } }, vue(), { name: 'masal-offline-copy', closeBundle() {
    copyFileSync('masal.html', 'dist/masal.html');
    copyFileSync('.nojekyll', 'dist/.nojekyll');
  } }],
  resolve: {
    // Module components still contain runtime Options API templates.
    alias: { vue: 'vue/dist/vue.esm-bundler.js' },
  },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1600 },
});
