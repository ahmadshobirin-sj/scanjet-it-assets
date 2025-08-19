import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const hasHTTPS =
        env.LOCAL_CERTIFICATE_KEY_PATH &&
        env.LOCAL_CERTIFICATE_PATH &&
        fs.existsSync(env.LOCAL_CERTIFICATE_KEY_PATH) &&
        fs.existsSync(env.LOCAL_CERTIFICATE_PATH);

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        resolve: {
            alias: {
                'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            },
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            https: hasHTTPS
                ? {
                      key: fs.readFileSync(env.LOCAL_CERTIFICATE_KEY_PATH),
                      cert: fs.readFileSync(env.LOCAL_CERTIFICATE_PATH),
                  }
                : {},
            hmr: {
                host: 'scanjet.local',
            },
        },
    };
});
