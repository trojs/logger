import test from 'node:test'
import assert from 'node:assert'
import winston from 'winston'
import makeLogger from './logger.js'
import makeConsoleLogger from './loggers/console.js'

test('Test the make loggers', async (t) => {
  await t.test('It should make the loggers', () => {
    const logger = makeLogger({
      loggers: [
        {
          type: 'console',
          debug: true,
          format: 'json',
          level: 'error'
        }
      ]
    })
    const exampleError = new Error('ok')
    logger.error(exampleError)
    assert.ok(true)
  })

  await t.test('It should log Error message (json format)', () => {
    // Use transport directly
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', debug: true, level: 'error' }
    })
    const err = new Error('ok')
    err.level = 'error'
    const formatted = transport.format.transform(err, {})
    assert.strictEqual(formatted.message, 'ok')
    assert.ok(formatted.stacktrace)
  })

  await t.test('It should derive message from stack for uncaught-like error (json)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', format: 'json', debug: false, level: 'error' }
    })
    const err = new Error('ok')
    const info = { level: 'error', stack: err.stack }
    const formatted = transport.format.transform(info, {})
    assert.ok(formatted.message.includes('Error: ok'))
  })

  await t.test('It should derive message from stack for uncaught-like error (simple)', () => {
    const transport = makeConsoleLogger({
      winston,
      logger: { type: 'console', debug: false, level: 'error' }
    })
    const err = new Error('ok simple')
    const info = { level: 'error', stack: err.stack }
    const formatted = transport.format.transform(info, {})
    const MESSAGE = Symbol.for('message')
    assert.ok(formatted[MESSAGE].includes('Error: ok simple'))
  })
})
