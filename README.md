# logger

Generic logger with integrations for e.g. Sentry

## Features

* Multiple transport support (console, files, Sentry)
* Winston-based logging with custom transports
* Safe JSON serialization (handles circular references, deep objects, functions)
* Stackdriver/Google Cloud Logging compatible
* Automatic exception and rejection handling
* Configurable log levels per transport
* Production-ready error tracking with Sentry integration

## Quick Start

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

## Configuration

### level

default: `info`

Log only messages with a level less than or equal to this level. This acts as a global filter for all loggers unless a logger specifies its own level.

Available levels (in order of priority):
* `trace` (lowest)
* `debug`
* `info`
* `warn`
* `error`
* `fatal` (highest)

More info: <https://www.npmjs.com/package/winston#logging-levels>

### service

default: `user-service`

The service name is used to identify the source of logs. This is particularly useful when aggregating logs from multiple services.

## Loggers

Set of logging targets (transports) for log messages. Each logger can have its own configuration and log level.

Default configuration:

```javascript
[
  {
    type: 'console'
  }
]
```

Available logger types:

* `console` - Logs to stdout/stderr
* `errorFile` - Logs errors to a file
* `combinedFile` - Logs all messages to a file
* `sentry` - Sends errors to Sentry for tracking

**Note:** The default loggers are replaced (not merged) when you provide a `loggers` array.

All loggers are implemented as Winston transports. More info: <https://www.npmjs.com/package/winston#transports>

## sentry

* location (sentry.dsn)
* environment (default: production, sentry.environment)
* serverName (default: localhost, sentry.serverName)
* release (default: unknown, sentry.release)
* debug (default: false, sentry.debug)
* sampleRate (default: 1, sentry.sampleRate)
* tracesSampleRate (default: 1, sentry.tracesSampleRate)
* level (default: info)

### DSN

The DSN tells the SDK where to send the events. If this value is not provided, the SDK will try to read it from the SENTRY_DSN environment variable. If that variable also does not exist, the SDK will just not send any events.

### Example

```javascript
const logger = makeLogger({
  loggers: [
    {
      type: 'sentry',
      location: 'https://12345678@234567151173.ingest.sentry.io/1234567',
      environment: 'production',
      release: 'v1.0.0',
      level: 'error'
    }
  ]
})
```

More info:

* <https://github.com/aandrewww/winston-transport-sentry-node>
* <https://docs.sentry.io/platforms/node/>
* <https://docs.sentry.io/platforms/javascript/>

## errorFile

* location (default: error.log)
* level (default: error)

Logs error-level messages to a file.

### Example

```javascript
const logger = makeLogger({
  loggers: [
    {
      type: 'errorFile',
      location: './logs/error.log',
      level: 'error'
    }
  ]
})
```

## combinedFile

* location (default: combined.log)

Logs all messages to a file regardless of level.

### Example

```javascript
const logger = makeLogger({
  loggers: [
    {
      type: 'combinedFile',
      location: './logs/combined.log'
    }
  ]
})
```

## console

* level (default: trace)
* debug (default: false, includes stacktrace in output)
* format (default: simple, also accepts 'json' for structured logging systems)
* maxDepth (default: 5, maximum depth for nested objects in JSON format only)
* maxStringLength (default: 1000, maximum length for strings before truncation in JSON format only)

### JSON Format Features

When using `format: 'json'`, the console logger includes safe JSON serialization that handles:

* **Circular references**: Replaced with `[Circular]` to prevent serialization errors
* **Deep objects**: Objects exceeding `maxDepth` are replaced with `[Max Depth Exceeded]`
* **Long strings**: Strings exceeding `maxStringLength` are truncated with `... [truncated]`
* **Functions**: Replaced with `[Function]` since they cannot be serialized
* **Errors**: Automatically captures message, stack, and metadata
* **Stackdriver format**: Compatible with Google Cloud Logging (includes severity, time, pid, hostname)

### Examples

Simple console logging:

```javascript
const logger = makeLogger({
  loggers: [{ type: 'console' }]
})
```

JSON format with custom depth limits:

```javascript
const logger = makeLogger({
  loggers: [
    {
      type: 'console',
      format: 'json',
      maxDepth: 3,
      maxStringLength: 500,
      debug: true
    }
  ]
})
```

## Combining Multiple Loggers

You can use multiple loggers simultaneously with different configurations:

```javascript
const logger = makeLogger({
  level: 'debug',
  service: 'my-api',
  loggers: [
    {
      type: 'console',
      format: 'json',
      level: 'debug'
    },
    {
      type: 'errorFile',
      location: './logs/error.log',
      level: 'error'
    },
    {
      type: 'combinedFile',
      location: './logs/combined.log'
    },
    {
      type: 'sentry',
      location: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      level: 'error'
    }
  ]
})
```

This configuration will:

* Log all debug+ messages to console in JSON format
* Log only errors to `error.log`
* Log all messages to `combined.log`
* Send only errors to Sentry
