import { PubSub } from '@google-cloud/pubsub'

const getCredentials = (credentials) => credentials.constructor === String ? JSON.parse(credentials) : credentials

const getPubSubClient = (projectId, credentials) => {
  if (!projectId || !credentials) {
    throw new Error('Unable to locate GCP Service Account and/or GCP Project')
  }

  return new PubSub({
    projectId,
    credentials: getCredentials(credentials)
  })
}

export default getPubSubClient
export {
  getCredentials,
  getPubSubClient
}
