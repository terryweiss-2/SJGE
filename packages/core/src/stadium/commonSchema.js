/**
 * @module stadium/commonSchema
 * Shared MongoDB `$jsonSchema` fragments for all stadium collections.
 * See specs/schema/STADIUM.SCHEMA.md.
 */

/** Allowed sports. @type {string[]} */
export const SPORTS = ['baseball', 'motorsport'];

/** Allowed climate types. @type {string[]} */
export const CLIMATE_TYPES = ['temperate', 'tropical', 'arid', 'continental', 'polar', 'dome'];

/** Properties common to every stadium document. @type {object} */
export const commonProperties = {
    _id: {bsonType: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$'},
    name: {bsonType: 'string', minLength: 1},
    sport: {enum: SPORTS},
    gameVersion: {bsonType: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$'},
    capacity: {bsonType: 'int', minimum: 1},
    location: {
        bsonType: 'object',
        required: ['city', 'region', 'country', 'lat', 'lng', 'timezone'],
        additionalProperties: false,
        properties: {
            city: {bsonType: 'string', minLength: 1},
            region: {bsonType: 'string'},
            country: {bsonType: 'string', pattern: '^[A-Z]{2}$'},
            lat: {bsonType: 'double', minimum: -90, maximum: 90},
            lng: {bsonType: 'double', minimum: -180, maximum: 180},
            timezone: {bsonType: 'string', minLength: 1},
        },
    },
    climate: {
        bsonType: 'object',
        required: ['type', 'altitudeFt', 'avgTempF'],
        additionalProperties: false,
        properties: {
            type: {enum: CLIMATE_TYPES},
            altitudeFt: {bsonType: 'number', minimum: -300},
            avgTempF: {bsonType: 'number', minimum: -60, maximum: 130},
        },
    },
};

/** Required common field names. @type {string[]} */
export const commonRequired = [
    '_id', 'name', 'sport', 'gameVersion', 'capacity', 'location', 'climate', 'dimensions',
];

/**
 * Builds a full `$jsonSchema` from the common fields plus a sport-specific `dimensions` schema.
 * @param {string} sport - sport discriminator the collection holds
 * @param {object} dimensions - `$jsonSchema` for the `dimensions` property
 * @returns {object} the `$jsonSchema` document
 */
export function buildStadiumSchema(sport, dimensions) {
    if (typeof sport !== 'string' || !SPORTS.includes(sport)) {
        throw new TypeError(`sport must be one of ${SPORTS.join(', ')}`);
    }
    if (dimensions === null || typeof dimensions !== 'object') {
        throw new TypeError('dimensions must be an object');
    }
    return {
        bsonType: 'object',
        required: commonRequired,
        additionalProperties: false,
        properties: {
            ...commonProperties,
            sport: {enum: [sport]},
            dimensions,
        },
    };
}
