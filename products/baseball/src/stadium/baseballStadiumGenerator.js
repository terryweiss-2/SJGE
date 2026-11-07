/**
 * @module stadium/baseballStadiumGenerator
 * Baseball stadium generator: extends the core {@link BaseStadiumGenerator} with `dimensions`,
 * validates against the core baseball schema and renders a top-down SVG per stadium.
 */
import check from 'check-types';
import {baseballStadiumSchema, BaseStadiumGenerator} from '@sjge/core';

const SEGMENTS = ['lf', 'lcf', 'cf', 'rcf', 'rf'];
const FENCE_LIMITS = baseballStadiumSchema.properties.dimensions.properties.fenceFt.properties;
const WALL_LIMITS = baseballStadiumSchema.properties.dimensions.properties.wallHeightFt.properties;
const FOUL_TERRITORY = baseballStadiumSchema.properties.dimensions.properties.foulTerritory.enum;

const FIELD_ANGLES = {lf: -45, lcf: -22.5, cf: 0, rcf: 22.5, rf: 45};
const HOME = {x: 400, y: 720};
const SCALE = 0.9;
const FOUL_MARGIN = {small: 20, medium: 35, large: 50};

const bsonTypes = {
    string: (v) => typeof v === 'string',
    object: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
    int: (v) => Number.isInteger(v),
    double: (v) => typeof v === 'number' && Number.isFinite(v),
    number: (v) => typeof v === 'number' && Number.isFinite(v),
};

/**
 * Validates a value against the subset of MongoDB `$jsonSchema` used by the stadium schemas.
 * @param {*} value - value to validate
 * @param {object} schema - `$jsonSchema` fragment
 * @param {string} [path] - location used in error messages
 * @returns {string[]} list of violations; empty when valid
 */
export function validateAgainstSchema(value, schema, path = 'stadium') {
    check.assert.object(schema, 'schema must be an object');
    const errors = [];
    if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`${path} must be one of ${schema.enum.join(', ')}`);
        return errors;
    }
    if (schema.bsonType) {
        const isType = bsonTypes[schema.bsonType];
        if (!isType || !isType(value)) {
            errors.push(`${path} must be ${schema.bsonType}`);
            return errors;
        }
    }
    if (typeof value === 'string') {
        if (schema.minLength !== undefined && value.length < schema.minLength) {
            errors.push(`${path} is shorter than ${schema.minLength}`);
        }
        if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
            errors.push(`${path} does not match ${schema.pattern}`);
        }
    }
    if (typeof value === 'number') {
        if (schema.minimum !== undefined && value < schema.minimum) {
            errors.push(`${path} is below ${schema.minimum}`);
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
            errors.push(`${path} is above ${schema.maximum}`);
        }
    }
    if (bsonTypes.object(value) && schema.properties) {
        for (const key of schema.required ?? []) {
            if (value[key] === undefined) {
                errors.push(`${path}.${key} is required`);
            }
        }
        for (const [key, child] of Object.entries(value)) {
            if (schema.properties[key] === undefined) {
                if (schema.additionalProperties === false) {
                    errors.push(`${path}.${key} is not allowed`);
                }
            } else {
                errors.push(...validateAgainstSchema(child, schema.properties[key], `${path}.${key}`));
            }
        }
    }
    return errors;
}

const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

function hash(text) {
    let h = 2166136261;
    for (const ch of text) {
        h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    }
    return h >>> 0;
}

function fencePoint(feet, segment) {
    const angle = (FIELD_ANGLES[segment] * Math.PI) / 180;
    const distance = feet * SCALE;
    return {
        x: Number((HOME.x + distance * Math.sin(angle)).toFixed(1)),
        y: Number((HOME.y - distance * Math.cos(angle)).toFixed(1)),
    };
}

/** Generates baseball stadiums (common fields plus `dimensions`) and renders their SVGs. */
export class BaseballStadiumGenerator extends BaseStadiumGenerator {
    /**
     * @param {object} [options] - same as {@link BaseStadiumGenerator} except `sport`, which is always `baseball`
     * @param {string} [options.gameVersion] - semver stamped on stadiums
     * @param {number} [options.seed] - integer seed for reproducible output
     */
    constructor(options = {}) {
        check.assert.object(options, 'options must be an object');
        super({...options, sport: 'baseball'});
    }

    /**
     * Generates baseball `dimensions` within the schema limits.
     * @param {function(): number} rng - random source returning floats in `[0, 1)`
     * @returns {{fenceFt: object, wallHeightFt: object, foulTerritory: string}} dimensions
     */
    generateDimensions(rng) {
        check.assert.function(rng, 'rng must be a function');
        const fenceFt = {};
        const wallHeightFt = {};
        for (const segment of SEGMENTS) {
            fenceFt[segment] = randomInt(rng, FENCE_LIMITS[segment].minimum, FENCE_LIMITS[segment].maximum);
            wallHeightFt[segment] = randomInt(rng, WALL_LIMITS[segment].minimum, Math.min(WALL_LIMITS[segment].maximum, 20));
        }
        return {fenceFt, wallHeightFt, foulTerritory: FOUL_TERRITORY[Math.floor(rng() * FOUL_TERRITORY.length)]};
    }

    /**
     * Generates one schema-valid baseball stadium.
     * @param {function(): number} rng - random source
     * @param {Iterable<string>} existingIds - ids already in use
     * @returns {object} stadium document
     * @throws {Error} if the generated stadium violates the baseball schema
     */
    generateStadium(rng, existingIds) {
        const stadium = {...this.generateCommon(rng, existingIds), dimensions: this.generateDimensions(rng)};
        const errors = validateAgainstSchema(stadium, baseballStadiumSchema);
        if (errors.length > 0) {
            throw new Error(`Generated stadium ${stadium._id} is invalid: ${errors.join('; ')}`);
        }
        return stadium;
    }

    /**
     * Tops up `existing` stadiums to `count` in total. Existing entries are never changed or removed.
     * @param {object} options - generation options
     * @param {number} options.count - target total number of stadiums (positive integer)
     * @param {Array<object>} [options.existing] - stadiums to reuse
     * @returns {{stadiums: Array<object>, added: Array<object>}} all stadiums (existing first) and the new ones
     */
    generate({count, existing = []}) {
        check.assert.integer(count, 'count must be an integer');
        check.assert.positive(count, 'count must be positive');
        check.assert.array(existing, 'existing must be an array');
        const ids = new Set(existing.map((stadium) => stadium._id));
        const rng = this.createRng(existing.length);
        const added = [];
        while (existing.length + added.length < count) {
            const stadium = this.generateStadium(rng, ids);
            ids.add(stadium._id);
            added.push(stadium);
        }
        return {stadiums: [...existing, ...added], added};
    }

    /**
     * Renders a top-down SVG (800x800) of the stadium using its dimensions.
     * @param {object} stadium - baseball stadium document
     * @returns {string} SVG markup
     */
    renderSvg(stadium) {
        check.assert.object(stadium, 'stadium must be an object');
        check.assert.nonEmptyString(stadium._id, 'stadium._id must be a non-empty string');
        check.assert.object(stadium.dimensions, 'stadium.dimensions must be an object');
        const {fenceFt, wallHeightFt, foulTerritory} = stadium.dimensions;
        const points = SEGMENTS.map((segment) => fencePoint(fenceFt[segment], segment));
        const [lf, , , , rf] = points;
        const fence = points.map((p) => `${p.x} ${p.y}`).join(' L ');
        const margin = FOUL_MARGIN[foulTerritory] ?? FOUL_MARGIN.medium;
        const standPoints = SEGMENTS.map((segment) => fencePoint(fenceFt[segment] + margin + 25, segment));
        const stands = standPoints.map((p) => `${p.x} ${p.y}`).join(' L ');
        const hue = 95 + (hash(stadium._id) % 45);
        const grass = `hsl(${hue},55%,34%)`;
        const grassAlt = `hsl(${hue},55%,38%)`;
        const wallWidth = 2 + Math.round((wallHeightFt.lf + wallHeightFt.lcf + wallHeightFt.cf + wallHeightFt.rcf + wallHeightFt.rf) / 5 / 4);
        const dome = stadium.climate?.type === 'dome';
        const name = String(stadium.name ?? stadium._id).replace(/[<>&"]/g, '');
        const home = `${HOME.x} ${HOME.y}`;

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${name}">
  <title>${name}</title>
  <rect width="800" height="800" fill="#1b2430"/>
  <g id="background-stands">
    <path d="M ${home} L ${stands} Z" fill="#8a93a0" stroke="#5c6470" stroke-width="4"/>
  </g>
  <g id="outfield-grass">
    <path d="M ${home} L ${fence} Z" fill="${grass}"/>
    <circle cx="${HOME.x}" cy="${HOME.y - 150}" r="220" fill="${grassAlt}" opacity="0.35"/>
  </g>
  <g id="warning-track">
    <path d="M ${fence}" fill="none" stroke="#a9744a" stroke-width="16" stroke-linejoin="round"/>
  </g>
  <g id="foul-territory">
    <path d="M ${home} L ${lf.x} ${lf.y} M ${home} L ${rf.x} ${rf.y}" stroke="#ffffff" stroke-width="3" fill="none"/>
  </g>
  <g id="infield-dirt">
    <circle cx="${HOME.x}" cy="${HOME.y - 57}" r="100" fill="#b98558"/>
    <circle cx="${HOME.x}" cy="${HOME.y - 57}" r="9" fill="#9d6d45"/>
  </g>
  <g id="base-paths-lines">
    <path d="M ${home} L 457 663 L 400 606 L 343 663 Z" fill="none" stroke="#f1e6d0" stroke-width="3"/>
  </g>
  <g id="bases">
    <rect x="452" y="658" width="10" height="10" fill="#ffffff" transform="rotate(45 457 663)"/>
    <rect x="395" y="601" width="10" height="10" fill="#ffffff" transform="rotate(45 400 606)"/>
    <rect x="338" y="658" width="10" height="10" fill="#ffffff" transform="rotate(45 343 663)"/>
    <path d="M 394 716 L 406 716 L 406 723 L 400 729 L 394 723 Z" fill="#ffffff"/>
  </g>
  <g id="outfield-wall">
    <path d="M ${fence}" fill="none" stroke="#1f5f3a" stroke-width="${wallWidth}" stroke-linejoin="round"/>
  </g>
  <g id="stadium-accents">
    <circle cx="${HOME.x}" cy="${HOME.y - 90}" r="3" fill="#f1e6d0"/>${dome ? `
    <circle cx="400" cy="480" r="380" fill="#dfe6ee" opacity="0.18" stroke="#dfe6ee" stroke-width="4"/>` : ''}
  </g>
</svg>
`;
    }
}
