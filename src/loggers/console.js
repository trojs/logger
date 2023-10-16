import stackDriver from '../helpers/stackdriver.js'

export default ({ winston, logger }) => {
  const defaultLevel = 'trace'

  return new winston.transports.Console({
    level: logger?.level || defaultLevel,
    format: winston.format.combine(
      winston.format(stackDriver({ level: logger?.level, defaultLevel }))(),
      winston.format.json()
    )
  })
}
