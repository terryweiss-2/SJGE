/**
 * @module config
 * Configuration manager merging config.yaml files, `ETL_` environment variables and CLI arguments.
 */
import check from 'check-types';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';
import {getLogger} from './logger.js';

const DEFAULT_ENVIRONMENT = 'development';
const KNOWN_ENVIRONMENTS = ['development', 'test', 'production', 'staging'];
const CONFIG_FILE = 'config.yaml';
const ENV_PREFIX = 'ETL_';
const VERBOSE_LEVELS = ['start', 'trace', 'debug'];

const cache = new Map();

const isPlain = (v) => check.object(v) && !Array.isArray(v);

function merge(base, over) {
    const out = {...base};
    for (const [key, value] of Object.entries(over)) {
        out[key] = isPlain(value) && isPlain(out[key]) ? merge(out[key], value) : value;
    }
    return out;
}

function coerce(value) {
    if (typeof value !== 'string') {
        return value;
    }
    if (value === 'true' || value === 'false') {
        return value === 'true';
    }
    if (value.trim() !== '' && check.number(Number(value))) {
        return Number(value);
    }
    return value;
}

function toCamel(name) {
    return name.toLowerCase().replace(/_+([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function findDirs(cwd, log) {
    const dirs = [];
    let dir = cwd;
    for (; ;) {
        dirs.push(dir);
        if (hasWorkspaces(dir) || fs.existsSync(path.join(dir, '.git'))) {
            return dirs;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            log.warning('No project root found; using only the current directory');
            return [cwd];
        }
        dir = parent;
    }
}

function hasWorkspaces(dir) {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
        return pkg.workspaces !== undefined;
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
        err.message = `${path.join(dir, 'package.json')}: ${err.message}`;
        throw err;
    }
}

function readFile(file) {
    let text;
    try {
        text = fs.readFileSync(file, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            return undefined;
        }
        throw err;
    }
    try {
        return yaml.parse(text) ?? {};
    } catch (err) {
        err.message = `${file}: ${err.message}`;
        throw err;
    }
}

function flatten(doc, environment) {
    if (!isPlain(doc)) {
        return {};
    }
    const shared = {};
    for (const [key, value] of Object.entries(doc)) {
        if (isPlain(value) && (key === environment || KNOWN_ENVIRONMENTS.includes(key))) {
            continue;
        }
        shared[key] = value;
    }
    return isPlain(doc[environment]) ? merge(shared, doc[environment]) : shared;
}

function parseCli(argv) {
    const parsed = yargs(argv)
        .option('verbose', {alias: 'v', type: 'count', describe: 'Logger verbosity'})
        .option('environment', {alias: 'e', type: 'string', describe: 'Environment section to load'})
        .help(false)
        .version(false)
        .exitProcess(false)
        .parseSync();
    const out = {};
    const skip = new Set(['_', '$0', 'v', 'verbose', 'e', 'environment']);
    for (const [key, value] of Object.entries(parsed)) {
        if (!skip.has(key)) {
            out[key] = value;
        }
    }
    const verbose = parsed.verbose;
    if (verbose > 0) {
        out.loggerLevel = VERBOSE_LEVELS[Math.min(verbose, VERBOSE_LEVELS.length - 1)];
    }
    return {values: out, environment: parsed.environment};
}

/**
 * Load the merged configuration (files < environment variables < command line).
 * @param {string} [environment] Environment section; defaults to `-e`, ETL_ENV, then `development`.
 * @param {{cwd?: string, argv?: string[]}} [options] Start directory and arguments (defaults to process values).
 * @returns {object} Cached configuration object.
 */
export function loadConfig(environment, options) {
    check.assert.maybe.nonEmptyString(environment);
    check.assert.maybe.object(options);
    const cwd = path.resolve(options?.cwd ?? process.cwd());
    const argv = options?.argv ?? hideBin(process.argv);
    check.assert.array(argv);

    dotenv.config({quiet: true});
    const cli = parseCli(argv);
    const env = environment ?? cli.environment ?? process.env.ETL_ENV ?? DEFAULT_ENVIRONMENT;

    const key = JSON.stringify([env, cwd, argv]);
    if (cache.has(key)) {
        return cache.get(key);
    }

    const log = getLogger('config');
    const sources = [];
    let config = {};
    for (const dir of findDirs(cwd, log)) {
        const file = path.join(dir, CONFIG_FILE);
        const doc = readFile(file);
        if (doc === undefined) {
            continue;
        }
        sources.push(file);
        // dirs run inside-out, so existing values win over parent files
        config = merge(flatten(doc, env), config);
    }

    const fromEnv = {};
    for (const [name, value] of Object.entries(process.env)) {
        if (name.startsWith(ENV_PREFIX) && name.length > ENV_PREFIX.length) {
            fromEnv[toCamel(name.slice(ENV_PREFIX.length))] = coerce(value);
        }
    }
    config = merge(config, fromEnv);
    config = merge(config, cli.values);

    log.debug(`Loaded config for "${env}" from ${sources.length} file(s): ${sources.join(', ')}; keys: ${Object.keys(config).join(', ')}`);
    cache.set(key, config);
    return config;
}
