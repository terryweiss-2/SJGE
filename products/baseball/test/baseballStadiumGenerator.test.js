import t from 'tap';
import {BaseballStadiumGenerator, validateAgainstSchema} from '../src/stadium/baseballStadiumGenerator.js';
import {baseballStadiumSchema} from '@sjge/core';

const LAYERS = [
    'background-stands', 'outfield-grass', 'warning-track', 'foul-territory', 'infield-dirt',
    'base-paths-lines', 'bases', 'outfield-wall', 'stadium-accents',
];

t.test('generates 125 unique schema-valid stadiums from empty', (t) => {
    const gen = new BaseballStadiumGenerator({seed: 5});
    const {stadiums, added} = gen.generate({count: 125});
    t.equal(stadiums.length, 125);
    t.equal(added.length, 125);
    t.equal(new Set(stadiums.map((s) => s._id)).size, 125);
    t.equal(new Set(stadiums.map((s) => s.name)).size, 125);
    for (const stadium of stadiums) {
        t.equal(stadium.sport, 'baseball');
        t.same(validateAgainstSchema(stadium, baseballStadiumSchema), []);
    }
    t.end();
});

t.test('generation is reproducible for a seed', (t) => {
    const a = new BaseballStadiumGenerator({seed: 9}).generate({count: 20});
    const b = new BaseballStadiumGenerator({seed: 9}).generate({count: 20});
    t.same(a, b);
    t.end();
});

t.test('top-up keeps existing entries and only adds the shortfall', (t) => {
    const gen = new BaseballStadiumGenerator();
    const first = gen.generate({count: 10}).stadiums;
    const snapshot = structuredClone(first);
    const topped = gen.generate({count: 25, existing: first});
    t.equal(topped.stadiums.length, 25);
    t.equal(topped.added.length, 15);
    t.same(topped.stadiums.slice(0, 10), snapshot);
    t.equal(new Set(topped.stadiums.map((s) => s._id)).size, 25);
    t.end();
});

t.test('same or smaller count adds nothing and leaves existing untouched', (t) => {
    const gen = new BaseballStadiumGenerator();
    const existing = gen.generate({count: 10}).stadiums;
    for (const count of [10, 3]) {
        const result = gen.generate({count, existing});
        t.equal(result.added.length, 0);
        t.same(result.stadiums, existing);
    }
    t.end();
});

t.test('generate validates arguments', (t) => {
    const gen = new BaseballStadiumGenerator();
    t.throws(() => gen.generate({count: 0}), Error);
    t.throws(() => gen.generate({count: 1.5}), Error);
    t.throws(() => gen.generate({count: 'x'}), Error);
    t.throws(() => gen.generate({count: 1, existing: {}}), Error);
    t.end();
});

t.test('validateAgainstSchema reports violations', (t) => {
    const gen = new BaseballStadiumGenerator();
    const stadium = gen.generate({count: 1}).stadiums[0];
    const bad = structuredClone(stadium);
    bad.dimensions.fenceFt.cf = 100;
    bad.extra = true;
    delete bad.name;
    const errors = validateAgainstSchema(bad, baseballStadiumSchema);
    t.ok(errors.some((e) => e.includes('fenceFt.cf')));
    t.ok(errors.some((e) => e.includes('extra')));
    t.ok(errors.some((e) => e.includes('name')));
    t.end();
});

t.test('renderSvg produces well structured, lightweight SVG', (t) => {
    const gen = new BaseballStadiumGenerator();
    for (const stadium of gen.generate({count: 20}).stadiums) {
        const svg = gen.renderSvg(stadium);
        t.ok(svg.startsWith('<svg'));
        t.ok(svg.trim().endsWith('</svg>'));
        t.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
        t.ok(svg.includes('viewBox="0 0 800 800"'));
        for (const layer of LAYERS) {
            t.ok(svg.includes(`id="${layer}"`), `${stadium._id} missing ${layer}`);
        }
        t.ok(!svg.includes('<filter'));
        t.ok(!svg.includes('NaN'));
        t.ok(Buffer.byteLength(svg) < 40 * 1024);
    }
    t.throws(() => gen.renderSvg(null), Error);
    t.throws(() => gen.renderSvg({_id: 'x'}), Error);
    t.end();
});
