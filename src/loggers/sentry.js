import { SentryTransport } from './winston-transport-sentry-node.js'

export default ({ logger }) => {
  const options = {
    sentry: {
      dsn: logger?.location,
      environment: logger?.environment || 'production',
      serverName: logger?.serverName || 'localhost',
      release: logger?.release || 'unknown',
      debug: logger?.debug || false,
      sampleRate: logger?.sampleRate || 1,
      tracesSampleRate: logger?.tracesSampleRate || 1
    },
    level: logger?.level || 'info'
  }

  return new SentryTransport(options)
}
