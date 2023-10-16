import test from 'node:test'
import assert from 'assert'
import winston from 'winston'
import { stub, createStubInstance } from 'sinon'
import makeLoggers from '../index.js'
import PubSubElastic from '../pubsub-elastic.js'

const PubSub = class {
  topic () { return this }

  publish () { return this }
}

test('Test the PubSub Elastic loggers', async t => {
  await t.test('It should make the loggers', () => {
    const logger = PubSubElastic({
      logger: {
        type: 'pubSubElastic',
        topic: 'testTopic',
        index: 'testIndex'
      },
      pubSub: new PubSub()
    })
    assert.strictEqual(logger.name, undefined)
    assert.strictEqual(logger instanceof winston.Transport, true)
    assert.strictEqual(logger.level, 'trace')
    assert.strictEqual(logger.handleExceptions, undefined)
    assert.strictEqual(logger.handleRejections, undefined)
    assert.strictEqual(logger.silent, undefined)
    assert.deepEqual(logger.stderrLevels, undefined)
    assert.strictEqual(logger.writable, true)
    assert.deepEqual(logger.consoleWarnLevels, undefined)
    assert.strictEqual(logger.filename, undefined)
    assert.strictEqual(logger.options, undefined)
  })

  await t.test('It should throw an error when no service account is set when making loggers', () => {
    try {
      makeLoggers({
        winston,
        loggers: [
          {
            type: 'pubSubElastic',
            topic: 'testTopic',
            index: 'testIndex'
          }
        ]
      })
    } catch (error) {
      assert.strictEqual(error.message, 'Unable to locate GCP Service Account and/or GCP Project')
    }
  })

  await t.test('It should throw an error if the logger is missing the topic name', () => {
    try {
      PubSubElastic({
        logger: {
          type: 'pubSubElastic',
          index: 'test'
        },
        pubSub: new PubSub()
      })
    } catch (error) {
      assert.strictEqual(
        error.message,
        'Topic name is required for the Elastic PubSub Transporter'
      )
    }
  })

  await t.test('It should throw an error if the logger is missing the elastic index', () => {
    try {
      PubSubElastic({
        logger: {
          type: 'pubSubElastic',
          topic: 'test'
        },
        pubSub: new PubSub()
      })
    } catch (error) {
      assert.strictEqual(
        error.message,
        'Elastic Index is required for the Elastic PubSub Transporter'
      )
    }
  })

  await t.test('It should process callback after message has been logged', async () => {
    const pubsubStub = createStubInstance(PubSub, {
      publish: stub().returnsThis(),
      topic: stub().returnsThis()
    })
    const logger = await PubSubElastic({
      logger: {
        topic: 'test',
        index: 'test'
      },
      pubSub: pubsubStub
    })

    const result = await logger.log('test message', () => 'done')

    assert.strictEqual(result, 'done')
    assert.strictEqual(pubsubStub.publish.callCount, 1)
  })

  await t.test('It should process callback without processing message in silent mode', async () => {
    const pubsubStub = createStubInstance(PubSub, {
      publish: stub().returnsThis(),
      topic: stub().returnsThis()
    })
    const logger = await PubSubElastic({
      logger: {
        topic: 'test',
        index: 'test',
        silent: true
      },
      pubSub: pubsubStub
    })

    const result = await logger.log('test message', () => 'done')
    assert.strictEqual(logger.silent, true)
    assert.strictEqual(result, 'done')
    assert.strictEqual(pubsubStub.publish.callCount, 0)
  })
})
