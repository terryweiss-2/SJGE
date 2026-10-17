import test from 'node:test';
import assert from 'node:assert/strict';
import {name} from '../src/index.js';

test('motorsport exports its name', () => {
    assert.equal(name, '@sbgsuite/motorsport');
});
