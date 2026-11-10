# Requirements

### Overview & Goals

Create an agent skill named `lint-me` that audits code against the rules in `../../specs/lib/LINTER.md` and reports
variances. It can fix them to make the code compliant, but only after the user gives explicit permission.

### Scope

**In scope**

- New skill at `../skills/lint-me/SKILL.md` (location mandated by AGENTS.md).
- Optional reference file `../skills/lint-me/references/rules.md`, mapping each LINTER.md rule to how it is checked and
  fixed.
- A permission-gated workflow: scan, report, ask, fix, re-verify.

**Out of scope**

- Editing `../../specs/lib/LINTER.md` itself. It remains the single source of truth, and the skill reads it at run time
  instead of copying the rules.
- Adding `oxlint` or any other npm dependency. AGENTS.md requires approval first, and `oxlint` is not currently
  installed.
- Adding a Makefile lint target or CI integration.
- Creating an oxlint config file.

### User Stories

- As a developer, I want to say "lint-me" and get a report of rule violations in a file, package or the changed files.
- As a developer, I want nothing modified until I approve, so that I stay in control of the code.
- As a developer, I want the skill to use `oxlint` where it has a matching rule, so that checks are fast and consistent.

### Functional Requirements

1. **Trigger.** The skill description must say when to use it: requests to lint, check compliance with LINTER.md or the
   linter spec, or clean up code style.
2. **Rules from the spec.** Read `../../specs/lib/LINTER.md` at the start of every run. If the file has changed, the
   skill follows the current rules.
3. **Scope.** Default to files changed in git (`git diff --name-only` plus untracked files). Accept an explicit path,
   package or `all`. Only JavaScript and Vue sources are in scope. Skip `node_modules` and generated files.
4. **Checks.** Cover all rules in the spec:
    - parameter type checks (`check-types`, unless a JSON Schema covers the input)
    - consumed variables
    - cyclomatic complexity: ≤10 preferred, ≤20 accepted warning, >20 reject
    - documented module-level symbols
    - no unused imports
    - `await` on async operations
    - required braces
    - required semicolons
    - camelCase naming (ALL_CAPS module constants accepted but flagged as non-preferred)
    - oxlint used where available
5. **oxlint usage.** Detect oxlint with `npx --no-install oxlint --version`, or from the `../../node_modules/.bin`
   folder. If it is present, run it for the rules it supports and check `oxlint --rules` to find the matching rule
   names. Cover the remaining rules by manual review. If it is absent, do the whole review manually and tell the user
   that oxlint is missing and that installing it needs their approval. Never install it silently.
6. **Report.** Group findings by file, with `file:line`, the rule, severity (`prefer`, `accept`, `reject`), whether it
   is auto-fixable, and a proposed fix. End with a summary count per rule.
7. **Permission gate.** After the report, ask the user which fixes to apply: all, by rule, by file, or none. Make no
   edits before an answer. Do not refactor high-complexity functions without a specific go-ahead, because that is a
   judgment-heavy change.
8. **Fix.** Apply only the approved fixes with minimal diffs. Do not change behaviour. Add JSDoc where it is missing,
   following the AGENTS.md rule that module-level docs and public symbols are documented.
9. **Verify.** Re-run the checks after fixing. If tests exist for the touched package, run them
   (`npm test --workspace=<pkg>`). Report anything still non-compliant.

# Technical Design

### Current Implementation

- `../../specs/lib/LINTER.md` holds the bullet rules. The last one says to use `oxlint` where available rules are
  preferred.
- `../skills` held only `.gitkeep` before this work, so there was no existing skill to copy.
- The repo has no oxlint config or binary, no `lint` script in the root `../../package.json`, and no lint target in the
  `Makefile`.
- The repo is an npm-workspaces mono-repo (`packages/*`, `products/*`) that uses ES modules.
- The skill frontmatter format (`name`, `description`) follows the Agent Skills convention.

### Key Decisions

- **The spec is read at run time, not duplicated.** This avoids drift between the skill and LINTER.md. The
  `references/rules.md` file only holds *how* to check and fix each rule, not the rules' wording.
- **Hybrid checking.** oxlint handles what it can. A manual pass covers the rest, such as type checks on public
  parameters, JSDoc and the two-tier complexity threshold. oxlint's `complexity` rule takes one `max`, so a run with
  `max: 10` finds the `prefer` violations and a run with `max: 20` finds the `reject` ones.
- **Two phases with a hard gate.** Phase 1 is read-only. Phase 2 edits files, and runs only after explicit user approval
  in the same session.
- **No new dependencies.** The skill never installs anything without asking, per AGENTS.md.

### Proposed Changes

**1. `../skills/lint-me/SKILL.md`**
Frontmatter with `name: lint-me` and a trigger-oriented `description`. Body sections: when to use, workflow (read spec,
determine targets, detect oxlint, manual pass, report, permission gate, fix, verify), complexity tiers, severity levels,
report format, safety rules.

**2. `../skills/lint-me/references/rules.md`**
One short section per LINTER.md rule giving the detection method, the fix recipe and whether the fix is safe to apply
automatically. Exact oxlint rule names must be confirmed with `oxlint --rules` at run time, since oxlint implements a
subset.

### Risks

- **oxlint missing or lacking some rules.** The skill falls back to a manual review and says so in the report.
- **Renames break callers.** The camelCase fix greps for usages across workspaces before renaming, and treats exported
  symbols as needing explicit approval.
- **Adding `await` can change behaviour.** These fixes are marked `review` and shown in the diff before they are
  applied.
- **Rules read ambiguously** (e.g. "every variable must be consumed"). The skill reports uncertain findings as
  `needs-judgment` instead of fixing them.

# Testing

### Validation Approach

The skill is Markdown instructions, so validation is structural plus a dry run. The agent does both.

### Key Scenarios

- `../skills/lint-me/SKILL.md` exists, has valid frontmatter (`name: lint-me` matching the folder name, and a non-empty
  `description`), and the body names `specs/lib/LINTER.md`.
- Every LINTER.md rule is covered, either in SKILL.md or in `references/rules.md`.
- Dry run on a small existing JS file in `../../packages` or `products/`. The skill produces a report and makes no
  edits. The agent confirms with `git status` that nothing changed.

### Edge Cases

- oxlint not installed, as in the current repo: fall back to manual review and install nothing.
- No target files found: report "nothing to lint".
- User answers "none": no edits are made.

### Test Changes

No automated tests are added. A Markdown skill has no executable code.

# Delivery Steps

### ✓ Step 1: Create lint-me skill with read-only audit workflow

`../skills/lint-me/SKILL.md` exists and describes a complete, read-only scan-and-report workflow driven by
specs/lib/LINTER.md.

- Create `../skills/lint-me/SKILL.md` with `name: lint-me` frontmatter and a trigger-oriented `description`.
- Document the workflow steps:
    - read LINTER.md at run time
    - choose the target files (changed files by default, or an explicit path or package)
    - detect oxlint
    - run oxlint where it has matching rules
    - do a manual pass for the remaining rules
- Define the report format (`file:line`, rule, severity, fixable, proposed fix, summary counts).
- Define the complexity severity tiers (≤10 ok, 11–20 accept, >20 reject).
- Describe the fallback when oxlint is missing: tell the user, and never install it without approval, per AGENTS.md.

### ✓ Step 2: Add permission-gated fix and verification phase plus rule reference

The skill can apply fixes only after explicit approval, then re-verify, with per-rule guidance in a reference file.

- Add the permission gate to `SKILL.md`: ask all / by rule / by file / none before any edit, with no edits without an
  answer.
- Add the safety rules:
    - minimal diffs with no behaviour change
    - complexity refactors and renames of exported symbols need specific approval
    - skip `node_modules` and generated files
- Add the verify step: re-run the checks and run package tests, using the local docker services with no mocks.
- Create `../skills/lint-me/references/rules.md` with a detection, fix and auto-safe entry for each rule. Link it from
  `SKILL.md`.
- Validate by checking that all rules are covered and by doing a dry run on one existing JS file, confirming with
  `git status` that no files changed.
