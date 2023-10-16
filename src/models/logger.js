import { Obj } from '@hckrnews/objects'
import loggerSchema from './schemas/logger.js'
import LoggerMutator from './mutators/logger.js'

/**
 * @typedef {import('./schemas/logger.js').Logger} LoggerType
 */

/**
 * @type {LoggerType}
 */
const LoggerObject = Obj({ schema: loggerSchema })

export default class Logger {
  /**
   * Create a logger object
   * @param {LoggerType} data
   * @returns {LoggerType}
   */
  static create (data) {
    const logger = LoggerMutator.create(data)
    return LoggerObject.create(logger)
  }

  /**
   * Create logger objects
   * @param {LoggerType[]} data
   * @returns {LoggerType[]}
   */
  static createAll (data) {
    if (!data || data.length === 0) {
      return []
    }

    return data.map(loggerData => Logger.create(loggerData))
  }
}
