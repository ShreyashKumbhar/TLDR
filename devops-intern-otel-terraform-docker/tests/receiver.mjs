// Test-only OTLP/Sentry receiver; never deployed. Stores actual HTTP payloads.
import http from 'node:http';
import { gunzipSync, inflateSync } from 'node:zlib';
const evidence = { traces: [], metrics: [], logs: [], sentry: [] };
http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/evidence') {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify(evidence));
  }
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = Buffer.concat(chunks);
    if (req.headers['content-encoding'] === 'gzip') body = gunzipSync(body);
    if (req.headers['content-encoding'] === 'deflate') body = inflateSync(body);
    const signal = req.url.split('/').at(-1);
    if (['traces', 'metrics', 'logs'].includes(signal)) evidence[signal].push(JSON.parse(body.toString()));
    else if (req.url.startsWith('/api/1/envelope/')) evidence.sentry.push(body.toString());
    else { res.statusCode = 404; return res.end(); }
    res.setHeader('content-type', 'application/json');
    res.end('{}');
  } catch (error) { res.statusCode = 400; res.end(String(error)); }
}).listen(4318, '0.0.0.0');
