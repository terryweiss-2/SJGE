import t from 'tap';
import * as core from '../src/index.js';

t.test('core exports its name and stadium utilities', (t) => {
    t.equal(core.name, '@sjge/core');
    t.equal(typeof core.BaseStadiumGenerator, 'function');
    t.equal(typeof core.createRng, 'function');
    t.equal(typeof core.slugify, 'function');
    t.equal(core.stadiums, undefined);
    t.equal(core.getStadiumById, undefined);
    t.ok(core.baseballStadiumSchema);
    t.ok(core.commonProperties);
    t.equal(typeof core.buildStadiumSchema, 'function');
    t.end();
});
