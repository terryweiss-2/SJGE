# SJGE

A suite of tools and for creating a specific, opinionated game engine for manager-style games. It contemplates several
games, but the first is baseball. The games are not physics-simulated; gameplay is limited to management of teams.
Managers (Users) guide a team through seasons and playoff and can set game strategy, free agency and training their
players. The games all share

- an economic regime
- event locations (with different rules for each game)
- Season services team allocations, free agency.
- skills and traininng engines
- entropy

## Status

This repo is under active development.

- Components
    - Core Library
        - config - implemented
        - logger - implemented
        - lint rules - implemented
        - redis - implemented
        - mongo - not started
        - rabbit - not started
    - Asset generators - partially implemented
    - Services Library - not started
    - Workers Library - not started
    - Membership - not started
    - Game engine - not started
    - ...other services

- Design
    - Glossary - in progress
    - Stadiums - in progress
    - Players - in progress
    - Leagues - in progress
    - Season - in progress
    - Economy - in progress
    - Messaging - not started
    - Cache - not started
    - Gameplay Compute - not started

See [AGENTS.md](AGENTS.md) for repository conventions and layout.

## Getting started

```
make install
make test
```

