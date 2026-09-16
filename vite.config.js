import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project under /Devcodein/ — the base must match,
// otherwise hashed asset URLs 404 and the page renders blank.
// https://vite.dev/guide/build#public-base-path
export default defineConfig({
    plugins: [react()],
    base: '/Devcodein/',
    build: {
        outDir: 'dist'
    },
    server: {
        host: '0.0.0.0',
        port: 3000
    }
});
