import express, { ErrorRequestHandler } from 'express';
import { context, propagation, trace, metrics, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';
import * as Sentry from '@sentry/node';
import { logger } from './logger';

export function createApp(options: { demoErrors?: boolean; captureException?: (error: Error) => unknown } = {}) {
  const app = express();
  app.disable('x-powered-by');
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });
  const requests = new Counter({ name: 'http_requests_total', help: 'Completed HTTP requests',
    labelNames: ['method', 'route', 'status_code'], registers: [registry] });
  const latency = new Histogram({ name: 'http_request_duration_seconds', help: 'HTTP latency',
    labelNames: ['route'], registers: [registry] });
  const otelRequests = metrics.getMeter('api').createCounter('api.requests');
  app.use((req, res, next) => {
    const parent = propagation.extract(context.active(), req.headers);
    const span = trace.getTracer('api').startSpan('HTTP request', { kind: SpanKind.SERVER }, parent);
    const activeContext = trace.setSpan(parent, span);
    const started = performance.now();
    res.setHeader('x-trace-id', span.spanContext().traceId);
    res.once('finish', () => context.with(activeContext, () => {
      // Use route templates, never user-controlled paths, to bound metric cardinality.
      const route = String(req.route?.path ?? 'unmatched');
      const method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(req.method) ? req.method : 'OTHER';
      const labels = { method, route, status_code: String(res.statusCode) };
      requests.inc(labels);
      latency.observe({ route }, (performance.now() - started) / 1000);
      otelRequests.add(1, labels);
      span.updateName(`${method} ${route}`);
      span.setAttributes({ 'http.request.method': method, 'http.route': route, 'http.response.status_code': res.statusCode });
      if (res.statusCode >= 500) span.setStatus({ code: SpanStatusCode.ERROR });
      logger.info('request completed', { ...labels, trace_id: span.spanContext().traceId });
      span.end();
    }));
    context.with(activeContext, next);
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });
  if (options.demoErrors) app.get('/debug/error', () => { throw new Error('Evidence test error'); });
  app.use((_req, res) => res.status(404).json({ error: 'not found' }));
  const handleError: ErrorRequestHandler = (error: Error, _req, res, _next) => {
    trace.getActiveSpan()?.recordException(error);
    (options.captureException ?? Sentry.captureException)(error);
    logger.error('request failed', { trace_id: trace.getActiveSpan()?.spanContext().traceId });
    res.status(500).json({ error: 'internal server error' });
  };
  app.use(handleError);
  return { app, registry };
}
