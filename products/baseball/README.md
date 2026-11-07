# @sjge/baseball

Baseball management game.

## Exports

Everything is exported from `src/index.js`:

| Symbol                     | Kind     | Source                                    |
|----------------------------|----------|-------------------------------------------|
| `name`                     | string   | `src/index.js`                            |
| `BaseballStadiumGenerator` | class    | `src/stadium/baseballStadiumGenerator.js` |
| `validateAgainstSchema`    | function | `src/stadium/baseballStadiumGenerator.js` |
| `DEFAULT_NUM_STADIUMS`     | number   | `src/stadium/stadiumStore.js`             |
| `DEFAULT_STADIUMS_DIR`     | URL      | `src/stadium/stadiumStore.js`             |
| `STADIUMS_FILE`            | string   | `src/stadium/stadiumStore.js`             |
| `resolveCount`             | function | `src/stadium/stadiumStore.js`             |
| `loadStadiums`             | function | `src/stadium/stadiumStore.js`             |
| `syncStadiums`             | function | `src/stadium/stadiumStore.js`             |

## Stadium data

Stadium data belongs to the sport, so it lives here and not in `@sjge/core`:

- `assets/stadiums/stadiums.yaml` - one YAML array of stadium documents.
- `assets/stadiums/<id>.svg` - one top-down SVG per stadium.

## Generating stadiums

```
make generate-stadiums COUNT=125
```

or directly:

```
node products/baseball/bin/generate-stadiums.js --numStadiums 125
node products/baseball/bin/generate-stadiums.js -n 125
```

Options are read through `loadConfig` from `@sjge/lib` (so `config.yaml` and `ETL_NUM_STADIUMS` also work). The count
defaults to 125 and must be a positive integer. Existing stadiums are reused unchanged and never deleted; only the
shortfall up to the count is generated. Missing SVGs are written and SVGs with no matching stadium id are deleted.
A count at or below the number of existing stadiums generates nothing.

### `new BaseballStadiumGenerator([options])`

Extends `BaseStadiumGenerator` from `@sjge/core` (`sport` is always `baseball`).

| Option        | Type     | Description                                            |
|---------------|----------|--------------------------------------------------------|
| `gameVersion` | `string` | Optional semver stamped on stadiums (default `0.1.0`). |
| `seed`        | `number` | Optional integer seed for reproducible output.         |

- `generateDimensions(rng)` returns `{fenceFt, wallHeightFt, foulTerritory}` within the schema limits.
- `generateStadium(rng, existingIds)` returns one schema-valid stadium; throws if validation fails.
- `generate({count, existing})` tops `existing` (default `[]`) up to `count` total stadiums and returns
  `{stadiums, added}`.
- `renderSvg(stadium)` returns the 800x800 SVG markup for a stadium.

### `validateAgainstSchema(value, schema[, path])`

Validates a value against the `$jsonSchema` subset used by the stadium schemas; returns an array of violations (empty
when valid).

### `resolveCount(config)`

Returns the requested count from `config.numStadiums` (or the unaliased `config.n`), defaulting to
`DEFAULT_NUM_STADIUMS`. Throws if not a positive integer.

### `loadStadiums(file)`

Parses a stadium YAML array. Returns `[]` when the file does not exist.

### `syncStadiums({dir, count[, seed]})`

Tops `dir/stadiums.yaml` up to `count`, writes missing SVGs and deletes orphan SVGs. Returns
`{total, added, svgsWritten, orphansDeleted}`.

## Tests

```
npm --prefix products/baseball test
```
