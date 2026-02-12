export default ({ winston, logger }) =>
  new winston.transports.File({
    filename: logger?.location || 'combined.log',
    handleExceptions: true,
    handleRejections: true
  })
