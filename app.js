import { handler as ssrHandler } from './dist/server/entry.mjs';
import http from 'node:http';

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const server = http.createServer(ssrHandler);

server.listen(port, host, () => {
  console.log(`F.Horn server running on ${host}:${port}`);
});
