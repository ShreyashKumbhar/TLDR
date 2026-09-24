// Additional SDK smoke check when Docker is unavailable; not container evidence.
import { spawn } from 'node:child_process';
const children = [];
function start(args, env = {}) {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  children.push(child);
  return child;
}
try {
  start(['tests/receiver.mjs']);
  start(['dist/server.js'], { OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:4318',
    OTEL_EXPORTER_OTLP_PROTOCOL: 'http/json', OTEL_BSP_SCHEDULE_DELAY: '500',
    ENABLE_DEMO_ERRORS: 'true', SENTRY_DSN: 'http://public@127.0.0.1:4318/1' });
  const test = start(['--test', 'tests/container.test.mjs']);
  process.exitCode = await new Promise(resolve => test.once('exit', code => resolve(code ?? 1)));
} finally {
  for (const child of children) if (child.exitCode === null) child.kill();
}
