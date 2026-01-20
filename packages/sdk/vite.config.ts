import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: './src/main.tsx',
      name: 'VWaitlist',
      fileName: 'v-waitlist.min',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
        globals: {
          preact: 'preact',
        },
      },
    },
    cssCodeSplit: false,
    minify: 'terser',
  },
});
