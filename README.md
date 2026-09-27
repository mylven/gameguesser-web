# GameGuesser

Magyar nyelvű, böngészőben játszható videojáték-kvíz. Négy játékmódban találhatod ki a játékokat: emojikból, fokozatosan feloldott nyomokból, műfaji és játékmeneti jellemzőkből, vagy elmosódott képekből. A képfelismerő módban minden rossz tipp élesíti a képet és új segítséget fed fel; a helyes válasz után a teljes kép élesen látszik. Vendégként az adatok a böngészőben mentődnek; fiókkal a pontszámok és félbehagyott körök a felhőbe szinkronizálódnak.

A kvíz a beépített, részletesen szerkesztett címek mellett akár 6000 Steam-játékból álló SteamSpy-katalógust is használ. A GitHub Actions 30 percenként ellenőrzi az új Steam-játékokat, és változás esetén automatikusan frissíti a katalógust, majd újratelepíti a weboldalt. A már megnyitott oldal is 30 percenként lekéri az új listát; az új címek a következő kérdéssorokba kerülnek be. Minden új címhez automatikusan létrejönnek a fejlesztőre és a játékcím betű-/szószámára épülő feladatok. A lista frissítéséhez kézzel az `npm run catalog:refresh` parancs is futtatható.

A házigazda két szobatípus közül választhat: **Párbaj** (legfeljebb 2 játékos) vagy **Csoportszoba** (korlátlan számú csatlakozó). Mindkettőben az emoji-, nyom-, jellemző- és képfelismerő mód közül lehet választani, valamint kérdésenkénti 15, 30 vagy 45 másodperces időlimit állítható be. Időre játszva a gyorsabb helyes válasz több pontot ér; képfelismerő módban a kép a visszaszámlálás során kiélesedik. A szobakódot megosztva a játékosok csatlakoznak; a 10 kérdéses meccs válaszai és pontjai PeerJS/WebRTC kapcsolaton szinkronizálódnak, az eredmény a teljes társaság rangsorát mutatja. A játékhoz internetkapcsolat szükséges.

## Fiók és mentés más eszközre

A regisztráció és az e-mailes bejelentkezés **Firebase Authentication**-t, a felhőmentés **Cloud Firestore**-t használ. A GameGuesser Firebase-projekt azonosítója `gameguesser-web`; a webalkalmazás, az e-mail/jelszó belépés és az európai régióban futó alapértelmezett Firestore-adatbázis már létre lett hozva, a biztonságos Firestore-szabályok telepítve vannak, és a `mylven.github.io` domain engedélyezve van az Authban. Firebase-projekt létrehozása nélkül az alkalmazás továbbra is működik, csak a vendégstatisztikákat menti helyben.

1. A Firebase webkonfiguráció helyben a `.env.local` fájlban van. Ha új gépre klónozod a projektet, másold át a [.env.example](.env.example) fájlt `.env.local` néven, és töltsd ki a saját Firebase Console webalkalmazásának értékeivel. Ezt a fájlt ne töltsd fel GitHubra.
2. GitHub Pageshez a repository **Settings → Secrets and variables → Actions** részén add meg ezeket a repository secret-eket: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Ezek már be vannak állítva a GameGuesser repositoryban.
3. Az oldal domainje szerepel a Firebase Authentication engedélyezett domainjei között. Új saját domain esetén add hozzá az **Authentication → Settings → Authorized domains** listához.

Ha új Firebase-projektet állítasz be, kapcsold be az **Authentication → Sign-in method → Email/Password** szolgáltatót, hozz létre Cloud Firestore-adatbázist, majd telepítsd a repository [firestore.rules](firestore.rules) szabályait. Minden felhasználó kizárólag a saját, UID-hoz kötött profiljához férhet hozzá.

A felhőmentés tartalmazza a személyes pontszámokat és az elkezdett egyjátékos kört is. Első bejelentkezéskor ezen a böngészőn a korábbi vendégmentést átemeli az új profilba; ezután másik eszközön bejelentkezve a mentett kvíz a **Folytatás** gombbal megnyitható. Az e-mail-címhez tartozó fiók azonosítóját a Firebase Auth kezeli; a jelszavakat a játék nem tárolja.

A Firebase Web API-kulcs a böngészőben szükségszerűen látható; az adatok védelmét a fiókhoz kötött Firestore-szabályok adják. Ne lazítsd a szabályokat nyilvános olvasás/írás engedélyezésével.

## Admin-fiók és játékoskezelés

Az admin felületen áttekinthetők a regisztrált játékosprofilok, pontszámok és félbehagyott kvízek. Az admin más játékosnak adhat vagy vonhat vissza admin szerepkört, valamint törölheti a játékprofilját és mentett játékát. Ez utóbbi **nem** törli a Firebase Authentication-belépési fiókot.

Az első adminisztrátort szándékosan nem lehet nyilvános regisztrációval megszerezni. Biztonságos kezdeti jóváhagyás:

1. Regisztrálj a weboldalon a **Fiók létrehozása** gombbal, majd jelentkezz be.
2. Firebase Console → **Authentication → Users** alatt keresd ki a saját fiókodat, és másold ki a **UID** értékét.
3. Firestore → **Data** alatt hozz létre egy `admins` kollekciót, benne egy olyan dokumentummal, amelynek dokumentumazonosítója pontosan a saját Auth UID. Adj hozzá egy `active` mezőt **boolean** típussal, `true` értékkel.
4. Frissítsd az oldalt. A fiókmenüben megjelenik az **Admin kezelőfelület**.

A Firestore `admins/{uid}` jogosultságot és userenkénti hozzáférést ellenőrző szabályai a [firestore.rules](firestore.rules) fájlban vannak; a Firebase Console-ban már közzé lettek téve. Az admin szerepkör UID-alapú, nem e-mail alapján működik.

## Admin-fiók és játékoskezelés

Az admin felületen megtekinthetők a mentett játékosprofilok, pontszámok és félbehagyott kvízek; más játékosnak admin szerepkör adható vagy vonható vissza, és törölhető a játékprofilja. Ez **nem törli** a Firebase Authentication-belépési fiókot.

Az első adminisztrátort a Firebase-projekt tulajdonosának kell egyszer, kézzel jóváhagynia; ezt szándékosan nem lehet nyilvános regisztrációval megszerezni:

1. Regisztrálj a GameGuesser oldalon a **Fiók létrehozása** gombbal, majd jelentkezz be.
2. A Firebase Console **Authentication → Users** oldalán keresd meg a fiók UID-ját.
3. A Firestore **Data** nézetben hozz létre egy `admins` kollekciót. Dokumentumazonosítóként add meg pontosan a saját Auth UID-ját, majd hozz létre egy `active` nevű, boolean típusú, `true` értékű mezőt. Az `email` mező opcionális.
4. Frissítsd az oldalt, jelentkezz ki-be, majd a profilmenüben megjelenik az **Admin kezelőfelület**.

Az új adminok felvétele később már az admin dashboardról is kezelhető. Az első jogosultság seedeléséhez és az adatbázis-szabályok módosításához Firebase-projekttulajdonosi hozzáférés szükséges.

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
