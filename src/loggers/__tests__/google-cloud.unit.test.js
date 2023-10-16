import test from 'node:test'
import assert from 'assert'
import winston from 'winston'
import makeConsoleLogger from '../google-cloud.js'

test('Test the google cloud logger', async (t) => {
  await t.test('It should make the google cloud logger', () => {
    const logger = makeConsoleLogger({ winston })
    assert.strictEqual(logger.name, undefined)
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
