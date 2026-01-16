import test from 'node:test'
import assert from 'node:assert'
import stackdriver from '../stackdriver.js'

test('Test the stackdriver helper', async (t) => {
  await t.test('It should generate the meta data object', () => {
    const meta = stackdriver({ level: 'error', defaultLevel: 'info' })
    const result = meta({
      message: 'test'
    })

    assert.strictEqual(result.level, 50)
    assert.strictEqual(result.severity, 'ERROR')
    assert.strictEqual(result.message, 'test')
    assert.strictEqual(result.time.constructor.name, 'Number')
    assert.strictEqual(result.pid.constructor.name, 'Number')
    assert.strictEqual(result.hostname.constructor.name, 'String')
  })

  await t.test('It should generate the meta data object', () => {
    const meta = stackdriver({ level: 'something', defaultLevel: 'info' })
    const result = meta({
      message: 'test2'
    })

    assert.strictEqual(result.level, 30)
    assert.strictEqual(result.severity, 'INFO')
    assert.strictEqual(result.message, 'test2')
    assert.strictEqual(result.time.constructor.name, 'Number')
    assert.strictEqual(result.pid.constructor.name, 'Number')
    assert.strictEqual(result.hostname.constructor.name, 'String')
  })

  await t.test('It should prefer info.level over configured level', () => {
    const meta = stackdriver({ level: 'debug', defaultLevel: 'trace' })
    const result = meta({ message: 'msg', level: 'info' })

    assert.strictEqual(result.severity, 'INFO')
    assert.strictEqual(result.level, 30)
  })
})
