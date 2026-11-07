import t from 'tap';
import {name} from '../src/index.js';

t.test('ui exports its name', (t) => {
    t.equal(name, '@sjge/ui');
    t.end();
});
