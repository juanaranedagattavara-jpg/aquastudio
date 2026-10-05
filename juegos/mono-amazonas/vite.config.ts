import { defineConfig } from 'vite';

// Un único bundle JS (sin code-splitting) para poder empaquetarlo
// después en un solo archivo HTML jugable sin servidor (jugar.html).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
