import test from 'node:test';
import assert from 'node:assert';
import winston from 'winston';
import makeConsoleLogger from '../console.js';

test('Test the console logger', async (t) => {
    await t.test('It should make the console logger', () => {
        const logger = makeConsoleLogger({ winston });
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
});
