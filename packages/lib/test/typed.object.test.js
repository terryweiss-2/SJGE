import t from 'tap';
import {createTypedObject, OptionsError, SchemaError, TypedObjectError, ValidationError} from '../src/index.js';

const schema = {
    type: 'object',
    properties: {name: {type: 'string'}, age: {type: 'integer'}, addr: {$ref: '#/$defs/addr'}},
    required: ['name'],
    $defs: {addr: {type: 'object', properties: {city: {type: 'string'}}}},
};

function fakeLogger() {
    const calls = {error: [], warning: []};
    return {calls, error: (m) => calls.error.push(m), warning: (m) => calls.warning.push(m)};
}

t.test('skeleton shape follows schema and $ref', (t) => {
    const o = createTypedObject(schema);
    t.same(Object.keys(o), ['name', 'age', 'addr']);
    t.same(Object.keys(o.addr), ['city']);
    t.end();
});

t.test('validateOnInit', (t) => {
    const logger = fakeLogger();
    createTypedObject(schema, {name: 'a'}, {validateOnInit: true, logger});
    t.throws(() => createTypedObject(schema, {age: 1}, {validateOnInit: true, logger}), ValidationError);
    t.equal(logger.calls.error.length, 1);
    t.end();
});

t.test('liveValidate rejects and keeps value', (t) => {
    const o = createTypedObject(schema, {name: 'a', addr: {city: 'x'}}, {liveValidate: true, logger: fakeLogger()});
    t.throws(() => {
        o.age = 'x';
    }, ValidationError);
    t.equal(o.age, undefined);
    o.age = 3;
    t.equal(o.age, 3);
    t.throws(() => {
        o.addr.city = 5;
    }, ValidationError);
    t.end();
});

t.test('onlyWarn accepts and warns', (t) => {
    const logger = fakeLogger();
    const o = createTypedObject(schema, {name: 'a'}, {onlyWarn: true, liveValidate: true, logger});
    o.age = 'x';
    t.equal(o.age, 'x');
    t.equal(logger.calls.warning.length, 1);
    t.end();
});

t.test('validate()', (t) => {
    const o = createTypedObject(schema, {name: 'a'}, {logger: fakeLogger()});
    t.equal(o.validate(), true);
    o.age = 'x';
    t.throws(() => o.validate(), ValidationError);
    t.end();
});

t.test('replaceWith', (t) => {
    const o = createTypedObject(schema, {name: 'a'}, {logger: fakeLogger()});
    o.replaceWith({name: 'b', age: 2}, true);
    t.same({...o}, {name: 'b', age: 2});
    t.doesNotThrow(() => o.replaceWith({age: 1}));
    t.throws(() => o.replaceWith({age: 1}, true), ValidationError);
    t.end();
});

t.test('errors', (t) => {
    const logger = fakeLogger();
    t.throws(() => createTypedObject({type: 'bogus'}, {}, {logger}), SchemaError);
    t.throws(() => createTypedObject({$ref: '#/nope'}, {}, {logger}), SchemaError);
    t.throws(() => createTypedObject(schema, {}, {liveValidate: 'yes'}), OptionsError);
    t.ok(new SchemaError('x') instanceof TypedObjectError);
    t.ok(new ValidationError('x') instanceof Error);
    t.end();
});
