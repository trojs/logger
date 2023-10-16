import test from 'node:test'
import assert from 'assert'
import winston from 'winston'
import makeCombinedFileLogger from '../combined-file.js'

test('Test the combined file logger', async (t) => {
  await t.test('It should make the combined file logger with default settings', () => {
    const logger = makeCombinedFileLogger({ winston })
    assert.strictEqual(logger.name, 'file')
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, undefined)
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
    assert.strictEqual(logger.silent, undefined)
    assert.strictEqual(logger.stderrLevels, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.format, undefined)
    assert.strictEqual(logger.consoleWarnLevels, undefined)
    assert.strictEqual(logger.filename, 'combined.log')
    assert.deepEqual(logger.options, {
      flags: 'a'
    })
  })

  await t.test('It should make the combined file logger', () => {
    const logger = makeCombinedFileLogger({ winston, logger: { level: 'info', location: 'test.test' } })
    assert.strictEqual(logger.name, 'file')
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, undefined)
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
    assert.strictEqual(logger.silent, undefined)
    assert.strictEqual(logger.stderrLevels, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.format, undefined)
    assert.strictEqual(logger.consoleWarnLevels, undefined)
    assert.strictEqual(logger.filename, 'test.test')
    assert.deepEqual(logger.options, {
      flags: 'a'
    })
  })
})
