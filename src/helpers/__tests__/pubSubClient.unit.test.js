import test from 'node:test'
import assert from 'node:assert'
import { PubSub } from '@google-cloud/pubsub'
import { getPubSubClient, getCredentials } from '../pubSubClient.js'

test('Test the getCredentials helper', async (t) => {
  await t.test('It should accept an object', () => {
    const obj = { test: true }
    const result = getCredentials(obj)

    assert.deepStrictEqual(result, obj)
  })

  await t.test('It should accept an object as a string', () => {
    const obj = { test: true }
    const objString = JSON.stringify(obj)
    const result = getCredentials(objString)
    assert.deepStrictEqual(result, obj)
  })
})

test('Test the pubSubClient helper', async (t) => {
  await t.test('It should throw an error not all parameters are set', () => {
    try {
      getPubSubClient()
    } catch (error) {
      assert.strictEqual(error.message, 'Unable to locate GCP Service Account and/or GCP Project')
    }
  })

  await t.test('It should return the client', () => {
    const client = getPubSubClient('test', '{}')
    assert.strictEqual(client instanceof PubSub, true)
  })
})
