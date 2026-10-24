---
sessionId: session-261018-170413-1vm0
---

# Requirements

### Overview & Goals

The project name is being updated from `SBGSuite` to `SJGE`. Renaming the project and standardizing all package
namespaces optimizes systemic clarity, minimizes developer friction, and ensures consistent identification across
package manifests, source exports, tests, and documentation.

### Scope

- **In Scope**:
    - Updating the root project name in `package.json` to `sjge`.
    - Updating package names in `packages/*` and `products/*` from `@sbgsuite/<pkg>` to `@sjge/<pkg>`.
    - Updating exported name constants in `src/index.js` and their corresponding test assertions in `test/index.test.js`
      across all packages and products.
    - Updating documentation files (`README.md`, `SCAFFOLD.md`, `packages/lib/README.md`, and
      `.agents/plans/sbgsuite-planning-roadmap.md`).
- **Out of Scope**:
    - Renaming the physical root folder on disk (`SBGSuite`), preserving path stability and avoiding disruption to
      existing environment tooling.
    - Altering underlying core domain models, gameplay mechanics, or service specifications.

### Functional Requirements

- **FR-1**: Root package manifest (`package.json`) defines `"name": "sjge"`.
- **FR-2**: Workspace packages (`@sjge/core`, `@sjge/lib`, `@sjge/ui`, `@sjge/baseball`, `@sjge/motorsport`) use the
  `@sjge` npm scope.
- **FR-3**: Package root modules (`src/index.js`) export `export const name = '@sjge/<pkg>'`.
- **FR-4**: Unit tests verifying module name exports check for `@sjge/<pkg>`.
- **FR-5**: Markdown documentation (`README.md`, `SCAFFOLD.md`, `packages/lib/README.md`, etc.) reflects the SJGE title
  and import paths.

# Technical Design

### Current Implementation

- Root `package.json` uses `"name": "sbgsuite"`.
- Sub-packages use `"name": "@sbgsuite/<package>"` across `packages/core`, `packages/lib`, `packages/ui`,
  `products/baseball`, and `products/motorsport`.
- Each package exports `name = '@sbgsuite/<package>'` in its `src/index.js` and asserts this value in its
  `test/index.test.js`.
- Documentation (`README.md`, `SCAFFOLD.md`, `packages/lib/README.md`) references `SBGSuite` and `@sbgsuite/lib`.

### Key Decisions

- **Standardized Namespace (`@sjge/*`)**: Migrating workspace packages to the `@sjge` namespace yields the greatest
  utility and coherence across the monorepo while preventing import ambiguity.
- **Retain Physical Directory Name**: Leaving `C:\Users\terry\WebstormProjects\SBGSuite` as-is eliminates unnecessary
  filesystem relocation risks and preserves local IDE and shell bindings.

### File Structure

- `package.json`
- `README.md`
- `SCAFFOLD.md`
- `packages/core/package.json`
- `packages/core/src/index.js`
- `packages/core/test/index.test.js`
- `packages/lib/package.json`
- `packages/lib/src/index.js`
- `packages/lib/test/index.test.js`
- `packages/lib/README.md`
- `packages/ui/package.json`
- `packages/ui/src/index.js`
- `packages/ui/test/index.test.js`
- `products/baseball/package.json`
- `products/baseball/src/index.js`
- `products/baseball/test/index.test.js`
- `products/motorsport/package.json`
- `products/motorsport/src/index.js`
- `products/motorsport/test/index.test.js`
- `.agents/plans/sbgsuite-planning-roadmap.md`

### Architecture Diagram

```mermaid
graph TD
    Root[sjge root package.json] --> Core[@sjge/core]
    Root --> Lib[@sjge/lib]
    Root --> UI[@sjge/ui]
    Root --> Baseball[@sjge/baseball]
    Root --> Motorsport[@sjge/motorsport]
```

# Testing

### Validation Approach

Verification ensures maximum reliability and seamless functioning of package references and tests.

### Key Scenarios

1. **Workspace Package Verification**:
    - Run `node --test` in `packages/core`, `packages/ui`, `products/baseball`, and `products/motorsport` to confirm
      exported package names match `@sjge/*`.
2. **Consistency Search**:
    - Perform regex/text search across codebase to ensure no stale `@sbgsuite/` references remain in active code or
      documentation.

# Delivery Steps

### ✓ Step 1: Update package manifests, source exports, and unit tests to @sjge scope

All package names, source exports, and test assertions in root and workspace packages reflect the SJGE naming
convention.

- Update root `package.json` name from `sbgsuite` to `sjge`.
- Update workspace `package.json` files (`packages/core`, `packages/lib`, `packages/ui`, `products/baseball`,
  `products/motorsport`) to use the `@sjge/*` scope instead of `@sbgsuite/*`.
- Update exported `name` constants in `src/index.js` for `core`, `lib`, `ui`, `baseball`, and `motorsport` to export
  `@sjge/<package>`.
- Update test expectations in `test/index.test.js` across all packages and products to assert `@sjge/<package>`.
- Run package unit tests via `node --test` to ensure name assertion suites pass.

### ✓ Step 2: Update repository documentation and agent plans

All documentation files and reference materials accurately refer to SJGE without stale naming artifacts.

- Update `README.md` to use the project title `SJGE` and update any references from `SBGSuite` to `SJGE`.
- Update `SCAFFOLD.md` header and body references from `SGBSuite` / `SBGSuite` to `SJGE`.
- Update `packages/lib/README.md` title and code snippets to reference `@sjge/lib` and SJGE packages.
- Update `.agents/plans/sbgsuite-planning-roadmap.md` references to align with SJGE.
- Perform a repository-wide search to verify no unintended residual `sbgsuite` references remain.