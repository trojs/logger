import * as Sentry from '@sentry/node'
import TransportStream from 'winston-transport'
import { LEVEL } from 'triple-beam'
import { ExtendedError } from '../helpers/extended-error.js'

/**
 * @enum {string}
 */
const SentrySeverity = {
  Debug: 'debug',
  Log: 'log',
  Info: 'info',
  Warning: 'warning',
  Error: 'error',
  Fatal: 'fatal'
}

/**
 * @type {{[key: string]: string}}
 */
const DEFAULT_LEVELS_MAP = {
  silly: SentrySeverity.Debug,
  verbose: SentrySeverity.Debug,
  info: SentrySeverity.Info,
  debug: SentrySeverity.Debug,
  warn: SentrySeverity.Warning,
  error: SentrySeverity.Error
}

/**
 * @typedef {object} SentryTransportOptions
 * @property {Sentry.NodeOptions} [sentry] - Sentry configuration options.
 * @property {{[key: string]: string}} [levelsMap] - Custom levels map.
 * @property {boolean} [skipSentryInit] - Whether to skip Sentry initialization.
 * @property {boolean} [silent] - Whether to suppress logging.
 */

/**
 * @typedef {{[key: string]: string}} SeverityOptions
 */

/**
 * Custom Winston transport for Sentry.
 */
export class SentryTransport extends TransportStream {
  /**
   * @type {boolean}
   */
  silent = false

  /**
   * @type {SeverityOptions}
   */
  levelsMap = {}

  /**
   * @param {SentryTransportOptions} [opts] - Transport options.
   */
  constructor (opts) {
    super(opts)

    this.levelsMap = this.setLevelsMap(opts && opts.levelsMap)
    this.silent = (opts && opts.silent) || false

    if (!opts || !opts.skipSentryInit) {
      Sentry.init(SentryTransport.withDefaults((opts && opts.sentry) || {}))
    }
  }

  /**
   * Logs the message to Sentry.
   * @param {object} info - Log information.
   * @param {Function} callback - Callback function.
   * @returns {any}
   */
  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    if (this.silent) return callback()

    const { message, tags, user, ...meta } = info
    const winstonLevel = info[LEVEL]

    const sentryLevel = this.levelsMap[winstonLevel]

    const scope = Sentry.getCurrentScope()
    scope.clear()

    if (tags !== undefined && SentryTransport.isObject(tags)) {
      scope.setTags(tags)
    }

    scope.setExtras(meta)

    if (user !== undefined && SentryTransport.isObject(user)) {
      scope.setUser(user)
    }

    // Capturing Errors / Exceptions
    if (SentryTransport.shouldLogException(sentryLevel)) {
      const error
        = Object.values(info).find((value) => value instanceof Error)
          ?? new ExtendedError(info)
      Sentry.captureException(error, { tags, level: sentryLevel })

      return callback()
    }

    // Capturing Messages
    Sentry.captureMessage(message, sentryLevel)
    return callback()
  }

  /**
   * Ends the transport and flushes Sentry.
   * @param {...any} args - Arguments.
   * @returns {this}
   */
  end (...args) {
    // eslint-disable-next-line promise/catch-or-return
    Sentry.flush().then(() => super.end(...args))
    return this
  }

  /**
   * @returns {typeof Sentry}
   */
  get sentry () {
    return Sentry
  }

  /**
   * Sets the levels map.
   * @param {SeverityOptions} [options] - Custom levels map.
   * @returns {SeverityOptions}
   */
  setLevelsMap (options) {
    if (!options) {
      return DEFAULT_LEVELS_MAP
    }

    const customLevelsMap = Object.keys(options).reduce(
      (acc, winstonSeverity) => {
        acc[winstonSeverity] = options[winstonSeverity]
        return acc
      },
      {}
    )

    return {
      ...DEFAULT_LEVELS_MAP,
      ...customLevelsMap
    }
  }

  /**
   * Merges default Sentry options with user-provided options.
   * @param {Sentry.NodeOptions} options - Sentry options.
   * @returns {Sentry.NodeOptions}
   */
  static withDefaults (options) {
    return {
      ...options,
      dsn: (options && options.dsn) || process.env.SENTRY_DSN || '',
      serverName:
        (options && options.serverName) || 'winston-transport-sentry-node',
      environment:
        (options && options.environment)
        || process.env.SENTRY_ENVIRONMENT
        || process.env.NODE_ENV
        || 'production',
      debug: (options && options.debug) || !!process.env.SENTRY_DEBUG || false,
      sampleRate: (options && options.sampleRate) || 1.0,
      maxBreadcrumbs: (options && options.maxBreadcrumbs) || 100
    }
  }

  /**
   * Checks if the given object is an object or function.
   * @param {any} obj - Object to check.
   * @returns {boolean}
   */
  static isObject (obj) {
    const type = typeof obj
    return type === 'function' || (type === 'object' && !!obj)
  }

  /**
   * Determines if the given level should log an exception.
   * @param {string} level - Sentry severity level.
   * @returns {boolean}
   */
  static shouldLogException (level) {
    return level === SentrySeverity.Fatal || level === SentrySeverity.Error
  }
}
