import t from 'tap';
import {existsSync, readFileSync} from 'node:fs';
import {buildStadiumSchema, CLIMATE_TYPES} from '../src/stadium/commonSchema.js';
import {baseballStadiumIndexes, baseballStadiumSchema,} from '../src/stadium/baseballStadiumSchema.js';
import {BaseStadiumGenerator, createRng, slugify} from '../src/stadium/baseStadiumGenerator.js';

t.test('baseball schema combines common and baseball parts', (t) => {
    t.same(baseballStadiumSchema.properties.sport.enum, ['baseball']);
    t.ok(baseballStadiumSchema.properties.dimensions.properties.fenceFt);
    t.ok(baseballStadiumSchema.required.includes('capacity'));
    t.end();
});

t.test('buildStadiumSchema validates arguments', (t) => {
    t.throws(() => buildStadiumSchema('golf', {}), TypeError);
    t.throws(() => buildStadiumSchema('baseball', null), TypeError);
    t.end();
});

t.test('indexes include unique name', (t) => {
    t.equal(baseballStadiumIndexes[0].options.unique, true);
    t.end();
});

t.test('emitted JSON schema matches source', (t) => {
    const file = new URL('../src/stadium/baseballStadiumSchema.schema.json', import.meta.url);
    t.same(JSON.parse(readFileSync(file, 'utf8')), {$jsonSchema: baseballStadiumSchema});
    t.end();
});

t.test('core no longer ships the stadium dataset', (t) => {
    t.equal(existsSync(new URL('../src/stadium/stadiums.yaml', import.meta.url)), false);
    t.equal(existsSync(new URL('../src/stadium/stadiums.js', import.meta.url)), false);
    t.end();
});

t.test('slugify produces schema compatible ids', (t) => {
    t.equal(slugify('St. Louis Park'), 'st-louis-park');
    t.throws(() => slugify(''), Error);
    t.end();
});

t.test('createRng is deterministic and validates the seed', (t) => {
    const a = createRng(7);
    const b = createRng(7);
    for (let i = 0; i < 5; i++) {
        const value = a();
        t.equal(value, b());
        t.ok(value >= 0 && value < 1);
    }
    t.throws(() => createRng('x'), Error);
    t.end();
});

t.test('BaseStadiumGenerator validates options', (t) => {
    t.throws(() => new BaseStadiumGenerator(), Error);
    t.throws(() => new BaseStadiumGenerator({sport: 'golf'}), Error);
    t.throws(() => new BaseStadiumGenerator({sport: 'baseball', gameVersion: 'x'}), Error);
    t.throws(() => new BaseStadiumGenerator({sport: 'baseball', seed: 1.5}), Error);
    t.end();
});

t.test('generateCommon yields schema-shaped common fields', (t) => {
    const gen = new BaseStadiumGenerator({sport: 'baseball'});
    const stadium = gen.generateCommon(gen.createRng(), new Set());
    t.match(stadium._id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    t.equal(stadium.sport, 'baseball');
    t.match(stadium.gameVersion, /^\d+\.\d+\.\d+$/);
    t.ok(Number.isInteger(stadium.capacity) && stadium.capacity >= 1);
    t.match(stadium.location.country, /^[A-Z]{2}$/);
    t.ok(stadium.location.lat >= -90 && stadium.location.lat <= 90);
    t.ok(stadium.location.lng >= -180 && stadium.location.lng <= 180);
    t.ok(CLIMATE_TYPES.includes(stadium.climate.type));
    t.ok(stadium.climate.avgTempF >= -60 && stadium.climate.avgTempF <= 130);
    t.throws(() => gen.generateCommon('nope', new Set()), Error);
    t.end();
});

t.test('generateCommon creates 125 unique ids and names, and is reproducible', (t) => {
    const run = () => {
        const gen = new BaseStadiumGenerator({sport: 'baseball', seed: 42});
        const rng = gen.createRng();
        const ids = new Set(['emerald-cove-park']);
        const out = [];
        for (let i = 0; i < 125; i++) {
            const stadium = gen.generateCommon(rng, ids);
            ids.add(stadium._id);
            out.push(stadium);
        }
        return out;
    };
    const first = run();
    t.equal(new Set(first.map((s) => s._id)).size, 125);
    t.equal(new Set(first.map((s) => s.name)).size, 125);
    t.ok(!first.some((s) => s._id === 'emerald-cove-park'));
    t.same(run(), first);
    t.end();
});
