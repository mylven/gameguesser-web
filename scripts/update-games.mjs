import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const outputPath = fileURLToPath(new URL('../src/generated-games.json', import.meta.url));
const maxGames = 6000;
const excludedTitle = /soundtrack|dedicated server|benchmark|test server|wallpaper|editor|\bsdk\b|server|\bdemo\b|mod tools|blender|steamvr|soundpad|filmmaker|hentai|nude|porn|erotic|genital|huniecam|dating simulator|driver booster/i;

function normalizedKey(title) {
  return title
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/\b(?:legacy|enhanced|complete|definitive|remastered|remaster|goty|game of the year|director's cut|deluxe|ultimate) edition\b/gi, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

async function loadGames() {
  const results = [];
  for (let page = 0; page < 10; page += 1) {
    const response = await fetch(`https://steamspy.com/api.php?request=all&page=${page}`, {
      headers: { 'user-agent': 'GameGuesserWeb/1.0 (game catalog build)' },
    });
    if (!response.ok) throw new Error(`SteamSpy returned HTTP ${response.status} for page ${page}.`);
    const payload = await response.json();
    results.push(Object.values(payload));
  }

  const candidates = results.flat().filter((game) => {
    const title = typeof game.name === 'string' ? game.name.trim() : '';
    const reviewCount = Number(game.positive || 0) + Number(game.negative || 0);
    return Number.isInteger(Number(game.appid))
      && title.length > 1
      && !excludedTitle.test(title)
      && reviewCount >= 5;
  }).sort((left, right) => (
    Number(right.positive || 0) + Number(right.negative || 0)
    - Number(left.positive || 0) - Number(left.negative || 0)
  ));

  const seenTitles = new Set();
  const seenAppIds = new Set();
  const games = [];
  for (const game of candidates) {
    const title = game.name.trim().replace(/\s+/g, ' ');
    const key = normalizedKey(title);
    const appId = Number(game.appid);
    if (!key || seenTitles.has(key) || seenAppIds.has(appId)) continue;
    seenTitles.add(key);
    seenAppIds.add(appId);
    games.push({
      appId,
      title,
      developer: typeof game.developer === 'string' ? game.developer.trim().slice(0, 120) : '',
    });
    if (games.length >= maxGames) break;
  }
  return games.sort((left, right) => left.title.localeCompare(right.title, 'en'));
}

try {
  const games = await loadGames();
  if (games.length < 2000) throw new Error(`Only ${games.length} unique games were found; 2000 are required.`);
  if (process.argv.includes('--check')) {
    console.log(`Catalog check passed: ${games.length} unique Steam games.`);
  } else {
    await writeFile(outputPath, `${JSON.stringify(games)}\n`, 'utf8');
    console.log(`Generated ${games.length} Steam game entries.`);
  }
} catch (error) {
  console.error(`Could not refresh the Steam catalog: ${error instanceof Error ? error.message : String(error)}`);
  if (process.env.CI === 'true' || process.argv.includes('--check')) process.exitCode = 1;
  else console.warn('The existing checked-in catalog was left unchanged.');
}
