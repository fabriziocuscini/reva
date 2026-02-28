import { resolve } from 'path';
import posthtml from '@malobre/vite-plugin-posthtml';
import components from 'posthtml-component';
import FullReload from 'vite-plugin-full-reload';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        terms: resolve(__dirname, 'terms.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
  plugins: [
    posthtml({
      plugins: [
        components({
          root: './src',
          folders: ['components'],
        }),
      ],
      options: {
        recognizeSelfClosing: true,
      },
    }),
    FullReload([
      'index.html',
      'terms.html',
      'privacy.html',
      'src/components/**/*.html',
    ]),
  ],
});
