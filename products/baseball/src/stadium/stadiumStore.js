/**
 * @module stadium/stadiumStore
 * Reads, tops up and writes the baseball stadium dataset (`stadiums.yaml`) and its `<id>.svg` images.
 */
import check from 'check-types';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import {BaseballStadiumGenerator} from './baseballStadiumGenerator.js';

/** Default number of stadiums. @type {number} */
export const DEFAULT_NUM_STADIUMS = 125;

/** Default stadium assets directory (`products/baseball/assets/stadiums`). @type {URL} */
export const DEFAULT_STADIUMS_DIR = new URL('../../assets/stadiums/', import.meta.url);

/** Name of the dataset file inside the stadiums directory. @type {string} */
export const STADIUMS_FILE = 'stadiums.yaml';

/**
 * Resolves the requested stadium count from loaded config (`numStadiums`, or the unaliased `n`).
 * @param {object} config - result of `loadConfig()`
 * @returns {number} positive integer count, {@link DEFAULT_NUM_STADIUMS} when not set
 * @throws {Error} if the value is not a positive integer
 */
export function resolveCount(config) {
    check.assert.object(config, 'config must be an object');
    const value = config.numStadiums ?? config.n ?? DEFAULT_NUM_STADIUMS;
    if (!check.integer(value) || !check.positive(value)) {
        throw new Error(`numStadiums must be a positive integer, got ${JSON.stringify(value)}`);
    }
    return value;
}

/**
 * Loads stadiums from a YAML file; a missing file yields an empty list.
 * @param {string} file - path of the YAML file
 * @returns {Array<object>} stadium documents
 */
export function loadStadiums(file) {
    check.assert.nonEmptyString(file, 'file must be a non-empty string');
    let text;
    try {
        text = fs.readFileSync(file, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
    const parsed = yaml.parse(text) ?? [];
    check.assert.array(parsed, `${file} must be a YAML array of stadium documents`);
    return parsed;
}

/**
 * Tops the stadium dataset up to `count`, writes missing SVGs and deletes orphan SVGs.
 * Existing stadiums are reused unchanged and never deleted; only the shortfall is generated.
 * @param {object} options - sync options
 * @param {string} options.dir - stadiums directory containing `stadiums.yaml` and the SVGs
 * @param {number} options.count - target number of stadiums (positive integer)
 * @param {number} [options.seed] - generator seed
 * @returns {{total: number, added: number, svgsWritten: number, orphansDeleted: string[]}} summary
 */
export function syncStadiums({dir, count, seed}) {
    check.assert.nonEmptyString(dir, 'dir must be a non-empty string');
    check.assert.integer(count, 'count must be an integer');
    check.assert.positive(count, 'count must be positive');
    check.assert.maybe.integer(seed, 'seed must be an integer');

    fs.mkdirSync(dir, {recursive: true});
    const file = path.join(dir, STADIUMS_FILE);
    const existing = loadStadiums(file);
    const generator = new BaseballStadiumGenerator(seed === undefined ? {} : {seed});
    const {stadiums, added} = generator.generate({count, existing});

    if (added.length > 0 || !fs.existsSync(file)) {
        fs.writeFileSync(file, yaml.stringify(stadiums), 'utf8');
    }

    let svgsWritten = 0;
    for (const stadium of stadiums) {
        const svgFile = path.join(dir, `${stadium._id}.svg`);
        if (!fs.existsSync(svgFile)) {
            fs.writeFileSync(svgFile, generator.renderSvg(stadium), 'utf8');
            svgsWritten++;
        }
    }

    const ids = new Set(stadiums.map((stadium) => stadium._id));
    const orphansDeleted = [];
    for (const entry of fs.readdirSync(dir)) {
        if (entry.endsWith('.svg') && !ids.has(entry.slice(0, -4))) {
            fs.unlinkSync(path.join(dir, entry));
            orphansDeleted.push(entry);
        }
    }

    return {total: stadiums.length, added: added.length, svgsWritten, orphansDeleted};
}
