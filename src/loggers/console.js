import stackDriver from '../helpers/stackdriver.js'

const SYMBOL_MESSAGE = Symbol.for('message')

export default ({ winston, logger }) => {
  const defaultLevel = 'trace'

  const stackHead = (stack) =>
    stack ? (stack.split('\n')[0] || '').trim() : ''

  const ensureErrorProps = winston.format((info) => {
    if (info instanceof Error) {
      info.message = info.message || info.toString()
    }
    return info
  })

  const normalizeMessage = winston.format((info) => {
    if (
      (!info.message || info.message === '')
      && info[SYMBOL_MESSAGE]
      && typeof info[SYMBOL_MESSAGE] === 'string'
    ) {
      try {
        const parsed = JSON.parse(info[SYMBOL_MESSAGE])
        if (typeof parsed === 'string') {
          info.message = parsed
        }
      } catch {
        info.message = info[SYMBOL_MESSAGE]
      }
    }

    const embeddedError
      = (info.error instanceof Error && info.error)
        || (info.exception instanceof Error && info.exception)

    if (info instanceof Error) {
      if (!info.message || info.message === '') {
        info.message = info.toString()
      }
    } else if (info.message instanceof Error) {
      info.message = info.message.message || info.message.toString()
    } else if (embeddedError) {
      info.message = embeddedError.message || embeddedError.toString()
      if (!info.stack && embeddedError.stack) {
        info.stack = embeddedError.stack
      }
    }

    if (info.stack && (!info.message || info.message === '')) {
      info.message = stackHead(info.stack)
    }

    if (!info.message || info.message === '') {
      const clone = { ...info }
      delete clone.level
      delete clone.stack
      delete clone.error
      delete clone.exception
      delete clone[SYMBOL_MESSAGE]
      const keys = Object.keys(clone)
      info.message = keys.length > 0 ? JSON.stringify(clone) : ''
    }

    if ((logger?.debug ?? false) && info.stack) {
      info.stacktrace = info.stack
    }

    return info
  })

  const debugTap = winston.format((info) => {
    if (!info.__debugTap) {
      // eslint-disable-next-line no-console
      console.error('RAW_INFO_BEFORE_JSON', {
        keys: Object.keys(info),
        message: info.message,
        hasStack: !!info.stack,
        symbolMessage: info[SYMBOL_MESSAGE]
      })
      info.__debugTap = true
    }
    return info
  })

  const jsonFormatter = winston.format.combine(
    ensureErrorProps(),
    winston.format.errors({ stack: true }),
    normalizeMessage(),
    winston.format(stackDriver({ level: logger?.level, defaultLevel }))(),
    winston.format.json()
  )

  const simpleFormatter = winston.format.combine(
    ensureErrorProps(),
    winston.format.errors({ stack: true }),
    normalizeMessage(),
    winston.format.printf(({ level, message, stack }) => {
      const base = `${level}: ${message || stackHead(stack)}`
      return stack && (logger?.debug ?? false) ? `${base}\n${stack}` : base
    })
  )

  return new winston.transports.Console({
    level: logger?.level || defaultLevel,
    handleExceptions: true,
    handleRejections: true,
    format: logger?.format === 'json' ? jsonFormatter : simpleFormatter
  })
}
