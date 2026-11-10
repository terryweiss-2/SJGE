/**
 * @module typed-object
 * Factory for objects validated against a JSON Schema. The returned object is a Proxy
 * exposing the (non-enumerable) methods `validate()` and `replaceWith(obj, validateNow)`.
 */
import check from 'check-types';
import Ajv from 'ajv';
import {getLogger} from './logger.js';
import {OptionsError, SchemaError, ValidationError} from './typed.object.errors.js';

const defaultLogger = getLogger('typed-object');

/**
 * @typedef {object} TypedObjectOptions
 * @property {boolean} [validateOnInit] Validate at creation and throw if invalid (overrides other options).
 * @property {boolean} [liveValidate] Validate on every set; invalid changes are rejected and throw.
 * @property {boolean} [onlyWarn] Accept any value and only `logger.warning()` on failure.
 * @property {object} [logger] Logger to use instead of the default.
 */

function plain(value) {
    return check.object(value) || Array.isArray(value);
}

function resolveRef(root, ref) {
    if (!ref.startsWith('#')) {
        return undefined;
    }
    return ref.slice(1).split('/').filter(Boolean)
        .reduce((node, part) => node?.[part.replace(/~1/g, '/').replace(/~0/g, '~')], root);
}

function skeleton(root, schema, depth = 0) {
    let node = schema;
    while (node && node.$ref && depth < 20) {
        node = resolveRef(root, node.$ref);
        depth++;
    }
    if (!node || depth >= 20) {
        return undefined;
    }
    if (node.default !== undefined) {
        return structuredClone(node.default);
    }
    if (node.type === 'object' || node.properties) {
        const out = {};
        for (const [key, sub] of Object.entries(node.properties ?? {})) {
            out[key] = skeleton(root, sub, depth + 1);
        }
        return out;
    }
    return undefined;
}

function compile(schema, logger) {
    try {
        return new Ajv({allErrors: true, strict: false}).compile(schema);
    } catch (err) {
        const error = new SchemaError(`Invalid schema: ${err.message}`);
        logger.error(error.message);
        throw error;
    }
}

/**
 * Create a typed object.
 * @param {object} schema JSON Schema (`$ref`s are followed).
 * @param {object} [initial] Initial data.
 * @param {TypedObjectOptions} [options] Options.
 * @returns {object} Proxy-wrapped object with `validate()` and `replaceWith()`.
 */
export function createTypedObject(schema, initial, options = {}) {
    check.assert.object(schema);
    check.assert.maybe.object(initial);
    check.assert.object(options);
    for (const key of ['validateOnInit', 'liveValidate', 'onlyWarn']) {
        if (options[key] !== undefined && !check.boolean(options[key])) {
            throw new OptionsError(`Option ${key} must be a boolean`);
        }
    }
    const logger = options.logger ?? defaultLogger;
    const {validateOnInit = false, onlyWarn = false} = options;
    const liveValidate = options.liveValidate && !onlyWarn;
    const validator = compile(schema, logger);

    const check_ = (data) => {
        if (!validator(data)) {
            const errors = validator.errors ?? [];
            const detail = errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
            return new ValidationError(`Validation failed: ${detail}`, errors);
        }
        return undefined;
    };
    const fail = (error) => {
        logger.error(error.message);
        throw error;
    };

    const data = initial ? structuredClone(initial) : (skeleton(schema, schema) ?? {});

    const validate = () => {
        const error = check_(data);
        if (error) {
            fail(error);
        }
        return true;
    };

    const replaceWith = (obj, validateNow = false) => {
        check.assert.object(obj);
        for (const key of Object.keys(data)) {
            delete data[key];
        }
        Object.assign(data, structuredClone(obj));
        if (validateNow) {
            validate();
        }
        return proxy;
    };

    const makeProxy = (target, path) => new Proxy(target, {
        get(t, prop, receiver) {
            if (path.length === 0) {
                if (prop === 'validate') {
                    return validate;
                }
                if (prop === 'replaceWith') {
                    return replaceWith;
                }
            }
            const value = Reflect.get(t, prop, receiver);
            return plain(value) ? makeProxy(value, [...path, prop]) : value;
        },
        set(t, prop, value) {
            if (liveValidate || onlyWarn) {
                const candidate = structuredClone(data);
                let node = candidate;
                for (const p of path) {
                    node = node[p];
                }
                node[prop] = value;
                const error = check_(candidate);
                if (error) {
                    if (onlyWarn) {
                        logger.warning(error.message);
                    } else {
                        fail(error);
                    }
                }
            }
            return Reflect.set(t, prop, value);
        },
        deleteProperty(t, prop) {
            if (liveValidate) {
                const candidate = structuredClone(data);
                let node = candidate;
                for (const p of path) {
                    node = node[p];
                }
                delete node[prop];
                const error = check_(candidate);
                if (error) {
                    fail(error);
                }
            }
            return Reflect.deleteProperty(t, prop);
        },
    });

    const proxy = makeProxy(data, []);
    if (validateOnInit) {
        validate();
    }
    return proxy;
}
