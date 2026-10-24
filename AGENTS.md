# AGENTS.md

Guidance for agents working in this repository.

- This is a mono-repo (npm workspaces: `packages/*` and `products/*`).
- Store all skills in the `.agents/skills` directory.
- Store all plans in the `.agents/plans` directory. Specifications go in `specs`.
- Prefer available libraries over new code. Ask for approval before adding any new npm dependency.
- Distinguish between "human player" and "in game player": refer to the human player as **"The Manager"** and the
  in-game player as **"player"**.
- Linting rules are defined in specs/lib/LINTER.md

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
dotEnv (environment variables)
check-types (validate types)
DayJS (date handling)
ioRedis (redis)

## Testing

- Use tapjs for testing
- Redis and MongoDB are installed in local docker with default options. DO not mock redis or mongo or rabbitmq, check to
  see if the docker engine is running and start it if it is not running. If you had to start it, close it when you are
  done. If you did not start it, leave it running when tests are finished. The same is true for the services in the
  docker compose file, rabbitmq, redis and mongo.

## Agent file locations

- Store all skills in `.agents/skills`.
- Store all plans in `.agents/plans`.
- Do not store project plans in `.junie/plans`.

# Behaviors

- Always type check parameters with `check-type`.
- Prefer GNU Make for shell scripts and build automation.
- Always add jsdoc module level documentation and for all public methods and properties in the module. Add or update the
  README.md in the root of the package so that it contains all exported symbols and a description of how to use them and
  their parameters.
- All testing and execution happens in ubuntu, wsl is supported when the IDE is in windows. Windows and Mac are not
  supported unless and until a PWA is created.
