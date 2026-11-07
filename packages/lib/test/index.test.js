import t from 'tap';
import {name} from '../src/index.js';

t.test('lib exports its name', (t) => {
    t.equal(name, '@sjge/lib');
    t.end();
});
