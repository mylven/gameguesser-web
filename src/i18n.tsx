import { Children, Fragment, cloneElement, createContext, isValidElement, useContext, useMemo, useState, type ReactNode } from 'react';

export type Language = 'hu' | 'en';

const english: Record<string, string> = {
  'Language / Nyelv': 'Language',
  'Témák': 'Themes',
  'Oldaltéma kiválasztása': 'Choose site theme',
  'Válassz témát': 'Choose a theme',
  'Válaszd ki a stílusod': 'Choose your look',
  'A választás ebben a böngészőben megmarad.': 'Your choice is saved in this browser.',
  'Arcade': 'Arcade',
  'Neon cián és gamer lime': 'Neon cyan and gamer lime',
  'Cyberpunk': 'Cyberpunk',
  'Forró pink és elektromos lila': 'Hot pink and electric purple',
  'Forest': 'Forest',
  'Smaragdzöld és napfényes borostyán': 'Emerald green and sunny amber',
  'Synthwave': 'Synthwave',
  'Neonmagenta és retro narancs': 'Neon magenta and retro orange',
  'Napi kvíz elérhető': 'Daily quiz is live',
  'Streamer Program': 'Streamer Program',
  'STREAMER PROGRAM': 'STREAMER PROGRAM',
  'HÍVD KI A NÉZŐIDET': 'CHALLENGE YOUR VIEWERS',
  'Streamelsz?': 'Do you stream?',
  'Játssz velünk.': 'Play with us.',
  'Bármelyik platform számít. Indíts szobát, oszd meg a kódot, és engedd, hogy a nézőid élőben csatlakozzanak a játékhoz.': 'Any platform counts. Start a room, share the code, and let your viewers join the game live.',
  'Válassz avatart': 'Choose an avatar',
  'Örökös Pro hozzáférés': 'Lifetime Pro access',
  'Jóváhagyás után extra streamer-jogokat kapsz.': 'After approval, you get extra streamer permissions.',
  'Saját szobád': 'Your own room',
  'A nézőid egyetlen kóddal csatlakozhatnak.': 'Your viewers can join with one code.',
  'Platform': 'Platform',
  'Csatorna linkje': 'Channel link',
  'Üzenet az adminnak': 'Message to admin',
  'Streamer hozzáférésed aktív': 'Your streamer access is active',
  'Jelentkezés ellenőrzés alatt': 'Application under review',
  'Az admin hamarosan átnézi a csatornád adatait.': 'An admin will review your channel details soon.',
  'Jelentkezés elküldése': 'Submit application',
  'Jelentkezéshez bejelentkezés kell': 'Sign in to apply',
  'Jelentkezések': 'Applications',
  'Ellenőrizd a csatornát, majd hagyd jóvá vagy utasítsd el a kérelmet.': 'Review the channel, then approve or reject the application.',
  'Nincs függő streamer-jelentkezés.': 'No pending streamer applications.',
  'Jóváhagyás': 'Approve',
  'Elutasítás': 'Reject',
  'Ranglista megnyitása': 'Open leaderboard',
  'Ranglista': 'Leaderboard',
  'GameGuesser Premium': 'GameGuesser Premium',
  'Bejelentkezés vagy fiók létrehozása': 'Sign in or create an account',
  'Fiók létrehozása': 'Create account',
  'Fiókom': 'My account',
  'Vissza a főoldalra': 'Back to home',
  'A TE JÁTÉKISMERETED, A TE KIHÍVÁSOD': 'YOUR GAMING KNOWLEDGE, YOUR CHALLENGE',
  'Mennyire ismered': 'How well do you know',
  'a játékokat?': 'games better?',
  'Egy kör ·': 'One quiz ·',
  'kérdés': 'questions',
  'Emojik, nyomok és fejtörők. Kapcsold be a gamer agyad, és találd ki, melyik játékra gondoltunk!': 'Emojis, clues and puzzles. Put your gaming knowledge to the test and guess the game!',
  'játék': 'games',
  '⚡ 4 játékmód': '⚡ 4 game modes',
  '🏆 Saját rekordok': '🏆 Personal records',
  'Félbehagytál egy kvízt': 'You left a quiz unfinished',
  'Folytatás': 'Continue',
  'Statisztikák': 'Statistics',
  'Legjobb pontszám': 'Best score',
  'Legjobb sorozat': 'Best streak',
  'Helyes válasz': 'Correct answers',
  'Lejátszott kör': 'Quizzes played',
  'Összes szerzett pont': 'Total points earned',
  'Megválaszolt kérdés': 'Questions answered',
  'Pontosság': 'Accuracy',
  'PREMIUM STATISZTIKÁK': 'PREMIUM STATISTICS',
  'Részletes teljesítmény': 'Detailed performance',
  'VÁLASSZ KIHÍVÁST': 'CHOOSE YOUR CHALLENGE',
  'Hogyan játszunk?': 'How do you want to play?',
  'Maraton Mix': 'Marathon Mix',
  'Premium · változatos': 'Premium · mixed modes',
  '20 kérdés, három játékmód váltakozva.': '20 questions that rotate between three game modes.',
  '20 kérdéses, váltakozó feladványokat tartalmazó Maraton Mix': '20-question Marathon Mix with rotating challenge types',
  'Túlélő mód: 20 kérdés, egyetlen élettel': 'Survival mode: 20 questions with a single life',
  'Túlélő mód': 'Survival Mode',
  'Premium · egy életed van': 'Premium · one life',
  'Válaszolj helyesen 20 kérdésre — egy hiba, és vége.': 'Answer 20 questions correctly — one mistake and it is over.',
  'Egy rossz válasz véget vet a menetnek': 'One wrong answer ends your run',
  'Menet vége': 'End run',
  'TÚLÉLÉS VÉGE': 'SURVIVAL COMPLETE',
  'Sikeres túlélés!': 'You survived!',
  'Vége a menetnek': 'Run over',
  'Mind a 20 kérdést hiba nélkül teljesítetted!': 'You completed all 20 questions without a mistake!',
  'Egy kör': 'A quiz',
  'Kategória': 'Category',
  'Minden játék': 'All games',
  'Akció': 'Action',
  'Kaland': 'Adventure',
  'RPG': 'RPG',
  'Indie': 'Indie',
  'Stratégia': 'Strategy',
  'Szimulátor': 'Simulation',
  'Sport': 'Sports',
  'Egyéb': 'Other',
  'Kvíz hossza': 'Quiz length',
  '10 kérdés': '10 questions',
  '20 kérdés · Maraton': '20 questions · Marathon',
  'játék a pakliban': 'games in the deck',
  'Játéklista betöltése…': 'Loading game list…',
  'Játék indítása': 'Start quiz',
  'Betöltés…': 'Loading…',
  'JÁTSSZATOK EGYÜTT': 'PLAY TOGETHER',
  'Hívd ki a barátod vagy játsszatok együtt!': 'Challenge a friend or play together!',
  'Kétfős párbaj vagy korlátlan létszámú csoportszoba · Premium házigazdának 20 kérdés': 'Two-player duel or unlimited group room · 20 questions for Premium hosts',
  'Játékszoba': 'Game room',
  'Játssz, tanulj, és döntsd meg a rekordod.': 'Play, learn, and beat your record.',
  'KÖR TELJESÍTVE': 'QUIZ COMPLETE',
  'Szép játék!': 'Well played!',
  'Te aztán ismered a játékokat!': 'You really know your games!',
  'Még egy kör, és meglesz az új rekord!': 'One more round and you could set a new record!',
  'pont': 'points',
  'Rekordpontszám': 'High score',
  'Újra játszás': 'Play again',
  'Másik mód': 'Other modes',
  'Kilépés': 'Exit',
  'KÉRDÉS': 'QUESTION',
  'MELYIK JÁTÉKRA GONDOLTUNK?': 'WHICH GAME ARE WE THINKING OF?',
  'Rakd össze a történetet!': 'Piece the story together!',
  'NYOMOK': 'CLUES',
  'JÁTÉKJELLEMZŐK': 'GAME FEATURES',
  'Melyik játék illik rájuk?': 'Which game matches?',
  'Elhomályosított játékillusztráció': 'Blurred game artwork',
  'Játékkép': 'Game artwork',
  'Emoji nyomok': 'Emoji clues',
  'HELYES TALÁLAT · TELJES KÉP': 'CORRECT · FULL IMAGE',
  'HOMÁLYOS KÉP': 'BLURRED IMAGE',
  'SEGÍTSÉG': 'HINT',
  'Minden nyom felfedve': 'All clues revealed',
  'Mutass még egy nyomot': 'Reveal another clue',
  'Ez most nem talált!': 'Not quite!',
  'Élesebb lett a kép, és új segítséget kaptál. Próbáld újra!': 'The image is clearer and you got a new hint. Try again!',
  'tipp maradt': 'guesses left',
  'Ez az, eltaláltad!': 'That’s right!',
  'Majdnem!': 'Almost!',
  'jöhet a következő?': 'Ready for the next one?',
  'Eredmény': 'Results',
  'Következő': 'Next',
  'Minden hibás tipp élesíti a képet': 'Every wrong guess sharpens the image',
  'Kevesebb nyomért több pont jár': 'Fewer hints mean more points',
  'hibás tipp': 'wrong guesses',
  'helyes': 'correct',
  'Főoldal': 'Home',
  'Vissza a játékhoz': 'Back to the game',
  'Admin felület betöltése…': 'Loading admin panel…',
  'Ranglista betöltése…': 'Loading leaderboard…',
  'Premium betöltése…': 'Loading Premium…',
  'Felhőbe mentve': 'Saved to cloud',
  'Mentés…': 'Saving…',
  'Offline mentés': 'Saved offline',
  'Játék mód': 'Game mode',
  'A játék idővel egyre élesebb lesz': 'The image gets clearer over time',
  'Képfelismerő': 'Image Guess',
  'Emojik': 'Emojis',
  'Nyomok': 'Clues',
  'Emoji + egy nyom': 'Emoji + one clue',
  'Történet + tipp': 'Story + guess',
  'Játékmenet + tipp': 'Gameplay + guess',
  'A kép idővel élesedik': 'Image sharpens over time',
  'Párbaj játékmódja': 'Duel game mode',
  'Szobakód másolása': 'Copy room code',
  'Emoji-kvíz': 'Emoji Quiz',
  'Nyomozó mód': 'Detective Mode',
  'Jellemzők': 'Game Features',
  'Gyors és vicces': 'Quick and fun',
  'Gondolkodós': 'Brain teaser',
  'Igazi rajongóknak': 'For true fans',
  'Lásd meg a részleteket': 'Spot the details',
  'Ismerd fel a játékot néhány beszédes emojiból.': 'Guess the game from a few expressive emojis.',
  'Fejtsd meg a játékot a fokozatosan felfedett nyomokból.': 'Solve the game using gradually revealed clues.',
  'Műfaj és játékmenet alapján találd meg a helyes választ.': 'Identify the game from its genre and gameplay.',
  'Találd ki a játékot az elhomályosított képből.': 'Guess the game from a blurred image.',
  'Helyes válasz:': 'Correct answer:',
  'Fiók beállításai': 'Account settings',
  'GAMEGUESSER': 'GAMEGUESSER',
  'Találd ki. Játssz még. 🕹️': 'Guess it. Play more. 🕹️',

  'FELHŐS JÁTÉKOSPROFIL': 'CLOUD PLAYER PROFILE',
  'játékos': 'player',
  'A mentéseid ehhez a fiókhoz kapcsolódnak, így másik eszközön is folytathatod.': 'Your saves are linked to this account, so you can continue on another device.',
  'Mentve': 'Saved',
  'Helyi mentés': 'Local save',
  'Admin kezelőfelület': 'Admin dashboard',
  'Kijelentkezés': 'Sign out',
  'MENTSD EL A JÁTÉKOD': 'SAVE YOUR GAME',
  'Üdv újra!': 'Welcome back!',
  'Hozz létre fiókot': 'Create an account',
  'A pontjaid és a félbehagyott kvízed elérhető marad, ha másik eszközön jelentkezel be.': 'Your scores and unfinished quizzes will be available when you sign in on another device.',
  'Firebase-beállítás szükséges': 'Firebase setup required',
  'A fiók létrehozásához előbb hozz létre Firebase-projektet, és add meg a webes konfigurációt a .env.local fájlban. A teljes útmutató a README-ben található.': 'To create an account, set up a Firebase project and add its web configuration to .env.local. See the README for instructions.',
  'Játékosnév': 'Player name',
  'Hogy szólítsunk?': 'What should we call you?',
  'E-mail-cím': 'Email address',
  'Jelszó': 'Password',
  'Legalább 6 karakter': 'At least 6 characters',
  'Jelszó megerősítése': 'Confirm password',
  'Írd be újra a jelszót': 'Enter your password again',
  'Bejelentkezés': 'Sign in',
  'Elfelejtetted a jelszavad?': 'Forgot your password?',
  'Még nincs fiókod?': 'Don’t have an account?',
  'Már van fiókod?': 'Already have an account?',
  'Regisztráció': 'Register',
  'Bezárás': 'Close',
  'Ezzel az e-mail-címmel már létezik fiók. Jelentkezz be.': 'An account with this email already exists. Please sign in.',
  'Hibás e-mail-cím vagy jelszó.': 'Incorrect email or password.',
  'A jelszó legalább 6 karakter legyen.': 'The password must be at least 6 characters.',
  'Érvénytelen e-mail-cím.': 'Invalid email address.',
  'Túl sok próbálkozás. Próbáld meg később.': 'Too many attempts. Try again later.',
  'Nem sikerült kapcsolódni. Ellenőrizd az internetet.': 'Could not connect. Check your internet connection.',
  'A Firebase-ben még nincs bekapcsolva az e-mail/jelszó bejelentkezés.': 'Email/password sign-in is not enabled in Firebase yet.',
  'Nem sikerült a művelet. Ellenőrizd a Firebase-beállításokat, és próbáld újra.': 'The request failed. Check the Firebase settings and try again.',
  'A fiókokhoz Firebase-projekt szükséges. Kövesd a README Firebase-beállításait, majd töltsd ki a .env.local fájlt.': 'A Firebase project is required for accounts. Follow the README setup guide and configure .env.local.',
  'A két jelszó nem egyezik.': 'The passwords do not match.',
  'A fiók elkészült, az adataid mentése elindult.': 'Your account is ready and your data is being saved.',
  'Előbb állítsd be a Firebase-t a README útmutatója alapján.': 'Set up Firebase first using the README guide.',
  'Add meg az e-mail-címedet a jelszó-visszaállításhoz.': 'Enter your email address to reset your password.',
  'Elküldtük a jelszó-visszaállító e-mailt. Nézd meg a postafiókodat.': 'Password reset email sent. Check your inbox.',
  'Nem sikerült kijelentkezni. Próbáld újra.': 'Could not sign out. Please try again.',

  'KÖZÖSSÉGI RANGLISTA': 'COMMUNITY LEADERBOARD',
  'Egyéni kvíz': 'Solo quizzes',
  'Párbaj ranglista': 'Duel leaderboard',
  'A legtöbb párbajgyőzelem kerül a lista élére.': 'Players with the most duel wins appear at the top.',
  'Párbajgyőzelmek': 'Duel wins',
  'Még nincs befejezett párbaj': 'No completed duels yet',
  'Játssz egy bejelentkezett játékossal párbajt, és megjelenik itt az eredményed.': 'Play a duel while signed in and your result will appear here.',
  'Párbajok': 'Duels',
  'Győzelmek': 'Wins',
  'párbaj': 'duels',
  'győzelem': 'wins',
  'A PONTOK DÖNTENEK': 'POINTS DECIDE',
  'Játékos': 'Player',
  'ranglista': 'leaderboard',
  'A legtöbb összesített ponttal rendelkező játékos áll az első helyen.': 'Players with the highest total score appear at the top.',
  'JÁTÉKOS RANGLISTA': 'PLAYER LEADERBOARD',
  'TOP JÁTÉKOSOK': 'TOP PLAYERS',
  'Összesített pontszám': 'Total score',
  'Ranglista frissítése': 'Refresh leaderboard',
  'Nem sikerült betölteni a ranglistát. Próbáld meg később újra.': 'Could not load the leaderboard. Please try again later.',
  'Még üres a ranglista': 'The leaderboard is empty for now',
  'Játssz egy kvízt bejelentkezett fiókkal, és itt megjelenik az összesített pontszámod.': 'Complete a quiz while signed in and your total score will appear here.',
  'Frissítve:': 'Updated:',
  'automatikus frissítés 30 másodpercenként': 'auto-refreshes every 30 seconds',
  'befejezett kvíz': 'completed quizzes',
  'Hely': 'Rank',
  'Lejátszott kvíz': 'Quizzes played',
  'TE': 'YOU',
  '(te)': '(you)',
  'A ranglistán a regisztrált fiókok összesített pontszáma szerepel. A játék anonim vendégpontszámai nem kerülnek fel.': 'The leaderboard shows total scores for registered accounts. Anonymous guest scores are not included.',

  'GAMEGUESSER PREMIUM': 'GAMEGUESSER PREMIUM',
  'TÁMOGASD A GAMEGUESSERT': 'SUPPORT GAMEGUESSER',
  'Játssz': 'Play',
  'többet.': 'more.',
  'Láss többet.': 'See more.',
  'Oldj fel extra kihívásokat, részletes statisztikákat és egy különleges témát.': 'Unlock extra challenges, detailed stats and a special theme.',
  '/ hó': '/ month',
  'Előfizetek Buy Me a Coffee-n': 'Subscribe on Buy Me a Coffee',
  'A fizetés a Buy Me a Coffee biztonságos oldalán történik.': 'Payment is securely processed by Buy Me a Coffee.',
  'MIT KAPSZ?': 'WHAT YOU GET',
  'Premium előnyök': 'Premium benefits',
  'Haladó statisztikák és összesített teljesítmény': 'Advanced statistics and overall performance',
  'Egyedi, Premium színű játéktéma': 'Exclusive Premium color theme',
  '20 kérdéses párbaj- és csoportszobák': '20-question duels and group rooms',
  'Fizetés után aktiváld a hozzáférést': 'Activate your access after payment',
  'A fizetés után kérj aktiválást. Az admin ellenőrzi a Buy Me a Coffee-tagságot, majd jóváhagyja a fiókodat. Az automatikus fizetés-ellenőrzés még nincs bekapcsolva.': 'After paying, request activation. An admin will verify your Buy Me a Coffee membership and approve your account. Automatic payment verification is not enabled yet.',
  'Előbb bejelentkezem': 'Sign in first',
  'Ellenőrzésre vár': 'Pending review',
  'Aktiválást kérek': 'Request activation',
  'Köszönjük, hogy támogatod a GameGuessert!': 'Thank you for supporting GameGuesser!',
  'Az előfizetés és lemondás a Buy Me a Coffee fiókodban kezelhető. A tagság ellenőrzése itt egyelőre kézi jóváhagyással történik.': 'Manage your subscription and cancellation in your Buy Me a Coffee account. Membership verification is currently manual.',
  'Kérés elküldve. Az admin a fizetés ellenőrzése után aktiválja a Premium-tagságot.': 'Request sent. An admin will activate Premium after verifying your payment.',
  'Nem sikerült elküldeni a kérelmet. Ellenőrizd a bejelentkezést, majd próbáld újra.': 'Could not send the request. Check your sign-in and try again.',

  'ADMINISTRÁTORI FELÜLET': 'ADMIN DASHBOARD',
  'OLDALSTATISZTIKA': 'SITE ANALYTICS',
  'Weboldal-látogatottság': 'Website visits',
  'Névtelen becslés; név, e-mail-cím és IP-cím nem kerül tárolásra.': 'Anonymous estimate; no names, email addresses or IP addresses are stored.',
  'Becsült egyedi böngésző': 'Estimated unique browsers',
  'Összes oldalmegnyitás': 'Total page opens',
  'Utolsó megnyitás': 'Last visit',
  'Nem sikerült lekérni a látogatókat. Ellenőrizd a siteVisitors Firestore-szabályt.': 'Could not load visitor stats. Check the siteVisitors Firestore rule.',
  'Az egyedi látogató böngészőnként értendő: több eszközön ugyanaz a személy többször számíthat, a privát mód vagy a törölt böngészőadat pedig új látogatónak számít.': 'Unique visitors are estimated per browser: the same person may count on multiple devices, and private mode or cleared browser data may count as a new visitor.',
  'JÁTÉKKEZELÉS': 'GAME MANAGEMENT',
  'Admin': 'Admin',
  'dashboard': 'dashboard',
  'Itt kezelheted a regisztrált játékosprofilokat, a hozzáféréseket és a mentett játékadatokat.': 'Manage registered player profiles, access and saved game data here.',
  'Játékosprofil': 'Player profiles',
  'Adminisztrátor': 'Administrators',
  'Félbehagyott mentés': 'Saved games in progress',
  'BUY ME A COFFEE · 1 500 FT / HÓ': 'BUY ME A COFFEE · HUF 1,500 / MONTH',
  'Premium-igénylések': 'Premium requests',
  'A vásárlás ellenőrzése és aktiválása jelenleg kézi. Csak az ellenőrzött tagságokat hagyd jóvá.': 'Purchase verification and activation are manual. Approve only verified memberships.',
  'Frissítés': 'Refresh',
  'Nincs függő Premium-igénylés.': 'No pending Premium requests.',
  'Most kérte': 'Requested just now',
  'Aktuális játékok': 'Active games',
  'VALÓS IDEJŰ FIGYELŐ': 'REAL-TIME MONITOR',
  'A megoldásokat csak az adminfelület mutatja. Az adatok legfeljebb 5 másodpercenként frissülnek.': 'Solutions are visible only to admins. Data refreshes every 5 seconds.',
  'Élő játékok betöltése…': 'Loading active games…',
  'Jelenleg nem látszik aktív, bejelentkezett játékos által indított meccs.': 'No active match hosted by a signed-in player is visible right now.',
  'JÁTÉKOS / HÁZIGAZDA': 'PLAYER / HOST',
  'JÁTÉKMÓD · KÖR': 'MODE · ROUND',
  'AKTUÁLIS MEGOLDÁS': 'CURRENT ANSWER',
  'Szobakód:': 'Room code:',
  'Játékosok betöltése…': 'Loading players…',
  'A megfigyelés jelenleg a bejelentkezett játékosok egyéni kvízeit és a bejelentkezett házigazda által indított szobajátékokat követi.': 'Monitoring currently covers solo quizzes played by signed-in users and rooms started by a signed-in host.',
  'FELHASZNÁLÓK': 'PLAYERS',
  'Játékosprofilok': 'Player profiles',
  'Az Auth-fiókokat nem törli innen a rendszer; csak a profil és a mentett játékadat kezelhető.': 'Firebase Auth accounts are not deleted here; only profiles and saved game data are managed.',
  'Keresés név, e-mail vagy UID szerint': 'Search by name, email or UID',
  'Nem sikerült betölteni a felhasználókat. Ellenőrizd az admin Firestore-szabályokat.': 'Could not load users. Check the admin Firestore rules.',
  'Profilok betöltése…': 'Loading profiles…',
  'Még nincsenek játékosprofilok. Az első bejelentkezés és mentés után jelennek meg.': 'No player profiles yet. They appear after a user signs in and saves progress.',
  'Nincs a keresésnek megfelelő profil.': 'No profiles match your search.',
  'Statisztika': 'Statistics',
  'Félbehagyott kvíz': 'Quiz in progress',
  'Jogosultság': 'Role',
  'Műveletek': 'Actions',
  'Admin jog visszavonása': 'Revoke admin access',
  'Admin jog megadása': 'Grant admin access',
  'Jog visszavonása': 'Revoke access',
  'Adminná tesz': 'Make admin',
  'Mentett játékprofil törlése': 'Delete saved player profile',
  'Profil törlése': 'Delete profile',
  'Ingyenes': 'Free',
  'Admin jogosultságot adtál:': 'Admin access granted to:',
  'Visszavontad az admin jogosultságot:': 'Admin access revoked for:',
  'Premium hozzáférést aktiválva:': 'Premium access activated for:',
  'Premium hozzáférést adtál:': 'Premium access granted to:',
  'Premium hozzáférés visszavonva:': 'Premium access revoked for:',
  'A saját admin jogosultságodat innen nem módosíthatod.': 'You cannot change your own admin access here.',
  'A saját profilodat innen nem törölheted.': 'You cannot delete your own profile here.',
  'A saját szerepkör nem módosítható': 'Your own role cannot be changed',
  'Nem sikerült jóváhagyni a Premium-igénylést. Ellenőrizd a Firestore-szabályokat.': 'Could not approve the Premium request. Check the Firestore rules.',
  'Nem sikerült Premium-hozzáférést adni. Ellenőrizd, hogy a Premium Firestore-szabályok telepítve vannak-e.': 'Could not grant Premium. Check that the Premium Firestore rules are deployed.',
  'Nem sikerült visszavonni a Premium-hozzáférést.': 'Could not revoke Premium access.',
  'Nem sikerült törölni a játékosprofilt.': 'Could not delete the player profile.',
  'Nem sikerült módosítani a jogosultságot. Csak admin adhat vagy vehet el admin hozzáférést.': 'Could not update access. Only an admin can grant or revoke it.',
  'Összesen': 'Total',
  'helyes válasz ·': 'correct answers ·',
  'összpont a játékosprofilokban': 'total points across player profiles',
  'Az admin ellenőrzés Firebase Auth UID-hoz kötött Firestore-jogosultságon alapul. Az admin hozzáférést a Firestore ': 'Admin verification is based on Firebase Auth UID permissions in Firestore. Admin access can be revoked in the Firestore ',
  ' dokumentumában lehet visszavonni.': ' document.',

  'Ki ismeri jobban': 'Who knows',
  'HÍVD KI A BARÁTAIDAT': 'CHALLENGE YOUR FRIENDS',
  'Hozzatok létre egy szobát, osszátok meg a kódot, és küzdjetek meg játékfelismerő kérdésekben baráti társaságban!': 'Create a room, share the code and compete with friends in a game-guessing quiz!',
  'Tetszőleges létszám': 'Any group size',
  'Valós idejű': 'Real time',
  '01 · HÁZIGAZDA': '01 · HOST',
  'Szoba létrehozása': 'Create a room',
  'Indíts egy közös játékot, majd küldd el a szobakódot az egész társaságnak.': 'Start a game and share the room code with everyone.',
  'Szobatípus': 'Room type',
  'Párbaj': 'Duel',
  'PÁRBAJ': 'DUEL',
  'Te + 1 ellenfél': 'You + 1 opponent',
  'Csoportszoba': 'Group room',
  'Korlátlan létszám': 'Unlimited players',
  'Add meg a neved': 'Enter your name',
  'Csoportszobát hozok létre': 'Create group room',
  'Párbajszobát hozok létre': 'Create duel room',
  '02 · CSATLAKOZÁS': '02 · JOIN',
  'VAGY': 'OR',
  'Csatlakozás kóddal': 'Join with a code',
  'Kérd el a szobakódot a házigazdától, és csatlakozz a közös játékhoz.': 'Ask the host for the room code to join the game.',
  'Szobakód': 'Room code',
  'Csatlakozás': 'Join room',
  'A szobakód 6 betűből vagy számból áll.': 'The room code contains 6 letters or numbers.',
  'Hozz létre szobát, vagy csatlakozz egy meglévőhöz.': 'Create a room or join an existing one.',
  'A szoba létrehozása folyamatban…': 'Creating room…',
  'A szoba nyitva van. Küldd el a kódot a barátaidnak!': 'The room is open. Share the code with your friends!',
  'Új játékos csatlakozik a szobához…': 'A new player is joining the room…',
  'Kapcsolódás a szobához…': 'Connecting to room…',
  'Kapcsolódva a szobához. Várakozás a házigazdára…': 'Connected to room. Waiting for the host…',
  'Csatlakoztál. Várj, amíg a házigazda elindítja a közös játékot.': 'You joined. Wait for the host to start the game.',
  'Játékosok a szobában': 'Players in room',
  'csatlakozott': 'joined',
  'HÁZIGAZDAI BEÁLLÍTÁSOK': 'HOST SETTINGS',
  'A játék indulásáig módosíthatók': 'Can be changed until the game starts',
  'Játékmód': 'Game mode',
  'Kérdések száma': 'Number of questions',
  '20 kérdés · Premium maraton': '20 questions · Premium Marathon',
  'Premium · 20 kérdés': 'Premium · 20 questions',
  'Időre menjen a párbaj': 'Timed duel',
  'A gyorsabb helyes válasz több pontot ér': 'Faster correct answers earn more points',
  'Életre menő csata': 'Battle mode',
  '1000 élet · a gyorsabb helyes válasz sebez · sorozat-szorzó': '1000 HP · faster correct answers deal damage · streak multiplier',
  'Csata módban az időmérő mindig aktív': 'The timer is always on in battle mode',
  'ÉLETRE MENŐ CSATA': 'BATTLE MODE',
  '⚔️ A GYORSABB TALÁLAT SEBEZ': '⚔️ THE FASTER CORRECT ANSWER DEALS DAMAGE',
  'találati sorozat': 'hit streak',
  'ÉLET': 'HP',
  'Kikapcsolva · nyugodt tempóban játszhattok': 'Off · play at your own pace',
  'Kérdésenként': 'Per question',
  'Az elmosódott kép a visszaszámlálás alatt fokozatosan kiélesedik.': 'The blurred image gradually sharpens during the countdown.',
  'A házigazda beállítja a játékmódot és az időlimitet indítás előtt.': 'The host chooses the mode and time limit before starting.',
  'Csoportos játék indítása': 'Start group game',
  'Párbaj indítása': 'Start duel',
  'A házigazda indítására várunk': 'Waiting for the host to start',
  'Kilépés a szobából': 'Leave room',
  'Hívd meg az egész társaságot!': 'Invite your whole group!',
  'Hívd meg az ellenfeled!': 'Invite your opponent!',
  'Már majdnem kész!': 'Almost ready!',
  'NYITOTT CSOPORTSZOBA': 'OPEN GROUP ROOM',
  'KÉTFŐS PÁRBAJ': 'TWO-PLAYER DUEL',
  'CSATLAKOZÁS A SZOBÁHOZ': 'JOINING ROOM',
  'Oszd meg a szobakódot — korlátlan számú barát csatlakozhat a játék indítása előtt.': 'Share the room code—any number of friends can join before the game starts.',
  'Oszd meg a szobakódot egy barátoddal, és indulhat a párbaj.': 'Share the room code with a friend and start the duel.',
  'Várj, amíg a házigazda elindítja a közös játékot.': 'Wait for the host to start the game.',
  'SZOBAKÓD': 'ROOM CODE',
  'Másolás': 'Copy',
  'Másolva!': 'Copied!',
  'CSATLAKOZOTT': 'CONNECTED',
  'KILÉPETT': 'LEFT',
  'HÁZIGAZDA': 'HOST',
  'KÖR LEZÁRVA': 'ROUND COMPLETE',
  'LEJÁRT AZ IDŐ': 'TIME IS UP',
  'HÁTRALÉVŐ IDŐ': 'TIME LEFT',
  '🎮 KI ISMERI JOBBAN?': '🎮 WHO KNOWS IT BEST?',
  'MEGFEJTÉS': 'ANSWER REVEALED',
  'A KÉP AZ IDŐVEL ÉLESEBB LESZ': 'THE IMAGE SHARPENS OVER TIME',
  'TALÁLD KI A JÁTÉKOT': 'GUESS THE GAME',
  'A félidőnél egy extra nyom is érkezik — figyeld, hogyan élesedik a kép!': 'An extra hint appears halfway—watch the image sharpen!',
  'Következő kérdésre várunk': 'Waiting for the next question',
  'Következő kérdés': 'Next question',
  'Lejárt az idő — az eredményre várunk': 'Time is up—we are waiting for the results',
  'Tipp elküldve —': 'Answer submitted —',
  'játékos még válaszol': 'players still answering',
  'A szobában lévő játékosok válaszára várunk': 'Waiting for the players in the room to answer',
  'PÁRBAJ VÉGE': 'DUEL OVER',
  'Döntetlen!': 'It’s a tie!',
  'Győztél!': 'You won!',
  'Végeredmény!': 'Final results!',
  'Lejátszottátok mind a': 'You completed all',
  'kérdést. Íme a végső rangsor:': 'questions. Here is the final leaderboard:',
  'Új párbaj indítása': 'Start a new duel',
  '🔒 A válaszaitok közvetlenül egymás között utaznak.': '🔒 Your answers are sent directly between players.',
  'Ingyenes, böngészőből böngészőbe kapcsolat': 'Free peer-to-peer browser connection',
  'Ez a szobakód már foglalt. Hozz létre egy új szobát.': 'This room code is taken. Create a new room.',
  'Nem található a szoba. Ellenőrizd a kódot, és próbáld újra.': 'Room not found. Check the code and try again.',
  'Ez a böngésző nem támogatja a valós idejű párbajt.': 'This browser does not support real-time duels.',
  'A kapcsolatszerver nem érhető el. Ellenőrizd az internetkapcsolatot, majd próbáld újra.': 'The connection server is unavailable. Check your internet and try again.',
  'Nem sikerült létrehozni a kapcsolatot. Próbáld újra.': 'Could not establish a connection. Please try again.',
  'A játékosok közötti kapcsolat megszakadt.': 'The player connection was interrupted.',
  'A házigazda kapcsolata megszakadt.': 'The host connection was interrupted.',
  'Újracsatlakozás a szobaszolgáltatáshoz…': 'Reconnecting to the room service…',
  'A párbaj véget ért.': 'The duel is over.',
  'A játék már elindult, ezért új játékost már nem lehet felvenni.': 'The game has started; no new players can join.',
  'Ez a párbajszoba már megtelt. Kérj kódot a csoportszobához, vagy indítsatok új párbajt.': 'This duel room is full. Join a group room or start a new duel.',
  'A párbaj elindult!': 'The duel has started!',
  'ONLINE': 'ONLINE',
  'A TE': 'YOU',
  'Szia,': 'Hi,',
  'GameGuesser-játékos': 'GameGuesser player',
  '10 kérdés · Premium: 20': '10 questions · Premium: 20',
  'Premium házigazdának 20 kérdés': 'Premium hosts get 20 questions',
  'Premium arany téma bekapcsolása': 'Enable Premium gold theme',
  'Arany téma bekapcsolva · Váltás': 'Gold theme on · Toggle',
  'Premium hozzáférés': 'Premium access',
  'Premiumot ad': 'Grant Premium',
  'Visszavonás': 'Revoke',
  'Premium hozzáférés aktiválva:': 'Premium access activated for:',
  'Admin dashboard': 'Admin dashboard',
  'pontosság eddig': 'accuracy so far',
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
  format: (template: string, values: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem('gameguesser-language') === 'en' ? 'en' : 'hu');
  const setLanguage = (nextLanguage: Language) => {
    localStorage.setItem('gameguesser-language', nextLanguage);
    setLanguageState(nextLanguage);
  };
  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (text) => language === 'en' ? english[text] ?? text : text,
    format: (template, values) => {
      const translated = language === 'en' ? english[template] ?? template : template;
      return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
    },
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}

function translateNode(node: ReactNode, translate: (text: string) => string): ReactNode {
  if (typeof node === 'string') return translate(node);
  if (Array.isArray(node)) return Children.map(node, (child) => translateNode(child, translate));
  if (!isValidElement<{ children?: ReactNode; placeholder?: string; title?: string; 'aria-label'?: string }>(node)) return node;
  if (typeof node.type !== 'string' && node.type !== Fragment) return node;
  const props = { ...node.props };
  if (typeof props.placeholder === 'string') props.placeholder = translate(props.placeholder);
  if (typeof props.title === 'string') props.title = translate(props.title);
  if (typeof props['aria-label'] === 'string') props['aria-label'] = translate(props['aria-label']);
  if (props.children !== undefined) props.children = translateNode(props.children, translate);
  return cloneElement(node, props);
}

export function AutoTranslate({ children }: { children: ReactNode }) {
  const { t, format, language } = useI18n();
  const translate = (text: string): string => {
    if (language !== 'en') return text;
    const trimmed = text.trim();
    if (trimmed !== text) {
      const start = text.indexOf(trimmed);
      return `${text.slice(0, start)}${translate(trimmed)}${text.slice(start + trimmed.length)}`;
    }
    const developer = text.match(/^A fejlesztője: (.+)\.$/);
    if (developer) return `Developer: ${developer[1]}.`;
    const titleStats = text.match(/^A címe (\d+) szóból és (\d+) betűből áll\.$/);
    if (titleStats) return `Its title has ${titleStats[1]} words and ${titleStats[2]} letters.`;
    const letters = text.match(/^A címe „(.+)” betűvel kezdődik, és „(.+)” betűre végződik\.$/);
    if (letters) return `It starts with “${letters[1]}” and ends with “${letters[2]}”.`;
    const featureDeveloper = text.match(/^Fejlesztő: (.+)$/);
    if (featureDeveloper) return `Developer: ${featureDeveloper[1]}`;
    const roomPlayers = text.match(/^(\d+) játékos van a szobában\.$/);
    if (roomPlayers) return `${roomPlayers[1]} players in the room.`;
    const score = text.match(/^([+−-]?\d+) pont$/);
    if (score) return `${score[1]} points`;
    const battleHealth = text.match(/^(\d+) \/ 1000 ÉLET$/);
    if (battleHealth) return `${battleHealth[1]} / 1000 HP`;
    const battleStreak = text.match(/^([\d.]+)× · (\d+) találati sorozat$/);
    if (battleStreak) return `${battleStreak[1]}× · ${battleStreak[2]} hit streak`;
    const finalBattleHealth = text.match(/^(\d+) \/ 1000$/);
    if (finalBattleHealth) return `${finalBattleHealth[1]} / 1000 HP`;
    const streak = text.match(/^(\d+) sorozat$/);
    if (streak) return `${streak[1]} streak`;
    const minutes = text.match(/^(\d+) mp$/);
    if (minutes) return `${minutes[1]} sec`;
    const wrongGuesses = text.match(/^(\d+) hibás tipp$/);
    if (wrongGuesses) return `${wrongGuesses[1]} wrong guesses`;
    const guessesLeft = text.match(/^(\d+) tipp maradt$/);
    if (guessesLeft) return `${guessesLeft[1]} guesses left`;
    const questionCount = text.match(/^Egy kör · (\d+) kérdés$/);
    if (questionCount) return `One quiz · ${questionCount[1]} questions`;
    const playerJoined = text.match(/^(\d+) játékos csatlakozott\. (.+)$/);
    if (playerJoined) return `${playerJoined[1]} players joined. ${playerJoined[2] === 'Továbbiak is jöhetnek!' ? 'More can join!' : 'You can start the duel!'}`;
    const wrongGuessNumber = text.match(/^(\d+) HIBÁS TIPP · ÉLESEBB KÉP$/);
    if (wrongGuessNumber) return `${wrongGuessNumber[1]} WRONG GUESSES · CLEARER IMAGE`;
    const correctProgress = text.match(/^(\d+) \/ (\d+) helyes$/);
    if (correctProgress) return `${correctProgress[1]} / ${correctProgress[2]} correct`;
    const question = text.match(/^(\d+)\. kérdés \/ (\d+)$/);
    if (question) return `${question[1]} question / ${question[2]}`;
    const roomPlayersJoined = text.match(/^(\d+) csatlakozott( \/ 2)?$/);
    if (roomPlayersJoined) return `${roomPlayersJoined[1]} joined${roomPlayersJoined[2] ? ' / 2' : ''}`;
    const attemptCount = text.match(/^(\d+) hibás tipp · élesebb kép$/i);
    if (attemptCount) return `${attemptCount[1]} wrong guesses · clearer image`;
    const gameCount = text.match(/^(?:🎮\s*)?(\d+)\+? játék(?: a pakliban)?$/);
    if (gameCount) return `${text.startsWith('🎮') ? '🎮 ' : ''}${gameCount[1]}+ games${text.includes('pakliban') ? ' in the deck' : ''}`;
    const accuracy = text.match(/^(?:🎯\s*)?(\d+)% pontosság eddig$/);
    if (accuracy) return `${text.startsWith('🎯') ? '🎯 ' : ''}${accuracy[1]}% accuracy so far`;
    const resultScore = text.match(/^\+(\d+) pont — jöhet a következő\?$/);
    if (resultScore) return `+${resultScore[1]} points — ready for the next one?`;
    const scoreRecord = text.match(/^(\d+) helyes · (\d+) rekordpont$/);
    if (scoreRecord) return `${scoreRecord[1]} correct · ${scoreRecord[2]} record points`;
    const gamesPlayed = text.match(/^(\d+) kör$/);
    if (gamesPlayed) return `${gamesPlayed[1]} quizzes`;
    const questionIndex = text.match(/^(\d+)\. kérdés$/);
    if (questionIndex) return `Question ${questionIndex[1]}`;
    const greeting = text.match(/^Szia, (.+)!$/);
    if (greeting) return `Hi, ${greeting[1]}!`;
    const answeredTitle = text.match(/^A helyes válasz: (.+)$/);
    if (answeredTitle) return `The correct answer: ${answeredTitle[1]}`;
    const playerAnswer = text.match(/^(.+): (idő lejárt|kilépett|eltalálta|nem találta el)$/);
    if (playerAnswer) {
      const answerStatus: Record<string, string> = { 'idő lejárt': 'time expired', kilépett: 'left', eltalálta: 'correct', 'nem találta el': 'incorrect' };
      return `${playerAnswer[1]}: ${answerStatus[playerAnswer[2]]}`;
    }
    const answersWaiting = text.match(/^(\d+) játékos még válaszol$/);
    if (answersWaiting) return `${answersWaiting[1]} players still answering`;
    const timer = text.match(/^Kérdésenként (\d+) mp$/);
    if (timer) return `Per question: ${timer[1]} sec`;
    const exact = t(text);
    if (exact !== text) return exact;
    return exact;
  };
  void format;
  return <>{translateNode(children, translate)}</>;
}

export function translatedText(language: Language, text: string): string {
  return language === 'en' ? english[text] ?? text : text;
}
