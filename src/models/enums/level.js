import { Enum } from '@trojs/enum'

/* eslint-disable sonarjs/public-static-readonly */

/**
 * @typedef LevelType
 * @property {string} info "info"
 * @property {string} fatal "fatal"
 * @property {string} error "error"
 * @property {string} warn "warn"
 * @property {string} debug "debug"
 * @property {string} trace "trace"
 */

/**
 * Level enum
 * @augments Enum
 * @readonly
 * @enum { LevelType }
 */
class Level extends Enum {
  static info = 'info'

  static fatal = 'fatal'

  static error = 'error'

  static warn = 'warn'

  static debug = 'debug'

  static trace = 'trace'
}

export default Level
