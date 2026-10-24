/**
 * @module stadium/baseballStadiumSchema
 * Mongo validator and index definitions for the `baseballStadiums` collection.
 */
import {buildStadiumSchema} from './commonSchema.js';

/** Collection name. @type {string} */
export const COLLECTION = 'baseballStadiums';

const range = (minimum, maximum) => ({bsonType: 'number', minimum, maximum});

const segments = (limits) => ({
    bsonType: 'object',
    required: Object.keys(limits),
    additionalProperties: false,
    properties: Object.fromEntries(Object.entries(limits).map(([k, v]) => [k, range(...v)])),
});

/** Baseball `dimensions` schema (MLB-style fence limits, feet). @type {object} */
export const baseballDimensions = {
    bsonType: 'object',
    required: ['fenceFt', 'wallHeightFt', 'foulTerritory'],
    additionalProperties: false,
    properties: {
        fenceFt: segments({lf: [325, 365], lcf: [340, 420], cf: [390, 440], rcf: [340, 420], rf: [325, 365]}),
        wallHeightFt: segments({lf: [3, 40], lcf: [3, 40], cf: [3, 40], rcf: [3, 40], rf: [3, 40]}),
        foulTerritory: {enum: ['small', 'medium', 'large']},
    },
};

/** Full `$jsonSchema` for `baseballStadiums`. @type {object} */
export const baseballStadiumSchema = buildStadiumSchema('baseball', baseballDimensions);

/** Mongo `collMod`/`createCollection` validator. @type {object} */
export const baseballStadiumValidator = {$jsonSchema: baseballStadiumSchema};

/** Index definitions: `{key, options}`. @type {Array<{key: object, options: object}>} */
export const baseballStadiumIndexes = [
    {key: {name: 1}, options: {unique: true, name: 'name_unique'}},
    {key: {'location.country': 1}, options: {name: 'country'}},
    {key: {gameVersion: 1}, options: {name: 'gameVersion'}},
];

/**
 * Creates the collection with its validator and indexes if missing.
 * @param {import('mongodb').Db} db - MongoDB database
 * @returns {Promise<void>}
 */
export async function ensureBaseballStadiums(db) {
    if (db === null || typeof db !== 'object' || typeof db.createCollection !== 'function') {
        throw new TypeError('db must be a MongoDB Db');
    }
    const existing = await db.listCollections({name: COLLECTION}).toArray();
    if (existing.length === 0) {
        await db.createCollection(COLLECTION, {validator: baseballStadiumValidator});
    } else {
        await db.command({collMod: COLLECTION, validator: baseballStadiumValidator});
    }
    await db.collection(COLLECTION).createIndexes(
        baseballStadiumIndexes.map(({key, options}) => ({key, ...options})),
    );
}
