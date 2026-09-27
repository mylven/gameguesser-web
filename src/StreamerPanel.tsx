import { ArrowLeft, BadgeCheck, ExternalLink, Gamepad2, LoaderCircle, LockKeyhole, Radio, Send, X } from 'lucide-react';
import { useState } from 'react';
import { requestStreamerReview } from './firebase-store';
import { auth } from './firebase';
import { AutoTranslate, useI18n } from './i18n';

type Props = { isSignedIn: boolean; isApproved: boolean; requestPending: boolean; onSignIn: () => void; onExit: () => void; onSubmitted: () => void };
const platforms = ['Twitch', 'Kick', 'YouTube', 'TikTok', 'Trovo', 'Rumble'];

function StreamerPanel({ isSignedIn, isApproved, requestPending, onSignIn, onExit, onSubmitted }: Props) {
  const { language } = useI18n();
  const [platform, setPlatform] = useState('Twitch');
  const [channelUrl, setChannelUrl] = useState('');
  const [message, setMessage] = useState('');
  const [publicListingAccepted, setPublicListingAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!auth?.currentUser) { onSignIn(); return; }
    if (!channelUrl.trim()) { setError(language === 'en' ? 'Add your channel link first.' : 'Először add meg a csatornád linkjét.'); return; }
    if (!publicListingAccepted) { setError(language === 'en' ? 'Please agree to appear in the public streamer directory.' : 'A jelentkezéshez fogadd el a nyilvános streamerlistán való megjelenést.'); return; }
    setBusy(true);
    setError('');
    try {
      await requestStreamerReview(auth.currentUser, { platform, channelUrl: channelUrl.trim(), message: message.trim(), publicListingAccepted });
      onSubmitted();
    } catch {
      setError(language === 'en' ? 'Could not send the application. Check the link and try again.' : 'Nem sikerült elküldeni a jelentkezést. Ellenőrizd a linket, majd próbáld újra.');
    } finally { setBusy(false); }
  }

  return <AutoTranslate><section className="streamer-page">
    <div className="streamer-topbar"><button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Vissza a játékhoz</button><span className="streamer-secure"><LockKeyhole size={14} /> STREAMER PROGRAM</span></div>
    <header className="streamer-hero"><span className="streamer-hero-icon"><Radio size={27} /></span><span className="section-kicker">HÍVD KI A NÉZŐIDET</span><h1>Streamelsz?<br /><span>Játssz velünk.</span></h1><p>Bármelyik platform számít. Indíts szobát, oszd meg a kódot, és engedd, hogy a nézőid élőben csatlakozzanak a játékhoz.</p><div className="streamer-platforms">{platforms.map((item) => <span key={item}>{item}</span>)}</div></header>
    {isApproved ? <section className="streamer-status-card approved"><BadgeCheck size={24} /><div><strong>Streamer hozzáférésed aktív</strong><p>Használd a párbajszobákat a közösségeddel, és oszd meg velük a szobakódot.</p></div></section> : requestPending ? <section className="streamer-status-card pending"><LoaderCircle size={22} /><div><strong>Jelentkezés ellenőrzés alatt</strong><p>Az admin hamarosan átnézi a csatornád adatait.</p></div></section> : <section className="streamer-apply-card"><div className="streamer-benefit"><span><span>∞</span></span><div><strong>Örökös Pro hozzáférés</strong><small>Jóváhagyás után extra streamer-jogokat kapsz.</small></div></div><div className="streamer-benefit"><span><span>⚿</span></span><div><strong>Saját szobád</strong><small>A nézőid egyetlen kóddal csatlakozhatnak.</small></div></div><div className="streamer-form"><label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label><label>Csatorna linkje<input value={channelUrl} onChange={(event) => setChannelUrl(event.target.value)} placeholder="https://twitch.tv/..." /></label><label>Üzenet az adminnak <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={300} placeholder="Írj pár szót a csatornádról..." /></label><label className="streamer-consent"><input type="checkbox" checked={publicListingAccepted} onChange={(event) => setPublicListingAccepted(event.target.checked)} /><span>Hozzájárulok, hogy jóváhagyás esetén a megjelenített nevem, platformom és csatornalinkem nyilvánosan megjelenjen a streamerlistában.</span></label>{error && <p className="streamer-error" role="alert"><X size={14} />{error}</p>} {!isSignedIn ? <button className="primary-button" onClick={onSignIn}><Gamepad2 size={16} /> Jelentkezéshez bejelentkezés kell <ExternalLink size={15} /></button> : <button className="primary-button" onClick={() => void submit()} disabled={busy}>{busy ? <LoaderCircle size={16} className="admin-spinning" /> : <Send size={16} />} Jelentkezés elküldése</button>}</div></section>}
  </section></AutoTranslate>;
}
export default StreamerPanel;
