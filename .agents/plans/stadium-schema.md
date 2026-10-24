---
sessionId: session-261023-185401-wgku
---

# Requirements

### Overview

Define the Mongo schema for stadiums (step 1). Implementation and generation of 10 stadiums follow later.

### Decisions from your answers

1. **Abstraction**: collection per sport (`baseballStadiums`, `tracks`) sharing a base `Stadium` class/common field set
   in `../../packages/core`.
2. **Baseball dimensions**: full outline - fence distances at LF, LCF, CF, RCF, RF (ft), wall heights per segment, foul
   territory size.
3. **Location**: city, region, ISO country, lat/lng, timezone, climate/altitude.
4. **Teams/Leagues**: stadium holds no team list. A team's home stadium is only meaningful within a league; the
   relationship is captured in a many-to-many collection linking leagues to stadiums (e.g. `leagueStadiums`:
   `leagueId`, `stadiumId`, `teamId`, plus season range if needed).
5. **IDs/versioning**: slug string `_id` (e.g. `tokyo-municipal`) plus `gameVersion` (added-in); immutable by convention
   in the Stadium class.

### Common fields

`_id`, `name` (unique), `sport`, `gameVersion`, `capacity`, `location{city,region,country,lat,lng,timezone}`,
`climate{type,altitudeFt,avgTempF}`.

### Baseball-specific

`dimensions{ fenceFt{lf,lcf,cf,rcf,rf}, wallHeightFt{...same keys}, foulTerritory:'small'|'medium'|'large' }`.

### Track-specific (later)

Also stored under `dimensions{ lengthMi, shape (oval/tri-oval/circuit), corners }`, with league restriction handled
via the league-stadium link collection.

# Technical Design

### Proposed Changes

- Spec doc `../../specs/schema/STADIUM.SCHEMA.md` describing fields above, indexes (unique `name`, index
  `location.country`,
  `gameVersion`), validation rules (capacity > 0, MLB-style fence limits), and the league-stadium link collection.
- MongoDB `$jsonSchema` validators per collection built from shared common-field schema plus sport-specific part.
  JSON Schema documents (`*.schema.json`) are also generated into the same directory as the source code of the
  corresponding classes.
- Later: `Stadium` base class and `BaseballStadium` subclass in `../../packages/core`, check-types validation, jsdoc and
  README update; generator in `products/baseball`.

# Delivery Steps

### ✓ Step 1: Write stadium schema spec

`../../specs/schema/STADIUM.SCHEMA.md` documents the agreed schema.

- Common fields, baseball dimensions, location/climate.
- Indexes and validation rules.
- League-to-stadium many-to-many collection and slug/gameVersion rules.

### ✓ Step 2: Define Mongo validators

JSON-schema validators exist for `baseballStadiums`.

- Shared common schema in `../../packages/core`.
- Baseball-specific extension.
- Index definitions.
- JSON Schema documents emitted next to the class source files.