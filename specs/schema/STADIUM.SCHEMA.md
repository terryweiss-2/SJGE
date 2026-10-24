# Stadium Schema

Stadiums (venues) are persisted in MongoDB, one collection per sport, sharing a common field set defined in
`packages/core`. Stadium documents are immutable by convention: they are created once per game version and never
edited.

## Collections

| Collection         | Sport        | Status |
|--------------------|--------------|--------|
| `baseballStadiums` | `baseball`   | Step 2 |
| `tracks`           | `motorsport` | Later  |
| `leagueStadiums`   | all          | Link   |

## Common fields

| Field                | Type    | Rules                                                           |
|----------------------|---------|-----------------------------------------------------------------|
| `_id`                | string  | Slug, `^[a-z0-9]+(-[a-z0-9]+)*$`, e.g. `tokyo-municipal`        |
| `name`               | string  | Unique, non-empty                                               |
| `sport`              | string  | `baseball` or `motorsport`                                      |
| `gameVersion`        | string  | Semver, game version the stadium was added in                   |
| `capacity`           | integer | > 0                                                             |
| `location.city`      | string  | Required                                                        |
| `location.region`    | string  | State / province                                                |
| `location.country`   | string  | ISO 3166-1 alpha-2 code                                         |
| `location.lat`       | number  | -90..90                                                         |
| `location.lng`       | number  | -180..180                                                       |
| `location.timezone`  | string  | IANA timezone, e.g. `Asia/Tokyo`                                |
| `climate.type`       | string  | `temperate`, `tropical`, `arid`, `continental`, `polar`, `dome` |
| `climate.altitudeFt` | number  | >= -300                                                         |
| `climate.avgTempF`   | number  | -60..130                                                        |

## Baseball-specific: `dimensions`

```
dimensions: {
  fenceFt:      { lf, lcf, cf, rcf, rf },   // distance from home plate, feet
  wallHeightFt: { lf, lcf, cf, rcf, rf },   // wall height per segment, feet
  foulTerritory: 'small' | 'medium' | 'large'
}
```

Validation (MLB-style limits): `lf` and `rf` 325..365, `lcf` and `rcf` 340..420, `cf` 390..440; wall heights 3..40.

## Track-specific (later)

`dimensions{ lengthMi, shape ('oval' | 'tri-oval' | 'circuit'), corners }`. League restriction is expressed through
`leagueStadiums`.

## League-stadium link: `leagueStadiums`

A team's home stadium is only meaningful within a league, so stadiums hold no team list. The many-to-many relationship
is stored here.

| Field        | Type     | Rules                              |
|--------------|----------|------------------------------------|
| `_id`        | ObjectId |                                    |
| `leagueId`   | string   | Required                           |
| `stadiumId`  | string   | Required, references stadium `_id` |
| `teamId`     | string   | Required                           |
| `seasonFrom` | integer  | Optional                           |
| `seasonTo`   | integer  | Optional, >= `seasonFrom`          |

Unique index: `{leagueId, stadiumId, teamId, seasonFrom}`.

## Indexes (`baseballStadiums`)

- `{name: 1}` unique
- `{'location.country': 1}`
- `{gameVersion: 1}`

## IDs and versioning

`_id` is a stable slug; `gameVersion` records when the stadium was added. The `Stadium` class exposes read-only
properties (frozen instances).

## Generated artifacts

`$jsonSchema` validators are built in `packages/core/src/stadium/` from the shared common schema plus the sport
extension. JSON Schema documents (`*.schema.json`) are emitted next to the source files by `make schemas`.
