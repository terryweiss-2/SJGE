# Requirements

### Overview & Goals

Generate a balanced, high-utility initial dataset of 10 baseball stadiums saved in YAML format at
`packages/core/src/stadium/stadiums.yaml`. The dataset will provide diverse strategic environments (affecting home run
probabilities, foul out frequency, and altitude/temperature flight dynamics) while strictly adhering to the MongoDB
schema and validation rules established in `specs/schema/STADIUM.SCHEMA.md` and
`packages/core/src/stadium/baseballStadiumSchema.js`.

### Scope

- **In Scope**:
    - Authoring 10 comprehensive stadium records in YAML with unique `_id` slugs, distinct names, realistic
      geographical/climate data, and varied outfield dimensions and wall heights.
    - Adding a lightweight loader and accessor functions in `@sjge/core` to read and serve the stadium data.
    - Adding automated unit tests in `packages/core/test/stadium.test.js` validating all 10 entries against
      `baseballStadiumSchema`.
- **Out of Scope**:
    - Motorsport tracks (deferred to a subsequent phase).
    - Direct database ingestion and MongoDB seed scripts (handled during service integration).

### Stadium Dataset Profile

To maximize gameplay variety and simulation utility, the 10 venues will represent distinct strategic archetypes:

1. **Emerald Cove Park** (`emerald-cove-park`, Seattle, US) — Temperate coastal park, pitcher-friendly deep alleys,
   large foul territory.
2. **Highland Peak Field** (`highland-peak-field`, Denver, US) — High-altitude (5,280 ft) continental park with deep
   center field and lively ball carry.
3. **Rust Belt Yards** (`rust-belt-yards`, Cleveland, US) — Continental industrial classic with an asymmetrical 28 ft
   left-field wall.
4. **Bayou Coliseum** (`bayou-coliseum`, New Orleans, US) — Fixed dome stadium eliminating weather effects with neutral
   dimensions.
5. **Sonoran Oasis Grounds** (`sonoran-oasis-grounds`, Phoenix, US) — Arid climate, high average temperature, short
   right-field porch with tall 20 ft wall.
6. **Metro Dome Tokyo** (`metro-dome-tokyo`, Tokyo, JP) — Symmetrical modern dome, medium foul ground, fast playing
   conditions.
7. **Estadio del Sol** (`estadio-del-sol`, Santo Domingo, DO) — Tropical open-air park, high humidity, deep power
   alleys, small foul territory.
8. **Parque Metropolitano** (`parque-metropolitano`, Monterrey, MX) — High-altitude (1,770 ft) arid venue with compact
   dimensions favoring hitters.
9. **Great Northern Field** (`great-northern-field`, Montreal, CA) — Continental northern outdoor stadium, chilly
   average temperatures, pitcher-favoring deep fences.
10. **Harbor View Stadium** (`harbor-view-stadium`, Busan, KR) — Temperate sea-level park with heavy marine air and
    asymmetrical right field.

# Technical Design

### Current Implementation

- `packages/core/src/stadium/commonSchema.js`: Defines common properties (`_id`, `name`, `sport`, `gameVersion`,
  `capacity`, `location`, `climate`, `dimensions`).
- `packages/core/src/stadium/baseballStadiumSchema.js`: Enforces baseball dimension constraints (`fenceFt` and
  `wallHeightFt` for `lf`, `lcf`, `cf`, `rcf`, `rf`, plus `foulTerritory`).
- `specs/schema/STADIUM.SCHEMA.md`: Documents schema constraints, index definitions, and versioning rules.

### Key Decisions

- **File Location & Format**: `packages/core/src/stadium/stadiums.yaml`. YAML offers optimal human readability for
  stadium dimensional tables while being simple to parse during startup or testing.
- **Dataset Balance**: Distribute venues across varying climate types (`temperate`, `dome`, `tropical`, `arid`,
  `continental`) and altitudes (-10 ft to 5,280 ft) to maximize the utility of the physics and simulation calculations.
- **Strict Compliance**: Every stadium will specify `gameVersion: "0.1.0"`, valid 2-letter ISO country codes (`US`,
  `JP`, `DO`, `MX`, `CA`, `KR`), valid IANA timezones, and coordinates within bounds.

### Data Models / Contracts

Each stadium document in YAML follows the structure:

```yaml
- _id: emerald-cove-park
  name: Emerald Cove Park
  sport: baseball
  gameVersion: "0.1.0"
  capacity: 38500
  location:
    city: Seattle
    region: Washington
    country: US
    lat: 47.5914
    lng: -122.3325
    timezone: America/Los_Angeles
  climate:
    type: temperate
    altitudeFt: 15
    avgTempF: 62.5
  dimensions:
    fenceFt:
      lf: 331
      lcf: 378
      cf: 405
      rcf: 381
      rf: 326
    wallHeightFt:
      lf: 8
      lcf: 8
      cf: 8
      rcf: 8
      rf: 8
    foulTerritory: large
```

### File Structure

- `packages/core/src/stadium/stadiums.yaml` (new) — Contains the 10 YAML stadium definitions.
- `packages/core/src/stadium/stadiums.js` (new) — Loader and query utility exporting parsed stadiums.
- `packages/core/src/index.js` (modified) — Exports stadium utilities.
- `packages/core/test/stadium.test.js` (modified) — Tests validating all entries against schema.

# Testing

### Validation Approach

Automated tests in `packages/core/test/stadium.test.js` will parse `stadiums.yaml` and validate every record against the
Mongo `$jsonSchema` rules defined in `baseballStadiumSchema.js`.

### Key Scenarios

- **Record Count & Uniqueness**: Confirm exactly 10 stadium records exist, all `_id` slugs are unique, and all `name`
  properties are unique.
- **Schema Validation**: Verify each stadium object satisfies:
    - `_id` conforms to slug regex `^[a-z0-9]+(-[a-z0-9]+)*$`.
    - `sport === 'baseball'` and `gameVersion === '0.1.0'`.
    - `capacity` is an integer > 0.
    - `location` contains non-empty strings, valid ISO 3166-1 alpha-2 country codes, latitude (-90 to 90), longitude
      (-180 to 180), and valid IANA timezones.
    - `climate.type` is one of `['temperate', 'tropical', 'arid', 'continental', 'polar', 'dome']`,
      `altitudeFt >= -300`, and `avgTempF` is between -60 and 130.
    - `dimensions.fenceFt` distances satisfy: `lf` (325..365), `lcf` (340..420), `cf` (390..440), `rcf` (340..420), `rf`
      (325..365).
    - `dimensions.wallHeightFt` values are between 3 and 40.
    - `dimensions.foulTerritory` is one of `['small', 'medium', 'large']`.

### Test Changes

- Update `packages/core/test/stadium.test.js` with comprehensive validation assertions for all 10 stadium entries.

# Delivery Steps

### ✓ Step 1: Generate 10 stadiums YAML dataset

The 10 baseball stadium definitions are generated and written to `packages/core/src/stadium/stadiums.yaml` conforming
strictly to `baseballStadiumSchema`.

- Define 10 distinct, realistic stadiums spanning varied geographical regions (USA, Canada, Japan, Mexico, Dominican
  Republic, South Korea).
- Vary capacities (18,000 to 48,000), climates (`temperate`, `dome`, `tropical`, `arid`, `continental`), and altitudes
  (-10 ft to 5,280 ft) to maximize simulation dynamics.
- Configure diverse dimensional profiles (hitter-friendly short porches, pitcher-friendly deep alleys, asymmetric
  outfield walls, high Green-Monster style walls, small/medium/large foul territories).
- Verify all values conform to the schema limits: fences (`lf`/`rf`: 325–365, `lcf`/`rcf`: 340–420, `cf`: 390–440), wall
  heights (3–40 ft), ISO country codes, valid coordinates, and IANA timezones.

### ✓ Step 2: Implement stadium dataset loader and exports

`@sjge/core` provides a helper to load and parse the stadiums dataset.

- Create `packages/core/src/stadium/stadiums.js` (or `loadStadiums.js`) to read and parse `stadiums.yaml`.
- Export `stadiums`, `getStadiumById`, and `loadStadiums` from `packages/core/src/index.js`.
- Ensure JSDoc documentation and type assertions are in place.

### ✓ Step 3: Add automated schema validation tests

The test suite asserts that all 10 stadiums in YAML strictly satisfy the schema constraints and uniqueness guarantees.

- Add tests in `packages/core/test/stadium.test.js` loading `stadiums.yaml`.
- Assert exactly 10 stadiums are present with unique `_id` slugs and unique `name` properties.
- Validate each stadium object against `baseballStadiumSchema` (required fields, enum values, coordinate and fence
  ranges).
- Run `npm test` across workspaces to confirm all tests pass cleanly.
