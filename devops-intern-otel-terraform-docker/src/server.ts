import { startTelemetry } from './telemetry';
const telemetry = startTelemetry();
import { createApp } from './app';
import { logger } from './logger';
import * as Sentry from '@sentry/node';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be 1024–65535');
const { app } = createApp({ demoErrors: process.env.ENABLE_DEMO_ERRORS === 'true' });
const server = app.listen(port, '0.0.0.0', () => logger.info('server listening', { port }));
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 10000);
  deadline.unref();
  server.close(() => {
    void Promise.all([telemetry.shutdown(), Sentry.close(5000)]).then(() => {
      clearTimeout(deadline);
      process.exit(0);
    }).catch(() => process.exit(1));
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
