import { LoggingWinston } from '@google-cloud/logging-winston'

export default ({ logger }) => {
  const options = {
    projectId: logger?.key,
    keyFilename: logger?.location,
    credentials: logger?.credentials,
    labels: {
      name: logger?.serverName || 'localhost',
      version: logger?.release || 'unknown',
      environment: logger?.environment || 'production'
    },
    serviceContext: {
      service: logger?.serverName || 'user-service',
      version: logger?.release || 'unknown'
    }
  }

  return new LoggingWinston(options)
}
