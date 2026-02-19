import winston from 'winston'
import makeLoggers from './loggers/index.js'

/**
 * @typedef {import('./models/schemas/logger.js').Logger} LoggerType
 * @typedef {import('./models/enums/level.js').LevelType} LevelType
 */

/** @type {LoggerType[]} */
const defaultLoggers = [
  {
    type: 'console'
  }
]

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
 * @param {boolean} [options.exitOnError=false] - Whether the logger should exit on error.
 * @returns {LoggerType} Winston logger instance with custom level wrappers.
 * These handlers will log errors and warnings using the logger, and are only attached once per process.
 * @example
 * import createLogger from './logger.js';
 * const logger = createLogger({ level: 'debug', meta: { service: 'api' } });
 * logger.info('Service started');
 */
export default ({ loggers = defaultLoggers, level = 'info', meta = {}, exitOnError = false } = {}) => {
  const winstonLoggers = makeLoggers({ winston, loggers })

  const logger = winston.createLogger({
    level,
    levels,
    defaultMeta: meta,
    transports: winstonLoggers,
    exitOnError
  })

  const wrapLevel = (lvl) => {
    const orig = logger[lvl].bind(logger)
    logger[lvl] = (first, ...rest) => {
      if (first instanceof Error) {
        try {
          const message = typeof first.message === 'string'
            ? first.message
            : (() => {
                try {
                  return JSON.stringify(first)
                } catch {
                  return String(first)
                }
              })()

          const restInfo = Object.assign(
            {},
            ...rest.filter((x) => x && typeof x === 'object')
          )
          const info = {
            ...restInfo,
            level: lvl,
            message,
            error: first,
            stack: first.stack
          }
          return logger.log(info)
        } catch (wrapError) {
          // Fallback: log with minimal safe data if wrapping fails
          try {
            return logger.log({
              level: lvl,
              message: first.message || String(first),
              error: first,
              stack: first.stack,
              wrapError: wrapError.message
            })
          } catch {
            // Last resort: use original logger without wrapping
            return orig(first)
          }
        }
      }
      return orig(first, ...rest)
    }
  }

  ;['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach((lvl) => {
    if (typeof logger[lvl] === 'function') wrapLevel(lvl)
  })

  // Winston handles uncaughtException and unhandledRejection via transport
  // handleExceptions and handleRejections options.
  // exitOnError controls whether the process exits after logging.

  // Only attach warning handler (not handled by Winston transports)
  if (!process.__trojsLoggerHandlersAttached) {
    process.__trojsLoggerHandlersAttached = true

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
