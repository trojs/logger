import winston from 'winston';
import makeLoggers from './loggers/index.js';

/**
 * @typedef {import('./models/schemas/logger.js').Logger} LoggerType
 * @typedef {import('./models/enums/level.js').LevelType} LevelType
 */

/** @type {LoggerType[]} */
const defaultLoggers = [
    {
        type: 'console',
    },
];

const levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};

/**
 * Create the logger
 * @param {object} config
 * @param {LoggerType=} config.loggers
 * @param {string?=} config.level
 * @param {object?=} config.meta
 * @returns {winston.Logger}
 */
export default ({ loggers = defaultLoggers, level = 'info', meta = {} }) => {
    const winstonLoggers = makeLoggers({ winston, loggers });

    return winston.createLogger({
        level,
        levels,
        format: winston.format.json(),
        defaultMeta: meta,
        transports: winstonLoggers,
    });
};
