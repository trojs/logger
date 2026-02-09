import Level from '../enums/level.js'

/**
 * @typedef {import('../enums/level.js').LevelType} LevelType
 */

/**
 * The logger object
 * @typedef {object} Logger
 * @property {string} type
 * @property {string=} location
 * @property {LevelType=} level
 * @property {string=} key
 * @property {object=} credentials
 * @property {string=} environment
 * @property {string=} serverName
 * @property {string=} release
 * @property {boolean=} debug
 * @property {number=} sampleRate
 * @property {number=} tracesSampleRate
 * @property {string=} format
 * @property {number=} maxDepth
 * @property {number=} maxStringLength
 */

export default {
  type: String,
  'location?': String,
  'level?': Level,
  'key?': String,
  'credentials?': Object,
  'environment?': String,
  'serverName?': String,
  'release?': String,
  'debug?': Boolean,
  'sampleRate?': Number,
  'tracesSampleRate?': Number,
  'format?': String,
  'maxDepth?': Number,
  'maxStringLength?': Number
}
