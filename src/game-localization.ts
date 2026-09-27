import type { Game, GameCategory } from './games';
import type { Language } from './i18n';

const categoryNames: Record<GameCategory, string> = {
  'Akció': 'Action', 'Kaland': 'Adventure', RPG: 'RPG', Indie: 'Indie',
  'Stratégia': 'Strategy', 'Szimulátor': 'Simulation', Sport: 'Sports', 'Egyéb': 'Other',
};

type Copy = { clues: [string, string, string]; features: [string, string, string] };

const curatedCopy: Record<string, Copy> = {
  Minecraft: { clues: ['Build your world one block at a time.', 'Dangerous monsters come out at night.', 'Mine diamonds and build a portal.'], features: ['Creative building', 'An ever-expanding world', 'Blocky visuals'] },
  'The Legend of Zelda: Breath of the Wild': { clues: ['A vast kingdom is yours to explore.', 'The hero wakes after a long slumber.', 'Climb towers and discover shrines across Hyrule.'], features: ['Open world', 'Exploration and puzzles', 'Hyrule'] },
  'The Legend of Zelda: Tears of the Kingdom': { clues: ['The adventure continues in the skies and depths of Hyrule.', 'Use special abilities to combine objects.', 'Link can build vehicles to explore the world.'], features: ['Sky islands', 'Creative construction', 'Hyrule'] },
  'Super Mario Odyssey': { clues: ['A red cap becomes your important companion.', 'Travel between very different kingdoms.', 'Use Cappy to possess enemies and objects.'], features: ['Platforming', 'A cap as your companion', 'Explore kingdoms'] },
  'Super Mario Kart 8 Deluxe': { clues: ['Nintendo heroes race on colorful tracks.', 'Use banana peels and shells to slow down rivals.', 'Rainbow Road is one of the tracks.'], features: ['Kart racing', 'Attack with items', 'Mario universe'] },
  'Animal Crossing: New Horizons': { clues: ['Start a new life on a deserted island.', 'The days follow real-world time.', 'Tom Nook helps you make the island your own.'], features: ['Island building', 'Real-time seasons', 'Friendly villagers'] },
  'Stardew Valley': { clues: ['You inherit a run-down plot of farmland.', 'The mines hide monsters and valuable ore.', 'Make friends with the residents of Pelican Town.'], features: ['Farming', 'Mining', 'Pelican Town'] },
  Fortnite: { clues: ['Jump from a flying bus onto an island.', 'A storm gradually shrinks the play area.', 'Choose building or Zero Build.'], features: ['Battle royale', 'Building', 'Island survival'] },
  'Among Us': { clues: ['The crew completes tasks aboard a spaceship.', 'Someone is secretly sabotaging the mission.', 'Vote out the impostor during meetings.'], features: ['Social deduction', 'Space crew', 'Secret roles'] },
  'Portal 2': { clues: ['Solve puzzles using two linked portals.', 'A sarcastic artificial intelligence accompanies you.', 'Use physics to escape the test chambers.'], features: ['Portal puzzles', 'First-person view', 'GLaDOS'] },
  'The Witcher 3: Wild Hunt': { clues: ['A white-haired monster hunter searches for a missing girl.', 'The story unfolds in a dark, Slavic-inspired fantasy world.', 'The hero is Geralt of Rivia.'], features: ['Monster hunting', 'Open fantasy world', 'Geralt and Ciri'] },
  'Elden Ring': { clues: ['Search for the pieces of a shattered, mythical artifact.', 'George R. R. Martin helped create the fantasy lore.', 'A vast glowing tree towers over the Lands Between.'], features: ['Challenging bosses', 'Open dark fantasy', 'Optional exploration'] },
  'Dark Souls III': { clues: ['A cycle of ash and fire shapes the world.', 'Patience and precise timing are essential.', 'The series is known for the phrase “Praise the Sun!”'], features: ['Challenging combat', 'Dark fantasy', 'Fire and ash'] },
  'Cyberpunk 2077': { clues: ['Explore a neon-lit Californian metropolis.', 'A digital rock star lives inside the protagonist’s head.', 'Shape V’s story on the streets of Night City.'], features: ['Futuristic metropolis', 'Cybernetic implants', 'V and Johnny Silverhand'] },
  'Red Dead Redemption 2': { clues: ['You are an outlaw gang member in the Wild West.', 'Arthur Morgan’s story takes place in turn-of-the-century America.', 'The gang is led by Dutch van der Linde.'], features: ['Western adventure', 'Horseback travel', 'Arthur Morgan'] },
  'Grand Theft Auto V': { clues: ['Switch between three different protagonists.', 'Explore Los Santos and its surroundings.', 'The stories of Michael, Franklin and Trevor intertwine.'], features: ['Open city world', 'Heists', 'Three playable protagonists'] },
  'The Last of Us': { clues: ['A survival story set after a fungal outbreak.', 'A man escorts a young girl across the United States.', 'The story centers on Joel and Ellie.'], features: ['Survival adventure', 'The infected', 'Joel and Ellie'] },
  'God of War': { clues: ['A father and son set out on a dangerous journey.', 'The hero wields a magical axe.', 'Kratos enters the world of Norse mythology.'], features: ['Mythological adventure', 'Father and son', 'Leviathan Axe'] },
  Hades: { clues: ['Try again and again to escape the underworld.', 'The Olympian gods grant powers to help the hero.', 'Zagreus, son of Hades, is trying to leave home.'], features: ['Roguelike action', 'Greek mythology', 'Every run is different'] },
  'Hollow Knight': { clues: ['Explore an abandoned underground insect kingdom.', 'The tiny, silent hero has little horns.', 'Fight through the dark tunnels of Hallownest.'], features: ['Metroidvania', 'Insect kingdom', 'Hand-drawn visuals'] },
  Celeste: { clues: ['Climbing a mountain is the heart of the story and challenge.', 'Strawberries are hidden throughout the levels.', 'Madeline is determined to reach Celeste Mountain’s summit.'], features: ['Precision platforming', 'Mountain climbing', 'Madeline’s story'] },
  Undertale: { clues: ['You can avoid combat entirely.', 'Explore the underground world of monsters.', 'Dodge attacks in bullet-hell minigames as a yellow heart.'], features: ['Your choices matter', 'Memorable music', 'Monsters and humans'] },
  Cuphead: { clues: ['The visuals are inspired by 1930s cartoons.', 'Dodge projectiles while fighting challenging bosses.', 'A cup-headed hero owes a debt to the Devil.'], features: ['Cartoon bosses', 'Run and gun', 'Jazz-inspired music'] },
  Terraria: { clues: ['Dig through a pixel-art world viewed from the side.', 'Build, mine and battle massive bosses.', 'Often described as a 2D sandbox adventure.'], features: ['2D sandbox', 'Mining and crafting', 'Boss fights'] },
  Subnautica: { clues: ['You are stranded on an alien ocean planet.', 'Explore the depths with oxygen tanks and vehicles.', 'Investigate the underwater world of planet 4546B.'], features: ['Underwater survival', 'Exploration', 'Alien ocean'] },
  'Sea of Thieves': { clues: ['Sail the open seas with friends as a pirate crew.', 'Treasure maps and skeleton pirates await.', 'Fire cannons at rival ships.'], features: ['Pirate adventure', 'Crew co-op', 'Open sea'] },
  'Overwatch 2': { clues: ['Teams of heroes with unique abilities face off.', 'Roles include tank, damage and support.', 'A team-based shooter from Blizzard.'], features: ['Hero-based combat', 'Teamwork', 'Futuristic arenas'] },
  Valorant: { clues: ['Two teams of five attack and defend.', 'Agents have unique special abilities.', 'Plant or defuse a device called the Spike.'], features: ['Tactical shooter', 'Agent abilities', 'Round-based matches'] },
  'Counter-Strike 2': { clues: ['Terrorists and counter-terrorists face off.', 'Aim and team strategy decide who wins.', 'Plant or defuse the bomb.'], features: ['Tactical FPS', 'Economy system', 'Competitive rounds'] },
  'Apex Legends': { clues: ['Squads fight for survival in a futuristic arena.', 'Every character has unique abilities.', 'The game is set in the Titanfall universe.'], features: ['Battle royale', 'Legend abilities', 'Squad-based FPS'] },
  'League of Legends': { clues: ['Two teams of five try to destroy the opposing base.', 'Choose from a huge roster of champions.', 'Summoner’s Rift is the best-known battlefield.'], features: ['MOBA', 'Champions and abilities', 'Team strategy'] },
  'Dota 2': { clues: ['Two teams of five fight over an ancient stronghold.', 'Each hero has a unique role and abilities.', 'The game’s major international tournament is called The International.'], features: ['MOBA', 'Five-player teams', 'Ancient stronghold'] },
  'Civilization VI': { clues: ['Grow a small settlement into a world-spanning empire.', 'Lead your people through historical eras.', 'Its famous motto is “one more turn.”'], features: ['Turn-based strategy', 'Empire building', 'Historical leaders'] },
  'The Sims 4': { clues: ['Control the everyday lives of virtual people.', 'A green crystal can hover above a character.', 'Build homes, form relationships and choose careers.'], features: ['Life simulation', 'Home building', 'Stories of Sims'] },
  'Euro Truck Simulator 2': { clues: ['Deliver cargo across European roads.', 'Build your own trucking business.', 'Drive your truck across many countries.'], features: ['Truck driving', 'Cargo delivery', 'Explore Europe'] },
  'Forza Horizon 5': { clues: ['Race at a huge automotive festival.', 'Explore an open world inspired by Mexico.', 'Collect and customize hundreds of cars.'], features: ['Open-world racing', 'Mexican landscapes', 'Car collection'] },
  'Rocket League': { clues: ['Drive cars and hit a giant ball into the opponent’s goal.', 'Rocket-powered vehicles can fly through the air.', 'Football on four wheels—that’s the idea.'], features: ['Car soccer', 'Aerial tricks', 'Fast matches'] },
  'EA Sports FC 25': { clues: ['Play with famous football clubs and players.', 'Build your own squad in Ultimate Team.', 'It continues the football series formerly known as FIFA.'], features: ['Football simulation', 'Clubs and national teams', 'Career mode'] },
  'NBA 2K25': { clues: ['Play in the world’s most famous basketball league.', 'Create a player for career mode.', 'NBA teams and stars are playable.'], features: ['Basketball', 'NBA teams', 'Create-a-player career'] },
  'It Takes Two': { clues: ['This adventure can only be played cooperatively by two players.', 'A bickering married couple is turned into tiny dolls.', 'Cody and May travel through varied co-op levels.'], features: ['Two-player co-op adventure', 'Varied mechanics', 'Cody and May'] },
  Phasmophobia: { clues: ['Work as a team of paranormal investigators.', 'Gather evidence while hunting ghosts.', 'You can communicate with ghosts using your voice.'], features: ['Co-op horror', 'Ghost investigation', 'Voice recognition'] },
  'Dead by Daylight': { clues: ['Four survivors try to escape from a killer.', 'Survivors repair generators to open an exit.', 'Matches are played asymmetrically.'], features: ['Asymmetric horror', 'Four survivors and one hunter', 'Repair generators'] },
  'Baldur’s Gate 3': { clues: ['A role-playing game based on Dungeons & Dragons rules.', 'Your choices can reshape the story.', 'A strange parasite threatens the main characters.'], features: ['Turn-based RPG', 'D&D fantasy world', 'Choices and companions'] },
  'Final Fantasy VII Remake': { clues: ['Fight Shinra in a vast, futuristic city.', 'The hero carries an enormous sword on his back.', 'A reimagining of Cloud Strife’s story.'], features: ['Japanese RPG', 'Shinra and Midgar', 'Cloud and the Buster Sword'] },
  'Ghost of Tsushima': { clues: ['A samurai story set during the Mongol invasion.', 'The wind guides you instead of a minimap.', 'Jin Sakai fights the invaders on Tsushima Island.'], features: ['Samurai adventure', 'Open world', 'Stealth and swordplay'] },
  'Horizon Forbidden West': { clues: ['Nature has reclaimed the ruins of a technological civilization.', 'Robotic animals roam the world.', 'The red-haired hunter Aloy ventures into new lands.'], features: ['Robot dinosaurs', 'Archery and exploration', 'Aloy’s adventure'] },
  'Assassin’s Creed Valhalla': { clues: ['Play as a Viking seeking a new home in England.', 'Raid settlements for supplies with your longship.', 'Lead Eivor’s clan and build a settlement.'], features: ['Viking adventure', 'Raiding', 'Settlement building'] },
  'Pikmin 4': { clues: ['Tiny plant-like creatures help you on an alien planet.', 'Throw your small companions to direct them.', 'A loyal dog named Oatchi helps with exploration.'], features: ['Strategic adventure', 'Command plant creatures', 'Alien planet'] },
  'Splatoon 3': { clues: ['Teams battle in arenas covered in colorful ink.', 'Transform into a squid to move quickly through ink.', 'Cover as much of the map in your team’s color as possible.'], features: ['Ink-based team battles', 'Inklings and Octolings', 'Colorful arenas'] },
  'A Short Hike': { clues: ['Explore a small island by climbing, hiking and fishing.', 'Your goal is to reach a mountain peak.', 'The main character is a bird named Claire.'], features: ['Relaxed exploration', 'Climbing and gliding', 'Small island adventure'] },
  Balatro: { clues: ['Combine poker hands with roguelike mechanics.', 'Special Joker cards can transform your strategy.', 'Score enough points to survive increasingly difficult rounds.'], features: ['Card roguelike', 'Joker combos', 'Poker-inspired'] },
  'Vampire Survivors': { clues: ['Weapons attack automatically as you race against time.', 'Endless-looking monster hordes flood the screen.', 'Collect experience to upgrade your weapons.'], features: ['Survivor roguelike', 'Automatic attacks', 'Hordes of enemies'] },
  'No Man’s Sky': { clues: ['Explore a seemingly endless number of planets.', 'Meet alien species and pilot spaceships.', 'A procedurally generated galaxy is at the heart of the game.'], features: ['Space exploration', 'Millions of planets', 'Survival and building'] },
};

export function localizeGame(game: Game, language: Language): Game {
  if (language === 'hu') return game;
  const curated = curatedCopy[game.title];
  if (curated) return { ...game, ...curated };
  const title = game.title.trim();
  const words = title.split(/\s+/).filter(Boolean);
  const letters = [...title].filter((letter) => /[\p{L}\p{N}]/u.test(letter));
  const first = letters[0]?.toLocaleUpperCase('en-US') ?? '?';
  const last = letters.at(-1)?.toLocaleUpperCase('en-US') ?? '?';
  const developer = game.clues[0].replace(/^A fejlesztője: /, '').replace(/[.!]+$/, '') || 'an independent studio';
  const englishCategory = categoryNames[game.category];
  return {
    ...game,
    emojis: game.emojis,
    clues: [
      `The developer is ${developer}.`,
      `The title has ${words.length} words and ${letters.length} letters.`,
      `It starts with “${first}” and ends with “${last}”.`,
    ],
    features: [englishCategory, `${words.length}-word title`, `Developer: ${developer}`],
  };
}

export function localizeCategory(category: GameCategory | 'Mind', language: Language): string {
  if (category === 'Mind') return language === 'en' ? 'All games' : 'Minden játék';
  return language === 'en' ? categoryNames[category] : category;
}
