import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import * as Sentry from '@sentry/node';

// Loaded before Express. Manual request spans avoid competing Sentry/OTel providers.
export function startTelemetry() {
  Sentry.init({ dsn: process.env.SENTRY_DSN, enabled: Boolean(process.env.SENTRY_DSN),
    enableOpenTelemetrySetup: false, defaultIntegrations: false });
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ 'service.name': 'devops-intern-api' }),
    traceExporter: new OTLPTraceExporter(),
    logRecordProcessors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter(), scheduledDelayMillis: 500 })],
    metricReaders: [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter(), exportIntervalMillis: 1000 })]
  });
  sdk.start();
  return sdk;
}
