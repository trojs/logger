import test from 'node:test'
import assert from 'node:assert'
import makeLogger from '../logger.js'

test('Test the make loggers', async (t) => {
  await t.test('It should make the loggers', () => {
    const logger = makeLogger({
      loggers: [{
        type: 'console'
      }]
    })

    assert.strictEqual(logger.level, 'info')
    assert.deepEqual(logger.levels, {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5
    })
    assert.strictEqual(logger.silent, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.readable, true)
    assert.strictEqual(logger.allowHalfOpen, true)
    assert.deepEqual(logger.defaultMeta, {})
    assert.strictEqual(logger.exitOnError, true)
    assert.deepEqual(logger.format, {
      options: {}
    })
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })

  await t.test('It should work without loggers', () => {
    const logger = makeLogger({})

    assert.strictEqual(logger.level, 'info')
    assert.deepEqual(logger.levels, {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5
    })
    assert.strictEqual(logger.silent, undefined)
    assert.strictEqual(logger.writable, true)
    assert.strictEqual(logger.readable, true)
    assert.strictEqual(logger.allowHalfOpen, true)
    assert.deepEqual(logger.defaultMeta, {})
    assert.strictEqual(logger.exitOnError, true)
    assert.deepEqual(logger.format, {
      options: {}
    })
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })
})
