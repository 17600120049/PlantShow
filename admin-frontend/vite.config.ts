import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function redirectAdminBase(): Plugin {
  return {
    name: 'redirect-admin-base',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        if (url === '/admin' || url.startsWith('/admin?')) {
          const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';
          res.writeHead(301, { Location: `/admin/${query}` });
          res.end();
          return;
        }

        if (url === '/' || url.startsWith('/?')) {
          const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';
          res.writeHead(301, { Location: `/admin/${query}` });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), redirectAdminBase()],
  base: '/admin/',
  server: {
    port: 3002,
    open: '/admin/',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
