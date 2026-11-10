---
sessionId: session-261109-193559-1f9a
---

# Requirements

### Overview

A `typedObject` factory in `@sjge/lib` returning a Proxy-wrapped object validated against a JSON Schema (per
specs/lib/TYPED.OBJECT.md).

### Functional Requirements

- `createTypedObject(schema, initial?, options?)`; schema required, `$ref`s followed.
- Options: `validateOnInit` (throw if invalid, overrides others), `liveValidate` (validate on set; reject change and
  throw), `onlyWarn` (accept any value, `logger.warn()` on failure).
- Returned object has the schema's shape with or without initial data; `validate()` throws on failure;
  `replaceWith(obj, validateNow)` swaps contents, enabling reuse across a record stream.
- Warnings via `logger.warn()`; errors logged via `logger.error()` and thrown as informative custom errors deriving from
  `Error`.

### Out of scope

Persistence, schema authoring tools.

# Technical Design

### Current Implementation

`../../packages/lib` has `src/config.js`, `logger.js`, `index.js`, tests in `test/` (tap), deps: check-types. No
validator.

### Key Decisions

- Add dependency `ajv` (approval already given via this plan; also `ajv-formats` NOT added).
- Proxy with set/get traps; `validate` and `replaceWith` exposed via get trap (non-enumerable, not stored in data).
- liveValidate failure: revert and throw `ValidationError`.
- Errors in separate file.

### File Structure

- `../../packages/lib/src/typed.object.js` (factory, JSDoc module docs, check-types param checks)
- `../../packages/lib/src/typed.object.errors.js`: `TypedObjectError extends Error`, `SchemaError`, `ValidationError`
  (carries ajv `errors` array), `OptionsError`.
- `../../packages/lib/src/index.js`: re-export.
- `../../packages/lib/test/typed.object.test.js`
- `../../packages/lib/README.md`: document exports.
- `../../packages/lib/package.json`: add ajv.

### Proposed Changes

- Compile schema with `new Ajv({allErrors:true, strict:false})`; compile failure (bad schema/unresolved ref) logs and
  throws `SchemaError`.
- Initial shape: if no initial object, build skeleton from schema (`properties` -> undefined/default, nested objects
  recursively; follow `$ref`) so shape matches schema.
- set trap: onlyWarn -> set and warn on failure; liveValidate -> validate a candidate copy, throw if invalid without
  mutating; otherwise plain set.
- `replaceWith` clears keys, assigns new ones, validates if `validateNow`.
- Every thrown error is first logged with `logger.error()`.

### Risks

Nested mutation bypasses the top-level trap (mitigate by recursively proxying nested objects); skeleton generation for
`oneOf`/`anyOf` is best-effort.

# Testing

Tap tests: valid/invalid init with validateOnInit; liveValidate reject leaves value unchanged; onlyWarn warns and
accepts; `$ref` schemas; `validate()`; `replaceWith` with/without validateNow; error types via `instanceof`; logger
calls verified. No external services needed.

# Delivery Steps

###   * Step 1: Add ajv and error classes

Errors and dependency are in place.

- Add `ajv` to packages/lib/package.json.
- Create `typed.object.errors.js` with TypedObjectError, SchemaError, ValidationError, OptionsError.

### Step 2: Implement typedObject factory

Factory works for all options.

- Create `typed.object.js` with Proxy, schema compile, skeleton, validate, replaceWith, logging.
- Param checks with check-types, JSDoc.
- Export from index.js.

### Step 3: Tests and docs

Behavior verified and documented.

- Write `test/typed-object.test.js` covering scenarios in Testing.
- Update packages/lib/README.md with exports and usage.
- Run tap.