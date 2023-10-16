import makeErrorFileLogger from './error-file.js'
import makeCombinedFileLogger from './combined-file.js'
import makeSentryLogger from './sentry.js'
import makeConsoleLogger from './console.js'
import makeGoogleCloudLogger from './google-cloud.js'
import makeNewRelicLogger from './new-relic.js'
import { makePubSubElasticLogger } from './pubsub-elastic.js'

import Logger from '../models/logger.js'
import { getPubSubClient } from '../helpers/pubSubClient.js'

const winstonLoggers = {
  sentry: makeSentryLogger,
  errorFile: makeErrorFileLogger,
  combinedFile: makeCombinedFileLogger,
  console: makeConsoleLogger,
  googleCloud: makeGoogleCloudLogger,
  newRelic: makeNewRelicLogger,
  pubSubElastic: makePubSubElasticLogger
}

const makeLoggers = ({ winston, loggers }) => Logger.createAll(loggers).map(logger => {
  const loggerFn = winstonLoggers[logger.type]
  if (!loggerFn) {
    throw new Error(`Unknown logger type: ${logger.type}`)
  }

  const opts = {
    logger,
    winston
  }

  if (logger.type === 'pubSubElastic') {
    const pubSub = getPubSubClient(logger.projectId, logger.credentials)
    opts.pubSub = pubSub
  }

  return loggerFn(opts)
})

export default makeLoggers
