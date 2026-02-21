import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/api') || url.includes('action=getData')) {
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                isAdmin: true,
                data: [
                  {
                    id: '1',
                    name: 'Mock Item 1',
                    link: 'https://example.com',
                    imageUrl: 'https://placehold.co/140',
                    priority: 'High',
                    tags: ['electronics', 'gift'],
                    purchased: false,
                  },
                  {
                    id: '2',
                    name: 'Mock Item 2',
                    link: 'https://example.com',
                    imageUrl: 'https://placehold.co/140',
                    priority: 'Medium',
                    tags: ['home'],
                    purchased: false,
                  },
                ],
              }),
            );
            return;
          }
          next();
        });
      },
    },
  ],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: 'dist',
  },
});
