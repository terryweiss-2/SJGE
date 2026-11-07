# @sjge/core

Core domain models, schemas, and engines for economics, seasons, leagues, teams, and players.

## Exports

Everything is exported from `src/index.js`:

| Symbol                      | Kind     | Source                                 |
|-----------------------------|----------|----------------------------------------|
| `name`                      | string   | `src/index.js`                         |
| `SPORTS`                    | array    | `src/stadium/commonSchema.js`          |
| `CLIMATE_TYPES`             | array    | `src/stadium/commonSchema.js`          |
| `commonProperties`          | object   | `src/stadium/commonSchema.js`          |
| `commonRequired`            | array    | `src/stadium/commonSchema.js`          |
| `buildStadiumSchema`        | function | `src/stadium/commonSchema.js`          |
| `baseballStadiumCollection` | string   | `src/stadium/baseballStadiumSchema.js` |
| `baseballStadiumDimensions` | object   | `src/stadium/baseballStadiumSchema.js` |
| `baseballStadiumSchema`     | object   | `src/stadium/baseballStadiumSchema.js` |
| `baseballStadiumValidator`  | object   | `src/stadium/baseballStadiumSchema.js` |
| `baseballStadiumIndexes`    | array    | `src/stadium/baseballStadiumSchema.js` |
| `ensureBaseballStadiums`    | function | `src/stadium/baseballStadiumSchema.js` |
| `BaseStadiumGenerator`      | class    | `src/stadium/baseStadiumGenerator.js`  |
| `DEFAULT_GAME_VERSION`      | string   | `src/stadium/baseStadiumGenerator.js`  |
| `NAME_PREFIXES`             | array    | `src/stadium/baseStadiumGenerator.js`  |
| `NAME_SUFFIXES`             | array    | `src/stadium/baseStadiumGenerator.js`  |
| `LOCATIONS`                 | array    | `src/stadium/baseStadiumGenerator.js`  |
| `createRng`                 | function | `src/stadium/baseStadiumGenerator.js`  |
| `slugify`                   | function | `src/stadium/baseStadiumGenerator.js`  |

```js
import {
    BaseStadiumGenerator,
    createRng,
    slugify,
    baseballStadiumSchema,
    ensureBaseballStadiums,
} from '@sjge/core';
```

## Stadiums

Core contains only the sport-agnostic generator and schemas. Stadium datasets (YAML) and SVG assets belong to each
product, for example `products/baseball/assets/stadiums`.

### `new BaseStadiumGenerator(options)`

Generates the fields common to every stadium. Sport generators extend it and add `dimensions`.

| Option        | Type     | Description                                                     |
|---------------|----------|-----------------------------------------------------------------|
| `sport`       | `string` | Required. One of `SPORTS`.                                      |
| `gameVersion` | `string` | Optional semver stamped on stadiums. Defaults to `0.1.0`.       |
| `seed`        | `number` | Optional integer seed for reproducible output. Defaults to `1`. |

#### `generator.createRng([offset])`

Returns a seeded random function (`seed + offset`) returning floats in `[0, 1)`.

#### `generator.generateCommon(rng, existingIds)`

| Parameter     | Type                   | Description                                         |
|---------------|------------------------|-----------------------------------------------------|
| `rng`         | `function`             | Required. Random source, e.g. `createRng()`.        |
| `existingIds` | `Set<string>`\|`array` | Required. Ids already used; the new id avoids them. |

Returns `{_id, name, sport, gameVersion, capacity, location, climate}`. The caller should add the new `_id` to its set
before generating the next stadium.

### `createRng(seed)`

Deterministic mulberry32 generator for an integer `seed`.

### `slugify(text)`

Converts a name to a lowercase hyphenated slug matching the `_id` pattern.

### `buildStadiumSchema(sport, dimensions)`

Constructs a full MongoDB `$jsonSchema` document by combining shared stadium fields with sport-specific dimensions.

| Parameter    | Type     | Description                                               |
|--------------|----------|-----------------------------------------------------------|
| `sport`      | `string` | Required. One of `SPORTS` (`'baseball'`, `'motorsport'`). |
| `dimensions` | `object` | Required. MongoDB `$jsonSchema` for the dimensions block. |

### `ensureBaseballStadiums(db)`

Ensures the `baseballStadiums` MongoDB collection exists with proper schema validation and indexes.

| Parameter | Type | Description                                           |
|-----------|------|-------------------------------------------------------|
| `db`      | `Db` | Required. MongoDB `Db` instance from official driver. |

## Tests

```
npm --prefix packages/core test
```
