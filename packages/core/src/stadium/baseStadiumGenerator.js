/**
 * @module stadium/baseStadiumGenerator
 * Sport-agnostic stadium generator producing the fields common to every stadium
 * (`_id`, `name`, `sport`, `gameVersion`, `capacity`, `location`, `climate`).
 * Sport specific generators extend {@link BaseStadiumGenerator} and add `dimensions`.
 */
import check from 'check-types';
import {CLIMATE_TYPES, SPORTS} from './commonSchema.js';

/** Default game version stamped on generated stadiums. @type {string} */
export const DEFAULT_GAME_VERSION = '0.1.0';

/** Name prefixes combined with {@link NAME_SUFFIXES} to build stadium names. @type {string[]} */
export const NAME_PREFIXES = [
    'Amber', 'Anchor', 'Aspen', 'Beacon', 'Birch', 'Bluff', 'Bronze', 'Cedar', 'Cinder', 'Clearwater',
    'Copper', 'Cypress', 'Dawn', 'Eagle', 'Falcon', 'Granite', 'Harvest', 'Heron', 'Iron', 'Juniper',
    'Kestrel', 'Lantern', 'Maple', 'Meadow', 'Mesa', 'Northern', 'Oakwood', 'Orchard', 'Pelican', 'Pioneer',
    'Prairie', 'Quarry', 'Ridge', 'River', 'Sable', 'Silver', 'Summit', 'Sunset', 'Thunder', 'Willow',
];

/** Name suffixes combined with {@link NAME_PREFIXES} to build stadium names. @type {string[]} */
export const NAME_SUFFIXES = ['Park', 'Field', 'Stadium', 'Yards', 'Grounds', 'Ballpark', 'Arena'];

/**
 * Candidate locations: `[city, region, country, lat, lng, timezone, climateType, altitudeFt, avgTempF]`.
 * @type {Array<Array<string|number>>}
 */
export const LOCATIONS = [
    ['Atlanta', 'Georgia', 'US', 33.7490, -84.3880, 'America/New_York', 'temperate', 1050, 61.5],
    ['Austin', 'Texas', 'US', 30.2672, -97.7431, 'America/Chicago', 'temperate', 489, 68.5],
    ['Boston', 'Massachusetts', 'US', 42.3601, -71.0589, 'America/New_York', 'continental', 20, 51.5],
    ['Buffalo', 'New York', 'US', 42.8864, -78.8784, 'America/New_York', 'continental', 600, 48.5],
    ['Charlotte', 'North Carolina', 'US', 35.2271, -80.8431, 'America/New_York', 'temperate', 751, 60.5],
    ['Chicago', 'Illinois', 'US', 41.8781, -87.6298, 'America/Chicago', 'continental', 594, 50.0],
    ['Dallas', 'Texas', 'US', 32.7767, -96.7970, 'America/Chicago', 'temperate', 430, 66.0],
    ['Detroit', 'Michigan', 'US', 42.3314, -83.0458, 'America/Detroit', 'continental', 600, 50.0],
    ['Houston', 'Texas', 'US', 29.7604, -95.3698, 'America/Chicago', 'tropical', 80, 69.5],
    ['Kansas City', 'Missouri', 'US', 39.0997, -94.5786, 'America/Chicago', 'continental', 910, 55.5],
    ['Las Vegas', 'Nevada', 'US', 36.1699, -115.1398, 'America/Los_Angeles', 'arid', 2001, 70.0],
    ['Los Angeles', 'California', 'US', 34.0522, -118.2437, 'America/Los_Angeles', 'temperate', 285, 66.0],
    ['Miami', 'Florida', 'US', 25.7617, -80.1918, 'America/New_York', 'tropical', 6, 77.0],
    ['Minneapolis', 'Minnesota', 'US', 44.9778, -93.2650, 'America/Chicago', 'continental', 830, 45.5],
    ['Nashville', 'Tennessee', 'US', 36.1627, -86.7816, 'America/Chicago', 'temperate', 597, 59.5],
    ['Philadelphia', 'Pennsylvania', 'US', 39.9526, -75.1652, 'America/New_York', 'temperate', 40, 55.0],
    ['Phoenix', 'Arizona', 'US', 33.4484, -112.0740, 'America/Phoenix', 'arid', 1086, 75.0],
    ['Pittsburgh', 'Pennsylvania', 'US', 40.4406, -79.9959, 'America/New_York', 'continental', 1223, 51.5],
    ['Portland', 'Oregon', 'US', 45.5152, -122.6784, 'America/Los_Angeles', 'temperate', 50, 54.5],
    ['Salt Lake City', 'Utah', 'US', 40.7608, -111.8910, 'America/Denver', 'arid', 4226, 52.0],
    ['San Diego', 'California', 'US', 32.7157, -117.1611, 'America/Los_Angeles', 'temperate', 62, 64.5],
    ['San Francisco', 'California', 'US', 37.7749, -122.4194, 'America/Los_Angeles', 'temperate', 52, 58.0],
    ['St. Louis', 'Missouri', 'US', 38.6270, -90.1994, 'America/Chicago', 'continental', 466, 57.0],
    ['Tampa', 'Florida', 'US', 27.9506, -82.4572, 'America/New_York', 'tropical', 48, 73.5],
    ['Honolulu', 'Hawaii', 'US', 21.3069, -157.8583, 'Pacific/Honolulu', 'tropical', 20, 77.5],
    ['Toronto', 'Ontario', 'CA', 43.6532, -79.3832, 'America/Toronto', 'continental', 250, 47.0],
    ['Montreal', 'Quebec', 'CA', 45.5017, -73.5673, 'America/Toronto', 'continental', 118, 43.5],
    ['Vancouver', 'British Columbia', 'CA', 49.2827, -123.1207, 'America/Vancouver', 'temperate', 230, 52.0],
    ['Calgary', 'Alberta', 'CA', 51.0447, -114.0719, 'America/Edmonton', 'continental', 3557, 40.5],
    ['Mexico City', 'CDMX', 'MX', 19.4326, -99.1332, 'America/Mexico_City', 'temperate', 7350, 64.0],
    ['Guadalajara', 'Jalisco', 'MX', 20.6597, -103.3496, 'America/Mexico_City', 'temperate', 5138, 67.0],
    ['Monterrey', 'Nuevo Leon', 'MX', 25.6866, -100.3161, 'America/Monterrey', 'arid', 1778, 73.0],
    ['Havana', 'La Habana', 'CU', 23.1136, -82.3666, 'America/Havana', 'tropical', 79, 77.0],
    ['Santo Domingo', 'Distrito Nacional', 'DO', 18.4861, -69.9312, 'America/Santo_Domingo', 'tropical', 46, 79.0],
    ['San Juan', 'Puerto Rico', 'PR', 18.4655, -66.1057, 'America/Puerto_Rico', 'tropical', 10, 80.0],
    ['Caracas', 'Capital District', 'VE', 10.4806, -66.9036, 'America/Caracas', 'tropical', 3025, 72.0],
    ['Tokyo', 'Tokyo', 'JP', 35.6762, 139.6503, 'Asia/Tokyo', 'temperate', 130, 60.5],
    ['Osaka', 'Osaka', 'JP', 34.6937, 135.5023, 'Asia/Tokyo', 'temperate', 40, 62.0],
    ['Seoul', 'Seoul', 'KR', 37.5665, 126.9780, 'Asia/Seoul', 'continental', 125, 54.0],
    ['Taipei', 'Taipei', 'TW', 25.0330, 121.5654, 'Asia/Taipei', 'tropical', 30, 72.0],
    ['Sydney', 'New South Wales', 'AU', -33.8688, 151.2093, 'Australia/Sydney', 'temperate', 190, 64.0],
    ['Amsterdam', 'North Holland', 'NL', 52.3676, 4.9041, 'Europe/Amsterdam', 'temperate', -7, 51.0],
];

/**
 * Creates a deterministic pseudo random number generator (mulberry32).
 * @param {number} seed - integer seed
 * @returns {function(): number} function returning floats in `[0, 1)`
 */
export function createRng(seed) {
    check.assert.integer(seed, 'seed must be an integer');
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Converts a display name into a slug matching the stadium `_id` pattern.
 * @param {string} text - display name
 * @returns {string} lowercase hyphenated slug
 */
export function slugify(text) {
    check.assert.nonEmptyString(text, 'text must be a non-empty string');
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const between = (rng, min, max) => min + rng() * (max - min);
const round = (value, places) => Number(value.toFixed(places));

/** Generates the common stadium fields for any sport. */
export class BaseStadiumGenerator {
    /**
     * @param {object} options - generator options
     * @param {string} options.sport - one of `SPORTS`
     * @param {string} [options.gameVersion] - semver stamped on stadiums (default `0.1.0`)
     * @param {number} [options.seed] - integer seed for reproducible output (default 1)
     */
    constructor(options) {
        check.assert.object(options, 'options must be an object');
        check.assert.in(options.sport, SPORTS, `sport must be one of ${SPORTS.join(', ')}`);
        check.assert.maybe.match(options.gameVersion, /^\d+\.\d+\.\d+$/, 'gameVersion must be semver');
        check.assert.maybe.integer(options.seed, 'seed must be an integer');
        /** @type {string} */
        this.sport = options.sport;
        /** @type {string} */
        this.gameVersion = options.gameVersion ?? DEFAULT_GAME_VERSION;
        /** @type {number} */
        this.seed = options.seed ?? 1;
    }

    /**
     * Creates the seeded RNG for a generation run.
     * @param {number} [offset] - integer added to the seed, e.g. the number of existing stadiums
     * @returns {function(): number} RNG
     */
    createRng(offset = 0) {
        check.assert.integer(offset, 'offset must be an integer');
        return createRng(this.seed + offset);
    }

    /**
     * Generates one stadium with the common fields; the id is unique against `existingIds`.
     * @param {function(): number} rng - random source returning floats in `[0, 1)`
     * @param {Iterable<string>|Set<string>} existingIds - ids already in use
     * @returns {{_id: string, name: string, sport: string, gameVersion: string, capacity: number,
     *   location: object, climate: object}} stadium without sport specific `dimensions`
     */
    generateCommon(rng, existingIds) {
        check.assert.function(rng, 'rng must be a function');
        check.assert.assigned(existingIds, 'existingIds is required');
        const taken = existingIds instanceof Set ? existingIds : new Set(existingIds);

        let name;
        let id;
        for (let attempt = 0; ; attempt++) {
            name = `${pick(rng, NAME_PREFIXES)} ${pick(rng, NAME_SUFFIXES)}`;
            if (attempt > 200) {
                name = `${name} ${attempt}`;
            }
            id = slugify(name);
            if (!taken.has(id)) {
                break;
            }
        }

        const [city, region, country, lat, lng, timezone, baseClimate, altitudeFt, avgTempF] = pick(rng, LOCATIONS);
        const climateType = baseClimate !== 'dome' && rng() < 0.08 ? 'dome' : baseClimate;
        check.assert.in(climateType, CLIMATE_TYPES);

        return {
            _id: id,
            name,
            sport: this.sport,
            gameVersion: this.gameVersion,
            capacity: Math.round(between(rng, 20000, 60000) / 100) * 100,
            location: {
                city,
                region,
                country,
                lat: round(Math.min(90, Math.max(-90, lat + between(rng, -0.05, 0.05))), 4),
                lng: round(Math.min(180, Math.max(-180, lng + between(rng, -0.05, 0.05))), 4),
                timezone,
            },
            climate: {
                type: climateType,
                altitudeFt,
                avgTempF: climateType === 'dome' ? 72 : round(avgTempF + between(rng, -1, 1), 1),
            },
        };
    }
}
