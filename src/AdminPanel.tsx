import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clock3, Cloud, Crown, Eye, Gamepad2, LoaderCircle, RefreshCw, Search, Shield, ShieldOff, Swords, Trash2, UsersRound, X } from 'lucide-react';
import { deletePlayerProfile, listAdminProfiles, listLiveGames, setAdminAccess, type AdminProfile, type LiveGame } from './firebase-store';

type Props = { currentUid: string; onExit: () => void };

function AdminPanel({ currentUid, onExit }: Props) {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [adminUids, setAdminUids] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listAdminProfiles();
      setProfiles(result);
      setAdminUids(result.filter((profile) => profile.isAdmin).map((profile) => profile.uid));
    } catch {
      setError('Nem sikerült betölteni a felhasználókat. Ellenőrizd az admin Firestore-szabályokat.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLiveGames = useCallback(async (showLoading = true) => {
    if (showLoading) setLiveLoading(true);
    setLiveError('');
    try {
      setLiveGames(await listLiveGames());
    } catch {
      setLiveError('Nem sikerült lekérni az élő játékokat. Ellenőrizd a liveGames Firestore-szabályt.');
    } finally {
      if (showLoading) setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void refreshLiveGames();
    const timer = window.setInterval(() => void refreshLiveGames(false), 5_000);
    return () => window.clearInterval(timer);
  }, [refresh, refreshLiveGames]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter((profile) => `${profile.displayName ?? ''} ${profile.email ?? ''} ${profile.uid}`.toLowerCase().includes(term));
  }, [profiles, search]);

  const totals = useMemo(() => profiles.reduce((result, profile) => ({
    games: result.games + (Number(profile.stats?.gamesPlayed) || 0),
    correct: result.correct + (Number(profile.stats?.correct) || 0),
    score: result.score + (Number(profile.stats?.totalScore) || 0),
    inProgress: result.inProgress + (profile.progress ? 1 : 0),
  }), { games: 0, correct: 0, score: 0, inProgress: 0 }), [profiles]);

  const activeGames = useMemo(() => liveGames.filter((game) => game.updatedAt && Date.now() - game.updatedAt.getTime() < 90_000), [liveGames]);

  async function toggleAdmin(profile: AdminProfile) {
    if (profile.uid === currentUid) {
      setError('A saját admin jogosultságodat innen nem módosíthatod.');
      return;
    }
    setBusyUid(profile.uid);
    setError('');
    setNotice('');
    const makeAdmin = !adminUids.includes(profile.uid);
    try {
      await setAdminAccess(profile.uid, profile.email, makeAdmin);
      setAdminUids((current) => makeAdmin ? [...current, profile.uid] : current.filter((uid) => uid !== profile.uid));
      setNotice(makeAdmin ? `Admin jogosultságot adtál: ${profile.email || profile.uid}` : `Visszavontad az admin jogosultságot: ${profile.email || profile.uid}`);
    } catch {
      setError('Nem sikerült módosítani a jogosultságot. Csak admin adhat vagy vehet el admin hozzáférést.');
    } finally {
      setBusyUid('');
    }
  }

  async function removeProfile(profile: AdminProfile) {
    if (profile.uid === currentUid) {
      setError('A saját profilodat innen nem törölheted.');
      return;
    }
    if (!window.confirm(`Törlöd ${profile.email || profile.uid} játékadatait és mentett kvízét? A Firebase Auth fiókja ettől még megmarad.`)) return;
    setBusyUid(profile.uid);
    setError('');
    setNotice('');
    try {
      await deletePlayerProfile(profile.uid);
      setProfiles((current) => current.filter((item) => item.uid !== profile.uid));
      setAdminUids((current) => current.filter((uid) => uid !== profile.uid));
      setNotice('A játékosprofil és játékmentés törölve. A bejelentkezési fiók továbbra is létezik.');
    } catch {
      setError('Nem sikerült törölni a játékosprofilt.');
    } finally {
      setBusyUid('');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-topbar">
        <button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Vissza a játékhoz</button>
        <span className="admin-secure"><Shield size={14} /> ADMINISTRÁTORI FELÜLET</span>
      </div>
      <header className="admin-heading">
        <span className="section-kicker">JÁTÉKKEZELÉS</span>
        <h1>Admin <span>dashboard</span></h1>
        <p>Itt kezelheted a regisztrált játékosprofilokat, a hozzáféréseket és a mentett játékadatokat.</p>
      </header>
      <div className="admin-stat-grid">
        <article><span><UsersRound size={18} /></span><strong>{profiles.length}</strong><small>Játékosprofil</small></article>
        <article><span><Crown size={18} /></span><strong>{adminUids.length || '—'}</strong><small>Adminisztrátor</small></article>
        <article><span><Check size={18} /></span><strong>{totals.games}</strong><small>Lejátszott kör</small></article>
        <article><span><Cloud size={18} /></span><strong>{totals.inProgress}</strong><small>Félbehagyott mentés</small></article>
      </div>
      <section className="admin-live-card">
        <div className="admin-users-head">
          <div><span className="section-kicker">VALÓS IDEJŰ FIGYELŐ</span><h2><i className="admin-live-dot" /> Aktuális játékok <small>{activeGames.length}</small></h2><p>A megoldásokat csak az adminfelület mutatja. Az adatok legfeljebb 5 másodpercenként frissülnek.</p></div>
          <button className="admin-refresh" onClick={() => void refreshLiveGames()} disabled={liveLoading}><RefreshCw size={15} className={liveLoading ? 'admin-spinning' : ''} /> Frissítés</button>
        </div>
        {liveError && <div className="admin-feedback admin-error" role="alert"><X size={15} />{liveError}</div>}
        {liveLoading ? <div className="admin-loading"><LoaderCircle size={20} /> Élő játékok betöltése…</div> : activeGames.length === 0 ? <div className="admin-empty">Jelenleg nem látszik aktív, bejelentkezett játékos által indított meccs.</div> : <div className="admin-live-grid">
          {activeGames.map((game) => <article className="admin-live-game" key={game.id}>
            <div className="admin-live-game-head"><span className={`admin-live-kind ${game.kind}`}><i />{game.kind === 'multiplayer' ? <><Swords size={13} /> {game.roomType === 'group' ? 'Csoportszoba' : 'Párbaj'}</> : <><Gamepad2 size={13} /> Egyéni játék</>}</span><span className="admin-live-time"><Clock3 size={12} /> {game.updatedAt?.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
            <div className="admin-live-main"><div><small>JÁTÉKOS / HÁZIGAZDA</small><strong>{game.playerName}</strong></div><div><small>JÁTÉKMÓD · KÖR</small><strong>{game.mode} · {game.roundIndex + 1}/{game.totalRounds}</strong></div></div>
            <div className="admin-live-solution"><span><Eye size={14} /> AKTUÁLIS MEGOLDÁS</span><strong>{game.solution || '—'}</strong></div>
            {game.kind === 'multiplayer' && <div className="admin-live-details"><span>{game.roomCode ? `Szobakód: ${game.roomCode}` : 'Szoba'}</span><span>{game.players?.join(' · ') || 'Játékosok betöltése…'}</span>{game.scores && Object.keys(game.scores).length > 0 && <span className="admin-live-scores">{Object.entries(game.scores).map(([name, score]) => `${name}: ${score} pont`).join(' · ')}</span>}</div>}
          </article>)}
        </div>}
        <div className="admin-live-note">A megfigyelés jelenleg a bejelentkezett játékosok egyéni kvízeit és a bejelentkezett házigazda által indított szobajátékokat követi.</div>
      </section>
      <section className="admin-users-card">
        <div className="admin-users-head">
          <div><span className="section-kicker">FELHASZNÁLÓK</span><h2>Játékosprofilok</h2><p>Az Auth-fiókokat nem törli innen a rendszer; csak a profil és a mentett játékadat kezelhető.</p></div>
          <button className="admin-refresh" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} className={loading ? 'admin-spinning' : ''} /> Frissítés</button>
        </div>
        <label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Keresés név, e-mail vagy UID szerint" /></label>
        {error && <div className="admin-feedback admin-error" role="alert"><X size={15} />{error}</div>}
        {notice && <div className="admin-feedback admin-success"><Check size={15} />{notice}</div>}
        {loading ? <div className="admin-loading"><LoaderCircle size={20} /> Profilok betöltése…</div> : filteredProfiles.length === 0 ? <div className="admin-empty">{profiles.length === 0 ? 'Még nincsenek játékosprofilok. Az első bejelentkezés és mentés után jelennek meg.' : 'Nincs a keresésnek megfelelő profil.'}</div> : <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Játékos</th><th>Statisztika</th><th>Félbehagyott kvíz</th><th>Jogosultság</th><th>Műveletek</th></tr></thead>
          <tbody>{filteredProfiles.map((profile) => {
            const isAdmin = adminUids.includes(profile.uid);
            const busy = busyUid === profile.uid;
            return <tr key={profile.uid}>
              <td><div className="admin-user-cell"><span className="admin-user-avatar">{(profile.displayName || profile.email || 'G').slice(0, 1).toUpperCase()}</span><span><strong>{profile.displayName || 'Játékos'}</strong><small>{profile.email || 'E-mail nincs a profilban'}</small><small className="admin-uid">UID: {profile.uid}</small></span></div></td>
              <td><strong>{profile.stats?.gamesPlayed ?? 0} kör</strong><small>{profile.stats?.correct ?? 0} helyes · {profile.stats?.bestScore ?? 0} rekordpont</small></td>
              <td>{profile.progress ? `${profile.progress.roundIndex + 1}. kérdés / ${profile.progress.rounds.length}` : 'Nincs'}</td>
              <td><span className={`admin-role ${isAdmin ? 'is-admin' : ''}`}>{isAdmin ? 'Admin' : 'Játékos'}</span></td>
              <td><div className="admin-actions"><button onClick={() => void toggleAdmin(profile)} disabled={busy || profile.uid === currentUid} title={profile.uid === currentUid ? 'Saját szerepkör nem módosítható' : isAdmin ? 'Admin jog visszavonása' : 'Admin jog megadása'}>{busy ? <LoaderCircle size={15} className="admin-spinning" /> : isAdmin ? <ShieldOff size={15} /> : <Shield size={15} />}<span>{isAdmin ? 'Jog visszavonása' : 'Adminná tesz'}</span></button><button className="delete-profile-action" onClick={() => void removeProfile(profile)} disabled={busy || profile.uid === currentUid} title="Mentett játékprofil törlése"><Trash2 size={15} /><span>Profil törlése</span></button></div></td>
            </tr>;
          })}</tbody>
        </table></div>}
        {!loading && <div className="admin-footnote">Összesen {totals.correct} helyes válasz · {totals.score} összpont a játékosprofilokban</div>}
      </section>
      <div className="admin-notice-box"><Shield size={16} /><span>Az admin ellenőrzés Firebase Auth UID-hoz kötött Firestore-jogosultságon alapul. Az admin hozzáférést a Firestore <strong>admins/{'{uid}'}</strong> dokumentumában lehet visszavonni.</span></div>
    </section>
  );
}

export default AdminPanel;
