/**
 * @module logger
 * Leveled logger writing `<ISO date>|<name>|<colored level>|<message>` lines to stdout/stderr
 * and optional extra streams. Default level is `start`, overridable with `ETL_LOGGER_LEVEL`.
 */
import check from 'check-types';
import {Writable} from 'node:stream';

/**
 * Log level enum; lower values are more important.
 * @type {Readonly<Record<string, number>>}
 */
export const LoggerLevels = Object.freeze({
    error: 0,
    warning: 1,
    log: 2,
    info: 2,
    start: 3,
    end: 3,
    success: 3,
    trace: 4,
    debug: 5,
});

const DEFAULT_LEVEL = 'start';
const RESET = '\x1b[0m';
const COLORS = {
    error: '\x1b[31m',
    warning: '\x1b[33m',
    log: '\x1b[37m',
    info: '\x1b[36m',
    start: '\x1b[34m',
    end: '\x1b[35m',
    success: '\x1b[32m',
    trace: '\x1b[90m',
    debug: '\x1b[90m',
};
const STDERR_LEVELS = new Set(['error', 'debug']);

function resolveLevel(level) {
    if (check.number(level)) {
        check.assert.assigned(Object.values(LoggerLevels).find((v) => v === level), `Invalid log level: ${level}`);
        return level;
    }
    check.assert.nonEmptyString(level);
    const value = LoggerLevels[level.toLowerCase()];
    check.assert.number(value, `Invalid log level: ${level}`);
    return value;
}

function defaultLevel() {
    const env = process.env.ETL_LOGGER_LEVEL;
    if (check.nonEmptyString(env) && LoggerLevels[env.toLowerCase()] !== undefined) {
        return LoggerLevels[env.toLowerCase()];
    }
    return LoggerLevels[DEFAULT_LEVEL];
}

function formatContext(context) {
    if (context instanceof Error) {
        return context.stack || `${context.name}: ${context.message}`;
    }
    if (typeof context === 'string') {
        return context;
    }
    if (Array.isArray(context) || check.object(context)) {
        try {
            return JSON.stringify(context);
        } catch {
            return String(context);
        }
    }
    return String(context);
}

/**
 * Create a new logger.
 * @param {string} name Name written into each line.
 * @param {string|number} [level] Level name or value; defaults to ETL_LOGGER_LEVEL or `start`.
 * @param {Writable[]} [streams] Extra streams receiving every line.
 * @returns {Record<string, function(string, *=): void>} Logger with one function per level.
 */
export function getLogger(name, level, streams) {
    check.assert.nonEmptyString(name);
    check.assert.maybe.array(streams);
    const threshold = check.assigned(level) ? resolveLevel(level) : defaultLevel();
    const extra = streams ?? [];
    extra.forEach((s) => check.assert.instanceStrict(s, Writable));

    const write = (levelName, msg, context) => {
        check.assert.string(msg);
        if (LoggerLevels[levelName] > threshold) {
            return;
        }
        let message = msg;
        if (context !== undefined) {
            message += ` ${formatContext(context)}`;
        }
        const date = new Date().toISOString();
        const line = `${date}|${name}|${COLORS[levelName]}${levelName}${RESET}|${message}\n`;
        (STDERR_LEVELS.has(levelName) ? process.stderr : process.stdout).write(line);
        extra.forEach((s) => s.write(line));
    };

    const logger = {};
    for (const levelName of Object.keys(LoggerLevels)) {
        logger[levelName] = (msg, context) => write(levelName, msg, context);
    }
    return logger;
}
