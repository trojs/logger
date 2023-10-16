import Transport from 'winston-transport'
import ecsFormat from '@elastic/ecs-winston-format'

const makePubSubElasticLogger = ({ logger, pubSub }) => {
  const defaultLevel = 'trace'

  return new PubSubElasticTransporter({
    ...logger,
    level: logger.level || defaultLevel,
    format: ecsFormat(),
    topicName: logger.topic,
    elasticIndex: logger.index,
    maxMessages: logger.maxMessages || 5,
    maxWaitTime: logger.maxWaitTime || 5000
  }, pubSub)
}

class PubSubElasticTransporter extends Transport {
  constructor (opts, pubSub) {
    super(opts)

    this.pubSub = undefined
    this.publisher = undefined
    this.elasticIndex = undefined

    this.setPubSub(pubSub)
    this.setElasticIndex(opts)
    this.setTopic(opts)
  }

  setPubSub (pubSub) {
    if (!pubSub) throw Error('PubSub is required')

    this.pubSub = pubSub
  }

  setElasticIndex ({ elasticIndex }) {
    if (!elasticIndex) throw Error('Elastic Index is required for the Elastic PubSub Transporter')

    this.elasticIndex = elasticIndex
  }

  setTopic (opts) {
    if (!opts.topicName) throw Error('Topic name is required for the Elastic PubSub Transporter')

    this.publisher = this.pubSub.topic(opts.topicName, {
      batching: {
        maxMessages: opts.maxMessages,
        maxMilliseconds: opts.maxWaitTime
      }
    })
  }

  async log (message, callback) {
    setImmediate(() => {
      this.emit('logged', message)
    })

    if (this.silent) return callback()

    const dataBuffer = Buffer.from(JSON.stringify(message))
    this.publisher.publish(dataBuffer, {
      index: this.elasticIndex
    })

    return callback()
  }
}

export default makePubSubElasticLogger
export {
  PubSubElasticTransporter,
  makePubSubElasticLogger
}
