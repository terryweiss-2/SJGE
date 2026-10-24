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
| `loadStadiums`              | function | `src/stadium/stadiums.js`              |
| `stadiums`                  | array    | `src/stadium/stadiums.js`              |
| `getStadiumById`            | function | `src/stadium/stadiums.js`              |
| `getStadiumSvgPath`         | function | `src/stadium/stadiums.js`              |
| `getStadiumSvg`             | function | `src/stadium/stadiums.js`              |

```js
import {
    loadStadiums,
    stadiums,
    getStadiumById,
    getStadiumSvgPath,
    getStadiumSvg,
    baseballStadiumSchema,
    ensureBaseballStadiums,
} from '@sjge/core';
```

## Stadiums

### `loadStadiums([filePath])`

Loads and parses stadium documents from a YAML file.

| Parameter  | Type            | Description                                                              |
|------------|-----------------|--------------------------------------------------------------------------|
| `filePath` | `string`\|`URL` | Optional. Path or URL to YAML stadium file. Defaults to `stadiums.yaml`. |

Returns an array of stadium objects.

### `stadiums`

Preloaded, immutable (`Object.freeze`) array of the 10 built-in baseball stadiums.

### `getStadiumById(id)`

Retrieves a stadium document by its unique slug identifier.

| Parameter | Type     | Description                                                           |
|-----------|----------|-----------------------------------------------------------------------|
| `id`      | `string` | Required. Non-empty string stadium slug (e.g. `'emerald-cove-park'`). |

Returns the matched stadium object, or `undefined` if no stadium with the given `_id` is found.

### `getStadiumSvgPath(id)`

Returns the file URL to the top-down SVG asset for a given stadium slug.

| Parameter | Type     | Description                                                           |
|-----------|----------|-----------------------------------------------------------------------|
| `id`      | `string` | Required. Non-empty string stadium slug (e.g. `'emerald-cove-park'`). |

Returns a `URL` instance pointing to the SVG asset. Throws an `Error` if the stadium does not exist or the SVG asset is
missing.

### `getStadiumSvg(id)`

Reads and returns the raw SVG XML markup for a given stadium slug.

| Parameter | Type     | Description                                                           |
|-----------|----------|-----------------------------------------------------------------------|
| `id`      | `string` | Required. Non-empty string stadium slug (e.g. `'emerald-cove-park'`). |

Returns a string containing the raw SVG XML. Throws an `Error` if the stadium does not exist or the SVG asset cannot be
read.

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
