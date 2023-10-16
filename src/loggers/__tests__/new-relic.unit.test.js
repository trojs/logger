import test from 'node:test'
import assert from 'node:assert'
import winston from 'winston'
import makeNewRelicLogger from '../new-relic.js'

test('Test the new relic logger', async (t) => {
  await t.test('It should make the new relic logger with default settings', () => {
    const logger = makeNewRelicLogger({ winston })
    assert.strictEqual(logger.name, 'winston-to-newrelic-logs')
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, undefined)
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
    assert.strictEqual(logger.silent, undefined)
    assert.strictEqual(logger.stderrLevels, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.format, undefined)
    assert.strictEqual(logger.consoleWarnLevels, undefined)
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })

  await t.test('It should make the new relic logger', () => {
    const logger = makeNewRelicLogger({
      winston,
      logger: { key: 'test.key', location: 'test.test', options: { test: 42 } }
    })
    assert.strictEqual(logger.name, 'winston-to-newrelic-logs')
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, undefined)
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
    assert.strictEqual(logger.silent, undefined)
    assert.strictEqual(logger.stderrLevels, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.format, undefined)
    assert.strictEqual(logger.consoleWarnLevels, undefined)
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })
})
