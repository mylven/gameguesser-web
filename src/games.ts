export type GameCategory = 'Akció' | 'Kaland' | 'RPG' | 'Indie' | 'Stratégia' | 'Szimulátor' | 'Sport' | 'Egyéb';

export interface Game {
  title: string;
  category: GameCategory;
  emojis: string;
  clues: [string, string, string];
  features: [string, string, string];
}

const curatedGames: Game[] = [
  { title: 'Minecraft', category: 'Szimulátor', emojis: '⛏️ 🧱 🌳 🐷', clues: ['Kockákból épül fel a világ.', 'Éjjel veszélyes szörnyek jelennek meg.', 'A játékban gyémántot bányászhatsz és portált építhetsz.'], features: ['Kreatív építés', 'Végtelennek tűnő világ', 'Kockás grafika'] },
  { title: 'The Legend of Zelda: Breath of the Wild', category: 'Kaland', emojis: '🗡️ 🛡️ 🏹 🌄', clues: ['Egy hatalmas, szabadon bejárható királyság vár.', 'A főhős hosszú álom után ébred fel.', 'Hyrule-ban tornyokat mászol meg és szentélyeket fedezel fel.'], features: ['Nyitott világ', 'Felfedezés és rejtvények', 'Hyrule'] },
  { title: 'The Legend of Zelda: Tears of the Kingdom', category: 'Kaland', emojis: '☁️ 🪝 🏹 ⚙️', clues: ['A kaland Hyrule egén és mélyén is folytatódik.', 'Különleges képességekkel tárgyakat kapcsolhatsz össze.', 'Link kézzel készített járművekkel járhatja be a világot.'], features: ['Égi szigetek', 'Kreatív barkácsolás', 'Hyrule'] },
  { title: 'Super Mario Odyssey', category: 'Kaland', emojis: '🍄 🧢 🏙️ 🚀', clues: ['Egy piros sapka fontos társad lesz.', 'Különböző királyságok között utazol.', 'Cappy segítségével ellenfeleket és tárgyakat irányíthatsz.'], features: ['Ugrálós platformer', 'Sapka mint társ', 'Királyságok bejárása'] },
  { title: 'Super Mario Kart 8 Deluxe', category: 'Sport', emojis: '🏎️ 🍌 🏁 🍄', clues: ['Színes pályákon versenyeznek a Nintendo hősei.', 'Banánhéjjal és teknőspáncéllal lassíthatod a riválisokat.', 'A Rainbow Road is a pályák között van.'], features: ['Gokartverseny', 'Tárgyakkal támadás', 'Mario-univerzum'] },
  { title: 'Animal Crossing: New Horizons', category: 'Szimulátor', emojis: '🏝️ 🐚 🏡 🦝', clues: ['Egy lakatlan szigeten kezded új életed.', 'A napok a valódi idő múlásával telnek.', 'Tom Nook segít a sziget otthonossá tételében.'], features: ['Szigetépítés', 'Valós idejű évszakok', 'Barátságos falusiak'] },
  { title: 'Stardew Valley', category: 'Szimulátor', emojis: '🌱 🐔 🎣 🌾', clues: ['Megörökölsz egy lepusztult vidéki telket.', 'A bányában szörnyek és értékes ércek várnak.', 'A Pelikánváros lakóival barátságot köthetsz.'], features: ['Gazdálkodás', 'Bányászat', 'Pelikánváros'] },
  { title: 'Fortnite', category: 'Akció', emojis: '🚌 🪂 🔫 🏗️', clues: ['Egy repülő buszról ugrasz le a szigetre.', 'A vihar egyre kisebbre zárja a játékteret.', 'Építkezés vagy nullépítés: te választasz.'], features: ['Battle royale', 'Építés', 'Szigetes túlélés'] },
  { title: 'Among Us', category: 'Indie', emojis: '🚀 👨‍🚀 🔪 🗳️', clues: ['Egy űrhajón a legénység feladatokat végez.', 'Valaki titokban szabotálja a küldetést.', 'A megbeszélésen ki kell szavazni a csalót.'], features: ['Társas dedukció', 'Űrhajós legénység', 'Titkos szerepek'] },
  { title: 'Portal 2', category: 'Kaland', emojis: '🌀 🔵 🟠 🤖', clues: ['Két színű portál segítségével oldasz meg rejtvényeket.', 'Egy szarkasztikus mesterséges intelligencia kísér.', 'A híres tesztkamrákban a fizika törvényeit használod.'], features: ['Portálos fejtörők', 'Első személyű nézet', 'GLaDOS'] },
  { title: 'The Witcher 3: Wild Hunt', category: 'RPG', emojis: '🐺 ⚔️ 🧙 🐴', clues: ['Egy fehér hajú szörnyvadász nyomoz az eltűnt lány után.', 'A történet egy sötét, szláv ihletésű fantasyvilágban játszódik.', 'A főhős neve Ríviai Geralt.'], features: ['Szörnyvadászat', 'Nyitott fantasyvilág', 'Geralt és Ciri'] },
  { title: 'Elden Ring', category: 'RPG', emojis: '💍 ⚔️ 🐉 🌳', clues: ['Egy misztikus, törött ereklye darabjait keresed.', 'A fantasyvilág történetének egyik alkotója George R. R. Martin.', 'A Köztes Földeken egy hatalmas, ragyogó fa magasodik.'], features: ['Nehéz főellenfelek', 'Nyitott dark fantasy', 'Fakultatív felfedezés'] },
  { title: 'Dark Souls III', category: 'RPG', emojis: '🔥 💀 🛡️ 🗡️', clues: ['A hamu és a tűz körforgása határozza meg a világot.', 'A kitartás és a pontos időzítés kulcsfontosságú.', 'A sorozatban gyakran elhangzik: „Praise the Sun!”'], features: ['Kihívást jelentő harc', 'Sötét fantasy', 'Tűz és hamu'] },
  { title: 'Cyberpunk 2077', category: 'RPG', emojis: '🌃 🤖 💉 🚗', clues: ['Egy neonfényes kaliforniai metropoliszban jársz.', 'A főszereplő fejében egy digitális rocksztár lakik.', 'Night City utcáin V történetét alakítod.'], features: ['Futurisztikus metropolisz', 'Implantátumok', 'V és Johnny Silverhand'] },
  { title: 'Red Dead Redemption 2', category: 'Kaland', emojis: '🤠 🐎 🌵 🔫', clues: ['Egy törvényen kívüli banda tagja vagy a vadnyugaton.', 'Arthur Morgan története a századforduló Amerikájában játszódik.', 'A banda vezére Dutch van der Linde.'], features: ['Vadnyugati kaland', 'Lóháton utazás', 'Arthur Morgan'] },
  { title: 'Grand Theft Auto V', category: 'Akció', emojis: '🚘 🌴 💰 🚁', clues: ['Három különböző főhőst irányíthatsz.', 'Los Santos városát és környékét fedezheted fel.', 'Michael, Franklin és Trevor története összefonódik.'], features: ['Nyitott városi világ', 'Rablások', 'Három játszható főhős'] },
  { title: 'The Last of Us', category: 'Akció', emojis: '🍄 🧟 🎒 🏹', clues: ['Egy gombás járvány után játszódó túlélőtörténet.', 'Egy férfi kísér egy fiatal lányt az Egyesült Államokon át.', 'A történet középpontjában Joel és Ellie kapcsolata áll.'], features: ['Túlélő kaland', 'Fertőzöttek', 'Joel és Ellie'] },
  { title: 'God of War', category: 'Akció', emojis: '🪓 🧔 ❄️ 🐍', clues: ['Egy apa és fia veszélyes útra indul.', 'A főhős egy mágikus fejszét forgat.', 'Kratos ezúttal az északi mitológia világába látogat.'], features: ['Mitológiai kaland', 'Apa-fia történet', 'Leviatán fejsze'] },
  { title: 'Hades', category: 'Indie', emojis: '🔥 🏛️ 🗡️ 💀', clues: ['Újra és újra megpróbálsz kijutni az alvilágból.', 'Az Olümposz istenei erőkkel segítik a hőst.', 'Zagreusz Hádész fiaként menekül otthonról.'], features: ['Roguelike akció', 'Görög mitológia', 'Minden futás új'] },
  { title: 'Hollow Knight', category: 'Indie', emojis: '🐞 🗡️ 🕯️ 🕳️', clues: ['Egy elhagyatott föld alatti rovarbirodalmat fedezel fel.', 'A névtelen kis hősnek apró szarvacskái vannak.', 'Hallownest sötét járataiban harcolsz.'], features: ['Metroidvania', 'Rovarok lakta világ', 'Kézzel rajzolt látvány'] },
  { title: 'Celeste', category: 'Indie', emojis: '⛰️ 🍓 🧗 💙', clues: ['Egy hegy megmászása a történet és a kihívás középpontja.', 'A pályákon epreket gyűjthetsz.', 'Madeline a Celeste-hegy csúcsára igyekszik.'], features: ['Precíz platformozás', 'Hegymászás', 'Madeline története'] },
  { title: 'Undertale', category: 'Indie', emojis: '💀 ❤️ 🐐 🎵', clues: ['A harcot akár teljesen el is kerülheted.', 'A szörnyek föld alatti világában jársz.', 'A sárga szívvel kitérős minijátékokban védekezel.'], features: ['Döntéseid számítanak', 'Emlékezetes zene', 'Szörnyek és emberek'] },
  { title: 'Cuphead', category: 'Indie', emojis: '☕ 🎺 👹 🎲', clues: ['Az 1930-as évek rajzfilmjei ihlették a látványt.', 'A főellenfelek ellen lövedékek elől kell kitérned.', 'A csészefejű hős adósságot törleszt az ördögnek.'], features: ['Rajzfilmes főellenfelek', 'Run and gun', 'Jazzes zene'] },
  { title: 'Terraria', category: 'Indie', emojis: '⛏️ 🏠 🪓 🐲', clues: ['Egy pixeles, oldalnézetes világot áshatsz végig.', 'Építhetsz, bányászhatsz és hatalmas főellenfelekkel küzdhetsz.', 'Sokan a 2D-s Minecraftként is emlegetik.'], features: ['2D-s sandbox', 'Bányászat és crafting', 'Boss-harcok'] },
  { title: 'Subnautica', category: 'Szimulátor', emojis: '🌊 🐟 🚀 🫧', clues: ['Egy idegen óceánbolygón rekedsz.', 'A mélység felfedezéséhez oxigénre és járművekre van szükség.', 'A 4546B bolygó víz alatti világát kutatod.'], features: ['Víz alatti túlélés', 'Felfedezés', 'Idegen óceán'] },
  { title: 'Sea of Thieves', category: 'Kaland', emojis: '🏴‍☠️ ⛵ 🦜 🗺️', clues: ['Barátaiddal kalózhajót vezetsz a nyílt tengeren.', 'Kincses térképek és csontvázkalózok várnak.', 'A játékban ágyúval lőheted az ellenfél hajóját.'], features: ['Kalózkaland', 'Legénységi együttműködés', 'Nyílt tenger'] },
  { title: 'Overwatch 2', category: 'Akció', emojis: '🦸 🔫 🤖 💥', clues: ['Különleges képességű hősök csapatai küzdenek.', 'A szerepek között tank, sebző és támogató is van.', 'A Blizzard csapatalapú lövöldözős játéka.'], features: ['Hősalapú csaták', 'Csapatmunka', 'Futurisztikus aréna'] },
  { title: 'Valorant', category: 'Akció', emojis: '🎯 🔫 💨 🛡️', clues: ['Két öt fős csapat támad és védekezik.', 'A karakterek különleges képességekkel rendelkeznek.', 'A Spike nevű eszközt kell elhelyezni vagy hatástalanítani.'], features: ['Taktikai lövöldözés', 'Ügynökök képességei', 'Körökre osztott meccsek'] },
  { title: 'Counter-Strike 2', category: 'Akció', emojis: '💣 🎯 🔫 🛡️', clues: ['A terroristák és a terrorelhárítók csapnak össze.', 'A célzáson és a csapatstratégián múlik a győzelem.', 'A bombát el kell helyezni vagy hatástalanítani.'], features: ['Taktikai FPS', 'Gazdasági rendszer', 'Versenyszerű körök'] },
  { title: 'Apex Legends', category: 'Akció', emojis: '🪂 🛡️ 🏆 🔫', clues: ['Egy futurisztikus arénában csapatok küzdenek a túlélésért.', 'Minden karakter egyedi képességeket használ.', 'A játék a Titanfall világában játszódik.'], features: ['Battle royale', 'Hősök képességekkel', 'Csapatalapú FPS'] },
  { title: 'League of Legends', category: 'Stratégia', emojis: '🧙 🏰 ⚔️ 🐉', clues: ['Két ötfős csapat próbálja lerombolni az ellenfél bázisát.', 'Több mint száz különböző hős közül választhatsz.', 'A Summoner’s Rift a legismertebb csatatér.'], features: ['MOBA', 'Hősök és képességek', 'Csapatalapú stratégia'] },
  { title: 'Dota 2', category: 'Stratégia', emojis: '🧙 🏰 🛡️ 🌳', clues: ['Két ötfős csapat egy ősi építményért küzd.', 'Minden hős egyedi képességekkel és szereppel rendelkezik.', 'A játék hatalmas nemzetközi tornájának neve The International.'], features: ['MOBA', 'Ötfős csapatok', 'Ősi erődítmény'] },
  { title: 'Civilization VI', category: 'Stratégia', emojis: '🏛️ 🗺️ ⚔️ 🏹', clues: ['Egy kis településből világbirodalmat építhetsz.', 'A történelem korszakain keresztül vezeted népedet.', 'A játék mottója: még egy kör.'], features: ['Körökre osztott stratégia', 'Birodalomépítés', 'Történelmi vezetők'] },
  { title: 'The Sims 4', category: 'Szimulátor', emojis: '🏠 💚 👨‍👩‍👧 🛁', clues: ['Virtuális emberek mindennapjait irányítod.', 'A zöld kristály a karakterek fölött lebeghet.', 'Házat építhetsz, kapcsolatokat alakíthatsz és karriert választhatsz.'], features: ['Életszimuláció', 'Házépítés', 'Simek történetei'] },
  { title: 'Euro Truck Simulator 2', category: 'Szimulátor', emojis: '🚛 🛣️ 🇪🇺 ⛽', clues: ['Európa útjain szállítasz árut.', 'Saját fuvarozó vállalkozást építhetsz.', 'Kamionoddal több országon át vezethetsz.'], features: ['Kamionvezetés', 'Áruszállítás', 'Európa felfedezése'] },
  { title: 'Forza Horizon 5', category: 'Sport', emojis: '🏎️ 🌵 🇲🇽 🏁', clues: ['Egy hatalmas autós fesztiválon versenyzel.', 'A nyitott világ Mexikó változatos tájait idézi.', 'Több száz autót gyűjthetsz össze és hangolhatsz.'], features: ['Nyitott világú autóverseny', 'Mexikói tájak', 'Autógyűjtemény'] },
  { title: 'Rocket League', category: 'Sport', emojis: '🚗 ⚽ 🚀 🥅', clues: ['Autókkal kell egy óriási labdát az ellenfél kapujába juttatni.', 'A járművek rakétahajtással a levegőbe is emelkedhetnek.', 'Futball négy keréken – röviden ez a játék.'], features: ['Autós futball', 'Légi trükkök', 'Rövid meccsek'] },
  { title: 'EA Sports FC 25', category: 'Sport', emojis: '⚽ 🥅 🏆 👟', clues: ['A világ legismertebb futballcsapatainak játékosai szerepelnek benne.', 'Ultimate Team módban saját keretet állíthatsz össze.', 'A FIFA-sorozat utódjaként jelent meg.'], features: ['Futballszimulátor', 'Klub- és válogatott csapatok', 'Karrier mód'] },
  { title: 'NBA 2K25', category: 'Sport', emojis: '🏀 🏟️ 🏆 👟', clues: ['A világ leghíresebb kosárlabda-bajnokságát dolgozza fel.', 'Saját játékost alkothatsz a karriermódhoz.', 'Az NBA csapatai és sztárjai játszhatók benne.'], features: ['Kosárlabda', 'NBA-csapatok', 'Saját játékos karrier'] },
  { title: 'It Takes Two', category: 'Kaland', emojis: '🧸 💑 🧩 🛠️', clues: ['Kizárólag két játékos együttműködésével játszható.', 'Egy veszekedő házaspár játékméretűvé változik.', 'Cody és May kalandja változatos kooperatív pályákon vezet át.'], features: ['Kétfős kooperatív kaland', 'Változatos mechanikák', 'Cody és May'] },
  { title: 'Phasmophobia', category: 'Indie', emojis: '👻 🔦 🏚️ 📻', clues: ['Egy csapat paranormális nyomozóként dolgozik.', 'Szellemvadászat közben bizonyítékokat kell gyűjteni.', 'A szellemmel akár hanggal is kommunikálhatsz.'], features: ['Kooperatív horror', 'Szellemnyomozás', 'Hangfelismerés'] },
  { title: 'Dead by Daylight', category: 'Akció', emojis: '🔪 🪝 🏃 🩸', clues: ['Négy túlélő próbál elmenekülni egy gyilkos elől.', 'A túlélők generátorokat javítanak a kijutáshoz.', 'A mérkőzések aszimmetrikus többjátékos formában zajlanak.'], features: ['Aszimmetrikus horror', 'Négy túlélő és egy vadász', 'Generátorok javítása'] },
  { title: 'Baldur’s Gate 3', category: 'RPG', emojis: '🐉 🎲 🧙 🗡️', clues: ['A Dungeons & Dragons szabályaira épülő szerepjáték.', 'A döntéseid jelentősen alakítják a történetet.', 'Egy különös élősködő veszélyezteti a főhősöket.'], features: ['Körökre osztott RPG', 'D&D fantasyvilág', 'Választások és társak'] },
  { title: 'Final Fantasy VII Remake', category: 'RPG', emojis: '🗡️ ☄️ ⚡ 🌆', clues: ['Egy óriási, futurisztikus városban küzdesz a Shinra ellen.', 'A főhős egy hatalmas kardot hord a hátán.', 'Cloud Strife történetének újragondolt változata.'], features: ['Japán szerepjáték', 'Shinra és Midgar', 'Cloud és a Buster Sword'] },
  { title: 'Ghost of Tsushima', category: 'Akció', emojis: '⛩️ 🗡️ 🌸 🏯', clues: ['A mongol invázió idején játszódó szamurájtörténet.', 'A szél mutatja az utat a térkép helyett.', 'Cusinima szigetén Jin Sakai harcol a megszállók ellen.'], features: ['Szamurájkaland', 'Nyitott világ', 'Lopakodás és kardharc'] },
  { title: 'Horizon Forbidden West', category: 'Akció', emojis: '🏹 🦾 🦖 🌿', clues: ['A természet visszahódította a technológiai civilizáció romjait.', 'Robotszerű állatok járják a világot.', 'A vörös hajú vadász, Aloy új területekre indul.'], features: ['Robotdinoszauruszok', 'Íjászat és felfedezés', 'Aloy kalandja'] },
  { title: 'Assassin’s Creed Valhalla', category: 'Akció', emojis: '🪓 🛡️ 🛶 🐦‍⬛', clues: ['Viking harcosként új otthont keresel Angliában.', 'Portyákon zsákmányt gyűjthetsz a hosszúhajóddal.', 'Eivor klánját vezetve építed fel településedet.'], features: ['Vikingkaland', 'Portyázás', 'Településfejlesztés'] },
  { title: 'Pikmin 4', category: 'Kaland', emojis: '🌱 👽 🐶 🪐', clues: ['Apró növényszerű lények segítenek egy idegen bolygón.', 'A kis csapat tagjait dobálva irányítod.', 'Oatchi, a hűséges kutya is segít a felfedezésben.'], features: ['Stratégiai kaland', 'Növénylények irányítása', 'Idegen bolygó'] },
  { title: 'Splatoon 3', category: 'Akció', emojis: '🦑 🎨 🔫 🟣', clues: ['Tintával festett arénákban csapnak össze a csapatok.', 'A játékosok tintahallá változva gyorsan mozoghatnak.', 'A cél a pálya minél nagyobb részének befestése.'], features: ['Tintás csapatharc', 'Inklings és Octolingok', 'Színes arénák'] },
  { title: 'A Short Hike', category: 'Indie', emojis: '🦅 ⛰️ 🎣 🥾', clues: ['Egy kis szigeten barangolhatsz, mászhatsz és horgászhatsz.', 'A cél egy hegycsúcs elérése.', 'A főhős egy Claire nevű madár.'], features: ['Nyugodt felfedezés', 'Hegymászás és siklás', 'Apró szigeti kaland'] },
  { title: 'Balatro', category: 'Indie', emojis: '🃏 ♠️ ♦️ ✨', clues: ['A pókerkezeket roguelike elemekkel kombinálja.', 'Különleges jokerlapok teljesen átalakíthatják a stratégiát.', 'A cél egyre magasabb pontszámú körök teljesítése.'], features: ['Kártyás roguelike', 'Jokerkombinációk', 'Pókerinspiráció'] },
  { title: 'Vampire Survivors', category: 'Indie', emojis: '🧛 🧄 💎 👾', clues: ['A fegyverek automatikusan támadnak, miközben az idővel versenyzel.', 'Szörnyek végtelennek tűnő hordái özönlenek a képernyőre.', 'Tapasztalatgyűjtéssel fejlesztheted fegyvereidet.'], features: ['Túlélő roguelike', 'Automatikus támadások', 'Hordányi ellenfél'] },
  { title: 'No Man’s Sky', category: 'Szimulátor', emojis: '🚀 🪐 👽 🌌', clues: ['Szinte végtelen számú bolygót fedezhetsz fel.', 'Idegen fajokkal találkozhatsz és űrhajót vezethetsz.', 'A procedurálisan generált galaxis a játék középpontja.'], features: ['Űrbéli felfedezés', 'Bolygók milliói', 'Túlélés és építés'] },
];

const curatedSteamAppIds: Record<string, number> = {
  'Stardew Valley': 413150,
  'Among Us': 945360,
  'Portal 2': 620,
  'The Witcher 3: Wild Hunt': 292030,
  'Elden Ring': 1245620,
  'Dark Souls III': 374320,
  'Cyberpunk 2077': 1091500,
  'Red Dead Redemption 2': 1174180,
  'Grand Theft Auto V': 271590,
  'The Last of Us': 1888930,
  'God of War': 1593500,
  Hades: 1145360,
  'Hollow Knight': 367520,
  Celeste: 504230,
  Undertale: 391540,
  Cuphead: 268910,
  Terraria: 105600,
  Subnautica: 264710,
  'Sea of Thieves': 1172620,
  'Counter-Strike 2': 730,
  'Apex Legends': 1172470,
  'Dota 2': 570,
  'Civilization VI': 289070,
  'The Sims 4': 1222670,
  'Euro Truck Simulator 2': 227300,
  'Forza Horizon 5': 1551360,
  'Rocket League': 252950,
  'EA Sports FC 25': 2669320,
  'NBA 2K25': 2878980,
  'It Takes Two': 1426210,
  Phasmophobia: 739630,
  'Dead by Daylight': 381210,
  'Baldur’s Gate 3': 1086940,
  'Final Fantasy VII Remake': 1462040,
  'Ghost of Tsushima': 2215430,
  'Horizon Forbidden West': 2420110,
  'Assassin’s Creed Valhalla': 2208920,
  'A Short Hike': 1055540,
  Balatro: 2379780,
  'Vampire Survivors': 1794680,
  'No Man’s Sky': 275850,
};

export const games: Game[] = [...curatedGames];
export const steamAppIds: Record<string, number> = { ...curatedSteamAppIds };

type SteamGameRecord = { appId: number; title: string; developer: string };

function canonicalTitle(title: string): string {
  return title.toLocaleLowerCase('en-US').normalize('NFKC')
    .replace(/\b(?:legacy|enhanced|complete|definitive|remastered|remaster|goty|game of the year|director's cut|deluxe|ultimate) edition\b/gi, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function inferCategory(title: string): GameCategory {
  const name = title.toLowerCase();
  if (/\b(fifa|nba|madden|wwe|football|f1|wrc|rally|racing|motorsport|golf|tennis|forza|assetto|need for speed|dirt)\b/.test(name)) return 'Sport';
  if (/\b(simulator|simulation|simulator|farming|truck|train sim|flight sim|house flipper|tycoon|factory|city builder|powerwash|construction simulator)\b/.test(name)) return 'Szimulátor';
  if (/\b(rpg|final fantasy|dragon quest|dragon age|baldur|elder scrolls|mass effect|witcher|pathfinder|persona|dark souls|elden ring|monster hunter|diablo)\b/.test(name)) return 'RPG';
  if (/\b(strategy|total war|civilization|age of empires|xcom|command & conquer|stellaris|europe universalis|hearts of iron|anno|tower defense|warhammer|crusader kings)\b/.test(name)) return 'Stratégia';
  if (/\b(adventure|tomb raider|walking dead|life is strange|tell(tale)?|story|quest|platformer|puzzle|point.and.click|ori and|unravel|firewatch)\b/.test(name)) return 'Kaland';
  if (/\b(shooter|fps|battlefield|call of duty|counter.strike|doom|resident evil|assassin's creed|far cry|borderlands|warfare|sniper|combat)\b/.test(name)) return 'Akció';
  if (/\b(indie|roguelike|roguelite|metroidvania|pixel|visual novel)\b/.test(name)) return 'Indie';
  return 'Egyéb';
}

const categoryEmojis: Record<GameCategory, string> = {
  'Akció': '🎮 ⚔️ 💥',
  'Kaland': '🧭 🗺️ ✨',
  RPG: '🧙 🐉 🗡️',
  Indie: '🕹️ 🎨 ✨',
  Stratégia: '🏰 🧠 ⚔️',
  Szimulátor: '🛠️ 🌍 🎮',
  Sport: '🏆 🏁 🎮',
  'Egyéb': '🎮 🧩 ✨',
};

let catalogLoadPromise: Promise<number> | null = null;

export function loadGameCatalog(): Promise<number> {
  if (!catalogLoadPromise) {
    catalogLoadPromise = import('./generated-games.json')
      .then(({ default: rawRecords }) => {
        const seenTitles = new Set(curatedGames.map((game) => canonicalTitle(game.title)));
        const extraGameRecords = (rawRecords as SteamGameRecord[]).filter((game) => {
          const key = canonicalTitle(game.title);
          if (!key || seenTitles.has(key)) return false;
          seenTitles.add(key);
          return true;
        });
        const expandedGames: Game[] = extraGameRecords.map(({ title, developer }) => {
          const category = inferCategory(title);
          const words = title.trim().split(/\s+/).filter(Boolean);
          const letters = [...title].filter((character) => /[\p{L}\p{N}]/u.test(character));
          const firstCharacter = letters[0]?.toLocaleUpperCase('hu-HU') ?? '?';
          const lastCharacter = letters[letters.length - 1]?.toLocaleUpperCase('hu-HU') ?? '?';
          const studio = developer.replace(/[.,;:!?]+$/, '').trim() || 'ismeretlen fejlesztő';
          const clues: [string, string, string] = [
            `A fejlesztője: ${studio}.`,
            `A címe ${words.length} szóból és ${letters.length} betűből áll.`,
            `A címe „${firstCharacter}” betűvel kezdődik, és „${lastCharacter}” betűre végződik.`,
          ];
          const features: [string, string, string] = [category, `${words.length} szavas cím`, `Fejlesztő: ${studio}`];
          return { title, category, emojis: categoryEmojis[category], clues, features };
        });
        games.push(...expandedGames);
        Object.assign(steamAppIds, Object.fromEntries(extraGameRecords.map((game) => [game.title, game.appId])));
        return games.length;
      })
      .catch(() => games.length);
  }
  return catalogLoadPromise;
}

export const categories: Array<'Mind' | GameCategory> = [
  'Mind', 'Akció', 'Kaland', 'RPG', 'Indie', 'Stratégia', 'Szimulátor', 'Sport', 'Egyéb',
];
