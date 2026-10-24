# PLAYABLE GAMES

These are the concrete playable games and their features.

Any numbers that appear in this doccument should be read from configuration.

## Baseball

- The official major league baseball game-play rules apply
- Gameplay is not time-limited. Someone must always win a game

### Stadiums

- All games are played in a stadium
- Each stadium has a unique name
- Each Stadium is the home team team for a team in a league. That is a statdium may have many home teams, buut each team
  in a league has only one home stadiums
- Each stadium has unique dimensions within the guidelines set for professional baseball.
- Each stadium is created once and is permanent.
- Stadiums may only be added to new versions of the game. Within any version the set of stadiums is fixed.
- Stadiums have an attendance capacity
- Home teams get a greater payout from attendance
- Attendance fluctuates based on the home team's performance. Better performance means greater attendance and greater
  payoffs. If a visiting team is in the top 4 of the league standings, they will also affect the attendance.
- When generating stadiums:
    - One in every city that hosts a professional baseball team in the United States, Canada and Japan.
    - Create extra stadiums in other cities in those countries that are large, but don't already host a professional
      team.
    - Limit the number of stadiums to 100.
    - Stadiums should be named "<City Name> Municipal Statium"

### Leagues

Leagues provide structure to teams and games. Each league has a fixed number of teams. Leagues govern the rules of the
games and teams.

- Leagues have a fixed number of teams, but different league levels will have different sizes
- Teams can leave and join leagues at the end of the season.
- Leagues can have Playoffs
    - Minor leagues do not have playoffs
    - Pro leagues have a 4 team playoff based where team qualify for the playoff based on their rankings
    - Major leagues have a 4 team playoff based where team qualify for the playoff based on their rankings
- Teams are ranked in a league by their winning percentage, with MLB ties breaking rules apply
- Leagues have stadiums, one per team. Stadiums can come from anywhere in the world.
- When a team enters a pro or major league, they will be assigned a stadium.
- Leagues determine the rules of the games and teams.
- Player creation for new leagues or teams will use the algorithm for all league levels.
- Leagues rules are dependent on the league level.
    - Minor leagues
        - No minimum budget
        - New teams get a budget of 40000 credits
        - Teams get a smaller share of stadium attendance money
    - Pro Leagues
        - Minimum budget of 100000
        - At least 4 seasons in the game
        - A winning percentage of at least 66%
        - Teams that do not meet the minimum conditions will go back to a Minor league.

### Teams

Teams are groups of players that compete against each other in a league.

- Teams have a home stadium
- A team can be in only one league
- Teams are made of 16 players. 8 positions players, 3 pitchers and 5 extra players (the bench)
- Players have the same positions as MLB.
- Players have a salary and a contract with a fixed length of time. Players and Managers can terminate the contract at
  any time. The payer goes to free agency.
- Players have a minimum salary and a maximum salary based on the league level.
- Any player can play any position, but they will only perform well if they have the right skills for the position.
- Players on a team have numbers. When new players are added, they will be assigned a number based on the team's roster.

### Players

- Players have fixed attributes.
    - Age
    - Handedness - left, right, ambidextrous
    - Base Speed - The minimum speed a player can run. If a player's skill erode over time, they cannot erode below
      this.
    - Base Power - The minimum power a player can generate. If a player's skill erode over time, they cannot erode below
      this.
    - Base Throw - The minimum throw speed a player can generate. If a player's skill erode over time, they cannot erode
      below this.
    - Nationality (Can be edited, but not duriing gameplay)
    - Name (Can be edited, but not duriing gameplay)
- Players have skills that determine position
    - Throw - how well they throw a ball. Higher values mean longer throws, not faster ones
    - Pitch - How well they can throw pitches. These are special players there should be fewer pitchers that position
      players, perhaps 1/3 to 1/4 pitchers
        - Fastball - How well they can throw a fastball. Useful to create strikeouts
        - Curveball - How well they play against power hitters
        - Slider - difficult pitch, but effective against all hitters.
    - Speed - How fast they can run. Deteremines wins on stolen bases and bunts and in the outfield
    - Power - How far they can hit a ball
    - Small ball - How well they hit for percentage and how well they get a bint down
    - See - How well the batter sees a patch. Higher numbers mean they can see the ball better and hit it more often.
      They
      also strike out less
- When players are created, they should be assigned a suggested position based on their skills when in free agency. Once
  they are on a team, the manager decides their position.

## Motorsport

### Tracks

"Track" is a synonym for stadium

- When creating Tracks
    - One on every country that hosts a Formula One event, Indycar event, World Sports Car, Nascar event
    - For Nascar events, one stadium for every US state that hosts an event. Nascar League Tracks may only be used for
      Nascar
      events, but Nascar cars should be able to race anywhere.
    - Tracks be of any length.
        - Nascar League Tracks can be 1/2 mile to 2.5 miles long and are ovals, tri-ovals
        - Other tracks can be anywhere from 1 mile long to 5 miles long. Minor Leagues can only run on shorter tracks,
          less than 2 miles long.
    - Tracks are all unique, but all are circuits where the start and end line are at the same sport.
    - Tracks with many corners are more difficult to drive on, and better drivers will do better on them, but not by a
      large amount.
- Each track is created once and is permanent.
- Tracks may only be added to new versions of the game. Within any version the set of tracks is fixed.

### Races

- Managers are rewarded based on finishing positions. Higher positions are more valuable.
    - Amateur Leagues pay for all finishing positions
    - Pro Leagues pay out for the first 15 positions
    - Major Leagues pay out for the first 10 positions
- Players can crash out of a race or the their car may fail. Use Formula 1 rules for how points are applied to finishing
  positions.
- There are no ties. Someone must win a race.
- Races have no time limit. A race is over when the race length is reached.
- Races count laps. The number of laps determines the length of the race.
- Races happen at Tracks.
- During a race, a player will likely have to pit to change tires and/or refuel based on league rules.

### Players

- Players have roles in the team
    - Race Engineer - Their skill affects the decisions during the race, such as pitting and choosing tires
    - Designer - Their skills determine the quality of the car, its relaibility and its perfromance
    - Test Engineer - Their skills affect a driver's preparation for a race.
    - Driver - Their skill affects their performance in a race.
    - Pit Engineer - Their skill affects the teh quality of pit stops
- Free Agency works the same as it does in Baseball.

### Equipment

Motosport is unique in that it also models equipment like the race car, the test rig and design facilities.

- Cars Attrributes
    - Power
    - Handling
    - Fuel Effficiency
    - Appearance
        - colors
- Tires
    - 3 compounds
        - soft - highest speed, lowest durability
        - medium
        - hard - lowest speed, highest durability
- Facilities
    - HQ
    - Design Studio
    - Test Rig
- Tires are provided by the league at every race and the manager may choose compounds and the number of each. The number
  if tires a team may choose from and use is dependent on league rules.

### Leagues

There are several different kinds of Leagues each with a set of league Levels. So, for each of the following, there is
an Amateur, Pro and Major League.

- Stock Car
- Open Wheel 1
- Open Wheel 2
- Sports Car
- Endurance

The only difference between them is:

- The kinds of tracks they can race on
- The default power available
- The kinds of tracks they can race on
- In race operations - refueling, tire changes

## Football