---
sessionId: session-261018-103609-1sy0
---

# Requirements

### Overview & Goals

Create high-quality, lightweight top-down vector SVG stadium diagrams for each of the 10 baseball stadiums defined in
`packages/core/src/stadium/stadiums.yaml`. The visual style will emulate a stylized, top-down arcade/manager baseball
diamond (clean saturated palettes, distinct infield/outfield turf patterns, warning tracks, base paths, and outfield
walls) optimized for crisp rendering and fluid performance on medium-power Android mobile devices.

### Scope

- **In Scope**:
    - Authoring 10 standalone, resolution-independent SVG files in `packages/core/src/stadium/svg/{stadium-id}.svg`.
    - Accurately representing each stadium's unique parameters:
        - Custom outfield fence contours based on LF, LCF, CF, RCF, RF distances.
        - Outfield wall height representation (visual wall depth/accents reflecting heights like the 28ft wall in Rust
          Belt Yards or 20ft porch in Sonoran Oasis Grounds).
        - Foul territory scaling corresponding to `small`, `medium`, and `large` presets.
        - Climate and architectural theming (e.g., dome roof frames for Bayou Coliseum and Metro Dome Tokyo; arid
          clay/sand tones for Sonoran and Monterrey; lush grass striping for Emerald Cove; coastal elements for Harbor
          View).
    - Providing loader and asset accessor utilities in `packages/core/src/stadium/stadiums.js` (`getStadiumSvg(id)` and
      `getStadiumSvgPath(id)`).
    - Re-exporting stadium SVG utilities from `packages/core/src/index.js`.
    - Adding automated unit tests in `packages/core/test/stadium.test.js` validating XML integrity, viewBox, semantic
      group structure, and performance budget (< 30 KB per SVG).
- **Out of Scope**:
    - Animated SVG elements or JavaScript embedded inside SVGs (plain, static vector graphics for mobile compatibility
      and security).
    - Motorsport circuit SVGs (deferred to motorsport track milestone).

### Stadium Visual Profiles (10 Stadiums)

1. **Emerald Cove Park** (`emerald-cove-park`, Seattle): Lush emerald green turf with cross-cut lawn patterns, expansive
   large foul ground, deep symmetrical power alleys, and subtle Pacific Northwest coastal concourse accents.
2. **Highland Peak Field** (`highland-peak-field`, Denver): High-altitude mile-high venue with deep center field (415
   ft), medium foul territory, crisp mountain pine-green grass, and a 14 ft right-field wall.
3. **Rust Belt Yards** (`rust-belt-yards`, Cleveland): Asymmetric urban classic featuring a towering 28 ft left-field
   "monster" wall with industrial brick-tone warning track and tight, hitter-friendly small foul territory.
4. **Bayou Coliseum** (`bayou-coliseum`, New Orleans): Climate-controlled indoor dome featuring turf texture, fixed dome
   roof truss perimeter, symmetrical 400 ft center field, and medium foul territory.
5. **Sonoran Oasis Grounds** (`sonoran-oasis-grounds`, Phoenix): Desert-themed outdoor stadium with arid clay warning
   tracks, warm-toned infield dirt, short right-field porch (325 ft) backed by a 20 ft wall, and compact foul area.
6. **Metro Dome Tokyo** (`metro-dome-tokyo`, Tokyo): Ultra-clean modern indoor dome with rounded outfield geometry,
   vibrant artificial turf striping, circular concourse architecture, and medium foul grounds.
7. **Estadio del Sol** (`estadio-del-sol`, Santo Domingo): Caribbean tropical ballpark with vibrant turquoise/coral
   concourse accents, deep 410 ft center field, small foul territory, and warm sunlit turf.
8. **Parque Metropolitano** (`parque-metropolitano`, Monterrey): Compact high-elevation arid stadium with fast 325 ft
   corners, clean symmetrical fences, warm terracotta dirt, and medium foul territory.
9. **Great Northern Field** (`great-northern-field`, Montreal): Northern outdoor classic with deep 410 ft alleys, 12 ft
   perimeter walls, large foul territory, and cool-toned forest green grass.
10. **Harbor View Stadium** (`harbor-view-stadium`, Busan): Coastal venue with large foul territory, sea-breeze themed
    blue/navy concourse borders, and an asymmetric 15 ft right-field wall extending to right-center.

### Technical & Mobile Constraints

- **Coordinate Space & Resolution**: Unified `viewBox="0 0 800 800"` coordinate space ensuring crisp scaling on standard
  Android screen densities (mdpi to xxxhdpi) without rasterization artifacts.
- **Performance Budget**: Target file size under 25 KB per SVG (hard limit < 40 KB) to ensure zero frame drops and fast
  DOM parsing on low/mid-tier mobile chipsets.
- **Render Cleanliness**: Use pure vector paths, linear/radial gradients, and polygons without complex SVG filter chains
  (`feGaussianBlur`, `feDropShadow`) that degrade mobile GPU canvas rendering.

# Technical Design

### Current Implementation

- `packages/core/src/stadium/stadiums.yaml`: Defines data records for all 10 stadiums with full dimensional, climate,
  and geographic details.
- `packages/core/src/stadium/stadiums.js`: Preloads and queries stadiums via `stadiums`, `loadStadiums()`, and
  `getStadiumById(id)`.
- `packages/core/src/index.js`: Exposes stadium schemas, indexes, validators, and loader functions.

### Key Decisions

- **Pre-rendered Standalone SVGs**: Store SVGs as individual static `.svg` files in `packages/core/src/stadium/svg/`.
  This allows zero-cost bundler integration (Vite, Webpack, Android asset loaders), direct import in Vue/HTML `<img>`
  tags, or inline SVG injection.
- **Standard Layer Grouping**: Every SVG will follow a standard semantic `<g>` structure:
    - `<g id="background-stands">` — Outfield concourse, stadium boundary, seating geometry, and theme backdrop.
    - `<g id="outfield-grass">` — Outfield turf polygon with stadium-specific lawn mowing patterns.
    - `<g id="warning-track">` — Distinct warning track path running along outfield walls and foul margins.
    - `<g id="foul-territory">` — Infield and backstop foul ground tailored to small/medium/large dimensions.
    - `<g id="infield-dirt">` — Standard baseball diamond dirt cutout and pitcher's mound.
    - `<g id="base-paths-lines">` — Foul lines (chalk white), running lanes, batter's boxes, catcher's box, on-deck
      circles.
    - `<g id="bases">` — 1st, 2nd, 3rd base bags and home plate.
    - `<g id="outfield-wall">` — Outfield wall stroke/polygons with height-differentiated line weight and wall-top
      highlights.
    - `<g id="stadium-accents">` — Venue-specific identifiers (foul poles, distance markers, dome roof outlines).
- **Proportional Scaling**: Home plate anchored at `(400, 680)`. A scaling factor of approx `1.15 px/ft` maps 400 ft
  center field fences comfortably into the 800x800 viewBox with room for warning tracks and stands.

### Data Models / Contracts

Extended exports in `@sjge/core`:

```javascript
/**
 * Reads and returns the raw SVG string for a given stadium ID.
 * @param {string} id - Stadium slug identifier (e.g. 'emerald-cove-park').
 * @returns {string} Raw SVG XML markup.
 * @throws {Error} If id is invalid or stadium SVG is not found.
 */
export function getStadiumSvg(id);

/**
 * Returns the absolute or file URL path to the SVG asset for a given stadium ID.
 * @param {string} id - Stadium slug identifier.
 * @returns {URL} File URL to the stadium SVG asset.
 */
export function getStadiumSvgPath(id);
```

### File Structure

- `packages/core/src/stadium/svg/` (new directory):
    - `emerald-cove-park.svg`
    - `highland-peak-field.svg`
    - `rust-belt-yards.svg`
    - `bayou-coliseum.svg`
    - `sonoran-oasis-grounds.svg`
    - `metro-dome-tokyo.svg`
    - `estadio-del-sol.svg`
    - `parque-metropolitano.svg`
    - `great-northern-field.svg`
    - `harbor-view-stadium.svg`
- `packages/core/src/stadium/stadiums.js` (modified) — Adds `getStadiumSvg` and `getStadiumSvgPath` utilities with
  `check-types` validation.
- `packages/core/src/index.js` (modified) — Exports `getStadiumSvg` and `getStadiumSvgPath`.
- `packages/core/test/stadium.test.js` (modified) — Unit tests asserting existence, XML validity, viewBox, layer groups,
  and byte size bounds for all 10 stadium SVGs.

# Testing

### Validation Approach

Automated unit tests in `packages/core/test/stadium.test.js` using Node's built-in `node:test` and `node:assert/strict`
test runner.

### Key Scenarios

- **Asset Existence & Retrieval**:
    - `getStadiumSvg(id)` returns valid SVG content for all 10 stadiums in `stadiums.yaml`.
    - `getStadiumSvgPath(id)` returns an existing file URL.
    - `getStadiumSvg` throws descriptive errors for non-existent IDs, empty strings, or invalid argument types.
- **SVG Syntax & Standards Compliance**:
    - All 10 SVG files start with `<svg` and end with `</svg>`.
    - Each root `<svg>` element specifies `xmlns="http://www.w3.org/2000/svg"` and `viewBox="0 0 800 800"`.
    - Required semantic layer groups exist in every SVG (`#outfield-grass`, `#warning-track`, `#infield-dirt`, `#bases`,
      `#outfield-wall`, `#foul-lines`).
- **Mobile Performance Budget**:
    - Each SVG file size is strictly under 40 KB (typical target 10–25 KB).
    - No disallowed expensive SVG filters (`<filter>`, `<feGaussianBlur>`) that cause performance lag on mobile
      webviews/Android canvases.

# Delivery Steps

### ✓ Step 1: Author top-down SVG assets for all 10 stadiums

All 10 baseball stadium SVGs are authored and stored in `packages/core/src/stadium/svg/` conforming to accurate
dimensions, foul territory scale, wall heights, and mobile-optimized vector formatting.

- Create `packages/core/src/stadium/svg/` directory.
- Generate top-down SVGs with `viewBox="0 0 800 800"` for the 10 venues: `emerald-cove-park`, `highland-peak-field`,
  `rust-belt-yards`, `bayou-coliseum`, `sonoran-oasis-grounds`, `metro-dome-tokyo`, `estadio-del-sol`,
  `parque-metropolitano`, `great-northern-field`, and `harbor-view-stadium`.
- Implement distinct outfield wall curves mapped to each stadium's fence distances (`lf`, `lcf`, `cf`, `rcf`, `rf`).
- Incorporate distinct architectural and climate motifs (dome roofs, turf patterns, desert clay, monster walls, foul
  territory sizing).
- Ensure vector paths are clean, efficient, and free of expensive raster/filter effects.

### ✓ Step 2: Implement SVG loaders and exports in @sjge/core

`@sjge/core` provides helper functions to resolve and load stadium SVGs by stadium ID.

- Add `getStadiumSvg(id)` and `getStadiumSvgPath(id)` to `packages/core/src/stadium/stadiums.js`.
- Add parameter validation using `check-types`.
- Export `getStadiumSvg` and `getStadiumSvgPath` in `packages/core/src/index.js`.
- Update `packages/core/README.md` to document the new stadium SVG functions.

### ✓ Step 3: Add automated SVG verification tests

The test suite validates that all 10 SVG files exist, load correctly, adhere to mobile vector constraints, and contain
required structural groups.

- Update `packages/core/test/stadium.test.js` with test suites for SVG integrity, viewBox standard, group hierarchy, and
  file size limits.
- Assert error handling for invalid/missing stadium IDs.
- Run `npm test --prefix packages/core` to verify all unit tests pass cleanly.