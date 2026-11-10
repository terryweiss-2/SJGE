/**
 * @module typed-object-errors
 * Error classes thrown by the typed object factory.
 */

/** Base class for all typed object errors. */
export class TypedObjectError extends Error {
    /**
     * @param {string} message Description of the failure.
     */
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

/** Thrown when the schema cannot be compiled (invalid schema or unresolved `$ref`). */
export class SchemaError extends TypedObjectError {
}

/** Thrown when the options passed to the factory are invalid. */
export class OptionsError extends TypedObjectError {
}

/** Thrown when data does not satisfy the schema. */
export class ValidationError extends TypedObjectError {
    /**
     * @param {string} message Description of the failure.
     * @param {object[]} [errors] The ajv error objects.
     */
    constructor(message, errors = []) {
        super(message);
        /** @type {object[]} */
        this.errors = errors;
    }
}
