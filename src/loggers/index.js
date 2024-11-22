import makeErrorFileLogger from './error-file.js'
import makeCombinedFileLogger from './combined-file.js'
import makeSentryLogger from './sentry.js'
import makeConsoleLogger from './console.js'

import Logger from '../models/logger.js'

const winstonLoggers = {
    sentry: makeSentryLogger,
    errorFile: makeErrorFileLogger,
    combinedFile: makeCombinedFileLogger,
    console: makeConsoleLogger
}

/**
 * @typedef {import('../models/schemas/logger.js').Logger} LoggerType
 * @typedef {import('winston-transport').TransportStreamOptions} TransportStream
 */

/**
 * Create all loggers
 * @param {object} opts
 * @param {object} opts.winston
 * @param {LoggerType[]} opts.loggers
 * @returns {TransportStream[]}
 */
const makeLoggers = ({ winston, loggers }) =>
    Logger.createAll(loggers).map((logger) => {
        const loggerFn = winstonLoggers[logger.type]
        if (!loggerFn) {
            throw new Error(`Unknown logger type: ${logger.type}`)
        }

        const opts = {
            logger,
            winston
        }

        return loggerFn(opts)
    })

export default makeLoggers
