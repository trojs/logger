import test from 'node:test';
import assert from 'node:assert';
import winston from 'winston';
import makeLoggers from '../index.js';

test('Test the make loggers', async (t) => {
    await t.test('It should make the loggers', () => {
        const loggers = makeLoggers({
            winston,
            loggers: [
                {
                    type: 'console',
                },
            ],
        });
        const logger = loggers[0];
        assert.strictEqual(logger.name, 'console');
        assert.strictEqual(logger instanceof winston.Transport, true);
        assert.strictEqual(logger.level, 'trace');
        assert.strictEqual(logger.handleExceptions, undefined);
        assert.strictEqual(logger.handleRejections, undefined);
        assert.strictEqual(logger.silent, undefined);
        assert.deepEqual(logger.stderrLevels, {});
        assert.strictEqual(logger.writable, true);
        assert.deepEqual(logger.consoleWarnLevels, {});
        assert.strictEqual(logger.filename, undefined);
        assert.strictEqual(logger.options, undefined);
    });

    await t.test(
        'It should throw an error if the logger type is invalid',
        () => {
            try {
                makeLoggers({
                    winston,
                    loggers: [
                        {
                            type: 'something',
                        },
                    ],
                });
            } catch (error) {
                assert.strictEqual(
                    error.message,
                    'Unknown logger type: something'
                );
            }
        }
    );
});
