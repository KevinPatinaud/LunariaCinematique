import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
const at = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));
function devHmrCspPlugin(): Plugin {
  return {
    name: 'lunaria-dev-hmr-csp',
    apply: 'serve',
    transformIndexHtml(html, ctx) {
      const address = ctx.server?.httpServer?.address();
      const port = typeof address === 'object' && address ? address.port : 5173;
      return html.replace("connect-src 'self'", `connect-src 'self' ws://127.0.0.1:${port}`);
    }
  };
}
export default defineConfig({
  root: at('./src/renderer'),
  publicDir: at('./example-library'),
  base: './',
  esbuild: { jsx: 'automatic' },
  plugins: [devHmrCspPlugin()],
  server: { host: '127.0.0.1', port: 5173, strictPort: false },
  build: { outDir: at('./dist/renderer'), emptyOutDir: true, sourcemap: true }
});
