import winston from 'winston';
import Transport from 'winston-transport';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { context } from '@opentelemetry/api';

class OtelTransport extends Transport {
  log(info: { level: string; message: string; trace_id?: string }, callback: () => void) {
    logs.getLogger('api').emit({
      context: context.active(), body: info.message, severityText: info.level,
      severityNumber: info.level === 'error' ? SeverityNumber.ERROR : SeverityNumber.INFO,
      attributes: info.trace_id ? { trace_id: info.trace_id } : {}
    });
    callback();
  }
}

export const logger = winston.createLogger({
  level: 'info', format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console(), new OtelTransport()]
});
