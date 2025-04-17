import test from 'node:test'
import assert from 'node:assert'
import Level from '../level.js'

test('Test the level enum', async (t) => {
  await t.test('It should create from a key', () => {
    const level = Level.fromKey('error')
    assert.strictEqual(level.key, 'error')
    assert.strictEqual(level.value, 'error')
    assert.deepEqual(level.values, [
      'info',
      'fatal',
      'error',
      'warn',
      'debug',
      'trace'
    ])
    assert.deepEqual(Level.options, {
      info: 'info',
      fatal: 'fatal',
      error: 'error',
      warn: 'warn',
      debug: 'debug',
      trace: 'trace'
    })
    assert.deepEqual(level.keys, [
      'info',
      'fatal',
      'error',
      'warn',
      'debug',
      'trace'
    ])
    assert.strictEqual(level.error, 'error')
    assert.strictEqual(level.length, 6)
  })

  await t.test('It should create from an value', () => {
    const level = Level.fromValue('error')
    assert.strictEqual(level.key, 'error')
    assert.strictEqual(level.value, 'error')
    assert.deepEqual(level.values, [
      'info',
      'fatal',
      'error',
      'warn',
      'debug',
      'trace'
    ])
    assert.deepEqual(Level.options, {
      info: 'info',
      fatal: 'fatal',
      error: 'error',
      warn: 'warn',
      debug: 'debug',
      trace: 'trace'
    })
    assert.deepEqual(level.keys, [
      'info',
      'fatal',
      'error',
      'warn',
      'debug',
      'trace'
    ])
    assert.strictEqual(level.error, 'error')
    assert.strictEqual(level.length, 6)
  })

  await t.test('It should work with the static methods', () => {
    assert.strictEqual(Level.hasKey('error'), true)
    assert.strictEqual(Level.hasKey('something'), false)
    assert.strictEqual(Level.hasValue('error'), true)
    assert.strictEqual(Level.hasValue('something'), false)
  })

  await t.test('It should throw an exception for an unknown key', () => {
    try {
      Level.fromKey('something')
    } catch (error) {
      assert.strictEqual(error.message, 'Invalid Level key something')
    }
  })

  await t.test('It should throw an exception for an unknown value', () => {
    try {
      Level.fromValue('something')
    } catch (error) {
      assert.strictEqual(error.message, 'Invalid Level value something')
    }
  })
})
