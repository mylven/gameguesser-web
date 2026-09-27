import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Gamepad2, LoaderCircle, Medal, RefreshCw, Shield, Swords, Trophy } from 'lucide-react';
import { listDuelLeaderboard, listLeaderboard, type DuelLeaderboardEntry, type LeaderboardEntry } from './firebase-store';
import { AutoTranslate, useI18n } from './i18n';

type Props = { currentUid: string | null; onExit: () => void };

function Leaderboard({ currentUid, onExit }: Props) {
  const { language } = useI18n();
  const numberFormat = useMemo(() => new Intl.NumberFormat(language === 'en' ? 'en-US' : 'hu-HU'), [language]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [duelEntries, setDuelEntries] = useState<DuelLeaderboardEntry[]>([]);
  const [view, setView] = useState<'solo' | 'duel'>('solo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const refresh = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const [solo, duel] = await Promise.all([listLeaderboard(), listDuelLeaderboard()]);
      setEntries(solo);
      setDuelEntries(duel);
      setUpdatedAt(new Date());
    } catch {
      setError('Nem sikerült betölteni a ranglistát. Próbáld meg később újra.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(false), 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const podium = useMemo(() => entries.slice(0, 3), [entries]);
  const remaining = useMemo(() => entries.slice(3), [entries]);
  const displayedEntries = view === 'solo' ? entries : duelEntries;
  const duelPodium = useMemo(() => duelEntries.slice(0, 3), [duelEntries]);
  const duelRemaining = useMemo(() => duelEntries.slice(3), [duelEntries]);

  return (
    <AutoTranslate>
    <section className="leaderboard-page">
      <div className="leaderboard-topbar">
        <button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Vissza a játékhoz</button>
        <span className="leaderboard-secure"><Shield size={14} /> KÖZÖSSÉGI RANGLISTA</span>
      </div>
      <header className="leaderboard-heading">
        <span className="section-kicker">A PONTOK DÖNTENEK</span>
        <h1>{view === 'duel' ? <>Párbaj <span>ranglista</span></> : <>Játékos <span>ranglista</span></>}</h1>
        <p>{view === 'duel' ? 'A legtöbb párbajgyőzelem kerül a lista élére.' : 'A legtöbb összesített ponttal rendelkező játékos áll az első helyen.'}</p>
      </header>
      <div className="leaderboard-tabs" role="tablist" aria-label="Ranglisták">
        <button role="tab" aria-selected={view === 'solo'} className={view === 'solo' ? 'selected' : ''} onClick={() => setView('solo')}><Gamepad2 size={15} /> Egyéni kvíz</button>
        <button role="tab" aria-selected={view === 'duel'} className={view === 'duel' ? 'selected' : ''} onClick={() => setView('duel')}><Swords size={15} /> Párbajok</button>
      </div>
      <section className="leaderboard-card" aria-label={language === 'en' ? 'Player leaderboard' : 'Játékos ranglista'}>
        <div className="leaderboard-card-head">
          <div><span className="section-kicker">TOP JÁTÉKOSOK</span><h2><Trophy size={19} /> {view === 'duel' ? 'Párbajgyőzelmek' : 'Összesített pontszám'}</h2></div>
          <button className="leaderboard-refresh" onClick={() => void refresh()} disabled={loading} aria-label="Ranglista frissítése"><RefreshCw size={15} className={loading ? 'leaderboard-spinning' : ''} /> Frissítés</button>
        </div>
        {updatedAt && <div className="leaderboard-updated">{language === 'en' ? `Updated: ${updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every 30 seconds` : `Frissítve: ${updatedAt.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })} · automatikus frissítés 30 másodpercenként`}</div>}
        {error && <div className="leaderboard-error" role="alert">{error}</div>}
        {loading ? <div className="leaderboard-loading"><LoaderCircle size={22} className="leaderboard-spinning" /> Ranglista betöltése…</div> : displayedEntries.length === 0 ? <div className="leaderboard-empty"><Trophy size={27} /><strong>{view === 'duel' ? 'Még nincs befejezett párbaj' : 'Még üres a ranglista'}</strong><span>{view === 'duel' ? 'Játssz egy bejelentkezett játékossal párbajt, és megjelenik itt az eredményed.' : 'Játssz egy kvízt bejelentkezett fiókkal, és itt megjelenik az összesített pontszámod.'}</span></div> : <>
          <div className="leaderboard-podium">
            {(view === 'duel' ? duelPodium : podium).map((entry, index) => {
              const rank = index + 1;
              return <article className={`leaderboard-podium-card rank-${rank} ${entry.id === currentUid ? 'is-current-player' : ''}`} key={entry.id}>
                <span className="leaderboard-rank-icon">{rank === 1 ? <Crown size={20} /> : <Medal size={19} />}</span>
                <span className="leaderboard-rank-number">#{rank}</span>
                <strong>{entry.displayName}{entry.id === currentUid && <small>TE</small>}</strong>
                <span className="leaderboard-points">{numberFormat.format(view === 'duel' ? (entry as DuelLeaderboardEntry).wins : entry.totalScore)} <small>{view === 'duel' ? 'győzelem' : 'pont'}</small></span>
                <span className="leaderboard-games"><Gamepad2 size={13} /> {view === 'duel' ? `${numberFormat.format((entry as DuelLeaderboardEntry).matches)} párbaj` : `${numberFormat.format((entry as LeaderboardEntry).gamesPlayed)} ${language === 'en' ? ((entry as LeaderboardEntry).gamesPlayed === 1 ? 'completed quiz' : 'completed quizzes') : 'befejezett kvíz'}`}</span>
              </article>;
            })}
          </div>
          {(view === 'duel' ? duelRemaining.length > 0 : remaining.length > 0) && <div className="leaderboard-table-wrap"><table className="leaderboard-table">
            <thead><tr><th>Hely</th><th>Játékos</th><th>{view === 'duel' ? 'Párbajok' : 'Lejátszott kvíz'}</th><th>{view === 'duel' ? 'Győzelmek' : 'Összpontszám'}</th></tr></thead>
            <tbody>{(view === 'duel' ? duelRemaining : remaining).map((entry, index) => <tr className={entry.id === currentUid ? 'is-current-player' : ''} key={entry.id}>
              <td><span className="leaderboard-place">{index + 4}.</span></td>
              <td><strong>{entry.displayName}</strong>{entry.id === currentUid && <small className="leaderboard-you">TE</small>}</td>
              <td>{numberFormat.format(view === 'duel' ? (entry as DuelLeaderboardEntry).matches : (entry as LeaderboardEntry).gamesPlayed)}</td>
              <td><strong className="leaderboard-row-score">{numberFormat.format(view === 'duel' ? (entry as DuelLeaderboardEntry).wins : entry.totalScore)}</strong> {view === 'duel' ? 'győzelem' : 'pont'}</td>
            </tr>)}</tbody>
          </table></div>}
        </>}
        <footer className="leaderboard-footnote">A ranglistán a regisztrált fiókok összesített pontszáma szerepel. A játék anonim vendégpontszámai nem kerülnek fel.</footer>
      </section>
    </section>
    </AutoTranslate>
  );
}

export default Leaderboard;
