import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../src/index.js';

test('core exports its name and stadium utilities', () => {
    assert.equal(core.name, '@sjge/core');
    assert.equal(typeof core.loadStadiums, 'function');
    assert.equal(typeof core.getStadiumById, 'function');
    assert.equal(typeof core.getStadiumSvgPath, 'function');
    assert.equal(typeof core.getStadiumSvg, 'function');
    assert.ok(Array.isArray(core.stadiums));
    assert.equal(core.stadiums.length, 10);
    assert.ok(core.baseballStadiumSchema);
    assert.ok(core.commonProperties);
    assert.equal(typeof core.buildStadiumSchema, 'function');
});
