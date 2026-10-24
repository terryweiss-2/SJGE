/**
 * @module stadium/stadiums
 * Loader and query utilities for the bundled stadium dataset.
 */
import check from 'check-types';
import fs from 'node:fs';
import yaml from 'yaml';

const DEFAULT_STADIUMS_FILE = new URL('./stadiums.yaml', import.meta.url);

/**
 * Loads and parses stadium documents from a YAML file.
 * @param {string|URL} [filePath] - Optional path or URL to stadiums YAML file.
 * @returns {Array<object>} Array of parsed stadium objects.
 */
export function loadStadiums(filePath = DEFAULT_STADIUMS_FILE) {
    if (filePath instanceof URL) {
        // Valid URL
    } else {
        check.assert.nonEmptyString(filePath, 'filePath must be a non-empty string or URL');
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.parse(content);
    check.assert.array(parsed, 'stadiums dataset must be a YAML array of stadium documents');
    return parsed;
}

/**
 * Preloaded list of built-in stadium definitions.
 * @type {ReadonlyArray<object>}
 */
export const stadiums = Object.freeze(loadStadiums());

/**
 * Retrieves a stadium by its unique slug identifier.
 * @param {string} id - Stadium slug identifier (e.g. 'emerald-cove-park').
 * @returns {object|undefined} The matching stadium object, or undefined if not found.
 */
export function getStadiumById(id) {
    check.assert.nonEmptyString(id, 'id must be a non-empty string');
    return stadiums.find((stadium) => stadium._id === id);
}

/**
 * Returns the file URL path to the SVG asset for a given stadium ID.
 * @param {string} id - Stadium slug identifier (e.g. 'emerald-cove-park').
 * @returns {URL} File URL to the stadium SVG asset.
 * @throws {Error} If id is invalid or stadium does not exist.
 */
export function getStadiumSvgPath(id) {
    check.assert.nonEmptyString(id, 'id must be a non-empty string');
    const stadium = getStadiumById(id);
    if (!stadium) {
        throw new Error(`Stadium with id "${id}" not found`);
    }
    const svgUrl = new URL(`./svg/${id}.svg`, import.meta.url);
    if (!fs.existsSync(svgUrl)) {
        throw new Error(`SVG asset for stadium "${id}" not found`);
    }
    return svgUrl;
}

/**
 * Reads and returns the raw SVG string for a given stadium ID.
 * @param {string} id - Stadium slug identifier (e.g. 'emerald-cove-park').
 * @returns {string} Raw SVG XML markup.
 * @throws {Error} If id is invalid or stadium SVG is not found.
 */
export function getStadiumSvg(id) {
    const svgPath = getStadiumSvgPath(id);
    return fs.readFileSync(svgPath, 'utf8');
}
