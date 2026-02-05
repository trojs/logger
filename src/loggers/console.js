/* eslint-disable no-param-reassign */
import stackDriver from '../helpers/stackdriver.js'

const SYMBOL_MESSAGE = Symbol.for('message')

const safeJsonReplacer = (maxDepth = 5, maxStringLength = 1000) => {
  const seen = new WeakSet()
  const depthMap = new WeakMap()

  return function (key, value) {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)

      // Track depth per object
      const parentDepth = depthMap.get(this) || 0
      const currentDepth = parentDepth + 1

      if (currentDepth > maxDepth) {
        return '[Max Depth Exceeded]'
      }

      depthMap.set(value, currentDepth)
    }

    // Truncate long strings
    if (typeof value === 'string' && value.length > maxStringLength) {
      return `${value.substring(0, maxStringLength)}... [truncated]`
    }

    // Handle functions
    if (typeof value === 'function') {
      return '[Function]'
    }

    return value
  }
}

export default ({ winston, logger }) => {
  const defaultLevel = 'trace'
  const stackTrace = logger?.debug ?? false

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
    winston.format.errors({ stack: stackTrace }),
    normalizeMessage(),
    winston.format(stackDriver({ level: logger?.level, defaultLevel }))(),
    winston.format((info) => {
      // Safe JSON serialization with error handling
      try {
        const serialized = JSON.stringify(info, safeJsonReplacer(5, 1000))
        return { ...info, [SYMBOL_MESSAGE]: serialized }
      } catch (error) {
        // Fallback for serialization errors
        let safeSymbolMessage
        try {
          const fallbackPayload = {
            message: info?.message,
            level: info?.level,
            error: 'Failed to serialize log entry'
          }
          safeSymbolMessage = JSON.stringify(fallbackPayload, safeJsonReplacer(2, 500))
        } catch {
          safeSymbolMessage = '{"error":"Failed to serialize log entry"}'
        }

        return {
          level: info?.level,
          message: info?.message || 'Serialization error',
          error: error?.message || 'Unknown serialization error',
          [SYMBOL_MESSAGE]: safeSymbolMessage
        }
      }
    })()
  )

  const simpleFormatter = winston.format.combine(
    ensureErrorProps(),
    winston.format.errors({ stack: stackTrace }),
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
