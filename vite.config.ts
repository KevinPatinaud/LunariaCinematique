import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const at = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));
export default defineConfig({
  root: at('./src/renderer'),
  publicDir: at('./example-library'),
  base: './',
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { outDir: at('./dist/renderer'), emptyOutDir: true, sourcemap: true }
});
