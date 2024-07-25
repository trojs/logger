import SentryPackage from 'winston-transport-sentry-node';

const Sentry = SentryPackage?.default || SentryPackage;

export default ({ logger }) => {
    const options = {
        sentry: {
            dsn: logger?.location,
            environment: logger?.environment || 'production',
            serverName: logger?.serverName || 'localhost',
            release: logger?.release || 'unknown',
            debug: logger?.debug || false,
            sampleRate: logger?.sampleRate || 1,
            tracesSampleRate: logger?.tracesSampleRate || 1,
        },
        level: logger?.level || 'info',
    };

    return new Sentry(options);
};
