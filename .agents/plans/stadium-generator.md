---
sessionId: session-261025-082428-17ea
---

# Requirements

### Overview & Goals

Make every workspace test suite use TapJS, as required by `../../AGENTS.md`. Eight files still import `node:test` and
`node:assert/strict`; those switch to the same `import t from 'tap'` style already used in `@sjge/lib`.

### Scope

**In scope**

- Convert all remaining `node:test` files to TapJS.
- Change workspace `"test"` scripts from `node --test` to `tap`.
- Add `tap` `^21.0.0` as a `devDependency` on packages that do not already have it (same version as `@sjge/lib`).

**Out of scope**

- Changing assertion coverage or test names, except where the TapJS API mapping requires it.
- Hoisting `tap` to the repo root.
- Upgrading or replacing TapJS to work around Node 25.

### User Stories

- As a developer, I want `npm test` in every workspace to run TapJS so the repo matches `../../AGENTS.md`.
- As a developer, I want new tests to copy one pattern (`import t from 'tap'`) instead of mixing Node’s test runner with
  TapJS.

### Functional Requirements

- No test file imports `node:test` or `node:assert`.
- `@sjge/core`, `@sjge/ui`, `@sjge/baseball`, and `@sjge/motorsport` run tests with `"test": "tap"`.
- `@sjge/lib` already uses `"test": "tap"`; only `../../packages/lib/test/index.test.js` still needs converting.
- Assertions keep the same meaning after mapping to TapJS (`t.equal`, `t.same`, `t.ok`, `t.match`, `t.throws`).

# Technical Design

### Current Implementation

Already on TapJS (the pattern to copy):

- `../../packages/lib/package.json` — `"test": "tap"`, `devDependencies.tap` `^21.0.0`
- `../../packages/lib/test/config.test.js` and `packages/lib/test/logger.test.js` — `import t from 'tap'`, then
  `t.test('…', (t) => { …; t.end(); })`

Still on Node’s test runner (`import test from 'node:test'` + `import assert from 'node:assert/strict'`,
`"test": "node --test"`):

- `../../packages/lib/test/index.test.js` (`@sjge/lib`; script already `tap`)
- `../../packages/core/test/index.test.js` and `packages/core/test/stadium.test.js` (`@sjge/core`)
- `../../packages/ui/test/index.test.js` (`@sjge/ui`)
- `../../products/baseball/test/index.test.js`, `products/baseball/test/baseballStadiumGenerator.test.js`,
  `products/baseball/test/stadiumStore.test.js` (`@sjge/baseball`)
- `../../products/motorsport/test/index.test.js` (`@sjge/motorsport`)

Root `npm test` already runs workspace scripts via `--workspaces --if-present`. `Makefile` `test` just calls `npm test`.

### Key Decisions

- Follow `@sjge/lib` exactly: `import t from 'tap'`, nested `t.test` callbacks that call `t.end()`, TapJS `^21.0.0` as a
  per-package `devDependency`. No new third-party library — this is the TapJS already in the repo.
- Mechanical assertion mapping only; do not rewrite scenarios.

### Proposed Changes

Convert each `node:test` file to:

```js
import t from 'tap';

t.test('name', (t) => {
    t.equal(actual, expected);
    t.end();
});
```

Assertion map: `assert.equal` → `t.equal`, `assert.deepEqual` → `t.same`, `assert.ok` → `t.ok`, `assert.match` →
`t.match`, `assert.throws` → `t.throws`.

Package scripts: `../../packages/core/package.json`, `packages/ui/package.json`, `products/baseball/package.json`,
`products/motorsport/package.json` get `"test": "tap"` and `"devDependencies": { "tap": "^21.0.0" }`.
`packages/lib/package.json` is already correct. Then `npm install` so workspaces pick up `tap`.

### File Structure

Modified (no new source files):

- `../../packages/core/package.json`, `packages/ui/package.json`, `products/baseball/package.json`,
  `products/motorsport/package.json`
- `../../packages/lib/test/index.test.js`
- `../../packages/core/test/index.test.js`, `packages/core/test/stadium.test.js`
- `../../packages/ui/test/index.test.js`
- `../../products/baseball/test/index.test.js`, `products/baseball/test/baseballStadiumGenerator.test.js`,
  `products/baseball/test/stadiumStore.test.js`
- `../../products/motorsport/test/index.test.js`

### Risks

- Earlier work saw TapJS 21 crash on Node 25 (`ink` / `es-toolkit` directory import) when running `@sjge/lib`. This
  change does not fix that; if the environment is Node 25, `tap` may fail the same way after the conversion. `engines`
  is `node >= 20`; run tests on a supported Node if that crash appears.

# Testing

### Validation Approach

Grep for leftover `node:test` / `node:assert` imports, then run each workspace `npm test` (and root `npm test` if the
runner is healthy).

### Key Scenarios

- Every workspace script is `"tap"`.
- Converted tests still pass with the same expectations (exports, schema, generator uniqueness, store top-up / orphan
  cleanup).
- `../../packages/lib/test/config.test.js` and `logger.test.js` stay unchanged and still run.

### Edge Cases

- `assert.throws(..., Error)` / `TypeError` become `t.throws` with the same constructor or message check used in
  `logger.test.js`.
- Tests that currently use a callback-less `test('name', () => { … })` must call `t.end()` (or return a promise) so
  TapJS does not hang.

# Delivery Steps

### ✓ Step 1: Add TapJS to workspaces and switch test scripts

Each package that still runs `node --test` uses `"test": "tap"` and `tap` `^21.0.0`.

- Add `tap` `^21.0.0` as a `devDependency` on `@sjge/core`, `@sjge/ui`, `@sjge/baseball`, and `@sjge/motorsport`.
- Change those `"test"` scripts from `node --test` to `tap`.
- Run `npm install` so the workspace links `tap`.

### ! Step 2: Convert remaining node:test files to TapJS

No test file imports `node:test` or `node:assert`; all use the `@sjge/lib` TapJS style.

- Convert `../../packages/lib/test/index.test.js`, `packages/core/test/index.test.js`, `packages/ui/test/index.test.js`,
  `products/baseball/test/index.test.js`, and `products/motorsport/test/index.test.js`.
- Convert `../../packages/core/test/stadium.test.js`, `products/baseball/test/baseballStadiumGenerator.test.js`, and
  `products/baseball/test/stadiumStore.test.js`.
- Map assertions as in Technical Design; call `t.end()` in each `t.test` callback.
- Confirm there are no remaining `node:test` / `node:assert` imports, then run the workspace tests.