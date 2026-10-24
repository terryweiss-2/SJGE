import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildStadiumSchema, CLIMATE_TYPES} from '../src/stadium/commonSchema.js';
import {baseballStadiumIndexes, baseballStadiumSchema,} from '../src/stadium/baseballStadiumSchema.js';
import {getStadiumById, getStadiumSvg, getStadiumSvgPath, loadStadiums, stadiums,} from '../src/stadium/stadiums.js';

test('baseball schema combines common and baseball parts', () => {
    assert.deepEqual(baseballStadiumSchema.properties.sport.enum, ['baseball']);
    assert.ok(baseballStadiumSchema.properties.dimensions.properties.fenceFt);
    assert.ok(baseballStadiumSchema.required.includes('capacity'));
});

test('buildStadiumSchema validates arguments', () => {
    assert.throws(() => buildStadiumSchema('golf', {}), TypeError);
    assert.throws(() => buildStadiumSchema('baseball', null), TypeError);
});

test('indexes include unique name', () => {
    assert.equal(baseballStadiumIndexes[0].options.unique, true);
});

test('emitted JSON schema matches source', () => {
    const file = new URL('../src/stadium/baseballStadiumSchema.schema.json', import.meta.url);
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), {$jsonSchema: baseballStadiumSchema});
});

test('stadiums dataset contains exactly 10 valid and unique records', () => {
    assert.equal(stadiums.length, 10);

    const ids = new Set();
    const names = new Set();

    for (const stadium of stadiums) {
        assert.ok(stadium._id, 'stadium must have _id');
        assert.ok(!ids.has(stadium._id), `duplicate _id: ${stadium._id}`);
        ids.add(stadium._id);

        assert.ok(stadium.name, 'stadium must have name');
        assert.ok(!names.has(stadium.name), `duplicate name: ${stadium.name}`);
        names.add(stadium.name);
    }
});

test('getStadiumById retrieves stadium by slug and handles misses', () => {
    const emerald = getStadiumById('emerald-cove-park');
    assert.ok(emerald);
    assert.equal(emerald.name, 'Emerald Cove Park');
    assert.equal(emerald.location.city, 'Seattle');

    assert.equal(getStadiumById('non-existent-park'), undefined);
    assert.throws(() => getStadiumById(''), Error);
    assert.throws(() => getStadiumById(123), Error);
});

test('loadStadiums validates arguments and loads custom files', () => {
    const loaded = loadStadiums();
    assert.equal(loaded.length, 10);
    assert.throws(() => loadStadiums(''), Error);
    assert.throws(() => loadStadiums(123), Error);
});

test('all stadiums conform strictly to baseballStadiumSchema rules', () => {
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const semverRegex = /^\d+\.\d+\.\d+$/;
    const countryRegex = /^[A-Z]{2}$/;

    for (const stadium of stadiums) {
        // Required top-level fields
        for (const req of baseballStadiumSchema.required) {
            assert.ok(stadium[req] !== undefined, `${stadium._id} missing required field ${req}`);
        }

        // Additional properties forbidden
        for (const key of Object.keys(stadium)) {
            assert.ok(
                baseballStadiumSchema.properties[key] !== undefined,
                `${stadium._id} has unexpected property ${key}`
            );
        }

        // Field constraints
        assert.match(stadium._id, slugRegex);
        assert.equal(typeof stadium.name, 'string');
        assert.ok(stadium.name.length >= 1);
        assert.equal(stadium.sport, 'baseball');
        assert.match(stadium.gameVersion, semverRegex);
        assert.ok(Number.isInteger(stadium.capacity) && stadium.capacity >= 1);

        // Location constraints
        const loc = stadium.location;
        assert.equal(typeof loc, 'object');
        assert.equal(typeof loc.city, 'string');
        assert.ok(loc.city.length >= 1);
        assert.equal(typeof loc.region, 'string');
        assert.match(loc.country, countryRegex);
        assert.ok(typeof loc.lat === 'number' && loc.lat >= -90 && loc.lat <= 90);
        assert.ok(typeof loc.lng === 'number' && loc.lng >= -180 && loc.lng <= 180);
        assert.equal(typeof loc.timezone, 'string');
        assert.ok(loc.timezone.length >= 1);

        // Climate constraints
        const climate = stadium.climate;
        assert.equal(typeof climate, 'object');
        assert.ok(CLIMATE_TYPES.includes(climate.type));
        assert.ok(typeof climate.altitudeFt === 'number' && climate.altitudeFt >= -300);
        assert.ok(typeof climate.avgTempF === 'number' && climate.avgTempF >= -60 && climate.avgTempF <= 130);

        // Dimensions constraints
        const dim = stadium.dimensions;
        assert.equal(typeof dim, 'object');

        const fence = dim.fenceFt;
        assert.ok(fence.lf >= 325 && fence.lf <= 365, `${stadium._id} lf fence out of bounds: ${fence.lf}`);
        assert.ok(fence.lcf >= 340 && fence.lcf <= 420, `${stadium._id} lcf fence out of bounds: ${fence.lcf}`);
        assert.ok(fence.cf >= 390 && fence.cf <= 440, `${stadium._id} cf fence out of bounds: ${fence.cf}`);
        assert.ok(fence.rcf >= 340 && fence.rcf <= 420, `${stadium._id} rcf fence out of bounds: ${fence.rcf}`);
        assert.ok(fence.rf >= 325 && fence.rf <= 365, `${stadium._id} rf fence out of bounds: ${fence.rf}`);

        const wall = dim.wallHeightFt;
        for (const pos of ['lf', 'lcf', 'cf', 'rcf', 'rf']) {
            assert.ok(wall[pos] >= 3 && wall[pos] <= 40, `${stadium._id} ${pos} wall height out of bounds: ${wall[pos]}`);
        }

        assert.ok(['small', 'medium', 'large'].includes(dim.foulTerritory));
    }
});

test('getStadiumSvgPath resolves valid file URL for all 10 stadiums', () => {
    for (const stadium of stadiums) {
        const pathUrl = getStadiumSvgPath(stadium._id);
        assert.ok(pathUrl instanceof URL);
        assert.ok(pathUrl.href.endsWith(`${stadium._id}.svg`));
    }

    assert.throws(() => getStadiumSvgPath('non-existent-stadium'), /not found/);
    assert.throws(() => getStadiumSvgPath(''), Error);
    assert.throws(() => getStadiumSvgPath(null), Error);
});

test('getStadiumSvg returns valid SVG markup for all 10 stadiums', () => {
    const requiredLayerGroups = [
        'id="background-stands"',
        'id="outfield-grass"',
        'id="warning-track"',
        'id="foul-territory"',
        'id="infield-dirt"',
        'id="base-paths-lines"',
        'id="bases"',
        'id="outfield-wall"',
        'id="stadium-accents"',
    ];

    for (const stadium of stadiums) {
        const svg = getStadiumSvg(stadium._id);
        assert.equal(typeof svg, 'string');

        // XML structure and root properties
        const trimmed = svg.trim();
        assert.ok(trimmed.startsWith('<svg'), `${stadium._id} svg must start with <svg`);
        assert.ok(trimmed.endsWith('</svg>'), `${stadium._id} svg must end with </svg>`);
        assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), `${stadium._id} must have xmlns attribute`);
        assert.ok(svg.includes('viewBox="0 0 800 800"'), `${stadium._id} must have viewBox="0 0 800 800"`);

        // Semantic layer groups
        for (const groupId of requiredLayerGroups) {
            assert.ok(svg.includes(groupId), `${stadium._id} missing semantic group ${groupId}`);
        }

        // Mobile performance budget (< 40 KB, target < 25 KB)
        const byteSize = Buffer.byteLength(svg, 'utf8');
        assert.ok(byteSize < 40 * 1024, `${stadium._id} SVG file size (${byteSize} bytes) exceeds 40 KB limit`);

        // Disallowed expensive GPU filter chains
        assert.ok(!svg.includes('<filter'), `${stadium._id} contains expensive SVG filter element`);
        assert.ok(!svg.includes('feGaussianBlur'), `${stadium._id} contains feGaussianBlur`);
    }

    assert.throws(() => getStadiumSvg('non-existent-stadium'), /not found/);
    assert.throws(() => getStadiumSvg(''), Error);
    assert.throws(() => getStadiumSvg(123), Error);
});
