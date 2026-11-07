# Players

Players are characters in the game and are the objects that do the things that win or lose games.

## Characteristics

- Players have skills. Each skill can be improved. They can also degrade. Properties of the player will determine how
  quickly this happens and what the max and min levels are
- Players have an age that modifies the skill profiles over time
- Players have a career. They will chose to retire after an amount of irl calendar time has passed
- Players have an editable name
- Players have an editable number
- Players can have one of a small handful of complexions
- Players belong to one team

## Attributes

Players have three types of attributes.

- Fixed attributes are immutable during gameplay and may change (edit) under
  conditions with rules to TBD. They are filled in when the player is created
    - Age
    - Stamina - The player's min and max stamina
    - Intelligence – A smart player makes better decisions (gets better outcomes). This cannot be trained. But it can
      improve over time in a futue version
    - Nationality (Can be edited, but not during gameplay)
    - Name (Can be edited, but not during gameplay)
- Skills are attributes that can be improved during training sessions. They apply most of the statistics to feed the
  outcome generator. These can change between games during training, but during gameplay.
- Dynamic attributes. These attributes can change during gameplay
    - Health - lower health means lower performance. Health degrades over time based on the player's stamina
