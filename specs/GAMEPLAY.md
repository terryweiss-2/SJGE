# Gamplay

There are two kinds of gameplay modes: `managed` and `automatic`.

In `managed` mode, the player has full control over the game and can make decisions at each turn. Game AI always plays
the other side. The Game AI will make decisions based on the player's actions and the current game state and their
tendencies calculated over time.

In `automatic` mode, the game is played without player intervention, and the computer makes all decisions. For both
sides, the Game AI will make decisions based on the player's actions and the current game state and their
tendencies calculated over time.

Players will be able to make choices based on the game being played. Here are some incomplete examples:

* Baseball
    * Adjust outfield position
    * Pitching commands, like "walk", "pitch around", "don't give him anything to hit", etc.
    * "Bunt", "go for the fences", "play small ball"
    * "Substitute pitcher"
    * "Substitute batter/position"
* Motorsport
    * "Pit"
    * "Don't let them by"
    * "Push"
    * "Save Tires"

Prior to starting a game, the user can choose the position assignments for the team. It will be based on the last lineup
they used, and players can only be assigned to a role that they are allowed to fill. Different sports will have
different position assignments. Initial lineup on team creation will be based on the most skilled players (skill score).

# Turns

A turn happens when a game completes a decision-action-result and the game clock advances.

- "decision" is an direction taken by a manager or a Game AI, i.e. "Throw a fast ball", "keep the person behind you"
- "action" is the result of the decision, i.e. "throws fastball", "blocks driver"
- "result" is the outcome of the action, i.e. "batter hits home run", "player crashes into wall"

Outcomes are determined by the value of the skills used by the decision and action by the players in competition, and
then entropy is introduced to keep it interesting.

## Game Clock

There is a constant game clock measured in ticks (or frames or whatever the appropriate gaming terminology is). Ticks
should be convertable to elapsed calendar time. Players may choose to watch a game after it has been played and that
would be viewed in calendar time. The conversion factor should be configurable.

## Draft and Free Agency

When a league is created, a number of players will be created at the same time with random skills and positions. But the
pool must have enough players to populate every team with enough players to full a roster and leave 30% of the pool
available for free agency.

When a team is created, it is filled with a random set of players. The manager can try to sign a player from the league
pool of free agents; when they do, the player being replaced is sent back to the pool. Free agency is available at all
times in a season. Players age during free agency. Players that are not picked up by any teams over a configurable
number of seasons are replaced in the league free agent pool

## Age

A player's age can degrade or upgrade a player's skills. It is weighted and applied as a multiplier to the player's
individual skills.

## Randomizers

Please suggest an appropriate randomizer for games

## Behaviors

- In managed mode, a player may disconnect or timeout. The semantics of that are TBD.
- 


