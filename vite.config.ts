import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import fs from 'fs';

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  server: {
    port: 3000,

    // https: {
    // 	key: fs.readFileSync('./ssl/key.pem'),
    // 	cert: fs.readFileSync('./ssl/cert.pem'),
    // },
  },
});
