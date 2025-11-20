import stackDriver from '../helpers/stackdriver.js'

export default ({ winston, logger }) => {
  const defaultLevel = 'trace'

  const jsonFormatter = winston.format.combine(
    winston.format.errors({ stack: logger?.debug ?? false }),
    winston.format((info) => {
      if (!info.message) {
        if (info instanceof Error) {
          info.message = info.message || info.toString()
        } else {
          const clone = { ...info }
          delete clone.level
          const keys = Object.keys(clone)
          info.message = keys.length > 0 ? JSON.stringify(clone) : ''
        }
      } else if (info.message instanceof Error) {
        info.message = info.message.message || info.message.toString()
      } else if (typeof info.message !== 'string') {
        info.message = JSON.stringify(info.message)
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
      if (info instanceof Error) {
        info.message = info.message || info.toString()
      } else if (!info.message) {
        info.message = ''
      }
      return info
    })(),
    simpleLoggerWithStack
  )

  return new winston.transports.Console({
    level: logger?.level || defaultLevel,
    handleExceptions: true,
    handleRejections: true,
    format:
    logger?.format === 'json'
    ? jsonFormatter
    : defaultFormatter
  })
}
