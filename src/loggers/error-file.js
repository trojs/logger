export default ({ winston, logger }) => new winston.transports.File({
  filename: logger?.location || 'error.log',
  level: logger?.level || 'error'
})
