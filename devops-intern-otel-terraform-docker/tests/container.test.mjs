import test from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const evidenceUrl = process.env.EVIDENCE_URL ?? 'http://localhost:4318';
async function eventually(check) {
  let error;
  for (let i = 0; i < 60; i++) {
    try { await check(); return; } catch (e) { error = e; await delay(1000); }
  }
  throw error;
}
const counter = text => Number(text.match(/http_requests_total\{method="GET",route="\/health",status_code="200"\} (\d+)/)?.[1] ?? 0);
test('running service exports metrics, traces, logs and Sentry errors', { timeout: 90000 }, async () => {
  await eventually(async () => assert.equal((await fetch(`${base}/health`)).status, 200));
  const before = counter(await (await fetch(`${base}/metrics`)).text());
  const traceId = '12345678901234567890123456789012';
  const health = await fetch(`${base}/health`, { headers: { traceparent: `00-${traceId}-1234567890123456-01` } });
  assert.deepEqual(await health.json(), { status: 'ok' });
  assert.equal(health.headers.get('x-trace-id'), traceId);
  assert.ok(counter(await (await fetch(`${base}/metrics`)).text()) >= before + 1);
  assert.equal((await fetch(`${base}/debug/error`)).status, 500);
  await eventually(async () => {
    const data = await (await fetch(`${evidenceUrl}/evidence`)).json();
    const spans = data.traces.flatMap(d => d.resourceSpans ?? []).flatMap(r => r.scopeSpans).flatMap(s => s.spans);
    assert.ok(spans.some(s => s.name === 'GET /health' && s.traceId === traceId));
    assert.ok(spans.some(s => s.name === 'GET /debug/error' && s.status?.code === 2));
    const logs = data.logs.flatMap(d => d.resourceLogs ?? []).flatMap(r => r.scopeLogs).flatMap(s => s.logRecords);
    assert.ok(logs.some(l => l.body?.stringValue === 'request completed' && l.traceId === traceId));
    assert.match(JSON.stringify(data.metrics), /api.requests/);
    assert.match(data.sentry.join('\n'), /Evidence test error/);
  });
  if (process.env.PROMETHEUS_URL) await eventually(async () => {
    const query = encodeURIComponent('http_requests_total{job="api",route="/health"}');
    const response = await (await fetch(`${process.env.PROMETHEUS_URL}/api/v1/query?query=${query}`)).json();
    assert.ok(response.data.result.some(r => Number(r.value[1]) > 0));
  });
});
