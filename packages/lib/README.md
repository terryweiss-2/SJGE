# @sjge/lib

Tools and utilities shared by the SJGE packages and products.

## Exports

Everything is exported from `src/index.js`:

| Symbol         | Kind     | Source          |
|----------------|----------|-----------------|
| `name`         | string   | `src/index.js`  |
| `getLogger`    | function | `src/logger.js` |
| `LoggerLevels` | object   | `src/logger.js` |
| `loadConfig`   | function | `src/config.js` |

```js
import {getLogger, LoggerLevels, loadConfig} from '@sjge/lib';
```

## Logger

### `getLogger(name[, level][, streams])`

Creates a new logger. Every call returns a new, unique logger instance.

| Parameter | Type                 | Description                                                                               |
|-----------|----------------------|-------------------------------------------------------------------------------------------|
| `name`    | `string`             | Required. Non-empty name written into every line.                                         |
| `level`   | `string` or `number` | Optional. A key or value of `LoggerLevels`. Defaults to `ETL_LOGGER_LEVEL`, else `start`. |
| `streams` | `Writable[]`         | Optional. Extra streams that receive every line written.                                  |

Invalid parameters throw (checked with `check-types`).

The returned logger has one function per level: `error`, `warning`, `log`, `info`, `start`, `end`, `success`,
`trace`, `debug`. Each is called as `logger.<level>(msg, context)`:

- `msg` (`string`) - the message.
- `context` (optional) - an `Error` prints its stack; objects and arrays print as JSON; anything else is stringified.

Messages above the logger's level are dropped.

### `LoggerLevels`

Frozen enum, lower numbers are more important:

| Level                     | Value |
|---------------------------|-------|
| `error`                   | 0     |
| `warning`                 | 1     |
| `log`, `info`             | 2     |
| `start`, `end`, `success` | 3     |
| `trace`                   | 4     |
| `debug`                   | 5     |

### Output

```
<ISO 8601 UTC date>|<name>|<colored level>|<message>
```

Only the level is ANSI colored. `error` and `debug` go to `stderr`, all other levels go to `stdout`. Extra streams
receive every line regardless of level type.

```js
const log = getLogger('etl', 'trace');
log.start('Beginning import');
log.error('Failed', new Error('boom'));
```

## Config

### `loadConfig([environment][, options])`

Loads and merges configuration, later sources overriding earlier ones:

1. `config.yaml` files, from the current directory up to the first directory whose `package.json` has `workspaces`
   (or that contains `.git`). Nearer files win. Objects are merged deeply, arrays are replaced. Missing files are
   skipped; YAML errors are rethrown with the file path.
2. Environment variables prefixed `ETL_` (loaded from `.env` through `dotenv` too). `ETL_FOO_BAR` becomes `fooBar`;
   `"true"`, `"false"` and numeric strings are converted.
3. Command line arguments (parsed with `yargs`, dot notation supported, e.g. `--db.port 1`).

| Parameter      | Type       | Description                                                                                                      |
|----------------|------------|------------------------------------------------------------------------------------------------------------------|
| `environment`  | `string`   | Optional. Section of `config.yaml` to use. Falls back to `-e/--environment`, then `ETL_ENV`, then `development`. |
| `options.cwd`  | `string`   | Optional. Directory to start from. Defaults to `process.cwd()`.                                                  |
| `options.argv` | `string[]` | Optional. Arguments to parse. Defaults to `process.argv` without node and script.                                |

Returns a plain object. Results are cached per environment, cwd and argv, so identical calls return the same object.

#### Command line flags

- `-v` sets `loggerLevel` to `trace`, `-vv` sets it to `debug`.
- `-e <name>` / `--environment <name>` selects the environment.

#### `config.yaml` layout

```yaml
loggerLevel: info        # shared by all environments
development:
  db:
    host: localhost
production:
  db:
    host: db.example.com
```

Top-level object keys named `development`, `test`, `production` or `staging` are environment sections; other keys
are shared values.

## Typed Object

### `createTypedObject(schema[, initial][, options])`

Returns a Proxy-wrapped object validated against a JSON Schema (`$ref`s are followed). Without `initial`, the object
has the shape of the schema's `properties` (values `undefined` or the schema `default`).

Options:

- `validateOnInit` - validate on creation and throw if invalid (runs regardless of other options).
- `liveValidate` - validate every set/delete; an invalid change is rejected (value unchanged) and throws.
- `onlyWarn` - accept any value and only `logger.warning()` on failure (takes precedence over `liveValidate`).
- `logger` - logger to use instead of the default.

Methods on the returned object (not enumerable, not stored in the data):

- `validate()` - returns `true` or throws `ValidationError`.
- `replaceWith(obj[, validateNow])` - replaces all contents, optionally validating; useful to reuse one object across a
  record stream.

Every thrown error is first logged with `logger.error()`.

### Errors

- `TypedObjectError` - base class, extends `Error`.
- `SchemaError` - schema cannot be compiled or `$ref` unresolved.
- `OptionsError` - invalid options.
- `ValidationError` - data violates the schema; `errors` holds the ajv error array.

```js
import {createTypedObject} from '@sjge/lib';

const person = createTypedObject({
    type: 'object',
    properties: {name: {type: 'string'}}
}, {name: 'Al'}, {liveValidate: true});
person.name = 5; // throws ValidationError, name stays 'Al'
```

## Tests

```
npm test --workspace packages/lib
```
