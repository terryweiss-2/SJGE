import t from 'tap';
import {name} from '../src/index.js';

t.test('baseball exports its name', (t) => {
    t.equal(name, '@sjge/baseball');
    t.end();
});
