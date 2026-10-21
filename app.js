import 'dotenv/config';
import { handler as ssrHandler } from './dist/server/entry.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'dist', 'client');

const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.avif': 'image/avif',
};

function tryServeStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  let filePath = path.join(clientDir, url.pathname);

  // File with extension (css, js, images, etc)
  if (path.extname(filePath) && fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  // Directory route → try index.html (pre-rendered pages)
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(indexPath).pipe(res);
    return true;
  }

  // Try with .html extension
  const htmlPath = filePath + '.html';
  if (fs.existsSync(htmlPath)) {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(htmlPath).pipe(res);
    return true;
  }

  return false;
}

const server = http.createServer((req, res) => {
  // Try static files first (pre-rendered pages + assets)
  if (tryServeStatic(req, res)) return;

  // SSR for dynamic routes
  ssrHandler(req, res);
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  console.log(`F.Horn server running on ${host}:${port}`);
});
