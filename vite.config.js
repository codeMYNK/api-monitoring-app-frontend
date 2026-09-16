import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
        preprocessorOptions: {
            scss: {
                api: 'modern',
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://server-api-app-latest.onrender.com',
                // target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
});
