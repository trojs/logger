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

  const extractSymbolMessage = (info) => {
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
  }

  const attachEmbeddedError = (info) => {
    const embedded
      = (info.error instanceof Error && info.error)
        || (info.exception instanceof Error && info.exception)

    if (info instanceof Error) {
      if (!info.message || info.message === '') {
        info.message = info.toString()
      }
      return
    }

    if (info.message instanceof Error) {
      info.message = info.message.message || info.message.toString()
      return
    }

    if (embedded) {
      info.message = embedded.message || embedded.toString()
      if (!info.stack && embedded.stack) {
        info.stack = embedded.stack
      }
    }
  }

  const stringifyNonStringMessage = (info) => {
    if (info.message && typeof info.message !== 'string') {
      try {
        info.message = JSON.stringify(info.message)
      } catch {
        info.message = String(info.message)
      }
    }
  }

  const deriveMessageFromStack = (info) => {
    if (info.stack && (!info.message || info.message === '')) {
      info.message = stackHead(info.stack)
    }
  }

  const finalizeEmptyMessage = (info) => {
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
  }

  const duplicateStackTraceIfDebug = (info) => {
    if ((logger?.debug ?? false) && info.stack) {
      info.stacktrace = info.stack
    }
  }

  const normalizeMessage = winston.format((info) => {
    extractSymbolMessage(info)
    attachEmbeddedError(info)
    stringifyNonStringMessage(info)
    deriveMessageFromStack(info)
    finalizeEmptyMessage(info)
    duplicateStackTraceIfDebug(info)
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
