import stackDriver from '../helpers/stackdriver.js'

export default ({ winston, logger }) => {
  const defaultLevel = 'trace'

  const jsonFormatter = winston.format.combine(
    winston.format.errors({ stack: logger?.debug ?? false }),
    winston.format(
      stackDriver({ level: logger?.level, defaultLevel })
    )(),
    winston.format.json()
  )

  const simpleLoggerWithStack = winston.format.printf((info) => {
    if (logger?.debug && info.stack) {
      return `${info.level}: ${info.stack}`
    }
    return `${info.level}: ${info.message}`
  })

  const defaultFormatter = winston.format.combine(
    winston.format.errors({ stack: logger?.debug ?? false }),
    simpleLoggerWithStack
  )

  return new winston.transports.Console({
    level: logger?.level || defaultLevel,
    format:
    logger.format === 'json'
      ? jsonFormatter
      : defaultFormatter
  })
}
