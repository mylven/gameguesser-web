import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, LoaderCircle, Radio, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';
import { listStreamerDirectory, type StreamerDirectoryEntry } from './firebase-store';
import { AutoTranslate, useI18n } from './i18n';

type Props = { onExit: () => void };

function safeChannelUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function StreamerDirectory({ onExit }: Props) {
  const { language } = useI18n();
  const [streamers, setStreamers] = useState<StreamerDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      setStreamers(await listStreamerDirectory());
    } catch {
      setError('Nem sikerült betölteni a streamerlistát. Próbáld meg később újra.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(false), 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return <AutoTranslate><section className="streamer-directory-page">
    <div className="streamer-directory-topbar">
      <button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Vissza a játékhoz</button>
      <span className="streamer-directory-secure"><ShieldCheck size={14} /> JÓVÁHAGYOTT ALKOTÓK</span>
    </div>
    <header className="streamer-directory-hero">
      <span className="streamer-directory-icon"><UsersRound size={24} /></span>
      <span className="section-kicker">GAMEGUESSER KÖZÖSSÉG</span>
      <h1>{language === 'en' ? <>Approved <span>streamers</span></> : <>Jóváhagyott <span>streamerek</span></>}</h1>
      <p>Ismerd meg a GameGuesser közösség jóváhagyott streamereit, és nézd meg a csatornáikat.</p>
    </header>
    <section className="streamer-directory-card" aria-label={language === 'en' ? 'Approved streamer directory' : 'Jóváhagyott streamerek listája'}>
      <div className="streamer-directory-heading">
        <div><span className="section-kicker">KÖZÖSSÉGI CSATORNÁK</span><h2><Radio size={19} /> Streamerek <small>{loading ? '—' : streamers.length}</small></h2></div>
        <button className="streamer-directory-refresh" onClick={() => void refresh()} disabled={loading} aria-label={language === 'en' ? 'Refresh streamer list' : 'Streamerlista frissítése'}><RefreshCw size={15} className={loading ? 'streamer-directory-spinning' : ''} /> Frissítés</button>
      </div>
      {error && <div className="streamer-directory-error" role="alert">{error}</div>}
      {loading ? <div className="streamer-directory-state"><LoaderCircle size={22} className="streamer-directory-spinning" /> Streamerek betöltése…</div> : streamers.length === 0 ? <div className="streamer-directory-empty"><Radio size={27} /><strong>Még nincs jóváhagyott streamer</strong><span>Az adminok által jóváhagyott, nyilvános megjelenéshez hozzájáruló csatornák itt jelennek meg.</span></div> : <div className="streamer-directory-grid">
        {streamers.map((streamer) => {
          const channelUrl = safeChannelUrl(streamer.channelUrl);
          return <article className="streamer-directory-entry" key={streamer.id}>
            <span className="streamer-directory-entry-icon"><Radio size={20} /></span>
            <div className="streamer-directory-entry-copy"><span className="streamer-directory-platform">{streamer.platform}</span><h3>{streamer.displayName}</h3></div>
            {channelUrl ? <a className="streamer-directory-link" href={channelUrl} target="_blank" rel="noopener noreferrer">Csatorna megnyitása <ExternalLink size={15} /></a> : <span className="streamer-directory-invalid-link">A csatornalink nem érhető el</span>}
          </article>;
        })}
      </div>}
      <p className="streamer-directory-note">Csak az admin által jóváhagyott és a nyilvános listához hozzájáruló streamerek szerepelnek itt.</p>
    </section>
  </section></AutoTranslate>;
}

export default StreamerDirectory;
