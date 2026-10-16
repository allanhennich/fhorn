import http from "node:http";

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<h1>F.Horn Dashboard - Node.js funcionando!</h1><p>Porta: " + port + "</p>");
});

server.listen(port, host, () => {
  console.log("Server running on " + host + ":" + port);
});
