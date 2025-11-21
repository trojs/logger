import winston from 'winston'
import makeLoggers from './loggers/index.js'

/**
 * @typedef {import('./models/schemas/logger.js').Logger} LoggerType
 */

const defaultLoggers = [{ type: 'console' }]

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

/**
 * Creates a Winston logger instance with custom log levels and transports.
 * Also attaches global process event handlers for uncaught exceptions, unhandled rejections, and warnings.
 * @param {object} [options={}] - Logger configuration options.
 * @param {Array<{[key: string]: string}>} [options.loggers=defaultLoggers] - Array of logger transport configurations.
 * @param {string} [options.level='info'] - Minimum log level for the logger.
 * @param {object} [options.meta={}] - Default metadata to include in all log messages.
 * @returns {LoggerType} Winston logger instance with custom level wrappers.
 * These handlers will log errors and warnings using the logger, and are only attached once per process.
 * @example
 * import createLogger from './logger.js';
 * const logger = createLogger({ level: 'debug', meta: { service: 'api' } });
 * logger.info('Service started');
 */
export default ({ loggers = defaultLoggers, level = 'info', meta = {} } = {}) => {
  const winstonLoggers = makeLoggers({ winston, loggers })

  const logger = winston.createLogger({
    level,
    levels,
    defaultMeta: meta,
    transports: winstonLoggers
  })

  const wrapLevel = (lvl) => {
    const orig = logger[lvl].bind(logger)
    logger[lvl] = (first, ...rest) => {
      if (first instanceof Error) {
        const info = {
          level: lvl,
          message: first.message || first.toString(),
          error: first,
          stack: first.stack
        }
        if (rest[0] && typeof rest[0] === 'object') {
          Object.assign(info, rest[0])
        }
        return logger.log(info)
      }
      return orig(first, ...rest)
    }
  }

  ;['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach((lvl) => {
    if (typeof logger[lvl] === 'function') wrapLevel(lvl)
  })

  if (!process.__trojsLoggerHandlersAttached) {
    process.__trojsLoggerHandlersAttached = true

    process.on('uncaughtException', (err) => {
      try {
        logger.error(err instanceof Error ? err : new Error(String(err)))
      } catch {
        // eslint-disable-next-line no-console
        console.error('UNCAUGHT_EXCEPTION', err)
      }
    })

    process.on('unhandledRejection', (reason) => {
      let err
      if (reason instanceof Error) {
        err = reason
      } else if (typeof reason === 'string') {
        err = new Error(reason)
      } else {
        try {
          err = new Error(JSON.stringify(reason))
        } catch {
          err = new Error(String(reason))
        }
      }
      try {
        logger.error(err)
      } catch {
        // eslint-disable-next-line no-console
        console.error('UNHANDLED_REJECTION', err)
      }
    })

    process.on('warning', (warning) => {
      try {
        logger.warn(
          warning instanceof Error
            ? warning
            : (
                new Error(
                  `${warning.name}: ${warning.message}\n${warning.stack || ''}`
                )
              )
        )
      } catch {
        // eslint-disable-next-line no-console
        console.warn('PROCESS_WARNING', warning)
      }
    })
  }

  return logger
}
