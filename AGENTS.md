# AGENTS.md

Guidance for agents working in this repository.

- This is a mono-repo (npm workspaces: `packages/*` and `products/*`).
- Store all skills in the `.agents/skills` directory.
- Store all plans in the `.agents/plans` directory. Specifications go in `specs`.
- Prefer available libraries over new code. Ask for approval before adding any new npm dependency.
- Distinguish between "human player" and "in game player": refer to the human player as **"The Manager"** and the
  in-game player as **"player"**.

## Layout

- `specs/` - design and specs
- `packages/lib` - tools and utilities (calculators, database abstractions, etc.)
- `packages/core` - core engine: economics, seasons, leagues, teams, players
- `packages/ui` - Vue.js UI library
- `products/baseball` - baseball game
- `products/motorsport` - motorsport game
- `.agents/skills` - agent skills
- `.agents/plans` - agent plans

## Technologies

Node.js,
JavaScript (ES modules),
Express.js (web server),
Vue.js (UI),
Redis (caching / out-of-process memory),
MongoDB (persistent storage),
SQLite (caching and tabular data),
GNU Make (shell scripts, build automation)
TapJS (test framework)

## Common commands

- `make install` - install all workspace dependencies
- `make test` - run tests in every workspace

## Testing

- Use tapjs for testing
