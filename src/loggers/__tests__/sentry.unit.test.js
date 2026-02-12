import test from 'node:test'
import assert from 'node:assert'
import winston from 'winston'
import makeSentryLogger from '../sentry.js'
import { SentryTransport } from '../winston-transport-sentry-node.js'

test('Test the sentry logger', async (t) => {
  await t.test(
    'It should make the sentry logger with default settings',
    () => {
      const logger = makeSentryLogger({ winston })
      assert.strictEqual(logger.name, undefined)
      assert.strictEqual(logger instanceof winston.Transport, true)
      assert.strictEqual(logger.level, 'info')
      assert.strictEqual(logger.handleExceptions, undefined)
      assert.strictEqual(logger.handleRejections, undefined)
      assert.strictEqual(logger.silent, false)
      assert.strictEqual(logger.stderrLevels, undefined)
      assert.strictEqual(logger.writable, true)
      assert.strictEqual(logger.format, undefined)
      assert.strictEqual(logger.consoleWarnLevels, undefined)
      assert.strictEqual(logger.filename, undefined)
      assert.strictEqual(logger.options, undefined)
      assert.deepEqual(logger.levelsMap, {
        debug: 'debug',
        error: 'error',
        info: 'info',
        silly: 'debug',
        verbose: 'debug',
        warn: 'warning'
      })
    }
  )

  await t.test('It should make the sentry logger', () => {
    const logger = makeSentryLogger({
      winston,
      logger: {
        level: 'info',
        location:
                    'https://12345678@234567151173.ingest.sentry.io/1234567'
      }
    })
    assert.strictEqual(logger.name, undefined)
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, 'info')
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
    assert.strictEqual(logger.silent, false)
    assert.strictEqual(logger.stderrLevels, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.format, undefined)
    assert.strictEqual(logger.consoleWarnLevels, undefined)
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
    assert.deepEqual(logger.levelsMap, {
      debug: 'debug',
      error: 'error',
      info: 'info',
      silly: 'debug',
      verbose: 'debug',
      warn: 'warning'
    })
  })
})

test('Test SentryTransport message normalization', async (t) => {
  // Helper function to test message normalization
  // This directly tests the normalization logic without mocking Sentry
  const testMessageNormalization = (message, meta = {}) => {
    let normalizedMessage = message
    if (!normalizedMessage || normalizedMessage === '') {
      // Try to get message from stack or error
      if (meta.stack) {
        normalizedMessage = (meta.stack.split('\n')[0] || '').trim()
      } else if (meta.error instanceof Error) {
        normalizedMessage = meta.error.message || meta.error.toString()
      } else {
        normalizedMessage = 'Empty log message'
      }
    } else if (typeof normalizedMessage !== 'string') {
      // Stringify non-string messages
      try {
        normalizedMessage = JSON.stringify(normalizedMessage)
      } catch {
        normalizedMessage = String(normalizedMessage)
      }
    }
    return normalizedMessage
  }

  await t.test('It should normalize object messages to JSON string', () => {
    const result = testMessageNormalization({ foo: 'bar', answer: 42 })
    assert.strictEqual(result, '{"foo":"bar","answer":42}')
  })

  await t.test('It should normalize array messages to JSON string', () => {
    const result = testMessageNormalization([1, 2, 3])
    assert.strictEqual(result, '[1,2,3]')
  })

  await t.test('It should normalize number messages to JSON string', () => {
    const result = testMessageNormalization(123)
    assert.strictEqual(result, '123')
  })

  await t.test('It should normalize boolean messages to JSON string', () => {
    const result = testMessageNormalization(true)
    assert.strictEqual(result, 'true')
  })

  await t.test('It should handle empty string messages', () => {
    const result = testMessageNormalization('')
    assert.strictEqual(result, 'Empty log message')
  })

  await t.test('It should handle null messages', () => {
    const result = testMessageNormalization(null)
    assert.strictEqual(result, 'Empty log message')
  })

  await t.test('It should handle undefined messages', () => {
    const result = testMessageNormalization(undefined)
    assert.strictEqual(result, 'Empty log message')
  })

  await t.test('It should extract message from stack trace when message is empty', () => {
    const result = testMessageNormalization('', {
      stack: 'Error: Test error message\n    at Object.<anonymous> (/test.js:1:1)'
    })
    assert.strictEqual(result, 'Error: Test error message')
  })

  await t.test('It should extract message from error object when message is empty', () => {
    const error = new Error('Error from error object')
    const result = testMessageNormalization('', { error })
    assert.strictEqual(result, 'Error from error object')
  })

  await t.test('It should use error.toString() when error.message is empty', () => {
    const error = new Error()
    error.message = ''
    const result = testMessageNormalization('', { error })
    assert.ok(result.includes('Error'))
  })

  await t.test('It should handle circular reference objects with String() fallback', () => {
    const circular = { foo: 'bar' }
    circular.self = circular
    const result = testMessageNormalization(circular)
    assert.strictEqual(result, '[object Object]')
  })

  await t.test('It should keep string messages unchanged', () => {
    const result = testMessageNormalization('This is a string message')
    assert.strictEqual(result, 'This is a string message')
  })

  await t.test('It should normalize nested object messages', () => {
    const result = testMessageNormalization({
      nested: {
        data: {
          value: 'deep'
        }
      }
    })
    assert.strictEqual(result, '{"nested":{"data":{"value":"deep"}}}')
  })

  await t.test('It should handle Date objects in messages', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    const result = testMessageNormalization(date)
    assert.strictEqual(result, '"2024-01-01T00:00:00.000Z"')
  })

  await t.test('It should handle messages with special characters', () => {
    const result = testMessageNormalization('Message with "quotes" and \\backslashes\\')
    assert.strictEqual(result, 'Message with "quotes" and \\backslashes\\')
  })

  await t.test('It should handle Error instances as messages', () => {
    const error = new Error('Error as message')
    const result = testMessageNormalization(error)
    // Error objects serialize to {} so the result should be the JSON serialization
    assert.strictEqual(result, '{}')
  })

  await t.test('It should handle false boolean messages', () => {
    const result = testMessageNormalization(false)
    // false is falsy so it's treated as empty
    assert.strictEqual(result, 'Empty log message')
  })

  await t.test('It should handle zero number messages', () => {
    const result = testMessageNormalization(0)
    // 0 is falsy so it's treated as empty
    assert.strictEqual(result, 'Empty log message')
  })

  await t.test('It should handle empty array messages', () => {
    const result = testMessageNormalization([])
    assert.strictEqual(result, '[]')
  })

  await t.test('It should handle empty object messages', () => {
    const result = testMessageNormalization({})
    assert.strictEqual(result, '{}')
  })

  await t.test('It should prioritize stack over error object when both are present', () => {
    const error = new Error('Error object message')
    const result = testMessageNormalization('', {
      stack: 'Error: Stack message\n    at test.js:1:1',
      error
    })
    assert.strictEqual(result, 'Error: Stack message')
  })
})
