```yaml
Player:
  firstName: string
  lastName: string
  age: number
  createdAt: string
  history: # persistent storage will have to cap the size of this, but still keep the bare statitistcs
    seasons: array<Season>
    games: array<gameID>
    trainingSessions: array<trainingSessionId>
  appearance:
    complexion: number # (different pigments applied to the sprite)
    hair: number # (the kind of hair the player has)
    hairColor: number # (the color of the player's hair)
    face: faceDetails # :object facial hair, glasses
  country: string
  attributes:
    height: number (in inches)
    weight: number (in pounds)
    handed: string (R, L, Amidextrous)
  skills: Skills (hash of skills)

  tendencies: Tendencies (hash of tendencies)

```