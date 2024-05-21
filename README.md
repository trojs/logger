# logger
Generic logger with intergrations for e.g. Sentry

```javascript
import makeLogger from '@trojs/logger';

const logger = makeLogger({
  level: 'info', 
  service: 'user-service',
  loggers: [
    {
      type: 'console'
    },
    {
      type: 'sentry',
      level: 'error',
      location: 'https://12345678@234567151173.ingest.sentry.io/1234567'
    }
  ]
})

try {
  throw new Error('example')
} catch(error) {
  logger.error(error, { whatever: "is sent as extra" });
}
```

# level

default: info

Log only if [`info.level`](#streams-objectmode-and-info-objects) less than or equal to this level

More info see: https://www.npmjs.com/package/winston#logging-levels

# service

default: user-service

# Loggers:

Set of logging targets for `info` messages

default:
```javascript
[
  {
    type: 'console'
  }
]
```

Types:

 * sentry
 * errorFile
 * combinedFile
 * console

The default loggers are overruled by the loggers in the `loggers` array.

It use winston transports for all logger types.
More info see: https://www.npmjs.com/package/winston#transports

## sentry

* location (sentry.dsn)
* environment (default: production, sentry.environment)
* serverName (default: localhost, sentry.serverName)
* release (default: unknown, sentry.release)
* debug (default: false, sentry.debug)
* sampleRate (default: 1, sentry.sampleRate)
* tracesSampleRate (default: 1, senty.tracesSampleRate)
* level (default: info)

DSN:

The DSN tells the SDK where to send the events. If this value is not provided, the SDK will try to read it from the SENTRY_DSN environment variable. If that variable also does not exist, the SDK will just not send any events.

More info: 

* https://github.com/aandrewww/winston-transport-sentry-node
* https://docs.sentry.io/platforms/node/
* https://docs.sentry.io/platforms/javascript/

## errorFile

* location (default: error.log)
* level (default: error)

## combinedFile

* location (default: combined.log)

## console
