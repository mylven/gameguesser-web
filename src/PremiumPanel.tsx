import { ArrowLeft, ArrowRight, BadgeCheck, Check, Crown, ExternalLink, LoaderCircle, LockKeyhole, Sparkles, X } from 'lucide-react';
import { AutoTranslate } from './i18n';

type Props = {
  isSignedIn: boolean;
  isPremium: boolean;
  requestPending: boolean;
  requestBusy: boolean;
  requestMessage: string;
  onRequestReview: () => void;
  onSignIn: () => void;
  onExit: () => void;
};

const buyMeACoffeeMembershipUrl = 'https://buymeacoffee.com/mylven/membership';
const perks = [
  'Haladó statisztikák és összesített teljesítmény',
  'Egyedi, Premium színű játéktéma',
  '20 kérdéses Maraton játékmód',
  '20 kérdéses párbaj- és csoportszobák',
];

function PremiumPanel({ isSignedIn, isPremium, requestPending, requestBusy, requestMessage, onRequestReview, onSignIn, onExit }: Props) {
  return (
    <AutoTranslate>
    <section className="premium-page">
      <div className="premium-topbar">
        <button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Vissza a játékhoz</button>
        <span className="premium-secure"><LockKeyhole size={14} /> GAMEGUESSER PREMIUM</span>
      </div>
      <header className="premium-hero-card">
        <div className="premium-orbit" aria-hidden="true" />
        <span className="premium-hero-icon"><Crown size={26} /></span>
        <span className="section-kicker">TÁMOGASD A GAMEGUESSERT</span>
        <h1>Játssz <span>többet.</span><br />Láss többet.</h1>
        <p>Oldj fel extra kihívásokat, részletes statisztikákat és egy különleges témát.</p>
        <div className="premium-price"><strong>1 500 Ft</strong><span>/ hó</span></div>
        {isPremium ? <div className="premium-active-badge"><BadgeCheck size={17} /> Aktív Premium-tagság</div> : <a className="premium-buy-button" href={buyMeACoffeeMembershipUrl} target="_blank" rel="noreferrer">Előfizetek Buy Me a Coffee-n <ExternalLink size={16} /></a>}
        <small className="premium-payment-note">A fizetés a Buy Me a Coffee biztonságos oldalán történik.</small>
      </header>
      <section className="premium-benefits-card">
        <div className="premium-benefits-heading"><span className="section-kicker">MIT KAPSZ?</span><h2>Premium előnyök</h2></div>
        <div className="premium-benefit-list">{perks.map((perk) => <div className="premium-benefit" key={perk}><span><Check size={15} /></span>{perk}</div>)}</div>
      </section>
      {!isPremium && <section className="premium-activation-card">
        <div className="premium-activation-icon"><Sparkles size={19} /></div>
        <div className="premium-activation-copy"><strong>Fizetés után aktiváld a hozzáférést</strong><p>A fizetés után kérj aktiválást. Az admin ellenőrzi a Buy Me a Coffee-tagságot, majd jóváhagyja a fiókodat. Az automatikus fizetés-ellenőrzés még nincs bekapcsolva.</p></div>
        {!isSignedIn ? <button className="premium-request-button" onClick={onSignIn}>Előbb bejelentkezem <ArrowRight size={15} /></button> : <button className="premium-request-button" onClick={onRequestReview} disabled={requestPending || requestBusy}>{requestBusy ? <LoaderCircle size={15} className="premium-spin" /> : requestPending ? <Check size={15} /> : <Sparkles size={15} />}{requestPending ? 'Ellenőrzésre vár' : 'Aktiválást kérek'}</button>}
        {requestMessage && <div className={`premium-request-message ${requestPending ? 'success' : 'error'}`} role="status">{requestPending ? <Check size={14} /> : <X size={14} />}{requestMessage}</div>}
      </section>}
      {isPremium && <div className="premium-thanks"><Crown size={17} /> Köszönjük, hogy támogatod a GameGuessert!</div>}
      <footer className="premium-footer">Az előfizetés és lemondás a Buy Me a Coffee fiókodban kezelhető. A tagság ellenőrzése itt egyelőre kézi jóváhagyással történik.</footer>
    </section>
    </AutoTranslate>
  );
}

export default PremiumPanel;
