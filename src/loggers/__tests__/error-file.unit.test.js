import test from 'node:test'
import assert from 'node:assert'
import winston from 'winston'
import makeErrorFileLogger from '../error-file.js'

test('Test the error file logger', async (t) => {
    await t.test(
        'It should make the error file logger with default settings',
        () => {
            const logger = makeErrorFileLogger({ winston })
            assert.strictEqual(logger.name, 'file')
            assert.strictEqual(logger instanceof winston.Transport, true)
            assert.strictEqual(logger.level, 'error')
            assert.strictEqual(logger.handleExceptions, undefined)
            assert.strictEqual(logger.handleRejections, undefined)
            assert.strictEqual(logger.silent, undefined)
            assert.strictEqual(logger.stderrLevels, undefined)
            assert.strictEqual(logger.writable, true)
            assert.strictEqual(logger.format, undefined)
            assert.strictEqual(logger.consoleWarnLevels, undefined)
            assert.strictEqual(logger.filename, 'error.log')
            assert.deepEqual(logger.options, {
                flags: 'a'
            })
        }
    )

    await t.test('It should make the error file logger', () => {
        const logger = makeErrorFileLogger({
            winston,
            logger: { level: 'info', location: 'test.test' }
        })
        assert.strictEqual(logger.name, 'file')
        assert.strictEqual(logger instanceof winston.Transport, true)
        assert.strictEqual(logger.level, 'info')
        assert.strictEqual(logger.handleExceptions, undefined)
        assert.strictEqual(logger.handleRejections, undefined)
        assert.strictEqual(logger.silent, undefined)
        assert.strictEqual(logger.stderrLevels, undefined)
        assert.strictEqual(logger.writable, true)
        assert.strictEqual(logger.format, undefined)
        assert.strictEqual(logger.consoleWarnLevels, undefined)
        assert.strictEqual(logger.filename, 'test.test')
        assert.deepEqual(logger.options, {
            flags: 'a'
        })
    })
})
