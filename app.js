import { handler as ssrHandler } from './dist/server/entry.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'dist', 'client');

const server = http.createServer((req, res) => {
  // Serve static files from dist/client first
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const filePath = path.join(clientDir, url.pathname);

  // Check if it's a static file (has extension)
  if (path.extname(filePath) && fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
      '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
      '.xml': 'application/xml', '.txt': 'text/plain',
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // All other requests go to Astro SSR
  ssrHandler(req, res);
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  console.log(`F.Horn server running on ${host}:${port}`);
});
