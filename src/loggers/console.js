import stackDriver from '../helpers/stackdriver.js'

export default ({ winston, logger }) => {
  const defaultLevel = 'trace'

  const jsonFormatter = winston.format.combine(
    winston.format.errors({ stack: logger?.debug ?? false }),
    winston.format((info) => {
      if (!info.message) {
        info.message = info.message || info.toString()
      }
      if (logger?.debug && info.stack) {
        info.stacktrace = info.stack
      }
      return info
    })(),
    winston.format(
      stackDriver({ level: logger?.level, defaultLevel })
    )(),
    winston.format.json()
  )

  const simpleLoggerWithStack = winston.format.printf(({ level, message, stack }) => {
    const text = `${level.toUpperCase()}: ${message}`
    return stack ? `${text}\n${stack}` : text
  })

  const defaultFormatter = winston.format.combine(
    winston.format.errors({ stack: logger?.debug ?? false }),
    winston.format((info) => {
      if (!info.message && info instanceof Error) {
        info.message = info.toString()
      }
      return info
    })(),
    simpleLoggerWithStack
  )

  return new winston.transports.Console({
    level: logger?.level || defaultLevel,
    format:
    logger?.format === 'json'
      ? jsonFormatter
      : defaultFormatter
  })
}
