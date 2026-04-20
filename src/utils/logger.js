import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

let logger;
try {
  logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev
      ? { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } }
      : undefined
  });
} catch {
  logger = pino({ level: 'info' });
}

export default logger;
