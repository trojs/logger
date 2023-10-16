import test from 'node:test'
import assert from 'node:assert'
import Logger from '../logger.js'
import LevelEnum from '../enums/level.js'

const ERROR = LevelEnum.fromKey('error')

test('Test the Level model', async (t) => {
  await t.test('It should parse a logger', () => {
    const logger = Logger.create({
      type: 'sentry'
    })
    const result = {
      type: 'sentry'
    }
    assert.deepEqual(logger, result)
  })

  await t.test('It should parse a logger', () => {
    const logger = Logger.createAll([{
      type: 'sentry'
    }])
    const result = [{
      type: 'sentry'
    }]
    assert.deepEqual(logger, result)
  })

  await t.test('It should parse a logger without data', () => {
    const logger = Logger.createAll()
    const result = []
    assert.deepEqual(logger, result)
  })

  await t.test('It should parse a logger with an empty array', () => {
    const logger = Logger.createAll([])
    const result = []
    assert.deepEqual(logger, result)
  })

  await t.test('It should parse a logger with full information', () => {
    const logger = Logger.create({
      type: 'sentry',
      location: 'error.log',
      level: 'error',
      key: 'test'
    })
    const result = {
      type: 'sentry',
      location: 'error.log',
      level: ERROR,
      key: 'test'
    }
    assert.deepEqual(logger, result)
  })

  await t.test('It should throw an error if the level isnt in the language list', () => {
    try {
      Logger.create({
        type: 'logger',
        level: 'something'
      })
    } catch (error) {
      assert.strictEqual(error.message, 'Invalid Level key something')
    }
  })
})
