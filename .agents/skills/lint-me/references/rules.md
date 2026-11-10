# lint-me rule reference

How to **detect** and **fix** each rule in `specs/lib/LINTER.md`. This file does not restate the rules' wording;
`specs/lib/LINTER.md` (read at run time) is authoritative. If the spec has changed, follow the spec and extend these
recipes by analogy.

oxlint implements only a subset of ESLint-style rules. Always confirm names with `oxlint --rules` before relying on
a rule name below. If a rule is not listed or oxlint is absent, use the manual heuristic.

`Auto-safe`: `yes` = mechanical, apply when approved; `review` = show diff first; `no` = needs specific approval.

| #  | Rule (LINTER.md)                 | Detection                                                                 | Fix                          | Auto-safe                     |
|----|----------------------------------|---------------------------------------------------------------------------|------------------------------|-------------------------------|
| 1  | Every parameter checked for type | Manual                                                                    | Add `check-types` assertions | review                        |
| 2  | Every variable consumed          | oxlint `no-unused-vars`                                                   | Remove or use                | yes (locals), review (params) |
| 3  | Cyclomatic complexity            | oxlint `complexity` (max 10, then 20)                                     | Propose extraction           | no                            |
| 4  | Module level symbols documented  | Manual / oxlint jsdoc plugin                                              | Add JSDoc                    | yes                           |
| 5  | No unused imports                | oxlint `no-unused-vars`                                                   | Remove import                | yes                           |
| 6  | `await` on `async` operations    | oxlint `no-floating-promises` / `require-await` if available, else manual | Add `await`                  | review                        |
| 7  | Braces everywhere                | oxlint `curly`                                                            | Add braces                   | yes                           |
| 8  | Semicolons everywhere            | oxlint `semi` if available, else manual                                   | Add `;`                      | yes                           |
| 9  | camelCase naming                 | oxlint `camelcase` if available, else manual                              | Rename                       | review                        |
| 10 | Use oxlint where available       | `npx --no-install oxlint --version`                                       | n/a, report if missing       | n/a                           |

## 1. Parameter type checks

- **Detect:** for each exported function, class method or public API, look for `check-types` (`check.assert...`)
  calls covering every parameter. Skip when the input is validated by a JSON Schema (e.g. message handlers).
  Private or local helpers are lower priority; report them as `prefer`.
- **Fix:** add `check.assert.string(x)` and similar at the top of the function. Pick the narrowest correct type
  from usage and JSDoc. Do not add checks that would reject currently valid inputs; if the type is unclear, mark
  `needs-judgment`.
- **Auto-safe:** review.

## 2. Every variable consumed

- **Detect:** oxlint `no-unused-vars`; manually look for variables assigned but never read, unused destructured
  names and unused catch bindings.
- **Fix:** delete the declaration if the initializer has no side effects. If it has side effects, keep the call
  and drop the binding. Unused function parameters: prefix with `_` or remove only if not part of a required
  signature (callbacks, interface implementations).
- **Auto-safe:** yes for locals; review for parameters.

## 3. Cyclomatic complexity

- **Detect:** oxlint `complexity` with `max: 10` (flags `accept` + `reject` candidates) and `max: 20` (flags
  `reject`). Manually: count `if`, `else if`, `case`, loops, `&&`, `||`, `??`, `?:`, `catch` plus 1.
- **Severity:** ≤10 ok, 11–20 `accept`, >20 `reject`.
- **Fix:** propose extracting helpers or lookup tables. Show the proposal but do not apply it without a specific
  go-ahead.
- **Auto-safe:** no.

## 4. Module level symbols documented

- **Detect:** every module has a module-level JSDoc block (`@module` or file header), and every exported or
  module-level function, class, constant and public method/property has JSDoc. oxlint's jsdoc plugin may cover
  `require-jsdoc`-style rules if enabled.
- **Fix:** add JSDoc with description, `@param`, `@returns` and `@throws` as applicable, inferred from the code.
  Do not invent behaviour; keep descriptions factual. Note that the package README should list exported symbols.
- **Auto-safe:** yes.

## 5. No unused imports

- **Detect:** oxlint `no-unused-vars` (covers imports). Manually: every imported binding must appear elsewhere
  in the file (including JSDoc `@type` uses only if the import is genuinely needed for types).
- **Fix:** remove the unused specifier, or the whole import statement. Keep side-effect imports (`import './x.js'`).
- **Auto-safe:** yes.

## 6. `await` on async operations

- **Detect:** oxlint `no-floating-promises` (needs type info, may be unavailable) or `require-await`. Manually:
  calls to `async` functions, ioRedis, MongoDB, fetch, `fs.promises` or other promise-returning APIs whose result
  is neither awaited, returned, nor deliberately chained. Also `async` functions that contain no `await`.
- **Fix:** add `await` (inside an `async` function), or `return` the promise where appropriate. If the fire-and-forget
  is intentional, flag as `needs-judgment` and suggest an explicit `void` plus a comment rather than changing it.
- **Auto-safe:** review, since adding `await` can change timing and error flow.

## 7. Braces required everywhere

- **Detect:** oxlint `curly` (`all`). Manually: `if`/`else`/`for`/`while`/`do` without a `{}` body.
- **Fix:** wrap the body in braces; keep formatting minimal.
- **Auto-safe:** yes.

## 8. Semicolons required everywhere

- **Detect:** oxlint `semi` if available (otherwise manual): statements ending a line without `;`, including
  `import`/`export`, variable declarations, expression statements and `return`.
- **Fix:** add `;`. Watch lines starting with `(`, `[` or a template literal where a missing semicolon on the previous
  line changes parsing. Do not touch class member method bodies or block ends that do not need one.
- **Auto-safe:** yes.

## 9. camelCase for all symbols

- **Detect:** oxlint `camelcase` if available. Manually: snake_case, kebab-like or PascalCase names for variables,
  functions and properties. PascalCase is acceptable for classes and Vue components. Module-level constants in
  `ALL_CAPS` are accepted but reported as `prefer` (non-preferred). Do not flag names dictated by external APIs,
  JSON Schema field names or database documents.
- **Fix:** rename. Grep all workspaces (`packages/*`, `products/*`) for usages first. Renaming an exported symbol
  or a property used across modules needs specific approval.
- **Auto-safe:** review.

## 10. Use oxlint where available

- **Detect:** `npx --no-install oxlint --version` or `node_modules/.bin/oxlint`.
- **If present:** use it for every rule above that it supports; do manual review for the rest.
- **If absent:** perform the entire audit manually, state that oxlint is missing in the report summary, and note
  that installing it requires the user's approval. Never install it silently, and do not create an oxlint config
  file without asking.
- **Auto-safe:** n/a.
