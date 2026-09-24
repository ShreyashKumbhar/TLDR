import request from 'supertest';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { InMemoryLogRecordExporter, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
const spans = new InMemorySpanExporter();
const logs = new InMemoryLogRecordExporter();
const sdk = new NodeSDK({ spanProcessors: [new SimpleSpanProcessor(spans)],
  logRecordProcessors: [new SimpleLogRecordProcessor({ exporter: logs })] });
sdk.start();
import { createApp } from '../src/app';
afterAll(async () => { await sdk.shutdown(); });
beforeEach(() => { spans.reset(); logs.reset(); });

test('health increments Prometheus counters, exports a span and correlated Winston log', async () => {
  const { app } = createApp();
  const traceId = '12345678901234567890123456789012';
  const health = await request(app).get('/health').set('traceparent', `00-${traceId}-1234567890123456-01`).expect(200);
  expect(health.body).toEqual({ status: 'ok' });
  expect(health.headers['x-trace-id']).toBe(traceId);
  const response = await request(app).get('/metrics').expect(200);
  expect(response.headers['content-type']).toContain('text/plain');
  expect(response.text).toContain('http_requests_total{method="GET",route="/health",status_code="200"} 1');
  expect(response.text).toContain('process_cpu_user_seconds_total');
  expect(spans.getFinishedSpans().some(s => s.name === 'GET /health' && s.spanContext().traceId === traceId)).toBe(true);
  expect(logs.getFinishedLogRecords().some(l => l.body === 'request completed' && l.spanContext?.traceId === traceId)).toBe(true);
});

test('errors are captured, recorded in spans, and counted without leaking details', async () => {
  const captureException = jest.fn();
  const { app } = createApp({ demoErrors: true, captureException });
  const response = await request(app).get('/debug/error').expect(500);
  expect(response.body).toEqual({ error: 'internal server error' });
  expect(captureException).toHaveBeenCalledWith(expect.any(Error));
  const span = spans.getFinishedSpans().find(s => s.name === 'GET /debug/error');
  expect(span?.status.code).toBe(2);
  expect(span?.events[0].name).toBe('exception');
  expect(logs.getFinishedLogRecords().some(l => l.severityText === 'error')).toBe(true);
  expect((await request(app).get('/metrics')).text).toContain('status_code="500"} 1');
});

test('demo error route is disabled by default and unmatched paths share one label', async () => {
  const { app } = createApp();
  await request(app).get('/debug/error').expect(404);
  await request(app).get('/random-user-value').expect(404);
  const result = await request(app).get('/metrics');
  expect(result.text).toContain('route="unmatched",status_code="404"} 2');
  expect(result.text).not.toContain('random-user-value');
});
