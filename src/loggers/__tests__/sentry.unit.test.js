import test from 'node:test'
import assert from 'node:assert'
import winston from 'winston'
import makeSentryLogger from '../sentry.js'

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
