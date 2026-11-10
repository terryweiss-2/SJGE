---
name: lint-me
description: Check code against the conditions in specs/lib/LINTER.md (type-checked params, consumed variables, complexity, JSDoc, unused imports, await, braces, semicolons, camelCase, oxlint) and offer to fix violations. Use when the user asks to lint, check linter compliance, or clean up code style. Never modifies files without explicit permission.
---

# lint-me

Audit JavaScript and Vue sources against the rules in `specs/lib/LINTER.md` and report every variance.
Fixes are only applied after the user gives explicit permission.

## When to use

- The user asks to "lint", "lint-me", "check linter compliance", "check against LINTER.md" or "clean up code style".
- The user wants a file, a package, or the files they changed audited for rule violations.

## Source of truth

`specs/lib/LINTER.md` is the single source of truth. **Read it at the start of every run** and follow the rules
it currently contains. Do not rely on a remembered or copied version of the rules. If the file has gained or lost
rules, the audit follows the file. Per-rule detection and fix guidance lives in
[references/rules.md](references/rules.md).

## Workflow

### Phase 1: audit (read-only)

Phase 1 never edits, creates, formats or deletes any project file.

1. **Read the spec.** Open `specs/lib/LINTER.md`.
2. **Determine target files.**
    - Default: files changed in git: `git diff --name-only HEAD` plus `git ls-files --others --exclude-standard`.
    - If the user gave a path, a package (e.g. `packages/lib`, `products/baseball`) or `all`, use that instead.
    - Keep only JavaScript and Vue sources (`.js`, `.mjs`, `.cjs`, `.vue`).
    - Skip `node_modules`, build output, `dist`, coverage output, lock files and other generated files.
    - If no target files remain, report "nothing to lint" and stop.
3. **Detect oxlint.** Run `npx --no-install oxlint --version`, or check `node_modules/.bin` for `oxlint`.
    - **Present:** run `oxlint --rules` to see which rule names exist, then run it on the target files for the
      LINTER.md rules it supports (see [references/rules.md](references/rules.md)). Cover the remaining rules by manual
      review.
    - **Absent:** do the whole review manually. Tell the user that oxlint is not installed and that installing it
      needs their approval (AGENTS.md: ask before adding any npm dependency). **Never install it silently.**
4. **Manual pass.** Review every target file for the rules oxlint did not cover (or all rules if oxlint is absent).
   Use the heuristics in [references/rules.md](references/rules.md). Report uncertain findings as `needs-judgment`
   instead of guessing.
5. **Print the report** in the format below.

## Complexity tiers

Cyclomatic complexity is measured per function.

| Complexity | Severity | Meaning                                          |
|------------|----------|--------------------------------------------------|
| ≤ 10       | ok       | Preferred. Not reported.                         |
| 11 – 20    | `accept` | Accepted, reported as a warning.                 |
| > 20       | `reject` | Not acceptable. Report with a refactor proposal. |

oxlint's `complexity` rule takes a single `max`: run it with `max: 10` to find `accept` and `reject` candidates,
then with `max: 20` to isolate the `reject` ones.

## Severity levels

| Severity | Meaning                                                                |
|----------|------------------------------------------------------------------------|
| `prefer` | Compliant but not the preferred style (e.g. ALL_CAPS module constant). |
| `accept` | Allowed by the spec but flagged (e.g. complexity 11–20).               |
| `reject` | Violates the spec and must be fixed.                                   |

## Report format

Group findings by file. One table per file:

```
### packages/lib/src/example.js

| Line | Rule | Severity | Fixable | Proposed fix |
|---|---|---|---|---|
| example.js:12 | No unused imports | reject | auto | Remove `import { x } from 'y'` |
| example.js:40 | Complexity (14) | accept | no | Optionally extract the validation branch |
```

- `file:line` uses the repo-relative path.
- `Fixable` is one of `auto` (safe, mechanical), `review` (change must be shown in a diff first), `no`
  (judgment-heavy, e.g. complexity refactors) or `needs-judgment` (the finding itself is uncertain).
- End with a summary: count of findings per rule and per severity, the files scanned, and whether oxlint or a manual
  review produced the results.
- If oxlint was missing, state that clearly in the summary.

### Phase 2: permission gate, fix, verify

6. **Ask permission.** After the report, ask the user which fixes to apply, with these options:
    - **all** – every fixable finding except those needing specific approval (see below)
    - **by rule** – only the named rule (s)
    - **by file** – only the named file (s)
    - **none** – make no changes

   **Make no edits before the user answers.** If the answer is "none" or unclear, stop and leave the code untouched.
   Findings that need specific approval are never included in "all" unless the user names them:
    - complexity refactors (`accept` or `reject` complexity findings)
    - renames of exported symbols (grep all workspaces for usages first)
    - `review` fixes such as adding `await`, which must be shown as a diff before they are applied
    - `needs-judgment` findings
7. **Apply approved fixes only**, with minimal diffs.
    - Do not change behaviour.
    - Add JSDoc where missing (module-level docs and all public symbols), per AGENTS.md. If a package README
      lists exported symbols, keep it in sync when exports are documented or renamed.
    - Add `check-types` assertions for public API parameters unless a JSON Schema already validates the input.
    - Never edit `node_modules` or generated files.
8. **Verify.**
    - Re-run oxlint (if present) and the manual checks on the touched files.
    - If the touched package has tests, run them: `npm test --workspace=<package>`. Tests that need Redis, MongoDB
      or RabbitMQ use the local docker containers; do not mock them. Check that the docker engine is running and start
      it if not. Close it afterwards only if you started it.
    - Report anything still non-compliant and any test failures. Do not weaken or skip tests to get a pass.

## Safety rules

- Make no edits during the audit (Phase 1) or before explicit approval.
- Never install dependencies (including `oxlint`) without asking.
- Never change behaviour; keep diffs minimal.
- Never touch `node_modules` or generated files.
- Complexity refactors and renames of exported symbols always need specific approval.
- Do not use git commands to discard or roll back changes the user did not ask you to discard.
