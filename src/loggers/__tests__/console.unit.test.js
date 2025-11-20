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
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
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
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
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
})
