# Typed Object

A typed object is an object that validates its properties against a JSON-schema.

## Behaviors

- A user should be able to create a typed object from a factory. They *must* specify the json schema to use, they can
  optionally pass in an object to initialize the typed object with.
    - The json schema should be a valid JSON-schema. Follow refs.
    - Accept these options:
        - **`validateOnInit`** when true, the object passed in will be validated against the json schema. If this is
          true and the object fails validation, raise an error, regardless of other option values
        - **`liveValidate`** when true, when a property is set, the object will be validated against the json schema.
        - **`onlyWarn`** When true, the object will accept any property value, but will raise warnings when a property
          is set and the object fails validation.
    - The object that is returned should have the same schema as the json schema, regardless of whether it was created
      with an object or not.
    - The object should have a `validate()` method that validates the object against the json schema. If the object
      fails validation, raise an error.
    - The object should have a `replaceWith()` method that accepts a new object whose values replace whatever is in
      memory. It should accept a boolean parameter **`validateNow` that works like `validateOnInit`. This will allow
      developers use a single container to process a stream of records.

## Implementation

- Use any well-attested npm library to perform validation and follow the `ref`s.
- This will be stored in `packages/lib/src/typed.object.js`
- Call the factory `typedObject()`
    - Expose this from `packages/lib/src/index.js` and add it to the lib/README.md
- Add JSDoc to all public symbols
- Follow the linting rules in `specs/lib/LINTER.md` and `.agents/skills/lint-me`

## Warnings

The system should print a warning to the log using `logger.warn()`

## Errors

When an error is raised, the error should be logged to the log using `logger.error()`. The error should be informative.
The module should raise different errors depending on the error type to allow developers to differentiate between
different types of errors by inspecting its type. All custom errors should ultimately derive from JS's `Error` class.
