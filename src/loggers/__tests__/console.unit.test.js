import test from 'node:test'
import assert from 'node:assert'
import winston from 'winston'
import makeConsoleLogger from '../console.js'

test('Test the console logger', async (t) => {
  await t.test('It should make the console logger', () => {
    const logger = makeConsoleLogger({
      winston,
      logger: { type: 'console' }
    })
    assert.strictEqual(logger.name, 'console')
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, 'trace')
    assert.strictEqual(logger.handleExceptions, true)
    assert.strictEqual(logger.handleRejections, true)
    assert.strictEqual(logger.silent, undefined)
    assert.deepEqual(logger.stderrLevels, {})
    assert.strictEqual(logger.writable, true)
    assert.deepEqual(logger.consoleWarnLevels, {})
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })

  await t.test('It should make the json console logger', () => {
    const logger = makeConsoleLogger({
      winston,
      logger: {
        type: 'console',
        format: 'json',
        debug: true,
        level: 'info'
      }
    })
    assert.strictEqual(logger.name, 'console')
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, 'info')
    assert.strictEqual(logger.handleExceptions, true)
    assert.strictEqual(logger.handleRejections, true)
    assert.strictEqual(logger.silent, undefined)
    assert.deepEqual(logger.stderrLevels, {})
    assert.strictEqual(logger.writable, true)
    assert.deepEqual(logger.consoleWarnLevels, {})
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })

  await t.test('It should include stacktrace when debug=true (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: {
        type: 'console',
        format: 'json',
        debug: true,
        level: 'error'
      }
    })
    const err = new Error('boom')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    assert.ok(formatted.stacktrace)
    assert.strictEqual(formatted.stacktrace, err.stack)
    assert.strictEqual(typeof formatted.severity, 'string')
    assert.strictEqual(typeof formatted.level, 'number')
  })

  await t.test('It should not include stacktrace when debug=false (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: {
        type: 'console',
        format: 'json',
        debug: false,
        level: 'error'
      }
    })
    const err = new Error('boom2')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    assert.strictEqual(formatted.stacktrace, undefined)
    assert.strictEqual(typeof formatted.severity, 'string')
    assert.strictEqual(typeof formatted.level, 'number')
  })

  await t.test('It should include stack (simple format) when debug=true', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: {
        type: 'console',
        debug: true,
        level: 'error'
      }
    })
    const err = new Error('simple boom')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE].includes(err.stack.split('\n')[0]))
  })

  await t.test('It should NOT include stack (simple format) when debug=false', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: {
        type: 'console',
        debug: false,
        level: 'error'
      }
    })
    const err = new Error('simple boom 2')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(!formatted[MESSAGE].includes(err.stack.split('\n')[0]))
  })

  await t.test('It should include stacktrace (json)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', debug: true, level: 'error' }
    })
    const err = new Error('missing stack?')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    assert.ok(formatted.stacktrace)
    assert.strictEqual(formatted.message, 'missing stack?')
  })

  await t.test('It should set Error message using toString() (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', debug: true, level: 'error' }
    })
    const err = new Error('custom boom')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    assert.strictEqual(formatted.message, 'custom boom')
  })

  await t.test('It should JSON stringify plain object without message (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', debug: true, level: 'info' }
    })
    const infoObj = { level: 'info', foo: 'bar', answer: 42 }
    const formatted = transport.format.transform(infoObj, {})
    assert.strictEqual(formatted.message, '{"foo":"bar","answer":42}')
  })

  await t.test('It should transform message Error instance (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const innerErr = new Error('inner boom')
    const formatted = transport.format.transform({ level: 'info', message: innerErr }, {})
    assert.strictEqual(formatted.message, 'inner boom')
  })

  await t.test('It should JSON stringify non-string message object (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const msgObj = { foo: 'bar', answer: 42 }
    const formatted = transport.format.transform({ level: 'info', message: msgObj }, {})
    assert.strictEqual(formatted.message, JSON.stringify(msgObj))
  })

  await t.test('It should JSON stringify non-string message (array) (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const arr = [1, 2, 3]
    const formatted = transport.format.transform({ level: 'info', message: arr }, {})
    assert.strictEqual(formatted.message, JSON.stringify(arr))
  })

  await t.test('It should JSON stringify non-string message (number) (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const formatted = transport.format.transform({ level: 'info', message: 123 }, {})
    assert.strictEqual(formatted.message, JSON.stringify(123))
  })

  await t.test('It should handle circular references with safeJsonReplacer (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const circular = { level: 'info', message: 'test' }
    circular.self = circular
    const formatted = transport.format.transform(circular, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE])
    assert.ok(formatted[MESSAGE].includes('[Circular]'))
  })

  await t.test('It should truncate long strings with safeJsonReplacer (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const longString = 'a'.repeat(1500)
    const info = { level: 'info', message: 'test', data: longString }
    const formatted = transport.format.transform(info, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE])
    assert.ok(formatted[MESSAGE].includes('[truncated]'))
  })

  await t.test('It should handle functions with safeJsonReplacer (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const info = { level: 'info', message: 'test', fn: () => 'hello' }
    const formatted = transport.format.transform(info, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE])
    assert.ok(formatted[MESSAGE].includes('[Function]'))
  })

  await t.test('It should limit depth with safeJsonReplacer (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    // Create deeper nesting - need more than 5 levels
    const deep = {
      level: 'info',
      message: 'test',
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: 'way too deep'
                  }
                }
              }
            }
          }
        }
      }
    }
    const formatted = transport.format.transform(deep, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE])
    assert.ok(formatted[MESSAGE].includes('[Max Depth Exceeded]'))
  })

  await t.test('It should handle serialization errors gracefully (json format)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    // Create object that will fail normal JSON.stringify
    const problematic = { level: 'info', message: 'test' }
    // Override toJSON to throw
    problematic.toJSON = () => {
      throw new Error('Serialization fail')
    }
    const formatted = transport.format.transform(problematic, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE])
    // Should have fallback serialization
    assert.ok(formatted.message === 'test' || formatted.error)
  })

  await t.test('It should preserve Symbol(message) in json formatter', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', level: 'info', debug: false }
    })
    const info = { level: 'info', message: 'test message' }
    const formatted = transport.format.transform(info, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE])
    assert.strictEqual(typeof formatted[MESSAGE], 'string')
  })
})
