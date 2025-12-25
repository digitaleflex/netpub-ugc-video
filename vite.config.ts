import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import net from 'net';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple check to see if backend is up to avoid noisy proxy logs
let isBackendUp = false;
const checkBackend = () => {
  const socket = new net.Socket();
  socket.setTimeout(500);
  socket.on('connect', () => {
    isBackendUp = true;
    socket.destroy();
  }).on('error', () => {
    isBackendUp = false;
    socket.destroy();
  }).on('timeout', () => {
    isBackendUp = false;
    socket.destroy();
  }).connect(4000, '127.0.0.1');
};

// Check every 2 seconds
setInterval(checkBackend, 2000);
checkBackend();

export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/graphql': {
          target: 'http://127.0.0.1:4000',
          changeOrigin: true,
          ws: true,
          bypass: (req, res) => {
            if (!isBackendUp) {
              res.statusCode = 503;
              res.end('Backend starting up...');
              return req.url; // Return something to indicate we handled it
            }
          },
        },
        '/csrf-token': {
          target: 'http://127.0.0.1:4000',
          changeOrigin: true,
          bypass: (req, res) => {
            if (!isBackendUp) {
              res.statusCode = 503;
              res.end('Backend starting up...');
              return req.url;
            }
          },
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },

  };
});
