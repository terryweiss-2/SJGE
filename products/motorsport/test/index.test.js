import t from 'tap';
import {name} from '../src/index.js';

t.test('motorsport exports its name', (t) => {
    t.equal(name, '@sjge/motorsport');
    t.end();
});
