import NewrelicWinston from 'winston-to-newrelic-logs'

export default ({ logger }) => {
  const options = {
    licenseKey: logger?.key,
    apiUrl: logger?.location || 'https://log-api.newrelic.com',
    pluginOptions: logger?.options || {} // customTags
  }

  return new NewrelicWinston(options)
}
