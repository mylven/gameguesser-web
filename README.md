# GameGuesser

Magyar nyelvű, böngészőben játszható videojáték-kvíz. Négy játékmódban találhatod ki a játékokat: emojikból, fokozatosan feloldott nyomokból, műfaji és játékmeneti jellemzőkből, vagy elmosódott képekből. A képfelismerő módban minden rossz tipp élesíti a képet és új segítséget fed fel; a helyes válasz után a teljes kép élesen látszik. Vendégként az adatok a böngészőben mentődnek; fiókkal a pontszámok és félbehagyott körök a felhőbe szinkronizálódnak.

A házigazda két szobatípus közül választhat: **Párbaj** (legfeljebb 2 játékos) vagy **Csoportszoba** (korlátlan számú csatlakozó). Mindkettőben az emoji-, nyom-, jellemző- és képfelismerő mód közül lehet választani, valamint kérdésenkénti 15, 30 vagy 45 másodperces időlimit állítható be. Időre játszva a gyorsabb helyes válasz több pontot ér; képfelismerő módban a kép a visszaszámlálás során kiélesedik. A szobakódot megosztva a játékosok csatlakoznak; a 10 kérdéses meccs válaszai és pontjai PeerJS/WebRTC kapcsolaton szinkronizálódnak, az eredmény a teljes társaság rangsorát mutatja. A játékhoz internetkapcsolat szükséges.

## Fiók és mentés más eszközre

A regisztráció és az e-mailes bejelentkezés **Firebase Authentication**-t, a felhőmentés **Cloud Firestore**-t használ. Firebase-projekt létrehozása nélkül az alkalmazás továbbra is működik, csak a vendégstatisztikákat menti helyben.

1. Hozz létre egy Firebase-projektet, és adj hozzá egy **Web app** alkalmazást a Firebase Console-ban.
2. A Firebase **Authentication → Sign-in method** részén kapcsold be az **Email/Password** szolgáltatót. Az **Authentication → Settings → Authorized domains** listában legyen engedélyezve az oldalad GitHub Pages-domainje (például `felhasznalonev.github.io`, egyéni domain esetén pedig az a domain).
3. Hozz létre egy Firestore-adatbázist, majd publikáld a repository [firestore.rules](firestore.rules) szabályait. Minden felhasználó kizárólag a saját, UID-hoz kötött profiljához férhet hozzá.
4. Másold a [.env.example](.env.example) fájlt `.env.local` néven, és töltsd ki a Firebase webalkalmazás konfigurációjának értékeivel. Ez a fájl nincs feltöltve GitHubra.
5. Helyben ellenőrizd az alkalmazást; GitHub Pageshez a GitHub repository **Settings → Secrets and variables → Actions** részén hozd létre a következő repository secret-eket: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
6. Töltsd fel a módosításokat a `main` vagy `master` ágra: a Pages-munkafolyamat ezekkel az értékekkel építi és telepíti az oldalt.

A felhőmentés tartalmazza a személyes pontszámokat és az elkezdett egyjátékos kört is. Első bejelentkezéskor ezen a böngészőn a korábbi vendégmentést átemeli az új profilba; ezután másik eszközön bejelentkezve a mentett kvíz a **Folytatás** gombbal megnyitható. Az e-mail-címhez tartozó fiók azonosítóját a Firebase Auth kezeli; a jelszavakat a játék nem tárolja.

A Firebase Web API-kulcs a böngészőben szükségszerűen látható; az adatok védelmét a fiókhoz kötött Firestore-szabályok adják. Ne lazítsd a szabályokat nyilvános olvasás/írás engedélyezésével.

A játék képei a Steam képkiszolgálójáról töltődnek be, ezért a képes módhoz is internetkapcsolat szükséges.

## Indítás helyben

1. Telepítsd a Node.js 20 vagy újabb verzióját.
2. A projekt mappájában futtasd: `npm install`
3. Indítsd el: `npm run dev`
4. A Vite által kiírt címet nyisd meg a böngészőben.

Éles build ellenőrzése: `npm run build`. A kész, statikus weboldal a `dist` mappába kerül, szerveroldali szolgáltatásra nincs szükség.

## Közzététel GitHub Pagesen

1. Töltsd fel a projektet egy GitHub repository `main` vagy `master` ágára.
2. A repository **Settings → Pages → Build and deployment** részén válaszd a **GitHub Actions** forrást.
3. A `.github/workflows/deploy.yml` munkafolyamata automatikusan buildeli és közzéteszi az oldalt minden push után. Az első telepítés után az oldal URL-je ugyanott jelenik meg.

A Vite automatikusan beállítja a repository-alapú útvonalat GitHub Actions alatt, így a projekt GitHub Pages aloldalaként is működik.
