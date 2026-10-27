import { createServer } from 'node:http';
import worker from '../worker/index.js';

const port = Number(process.env.PORT || 3000);
const server = createServer(async (req, res) => {
  try {
    const request = new Request(`http://localhost:${port}${req.url}`, { method: req.method });
    const response = await worker.fetch(request, {}, { waitUntil: promise => promise.catch(console.error) });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Something went wrong. Please try again.');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`TechBrief Local: http://localhost:${port}`));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
