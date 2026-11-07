* Manager - the human in charge of a team. Manager history is kept in the game's database and is used to define their
  tendencies.
* Player - An in game characters that act autonomously, based on their training. Players have attributes that are used
  to determine their behavior. Some of these attributes are learned or improved through experience, while others are
  innate. Player history is kept in the game's database and is used to define their
  tendencies.
* Tendencies - A player's tendencies are a summary of their history. Tendencies are used to determine a player's
  behavior in a game.
* Training - Players can improve certain attributes through training sessions.
* Skills - Player attributes that can be improved are called skills.
* Team - A team is a group of players that work together to achieve a common goal. Players play a role on a team, i.e. a
  position in baseball, or an engineer in motorsport. Skills are applied to these roles to determine success. For
  instance, if a player does not throw well, they should not be a pitcher.
* Core Team - There is a set of teams created by the games that will always compete and play to win aggressively. They
  will appear in certain Major leagues to fill out a league. They will always be playing to win championships.
  that will always compete at the highest level with consistent strategies.
* Leagues - A league is a grouping of teams that play competitively to win a championship. There are 3 levels of leagues
  in all games. League is interpreted in different ways depending on the game, but the structure and purpose is always
  the same.
    * Amateur - Leagues in this level are typically less competitive and have lower stakes. Leagues can be created
      ad-hoc by managers or by the game. AI Competetion should play to win, but make mistakes
    * Pro - Leagues in this level are typically more competitive and have higher stakes. Leagues are created by the
      game and are more structured. Managers can also create Pro leagues. AI Competition should play to win games.
      Managers have to meet certain minimum criteria, like budget, winning percentage, and other factors.
    * Major - Leagues in the Major level are typically the highest level of competition and have the highest stakes.
      Leagues are created exclusively by the game and are highly structured. AI Competition
      should play to win championships. Managers have to meet certain minimum criteria, like budget, winning percentage,
      and have won a Pro Championship and other factors.
* Game - A game is a cempetition between teams. A game has at most one human manager, the other being played by the AI
  based on the other manager's tendencies. For some games, only 2 teams compete to win. In motorsport all teams
  participate in every game (race). Exhibition games do not take place in a league. Competing in an Exhibition game
  will add to the managers' and players' history and participate in defining a player's tendencies, but they will not
  count towards any league the team may participate in. Other games are league games and are controlled by the league's
  rules. Games cab be played like this:
    * Game AI vs Game AI These games are league games and are controlled by the league's rules. They happen when there
      are not enough Manager's to fill the league.
    * Manager vs Game AI These games are league games and are controlled by the league's rules. They happen when there
      are not enough Manager's to fill the league.
    * Manager vs Manager These games are league games or exhibition games. In all cases, one manager is played by the AI
      based on the manager's tendencies - acting on their behalf.
* Game AI - in the context of these specs Game AI means that the computer will play the game for at least one the teams.
  This *may* be a model, or it may be heuristic.
* Credits - the in game currency. There may be a feature to purchase credits with real-world money. Credits are earned
  from completing seasons. A team's place in a season determines how many credits they earn. Teams spend credits to pay
  their players and to train them. Teams may also earn credit from sponsorships. Teams also earn money from game
  attendance. Each game will split the attendance receipts based on their performance.
* Sponsorships - Sponsorships are a way for teams to earn credits. Teams may earn credits from sponsorships by having
  their team name, logo, or other branding displayed in-game. Sponsorships may be earned by teams that perform well in
  the season or by teams that have a strong brand in the real world.
* Stadiums - The venues that games take place in. For motorsport a stadium in a race track, for other sports it a
  regular sports arena. Games have attendenace numbers that are affected by team performance and if there is a "home
  team", they get a bonus in the form of a bigger slice of the attendance bonus. There are a fixed number of stadiums in
  the game.
* Home Team - for baseball and football, one team will be the hosting team. That team's attendance receipts will be
  larger than the visitors. In motorsport the hoe team will be defined as the team with the most points for the race to
  calculate attendance bonus.
* Position - Players play roles within a team. The roles they can fill are called "positions". Players can only fill one
  or two positions.
* Skill Score - A single number that represents the skill the player has based on weighted individual skills.
* Roster - The list of players on a team.
* Calendar time - The ticking clock in the real world, measured in seconds.